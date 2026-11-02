# Plan: Halaman Detail Permohonan dan Catatan Penolakan (Role Pemohon)

**Tanggal:** 2026-11-02  
**Scope:** Implementasi halaman Detail Permohonan untuk role Pemohon (Jurusan/Unit/Bidang), mencakup ringkasan data pengajuan, kartu catatan penolakan dari pemeriksa (kondisional saat ditolak), pratinjau berkas surat permohonan (live preview dan unduh), stepper dan riwayat timeline proses lengkap, serta integrasi backend API.  
**Referensi Desain:**  
- `docs/design/detail_permohonan_jurusan.png` (Tampilan detail saat permohonan berstatus Ditolak dengan kartu Catatan dari Pemeriksa)  
- `docs/design/detail_permohonan_jurusan_ditolak.png` (Tampilan detail saat permohonan berstatus aktif/Menunggu Persetujuan dengan Live Preview surat permohonan dan Timeline Proses)  
**Dokumen Acuan:**  
- `docs/PRD.md` (Spesifikasi tracking status permohonan dan mekanisme revisi pengajuan)  
- `docs/DEVELOPMENT_RULES.md` (Arsitektur Service Layer, Controller by Role, API Contract)  
- `docs/DATABASE_SIPBAJA.md` (Tabel `permohonan`, `dokumen`, `approval_permohonan`, `status_history`, `units`, `users`)  
- `docs/design.md` (Token warna, tipografi Plus Jakarta Sans, card styling, stepper timeline)  
- `docs/API_CONTRACT.md` (Spesifikasi API `/api/v1/pemohon/permohonan/{id}`)  
- `.agents/skills` (`antislop`, `antislop-code`, `antislop-ui`)

---

## 1. Analisis Komprehensif Desain Mockup

Berdasarkan analisis visual terhadap kedua file desain:

### 1.1 Navigasi & Header Atas
- **Breadcrumb:** `LIST PERMOHONAN > DETAIL PERMOHONAN` (uppercase, teks kecil warna `#5F6F6A`, teks "LIST PERMOHONAN" dapat diklik untuk kembali ke daftar permohonan).
- **Topbar:** Standar SIPBAJA (tombol notifikasi bell dengan badge dot merah, profile pill Jurusan TIK dengan inisial "JT" dan label role "Jurusan/Unit/Bidang").
- **Sidebar:** Navigasi standar dengan menu aktif "List Permohonan" dan badge jumlah.

### 1.2 Hero Banner
- Latar hijau solid brand `#0E7C5A` dengan sudut melengkung `rounded-[24px]` dan aksen lingkaran konsentris putih transparan di sisi kanan.
- Eyebrow: `PERMOHONAN PENGADAAN` (uppercase putih 75%).
- Baris Judul:
  - Judul: "Detail Permohonan" (putih tebal 24-26px).
  - Status Pill dinamis tepat di samping judul:
    - Contoh Ditolak: `• Ditolak` (pill merah: bg `#FDECEC`, teks `#B42318`, dot `#E5484D`).
    - Contoh Menunggu: `• Menunggu Persetujuan` (pill biru: bg `#E8F0FF`, teks `#1F55C7`, dot `#2F6FED`).
    - Contoh Disetujui: `• Disetujui` (pill hijau: bg `#E4F6EC`, teks `#0B7A4E`, dot `#12A06B`).
- Subtitle: `Nomor {nomor_surat} · Diajukan {tanggal_pengajuan_lengkap}` (contoh: `Nomor 111-FFF-111 · Diajukan 04 Maret 2027`).
- Aksi Kanan: Tombol `← Kembali` (tombol rounded semi-transparan/putih untuk navigasi kembali ke `/pemohon/permohonan`).

