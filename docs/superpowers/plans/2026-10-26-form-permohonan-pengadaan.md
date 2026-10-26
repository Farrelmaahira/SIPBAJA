# Plan: Formulir Permohonan Pengadaan (Role Pemohon)

**Tanggal:** 2026-10-26  
**Scope:** Halaman formulir pengajuan permohonan pengadaan barang dan jasa untuk role Pemohon (Jurusan/Unit/Bidang), mencakup backend Form Request, Service layer (transaksi `permohonan`, `dokumen`, `status_history`), Controller, routing, dan frontend template berbasis Atomic Design.  
**Referensi Desain:** `docs/design/form_permohonan_pengadaan.png`

---

## 1. Analisis Desain (`form_permohonan_pengadaan.png`)

Desain terdiri dari tiga zona visual utama dalam satu tampilan dashboard shell:

1. **Hero Banner Permohonan:**
   - Latar belakang hijau `#0E7C5A` dengan aksen lengkungan organik halus khas SIPBAJA.
   - Eyebrow teks: `PERMOHONAN BARU`.
   - Judul: `Buat Permohonan Pengadaan`.
   - Subjudul: `Lengkapi data berikut untuk membuat permohonan pengadaan.`
   - Tombol aksi navigasi di kanan: `← Kembali` (mengarahkan kembali ke Dashboard Pemohon).

2. **Form Card Utama (Kolom Kiri - Lebar 2/3):**
   - Header bagian: Ikon dokumen hijau muda (`#E4F6EC`), judul `Detail Pengadaan`, dan keterangan `Kolom bertanda * wajib diisi.`
   - **Input Judul Pengadaan:** Input teks dengan placeholder `Contoh: Pengadaan Komputer Lab` dan helper text informatif `Tulis judul yang singkat dan jelas sesuai barang atau jasa yang diajukan.`
   - **Input Nominal / Estimasi Anggaran:** Input grup dengan prefix `Rp` tetap di sisi kiri dan format nilai rupiah terpisah.
   - **Dropzone Upload Surat Permohonan:** Area upload bergaris putus-putus hijau (`#A3D9C9`, bg `#F2F9F6`), ikon awan panah upload, panduan `Klik untuk upload atau drag & drop`, dan spesifikasi tipe berkas `PDF (Maks 10MB)`.
   - **Footer Form:** Keterangan bantuan (ikon info + `Permohonan diteruskan ke tim verifikasi setelah dikirim.`) dan tombol CTA utama `Kirim Permohonan` (warna hijau `#0E7C5A` dengan ikon pesawat kertas / kirim).

3. **Panel Informasi Pendukung (Kolom Kanan - Lebar 1/3):**
   - **Kartu Alur Permohonan:**
     - Stepper 4 tahap:
       1. `Isi Formulir` (Aktif: badge hijau `Anda di sini`)
       2. `Menunggu Persetujuan` (Badge biru)
       3. `Proses Pengadaan` (Badge kuning/oranye)
       4. `Selesai` (Badge hijau)
     - Deskripsi singkat di setiap tahapan agar pemohon memahami tahapan verifikasi berikutnya.
   - **Kartu "Sebelum Mengirim":**
     - Kartu tips verifikasi mandiri dengan latar hijau lembut (`#F2F9F6`) dan ikon perisai (`ShieldCheck`).
     - Tiga poin checklist konfirmasi:
       - Judul sesuai kebutuhan pengadaan
       - Estimasi anggaran sesuai RAB
       - Surat permohonan berformat PDF dan terbaca jelas

---

## 2. Penerapan Aturan Ketat

### 2.1 Antislop UI & Accessibility (antislop-ui, antislop-human)
- **Error States:** Validasi error ditampilkan tepat di bawah masing-masing input secara inline dengan pesan yang jelas (bukan alert generik).
- **Interactive Dropzone:** Dropzone mendukung klik pilih berkas, *drag and drop*, keyboard focus, indikator visual saat file sedang di-drag, serta kartu pratinjau nama & ukuran file terpilih dengan tombol ganti/hapus file.
- **Button Feedback:** Tombol `Kirim Permohonan` menampilkan indikator loading/disabled ("Mengirim...") saat proses submit berlangsung untuk mencegah klik ganda.
- **Kontras & Spacing:** Menggunakan palet SIPBAJA (`#0E7C5A`, `#E4F6EC`, `#1F55C7`, `#B45309`, `#12A06B`) dengan hierarki teks jelas dan padding terukur (bebas dekorasi generik yang berlebihan).
- **Responsive Layout:** Menggunakan grid 1 kolom pada layar kecil/tablet dan 3 kolom pada desktop (`lg:grid-cols-3`, 2 kolom form + 1 kolom info) agar tidak berjejal.

