# Plan: Dashboard Tim Perencanaan

**Tanggal:** 2026-10-26
**Scope:** Halaman dashboard untuk role Perencanaan, mencakup backend Service & Controller, penyajian metrik antrean verifikasi anggaran & penentuan MAK, hooks stateful, komponen UI (Atomic Design), dan integrasi rute navigasi.
**Referensi desain:** `docs/design/dashboard_perencanaan.png`

---

## 1. Analisis Desain (`dashboard_perencanaan.png`)

Berdasarkan analisis visual terhadap file acuan `docs/design/dashboard_perencanaan.png`, struktur halaman terbagi menjadi lima komponen utama:

### 1.1 Sidebar Navigasi (Sisi Kiri)
- **Brand Identity:** Logo box hijau kubus dengan sudut membulat (`#0E7C5A`), judul "SIPBAJA", dan subjudul "Pengadaan Barang & Jasa".
- **Label Seksi:** "MENU".
- **Menu Navigasi:**
  1. **Dashboard** (status aktif: latar hijau lembut `#E8F5F1`, teks dan ikon hijau `#0E7C5A`).
  2. **List Pengajuan** (ikon clipboard dengan badge angka `4` yang menandakan permohonan baru dari unit yang menunggu verifikasi anggaran & penetapan MAK). Rute: `/perencanaan/pengajuan`.
  3. **Jenis MAK** (ikon tag/label harga `Tag` dari `lucide-react`). Rute: `/perencanaan/mak` (daftar 4 kategori MAK kampus).
  4. **Dokumen RKAKL** (ikon dokumen berkas `FileText`). Rute: `/perencanaan/rkakl` (pagu anggaran acuan).

### 1.2 Topbar (Kanan Atas)
- Tombol notifikasi lonceng dengan interaksi popover info pembaruan.
- Identitas profil: avatar lingkaran inisial "PR" hijau tua, nama "Perencanaan", sub-label "Unit Perencanaan", dan chevron dropdown untuk menu keluar (logout).

### 1.3 Hero Banner
- Latar gradasi hijau daun gelap (`#0E7C5A`) dengan ornamen lengkungan kurva transparan.
- Eyebrow teks kapital: `DASHBOARD`.
- Judul utama: `Selamat datang, Tim Perencanaan`.
- Deskripsi: `Pantau permohonan pengadaan yang masuk, serta kelola Jenis MAK dan Dokumen RKAKL.`
- Tombol Aksi Kanan: Tombol putih rounded dengan ikon clipboard dan teks hijau `Lihat Permohonan` yang mengarahkan ke `/perencanaan/pengajuan`.

### 1.4 Kartu Statistik (4 Stat Cards Sejajar)
1. **Total Permohonan**: Ikon dokumen hijau di kotak hijau lembut (`#E4F6EC`), badge hijau `+3 bulan ini` (penambahan permohonan pada bulan berjalan), nilai numerik riil (contoh desain: `18`).
2. **Menunggu Verifikasi**: Ikon jam pasir / antrean biru di kotak biru lembut (`#E8F0FF`), badge biru `Dalam antrean`, nilai numerik permohonan berstatus `diajukan` yang menunggu penelaahan Perencanaan (contoh desain: `2`).
3. **Disetujui**: Ikon centang hijau di kotak hijau lembut (`#E4F6EC`), badge hijau `+2 bulan ini`, nilai numerik permohonan yang telah diverifikasi & disetujui (contoh desain: `12`).
4. **Ditolak**: Ikon silang merah di kotak merah muda lembut (`#FDECEC`), badge merah `Perlu revisi`, nilai numerik permohonan yang ditolak pada tahap perencanaan (contoh desain: `2`).

### 1.5 Grafik Batang Statistik Permohonan
- Header grafik:
  - Judul: `Statistik Permohonan`.
  - Subjudul: `Disetujui vs ditolak per tahun · 2021–2026` (atau periode tahun aktif).
  - Indikator Legenda: titik hijau `Disetujui {total}` dan titik merah muda `Ditolak {total}`.
  - Kontrol Toggle: segmented control tombol `Bulan` dan `Tahun`.