### 1.3 Card 1: Informasi Permohonan
- Judul: "Informasi Permohonan" (tebal 18-20px text `#14201C`) dengan subtitle "Ringkasan data yang diajukan" (`#5F6F6A`).
- Grid 2 kolom di desktop (1 kolom di mobile):
  - Kolom Kiri:
    1. **Nomor Permohonan:** Ikon `#` dalam kotak hijau-tint (`#EEF5F2`), label "Nomor Permohonan", nilai e.g. "01010-FF-11" / "111-FFF-111" (bold).
    2. **Judul Permohonan:** Ikon dokumen hijau-tint, label "Judul Permohonan", nilai e.g. "Pengadaan Komputer Lab" (bold).
    3. **Nominal/Estimasi:** Ikon uang hijau-tint, label "Nominal/Estimasi", nilai e.g. "Rp185.000.000" (bold).
  - Kolom Kanan:
    4. **Tanggal Pengajuan:** Ikon kalender hijau-tint, label "Tanggal Pengajuan", nilai e.g. "12 Oktober 2026" (bold).
    5. **Diajukan Oleh:** Ikon gedung/organisasi hijau-tint, label "Diajukan Oleh", nilai e.g. "Jurusan Teknik Informatika & Komputer" (bold).
    6. **Status:** Ikon denyut/status hijau-tint, label "Status", nilai komponen `StatusPill`.

### 1.4 Card 2: Catatan dari Pemeriksa (Kondisional: Khusus Status Ditolak)
- Tampil sebagai kartu berbingkai merah halus (`border-[#FECDCA]` dan shadow lembut) ketika permohonan berstatus `ditolak`:
  - Ikon peringatan segitiga merah (`AlertTriangle` `#E5484D` di dalam kotak merah-tint `#FEE4E2`).
  - Baris Header:
    - Eyebrow: `CATATAN DARI PEMERIKSA` (teks kecil merah uppercase).
    - Judul: `Permohonan Ditolak` (tebal 18px text `#14201C`).
    - Keterangan Kanan: `Tim Perencanaan · Diperiksa 05 Maret 2027, 14:20` (menampilkan peran pemeriksa dan waktu pemeriksaan).
  - Kotak Konten Alasan:
    - Latar pink-merah sangat lembut (`#FFF7F7` dengan border `#FECDCA`), label "Alasan Penolakan" (merah tebal).
    - Teks alasan penolakan nyata dari database (contoh: spesifikasi belum rinci, RAB tidak sesuai, dsb.).
  - Tombol Tindakan CTA:
    - Tombol `Perbaiki & Ajukan Ulang` (ikon refresh/edit `RotateCcw`, latar hijau brand `#0E7C5A`, teks putih, min-h 44px).
    - Menghubungkan pemohon ke formulir revisi permohonan (`/pemohon/permohonan/create?revisi_dari={id}` atau modal revisi).

### 1.5 Card 3: Surat Permohonan & Pratinjau Dokumen
- Judul: "Surat Permohonan" dengan subtitle "Dokumen yang dilampirkan pemohon" atau "Pratinjau dokumen yang dilampirkan pemohon".
- Badge opsional di kanan: `• Live Preview` (pill hijau-tint).
- Kartu Berkas Terlampir:
  - Ikon PDF merah dalam kotak rounded.
  - Nama berkas asli (contoh: `Surat_Permohonan_Pengadaan_Komputer_TIK.pdf`), ukuran berkas (contoh: `PDF · 8 MB`).
  - Tombol aksi:
    - `Lihat` (ikon mata `Eye`, tombol putih berbingkai border, membuka preview atau tab baru).
    - `Unduh` (ikon unduh `Download`, tombol hijau brand solid `#0E7C5A`, langsung mengunduh berkas fisik).
- Wadah Live Preview Interaktif:
  - Pratinjau visual surat pengadaan resmi berkop lembaga (menampilkan nomor surat, perihal, tanggal, dan isi ringkasan).
  - Indikator halaman di bagian bawah ("Halaman 1 dari 2").

### 1.6 Card 4: Timeline Proses
- Judul: "Timeline Proses" dengan subtitle "Riwayat tahapan permohonan".
- Stepper 5 Tahap Alur SIPBAJA:
  1. **Permohonan:** Status "Disetujui" (ikon ceklis hijau), "Ditolak" (ikon silang merah), atau "Menunggu Persetujuan" (ikon biru).
  2. **Pengadaan:** "Menunggu proses pengadaan" (ikon abu-abu/in-progress).
  3. **Pembelian Barang:** "Menunggu pembelian barang".
  4. **Penerimaan Barang:** "Menunggu barang diterima".
  5. **Selesai:** "Menunggu penyelesaian".
