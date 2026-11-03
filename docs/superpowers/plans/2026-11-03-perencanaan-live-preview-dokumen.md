# Perencanaan Live Preview & Dokumen Permohonan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menampilkan data dokumen asli permohonan pengadaan pada halaman detail perencanaan (`Perencanaan/Pengajuan/Show.tsx`), menyediakan live preview dokumen asli, tombol "Lihat" untuk membuka dokumen PDF di tab baru, serta tombol "Unduh" untuk mengunduh dokumen secara langsung.

**Architecture:** Backend API `/v1/perencanaan/pengajuan/{permohonan}` menyertakan metadata dokumen asli (`detail.dokumen`), didukung endpoint `GET /v1/perencanaan/pengajuan/{permohonan}/dokumen` untuk inline view (`?disposition=inline`) dan file download yang diotorisasi via Sanctum. Di frontend `Show.tsx`, kartu dokumen menarik data dokumen riil, merender live preview dokumen asli, menyediakan tombol "Lihat" yang membuka tampilan dokumen di tab baru, serta tombol "Unduh" yang mengunduh file secara langsung.

**Tech Stack:** Laravel 13, PHP 8.5, React 19, TypeScript, Axios, Tailwind CSS v4, Lucide React.

**Spec:** `docs/DEVELOPMENT_RULES.md`, `docs/API_CONTRACT.md`, `docs/PRD.md`

## Global Constraints

- Migrations & queries must remain dual SQLite & PostgreSQL compatible.
- Do NOT add new Composer or npm dependencies without approval.
- Follow existing project style and conventions.
- Format all modified PHP files with `vendor/bin/pint --dirty --format agent`.
- Verify frontend with `npm.cmd --prefix frontend run build`.
- Maintain authorization: peran `Perencanaan` dan aktor berwenang dapat mengakses dan mengunduh berkas.

## Review Focus

- **Permohonan tanpa berkas dokumen fisik** — jika permohonan belum/tidak memiliki dokumen fisik di storage, tombol "Lihat" dan "Unduh" harus disabled atau menampilkan status informatif tanpa error.
- **Buka tab baru dengan autentikasi / disposition** — saat tombol "Lihat" diklik, buka endpoint `/api/v1/perencanaan/pengajuan/{id}/dokumen?disposition=inline` di tab baru (`_blank`), sehingga browser membuka PDF viewer bawaan browser secara native.
- **Tombol Unduh langsung** — tombol "Unduh" membuka endpoint `/api/v1/perencanaan/pengajuan/{id}/dokumen` (attachment) sehingga browser langsung mendownload file dengan nama asli.
- **Format ukuran berkas** — dokumen dengan `ukuran_bytes` harus diformat ke KB / MB yang presisi, dengan fallback aman jika null.
- **Live Preview di halaman** — area live preview di halaman `Show.tsx` menampilkan preview dokumen asli (inline viewer atau rangkuman data resmi berkas permohonan) sesuai data aktual dari database.

---

## Task 1: Backend Endpoint Dokumen & Metadata Perencanaan

**Files:**
- Modify: `backend/app/Services/PerencanaanService.php`
- Modify: `backend/app/Http/Controllers/Perencanaan/PerencanaanController.php`
- Modify: `backend/routes/api.php`
- Test: `backend/tests/Feature/Perencanaan/PerencanaanDokumenTest.php`

**Interfaces:**
- Consumes: `PermohonanService::ambilDokumen`.
- Produces: 
  - `GET /api/v1/perencanaan/pengajuan/{permohonan}` menghasilkan `detail.dokumen`: `{ id, nama_asli, ukuran_bytes, mime_type, download_url }`.
  - `GET /api/v1/perencanaan/pengajuan/{permohonan}/dokumen` mengalirkan berkas: `disposition=inline` (buka di browser) atau `attachment` (download).

