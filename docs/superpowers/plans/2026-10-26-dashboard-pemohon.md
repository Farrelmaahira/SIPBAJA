# Plan: Dashboard Pemohon (Jurusan/Unit/Bidang)

**Tanggal:** 2026-10-26
**Scope:** Halaman dashboard untuk role Pemohon (Jurusan/Unit/Bidang), mencakup backend data, frontend template, komponen baru, dan hooks.
**Referensi desain:** `docs/design/dashboard_jurusan.png`

---

## Analisis Desain (`dashboard_jurusan.png`)

Desain terdiri dari empat zona utama:

1. **Hero Banner** — latar hijau `#0E7C5A`, teks "Selamat datang, {nama unit}", subjudul, tombol "+ Buat Permohonan" di kanan.
2. **Stat Row** — empat `StatCard` sejajar: Total Permohonan, Menunggu Verifikasi, Disetujui, Ditolak. Masing-masing punya ikon, nilai, dan badge kontekstual ("+3 bulan ini", "Dalam antrean", "+2 bulan ini", "Perlu revisi").
3. **Grafik Batang "Statistik Permohonan"** — disetujui vs ditolak per bulan, toggle Bulan/Tahun, legenda dua warna.
4. **Tabel "Permohonan Sedang Berlangsung"** — kolom: No Permohonan (link), Judul Pengadaan, Tanggal, Nilai Pengajuan, Status (pill), Aksi (3-titik). Tautan "Lihat Semua" ke List Permohonan.

**Catatan antislop-ui yang berlaku:**
- Stat card menampilkan angka real dari DB, bukan angka hardcode (R-17, R-38).
- Badge kontekstual pada stat card membawa informasi nyata, bukan dekorasi (R-09, R-31).
- Grafik batang menjawab pertanyaan spesifik: "Berapa permohonan disetujui vs ditolak per bulan tahun ini?" — judul harus eksplisit (antislop-ui: Charts Without a Question).
- Tabel hanya menampilkan permohonan aktif unit pemohon (bukan semua, sesuai PRD 5.6 + business rule visibilitas per `unit_id`).
- Empty, loading, dan error state wajib (R-27).
- Sidebar hanya memuat rute yang benar-benar ada: Dashboard dan List Permohonan (R-24, R-26).
- Hero banner menggunakan `HeroBanner` yang sudah ada, direfaktor agar configurable (label, CTA, deskripsi) — tidak membuat komponen baru yang duplikat.

---

## Peta File yang Dibuat / Diubah

| File | Tindakan |
|---|---|
| `app/Services/DashboardPemohonService.php` | Baru |
| `app/Http/Controllers/DashboardPemohonController.php` | Ubah (tambah data dari Service) |
| `resources/js/hooks/usePemohonDashboard.js` | Baru |
| `resources/js/utils/formatPermohonan.js` | Baru |
| `resources/js/components/organisms/HeroBanner.jsx` | Ubah (props configurable) |
| `resources/js/components/molecules/StatCard.jsx` | Ubah (tambah prop `badge`) |
| `resources/js/components/molecules/PermohonanRow.jsx` | Baru |
| `resources/js/components/organisms/PermohonanTable.jsx` | Baru |
| `resources/js/components/organisms/StatistikChart.jsx` | Baru |
| `resources/js/components/templates/PemohonDashboardTemplate.jsx` | Baru |
| `resources/js/Pages/Pemohon/Dashboard.jsx` | Ubah (gunakan template baru) |

---

## Checklist Implementasi

### Fase 1 — Backend: Service & Controller

- [x] **1.1** Buat `app/Services/DashboardPemohonService.php` via `php artisan make:class` dengan method:
  - `ringkasan(User $user): array` — mengembalikan `total`, `menunggu_verifikasi`, `disetujui`, `ditolak`, dan `tambahan_bulan_ini` (count permohonan di bulan berjalan, untuk badge "+N bulan ini").
  - `permohonanAktif(User $user): Collection` — permohonan milik `unit_id` user dengan status bukan `ditolak` final dan belum selesai; limit 10, order `created_at DESC`. Eager load relasi yang dibutuhkan tabel.
  - `statistikPerBulan(User $user, int $tahun): array` — data grafik: per bulan (1-12), jumlah `disetujui` dan `ditolak`, untuk tahun yang diminta.
  - Semua query difilter `unit_id = $user->unit_id` sesuai business rule (PRD 5.6).
  - Tidak ada write query di Service ini — tidak perlu DB transaction.

