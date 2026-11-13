# Reusable DokumenListCard and Document Download/Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform `PerencanaanDokumenCard` into a reusable `DokumenListCard` organism supporting multiple documents via an accordion list, embedded `<iframe>` preview for `surat_permohonan`, and fix the document download/view issue across backend and frontend.

**Architecture:** 
- Backend: Update `PermohonanService::ambilDokumen` and `PerencanaanController::downloadDokumen` to support an optional `?dokumen_id=` query parameter, and ensure `PerencanaanService::detailPengajuan` provides `download_url` for every item in `dokumen_permohonan`.
- Frontend Services: Fix URL normalization in `perencanaanService.ts` and `api.ts` to prevent duplicate `/api` prefix when fetching document blobs.
- Frontend Organism: Create `frontend/src/components/organisms/DokumenListCard.tsx` following Atomic Design and Design System rules (accordion cards for each file, `<iframe>` live preview specifically for `surat_permohonan`, presentational only with explicit props).
- Frontend Page/Template: Update `PerencanaanPengajuanShowTemplate.tsx` and `Show.tsx` to pass the multi-document list, handle download and view-in-new-tab actions cleanly.

**Tech Stack:** Laravel 13, PHP 8.5, React 19, TypeScript, Tailwind CSS v4, Lucide React, Axios.

**Spec:**
- `docs/DEVELOPMENT_RULES.md`
- `docs/DATABASE_SIPBAJA.md`
- `docs/design.md`

## Global Constraints

- Tech stack is strictly fixed: Laravel 13, React 19, Tailwind v4, Axios. No new packages.
- Follow Atomic Design: `DokumenListCard` is an organism and must be purely presentational (no direct Axios/fetch, props-driven, UI local open/closed state only).
- All business logic lives in Service classes. Controllers only validate and delegate.
- Visual styling must adhere to `docs/design.md`: brand color `#0E7C5A`, surface `#FFFFFF`, canvas `#F3F6F5`, green-tinted shadows `rgba(13,51,38,a)`, Lucide icons, Indonesian UI copy.

## Review Focus

1. Duplicate `/api/` prefix in Axios: Ensure `fetchDokumenBlob` strips or handles leading `/api` so endpoints resolve to `/api/v1/...` instead of `/api/api/v1/...`.
2. Iframe preview credentials: Confirm `<iframe>` uses inline disposition with cookie auth or a valid Object URL without leaking memory.
3. Multiple documents without crash: Component must gracefully handle empty lists, documents with missing byte size, or null `download_url`.
4. Fallback when document is not `surat_permohonan`: Non-permohonan documents in accordion expand to show metadata and download button, without broken `<iframe>`.
5. Backward compatibility across imports: All existing references to `PerencanaanDokumenCard` are updated cleanly across the codebase.

---

### Task 1: Backend Support for Specific Document Download & Multi-Document Detail

**Files:**
- Modify: `backend/app/Services/PermohonanService.php:211-226`
- Modify: `backend/app/Http/Controllers/Perencanaan/PerencanaanController.php:72-83`
- Modify: `backend/app/Services/PerencanaanService.php:102-123`
- Test: `backend/tests/Feature/Perencanaan/PerencanaanDokumenTest.php`

**Interfaces:**
- `PermohonanService::ambilDokumen(User $user, Permohonan $permohonan, ?int $dokumenId = null): array`
- Produces: `['path' => string, 'nama_asli' => string, 'mime_type' => string]`
- `PerencanaanController::downloadDokumen(Request $request, Permohonan $permohonan): StreamedResponse` accepts `?dokumen_id=` query parameter.
- `PerencanaanService::detailPengajuan` returns `dokumen_permohonan` array with each item mapped with `id`, `nama_asli`, `tipe_dokumen`, `ukuran_bytes`, `mime_type`, and `download_url`.

- [ ] **Step 1: Write feature test for document download with `?dokumen_id=` and multi-document payload**

