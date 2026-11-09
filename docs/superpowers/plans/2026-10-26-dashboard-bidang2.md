# Plan: Dashboard Bidang 2 (Wakil Direktur 2)

**Tanggal:** 2026-10-26
**Scope:** Halaman dashboard untuk role Bidang 2 (Wakil Direktur 2 / Keuangan dan Umum), mencakup backend Service & Controller, data statistik institusi, hooks, komponen UI (Atomic Design), dan integrasi navigasi.
**Referensi desain:** `docs/design/dashboard_bidang2.png`

---

## 1. Analisis Desain (`dashboard_bidang2.png`)

Berdasarkan pemindaian visual terhadap `docs/design/dashboard_bidang2.png`, terdapat lima zona utama pada tata letak antarmuka:

### 1.1 Sidebar Navigasi (Sisi Kiri)
- **Brand Identity:** Box ikon kubus hijau dengan sudut membulat (`#0E7C5A`), judul "SIPBAJA", dan subjudul "Pengadaan Barang & Jasa".
- **Label Seksi:** "MENU".
- **Menu Navigasi:**
  1. **Dashboard** (status aktif: latar hijau lembut `#E8F5F1`, teks dan ikon hijau `#0E7C5A`).
  2. **List Pengajuan** (ikon clipboard dengan badge angka `4` yang menandakan jumlah permohonan dalam antrean verifikasi/persetujuan Bidang 2). Rute: `/bidang-2/pengajuan`.
  3. **Dokumen RKAKL** (ikon dokumen berkas). Rute: `/bidang-2/rkakl` (halaman pengelola pagu RKAKL).

### 1.2 Topbar (Kanan Atas)
- Tombol notifikasi lonceng dengan interaksi popover.
- Kartu profil ringkas: avatar lingkaran inisial "B2" hijau tua, nama pengguna "Bidang 2", sub-label "Unit Bidang 2", dan chevron dropdown untuk menu keluar (logout).

### 1.3 Hero Banner
- Latar gradasi hijau daun gelap (`#0E7C5A`) dengan ornamen lengkungan transparan khas SIPBAJA.
- Eyebrow teks kapital: `DASHBOARD`.
- Judul utama: `Selamat datang, Bidang 2`.
- Deskripsi: `Pantau statistik permohonan pengadaan serta kelola Dokumen RKAKL.`
- Tombol Aksi Kanan: Tombol putih rounded dengan ikon dokumen dan teks hijau `Lihat Pengajuan` (`/bidang-2/pengajuan`).

### 1.4 Kartu Statistik (4 Stat Cards Sejajar)
1. **Total Permohonan**: Ikon dokumen hijau di kotak hijau lembut (`#E4F6EC`), badge hijau `+3 bulan ini` (penambahan di bulan berjalan), nilai numerik riil (contoh desain: `18`).
2. **Menunggu Verifikasi**: Ikon jam pasir / antrean biru di kotak biru lembut (`#E8F0FF`), badge biru `Dalam antrean`, nilai numerik permohonan yang menunggu persetujuan Bidang 2 (contoh desain: `2`).
3. **Disetujui**: Ikon centang hijau di kotak hijau lembut (`#E4F6EC`), badge hijau `+2 bulan ini`, nilai numerik permohonan yang disetujui (contoh desain: `12`).
4. **Ditolak**: Ikon silang merah di kotak merah muda lembut (`#FDECEC`), badge merah `Perlu revisi`, nilai numerik permohonan yang ditolak (contoh desain: `2`).

### 1.5 Grafik Batang Statistik Permohonan
- Header grafik:
  - Judul: `Statistik Permohonan`.
  - Subjudul: `Disetujui vs ditolak per tahun · 2021–2026` (atau periode tahun aktif).
  - Indikator Legenda: titik hijau `Disetujui {total}` dan titik merah muda `Ditolak {total}`.
  - Kontrol Toggle: segmented control tombol `Bulan` dan `Tahun`.
- Area Grafik:
  - Grafik batang SVG native responsif 12 bulan (Jan - Des).
  - Batang hijau (`#0E7C5A`) untuk data Disetujui, dan batang merah muda (`#F4C7C4` / `#E06A60`) untuk data Ditolak.
  - Sumbu Y dengan angka skala proporsional dinamis (0 s.d. batas atas).

### 1.6 Tabel Riwayat Permohonan Terbaru
- Header tabel:
  - Judul: `Riwayat Permohonan Terbaru`.
  - Subjudul: `4 permohonan terakhir yang telah diproses` (atau jumlah baris riwayat terkini).
  - Tautan Kanan: `Lihat Semua ->` (menuju ke daftar lengkap pengajuan `/bidang-2/pengajuan`).