- [x] **1.2** Ubah `DashboardPemohonController::__invoke` untuk:
  - Menginject `DashboardPemohonService` via constructor DI.
  - Memanggil ketiga method Service.
  - Mengoper hasilnya ke `Inertia::render('Pemohon/Dashboard', [...])` sebagai props: `ringkasan`, `permohonanAktif`, `statistikBulanan`, `tahunAktif`.
  - Tidak boleh ada query Eloquent langsung di controller (DEVELOPMENT_RULES 4).

- [x] **1.3** Pastikan route untuk dashboard Pemohon sudah terlindungi middleware role yang benar (cek `routes/web.php`).

### Fase 2 — Backend: Form Request (opsional, untuk filter tahun)

- [x] **2.1** Jika toggle Bulan/Tahun diimplementasikan dengan server-side request: buat `app/Http/Requests/FilterStatistikRequest.php`. Rule: `tahun` integer opsional 4 digit. Pesan Bahasa Indonesia.

### Fase 3 — Frontend: Utils

- [x] **3.1** Buat `resources/js/utils/formatPermohonan.js` dengan pure functions:
  - `formatRupiah(nominal)` — format ke "Rp X.XXX.XXX" tanpa desimal.
  - `formatTanggal(isoString)` — format ISO date ke "DD Mmm YYYY" dalam bahasa Indonesia, contoh: "12 Okt 2026".
  - `labelStatusPermohonan(status)` — return `{ label, variant }` untuk `StatusPill` berdasarkan nilai status string dari DB.
  - Semua pure functions tanpa side effect (DEVELOPMENT_RULES 11).

### Fase 4 — Frontend: Hooks

- [x] **4.1** Buat `resources/js/hooks/usePemohonDashboard.js`:
  - Terima props `{ ringkasan, permohonanAktif, statistikBulanan }` dari page.
  - State lokal: `viewMode` (`bulan` | `tahun`) untuk toggle grafik — ini state UI, diizinkan (DEVELOPMENT_RULES 11).
  - Computed via `useMemo`: `chartData` tergantung `viewMode`.
  - Return: `{ ringkasan, permohonanAktif, chartData, viewMode, setViewMode }`.

### Fase 5 — Frontend: Komponen

#### 5.1 Perbaikan Komponen yang Ada

- [x] **5.1.1** Ubah `HeroBanner.jsx` agar configurable:
  - Tambah props: `eyebrow`, `title`, `description`, `ctaLabel`, `onCta`, `ctaIcon`.
  - Beri default values yang sama seperti pemakaian saat ini di `AdminDashboardTemplate` agar backward compatible.
  - Eyebrow tetap teks polos kecil, bukan badge dengan border+glow (antislop-ui: Eyebrow Badge Above the Headline).

- [x] **5.1.2** Ubah `StatCard.jsx` untuk mendukung prop `badge` opsional:
  - `badge?: { label: string, variant: 'success' | 'warning' | 'neutral' | 'danger' }`.
  - Badge di pojok kanan atas kartu, teks kecil berwarna.
  - Tidak ada glow, tidak ada pulse, tidak ada emoji (R-09, R-13, R-19).

#### 5.2 Molecule Baru

- [x] **5.2.1** Buat `resources/js/components/molecules/PermohonanRow.jsx`:
  - Props: `nomorSurat`, `judul`, `tanggal`, `nilaiPengajuan`, `status`, `onAksi`.
  - Nomor surat sebagai link `Link` Inertia, nilai via `formatRupiah`, tanggal via `formatTanggal`, status via `StatusPill`.
  - Tombol 3-titik: icon-only dengan `aria-label="Opsi permohonan {nomorSurat}"`.
  - Kolom dipilih dari keputusan yang dibuat pengguna di tabel ini, bukan template generik (antislop-ui: Generic Table Columns).

#### 5.3 Organism Baru

- [x] **5.3.1** Buat `resources/js/components/organisms/StatistikChart.jsx`:
  - Props: `chartData`, `viewMode`, `onViewModeChange`, `isLoading`.
  - Implementasi grafik: cek `package.json` dulu. Jika ada chart library, gunakan. Jika tidak, SVG native — tidak menambah library tanpa approval.
  - Judul grafik eksplisit: "Disetujui vs Ditolak per Bulan {tahun}" atau "per Tahun".
  - Toggle Bulan/Tahun: dua tombol, bukan dropdown.
  - Loading state: skeleton bar chart. Empty state: "Belum ada data statistik untuk periode ini."
  - Judul informatif, bukan "Overview" (antislop-ui: Charts Without a Question).