- Daftar Riwayat Perubahan Status (Log Linier):
  - Garis vertikal timeline dengan dot indikator (merah untuk penolakan, hijau/teal untuk event terbaru, abu-abu untuk tahap sebelumnya).
  - Kolom waktu (format `DD-MM-YYYY HH:mm`, contoh: `05-03-2027 14:20`).
  - Teks deskripsi kejadian:
    - Contoh: "Permohonan ditolak oleh Pemeriksa. Lihat catatan pemeriksa untuk alasan penolakan."
    - Contoh: "Permohonan diajukan oleh Jurusan Teknik Informatika & Komputer"
    - Contoh: "Surat permohonan berhasil diunggah"
    - Contoh: "Draft permohonan dibuat"
- Tombol Ekspansi Riwayat:
  - Tautan "Tampilkan Lebih Sedikit ^" / "Tampilkan Lebih Banyak v" untuk melipat atau memperluas seluruh daftar log riwayat.

### 1.7 Adaptasi Tata Letak (Layout Variants)
- **Varian 1 (Status Ditolak):** Layout tersusun secara vertikal bertumpuk (Informasi Permohonan -> Catatan dari Pemeriksa -> Surat Permohonan -> Timeline Proses).
- **Varian 2 (Status Menunggu / Disetujui):** Layout 2 kolom berdampingan pada layar desktop lebar (Informasi Permohonan di atas melintang penuh, lalu 2 kolom: Surat Permohonan dengan Live Preview di sisi kiri, dan Timeline Proses di sisi kanan). Pada layar mobile/tablet otomatis reflow menjadi 1 kolom.

---

## 2. Kepatuhan Ketat Aturan Antislop

Penerapan aturan dari folder `.agents/skills`:

### 2.1 Antislop Core & UI (`antislop`, `antislop-ui`)
- **Mode Eksekusi:** `during` (pencegahan sejak awal perencanaan).
- **Larangan Karakter Em Dash (R-02):** Dilarang memakai karakter em dash (`—`) pada seluruh salinan teks UI, tombol, maupun dokumen kode. Gunakan tanda hubung biasa (`-`), titik dua (`:`), tanda kurung, atau titik tengah (`·`).
- **Warna & Palet SIPBAJA (R-01, R-29):** Gunakan token warna konsisten (`brand: #0E7C5A`, `canvas: #F3F6F5`, `surface: #FFFFFF`, `border: #E4EBE8`, `danger: #B42318`). Dilarang memakai gradien ungu-biru AI, background mesh, atau efek glow neon.
- **Responsivitas & Tap Target (R-03):** Seluruh tombol dan kontrol interaktif (tombol Kembali, Lihat, Unduh, Perbaiki, Toggle Timeline) memiliki tinggi minimal 44px dan aman dari overflow di perangkat mobile.
- **Kelengkapan Tiga State UI (R-27):**
  - **Loading State:** Skeleton card shimmer untuk kartu Informasi Permohonan, berkas dokumen, dan timeline saat data dimuat.
  - **Empty/Not Found State:** Tampilan informatif jika ID permohonan tidak ditemukan atau bukan milik unit pemohon dengan tombol navigasi kembali.
  - **Error State:** Pesan kegagalan komunikasi API dengan tombol "Coba Lagi".
- **Aksesibilitas (R-25, R-32):**
  - Seluruh teks memenuhi rasio kontras WCAG AA (minimal 4.5:1).
  - Navigasi keyboard penuh (`Tab` / `Shift+Tab`, `Enter` / `Space`, indikator `focus-visible:ring-2 focus-visible:ring-[#0E7C5A]`).
- **Integritas Kontrol Interaktif (R-26):** Dilarang membuat kontrol buntu. Tombol Kembali memicu navigasi balik, tombol Unduh memanggil endpoint download riil, tombol Lihat membuka preview riil, tombol Perbaiki membuka alur resubmit.

### 2.2 Higienitas Komentar Kode (`antislop-code`)
- Tanpa banner pemisah dekoratif (`// =======================`).
- Tanpa narasi langkah berulang (`// Step 1:`, `// Step 2:`).
- Tanpa emoji dekoratif dalam komentar kode (`// ✅ Approval`).
- Komentar hanya menjelaskan aturan bisnis, otorisasi unit, struktur relasi, atau batasan platform.

