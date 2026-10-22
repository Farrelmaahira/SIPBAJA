# SIPBAJA (Sistem Informasi Pengadaan Barang dan Jasa)

SIPBAJA adalah aplikasi web monolitik terpusat berbasis **Laravel 13 + React (Inertia.js)** yang mendigitalkan seluruh alur pengadaan barang dan jasa di lingkungan kampus. Sistem ini menyelesaikan kendala fragmentasi dokumen, lambatnya pelacakan manual antar-unit, kepatuhan batas nominal pengadaan, serta memastikan penegakan aturan persetujuan bertingkat (*tiered approval*) dan verifikasi ganda (*dual approval*) sebelum pembayaran dapat dicairkan.

---

## Fitur Utama

- **Autentikasi & Dynamic RBAC:** Kontrol akses berbasis peran (Pemohon, Perencanaan, Bidang 2/WD2, PPBJ, PP, PPK, Perlengkapan, Keuangan, Admin) dengan dashboard dan izin spesifik.
- **Pengajuan Permohonan Pengadaan:** Pemohon dapat mengajukan dokumen pengadaan, mengunggah berkas lampiran, dan melakukan revisi berkas tanpa menghapus versi lama.
- **Verifikasi Anggaran & Manajemen MAK:** Perencanaan memverifikasi ketersediaan anggaran dan menentukan MAK yang relevan.
- **Persetujuan Bertingkat (Tiered Approval):** Validasi persetujuan berjenjang dari Bidang 2 dengan unggahan memo resmi atau penolakan disertai alasan.
- **Manajemen Paket Pengadaan & Plotting PPK:** PPBJ memecah permohonan ke dalam paket pengadaan, menentukan level nominal (<50jt, 50–200jt, >200jt), metode, serta menetapkan 1 dari 4 akun PPK sesuai jenis MAK.
- **Review Dokumen Pengadaan:** Review oleh Pejabat Pengadaan (PP) untuk nominal 50–200 juta dan penandatanganan oleh PPK di semua level nominal.
- **Penerbitan Kontrak & Termin Pembayaran:** PPBJ menerbitkan SPK/Kontrak/Surat Pesanan dan menetapkan rencana termin pembayaran beserta tanggal reminder.
- **Penerimaan Barang:** Perlengkapan mendokumentasikan foto serah terima barang dan berita acara penerimaan resmi.
- **Realisasi Pembayaran & Verifikasi Ganda (Dual Approval):** Pembayaran termin wajib disetujui secara paralel/ganda oleh PPK dan Bidang 2 sebelum berkas dapat diproses dan dibayarkan oleh Keuangan.
- **Pelacakan Status Berbasis Unit & Audit Trail:** Riwayat status lengkap dicatat per perubahan aktor, dengan visibilitas data dibatasi per unit kerja (`unit_id`).

---

## Tech Stack

| Lapisan | Teknologi | Keterangan |
|---|---|---|
| **Backend Framework** | Laravel 13 | Monolitik via Inertia protocol |
| **Bahasa Pemrograman** | PHP 8.5.x (min. PHP 8.3) | Standar PSR-12, constructor promotion, strict typing |
| **Frontend Framework** | React 19 + Inertia.js 3.x | Single Page Application tanpa REST API terpisah |
| **Styling** | Tailwind CSS v4 | Berdasarkan *SIPBAJA Design System* (Emerald `#0E7C5A`) |
| **Database (Dev)** | SQLite | Cepat untuk pengembangan lokal dan CI |
| **Database (Target Prod)** | PostgreSQL 18 | Relasional murni, kompatibel dengan SQLite tanpa DB triggers |
| **Build Tool** | Vite 8 + Laravel Vite Plugin | Hot module replacement & asset bundling |

---

## Prasyarat Sistem

Sebelum memulai instalasi, pastikan dependensi berikut telah terpasang pada komputer Anda:

- **PHP**: `^8.3` (Disarankan PHP 8.5.x) dengan ekstensi `pdo`, `pdo_sqlite`, `pdo_pgsql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `curl`.
- **Composer**: `v2.x`
- **Node.js**: `v20.x` atau `v22.x` (LTS)
- **NPM**: `v10.x` atau lebih baru
- **Git**

---

## Langkah Instalasi

Jalankan perintah berikut secara berurutan di terminal:

```bash
# 1. Clone repositori
git clone https://github.com/Farrelmaahira/SIPBAJA.git
cd SIPBAJA