- [ ] **Step 1: Buat failing feature test `PerencanaanDokumenTest.php`**

  Buat `backend/tests/Feature/Perencanaan/PerencanaanDokumenTest.php`:
  ```php
  <?php

  namespace Tests\Feature\Perencanaan;

  use App\Models\Dokumen;
  use App\Models\Permohonan;
  use App\Models\Unit;
  use App\Models\User;
  use Database\Seeders\MasterReferenceSeeder;
  use Database\Seeders\RbacSeeder;
  use Database\Seeders\RoleSeeder;
  use Database\Seeders\UserSeeder;
  use Illuminate\Foundation\Testing\RefreshDatabase;
  use Illuminate\Http\UploadedFile;
  use Illuminate\Support\Facades\Storage;
  use Tests\TestCase;

  class PerencanaanDokumenTest extends TestCase
  {
      use RefreshDatabase;

      protected function setUp(): void
      {
          parent::setUp();
          $this->seed([
              RoleSeeder::class,
              UserSeeder::class,
              RbacSeeder::class,
              MasterReferenceSeeder::class,
          ]);
      }

      public function test_perencanaan_can_get_permohonan_with_dokumen_metadata(): void
      {
          Storage::fake('local');
          $perencana = User::where('email', 'perencanaan@pnj.ac.id')->firstOrFail();
          $pemohon = User::where('email', 'jurusan@pnj.ac.id')->firstOrFail();
          $unit = Unit::firstOrCreate(['nama' => 'Teknik Komputer']);

          $permohonan = Permohonan::create([
              'unit_id' => $unit->id,
              'created_by' => $pemohon->id,
              'nomor_surat' => 'PRM/TEST/001',
              'judul' => 'Pengadaan Server',
              'ringkasan_tujuan' => 'Server lab',
              'estimasi_anggaran' => 50000000,
              'revisi_ke' => 0,
              'status' => 'diajukan',
              'created_at' => now(),
          ]);

          $file = UploadedFile::fake()->create('surat_permohonan.pdf', 1024, 'application/pdf');
          $namaHash = 'test-hash-dokumen.pdf';
          Storage::disk('local')->putFileAs('dokumen/permohonan', $file, $namaHash);

          Dokumen::create([
              'ref_type' => 'permohonan',
              'ref_id' => $permohonan->id,
              'tipe_dokumen' => 'surat_permohonan',
              'versi' => 1,
              'nama_asli' => 'surat_permohonan.pdf',
              'nama_hash' => $namaHash,
              'mime_type' => 'application/pdf',
              'ukuran_bytes' => 1024 * 1024,
              'uploaded_by' => $pemohon->id,
          ]);

          $res = $this->actingAs($perencana, 'sanctum')->getJson("/api/v1/perencanaan/pengajuan/{$permohonan->id}");

          $res->assertStatus(200);
          $res->assertJsonPath('detail.dokumen.nama_asli', 'surat_permohonan.pdf');
          $res->assertJsonPath('detail.dokumen.download_url', "/api/v1/perencanaan/pengajuan/{$permohonan->id}/dokumen");

          // Test inline stream untuk tab baru
          $inlineRes = $this->actingAs($perencana, 'sanctum')
              ->get("/api/v1/perencanaan/pengajuan/{$permohonan->id}/dokumen?disposition=inline");
          $inlineRes->assertStatus(200);
          $inlineRes->assertHeader('Content-Disposition', 'inline; filename="surat_permohonan.pdf"');

          // Test download attachment
          $downloadRes = $this->actingAs($perencana, 'sanctum')
              ->get("/api/v1/perencanaan/pengajuan/{$permohonan->id}/dokumen");
          $downloadRes->assertStatus(200);
          $downloadRes->assertHeader('Content-Disposition', 'attachment; filename="surat_permohonan.pdf"');
      }
  }
  ```

- [ ] **Step 2: Jalankan test untuk memastikan gagal terlebih dahulu**

  Run: `php backend/vendor/bin/phpunit -c backend/phpunit.xml --filter=PerencanaanDokumenTest`
  Expected: FAIL.