### 2.2 Antislop Code & Hygiene (antislop-code)
- Kode bebas dari komentar AI bertele-tele atau obrolan mesin.
- Hanya memelihara komentar teknis substantif (misalnya rujukan aturan bisnis dan validasi).

### 2.3 Arsitektur Backend (DEVELOPMENT_RULES.md)
- **Form Request:** Seluruh validasi dan otorisasi input masuk ditangani oleh `app/Http/Requests/SimpanPermohonanRequest.php` dengan pesan berbahasa Indonesia.
- **Service Layer:** Logika pembuatan permohonan, penyimpanan berkas dokumen terenkripsi hash, pencatatan status awal, dan riwayat status berada di `app/Services/PermohonanService.php` dalam satu database transaction (`DB::transaction`).
- **Controller Bersih:** `PermohonanPemohonController` hanya memanggil form request, meneruskan data terverifikasi ke Service, lalu mengembalikan respons/redirect Inertia. Tidak ada query Eloquent langsung di Controller.

---

## 3. Peta File yang Dibuat / Diubah

| File | Tindakan | Deskripsi |
|---|---|---|
| `app/Http/Requests/SimpanPermohonanRequest.php` | Baru | Form Request validasi `judul`, `estimasi_anggaran`, `nomor_surat`, `ringkasan_tujuan`, dan `file_dokumen` (PDF max 10MB) |
| `app/Services/PermohonanService.php` | Baru | Service transaksi penyimpanan permohonan, dokumen, dan status history |
| `app/Http/Controllers/PermohonanPemohonController.php` | Baru | Controller untuk halaman create & aksi store permohonan pemohon |
| `routes/web.php` | Ubah | Mendaftarkan route `pemohon.permohonan.create` dan `pemohon.permohonan.store` |
| `resources/js/components/atoms/DropzoneUpload.jsx` | Baru | Komponen atom upload drag & drop file PDF dengan validasi ukuran & pratinjau |
| `resources/js/components/molecules/MoneyInput.jsx` | Baru | Input rupiah dengan formatting angka dan prefix Rp terpadu |
| `resources/js/components/molecules/AlurStepperItem.jsx` | Baru | Komponen molekul baris tahapan alur permohonan |
| `resources/js/components/organisms/PermohonanFormCard.jsx` | Baru | Organism kartu formulir input pengadaan |
| `resources/js/components/organisms/AlurPermohonanCard.jsx` | Baru | Organism panel tahapan alur permohonan |
| `resources/js/components/organisms/PanduanPengajuanCard.jsx` | Baru | Organism kartu panduan verifikasi "Sebelum Mengirim" |
| `resources/js/components/templates/PermohonanCreateTemplate.jsx` | Baru | Template tata letak halaman pembuatan permohonan |
| `resources/js/Pages/Pemohon/Permohonan/Create.jsx` | Baru | Inertia page penghubung form Inertia `useForm` ke template |
| `resources/js/Pages/Pemohon/Dashboard.jsx` | Ubah | Mengarahkan tombol "Buat Permohonan" ke `route('pemohon.permohonan.create')` |
| `resources/js/components/templates/PemohonDashboardTemplate.jsx` | Ubah | Mengarahkan aksi empty-state "Buat permohonan pertama Anda" ke rute create |
| `tests/Feature/PermohonanPemohonTest.php` | Baru | Feature test validasi, upload file, persistensi database, dan otorisasi role |

---

## 4. Checklist Implementasi

### Fase 1 — Backend: Request, Service & Controller