---

## 3. Peta File yang Dibuat / Diubah

| File | Tipe | Perubahan / Tujuan |
|---|---|---|
| `backend/app/Services/PermohonanService.php` | Backend Service | Tambah method `detailPermohonan(User $user, Permohonan $permohonan): array` yang mengagregasikan informasi unit, creator, dokumen, catatan penolakan dari `ApprovalPermohonan`, dan riwayat `status_history`. |
| `backend/app/Http/Controllers/Pemohon/PermohonanPemohonController.php` | Controller | Tambah method `show(Request $request, Permohonan $permohonan): JsonResponse` dengan otorisasi unit pemohon. |
| `backend/routes/api.php` | Routes | Daftarkan route `GET /api/v1/pemohon/permohonan/{permohonan}` di bawah prefix `pemohon`. |
| `backend/tests/Feature/Pemohon/PermohonanDetailTest.php` | Feature Test | Pengujian komprehensif: detail permohonan, proteksi cross-unit, status ditolak beserta catatan alasan penolakan, dan riwayat status history. |
| `frontend/src/types/permohonan.ts` | Frontend Types | Tambah interface `PermohonanDetailData`, `CatatanPenolakanData`, `TimelineHistoryItem`, `TimelineStageInfo`. |
| `frontend/src/router/index.tsx` | Router | Daftarkan route `/pemohon/permohonan/:id` yang memetakan ke halaman `Show.tsx`. |
| `frontend/src/components/molecules/CatatanPenolakanCard.tsx` | Molecule Component | Komponen alert catatan dari pemeriksa dengan kotak alasan penolakan dan tombol CTA "Perbaiki & Ajukan Ulang". |
| `frontend/src/components/molecules/TimelineStepper.tsx` | Molecule Component | Komponen stepper 5 tahap alur pengadaan dengan indikator ikon dinamis (ceklis, silang merah, menunggu). |
| `frontend/src/components/organisms/TimelineProsesCard.tsx` | Organism Component | Komponen kartu timeline lengkap dengan stepper proses, riwayat log linier bertimestamp, dan tombol toggle ekspansi. |
| `frontend/src/components/organisms/SuratPermohonanCard.tsx` | Organism Component | Komponen kartu dokumen surat permohonan dengan tombol Lihat, Unduh, dan wadah Live Preview interaktif. |
| `frontend/src/pages/Pemohon/Permohonan/Show.tsx` | Page Component | Halaman utama Detail Permohonan yang menyatukan breadcrumb, HeroBanner, Informasi Permohonan, Catatan Penolakan, Surat Permohonan, dan Timeline Proses. |
| `frontend/src/pages/Pemohon/Permohonan/Index.tsx` | Page Component | Perbarui aksi klik nomor surat dan opsi kebab menu agar mengarahkan navigasi langsung ke halaman detail `/pemohon/permohonan/:id`. |
| `docs/API_CONTRACT.md` | Dokumentasi | Dokumentasikan spesifikasi endpoint `GET /api/v1/pemohon/permohonan/{id}`. |

---

## 4. Checklist Implementasi Terstruktur

### Fase 1: Backend Service, Controller, Route & PHPUnit Feature Test