Create `backend/tests/Feature/Perencanaan/PerencanaanDokumenTest.php`:
```php
<?php

namespace Tests\Feature\Perencanaan;

use App\Models\Dokumen;
use App\Models\Permohonan;
use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PerencanaanDokumenTest extends TestCase
{
    use RefreshDatabase;

    public function test_perencanaan_can_download_specific_document_by_id(): void
    {
        Storage::fake('local');
        $role = Role::create(['nama' => 'Perencanaan']);
        $user = User::factory()->create(['role_id' => $role->id]);
        $unit = Unit::create(['nama' => 'Teknik Informatika']);

        $permohonan = Permohonan::create([
            'unit_id' => $unit->id,
            'created_by' => $user->id,
            'nomor_surat' => '001/TI/2026',
            'judul' => 'Pengadaan Server',
            'ringkasan_tujuan' => 'Server lab',
            'estimasi_anggaran' => 100000000,
            'status' => 'diajukan',
        ]);

        $file1 = UploadedFile::fake()->create('surat_permohonan.pdf', 100, 'application/pdf');
        $path1 = $file1->store('dokumen/permohonan', 'local');
        $doc1 = Dokumen::create([
            'ref_type' => 'permohonan',
            'ref_id' => $permohonan->id,
            'tipe_dokumen' => 'surat_permohonan',
            'versi' => 1,
            'nama_asli' => 'surat_permohonan.pdf',
            'nama_hash' => basename($path1),
            'mime_type' => 'application/pdf',
            'ukuran_bytes' => 102400,
            'uploaded_by' => $user->id,
        ]);

        $file2 = UploadedFile::fake()->create('lampiran_spek.pdf', 50, 'application/pdf');
        $path2 = $file2->store('dokumen/permohonan', 'local');
        $doc2 = Dokumen::create([
            'ref_type' => 'permohonan',
            'ref_id' => $permohonan->id,
            'tipe_dokumen' => 'lampiran',
            'versi' => 1,
            'nama_asli' => 'lampiran_spek.pdf',
            'nama_hash' => basename($path2),
            'mime_type' => 'application/pdf',
            'ukuran_bytes' => 51200,
            'uploaded_by' => $user->id,
        ]);

        $response = $this->actingAs($user)->getJson("/api/v1/perencanaan/pengajuan/{$permohonan->id}/dokumen?dokumen_id={$doc2->id}");
        $response->assertOk();
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --filter=PerencanaanDokumenTest`
Expected: FAIL

- [ ] **Step 3: Update `PermohonanService`, `PerencanaanController`, and `PerencanaanService`**

In `backend/app/Services/PermohonanService.php`:
Update `ambilDokumen(User $user, Permohonan $permohonan, ?int $dokumenId = null): array`:
- If `$dokumenId` provided, find `$permohonan->Dokumen()->where('id', $dokumenId)->firstOrFail()`.
- Else, default to `$permohonan->Dokumen()->where('tipe_dokumen', 'surat_permohonan')->latest('versi')->firstOrFail()`.

In `backend/app/Http/Controllers/Perencanaan/PerencanaanController.php`:
Pass `$request->query('dokumen_id')` to `$this->permohonanService->ambilDokumen($user, $permohonan, $dokumenId)`.

In `backend/app/Services/PerencanaanService.php`:
Map `dokumen_permohonan` array so each item includes:
```php
'download_url' => "/api/v1/perencanaan/pengajuan/{$permohonan->id}/dokumen?dokumen_id={$doc->id}",
```

- [ ] **Step 4: Run test to verify it passes**

Run: `php artisan test --filter=PerencanaanDokumenTest`
Expected: PASS

- [ ] **Step 5: Format code and commit**

```bash
vendor/bin/pint --dirty --format agent
git add backend/app/Services/PermohonanService.php backend/app/Http/Controllers/Perencanaan/PerencanaanController.php backend/app/Services/PerencanaanService.php backend/tests/Feature/Perencanaan/PerencanaanDokumenTest.php
git commit -m "feat(backend): support specific document download by id in perencanaan pengajuan"
```

---

### Task 2: Frontend Service URL Normalization & Types

**Files:**
- Modify: `frontend/src/types/perencanaan.ts`
- Modify: `frontend/src/types/dokumen.ts` (or create if needed)
- Modify: `frontend/src/services/perencanaanService.ts:48-64`