- [x] **1.1** Buat `app/Http/Requests/SimpanPermohonanRequest.php`:
  - Otorisasi: Pastikan user memiliki role `Pemohon` dan memiliki `unit_id` valid.
  - Rules:
    - `judul`: required, string, max: 255
    - `estimasi_anggaran`: required, numeric, min: 1000
    - `nomor_surat`: required (atau fallback auto-generate jika dikonfirmasi pengguna), string, max: 100
    - `ringkasan_tujuan`: required (atau diambil dari judul jika tidak ditampilkan terpisah di form), string
    - `file_dokumen`: required, file, mimes:pdf, max: 10240 (10 MB sesuai PRD)
  - Messages: Seluruh pesan validasi dalam Bahasa Indonesia yang ramah dan jelas.

- [x] **1.2** Buat `app/Services/PermohonanService.php`:
  - Method `simpanPermohonan(User $user, array $data, UploadedFile $file): Permohonan`
  - Dibungkus dalam `DB::transaction()`:
    1. Simpan baris ke tabel `permohonan` (`unit_id`, `created_by`, `nomor_surat`, `judul`, `ringkasan_tujuan`, `estimasi_anggaran`, `revisi_ke = 0`, `status = 'diajukan'`).
    2. Simpan fisik file ke disk `local` (`app/private/dokumen/permohonan/`) dengan nama hash yang aman (PRD 54).
    3. Simpan baris ke tabel `dokumen` (`ref_type = 'permohonan'`, `ref_id = $permohonan->id`, `tipe_dokumen = 'surat_permohonan'`, `versi = 1`, `nama_asli`, `nama_hash`, `mime_type`, `ukuran_bytes`, `uploaded_by`).
    4. Simpan baris awal ke tabel `status_history` (`ref_type = 'permohonan'`, `ref_id = $permohonan->id`, `status_lama = null`, `status_baru = 'diajukan'`, `actor_id = $user->id`).
  - Mengembalikan model `Permohonan`.

- [x] **1.3** Buat `app/Http/Controllers/PermohonanPemohonController.php`:
  - `create(Request $request)`: Render Inertia `Pemohon/Permohonan/Create`.
  - `store(SimpanPermohonanRequest $request)`: Panggil `PermohonanService->simpanPermohonan()`, kemudian redirect ke `pemohon.dashboard` dengan flash session `success`.

- [x] **1.4** Daftarkan route di `routes/web.php` dalam grup middleware `role:Pemohon`:
  - `GET /pemohon/permohonan/create` -> `pemohon.permohonan.create`
  - `POST /pemohon/permohonan` -> `pemohon.permohonan.store`

### Fase 2 — Frontend: Komponen Atom & Molekul

- [x] **2.1** Buat atom `resources/js/components/atoms/DropzoneUpload.jsx`:
  - Area dropzone interaktif (dragover visual feedback, cursor pointer).
  - Validasi sisi klien untuk format PDF dan ukuran berkas (maksimal 10MB).
  - Tampilan berkas terpilih: ikon file, nama file, badge ukuran file, dan tombol "Ganti Berkas" / "Hapus".
  - Pesan error inline jika berkas tidak sesuai kriteria.
  - Keyboard accessible (dapat diaktifkan via tombol Space/Enter).

- [x] **2.2** Buat molekul `resources/js/components/molecules/MoneyInput.jsx`:
  - Input field dengan styling kotak `Rp` di sisi kiri.
  - Memformat tampilan angka dengan separator ribuan saat pengguna mengetik, namun mengoper nilai numerik murni ke form state.

- [x] **2.3** Buat molekul `resources/js/components/molecules/AlurStepperItem.jsx`:
  - Menampilkan nomor tahapan (1-4) atau ikon centang dengan garis penghubung vertikal.
  - Menampilkan badge status (contoh: "Anda di sini", "Menunggu Persetujuan", dsb.) dan deskripsi langkah.

### Fase 3 — Frontend: Organism

- [x] **3.1** Buat organism `resources/js/components/organisms/PermohonanFormCard.jsx`:
  - Memuat field Judul Pengadaan, Nominal / Estimasi Anggaran, dan Dropzone Upload Surat Permohonan (serta Nomor Surat dan Ringkasan Tujuan sesuai hasil konfirmasi).
  - Menampilkan pesan error validasi per field dari props Inertia `errors`.
  - Tombol submit dengan status disabled dan loading state saat `processing`.

- [x] **3.2** Buat organism `resources/js/components/organisms/AlurPermohonanCard.jsx`:
  - Panel putih dengan 4 langkah alur permohonan pengadaan.