- Kolom tabel:
  1. `NO PERMOHONAN`: Teks nomor surat berwarna hijau tua tebal (contoh: `01010-FF-11`).
  2. `JUDUL PENGADAAN`: Judul pengadaan hitam tebal di baris atas, diikuti nama unit kerja asal di baris bawahnya dengan teks abu-abu sekunder (contoh: "Pengadaan Komputer Lab" / "Laboratorium Komputer").
  3. `TANGGAL`: Format tanggal Indonesia (contoh: "12 Okt 2026").
  4. `NILAI PENGAJUAN`: Nilai anggaran dalam format mata uang Rupiah (contoh: "Rp 185.000.000").
  5. `STATUS`: Status pill dengan dot warna (Disetujui hijau, Ditolak merah, Menunggu Verifikasi biru/kuning).
  6. `AKSI`: Tombol ikon mata (`Eye`) dengan border rounded halus untuk membuka modal detail permohonan.

---

## 2. Aturan Kepatuhan & Standar Kualitas

### 2.1 Kepatuhan antislop
- **R-01 & R-29 (Color Palette):** Menggunakan palet standar SIPBAJA: hijau institusional `#0E7C5A`, teks utama `#14201C`, teks sekunder `#5F6F6A`, border `#E4EBE8`, background card putih `#FFFFFF`, dan abu-abu lembut `#F9FBFA`.
- **R-02 (Copywriting):** Tidak menggunakan karakter em dash (`—`) dalam teks antarmuka atau copy sistem. Digunakan tanda hubung biasa (`-`), titik dua (`:`), atau tanda kurung (`()`).
- **R-03 (Mobile Responsiveness):** Tampilan tabel menggunakan container `overflow-x-auto`, sidebar mendukung drawer responsif mobile dengan tombol tutup (X) dan *backdrop click*, serta grid kartu fleksibel dari 1 kolom (mobile) hingga 4 kolom (desktop).
- **R-09 & R-31 (Badges):** Badge pada kartu metrik membawa status fungsional konkret ("+N bulan ini", "Dalam antrean", "Perlu revisi"), bukan hiasan tanpa makna.
- **R-17 & R-38 (Real Data):** Menghubungkan seluruh metrik, tabel, dan grafik ke database riil via Service Layer. Tidak menggunakan data fiktif atau angka statis.
- **R-24 & R-26 (Functional Controls):** Seluruh tombol dan tautan memiliki fungsi nyata (navigasi ke rute yang valid atau membuka modal detail). Rute sekunder yang belum dibuat diberi fallback terstruktur dan penanda status.
- **R-27 (Three UI States):** Setiap komponen penyaji data (tabel dan grafik) menyediakan 3 kondisi lengkap: *Empty state* yang informatif, *Loading skeleton*, dan *Error state*.
- **R-32 (Keyboard Accessibility):** Navigasi tabel dan tombol dapat diakses dengan keyboard (`Tab`, `Enter`, `Space`), modal detail dapat ditutup dengan tombol `Escape`.

### 2.2 Kepatuhan antislop-code
- Komentar kode hanya ditulis jika ada aturan bisnis atau batasan teknis yang tidak langsung terlihat dari kode (maksimal 1-2 baris).
- Tidak ada komentar dekoratif berbentuk banner pembatas (`// =======`), tidak ada emoji pada komentar, dan tidak ada penomoran langkah yang berlebihan.

### 2.3 Kepatuhan antislop-ui
- Bebas dari tren AI generik: tanpa efek *glassmorphism* berlebihan, tanpa *pulsing dots* dekoratif tanpa status, dan tanpa tata letak kaku.
- Visualisasi tabel dan grafik dirancang spesifik untuk kebutuhan pengawasan Wakil Direktur 2 (kecepatan memantau antrean dan pengadaan yang telah diputuskan).

### 2.4 Kepatuhan Arsitektur (DEVELOPMENT_RULES.md)
- **Service Layer Wajib:** Logika bisnis dan query Eloquent ditempatkan di `app/Services/DashboardBidang2Service.php`.
- **Controller Bersih:** `DashboardBidang2Controller.php` hanya bertindak sebagai orkestrator yang memanggil Service dan merender Inertia view.
- **Atomic Design:**
  - *Atoms:* `StatusPill.jsx` (reusable).
  - *Molecules:* `StatCard.jsx` (reusable), `Bidang2PermohonanRow.jsx`.
  - *Organisms:* `HeroBanner.jsx`, `StatistikChart.jsx`, `Bidang2PermohonanTable.jsx`, `DetailPermohonanModal.jsx`.
  - *Templates:* `Bidang2DashboardTemplate.jsx`.
  - *Pages:* `resources/js/Pages/Bidang2/Dashboard.jsx`.
- **Pemisahan Logika & Presentasi:**
  - Custom hook: `resources/js/hooks/useBidang2Dashboard.js`.
  - Pure utils: `resources/js/utils/formatPermohonan.js` (reusable).

