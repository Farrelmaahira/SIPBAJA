# PPBJ Pemecahan Pengadaan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Memungkinkan peran PPBJ memecah permohonan pengadaan yang telah disetujui (oleh Perencanaan dan Bidang 2) menjadi beberapa paket pengadaan dengan menentukan MAK, penugasan PPK otomatis, metode, jenis, level (dengan opsi override langsung), upload dokumen, validasi pagu anggaran, serta mengunci permohonan setelah disubmit ke reviewer.

**Architecture:**
- **Backend Service Layer:** Menambahkan logika pemecahan pengadaan ke  `PengadaanService` : validasi status persetujuan induk, validasi pagu anggaran akumulatif permohonan, penugasan otomatis PPK dari relasi MAK, penentuan level otomatis dari nominal (dengan dukungan override), pengelolaan berkas dokumen pengadaan polymorphic, penyimpanan status `draft`, dan transisi status ke `menunggu_review` yang sekaligus mengunci permohonan dari penambahan/perubahan baru.
- **Controller & Routing:** Menambahkan endpoint resource/action di bawah prefix `ppbj`: `POST /ppbj/permohonan/{id}/pengadaan` (simpan draft paket), `DELETE /ppbj/pengadaan/{id}` (hapus draft paket), dan `POST /ppbj/permohonan/{id}/pengadaan/submit` (kirim semua paket ke reviewer dan kunci pengadaan).
- **Frontend Inertia/React:** Memperkaya `resources/js/Pages/Ppbj/Permohonan/Show.jsx` dan `PermohonanShowTemplate.jsx` dengan komponen formulir dinamis pemecahan pengadaan (`PengadaanSplitForm`), kalkulator sisa pagu anggaran permohonan realtime, pemilihan MAK dengan preview PPK otomatis, input override level, upload file dokumen, tabel daftar paket pengadaan dengan penanda status `draft` / `menunggu_review`, serta status terkunci (*locked/read-only state*) saat pengadaan telah disubmit ke reviewer.
- **Design & Code Standards:** Mematuhi `antislop-ui` (tanpa emoji dekoratif, warna brand Emerald `#0E7C5A`, surface `#FFFFFF` / border `#E4EBE8`, tap target minimal 44px, feedback error per-field yang jelas) dan `antislop-code` (tanpa komentar naratif/AI slop, hanya komentar arsitektural/esensial).

**Tech Stack:** PHP 8.5.x, Laravel 13, React 19, Inertia.js 3.x, Tailwind CSS v4, PostgreSQL 18 (prod) / SQLite (testing).