- [x] **1.1** Tambahkan method `detailPermohonan(User $user, Permohonan $permohonan): array` di `backend/app/Services/PermohonanService.php`:
  - Validasi otorisasi: pastikan `$permohonan->unit_id === $user->unit_id` (kecuali user memiliki role peninjau global). Jika tidak cocok, lempar `abort(403, 'Akses ditolak untuk unit lain.')`.
  - Eager load relasi: `Unit`, `Creator`, `Dokumen`, `ApprovalPermohonan.Actor.Role`, `StatusHistory.Actor.Role`.
  - Ambil dokumen surat permohonan terbaru (`tipe_dokumen = 'surat_permohonan'`).
  - Ekstraksi catatan penolakan: jika status saat ini `ditolak`, cari baris `ApprovalPermohonan` terbaru dengan keputusan `ditolak`, ambil `alasan`, nama aktor pemeriksa, peran pemeriksa (misal "Tim Perencanaan" atau "Bidang 2"), serta waktu pemeriksaan (`diperiksa_at`).
  - Format data riwayat `status_history`: urutkan `created_at desc`, format timestamp `DD-MM-YYYY HH:mm`, sertakan nama aktor dan peran.
  - Tentukan status 5 tahapan stepper:
    - Tahap 1 (Permohonan): `disetujui`, `ditolak`, atau `menunggu`.
    - Tahap 2 (Pengadaan): `aktif`, `menunggu`, atau `selesai`.
    - Tahap 3 (Pembelian Barang): `menunggu`, `aktif`, atau `selesai`.
    - Tahap 4 (Penerimaan Barang): `menunggu`, `aktif`, atau `selesai`.
    - Tahap 5 (Selesai): `menunggu` atau `selesai`.

- [x] **1.2** Tambahkan method `show(Request $request, Permohonan $permohonan): JsonResponse` di `backend/app/Http/Controllers/Pemohon/PermohonanPemohonController.php`:
  - Panggil `PermohonanService::detailPermohonan($request->user(), $permohonan)`.
  - Kembalikan response JSON terstruktur (`{ "permohonan": { ... } }`) dengan HTTP 200.

- [x] **1.3** Daftarkan route di `backend/routes/api.php`:
  - Tambahkan `Route::get('permohonan/{permohonan}', [PermohonanPemohonController::class, 'show'])->name('api.pemohon.permohonan.show');` di dalam grup route `pemohon`.

- [x] **1.4** Buat feature test `backend/tests/Feature/Pemohon/PermohonanDetailTest.php`:
  - Test guest tidak bisa mengakses detail permohonan (401).
  - Test pemohon dapat melihat detail permohonan miliknya sendiri (200).
  - Test pemohon dilarang melihat permohonan milik unit kerja lain (403).
  - Test struktur response mencakup dokumen, data unit, dan riwayat status timeline.
  - Test permohonan dengan status `ditolak` menyertakan alasan penolakan dan data pemeriksa.

- [x] **1.5** Jalankan formatter dan pengujian:
  - Eksekusi `vendor/bin/pint --dirty --format agent` di folder backend.
  - Jalankan test `php artisan test --filter=PermohonanDetailTest` dan pastikan seluruh test hijau.

---

### Fase 2: Sinkronisasi API Contract & Frontend TypeScript Types

- [x] **2.1** Perbarui dokumentasi di `docs/API_CONTRACT.md`:
  - Tambahkan detail spesifikasi endpoint `GET /api/v1/pemohon/permohonan/{permohonanId}`.
  - Catat struktur response JSON sukses (data permohonan, catatan penolakan, dokumen, timeline stepper, riwayat log).
  - Catat respons error 403 (akses unit lain) dan 404 (data tidak ditemukan).

- [x] **2.2** Perbarui definisi tipe di `frontend/src/types/permohonan.ts`:
  - Interface `CatatanPenolakanData`: `alasan: string`, `pemeriksa_peran: string`, `pemeriksa_nama: string`, `diperiksa_at: string`.
  - Interface `TimelineHistoryItem`: `id: number`, `status_lama?: string | null`, `status_baru: string`, `deskripsi: string`, `actor_nama?: string | null`, `actor_role?: string | null`, `waktu: string`.
  - Interface `TimelineStageInfo`: `tahap: string`, `label: string`, `status: 'completed' | 'active' | 'rejected' | 'pending'`, `keterangan: string`.
  - Interface `PermohonanDetailResponse`: `permohonan: PermohonanItem & { unit_nama: string; pembuat_nama: string; catatan_penolakan?: CatatanPenolakanData | null; timeline_stages: TimelineStageInfo[]; history: TimelineHistoryItem[]; live_preview_data?: unknown }`.

---

### Fase 3: Komponen Molecules & Organisms