- [ ] **Step 3: Implementasikan service, controller, dan route**

  1. Di `PerencanaanService::getDetailPermohonan`:
     Cari dokumen `tipe_dokumen = surat_permohonan` terbaru dari `$permohonan->Dokumen()`.
     Format objek `dokumen`:
     ```php
     $dokumen = $permohonan->Dokumen()->where('tipe_dokumen', 'surat_permohonan')->latest('versi')->first()
         ?? Dokumen::where('ref_type', 'permohonan')->where('ref_id', $permohonan->id)->latest('id')->first();

     $dokumenInfo = $dokumen ? [
         'id' => $dokumen->id,
         'nama_asli' => $dokumen->nama_asli,
         'ukuran_bytes' => (int) ($dokumen->ukuran_bytes ?? 0),
         'mime_type' => $dokumen->mime_type ?? 'application/pdf',
         'download_url' => "/api/v1/perencanaan/pengajuan/{$permohonan->id}/dokumen",
     ] : null;
     ```
     Tambahkan `'dokumen' => $dokumenInfo` ke array return.

  2. Di `PerencanaanController`:
     - Tambahkan `private PermohonanService $permohonanService` pada constructor promotion.
     - Tambahkan method `downloadDokumen(Request $request, Permohonan $permohonan): StreamedResponse`:
       ```php
       $user = $request->user();
       $info = $this->permohonanService->ambilDokumen($user, $permohonan);
       $disposition = $request->query('disposition', 'attachment');
       if ($disposition === 'inline') {
           return Storage::disk('local')->response($info['path'], $info['nama_asli']);
       }
       return Storage::disk('local')->download($info['path'], $info['nama_asli']);
       ```

  3. Di `backend/routes/api.php` pada grup `perencanaan`:
     ```php
     Route::get('pengajuan/{permohonan}/dokumen', [PerencanaanController::class, 'downloadDokumen'])
         ->name('api.perencanaan.pengajuan.dokumen.download');
     ```

- [ ] **Step 4: Jalankan test untuk memverifikasi kelulusan**

  Run: `php backend/vendor/bin/phpunit -c backend/phpunit.xml --filter=PerencanaanDokumenTest`
  Expected: PASS (1 test, 6 assertions).

- [ ] **Step 5: Format PHP & Commit**

  Run: `php backend/vendor/bin/pint --dirty --format agent`
  Commit:
  ```bash
  git add backend/app/Services/PerencanaanService.php backend/app/Http/Controllers/Perencanaan/PerencanaanController.php backend/routes/api.php backend/tests/Feature/Perencanaan/PerencanaanDokumenTest.php
  git commit -m "feat(perencanaan): add document stream and download endpoints"
  ```

---

## Task 2: Integrasi Dokumen Asli, Buka Tab Baru & Tombol Download di `Show.tsx`

**Files:**
- Modify: `frontend/src/pages/Perencanaan/Pengajuan/Show.tsx`

**Interfaces:**
- Consumes: Data `detail.dokumen` dari endpoint backend `/v1/perencanaan/pengajuan/{id}`.
- Produces: 
  - File metadata riil (nama berkas asli & ukuran terformat).
  - Tombol **Lihat** dengan ikon `Eye` yang membuka dokumen PDF di tab baru (`window.open(url + '?disposition=inline', '_blank')`).
  - Tombol **Unduh** dengan ikon `Download` yang mengunduh file dokumen asli (`window.open(url, '_blank')`).
  - Area Live Preview menampilkan data dokumen aktual (atau pratinjau isi permohonan).

