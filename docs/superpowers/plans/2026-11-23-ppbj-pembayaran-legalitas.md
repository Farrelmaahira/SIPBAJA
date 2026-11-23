# Implementation Plan: Alur Pembayaran & Legalitas Vendor PPBJ (FR-40 - FR-45)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengimplementasikan fitur bagi PPBJ di `/ppbj/pengadaan/:id` untuk melihat pratinjau bukti penerimaan barang Perlengkapan (FR-40), mengunggah dan mengunggah ulang draf dokumen tagihan ke dual approval PPK & Bidang 2 (FR-41, FR-42), serta mengunggah, mempratinjau, dan memperbarui dokumen legalitas vendor setelah dual memo terbit hingga sebelum dana dicairkan Keuangan (FR-43, FR-44, FR-45).

**Architecture:** Memanfaatkan relasi terpusat `Pengadaan` -> `PenerimaanBarang` -> `Dokumen` untuk bukti fisik Perlengkapan, dan `Pengadaan` -> `Kontrak` -> `RencanaPembayaran` -> `Pembayaran` -> `ApprovalPembayaran` & `Dokumen` untuk alur pembayaran & legalitas vendor. Validasi guard dilakukan di service backend (`PengadaanService`/`PpbjPembayaranService`), dikonsumsi via RESTful endpoints, dan disajikan melalui komponen UI terintegrasi pada `Show.tsx` PPBJ dengan prinsip antislop (no emoji slop, semantic colors, real state indicators).

**Tech Stack:** Laravel 12 (PHP 8.5), SQLite / MySQL, PHPUnit, React 19, TypeScript, Tailwind CSS, Lucide React.

**Spec:** `docs/superpowers/specs/2026-11-23-ppbj-pembayaran-legalitas-design.md`

## Global Constraints
- Gunakan standard status SIPBAJA: `menunggu_persetujuan`, `perlu_revisi`, `disetujui`, `siap_bayar`, `selesai`.
- Upload berkas dibatasi MIME `application/pdf` maksimal 10MB (`10240 KB`).
- Terapkan kaidah Ponytail: Gunakan struktur helper dan service yang sudah ada (`DokumenService`, `PengadaanService`, storage disk standar `local`).
- Terapkan kaidah Antislop UI: Desain clean, no decorative emoji, kontras teks jelas, badge status merefleksikan data riil, valid empty/loading states.

## Review Focus
1. Guard FR-42: Re-upload dokumen tagihan harus ditolak (422) jika dual approval (PPK & Bidang 2) keduanya sudah menyetujui (`disetujui`).
2. Guard FR-43: Upload legalitas vendor harus ditolak (403/422) jika memo PPK dan Bidang 2 belum lengkap keduanya.
3. Guard FR-45: Re-upload legalitas vendor harus ditolak (422) jika pembayaran sudah berstatus `selesai` (Keuangan telah mengunggah bukti bayar).
4. FR-40: Handling null-safe bila pengadaan belum memiliki data `PenerimaanBarang` dari Perlengkapan.
5. Frontend State: Tombol upload legalitas vendor di-disable dan menampilkan tooltip/pesan syarat memo jika dual memo belum terpenuhi.

---

### Task 1: Backend - Endpoint Konteks Pembayaran & Data BAST Perlengkapan (FR-40)

**Files:**
- Modify: `backend/app/Services/PengadaanService.php`
- Modify: `backend/app/Http/Controllers/PPBJ/PengadaanController.php`
- Modify: `backend/routes/api.php`
- Test: `backend/tests/Feature/PpbjPembayaranApiTest.php`

**Interfaces:**
- Produces: `GET /api/v1/ppbj/pengadaan/{id}/pembayaran-context` returning JSON:
  `{ penerimaan: { id, tanggal_terima, bast_dokumen, foto_barang }, pembayaran: { id, status, nominal }, dokumen_tagihan, approvals: { ppk, bidang2 }, can_upload_tagihan, can_upload_legalitas, dokumen_legalitas, is_locked }`

- [ ] **Step 1: Write the failing test**
Create `backend/tests/Feature/PpbjPembayaranApiTest.php` testing `getPembayaranContext` endpoint.

- [ ] **Step 2: Run test to verify it fails**
Run: `php artisan test --filter=PpbjPembayaranApiTest::test_ppbj_can_fetch_pembayaran_context_with_perlengkapan_bast_and_photos`
Expected: FAIL (Route not found / 404).

- [ ] **Step 3: Implement method `getPembayaranContext(Pengadaan $pengadaan): array` in `PengadaanService.php` & controller**
Ambil relasi `PenerimaanBarang.Dokumen`, `Kontrak.RencanaPembayaran.Pembayaran.ApprovalPembayaran`, dan hitung guard boolean (`can_upload_tagihan`, `can_upload_legalitas`, `is_locked`).