- [x] **3.1** Buat komponen `frontend/src/components/molecules/CatatanPenolakanCard.tsx`:
  - Bingkai luar merah halus (`bg-white border border-[#FECDCA] rounded-[24px] p-6 shadow-sm`).
  - Baris atas: Ikon `AlertTriangle` di kotak merah lembut, eyebrow `CATATAN DARI PEMERIKSA`, judul `Permohonan Ditolak`, dan info pemeriksa di sebelah kanan.
  - Kotak isi: Latar lembut `#FFF7F7`, label "Alasan Penolakan", teks alasan penolakan.
  - Tombol CTA: "+ Perbaiki & Ajukan Ulang" (ikon `RotateCcw`, warna hijau brand `#0E7C5A`, min-h 44px).
  - Prop `onRevisi`: Callback untuk memicu navigasi ke form revisi.

- [x] **3.2** Buat komponen `frontend/src/components/molecules/TimelineStepper.tsx`:
  - Merender 5 tahapan alur horizontal dengan garis penghubung:
    1. Permohonan (ikon ceklis hijau jika disetujui, silang merah jika ditolak, jam biru jika menunggu)
    2. Pengadaan
    3. Pembelian Barang
    4. Penerimaan Barang
    5. Selesai
  - Menampilkan judul tahap dan sub-keterangan status per tahap.
  - Responsif: Beradaptasi dengan scroll horizontal atau reflow vertikal pada layar sempit.

- [x] **3.3** Buat komponen `frontend/src/components/organisms/TimelineProsesCard.tsx`:
  - Membungkus `TimelineStepper` di bagian atas.
  - Daftar linier riwayat perubahan status di bawahnya dengan penanda titik bulat berwarna dan garis vertikal.
  - Format waktu di kolom kiri (`05-03-2027 14:20`).
  - Deskripsi perubahan status dan aktor di kolom kanan.
  - Tombol interaktif "Tampilkan Lebih Sedikit ^" / "Tampilkan Lebih Banyak v" untuk melipat log riwayat yang panjang.

- [x] **3.4** Buat komponen `frontend/src/components/organisms/SuratPermohonanCard.tsx`:
  - Header: Judul "Surat Permohonan", deskripsi, dan badge pill `• Live Preview` opsional.
  - Baris berkas: Ikon file PDF, nama file asli, ukuran file, tombol `Lihat` dan `Unduh`.
  - Wadah Live Preview:
    - Merender mockup pratinjau surat resmi berkop lembaga (nama jurusan, nomor surat, perihal, tanggal, estimasi nominal, garis tanda tangan) atau iframe dokumen jika tersedia.
    - Footer badge "Halaman 1 dari 2".
  - Tombol `Lihat` membuka modal pratinjau penuh atau tab baru.
  - Tombol `Unduh` memicu pengunduhan berkas fisik ke komputer pemohon.

---

### Fase 4: Halaman Utama Detail Permohonan (`Show.tsx`) & Integrasi Router

- [x] **4.1** Buat halaman `frontend/src/pages/Pemohon/Permohonan/Show.tsx`:
  - Hook `useParams` untuk membaca parameter `:id` permohonan.
  - Pemanggilan API ke `/api/v1/pemohon/permohonan/${id}` menggunakan Axios.
  - State penanganan 3 kondisi (Loading skeleton, Error dengan tombol Coba Lagi, Data ditampilkan).
  - Breadcrumb di bagian paling atas: `LIST PERMOHONAN > DETAIL PERMOHONAN` (link ke `/pemohon/permohonan`).
  - HeroBanner dinamis:
    - Eyebrow `PERMOHONAN PENGADAAN`.
    - Judul "Detail Permohonan" berdampingan dengan `StatusPill`.
    - Subtitle `Nomor {nomor_surat} · Diajukan {tanggal}`.
    - Tombol `← Kembali` memicu `navigate('/pemohon/permohonan')`.
  - Card Informasi Permohonan: Grid 6 item (Nomor Permohonan, Judul Permohonan, Nominal/Estimasi, Tanggal Pengajuan, Diajukan Oleh, Status).
  - Tampilan kondisional:
    - Jika status `ditolak`: Tampilkan `CatatanPenolakanCard` tepat di bawah Informasi Permohonan, diikuti `SuratPermohonanCard` dan `TimelineProsesCard`.
    - Jika status aktif/lainnya: Tampilkan layout 2 kolom (Surat Permohonan dengan Live Preview di kiri, Timeline Proses di kanan) sesuai `detail_permohonan_jurusan_ditolak.png`.