# 2. Pasang dependensi PHP
composer install

# 3. Salin file environment
cp .env.example .env

# 4. Generate Application Key
php artisan key:generate

# 5. Siapkan database SQLite dan jalankan migrasi
touch database/database.sqlite
php artisan migrate --seed

# 6. Pasang dependensi Node.js
npm install

# 7. Build asset frontend
npm run build
```

---

## Konfigurasi (.env)

Pastikan variabel penting pada berkas `.env` disesuaikan:

```env
APP_NAME=SIPBAJA
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_URL=http://localhost:8000

# Konfigurasi Database Lokal (SQLite)
DB_CONNECTION=sqlite
# DB_DATABASE=/path/to/database/database.sqlite

# Atau Target Produksi (PostgreSQL)
# DB_CONNECTION=pgsql
# DB_HOST=127.0.0.1
# DB_PORT=5432
# DB_DATABASE=sipbaja
# DB_USERNAME=postgres
# DB_PASSWORD=secret

# Session & Storage
SESSION_DRIVER=database
SESSION_LIFETIME=60
FILESYSTEM_DISK=local
```

> **Catatan:** Migrasi dan query dilarang menggunakan fitur PostgreSQL-spesifik (seperti JSONB operators, arrays, DB triggers) agar tetap 100% kompatibel dengan SQLite.

---

## Cara Penggunaan

### Menjalankan Server Pengembangan

Jalankan server backend dan Vite frontend secara bersamaan:

```bash
# Menjalankan artisan serve dan vite dev secara paralel
composer run dev
```

Atau jalankan di dua terminal terpisah:

```bash
# Terminal 1: Backend Laravel
php artisan serve

# Terminal 2: Vite Dev Server
npm run dev
```

Buka peramban di `http://localhost:8000`.

### Rute & Endpoint Halaman Utama

Aplikasi SIPBAJA menggunakan arsitektur monolitik Inertia.js (bukan public REST API). Seluruh rute dilindungi oleh middleware `auth` dan `role`:

| Endpoint / URL | Method | Peran Akses | Deskripsi |
|---|---|---|---|
| `/` | `GET` | Guest | Halaman Login SIPBAJA |
| `/login` | `POST` | Guest | Proses autentikasi pengguna |
| `/logout` | `POST` | Auth | Mengakhiri sesi login |
| `/admin/dashboard` | `GET` | Admin | Dashboard Admin & statistik sistem |
| `/admin/pengguna` | `GET/POST/PUT/DELETE` | Admin | Manajemen akun pengguna |
| `/admin/unit-kerja` | `GET/POST/PUT/DELETE` | Admin | Manajemen referensi unit/jurusan |
| `/admin/mak` | `GET/POST/PUT/DELETE` | Admin | Pemetaan 4 MAK ke PPK penanggung jawab |
| `/admin/role-permission` | `GET/PUT` | Admin | Pengaturan matrix izin hak akses dinamis |
| `/pemohon/dashboard` | `GET` | Pemohon | Dashboard & monitoring permohonan unit |
| `/perencanaan/dashboard` | `GET` | Perencanaan | Verifikasi anggaran & penentuan MAK |
| `/bidang-2/dashboard` | `GET` | Bidang 2 | Persetujuan awal permohonan & approval pembayaran |
| `/ppbj/dashboard` | `GET` | PPBJ | Pemaketan pengadaan, kontrak, & jadwal termin |
| `/pp/dashboard` | `GET` | PP | Review dokumen pengadaan nominal 50–200 juta |
| `/ppk/dashboard` | `GET` | PPK | Review & penandatanganan berkas dan approval termin |
| `/perlengkapan/dashboard`| `GET` | Perlengkapan | Pencatatan penerimaan barang & berita acara |
| `/keuangan/dashboard` | `GET` | Keuangan | Realisasi pembayaran setelah disetujui PPK & Bidang 2 |

---

## Struktur Direktori

Struktur kode mengikuti prinsip pemisahan ketat (Service Layer & Atomic Design):