**Interfaces:**
- Define standard `DokumenItem`:
  ```ts
  export interface DokumenItem {
    id: number | string;
    nama_asli: string;
    tipe_dokumen?: string;
    ukuran_bytes?: number;
    mime_type?: string;
    download_url?: string;
    versi?: number;
    created_at?: string;
  }
  ```
- `perencanaanService.fetchDokumenBlob(url: string, disposition: 'inline' | 'attachment')`: Strips redundant `/api` prefix when passing to `api.get` since `api` Axios instance already has `baseURL: '/api'`.

- [ ] **Step 1: Define typed interface `DokumenItem` in `frontend/src/types/perencanaan.ts`**

Export `DokumenItem` and update `PerencanaanPengajuanDetailResponse` and `PerencanaanPengajuanDetail` to use `DokumenItem[]` for `dokumen_permohonan`.

- [ ] **Step 2: Fix URL normalization in `perencanaanService.ts`**

In `frontend/src/services/perencanaanService.ts`:
```ts
  async fetchDokumenBlob(
    downloadUrl: string,
    disposition: 'inline' | 'attachment' = 'attachment'
  ): Promise<{ blob: Blob; contentType?: string }> {
    // Strip leading /api if present to prevent /api/api/... duplicate with baseURL
    const normalizedUrl = downloadUrl.replace(/^\/api(?=\/)/, '');
    const separator = normalizedUrl.includes('?') ? '&' : '?';
    const finalUrl = disposition === 'inline' ? `${normalizedUrl}${separator}disposition=inline` : normalizedUrl;

    const response = await api.get<Blob>(finalUrl, { responseType: 'blob' });
    const rawContentType = response.headers['content-type'];
    const contentType = typeof rawContentType === 'string' ? rawContentType : 'application/pdf';
    return {
      blob: new Blob([response.data], { type: contentType }),
      contentType,
    };
  },
```

- [ ] **Step 3: Verify TypeScript compilation**

Run: `npm --prefix frontend run build` (or `tsc --noEmit`)
Expected: PASS without type errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/types/perencanaan.ts frontend/src/services/perencanaanService.ts
git commit -m "fix(frontend): normalize document download url in perencanaanService"
```

---

### Task 3: Build Reusable `DokumenListCard` Organism

**Files:**
- Create: `frontend/src/components/organisms/DokumenListCard.tsx`
- Delete: `frontend/src/components/organisms/PerencanaanDokumenCard.tsx` (renamed & replaced)

**Interfaces:**
```ts
export interface DokumenListCardProps {
  title?: string;
  dokumenList: DokumenItem[];
  nomorSurat?: string | null;
  judul?: string | null;
  unitNama?: string | null;
  tanggal?: string | null;
  onViewNewTab?: (dokumen: DokumenItem) => void;
  onDownload?: (dokumen: DokumenItem) => void;
  isViewingId?: number | string | null;
  isDownloadingId?: number | string | null;
  previewBlobUrl?: string | null;
  previewDocId?: number | string | null;
  isLoadingPreview?: boolean;
}
```

**Features & Design Compliance:**
1. Outer Card: White, radius `rounded-[22px]`, border `#E4EBE8`, shadow `shadow-[0_4px_16px_rgba(13,51,38,0.04)]`, comfortable padding `p-6`.
2. Header: Title (default: "Dokumen Berkas", customizable), Pill badge `Live Preview` (emerald `#EAF6F1` text `#0E7C5A`).
3. Multi-Document Accordion List:
   - Maps `dokumenList`.
   - Each item row has: File icon (tinted red for PDF, blue for others), filename (truncated with title), file size and document type badge (e.g. `Surat Permohonan`, `Lampiran`).
   - Action buttons: "Lihat" (Eye icon), "Unduh" (Download icon), and Chevron to toggle accordion.
   - Accordion expansion:
     - If `dokumen.tipe_dokumen === 'surat_permohonan'` (or identified as main permohonan document): embeds an `<iframe>` container showing the preview (using `previewBlobUrl` or direct inline URL), with toolbar hidden (`#toolbar=0&navpanes=0`), height `500px`, rounded border.
     - If document is not `surat_permohonan`: displays clean file information card with metadata and download button.
   - Initial state: Auto-expand the `surat_permohonan` item by default so the user immediately sees the live preview upon loading the page!