- Area Grafik:
  - Grafik batang SVG native responsif 12 bulan (Jan - Des).
  - Batang hijau (`#0E7C5A`) untuk data Disetujui, dan batang merah muda (`#F4C7C4` / `#E06A60`) untuk data Ditolak.
  - Sumbu Y terkalibrasi proporsional dengan garis pandu horizontal halus.

### 1.6 Tabel Permohonan Masuk Terbaru
- Header tabel:
  - Judul: `Permohonan Masuk Terbaru`.
  - Subjudul: `4 permohonan masuk · diperbarui hari ini` (atau jumlah baris riwayat terkini).
  - Tautan Kanan: `Lihat Semua ->` (menuju ke daftar lengkap pengajuan `/perencanaan/pengajuan`).
- Kolom tabel:
  1. `NO PERMOHONAN`: Teks nomor surat berwarna hijau tua tebal (contoh: `01010-FF-11`).
  2. `JUDUL PENGADAAN`: Judul pengadaan hitam tebal di baris atas, diikuti nama unit kerja asal di baris bawahnya dengan teks abu-abu sekunder (contoh: "Pengadaan Komputer Lab" / "Laboratorium Komputer").
  3. `TANGGAL`: Format tanggal Indonesia (contoh: "12 Okt 2026").
  4. `NILAI PENGAJUAN`: Nilai anggaran dalam format mata uang Rupiah (contoh: "Rp 185.000.000").
  5. `STATUS`: Status pill dengan dot warna (Menunggu Verifikasi biru, Sedang Diproses kuning/oranye, Disetujui hijau, Ditolak merah).
  6. `AKSI`: Tombol ikon mata (`Eye`) dengan border rounded halus untuk membuka modal detail permohonan.

---

## 2. Aturan Kepatuhan & Standar Kualitas

### 2.1 Kepatuhan antislop
- **R-01 & R-29 (Color Palette):** Menggunakan palet standar SIPBAJA: hijau institusional `#0E7C5A`, teks utama `#14201C`, teks sekunder `#5F6F6A`, border `#E4EBE8`, background card putih `#FFFFFF`, dan abu-abu lembut `#F9FBFA`.
- **R-02 (Copywriting):** Menghindari penggunaan karakter em dash (`—`) dalam teks antarmuka atau copy sistem. Digunakan tanda hubung biasa (`-`), titik dua (`:`), atau tanda kurung (`()`).
- **R-03 (Mobile Responsiveness):** Tampilan tabel menggunakan container `overflow-x-auto`, sidebar mendukung drawer responsif mobile dengan tombol tutup (X) dan *backdrop click*, serta grid kartu fleksibel dari 1 kolom (mobile) hingga 4 kolom (desktop).
- **R-09 & R-31 (Badges):** Badge pada kartu metrik membawa status fungsional konkret ("+N bulan ini", "Dalam antrean", "Perlu revisi"), bukan hiasan tanpa makna.
- **R-17 & R-38 (Real Data):** Menghubungkan seluruh metrik, tabel, dan grafik ke database riil via Service Layer. Tidak menggunakan data fiktif atau angka statis.
- **R-24 & R-26 (Functional Controls):** Seluruh tombol dan navigasi sidebar memiliki rute tujuan yang valid (`/perencanaan/dashboard`, `/perencanaan/pengajuan`, `/perencanaan/mak`, `/perencanaan/rkakl`).
- **R-27 (Three UI States):** Setiap komponen penyaji data menyediakan 3 kondisi lengkap: *Empty state* yang informatif, *Loading skeleton*, dan *Error state*.
- **R-32 (Keyboard Accessibility):** Navigasi tabel dan tombol dapat diakses dengan keyboard (`Tab`, `Enter`, `Space`), modal detail dapat ditutup dengan tombol `Escape`.

### 2.2 Kepatuhan antislop-code
- Komentar kode hanya ditulis jika ada aturan bisnis atau batasan teknis yang tidak langsung terlihat dari kode (maksimal 1-2 baris).
- Tidak ada komentar dekoratif berbentuk banner pembatas (`// =======`), tidak ada emoji pada komentar, dan tidak ada penomoran alur workflow di komentar kode.

