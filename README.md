# SIPBAJA (Sistem Informasi Pengadaan Barang dan Jasa)

SIPBAJA adalah sistem informasi pengadaan barang dan jasa berbasis monorepo dengan arsitektur **Laravel 13 RESTful API Backend** dan **React 19 + TypeScript Standalone SPA Frontend**. Sistem ini mendigitalkan seluruh alur pengadaan barang dan jasa di lingkungan kampus untuk menyelesaikan fragmentasi dokumen, transparansi pelacakan antar-unit, kepatuhan batas nominal, serta penegakan persetujuan bertingkat (*tiered approval*) dan verifikasi ganda (*dual approval*).

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
| **Arsitektur** | Monorepo (`backend/` + `frontend/`) | Independen, API-driven via RESTful JSON |
| **Backend Framework** | Laravel 13 | RESTful API controller & Laravel Sanctum SPA Auth |
| **Bahasa Backend** | PHP 8.5.x (min. PHP 8.3) | Standar PSR-12, constructor promotion, strict typing |
| **Frontend Framework** | React 19 + TypeScript | Single Page Application (SPA) |
| **HTTP Client** | Axios | Session-based cookie auth via Laravel Sanctum |
| **Styling** | Tailwind CSS v4 | Berdasarkan *SIPBAJA Design System* (Emerald `#0E7C5A`) |
| **Icons** | Lucide React | Icon set resmi |
| **Database (Dev)** | SQLite | Cepat untuk pengembangan lokal dan CI |
| **Database (Target Prod)** | PostgreSQL 18 | Relasional murni, kompatibel dengan SQLite tanpa DB triggers |
| **Build Tool Frontend** | Vite 8 | Fast build & HMR |

---

## Prasyarat Sistem

- **PHP**: `^8.3` (Disarankan PHP 8.5.x) dengan ekstensi `pdo`, `pdo_sqlite`, `pdo_pgsql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `curl`.
- **Composer**: `v2.x`
- **Node.js**: `v20.x`, `v22.x`, atau `v24.x` (LTS)
- **NPM**: `v10.x` atau lebih baru
- **Git**

---

## Struktur Monorepo

```text
sipbaja/
├── backend/                   # Laravel 13 RESTful API (PHP)
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/   # REST API Controllers (return JsonResponse)
│   │   │   ├── Middleware/    # Sanctum & Role-based Access Middleware
│   │   │   └── Requests/      # Form Requests & validasi input
│   │   ├── Models/            # Eloquent Models
│   │   ├── Policies/          # Policy & Gate otorisasi
│   │   └── Services/          # PUSAT LOGIKA BISNIS: transaksi & kalkulasi
│   ├── config/                # Konfigurasi Laravel, CORS, Sanctum
│   ├── database/              # Migrasi, seeders, factories, SQLite db
│   ├── routes/                # API routes (routes/api.php)
│   └── tests/                 # PHPUnit Feature & Unit tests
├── frontend/                  # React 19 + TypeScript + Vite SPA
│   ├── src/
│   │   ├── components/        # Atomic Design
│   │   │   ├── atoms/         # Komponen dasar (Button, Input, Badge, Pill)
│   │   │   ├── molecules/     # FormField, SearchBar, StatCard
│   │   │   ├── organisms/     # Modul kompleks (Sidebar, Topbar, TableCard)
│   │   │   └── templates/     # Layout template halaman (murni presentasional)
│   │   ├── hooks/             # Custom React Hooks
│   │   ├── pages/             # Komponen halaman (Pages)
│   │   ├── services/          # Modul API client Axios
│   │   ├── types/             # Tipe TypeScript bersama
│   │   └── utils/             # Helper fungsi murni (format mata uang, tanggal)
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── docs/                      # Dokumentasi teknis, PRD, Database, Rules
└── .agents/                   # Konfigurasi AI agent skills & rules
```

---

## Langkah Instalasi & Menjalankan Aplikasi

Perintah dijalankan dari subdirektori masing-masing (`backend/` dan `frontend/`).

### 1. Menyiapkan Backend (Laravel API)

```bash
cd backend

# Pasang dependensi PHP
composer install

# Salin file environment
cp .env.example .env

# Generate Application Key
php artisan key:generate

# Migrasi dan seed database awal
touch database/database.sqlite
php artisan migrate --seed

# Jalankan server backend (port 8000)
php artisan serve
```

### 2. Menyiapkan Frontend (React + TypeScript)

Di terminal terpisah:

```bash
cd frontend

# Pasang dependensi Node.js
npm install

# Jalankan server dev Vite (port 5173)
npm run dev
```

Aplikasi dapat diakses melalui peramban di: **`http://localhost:5173`** (Frontend) dengan backend API berjalan di **`http://localhost:8000`**.

---

## Konfigurasi Environment Backend (`backend/.env`)

Pastikan variabel berikut terkonfigurasi dengan benar di `backend/.env`:

```env
APP_NAME=SIPBAJA
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_URL=http://localhost:8000

FRONTEND_URL=http://localhost:5173
SANCTUM_STATEFUL_DOMAINS=localhost:5173

# Konfigurasi Database Lokal (SQLite)
DB_CONNECTION=sqlite

# Session
SESSION_DRIVER=file
SESSION_LIFETIME=60
```

---

## Pengujian (Testing)

### Backend (PHPUnit)

```bash
cd backend

# Menjalankan seluruh test suite
php artisan test

# Menjalankan secara ringkas
php artisan test --compact

# Menjalankan test tertentu
php artisan test --filter=ExampleTest
```

### Frontend (TypeScript & Build Check)

```bash
cd frontend

# Pengecekan tipe data TypeScript
npx tsc -b

# Build bundle produksi
npm run build
```

Format kode PHP menggunakan Laravel Pint sebelum commit:
```bash
cd backend
vendor/bin/pint --format agent
```

---

## Panduan Kontribusi & Aturan Pengembangan

Setiap pengembang atau agen AI wajib mematuhi panduan pada [DEVELOPMENT_RULES.md](file:///d:/Farrel/PROJECTS/sipbaja/docs/DEVELOPMENT_RULES.md):

1. **Monorepo Perintah Subdirektori:** Jalankan perintah langsung dari `backend/` atau `frontend/`.
2. **Arsitektur Service Layer:** Dilarang meletakkan logika bisnis di Controller. Logika tulis dan mutasi database wajib berada di `backend/app/Services/`.
3. **Controller RESTful:** Controller backend hanya menerima request, memanggil service, dan mengembalikan `JsonResponse`.
4. **Validasi & Otorisasi:** Input data divalidasi via Form Request (`backend/app/Http/Requests/`) dengan pesan Bahasa Indonesia.
5. **Frontend Atomic Design & TypeScript:** Komponen ditempatkan sesuai hierarki (atoms, molecules, organisms, templates) dengan strict TypeScript typing.
