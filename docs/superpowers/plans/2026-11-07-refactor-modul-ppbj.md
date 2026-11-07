# Refaktorisasi dan Standardisasi Modul PPBJ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merapihkan dan menstandarisasi modul PPBJ (Backend & Frontend) sesuai aturan arsitektur di `docs/DEVELOPMENT_RULES.md`, mengadopsi komponen UI bersama lintas aktor (`AppLayout`, `HeroBanner`, `DokumenListCard`, `SearchBar`, `StatusPill`), mengimplementasikan frontend service layer dengan `AbortController`, menghapus tipe `any`, serta menyempurnakan response backend dan Form Request.

**Architecture:** Controller PPBJ hanya menangani HTTP input/response dan mendelegasikan ke Service berbasis domain (`PermohonanService`, `PengadaanService`); response `show` permohonan menggabungkan data permohonan dan konteks split pengadaan. Frontend mengabstraksikan semua pemanggilan API ke dalam `ppbjService.ts` dengan TypeScript types terpusat di `ppbj.ts`, dan memigrasikan template UI ke `AppLayout` beserta komponen atomik/organisme bersama.

**Tech Stack:** Laravel 13, PHP 8.5.11, PHPUnit, Laravel Pint, React 19, TypeScript, React Router v7, Tailwind CSS v4, Axios.

**Spec:** `docs/superpowers/specs/2026-11-07-refactor-modul-ppbj-design.md`

## Global Constraints

- Sesuai `docs/DEVELOPMENT_RULES.md`: Logika bisnis dan write query HANYA berada di Service classes.
- Tidak boleh mengubah schema basis data atau mengedit migrasi lama.
- Setiap inbound mutation wajib menggunakan Form Request spesifik di `backend/app/Http/Requests/PPBJ/`.
- Frontend dilarang memanggil `fetch()` atau `api` langsung di dalam komponen atom/molekul/organisme/template; semua komunikasi HTTP berada di `frontend/src/services/`.
- Setiap hook/pemanggilan fetch data di frontend wajib mengembalikan state loading, error, dan mendukung pembatalan via `AbortController`.
- Menghilangkan seluruh penggunaan tipe `any` pada kode modul PPBJ di frontend.
- Komponen presentasional dilarang menyimpan state filter/bisnis; state tersebut diatur di halaman/hook dan diteruskan via props.

## Review Focus

- Akses endpoint permohonan PPBJ oleh user selain role PPBJ: harus mengembalikan HTTP 403 Forbidden.
- Pemanggilan `GET /api/v1/ppbj/permohonan/{id}` harus memuat properti `bisaDipecah`, `sudahDikunci`, `sisaAnggaran`, `availableMak`, dan `referenceData`.
- Penghapusan draft paket yang sudah bukan draft atau milik permohonan lain harus dicegah dan mengembalikan 422/403.
- Tab switcher di `PpbjTabbedTable` harus dapat berpindah antara *Permohonan Masuk*, *Pengadaan Berjalan*, dan *Termin Kontrak* secara reaktif beserta counter datanya.
- Pratinjau dokumen di `DokumenListCard` pada halaman detail harus menampilkan file surat permohonan yang valid dan dapat diunduh tanpa error.

---

### Task 1: Backend Form Requests & Controller Update

**Files:**
- Create: `backend/app/Http/Requests/PPBJ/HapusDraftPengadaanRequest.php`
- Create: `backend/app/Http/Requests/PPBJ/SubmitPengadaanReviewerRequest.php`
- Modify: `backend/app/Http/Controllers/PPBJ/PermohonanController.php`
- Test: `backend/tests/Feature/PPBJ/PermohonanControllerTest.php`

**Interfaces:**
- Consumes:
  - `PermohonanService::getPermohonanPpbjList(): array`
  - `PermohonanService::getPermohonanDetail(int $id): array`
  - `PengadaanService::getSplitContext(int $permohonanId): array`
  - `PengadaanService::simpanDraftPengadaan(int $permohonanId, array $items, User $actor): array`
  - `PengadaanService::hapusDraftPengadaan(int $pengadaanId, User $actor): void`
  - `PengadaanService::submitKeReviewer(int $permohonanId, User $actor): void`
- Produces:
  - `GET /api/v1/ppbj/permohonan/{id}` response JSON berisi `permohonan` lengkap dengan split context.
  - `DELETE /api/v1/ppbj/pengadaan/{id}` divalidasi oleh `HapusDraftPengadaanRequest`.
  - `POST /api/v1/ppbj/permohonan/{id}/pengadaan/submit` divalidasi oleh `SubmitPengadaanReviewerRequest`.

- [x] **Step 1: Write the failing test in `backend/tests/Feature/PPBJ/PermohonanControllerTest.php`**
- [x] **Step 2: Run test to verify it fails**
- [x] **Step 3: Implement `HapusDraftPengadaanRequest.php` and `SubmitPengadaanReviewerRequest.php`**
- [x] **Step 4: Update `backend/app/Http/Controllers/PPBJ/PermohonanController.php`**
- [x] **Step 5: Run tests to verify they pass**
- [x] **Step 6: Commit**