```text
sipbaja/
├── app/
│   ├── Http/
│   │   ├── Controllers/       # Controller tipis: delegasi ke Service & render Inertia
│   │   ├── Middleware/        # Middleware autentikasi & role check
│   │   └── Requests/          # Dedicated Form Request class & validasi bahasa Indonesia
│   ├── Models/                # Eloquent Models & relasi data
│   ├── Policies/              # Otorisasi hak akses data (misal: batasan per unit_id)
│   └── Services/              # PUSAT LOGIKA BISNIS: transaksi tulis, kalkulasi, kueri data
├── database/
│   ├── factories/             # Factory untuk kebutuhan testing
│   ├── migrations/            # Skema tabel database (migrasi baru untuk setiap perubahan)
│   └── seeders/               # Seed peran, MAK, level pengadaan, dan user awal
├── docs/                      # Dokumentasi PRD, Database, Design System, & Rules
├── resources/
│   ├── js/
│   │   ├── components/        # Atomic Design
│   │   │   ├── atoms/         # Komponen dasar (Button, Input, Badge, Pill)
│   │   │   ├── molecules/     # Gabungan atom (FormField, SearchBar, StatCard)
│   │   │   ├── organisms/     # Modul kompleks (Sidebar, Topbar, TableCard)
│   │   │   └── templates/     # Tata letak halaman (murni presentasional)
│   │   ├── hooks/             # Custom React Hooks untuk stateful UI (search, filter, sort)
│   │   ├── utils/             # Fungsi murni (formatting mata uang, tanggal, normalisasi)
│   │   ├── Pages/             # Halaman utama Inertia (perekat template, hook, & props)
│   │   └── app.jsx            # Entry point Inertia React
│   └── views/
│       └── app.blade.php      # Root template HTML
├── routes/
│   └── web.php                # Definisi rute aplikasi
└── tests/
    ├── Feature/               # Feature testing (HTTP endpoint, alur peran, approval)
    └── Unit/                  # Unit testing (Service logic & validasi kalkulasi)
```

---

## Pengujian (Testing)

Pengujian menggunakan PHPUnit untuk memastikan integritas logika bisnis dan hak akses peran:

```bash
# Menjalankan seluruh test suite
php artisan test

# Menjalankan pengujian secara ringkas
php artisan test --compact

# Menjalankan pengujian spesifik per berkas
php artisan test tests/Feature/AuthTest.php

# Menjalankan pengujian dengan filter nama method
php artisan test --filter=test_user_can_login
```

Sebelum menyelesaikan perubahan kode PHP, format kode dengan Laravel Pint:

```bash
vendor/bin/pint --format agent
```

---

## Panduan Kontribusi & Aturan Pengembangan

Setiap pengembang atau agen AI wajib mematuhi panduan pada [DEVELOPMENT_RULES.md](file:///d:/Farrel/PROJECTS/sipbaja/docs/DEVELOPMENT_RULES.md):

1. **Arsitektur Service Layer:** Dilarang meletakkan logika bisnis atau kueri Eloquent langsung di Controller, Model, atau React Component. Semua logika tulis dan mutasi database wajib berada di `app/Services/` dalam transaksi DB jika menyentuh lebih dari satu tabel.
2. **Validasi & Otorisasi:** Input data wajib menggunakan Form Request di `app/Http/Requests/` dengan pesan Bahasa Indonesia. Otorisasi kepemilikan data dibatasi via Policy/Gate (mis. pembatasan permohonan per `unit_id`).
3. **Database & Migrasi:** Skema tabel adalah mutlak mengacu pada [DATABASE_SIPBAJA.md](file:///d:/Farrel/PROJECTS/sipbaja/docs/DATABASE_SIPBAJA.md). Jangan mengedit migrasi lama; selalu buat file migrasi baru untuk setiap perubahan skema. Dilarang menggunakan trigger database.
4. **Desain & UI:** Mengikuti [DESIGN.md](file:///d:/Farrel/PROJECTS/sipbaja/docs/DESIGN.md) (warna brand `#0E7C5A`, Plus Jakarta Sans, card-based, tanpa gradien). Template React bersifat presentasional; dilarang meletakkan `useState` logika filter/data bisnis di dalam template.
5. **Git & Commit:**
   - Gunakan branch fitur untuk setiap penambahan (`feat/nama-fitur` atau `fix/nama-bug`).
   - Format pesan commit mengacu pada Conventional Commits (`feat: ...`, `fix: ...`, `refactor: ...`).
   - Pastikan seluruh test lulus (`php artisan test`) dan linter rapi (`vendor/bin/pint`) sebelum membuat Pull Request.
