# PPBJ Master Seeders, Comprehensive Dummy Data, & Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menyediakan seeder master referensi permanen, dataset dummy komprehensif untuk seluruh spektrum fitur role PPBJ (5 skenario siklus pengadaan), dan mengimplementasikan antarmuka Dashboard PPBJ berbasis Service Layer, Custom Hook, dan Atomic Design sesuai panduan [DESIGN.md](file:///d:/Farrel/PROJECTS/sipbaja/docs/DESIGN.md) dan [DEVELOPMENT_RULES.md](file:///d:/Farrel/PROJECTS/sipbaja/docs/DEVELOPMENT_RULES.md).

**Architecture:** 
- Backend: `MasterReferenceSeeder` mengisi data statis master (4 akun PPK, `maks`, `jenis_pengadaan`, `metode_pengadaan`, `level_pengadaan`). `PpbjDummySeeder` menyuntikkan data transaksi 5 skenario hulu & hilir PPBJ. `PpbjDashboardService` mengekstrak metrik stat card serta kumpulan data antrean permohonan, pengadaan berjalan, dan termin kontrak.
- Frontend: Inertia React 19 + Tailwind CSS v4. Pemisahan ketat: `usePpbjDashboard` mengelola state tab aktif dan pencarian/filter; template `PpbjDashboardTemplate` bersifat murni presentasional; `Pages/Ppbj/Dashboard.jsx` bertindak sebagai *glue layer*.

**Tech Stack:** PHP 8.5.x, Laravel 13, React 19, Inertia.js 3.x, Tailwind CSS v4, SQLite (dev) / PostgreSQL 18 (prod).