- [x] **4.2** Daftarkan rute di `frontend/src/router/index.tsx`:
  - Import `PemohonPermohonanShow` dari `../pages/Pemohon/Permohonan/Show`.
  - Tambahkan route `<Route path="/pemohon/permohonan/:id" element={<PemohonPermohonanShow />} />` di dalam grup peran `Pemohon`.

---

### Fase 5: Penyelarasan Navigasi di Halaman List Permohonan & Responsivitas Mobile

- [x] **5.1** Perbarui `frontend/src/pages/Pemohon/Permohonan/Index.tsx`:
  - Ubah klik tombol nomor surat pada tabel agar melakukan navigasi `navigate('/pemohon/permohonan/' + row.id)`.
  - Ubah opsi aksi kebab "Lihat Detail" agar mengarahkan ke halaman detail `/pemohon/permohonan/:id`.

- [x] **5.2** Verifikasi Tata Letak Mobile & Responsivitas:
  - Pada layar mobile (< 768px), layout 2 kolom pada halaman detail berubah menjadi tumpukan vertikal 1 kolom yang rapi.
  - Stepper timeline mendukung pembungkusan responsif tanpa overflow horizontal.
  - Seluruh tombol aksi memiliki tinggi minimum target sentuh 44px.

---

### Fase 6: Standar Higienitas Kode & Audit Kepatuhan Antislop

- [x] **6.1** Audit dan Eliminasi Tanda Em Dash (R-02):
  - Periksa seluruh file baru dan file yang diubah (`grep -n "—" frontend/src/...`).
  - Ganti setiap karakter em dash dengan tanda hubung strip biasa, titik dua, atau tanda kurung.

- [x] **6.2** Audit Higienitas Komentar Kode (`antislop-code`):
  - Pastikan tidak ada banner karakter seperti `// =======` atau `/* ---- */`.
  - Pastikan tidak ada komentar yang mengulang kode yang sudah jelas.
  - Pastikan tidak ada emoji dalam komentar kode.
  - Pastikan tidak ada narasi langkah (`// Step 1:`, `// Step 2:`).

- [x] **6.3** Audit Desain UI & Token (`antislop-ui`):
  - Pastikan warna dan token mengikuti `docs/design.md`.
  - Pastikan tidak ada elemen interaktif mati atau tautan tanpa aksi.
  - Pastikan ring fokus keyboard jelas terlihat dengan kontras tinggi (R-32).

---

### Fase 7: Pengujian, Formatting & Delivery Gate (R-35)

- [ ] **7.1** Backend Code Styling:
  - Jalankan `vendor/bin/pint --dirty --format agent` di folder backend.

- [ ] **7.2** Backend Test Execution:
  - Jalankan `php artisan test --compact` untuk memastikan seluruh suite backend lolos tanpa regresi.

- [ ] **7.3** Frontend TypeScript Check & Bundling:
  - Jalankan pemeriksaan tipe: `npx tsc -b` di folder frontend.
  - Jalankan build frontend: `npm run build` di folder frontend dan pastikan tidak ada error manifest atau asset.

- [ ] **7.4** Verifikasi Manual Antarmuka (Browser Checklist):
  - Buka halaman list permohonan `/pemohon/permohonan`.
  - Klik nomor surat atau tombol aksi "Lihat Detail" pada permohonan berstatus "Menunggu Persetujuan".
  - Pastikan halaman detail menampilkan layout 2 kolom (Live Preview di kiri, Timeline di kanan).
  - Buka permohonan yang berstatus "Ditolak".
  - Pastikan muncul kartu "Catatan dari Pemeriksa" dengan alasan penolakan dan tombol "Perbaiki & Ajukan Ulang".
  - Uji tombol "Lihat" dan "Unduh" berkas surat permohonan.
  - Uji tombol toggle riwayat timeline ("Tampilkan Lebih Sedikit" / "Tampilkan Lebih Banyak").
  - Uji tombol "← Kembali" dan breadcrumb "LIST PERMOHONAN" untuk kembali ke daftar.
  - Uji navigasi keyboard menggunakan `Tab`, `Shift+Tab`, dan `Enter`.