### 2.3 Kepatuhan antislop-ui
- Visualisasi dashboard disesuaikan dengan fokus Tim Perencanaan: memantau permohonan masuk baru yang memerlukan verifikasi ketersediaan dana dan penugasan jenis MAK (BLU Fisik, BLU Non-Fisik, RM Fisik, RM Non-Fisik).

### 2.4 Kepatuhan Arsitektur (DEVELOPMENT_RULES.md)
- **Service Layer Wajib:** Logika bisnis dan query Eloquent ditempatkan di `app/Services/DashboardPerencanaanService.php`.
- **Controller Bersih:** `DashboardPerencanaanController.php` hanya bertindak sebagai orkestrator yang memanggil Service dan me-render Inertia view.
- **Atomic Design:**
  - *Atoms:* `StatusPill.jsx` (reusable).
  - *Molecules:* `StatCard.jsx` (reusable), `PerencanaanPermohonanRow.jsx`.
  - *Organisms:* `HeroBanner.jsx`, `StatistikChart.jsx`, `PerencanaanPermohonanTable.jsx`, `DetailPermohonanModal.jsx`.
  - *Templates:* `PerencanaanDashboardTemplate.jsx`.
  - *Pages:* `resources/js/Pages/Perencanaan/Dashboard.jsx`.
- **Pemisahan Logika & Presentasi:**
  - Custom hook: `resources/js/hooks/usePerencanaanDashboard.js`.
  - Pure utils: `resources/js/utils/formatPermohonan.js` (reusable).

---

## 3. Peta File yang Dibuat / Diubah

| File | Status | Keterangan |
|---|---|---|
| `app/Services/DashboardPerencanaanService.php` | Baru | Service penyedia data metrik ringkasan, antrean permohonan baru, riwayat pengadaan, dan statistik bulanan untuk Perencanaan |
| `app/Http/Controllers/DashboardPerencanaanController.php` | Ubah | Menginject `DashboardPerencanaanService` dan mengoper props data ke Inertia view |
| `app/Http/Controllers/PengajuanPerencanaanController.php` | Baru | Controller daftar pengajuan masuk yang perlu diverifikasi dan ditentukan MAK-nya oleh Perencanaan |
| `app/Http/Controllers/MakPerencanaanController.php` | Baru | Controller daftar 4 kategori MAK dan pejabat PPK terkait |
| `app/Http/Controllers/RkaklPerencanaanController.php` | Baru | Controller dokumen pagu anggaran RKAKL |
| `routes/web.php` | Ubah | Menyiapkan rute navigasi `/perencanaan/pengajuan`, `/perencanaan/mak`, `/perencanaan/rkakl`, dan pengunduhan dokumen surat |
| `resources/js/hooks/usePerencanaanDashboard.js` | Baru | Custom hook untuk kalkulasi turunan grafik dan state interaksi UI |
| `resources/js/components/molecules/PerencanaanPermohonanRow.jsx` | Baru | Baris tabel permohonan masuk dengan sub-label nama unit dan tombol aksi mata (eye icon) |
| `resources/js/components/organisms/PerencanaanPermohonanTable.jsx` | Baru | Tabel permohonan masuk terbaru khusus Perencanaan dengan 3 state lengkap |
| `resources/js/components/templates/PerencanaanDashboardTemplate.jsx` | Baru | Template tata letak dashboard Perencanaan menggabungkan shell, banner, 4 stat card, chart, dan table |
| `resources/js/Pages/Perencanaan/Dashboard.jsx` | Ubah | Halaman utama role Perencanaan yang menghubungkan props controller, hook, dan template |
| `resources/js/Pages/Perencanaan/Pengajuan/Index.jsx` | Baru | Halaman daftar permohonan masuk untuk diverifikasi oleh Tim Perencanaan |
| `resources/js/Pages/Perencanaan/Mak/Index.jsx` | Baru | Halaman daftar 4 kategori MAK dan penugasan PPK |
| `resources/js/Pages/Perencanaan/Rkakl/Index.jsx` | Baru | Halaman referensi dokumen pagu anggaran RKAKL |

---

## 4. Checklist Rencana Kerja Bertahap

### Fase 1 — Backend: Service Layer, Controller, & Routing