- [ ] **Step 1: Create `frontend/src/components/organisms/DokumenListCard.tsx`**

Implement `DokumenListCard` with the specified interfaces, accordion state management (`expandedDocId`), and clean empty/fallback states.

- [ ] **Step 2: Remove old `PerencanaanDokumenCard.tsx`**

Delete `frontend/src/components/organisms/PerencanaanDokumenCard.tsx`.

- [ ] **Step 3: Verify TypeScript compilation**

Run: `npm --prefix frontend run build` (Expected to flag remaining imports of `PerencanaanDokumenCard` to be updated in Task 4).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/organisms/DokumenListCard.tsx
git rm frontend/src/components/organisms/PerencanaanDokumenCard.tsx
git commit -m "feat(frontend): create reusable DokumenListCard organism with accordion and iframe"
```

---

### Task 4: Integrate `DokumenListCard` into `PerencanaanPengajuanShowTemplate` & `Show.tsx`

**Files:**
- Modify: `frontend/src/components/templates/PerencanaanPengajuanShowTemplate.tsx`
- Modify: `frontend/src/pages/Perencanaan/Pengajuan/Show.tsx`

**Interfaces:**
- `PerencanaanPengajuanShowTemplateProps`:
  - Replace `PerencanaanDokumenCard` imports with `DokumenListCard`.
  - Pass `dokumenList: DokumenItem[]`.
  - Pass `onViewDokumen: (doc: DokumenItem) => void`.
  - Pass `onDownloadDokumen: (doc: DokumenItem) => void`.
  - Pass `activeDocId`, `isViewingDocId`, `isDownloadingDocId`, `previewBlobUrl`, `isLoadingPreview`.

- [ ] **Step 1: Update `PerencanaanPengajuanShowTemplate.tsx`**

Update template to import and render `DokumenListCard` instead of `PerencanaanDokumenCard`. Wire all document-related props to `DokumenListCard`.

- [ ] **Step 2: Update `frontend/src/pages/Perencanaan/Pengajuan/Show.tsx`**

Implement in `Show.tsx`:
1. Build `allDocuments: DokumenItem[]` from `detail?.dokumen_permohonan` and fallback `detail?.dokumen`.
2. Automatically fetch inline blob for the `surat_permohonan` document on initial load so the iframe displays the live preview immediately.
3. Update `handleViewDokumen(doc: DokumenItem)`:
   - Fetches inline blob via `perencanaanService.fetchDokumenBlob(doc.download_url, 'inline')`.
   - Opens the blob URL in a new tab `window.open(blobUrl, '_blank')`.
4. Update `handleDownloadDokumen(doc: DokumenItem)`:
   - Fetches attachment blob via `perencanaanService.fetchDokumenBlob(doc.download_url, 'attachment')`.
   - Triggers clean browser file download via temporary `<a>` element with filename `doc.nama_asli`.
   - Cleanly revokes object URL after 1 second.

- [ ] **Step 3: Run frontend build verification**

Run: `npm --prefix frontend run build`
Expected: Build passes with 0 TypeScript and bundling errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/templates/PerencanaanPengajuanShowTemplate.tsx frontend/src/pages/Perencanaan/Pengajuan/Show.tsx
git commit -m "feat(frontend): integrate DokumenListCard and multi-document handlers into Perencanaan Show"
```

---

### Task 5: End-to-End Verification & Pint Code Formatting

**Files:**
- Whole workspace check.

- [ ] **Step 1: Run Pint code formatter on backend**

Run: `vendor/bin/pint --dirty --format agent`
Expected: 0 syntax/style violations.

- [ ] **Step 2: Run backend tests**

Run: `php artisan test --filter=PerencanaanDokumenTest`
Expected: PASS

- [ ] **Step 3: Run full frontend build**

Run: `npm --prefix frontend run build`
Expected: PASS

- [ ] **Step 4: Final commit if any formatting changes occurred**

```bash
git add -A
git commit -m "chore: format and verify DokumenListCard implementation"
```