- [ ] **Step 4: Run test to verify it passes**
Run: `php artisan test --filter=PpbjPembayaranApiTest::test_ppbj_can_fetch_pembayaran_context_with_perlengkapan_bast_and_photos`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add backend/app/Services/PengadaanService.php backend/app/Http/Controllers/PPBJ/PengadaanController.php backend/routes/api.php backend/tests/Feature/PpbjPembayaranApiTest.php
git commit -m "feat(ppbj): implement pembayaran-context endpoint with perlengkapan bast and photos (FR-40)"
```

---

### Task 2: Backend - Upload & Re-upload Dokumen Tagihan (FR-41, FR-42)

**Files:**
- Modify: `backend/app/Services/PengadaanService.php`
- Modify: `backend/app/Http/Controllers/PPBJ/PengadaanController.php`
- Modify: `backend/routes/api.php`
- Test: `backend/tests/Feature/PpbjPembayaranApiTest.php`

**Interfaces:**
- Produces: `POST /api/v1/ppbj/pengadaan/{id}/dokumen-tagihan`
  - Body: `multipart/form-data` with `dokumen_tagihan` (file), optional `nominal`, optional `catatan`.
  - Guard: Gagal jika kedua memo sudah `disetujui`.

- [ ] **Step 1: Write the failing tests**
Add `test_ppbj_can_upload_dokumen_tagihan_and_routes_to_dual_approval` and `test_ppbj_cannot_reupload_tagihan_after_both_memos_approved` to `PpbjPembayaranApiTest.php`.

- [ ] **Step 2: Run tests to verify they fail**
Run: `php artisan test --filter=PpbjPembayaranApiTest::test_ppbj_can_upload_dokumen_tagihan_and_routes_to_dual_approval`
Expected: FAIL (404/Route not defined).

- [ ] **Step 3: Implement `uploadDokumenTagihan(Pengadaan $pengadaan, UploadedFile $file, ?float $nominal, ?string $catatan, User $actor)` in `PengadaanService.php`**
Simpan file ke `dokumen` (`tipe_dokumen: 'dokumen_tagihan'`, `ref_type: 'pembayaran'`), set status `Pembayaran` ke `menunggu_persetujuan`, update `pengadaan.status` ke `pembayaran`.

- [ ] **Step 4: Run tests to verify they pass**
Run: `php artisan test --filter=PpbjPembayaranApiTest`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add backend/app/Services/PengadaanService.php backend/app/Http/Controllers/PPBJ/PengadaanController.php backend/routes/api.php backend/tests/Feature/PpbjPembayaranApiTest.php
git commit -m "feat(ppbj): implement upload and re-upload dokumen tagihan with dual approval routing (FR-41, FR-42)"
```

---

### Task 3: Backend - Upload & Re-upload Legalitas Vendor dengan Guard Memo & Keuangan (FR-43, FR-44, FR-45)

**Files:**
- Modify: `backend/app/Services/PengadaanService.php`
- Modify: `backend/app/Http/Controllers/PPBJ/PengadaanController.php`
- Modify: `backend/routes/api.php`
- Test: `backend/tests/Feature/PpbjPembayaranApiTest.php`

**Interfaces:**
- Produces: `POST /api/v1/ppbj/pengadaan/{id}/legalitas-vendor`
  - Body: `multipart/form-data` with `dokumen_legalitas` (file).
  - Guard 1: Menolak jika memo PPK dan Bidang 2 belum `disetujui`.
  - Guard 2: Menolak jika pembayaran sudah `selesai` di bagian Keuangan.

- [ ] **Step 1: Write failing tests**
Add tests:
- `test_ppbj_cannot_upload_legalitas_vendor_before_memos_complete`
- `test_ppbj_can_upload_legalitas_vendor_after_both_memos_approved`
- `test_ppbj_can_reupload_legalitas_vendor_before_keuangan_processes`
- `test_ppbj_cannot_reupload_legalitas_vendor_after_keuangan_completed`

- [ ] **Step 2: Run tests to verify they fail**
Run: `php artisan test --filter=PpbjPembayaranApiTest::test_ppbj_cannot_upload_legalitas_vendor_before_memos_complete`
Expected: FAIL.

- [ ] **Step 3: Implement `uploadLegalitasVendor(Pengadaan $pengadaan, UploadedFile $file, User $actor)` in `PengadaanService.php`**
Verifikasi syarat kedua memo, simpan dokumen `dokumen_legalitas_vendor`, pastikan status `Pembayaran` disiapkan ke Keuangan (`siap_bayar`).