**Spec:** [docs/PRD.md](file:///d:/Farrel/PROJECTS/sipbaja/docs/PRD.md), [docs/DATABASE_SIPBAJA.md](file:///d:/Farrel/PROJECTS/sipbaja/docs/DATABASE_SIPBAJA.md), [docs/DESIGN.md](file:///d:/Farrel/PROJECTS/sipbaja/docs/DESIGN.md), [docs/DEVELOPMENT_RULES.md](file:///d:/Farrel/PROJECTS/sipbaja/docs/DEVELOPMENT_RULES.md).

## Global Constraints

- **Prasyarat Eksekusi:** Pemecahan pengadaan hanya dapat dilakukan jika permohonan berstatus disetujui oleh kedua tahap approval: `PERENCANAAN` dan `BIDANG2` (Q1).
- **Integritas Relasi MAK:** Foreign key gabungan `(permohonan_id, permohonan_mak_id)` wajib valid; pengadaan tidak boleh menggunakan MAK di luar permohonan terkait.
- **Penugasan PPK Otomatis:** `ppk_id` pada pengadaan otomatis diambil dari `maks.ppk_user_id` sesuai `permohonan_mak` yang dipilih (Q4).
- **Penentuan Level & Override:** Sistem otomatis menentukan `level_id` berdasarkan rentang nominal, namun PPBJ diizinkan meng-override langsung tanpa wajib mengisi alasan justifikasi (Q5, Q13).
- **Validasi Anggaran:** Total nominal semua paket pengadaan (draft + yang sudah ada) tidak boleh melebihi `estimasi_anggaran` permohonan. Validasi diterapkan langsung sejak penyimpanan draft (Q24, Q25 Opsi A).
- **Kelengkapan Dokumen:** Dokumen pengadaan wajib diunggah sebelum paket dikirim ke reviewer (`menunggu_review`) (Q10, Q19).
- **Penguncian Paket (Revisi Q7):** Ketika paket telah disubmit ke reviewer, status menjadi `menunggu_review` dan permohonan terkunci: PPBJ tidak dapat lagi menambah paket pengadaan baru maupun mengubah paket yang sudah dikirim (read-only).
- **Code Cleanliness & Style:** Format PHP divalidasi via `vendor/bin/pint --format agent`. Tidak ada komentar narasi workflow ("// Step 1") atau emoji di UI.

## Review Focus

1. **Pencegahan Bypass Anggaran:** Pengguna mencoba membuat draft dengan nominal yang jika dijumlahkan melampaui `estimasi_anggaran` permohonan (harus ditolak validasi 422 dengan pesan informatif).
2. **MAK Lintas Permohonan:** Memastikan input `permohonan_mak_id` benar-benar milik `permohonan_id` yang sedang diproses agar tidak melanggar foreign key constraint database.
3. **Pemberkasan Dokumen Multipart:** Pengunggahan file dokumen pengadaan (PDF/DOCX, max 10MB) tersimpan rapi di disk storage dan terdata di tabel `dokumen` dengan relasi polymorphic (`ref_type = 'pengadaan'`).
4. **Kondisi Read-Only / Terkunci:** Setelah tombol kirim ke reviewer ditekan, seluruh form input hilang/dinonaktifkan dan tombol aksi hapus/edit pada daftar paket ditiadakan.
5. **Akses Kontrol & Authorization:** User selain role `PPBJ` dilarang memicu endpoint pembuatan draft, penghapusan draft, atau submit paket ke reviewer (harus 403 Forbidden).

---

### Task 1: Backend Reference Data & Eligible Permohonan Status Checker

**Files:**
- Create: `app/Services/PengadaanService.php`
- Modify: `app/Services/PermohonanService.php`
- Test: `tests/Feature/PPBJ/PengadaanServiceTest.php`

**Interfaces:**
- Produces:
  ```php
  PengadaanService::getSplitContext(int $permohonanId): array
  // Return array shape:
  // [
  //     'bisaDipecah' => bool,
  //     'sudahDikunci' => bool,
  //     'sisaAnggaran' => float,
  //     'totalNominalPaket' => float,
  //     'availableMak' => array<array{id: int, permohonan_mak_id: int, kode: string, nama: string, ppk_id: int, ppk_nama: string}>,
  //     'referenceData' => array{
  //         'jenis' => array<array{id: int, nama: string}>,
  //         'metode' => array<array{id: int, nama: string}>,
  //         'level' => array<array{id: int, nama: string, min_nominal: float, max_nominal: ?float, perlu_review_pp: bool}>,
  //     }
  // ]
  ```

- [x] **Step 1: Write failing test for permohonan detail extension**

Tulis test di `tests/Feature/PPBJ/PengadaanServiceTest.php` untuk memverifikasi:
- Permohonan dengan approval Perencanaan & Bidang 2 `disetujui` memiliki `bisaDipecah = true`.
- Permohonan yang belum disetujui Perencanaan atau Bidang 2 memiliki `bisaDipecah = false`.
- Menghitung `sisaAnggaran = estimasiAnggaran - totalNominalPaket`.
- Mengembalikan daftar `availableMak` dengan informasi PPK penanggung jawab.
- Mengembalikan `referenceData` (`jenis`, `metode`, `level`).

- [x] **Step 2: Run test to verify it fails**

Run: `php artisan test tests/Feature/PPBJ/PengadaanServiceTest.php`
Expected: FAIL (missing fields in service output).

- [x] **Step 3: Implement data enhancement in `PengadaanService.php` and `PermohonanService.php`**

- Periksa relasi `Approvals`: cek apakah ada approval tahap `PERENCANAAN` dengan keputusan `disetujui` DAN tahap `BIDANG2` dengan keputusan `disetujui`.
- Cek status pengadaan yang ada: jika ada pengadaan dengan status selain `draft` (misal `menunggu_review` atau `review_pp`), set `sudahDikunci = true`.
- Ambil master referensi `JenisPengadaan`, `MetodePengadaan`, `LevelPengadaan`.
- Petakan `availableMak` dari `permohonan->PermohonanMak` beserta data user PPK dari `mak->Ppk`.

- [x] **Step 4: Run test to verify it passes**

Run: `php artisan test tests/Feature/PPBJ/PengadaanServiceTest.php`
Expected: PASS.

- [x] **Step 5: Format code with Pint**

Run: `vendor/bin/pint --format agent`

---

### Task 2: Store Draft Pengadaan Service & Validation (Multi-Package & Anggaran Check)

**Files:**
- Modify: `app/Services/PengadaanService.php`
- Test: `tests/Feature/PPBJ/PengadaanServiceTest.php`

**Interfaces:**
- Produces:
  ```php
  PengadaanService::simpanDraftPengadaan(int $permohonanId, array $paketItems, User $actor): array
  // $paketItems = [
  //     [
  //         'permohonan_mak_id' => int,
  //         'jenis_id' => int,
  //         'metode_id' => int,
  //         'nominal' => float,
  //         'level_id' => ?int, // jika null, auto-calculate dari nominal
  //         'dokumen' => ?UploadedFile,
  //     ]
  // ]
  ```

- [x] **Step 1: Write failing test for `simpanDraftPengadaan`**

Tambahkan skenario test di `tests/Feature/PPBJ/PengadaanServiceTest.php`:
- Penolakan jika permohonan belum disetujui (lempar `ValidationException` / `DomainException`).
- Penolakan jika total nominal paket melebihi `estimasi_anggaran` permohonan (Q24 & Q25 Opsi A).
- Berhasil membuat record `Pengadaan` dengan status `draft` dan penugasan `ppk_id` otomatis dari MAK.
- Perhitungan `level_id` otomatis jika tidak dioverride oleh input user.
- Pengunggahan file dokumen masuk ke tabel `dokumen` dengan `ref_type = 'pengadaan'`.

- [x] **Step 2: Run test to verify it fails**

Run: `php artisan test tests/Feature/PPBJ/PengadaanServiceTest.php --filter=test_simpan_draft_pengadaan`
Expected: FAIL (`simpanDraftPengadaan` not defined).

- [x] **Step 3: Implement `simpanDraftPengadaan` in `PengadaanService.php`**

- Gunakan `DB::transaction` untuk menjamin konsistensi multi-row insert.
- Validasi status permohonan (`bisaDipecah` dan `!sudahDikunci`).
- Hitung total nominal existing paket + nominal baru. Jika `> estimasi_anggaran`, lemparkan `ValidationException::withMessages(['nominal' => 'Total nominal paket melebihi estimasi anggaran permohonan.'])`.
- Tentukan `level_id`: cari di `LevelPengadaan` berdasarkan `min_nominal` dan `max_nominal` jika user tidak mengirimkan `level_id`.
- Simpan dokumen pengadaan ke storage disk `public` / `local` dan buat baris di tabel `dokumen`.

- [x] **Step 4: Run test to verify it passes**

Run: `php artisan test tests/Feature/PPBJ/PengadaanServiceTest.php`
Expected: PASS.

- [x] **Step 5: Format code with Pint**

Run: `vendor/bin/pint --format agent`

---

### Task 3: Delete Draft Pengadaan & Submit to Reviewer (Lock Mechanism)

**Files:**
- Modify: `app/Services/PengadaanService.php`
- Test: `tests/Feature/PPBJ/PengadaanServiceTest.php`

**Interfaces:**
- Produces:
  ```php
  PengadaanService::hapusDraftPengadaan(int $pengadaanId, User $actor): void
  PengadaanService::submitKeReviewer(int $permohonanId, User $actor): void
  ```

- [x] **Step 1: Write failing test for delete draft and submit to reviewer**

Tambahkan skenario test di `tests/Feature/PPBJ/PengadaanServiceTest.php`:
- `hapusDraftPengadaan`: hanya mengizinkan penghapusan jika status paket adalah `draft`. Jika bukan `draft`, lemparkan exception.
- `submitKeReviewer`:
  - Gagal jika ada paket yang belum memiliki dokumen pengadaan terunggah (Q10, Q19).
  - Gagal jika ada paket dengan field wajib kosong.
  - Mengubah status semua paket dari `draft` menjadi `menunggu_review`.
  - Mengunci permohonan: percobaan menambah paket baru atau menghapus paket setelah submit ditolak (Revisi Q7).

- [x] **Step 2: Run test to verify it fails**

Run: `php artisan test tests/Feature/PPBJ/PengadaanServiceTest.php --filter=test_submit_ke_reviewer`
Expected: FAIL.

- [x] **Step 3: Implement delete and submit in `PengadaanService.php`**

- `hapusDraftPengadaan(int $pengadaanId, User $actor)`:
  - Cari pengadaan: jika `status !== 'draft'`, tolak.
  - Hapus dokumen terkait dan hapus record pengadaan.
- `submitKeReviewer(int $permohonanId, User $actor)`:
  - Ambil semua pengadaan pada permohonan tersebut.
  - Pastikan minimal ada 1 paket dan semua berstatus `draft`.
  - Periksa setiap paket memiliki minimal 1 `Dokumen` (`tipe_dokumen = 'dokumen_pengadaan'`).
  - Update status seluruh paket pengadaan menjadi `menunggu_review`.
  - Catat riwayat status di `StatusHistory` (polymorphic untuk setiap pengadaan).

- [x] **Step 4: Run test to verify it passes**

Run: `php artisan test tests/Feature/PPBJ/PengadaanServiceTest.php`
Expected: PASS.

- [x] **Step 5: Format code with Pint**

Run: `vendor/bin/pint --format agent`

---

### Task 4: Controller Endpoints & Feature HTTP Tests for PPBJ

**Files:**
- Modify: `routes/web.php`
- Modify: `app/Http/Controllers/PPBJ/PermohonanController.php`
- Create: `app/Http/Requests/PPBJ/StoreDraftPengadaanRequest.php`
- Test: `tests/Feature/PPBJ/PengadaanSplitControllerTest.php`

**Interfaces:**
- Routes:
  - `POST /ppbj/permohonan/{id}/pengadaan/draft` -> `PermohonanController@storeDraft`
  - `DELETE /ppbj/pengadaan/{id}` -> `PermohonanController@destroyDraft`
  - `POST /ppbj/permohonan/{id}/pengadaan/submit` -> `PermohonanController@submitReviewer`

- [x] **Step 1: Write failing controller feature test**

Tulis test di `tests/Feature/PPBJ/PengadaanSplitControllerTest.php`:
- Guest diredirect ke login.
- User non-PPBJ ditolak (403 Forbidden).
- User PPBJ berhasil mengirim request store draft pengadaan multipart.
- User PPBJ berhasil menghapus draft paket.
- User PPBJ berhasil men-submit pengadaan ke reviewer.
- User PPBJ dilarang menambah paket jika pengadaan sudah disubmit ke reviewer.

- [x] **Step 2: Run test to verify it fails**

Run: `php artisan test tests/Feature/PPBJ/PengadaanSplitControllerTest.php`
Expected: FAIL (routes/endpoints not found).

- [x] **Step 3: Implement Request, Routes, and Controller methods**

- Buat `app/Http/Requests/PPBJ/StoreDraftPengadaanRequest.php` dengan validasi:
  - `items`: array required min 1
  - `items.*.permohonan_mak_id`: required integer
  - `items.*.jenis_id`: required integer
  - `items.*.metode_id`: required integer
  - `items.*.nominal`: required numeric min 1
  - `items.*.level_id`: nullable integer
  - `items.*.dokumen`: nullable file mimes:pdf,doc,docx max:10240
- Daftarkan route di grup prefix `ppbj` pada `routes/web.php`.
- Tambahkan method `storeDraft`, `destroyDraft`, dan `submitReviewer` di `PermohonanController.php` yang mendelegasikan proses ke `PengadaanService` dan mereturn redirect back dengan flash message.

- [x] **Step 4: Run test to verify it passes**

Run: `php artisan test tests/Feature/PPBJ/PengadaanSplitControllerTest.php`
Expected: PASS.

- [x] **Step 5: Format code with Pint**

Run: `vendor/bin/pint --format agent`

---

### Task 5: Frontend UI — Pengadaan Split Form Component (Atomic Design & Antislop)

**Files:**
- Create: `resources/js/components/molecules/PengadaanSplitRow.jsx`
- Create: `resources/js/components/organisms/PengadaanSplitForm.jsx`
- Modify: `resources/js/components/templates/PermohonanShowTemplate.jsx`
- Modify: `resources/js/Pages/Ppbj/Permohonan/Show.jsx`

- [x] **Step 1: Create `PengadaanSplitRow.jsx` (Molecule)**

Komponen baris/card untuk satu item paket pengadaan dalam form:
- Pilihan MAK (dropdown dengan indikator nama MAK & kode).
- Display otomatis penanggung jawab PPK sesuai MAK terpilih (badge teks netral, bukan editable).
- Input Nominal (dengan format rupiah otomatis saat diketik).
- Pilihan Jenis Pengadaan (Barang, Jasa, Konstruksi).
- Pilihan Metode Pengadaan (Inaproc, SPSE, Tender, Non-Tender).
- Pilihan Level Pengadaan (otomatis terpilih berdasarkan batas nominal di `referenceData.level`, namun dropdown tetap dapat diubah langsung oleh PPBJ tanpa alasan).
- Input File Dokumen Pengadaan (custom styled file upload dengan nama file terpilih, batas 10MB).
- Tombol Hapus Baris (hanya muncul jika baris > 1).
- Mengikuti aturan `antislop-ui`: tidak menggunakan border radius berlebihan, tanpa emoji dekoratif, tap target minimal 44px, border `#E4EBE8`.

- [x] **Step 2: Create `PengadaanSplitForm.jsx` (Organism)**

Komponen form utama pembungkus pemecahan pengadaan:
- Ringkasan pagu realtime: Pagu Total, Total Terpakai (existing + form draft), dan Sisa Pagu Anggaran dengan highlight warna Emerald `#0E7C5A` jika aman atau Merah `#D92D20` jika defisit/melampaui pagu.
- Tombol "+ Tambah Paket Pengadaan" untuk menambah row dinamis baru.
- Tombol "Simpan Sebagai Draft" (disabled jika form invalid atau total melampaui pagu anggaran).
- Menggunakan Inertia `useForm` multipart data submission ke route `ppbj.permohonan.pengadaan.draft`.
- Menampilkan pesan error validasi per baris dan per field secara jelas.

- [x] **Step 3: Update `PermohonanShowTemplate.jsx` & Locked State Integration**

- Masukkan `PengadaanSplitForm` di bawah daftar MAK.
- Tampilkan form HANYA JIKA `permohonan.bisaDipecah === true` dan `permohonan.sudahDikunci === false`.
- Jika `permohonan.bisaDipecah === false`, tampilkan info banner netral: *"Permohonan belum dapat dipecah menjadi pengadaan karena menunggu persetujuan dari Perencanaan dan Bidang 2."*
- Jika `permohonan.sudahDikunci === true`, tampilkan banner informatif sukses: *"Seluruh paket pengadaan telah disubmit ke reviewer. Paket telah dikunci dan tidak dapat ditambah atau diubah lagi."* (Revisi Q7).

- [x] **Step 4: Verify Frontend Build**

Run: `npm.cmd run build`
Expected: Berhasil dikompilasi tanpa galat sintaks atau Vite manifest error.

---

### Task 6: Frontend UI — Pengadaan List Enhancement & Reviewer Submission Action

**Files:**
- Modify: `resources/js/components/molecules/PermohonanShowPaketList.jsx`
- Modify: `resources/js/components/templates/PermohonanShowTemplate.jsx`

- [x] **Step 1: Enhance `PermohonanShowPaketList.jsx`**

- Tampilkan rincian paket pengadaan lengkap: Nomor/Kode Paket, MAK, PPK Penanggung Jawab, Nominal, Jenis, Metode, Level, dan Status Dokumen (ada file / belum ada file).
- Tampilkan status badge: `draft` (badge netral/amber) dan `menunggu_review` (badge info biru/emerald).
- Tambahkan aksi Hapus untuk paket berstatus `draft` dengan dialog konfirmasi yang aman.
- Jika `permohonan.sudahDikunci === true`, sembunyikan kolom aksi dan tampilkan daftar dalam mode read-only murni.

- [x] **Step 2: Add "Kirim ke Reviewer" Header Action**

- Di bagian header card "Daftar Paket Pengadaan", tambahkan tombol utama **"Kirim ke Reviewer"**.
- Tombol aktif hanya jika:
  - Ada minimal 1 paket berstatus `draft`.
  - Semua paket `draft` sudah memiliki dokumen pengadaan dan data lengkap.
  - `permohonan.sudahDikunci === false`.
- Saat diklik, muncul modal/konfirmasi dialog: *"Apakah Anda yakin ingin mengirim semua paket ke reviewer? Setelah dikirim, Anda tidak dapat menambah atau mengubah paket lagi."*
- Trigger request Inertia POST ke `/ppbj/permohonan/{id}/pengadaan/submit`.

- [x] **Step 3: Verify Frontend Build & Visual Layout**

Run: `npm.cmd run build`
Expected: Build sukses tanpa peringatan.

---

### Task 7: End-to-End Verification & Formatting Gate

**Files:**
- Test: All tests in `tests/Feature/PPBJ/`

- [x] **Step 1: Run comprehensive PHPUnit test suite**

Run: `php artisan test --filter=PPBJ`
Expected: All tests pass (Service tests, Controller tests, RBAC tests).

- [x] **Step 2: Run Pint Code Formatter**

Run: `vendor/bin/pint --format agent`
Expected: No dirty unformatted PHP files.

- [x] **Step 3: Verify Antislop & UI Compliance**

- Periksa kode JS/JSX: tidak ada emoji dekoratif (`🚀`, `✅`, dsb), tidak ada console log tertinggal.
- Periksa komentar PHP: tidak ada narasi AI slop ("// Step 1: Validate input"), hanya komentar esensial.
- Validasi tap target, kontras warna, dan responsivitas layout di mobile dan desktop.