- [ ] **1.1** Buat Service `app/Services/DashboardPerencanaanService.php` dengan method:
  - `ringkasan(): array`
    - Menghitung `total` (seluruh permohonan yang diajukan ke sistem).
    - Menghitung `menunggu_verifikasi` (permohonan berstatus `diajukan` yang menunggu verifikasi anggaran & penentuan MAK oleh Perencanaan).
    - Menghitung `disetujui` (permohonan yang telah diverifikasi Perencanaan dengan status `menunggu_bidang2` atau `disetujui`).
    - Menghitung `ditolak` (permohonan yang ditolak pada tahap perencanaan).
    - Menghitung `tambahan_bulan_ini` (penambahan permohonan baru pada bulan berjalan untuk badge `+N bulan ini`).
    - Menghitung `disetujui_bulan_ini` (permohonan yang disetujui pada bulan berjalan untuk badge `+N bulan ini`).
  - `permohonanTerbaru(int $limit = 5): Collection`
    - Mengambil 4 s.d. 5 permohonan terbaru dari database dengan eager loading relasi `unit` dan `dokumen`.
    - Diurutkan berdasarkan `created_at DESC`.
  - `statistikBulanan(int $tahun): array`
    - Mengembalikan data 12 bulan (Jan - Des) yang menghitung permohonan disetujui dan ditolak pada tahun terpilih untuk grafik batang.
    - Menghitung total kumulatif disetujui dan ditolak untuk angka legenda grafik.
- [ ] **1.2** Perbarui `app/Http/Controllers/DashboardPerencanaanController.php`:
  - Menginject `DashboardPerencanaanService` melalui constructor dependency injection.
  - Memanggil `ringkasan()`, `permohonanTerbaru(5)`, dan `statistikBulanan($tahun)`.
  - Me-render `Perencanaan/Dashboard` dengan membawa props: `ringkasan`, `permohonanTerbaru`, `statistikBulanan`, `totalDisetujui`, `totalDitolak`, dan `tahunAktif`.
- [ ] **1.3** Buat controller pendukung sub-halaman:
  - `PengajuanPerencanaanController.php` (daftar pengajuan masuk dan filter status).
  - `MakPerencanaanController.php` (daftar 4 kategori MAK).
  - `RkaklPerencanaanController.php` (dokumen pagu anggaran RKAKL).
- [ ] **1.4** Perbarui `routes/web.php` pada grup middleware `role:Perencanaan`:
  - Daftarkan rute `/perencanaan/pengajuan`, `/perencanaan/mak`, `/perencanaan/rkakl`, dan `/perencanaan/permohonan/{permohonan}/dokumen` agar seluruh navigasi sidebar dan link tabel valid.

---

### Fase 2 — Frontend: Hook & State Management

- [ ] **2.1** Buat `resources/js/hooks/usePerencanaanDashboard.js`:
  - Menerima props `{ ringkasan, permohonanTerbaru, statistikBulanan, totalDisetujui, totalDitolak, tahunAktif }`.
  - Mengelola local UI state untuk toggle mode grafik (`Bulan` | `Tahun`).
  - Mengelola state pemilihan modal detail permohonan (`selectedPermohonan`, `setSelectedPermohonan`).
  - Mengembalikan objek state terstruktur: `{ ringkasan, permohonanTerbaru, chartData, totalDisetujui, totalDitolak, viewMode, setViewMode, tahunAktif, gantiTahun, selectedPermohonan, setSelectedPermohonan }`.

---

### Fase 3 — Frontend: Komponen Atomic Design

- [ ] **3.1** Buat molekul `resources/js/components/molecules/PerencanaanPermohonanRow.jsx`:
  - Menampilkan `NO PERMOHONAN` dalam format teks tebal hijau.
  - Menampilkan `JUDUL PENGADAAN` dengan nama unit kerja asal di baris keduanya (contoh: "Pengadaan Komputer Lab" dan "Laboratorium Komputer").
  - Menampilkan `TANGGAL` menggunakan fungsi `formatTanggal()`.
  - Menampilkan `NILAI PENGAJUAN` menggunakan fungsi `formatRupiah()`.
  - Menampilkan `STATUS` menggunakan komponen `StatusPill` (menyesuaikan varian label untuk Menunggu Verifikasi, Sedang Diproses, Disetujui, Ditolak).
  - Kolom `AKSI`: Tombol ikon mata (`Eye` dari `lucide-react`) dengan border rounded halus untuk membuka modal detail.