- [ ] **Step 4: Run tests to verify they pass**
Run: `php artisan test --filter=PpbjPembayaranApiTest`
Expected: PASS (all 6 tests passing).

- [ ] **Step 5: Commit**
```bash
git add backend/app/Services/PengadaanService.php backend/app/Http/Controllers/PPBJ/PengadaanController.php backend/routes/api.php backend/tests/Feature/PpbjPembayaranApiTest.php
git commit -m "feat(ppbj): implement legalitas vendor upload with memo and payment completion guards (FR-43, FR-44, FR-45)"
```

---

### Task 4: Frontend - Service API Client & Types di `ppbjService.ts`

**Files:**
- Modify: `frontend/src/types/ppbj.ts`
- Modify: `frontend/src/services/ppbjService.ts`

**Interfaces:**
- Produces in `ppbjService`:
  - `getPembayaranContext(pengadaanId: number): Promise<PpbjPembayaranContext>`
  - `uploadDokumenTagihan(pengadaanId: number, file: File, nominal?: number, catatan?: string): Promise<{ message: string; pembayaran: any }>`
  - `uploadLegalitasVendor(pengadaanId: number, file: File): Promise<{ message: string; dokumen: any }>`

- [ ] **Step 1: Tambahkan types `PpbjPembayaranContext` dan tipe pendukung di `types/ppbj.ts`**
Definisikan tipe BAST perlengkapan, foto barang, status tagihan, dual approval memo, dan status legalitas.

- [ ] **Step 2: Tambahkan 3 fungsi API call di `ppbjService.ts`**
Gunakan `api.get` dan `api.post` (dengan `multipart/form-data`).

- [ ] **Step 3: Verifikasi type check TypeScript**
Run: `cd frontend && npm.cmd run build`
Expected: PASS (no type errors).

- [ ] **Step 4: Commit**
```bash
git add frontend/src/types/ppbj.ts frontend/src/services/ppbjService.ts
git commit -m "feat(frontend): add ppbj pembayaran and legalitas vendor types and service methods"
```

---

### Task 5: Frontend - Komponen UI Bagian Pembayaran & Legalitas di `/ppbj/pengadaan/:id`

**Files:**
- Create: `frontend/src/components/organisms/PPBJ/PpbjPembayaranSection.tsx`
- Modify: `frontend/src/pages/PPBJ/Pengadaan/Show.tsx`

**Interfaces:**
- Consumes: `ppbjService.getPembayaranContext`, `uploadDokumenTagihan`, `uploadLegalitasVendor`.
- Implements:
  - Card 1: Pratinjau Surat BAST & Galeri Foto Barang Perlengkapan (FR-40).
  - Card 2: Upload / Re-upload Dokumen Tagihan & Status Dual Approval (FR-41, FR-42).
  - Card 3: Upload / Re-upload Dokumen Legalitas Vendor dengan conditional lock (FR-43, FR-44, FR-45).
  - Antislop: No emoji, semantic badge, disable button with descriptive tooltip, responsive layout.

- [ ] **Step 1: Buat komponen `PpbjPembayaranSection.tsx`**
Implementasikan kartu BAST, upload tagihan, status memo PPK & Bidang 2, dan kartu legalitas vendor dengan state guard visual.

- [ ] **Step 2: Integrasikan ke dalam `Show.tsx` PPBJ**
Pasang `PpbjPembayaranSection` di bawah detail kontrak / informasi pengadaan.

- [ ] **Step 3: Verifikasi TypeScript dan build**
Run: `cd frontend && npm.cmd run build`
Expected: PASS.

- [ ] **Step 4: Commit**
```bash
git add frontend/src/components/organisms/PPBJ/PpbjPembayaranSection.tsx frontend/src/pages/PPBJ/Pengadaan/Show.tsx
git commit -m "feat(ppbj): integrate pembayaran and vendor legality UI section into detail pengadaan page"
```

---

### Task 6: Verifikasi End-to-End, Linting, & Formatting

**Files:**
- Entire repository backend & frontend

- [ ] **Step 1: Jalankan Laravel Pint**
Run: `cd backend && vendor/bin/pint --format agent`
Expected: PASSED.

- [ ] **Step 2: Jalankan Backend PHPUnit Tests**
Run: `cd backend && php artisan test --compact`
Expected: All tests pass (including new `PpbjPembayaranApiTest`).

- [ ] **Step 3: Jalankan Frontend Production Build**
Run: `cd frontend && npm.cmd run build`
Expected: PASSED.

- [ ] **Step 4: Commit final verification**
```bash
git commit --allow-empty -m "chore(ci): verify all tests and build pass for PPBJ payment workflow"
```