---

## 3. Peta File yang Dibuat / Diubah

| File | Status | Keterangan |
|---|---|---|
| `app/Services/DashboardBidang2Service.php` | Baru | Service khusus penyedia data metrik, permohonan antrean/terbaru, dan tren grafik untuk Bidang 2 |
| `app/Http/Controllers/DashboardBidang2Controller.php` | Ubah | Menginject `DashboardBidang2Service` dan mengoper props data ke Inertia |
| `routes/web.php` | Ubah | Menyiapkan rute placeholder/rute tujuan untuk `/bidang-2/pengajuan` dan `/bidang-2/rkakl` agar navigasi sidebar valid |
| `resources/js/hooks/useBidang2Dashboard.js` | Baru | Custom hook untuk kalkulasi turunan grafik dan state interaksi UI |
| `resources/js/components/molecules/Bidang2PermohonanRow.jsx` | Baru | Baris tabel riwayat pengadaan dengan sub-label nama unit dan tombol aksi mata (eye icon) |
| `resources/js/components/organisms/Bidang2PermohonanTable.jsx` | Baru | Tabel riwayat permohonan terbaru khusus Bidang 2 dengan empty, loading, dan error state |
| `resources/js/components/templates/Bidang2DashboardTemplate.jsx` | Baru | Template tata letak dashboard Bidang 2 yang menggabungkan shell, banner, 4 stat card, chart, dan table |
| `resources/js/Pages/Bidang2/Dashboard.jsx` | Ubah | Halaman utama role Bidang 2 yang menghubungkan props controller, hook, dan template |

---

## 4. Checklist Rencana Kerja Bertahap

### Fase 1 — Backend: Service Layer & Controller

- [ ] **1.1** Buat Service `app/Services/DashboardBidang2Service.php` dengan method:
  - `ringkasan(): array`
    - Menghitung `total` (seluruh permohonan yang diajukan ke sistem atau telah mencapai tahap persetujuan).
    - Menghitung `menunggu_verifikasi` (permohonan berstatus `diajukan` atau yang telah disetujui Perencanaan dan menunggu keputusan persetujuan awal Bidang 2).
    - Menghitung `disetujui` (permohonan yang telah disetujui oleh Bidang 2 via tabel `approval_permohonan` tahap `BIDANG2` dengan keputusan `disetujui`, atau status permohonan `disetujui`).
    - Menghitung `ditolak` (permohonan yang ditolak pada tahap Bidang 2).
    - Menghitung `tambahan_bulan_ini` (penambahan permohonan baru pada bulan berjalan untuk badge `+N bulan ini`).
    - Menghitung `disetujui_bulan_ini` (permohonan yang disetujui pada bulan berjalan untuk badge `+N bulan ini`).
  - `riwayatTerbaru(int $limit = 5): Collection`
    - Mengambil 4 s.d. 5 permohonan terbaru dari database dengan eager loading relasi `unit`, `dokumen`, dan `approvalPermohonan`.
    - Diurutkan berdasarkan `created_at DESC`.
  - `statistikBulanan(int $tahun): array`
    - Mengembalikan data 12 bulan (Jan - Des) yang menghitung jumlah permohonan disetujui dan ditolak pada tahun terpilih untuk grafik batang.
    - Menghitung total kumulatif disetujui dan ditolak untuk angka legenda grafik.
- [ ] **1.2** Perbarui `app/Http/Controllers/DashboardBidang2Controller.php`:
  - Menginject `DashboardBidang2Service` melalui constructor dependency injection.
  - Memanggil `ringkasan()`, `riwayatTerbaru(5)`, dan `statistikBulanan($tahun)`.
  - Me-render `Bidang2/Dashboard` dengan membawa props: `ringkasan`, `riwayatTerbaru`, `statistikBulanan`, dan `tahunAktif`.
- [ ] **1.3** Perbarui `routes/web.php` pada grup middleware `role:Bidang 2`:
  - Siapkan endpoint rute `/bidang-2/pengajuan` (menampilkan daftar pengajuan antrean) dan `/bidang-2/rkakl` agar semua item navigasi sidebar memiliki tujuan URL yang valid (R-24 & R-26).

---

### Fase 2 — Frontend: Hook & State Management

- [ ] **2.1** Buat `resources/js/hooks/useBidang2Dashboard.js`:
  - Menerima props `{ ringkasan, riwayatTerbaru, statistikBulanan, tahunAktif }`.
  - Mengelola local UI state untuk toggle mode grafik (`Bulan` | `Tahun`).
  - Menyediakan handler pemilihan modal detail permohonan (`selectedPermohonan`, `handleOpenDetail`, `handleCloseDetail`).
  - Mengembalikan objek state terstruktur: `{ ringkasan, riwayatTerbaru, chartData, viewMode, setViewMode, tahunAktif, gantiTahun, selectedPermohonan, setSelectedPermohonan }`.