---

### Task 2: Frontend Types & PPBJ Service Module

**Files:**
- Create: `frontend/src/types/ppbj.ts`
- Create: `frontend/src/services/ppbjService.ts`
- Test: TypeScript verification via `cd frontend; npm.cmd run build`

**Interfaces:**
- Produces:
  - `PpbjDashboardData`, `PpbjStatItem`, `PpbjPermohonanItem`, `PpbjPengadaanItem`, `PpbjTerminItem`, `PpbjPermohonanDetail`, `PpbjSplitContext`.
  - `ppbjService.getDashboard(signal?: AbortSignal): Promise<PpbjDashboardData>`
  - `ppbjService.getPermohonanList(signal?: AbortSignal): Promise<PpbjPermohonanItem[]>`
  - `ppbjService.getPermohonanDetail(id: number | string, signal?: AbortSignal): Promise<PpbjPermohonanDetail>`
  - `ppbjService.storeDraftPengadaan(id: number | string, data: FormData | object): Promise<ApiMessageResponse>`
  - `ppbjService.destroyDraftPengadaan(paketId: number | string): Promise<void>`
  - `ppbjService.submitReviewer(id: number | string): Promise<ApiMessageResponse>`

- [x] **Step 1: Create `frontend/src/types/ppbj.ts`**
- [x] **Step 2: Create `frontend/src/services/ppbjService.ts`**
- [x] **Step 3: Run TypeScript build check**
- [x] **Step 4: Commit**

---

### Task 3: Refactor PPBJ Dashboard (AppLayout, HeroBanner, PpbjTabbedTable)

**Files:**
- Modify: `frontend/src/components/molecules/PpbjTabbedTable.tsx`
- Modify: `frontend/src/components/templates/PpbjDashboardTemplate.tsx`
- Modify: `frontend/src/pages/Ppbj/Dashboard.tsx`

**Interfaces:**
- Consumes:
  - `AppLayout` from `../templates/AppLayout`
  - `HeroBanner` from `../organisms/HeroBanner`
  - `StatCard` from `../molecules/StatCard`
  - `ppbjService.getDashboard`
- Produces:
  - Halaman Dashboard PPBJ interaktif dengan navigasi `AppLayout`, hero banner dinamis, switcher tab data pengadaan yang berfungsi, dan `AbortController`.

- [x] **Step 1: Refactor `PpbjTabbedTable.tsx`**
- [x] **Step 2: Refactor `PpbjDashboardTemplate.tsx`**
- [x] **Step 3: Refactor `frontend/src/pages/Ppbj/Dashboard.tsx`**
- [x] **Step 4: Verify frontend build**
- [x] **Step 5: Commit**

---

### Task 4: Refactor PPBJ Permohonan Index (AppLayout, SearchBar, StatusPill)

**Files:**
- Modify: `frontend/src/components/templates/PermohonanIndexTemplate.tsx`
- Modify: `frontend/src/pages/Ppbj/Permohonan/Index.tsx`

**Interfaces:**
- Consumes:
  - `AppLayout` from `../templates/AppLayout`
  - `SearchBar` from `../molecules/SearchBar`
  - `StatusPill` from `../atoms/StatusPill`
  - `ppbjService.getPermohonanList`
- Produces:
  - Tampilan daftar usulan permohonan pengadaan untuk PPBJ dengan layout seragam dan pencarian live.

- [x] **Step 1: Refactor `PermohonanIndexTemplate.tsx`**
- [x] **Step 2: Refactor `frontend/src/pages/Ppbj/Permohonan/Index.tsx`**
- [x] **Step 3: Verify frontend build**
- [x] **Step 4: Commit**

---

### Task 5: Refactor PPBJ Permohonan Show (DokumenListCard, PengadaanSplitForm)

**Files:**
- Modify: `frontend/src/components/templates/PermohonanShowTemplate.tsx`
- Modify: `frontend/src/pages/Ppbj/Permohonan/Show.tsx`

**Interfaces:**
- Consumes:
  - `AppLayout` from `../templates/AppLayout`
  - `DokumenListCard` from `../organisms/DokumenListCard`
  - `PengadaanSplitForm` from `../organisms/PengadaanSplitForm`
  - `ppbjService.getPermohonanDetail`, `storeDraftPengadaan`, `destroyDraftPengadaan`, `submitReviewer`
- Produces:
  - Halaman detail permohonan PPBJ lengkap dengan live preview PDF surat permohonan, form pemecahan paket pengadaan otomatis, dan modal konfirmasi submit ke reviewer.

- [x] **Step 1: Refactor `PermohonanShowTemplate.tsx`**
- [x] **Step 2: Refactor `frontend/src/pages/Ppbj/Permohonan/Show.tsx`**
- [x] **Step 3: Verify frontend build**
- [x] **Step 4: Commit**

---

### Task 6: Full Verification & Code Formatting

**Files:**
- Verification across backend and frontend repositories

- [x] **Step 1: Run backend tests**
- [x] **Step 2: Run backend code style formatter**
- [x] **Step 3: Run frontend production build**
- [x] **Step 4: Commit final verification**