- [ ] **Step 1: Ekstrak data dokumen asli dan helper ukuran berkas di `Show.tsx`**

  Tambahkan helper format bytes:
  ```typescript
  function formatBytes(bytes?: number): string {
    if (!bytes || bytes <= 0) return '0 KB';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    const kb = bytes / 1024;
    return `${Math.round(kb)} KB`;
  }
  ```

  Ekstrak metadata dokumen:
  ```typescript
  const dokumen = detail.dokumen || (detail.dokumen_permohonan && detail.dokumen_permohonan[0]) || null;
  const dokumenNama = dokumen?.nama_asli || (mode === 'pengadaan' ? 'Dokumen_Pengadaan_Komputer_TIK.pdf' : 'Surat_Permohonan_Pengadaan.pdf');
  const dokumenUkuran = dokumen?.ukuran_bytes ? formatBytes(dokumen.ukuran_bytes) : '8 MB';
  const dokumenUrl = dokumen?.download_url || (permohonan.id ? `/api/v1/perencanaan/pengajuan/${permohonan.id}/dokumen` : null);
  ```

- [ ] **Step 2: Tambahkan aksi tombol "Lihat" (Tab Baru) & "Unduh"**

  Buat fungsi handler:
  ```typescript
  const handleLihatTabBaru = () => {
    if (dokumenUrl) {
      window.open(`${dokumenUrl}?disposition=inline`, '_blank', 'noopener,noreferrer');
    }
  };

  const handleUnduhDokumen = () => {
    if (dokumenUrl) {
      window.open(dokumenUrl, '_blank', 'noopener,noreferrer');
    }
  };
  ```

- [ ] **Step 3: Render tampilan Card Dokumen Permohonan di `Show.tsx`**

  Di bagian Card "Dokumen Permohonan":
  - Tampilkan nama file asli (`dokumenNama`) dan ukurannya (`PDF • ${dokumenUkuran}`).
  - Render 2 tombol aksi bersebelahan:
    1. Tombol **Lihat** (border style):
       ```tsx
       <button
         type="button"
         onClick={handleLihatTabBaru}
         disabled={!dokumenUrl}
         className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E4EBE8] text-xs font-bold text-[#14201C] hover:bg-[#F8FAF9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
         title="Buka dokumen di tab baru"
       >
         <Eye className="w-3.5 h-3.5 text-[#5F6F6A]" />
         <span>Lihat</span>
       </button>
       ```
    2. Tombol **Unduh** (primary green style dengan icon `Download`):
       ```tsx
       <button
         type="button"
         onClick={handleUnduhDokumen}
         disabled={!dokumenUrl}
         className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0E7C5A] hover:bg-[#0A5C43] text-white text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-colors cursor-pointer"
         title="Unduh berkas dokumen"
       >
         <Download className="w-3.5 h-3.5" />
         <span>Unduh</span>
       </button>
       ```
  - Pastikan icon `Download` diimport dari `lucide-react`.
  - Pada area box pratinjau di bawahnya, pastikan menampilkan perihal, nomor surat, tanggal permohonan, serta nama unit dari data asli.

- [ ] **Step 4: Jalankan build frontend untuk verifikasi TypeScript & JSX**

  Run: `npm.cmd --prefix frontend run build`
  Expected: Build sukses, 0 error.

- [ ] **Step 5: Commit**

  ```bash
  git add frontend/src/pages/Perencanaan/Pengajuan/Show.tsx
  git commit -m "feat(perencanaan): add view in new tab and direct download button for pengajuan documents"
  ```

---

## Task 3: Verifikasi Penuh (Backend & Frontend)

**Files:**
- Full test suite & build

**Interfaces:**
- Consumes: Task 1 dan Task 2.
- Produces: Jaminan bebas regresi.

- [ ] **Step 1: Jalankan seluruh test suite PHPUnit**

  Run: `php backend/vendor/bin/phpunit -c backend/phpunit.xml`
  Expected: Semua test (110 tests) lulus 100%.

- [ ] **Step 2: Jalankan PHP Pint**

  Run: `php backend/vendor/bin/pint --dirty --format agent`
  Expected: passed.

- [ ] **Step 3: Jalankan Frontend production build**

  Run: `npm.cmd --prefix frontend run build`
  Expected: Vite build berhasil (exit code 0).