- [ ] **3.2** Buat organisme `resources/js/components/organisms/PerencanaanPermohonanTable.jsx`:
  - Header: judul "Permohonan Masuk Terbaru", subjudul jumlah permohonan masuk, dan tautan "Lihat Semua ->" ke `/perencanaan/pengajuan`.
  - Container tabel responsif dengan `overflow-x-auto`.
  - 3 state data wajib:
    - *Loading State:* skeleton baris animasi pulse.
    - *Empty State:* tampilan informatif "Belum ada permohonan masuk yang perlu diverifikasi".
    - *Error State:* pesan kegagalan pemuatan dengan saran muat ulang halaman.

---

### Fase 4 — Frontend: Template, Page, & Sub-Pages

- [ ] **4.1** Buat template `resources/js/components/templates/PerencanaanDashboardTemplate.jsx`:
  - Menggunakan `DashboardShellTemplate` sebagai layout induk.
  - Mengonfigurasi sidebar navigasi:
    - `Dashboard` (aktif, `/perencanaan/dashboard`).
    - `List Pengajuan` (`/perencanaan/pengajuan`, dengan badge angka `ringkasan.menunggu_verifikasi`).
    - `Jenis MAK` (`/perencanaan/mak`).
    - `Dokumen RKAKL` (`/perencanaan/rkakl`).
  - Mengonfigurasi `HeroBanner`:
    - Eyebrow: `DASHBOARD`.
    - Title: `Selamat datang, Tim Perencanaan`.
    - Description: `Pantau permohonan pengadaan yang masuk, serta kelola Jenis MAK dan Dokumen RKAKL.`
    - CTA Button: `Lihat Permohonan` yang mengarahkan ke `/perencanaan/pengajuan`.
  - Merender 4 kartu statistik (`Total Permohonan`, `Menunggu Verifikasi`, `Disetujui`, `Ditolak`) dengan badge kontekstual.
  - Merender `StatistikChart` dan `PerencanaanPermohonanTable`.
  - Mengintegrasikan `DetailPermohonanModal` untuk peninjauan berkas permohonan.
- [ ] **4.2** Perbarui halaman `resources/js/Pages/Perencanaan/Dashboard.jsx`:
  - Menggantikan placeholder `RoleDashboardTemplate` dengan `PerencanaanDashboardTemplate`.
  - Menghubungkan props dari controller Inertia dengan `usePerencanaanDashboard`.
- [ ] **4.3** Buat sub-halaman pendukung untuk navigasi yang utuh:
  - `resources/js/Pages/Perencanaan/Pengajuan/Index.jsx` (halaman daftar seluruh permohonan masuk dengan filter status).
  - `resources/js/Pages/Perencanaan/Mak/Index.jsx` (halaman referensi 4 kategori MAK kampus).
  - `resources/js/Pages/Perencanaan/Rkakl/Index.jsx` (halaman referensi dokumen pagu RKAKL).

---

### Fase 5 — Verifikasi, Kerapian Kode, & Pengujian

- [ ] **5.1** Jalankan formatter kode PHP: `vendor/bin/pint --dirty --format agent`.
- [ ] **5.2** Jalankan pengujian backend: `vendor/bin/phpunit` untuk memastikan seluruh 70+ test tetap lulus tanpa regresi.
- [ ] **5.3** Jalankan build frontend: `cmd.exe /c npm run build` untuk memverifikasi tidak ada error JSX atau missing bundle chunks.
- [ ] **5.4** Verifikasi browser:
  - Login dengan akun Tim Perencanaan (`perencanaan@pnj.ac.id`).
  - Pastikan redirect berhasil ke `/perencanaan/dashboard`.
  - Periksa tampilan hero banner, 4 stat cards, grafik batang SVG, tabel permohonan masuk terbaru, popover notifikasi, dan modal detail.
  - Uji responsivitas viewport mobile (< 768px) dan tombol drawer sidebar.