- [x] **5.3.2** Buat `resources/js/components/organisms/PermohonanTable.jsx`:
  - Props: `rows`, `isLoading`, `isError`.
  - Header tabel: NO PERMOHONAN, JUDUL PENGADAAN, TANGGAL, NILAI PENGAJUAN, STATUS, AKSI.
  - Loading state: 3 baris skeleton ghost.
  - Empty state: "Tidak ada permohonan aktif. Buat permohonan pertama Anda." + aksi.
  - Error state: "Gagal memuat data. Coba muat ulang halaman."
  - Tautan "Lihat Semua" mengarah ke route `pemohon.permohonan.index`; jika belum ada, gunakan `href="#"` dengan komentar `// TODO: route pemohon.permohonan.index belum dibuat` dan teks "Coming soon" yang visible (R-26).
  - Tiga state wajib, tiap state menyebut penyebab dan tindakan (R-27, antislop-ui: Placeholder Empty and Loading States).

### Fase 6 — Frontend: Template & Page

- [x] **6.1** Buat `resources/js/components/templates/PemohonDashboardTemplate.jsx`:
  - Props: `user`, `ringkasan`, `permohonanAktif`, `statistikBulanan`, `tahunAktif`, `chartData`, `viewMode`, `onViewModeChange`, `isLoading`, `isError`.
  - Gunakan `DashboardShellTemplate` sebagai shell.
  - Sidebar nav items: Dashboard dan List Permohonan saja (tidak lebih — R-24).
  - Badge count di sidebar "List Permohonan" menggunakan `ringkasan.menunggu_verifikasi` (butuh perhatian pemohon), bukan angka hardcode.
  - Layout: HeroBanner, stat row 4 kartu, StatistikChart, PermohonanTable — sesuai desain.
  - Template hanya render; tanpa `useState` untuk data bisnis (DEVELOPMENT_RULES 11).

- [x] **6.2** Ubah `resources/js/Pages/Pemohon/Dashboard.jsx`:
  - Hapus pemakaian `RoleDashboardTemplate` (placeholder lama).
  - Destructure props dari Inertia: `{ auth, ringkasan, permohonanAktif, statistikBulanan, tahunAktif }`.
  - Panggil `usePemohonDashboard({ ringkasan, permohonanAktif, statistikBulanan })`.
  - Teruskan hasil hook ke `PemohonDashboardTemplate` via props.
  - Page adalah glue; tidak ada business logic inline (DEVELOPMENT_RULES 11).

### Fase 7 — Verifikasi & Penyelesaian

- [x] **7.1** Jalankan `vendor/bin/pint --dirty --format agent` setelah semua perubahan PHP.

- [x] **7.2** Jalankan `php artisan test --compact` — pastikan semua test yang ada tetap lulus.

- [x] **7.3** Jalankan `npm run build` — pastikan tidak ada error bundling.

- [x] **7.4** Cek manual di browser:
  - Login sebagai user dengan role Pemohon yang punya `unit_id`.
  - Buka `/pemohon/dashboard` — pastikan HeroBanner, stat row, chart, dan tabel render.
  - Verifikasi data stat card bukan angka hardcode: nilai 0 jika DB kosong, bukan fake default.
  - Toggle Bulan/Tahun berfungsi (chartData berubah).
  - Empty state tabel muncul saat tidak ada data aktif.
  - Sidebar link "Dashboard" dan "List Permohonan" tidak dead-link (atau memiliki label visible jika belum ada route-nya).
  - Keyboard: Tab navigasi menjangkau semua elemen interaktif.

---

## Asumsi yang Perlu Dikonfirmasi Sebelum Eksekusi

1. **Chart library:** Apakah ada chart library (Recharts, Chart.js, dll.) di `package.json`? Jika tidak ada, grafik diimplementasikan dengan SVG native tanpa library tambahan.

2. **Toggle Bulan/Tahun:** Client-side (data satu tahun langsung diload dari controller) atau server-side (kirim `?tahun=` ke controller)? Asumsi awal: client-side untuk MVP.

3. **Kolom "Nilai Pengajuan" di tabel:** Desain menampilkan `estimasi_anggaran` dari tabel `permohonan`. Konfirmasi ini field yang tepat (bukan `nominal` dari tabel `pengadaan`).

4. **Route `pemohon.permohonan.index`:** Belum ada di scope plan ini. Link "Lihat Semua" dan nomor surat akan diberi label visible + komentar TODO sampai route tersebut dibuat.

5. **Badge count sidebar:** Desain menampilkan angka "4" di sidebar. Implementasi menggunakan `ringkasan.menunggu_verifikasi` — konfirmasi ini intention yang benar.

---

## Batasan Scope

Plan ini mencakup **hanya halaman Dashboard Pemohon**. Fitur berikut berada di luar scope dan akan direncanakan terpisah:

- Halaman List Permohonan (`/pemohon/permohonan`)
- Halaman Form Buat Permohonan
- Halaman Detail Permohonan dan tracking status
- Notifikasi in-app