**Spec:** [docs/PRD.md](file:///d:/Farrel/PROJECTS/sipbaja/docs/PRD.md), [docs/DATABASE_SIPBAJA.md](file:///d:/Farrel/PROJECTS/sipbaja/docs/DATABASE_SIPBAJA.md), [docs/DESIGN.md](file:///d:/Farrel/PROJECTS/sipbaja/docs/DESIGN.md), [docs/DEVELOPMENT_RULES.md](file:///d:/Farrel/PROJECTS/sipbaja/docs/DEVELOPMENT_RULES.md).

## Global Constraints

- Backend business logic wajib berada di Service Layer (`app/Services/`), Controller hanya memanggil Service dan mengembalikan response Inertia.
- Skema database 100% mengikuti [DATABASE_SIPBAJA.md](file:///d:/Farrel/PROJECTS/sipbaja/docs/DATABASE_SIPBAJA.md) tanpa DB triggers atau fitur spesifik PostgreSQL (harus kompatibel SQLite).
- Frontend menerapkan Atomic Design satu arah (`atoms -> molecules -> organisms -> templates -> pages`). Dilarang meletakkan `useState` logika filter/data bisnis di dalam template.
- Desain visual strictly mengikuti [DESIGN.md](file:///d:/Farrel/PROJECTS/sipbaja/docs/DESIGN.md):
  - Brand hue: `#0E7C5A` (Emerald solid, tanpa gradien).
  - Background canvas: `#F3F6F5`, Card surface: `#FFFFFF`, Border: `#E4EBE8`.
  - Bayangan lembut berbasis hijau: `rgba(13, 51, 38, a)`.
  - Tipografi: Plus Jakarta Sans, Bahasa Indonesia, sentence case (kecuali header tabel/eyebrow UPPERCASE).
- Aturan `antislop`: dilarang menggunakan karakter em dash (`—`) pada copy UI, tidak ada komentar dekoratif, tap target minimal 44px di mobile.

## Review Focus

1. **Kelengkapan 4 Akun PPK:** Memastikan 4 akun PPK dibuat sesuai MAK (BLU Fisik, BLU Non-Fisik, RM Fisik, RM Non-Fisik) dengan relasi `maks.ppk_user_id` yang valid.
2. **Kesesuaian 5 Skenario Transaksi PPBJ:** Setiap skenario memiliki data di tabel yang sesuai (`permohonan`, `permohonan_mak`, `approval_permohonan`, `pengadaan`, `kontrak`, `rencana_pembayaran`, `pembayaran`) dengan konsistensi status dan nomor revisi.
3. **Integritas Nominal & Relasi MAK:** Setiap `pengadaan` terikat ke `permohonan_mak` yang valid, dan level pengadaan (<50jt, 50-200jt, >200jt) terpasang akurat sesuai nominal.
4. **Pemisahan Logika & Presentasi UI:** Dashboard template tidak mengkalkulasi filter atau menyimpan data mentah di `useState`. Semua interaksi tab dan pencarian ditangani oleh custom hook.
5. **Responsif & Kontras Warna:** Tiga stat card dan tabbed table dapat menyesuaikan diri dari desktop (1440px) hingga mobile (<768px) tanpa horizontal overflow.

---

### Task 1: Master Reference Seeder (4 Akun PPK, MAK, Jenis, Metode, Level Pengadaan)

**Files:**
- Create: `database/seeders/MasterReferenceSeeder.php`
- Modify: `database/seeders/DatabaseSeeder.php`
- Test: `tests/Feature/MasterReferenceSeederTest.php`

**Interfaces:**
- Produces: Data master di tabel `roles` (PPK), `users` (4 PPK), `maks` (4 MAK terhubung ke masing-masing PPK), `jenis_pengadaan` (Barang, Jasa, Konstruksi), `metode_pengadaan` (Inaproc, SPSE, Tender, Non-Tender), dan `level_pengadaan` (<50jt, 50-200jt perlu review PP, >200jt).

- [x] **Step 1: Write the failing test**

Buat file `tests/Feature/MasterReferenceSeederTest.php` yang memverifikasi bahwa setelah `MasterReferenceSeeder` dijalankan:
- Terdapat 4 user dengan role PPK: `ppk.blufisik@pnj.ac.id`, `ppk.blunonfisik@pnj.ac.id`, `ppk.rmfisik@pnj.ac.id`, `ppk.rmnonfisik@pnj.ac.id`.
- Terdapat 4 record di tabel `maks` dengan nama `BLU Fisik`, `BLU Non-Fisik`, `RM Fisik`, `RM Non-Fisik`, masing-masing terhubung ke PPK yang tepat.
- Terdapat 3 record `jenis_pengadaan`: `Barang`, `Jasa`, `Konstruksi`.
- Terdapat 4 record `metode_pengadaan`: `Inaproc`, `SPSE`, `Tender`, `Non-Tender`.
- Terdapat 3 record `level_pengadaan` dengan batasan nominal dan flag `perlu_review_pp` yang tepat.

- [x] **Step 2: Run test to verify it fails**

Run: `php artisan test tests/Feature/MasterReferenceSeederTest.php`
Expected: FAIL (class `MasterReferenceSeeder` does not exist).

- [x] **Step 3: Implement `MasterReferenceSeeder.php`**

Implementasikan `database/seeders/MasterReferenceSeeder.php`:
- Menggunakan `updateOrCreate` agar idempoten.
- Daftarkan `MasterReferenceSeeder::class` di dalam `database/seeders/DatabaseSeeder.php`.

- [x] **Step 4: Run test to verify it passes**

Run: `php artisan test tests/Feature/MasterReferenceSeederTest.php`
Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add database/seeders/MasterReferenceSeeder.php database/seeders/DatabaseSeeder.php tests/Feature/MasterReferenceSeederTest.php
git commit -m "feat(seeder): add master reference seeder for ppk, maks, and procurement levels"
```

---

### Task 2: Comprehensive `PpbjDummySeeder` Covering All 5 Scenarios

**Files:**
- Create: `database/seeders/PpbjDummySeeder.php`
- Test: `tests/Feature/PpbjDummySeederTest.php`

**Interfaces:**
- Consumes: Data master dari `MasterReferenceSeeder` (MAK, Unit, User PPK/Pemohon/Perencanaan/Bidang 2).
- Produces: Data pengujian pada tabel `permohonan`, `permohonan_mak`, `approval_permohonan`, `pengadaan`, `approval_pengadaan`, `kontrak`, `rencana_pembayaran`, `reminder`, `pembayaran`, dan `dokumen`.

- [x] **Step 1: Write the failing test**

Buat file `tests/Feature/PpbjDummySeederTest.php` yang menguji keberadaan 5 skenario data setelah `PpbjDummySeeder` dipanggil:
- **Skenario 1:** Permohonan `PRM-PPBJ-001` berstatus siap dipaketkan (approval Bidang 2 disetujui, MAK terpilih, tidak memiliki relasi `pengadaan`).
- **Skenario 2:** Permohonan `PRM-PPBJ-002` memiliki 3 paket pengadaan aktif (level <50jt, 50-200jt dengan status review PP, dan >200jt) serta 1 paket dengan riwayat revisi (`revisi_ke = 1`).
- **Skenario 3:** Paket pengadaan `PGD-PPBJ-003` berstatus disetujui review PP & PPK (dengan bukti tanda tangan), belum memiliki baris `kontrak`.
- **Skenario 4:** Paket pengadaan `PGD-PPBJ-004` memiliki `kontrak`, 3 termin di `rencana_pembayaran`, dan `reminder`.
- **Skenario 5:** Termin pembayaran pada `PGD-PPBJ-005` memiliki record `pembayaran` berstatus `menunggu_ppk` atau `menunggu_bidang2` dengan dokumen berkas bayar terlampir.

- [x] **Step 2: Run test to verify it fails**

Run: `php artisan test tests/Feature/PpbjDummySeederTest.php`
Expected: FAIL (class `PpbjDummySeeder` does not exist).

- [x] **Step 3: Implement `PpbjDummySeeder.php`**

Tulis logika seeder di `database/seeders/PpbjDummySeeder.php` yang membangun ke-5 skenario transaksi tersebut secara konsisten:
- Gunakan transaksi database atau pemanggilan model terurut untuk menjaga integritas foreign key gabungan `(permohonan_id, permohonan_mak_id)`.
- Pastikan nominal termin sama persis dengan total nominal pengadaan/kontrak.
- Daftarkan dokumen pendukung dummy di tabel `dokumen`.

- [x] **Step 4: Run test to verify it passes**

Run: `php artisan test tests/Feature/PpbjDummySeederTest.php`
Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add database/seeders/PpbjDummySeeder.php tests/Feature/PpbjDummySeederTest.php
git commit -m "feat(seeder): implement comprehensive ppbj dummy seeder covering 5 scenarios"
```

---

### Task 3: Backend Service Layer & Controller for PPBJ Dashboard

**Files:**
- Create: `app/Services/PpbjDashboardService.php`
- Modify: `app/Http/Controllers/DashboardPpbjController.php`
- Test: `tests/Feature/PpbjDashboardTest.php`

**Interfaces:**
- Produces: `PpbjDashboardService::getDashboardData(): array`
  ```php
  [
      'stats' => [
          ['label' => 'Permohonan Masuk', 'value' => int, 'unit' => 'Permohonan', 'variant' => 'info'],
          ['label' => 'Pengadaan Berjalan', 'value' => int, 'unit' => 'Paket', 'variant' => 'warning'],
          ['label' => 'Termin Siap Bayar', 'value' => int, 'unit' => 'Termin', 'variant' => 'success'],
      ],
      'permohonanMasuk' => [...],
      'pengadaanBerjalan' => [...],
      'terminKontrak' => [...]
  ]
  ```
- Route: `GET /ppbj/dashboard` mengembalikan render Inertia `Ppbj/Dashboard` dengan data props di atas.

- [x] **Step 1: Write the failing test**

Buat `tests/Feature/PpbjDashboardTest.php`:
- Memverifikasi user non-PPBJ atau tamu dilarang mengakses `/ppbj/dashboard` (redirect atau 403).
- Memverifikasi user PPBJ dapat mengakses `/ppbj/dashboard` dan menerima props `stats`, `permohonanMasuk`, `pengadaanBerjalan`, dan `terminKontrak` dari `PpbjDashboardService`.

- [x] **Step 2: Run test to verify it fails**

Run: `php artisan test tests/Feature/PpbjDashboardTest.php`
Expected: FAIL (props kosong atau service belum ada).

- [x] **Step 3: Implement `PpbjDashboardService.php` and update Controller**

- Buat `app/Services/PpbjDashboardService.php`:
  - `hitungStats(): array`
  - `ambilPermohonanMasuk(): Collection` (permohonan yang sudah disetujui Bidang 2, dengan relasi unit, permohonan_mak, dan belum memiliki pengadaan selesai).
  - `ambilPengadaanBerjalan(): Collection` (pengadaan dengan relasi mak, level, metode, ppk, dan status review).
  - `ambilTerminKontrak(): Collection` (kontrak dengan rencana pembayaran termin dan reminder).
- Update `app/Http/Controllers/DashboardPpbjController.php`:
  - Inject `PpbjDashboardService` dan kirimkan hasil `getDashboardData()` ke `Inertia::render('Ppbj/Dashboard', ...)`.

- [x] **Step 4: Run test to verify it passes**

Run: `php artisan test tests/Feature/PpbjDashboardTest.php`
Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add app/Services/PpbjDashboardService.php app/Http/Controllers/DashboardPpbjController.php tests/Feature/PpbjDashboardTest.php
git commit -m "feat(ppbj): add dashboard service and wire props to controller"
```

---

### Task 4: Frontend Custom Hook, Util, & Tabbed Dashboard UI Components

**Files:**
- Create: `resources/js/utils/formatters.js`
- Create: `resources/js/hooks/usePpbjDashboard.js`
- Create: `resources/js/components/atoms/StatusPill.jsx`
- Create: `resources/js/components/molecules/PpbjTabbedTable.jsx`
- Create: `resources/js/components/templates/PpbjDashboardTemplate.jsx`
- Modify: `resources/js/Pages/Ppbj/Dashboard.jsx`

**Interfaces:**
- `formatRupiah(number): string`
- `formatTanggalIndo(dateString): string`
- `usePpbjDashboard({ permohonanMasuk, pengadaanBerjalan, terminKontrak })` mengembalikan `{ activeTab, setActiveTab, searchQuery, setSearchQuery, filteredItems, stats }`
- `PpbjDashboardTemplate` menerima props murni tanpa business logic di dalamnya.

- [x] **Step 1: Implement `formatters.js` and `usePpbjDashboard.js`**

- Tulis util `resources/js/utils/formatters.js` untuk format mata uang Rupiah (`Rp 150.000.000`) dan format tanggal Indonesia.
- Tulis custom hook `resources/js/hooks/usePpbjDashboard.js` dengan stateful logic pencarian teks dan pergantian tab (`tab: 'permohonan' | 'pengadaan' | 'termin'`).

- [x] **Step 2: Implement UI components (`StatusPill`, `PpbjTabbedTable`, `PpbjDashboardTemplate`)**

- `StatusPill.jsx`: Mengikuti [DESIGN.md](file:///d:/Farrel/PROJECTS/sipbaja/docs/DESIGN.md) (Menunggu Verifikasi: `#E8F0FF` / `#1F55C7`, Disetujui: `#E4F6EC` / `#0B7A4E`, Ditolak: `#FDECEC` / `#B42318`).
- `PpbjTabbedTable.jsx`: Tabel dengan tab bar (3 tab), header row `#F1F7F4`, baris data hover `#F7FAF9`, dan tombol aksi.
- `PpbjDashboardTemplate.jsx`: Menerapkan Hero Banner (emerald `#0E7C5A`, radius 24, 2 lingkaran dekoratif transparan), 3 Stat Cards (radius 18, border `#E4EBE8`, icon box 56), dan `PpbjTabbedTable`.

- [x] **Step 3: Update `Pages/Ppbj/Dashboard.jsx` as Glue Layer**

Hubungkan props dari Inertia (`stats`, `permohonanMasuk`, `pengadaanBerjalan`, `terminKontrak`) ke `usePpbjDashboard`, lalu operkan ke `PpbjDashboardTemplate`.

- [x] **Step 4: Build asset with Vite to verify no syntax/bundling errors**

Run: `npm run build`
Expected: Build sukses tanpa error atau manifest warning.

- [x] **Step 5: Commit**

```bash
git add resources/js/utils/formatters.js resources/js/hooks/usePpbjDashboard.js resources/js/components/atoms/StatusPill.jsx resources/js/components/molecules/PpbjTabbedTable.jsx resources/js/components/templates/PpbjDashboardTemplate.jsx resources/js/Pages/Ppbj/Dashboard.jsx
git commit -m "feat(ppbj): build responsive tabbed dashboard template and atomic components"
```

---

### Task 5: End-to-End Verification, Code Formatting, & Documentation

**Files:**
- Modify: `README.md` (jika ada catatan seeder baru)

- [x] **Step 1: Execute all tests**

Run: `php artisan test`
Expected: Seluruh unit dan feature tests lulus (0 failures).

- [x] **Step 2: Run Pint Code Formatter**

Run: `vendor/bin/pint --format agent`
Expected: Seluruh kode PHP sesuai standar PSR-12 dan aturan project.

- [x] **Step 3: Verify Seeders Execution in Fresh Database**

Run: `php artisan migrate:fresh --seed`
Run: `php artisan db:seed --class=PpbjDummySeeder`
Expected: Migrasi dan seeding berjalan mulus tanpa error foreign key atau constraint violation.

- [x] **Step 4: Commit**

```bash
git add .
git commit -m "chore(ppbj): format code with pint and verify end-to-end test suite"
```