- [x] **3.3** Buat organism `resources/js/components/organisms/PanduanPengajuanCard.jsx`:
  - Panel hijau muda dengan ikon `ShieldCheck` dan 3 butir checklist "Sebelum Mengirim".

### Fase 4 — Frontend: Template & Page

- [x] **4.1** Buat template `resources/js/components/templates/PermohonanCreateTemplate.jsx`:
  - Memanfaatkan `DashboardShellTemplate` sebagai layout induk.
  - Hero banner khusus dengan judul "Buat Permohonan Pengadaan" dan tombol `← Kembali`.
  - Grid 2 kolom responsif: form card di kiri (2 span) dan alur + panduan di kanan (1 span).

- [x] **4.2** Buat page `resources/js/Pages/Pemohon/Permohonan/Create.jsx`:
  - Menggunakan Inertia hook `useForm` untuk mengelola form input dan upload file multipart/form-data.
  - Menghubungkan tombol `← Kembali` ke `router.visit(route('pemohon.dashboard'))`.

- [x] **4.3** Update `Dashboard.jsx` dan `PemohonDashboardTemplate.jsx`:
  - Ubah tombol `Buat Permohonan` pada HeroBanner agar membuka `route('pemohon.permohonan.create')`.
  - Ubah CTA pada empty-state tabel permohonan agar mengarahkan ke rute pembuatan yang sama.

### Fase 5 — Verifikasi & Pengujian

- [x] **5.1** Buat feature test `tests/Feature/PermohonanPemohonTest.php`:
  - Pemohon dapat membuka form buat permohonan.
  - User non-pemohon dilarang mengakses form (403).
  - Validasi data kosong dan berkas non-PDF / ukuran >10MB ditolak.
  - Berhasil menyimpan data permohonan, dokumen, dan riwayat status ke database SQLite/PostgreSQL.
  - File PDF fisik tersimpan di disk storage yang ditentukan.

- [x] **5.2** Format kode PHP dengan `vendor/bin/pint --dirty --format agent`.
- [x] **5.3** Jalankan seluruh unit & feature test dengan `php artisan test --compact`.
- [x] **5.4** Jalankan `npm run build` untuk memverifikasi kebersihan bundel frontend.
- [x] **5.5** Uji interaksi form secara langsung di browser: pengisian form, upload drag & drop, validasi error, submit permohonan, dan konfirmasi munculnya data baru di dashboard.

---

## 5. Asumsi & Konfirmasi yang Perlu Disetujui Pengguna

Sebelum eksekusi penulisan kode dimulai, ada beberapa hal terkait skema database dan desain visual yang perlu disepakati:

1. **Kolom `nomor_surat` dan `ringkasan_tujuan`:**
   - Di skema database `permohonan`, kolom `nomor_surat` dan `ringkasan_tujuan` berstatus `NOT NULL`.
   - Namun di desain visual (`form_permohonan_pengadaan.png`), hanya terdapat 3 input: *Judul Pengadaan*, *Nomor/Estimasi Anggaran*, dan *Upload Surat Permohonan*.
   - **Opsi Solusi:**
     - **Opsi A (Rekomendasi UI):** Tambahkan field input teks `Nomor Surat (dari Srikandi)` dan textarea `Ringkasan Tujuan` ke dalam form kartu agar data tersimpan lengkap sesuai PRD 31.
     - **Opsi B (Sesuai Mockup Eksak):** Sembunyikan dari form; `nomor_surat` di-generate otomatis sistem (contoh format: `PRM/{YMD}/{random}`), dan `ringkasan_tujuan` disalin dari isi `judul`.
2. **Penyimpanan Berkas Dokumen:**
   - Menggunakan disk `local` privat (`storage/app/private/dokumen/permohonan/`) dengan nama file yang di-hash (misal menggunakan hash SHA-256 / UUID) demi keamanan agar tidak bisa diakses publik secara langsung tanpa otorisasi.
3. **Aksi Setelah Submit Berhasil:**
   - Setelah sukses menyimpan permohonan baru, user akan diredirect kembali ke `pemohon.dashboard` dengan flash alert/notifikasi sukses, dan data stat card serta tabel "Permohonan Sedang Berlangsung" akan langsung bertambah dan menampilkan permohonan yang baru dibuat.