---

### Fase 3 — Frontend: Komponen Atomic Design

- [ ] **3.1** Buat molekul `resources/js/components/molecules/Bidang2PermohonanRow.jsx`:
  - Menampilkan `NO PERMOHONAN` dalam format teks tebal hijau.
  - Menampilkan `JUDUL PENGADAAN` dengan nama unit kerja asal di baris keduanya (contoh: "Pengadaan Komputer Lab" dan "Laboratorium Komputer").
  - Menampilkan `TANGGAL` menggunakan fungsi `formatTanggal()`.
  - Menampilkan `NILAI PENGAJUAN` menggunakan fungsi `formatRupiah()`.
  - Menampilkan `STATUS` menggunakan komponen `StatusPill`.
  - Kolom `AKSI`: Tombol ikon mata (`Eye` dari `lucide-react`) dengan border rounded halus untuk memicu pembukaan modal detail.
- [ ] **3.2** Buat organisme `resources/js/components/organisms/Bidang2PermohonanTable.jsx`:
  - Header: judul "Riwayat Permohonan Terbaru", subjudul jumlah permohonan yang diproses, dan tautan "Lihat Semua ->" ke `/bidang-2/pengajuan`.
  - Tabel dengan container responsif `overflow-x-auto`.
  - Mengimplementasikan 3 state data wajib:
    - *Loading State:* skeleton baris animasi pulse saat data sedang dimuat.
    - *Empty State:* tampilan ramah "Belum ada riwayat permohonan yang diproses" dengan ikon dokumen yang rapi.
    - *Error State:* pesan kegagalan pemuatan dengan instruksi muat ulang halaman.
- [ ] **3.3** Selaraskan organisme `StatistikChart.jsx`:
  - Memastikan dukungan props untuk menampilkan angka kumulatif pada legenda (contoh: "Disetujui 337" dan "Ditolak 81") sesuai desain `dashboard_bidang2.png`.
  - Memastikan toggle `Bulan` dan `Tahun` berfungsi secara interaktif tanpa reload halaman.

---

### Fase 4 — Frontend: Template & Page Integration

- [ ] **4.1** Buat template `resources/js/components/templates/Bidang2DashboardTemplate.jsx`:
  - Menggunakan `DashboardShellTemplate` sebagai layout induk.
  - Mengonfigurasi sidebar navigasi:
    - `Dashboard` (aktif, `/bidang-2/dashboard`).
    - `List Pengajuan` (`/bidang-2/pengajuan`, dengan badge angka `ringkasan.menunggu_verifikasi`).
    - `Dokumen RKAKL` (`/bidang-2/rkakl`).
  - Mengonfigurasi `HeroBanner`:
    - Eyebrow: `DASHBOARD`.
    - Title: `Selamat datang, Bidang 2`.
    - Description: `Pantau statistik permohonan pengadaan serta kelola Dokumen RKAKL.`
    - CTA Button: `Lihat Pengajuan` yang mengarahkan ke `/bidang-2/pengajuan`.
  - Merender 4 kartu statistik (`Total Permohonan`, `Menunggu Verifikasi`, `Disetujui`, `Ditolak`) dengan badge kontekstual.
  - Merender `StatistikChart` dan `Bidang2PermohonanTable`.
  - Mengintegrasikan `DetailPermohonanModal` untuk peninjauan rincian berkas dan status permohonan.
- [ ] **4.2** Perbarui halaman `resources/js/Pages/Bidang2/Dashboard.jsx`:
  - Menggantikan placeholder `RoleDashboardTemplate` dengan `Bidang2DashboardTemplate`.
  - Menghubungkan props dari controller Inertia dengan `useBidang2Dashboard`.
  - Meneruskan data dan handler secara satu arah (one-way data flow) sesuai arsitektur Atomic Design.

---

### Fase 5 — Verifikasi, Kerapian Kode, & Pengujian

- [ ] **5.1** Jalankan formatter kode PHP: `vendor/bin/pint --dirty --format agent`.
- [ ] **5.2** Jalankan pengujian backend: `php artisan test --compact` untuk memastikan tidak ada regresi pada endpoint atau middleware yang ada.
- [ ] **5.3** Jalankan build frontend: `npm run build` untuk memverifikasi tidak ada error sintaks JSX, impor modul, atau error manifest Vite.
- [ ] **5.4** Verifikasi browser:
  - Login sebagai akun Bidang 2 (`bidang2@pnj.ac.id`).
  - Pastikan halaman diarahkan dengan benar ke `/bidang-2/dashboard`.
  - Periksa tampilan hero banner, 4 stat cards, grafik SVG, tabel permohonan terbaru, popover notifikasi, dan modal detail.
  - Uji responsivitas viewport mobile (< 768px) dan tombol drawer sidebar.
