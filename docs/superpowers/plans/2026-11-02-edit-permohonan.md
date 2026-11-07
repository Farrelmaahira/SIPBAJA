# Plan: Halaman Edit Permohonan dan Pengajuan Ulang Revisi (Role Pemohon)

**Tanggal:** 2026-11-02  
**Scope:** Implementasi halaman Edit Permohonan (Revisi Pengajuan) untuk role Pemohon (Jurusan/Unit/Bidang) berdasarkan permohonan yang berstatus Ditolak, mencakup kartu catatan dari pemeriksa, prefill data formulir, opsi pertahankan berkas lama atau unggah berkas baru, validasi Form Request, update transaksi database atomik, stepper alur revisi, panduan pengajuan ulang, serta integrasi API backend.  
**Referensi Desain:**  
- `docs/design/edit_permohonan_jurusan.png` (Tampilan utama halaman edit permohonan jurusan)  
**Dokumen Acuan:**  
- `docs/PRD.md` (Mekanisme revisi permohonan pengadaan dan retensi versi berkas)  
- `docs/DEVELOPMENT_RULES.md` (Arsitektur Service Layer, Form Request, Controller by Role, API Contract)  
- `docs/DATABASE_SIPBAJA.md` (Tabel `permohonan`, `dokumen`, `approval_permohonan`, `status_history`)  
- `docs/design.md` (Token warna, card layout, input field, dropzone upload, stepper)  
- `docs/API_CONTRACT.md` (Spesifikasi API submit revisi permohonan)  
- `.agents/skills` (`antislop`, `antislop-code`, `antislop-ui`)

---

## 1. Analisis Komprehensif Desain Mockup (`edit_permohonan_jurusan.png`)

Berdasarkan analisis visual terhadap desain:

### 1.1 Navigasi & Header Atas
- **Breadcrumb:** `LIST PERMOHONAN > DETAIL PERMOHONAN` (uppercase, teks kecil warna `#5F6F6A`, teks "LIST PERMOHONAN" dan "DETAIL PERMOHONAN" dapat diklik sebagai tautan navigasi).
- **Topbar:** Standar SIPBAJA (tombol notifikasi bell dengan badge merah, profile pill Jurusan TIK dengan inisial "JT" dan label role "Jurusan/Unit/Bidang").
- **Sidebar:** Navigasi standar dengan menu aktif "List Permohonan" dan badge jumlah.

### 1.2 Hero Banner
- Latar hijau solid brand `#0E7C5A` dengan sudut melengkung `rounded-[24px]` dan aksen lingkaran konsentris putih transparan di sisi kanan.
- Eyebrow: `EDIT PERMOHONAN` (uppercase putih 75%).
- Baris Judul:
  - Judul: "Edit Permohonan Pengadaan" (putih tebal 24-26px).
  - Status Pill: `• Ditolak` (pill merah: bg `#FDECEC`, teks `#B42318`, dot `#E5484D`) tepat di samping judul.
- Subtitle: `Nomor {nomor_surat} · Perbaiki data sesuai catatan revisi pemeriksa.` (contoh: `Nomor 01014-FF-11 · Perbaiki data sesuai catatan revisi pemeriksa.`).
- Aksi Kanan: Tombol `← Kembali` (tombol rounded semi-transparan putih yang mengarahkan kembali ke halaman detail `/pemohon/permohonan/:id`).

### 1.3 Card 1: Catatan dari Pemeriksa (Alert Card)
- Terletak melintang penuh di bawah Hero Banner untuk memberikan konteks perbaikan yang jelas:
  - Kotak ikon peringatan merah (`AlertTriangle` `#E5484D` dalam latar `#FEE4E2`).
  - Baris atas: Eyebrow `CATATAN DARI PEMERIKSA`, Judul `Permohonan Ditolak`, dan info pemeriksa di kanan (contoh: `Tim Perencanaan · Diperiksa 23 Okt 2026, 14:20`).
  - Kotak Alasan Ditolak: Latar pink-merah lembut (`#FFF7F7` dengan border `#FECDCA`), label "Alasan Ditolak" (merah tebal), dan teks alasan penolakan riil dari database pemeriksa.

### 1.4 Tata Letak 2 Kolom (Formulir Utama & Sidebar Panduan)

#### Kolom Kiri: Card Formulir "Detail Pengadaan"
- Card putih berbingkai border `#E4EBE8`, rounded `rounded-[24px]`, padding `p-6 md:p-8`, shadow lembut.
- Header:
  - Ikon dokumen hijau-tint (`#EEF5F2`), judul "Detail Pengadaan" (tebal 18px text `#14201C`), dan keterangan "Kolom bertanda * wajib diisi.".
  - Garis pemisah halus.
- Form Fields:
  1. **Judul Pengadaan \***
     - Input teks terisi data sebelumnya (prefill), contoh: `Pengadaan Printer Laboratorium`.
     - Teks bantuan di bawah input: "Tulis judul yang singkat dan jelas sesuai barang atau jasa yang diajukan." (`#8A9A95`).
  2. **Nominal / Estimasi Anggaran \***
     - Input group dengan addon prefix "Rp" berlatar hijau lembut (`#EEF5F2`, teks `#0E7C5A` font-semibold).
     - Input angka terformat rapi (contoh: `27.800.000`).
  3. **Upload Surat Permohonan \***
     - Label: "Upload Surat Permohonan *".
     - Baris Kartu Berkas Aktif (Current File Preview):
       - Ikon PDF merah dalam kotak rounded.
       - Nama file berkas yang sebelumnya diunggah (contoh: `Surat_Permohonan_Printer_Lab.pdf`), ukuran (contoh: `PDF · 6 MB`).
       - Tombol `Lihat` (ikon mata `Eye`, tombol putih berbingkai border) untuk memeriksa isi berkas sebelumnya.
     - Area Dropzone Ganti File:
       - Kotak putus-putus bertint hijau mint lembut (`bg-[#EEF5F2]/50 border-2 border-dashed border-[#7FE0B8] rounded-2xl p-6 text-center`).
       - Ikon upload awan (`UploadCloud` hijau brand).
       - Teks: "Klik untuk ganti file atau drag & drop" (tebal 14px `#14201C`).
       - Subteks: "PDF (Maks 10MB)" (`text-xs text-[#5F6F6A]`).
       - Jika berkas baru dipilih, menampilkan preview nama berkas baru yang siap dikirim.
- Footer Formulir:
  - Kiri: Ikon info (`Info` warna `#5F6F6A`) dan teks "Permohonan akan diperiksa ulang oleh tim verifikasi.".
  - Kanan: Tombol `Ajukan Ulang` (ikon refresh `RotateCcw`, solid hijau brand `#0E7C5A`, teks putih, font-semibold, rounded-xl min-h 44px).

#### Kolom Kanan: Sidebar Cards (2 Kartu)
1. **Card "Alur Permohonan":**
   - Judul: "Alur Permohonan", subtitle: "Perjalanan permohonan setelah diajukan ulang".
   - Vertical Stepper (4 tahap alur pengajuan ulang):
     - Tahap 1: Lingkaran hijau "1", teks "Perbaiki Data" + badge pill `Anda di sini` (hijau-tint), deskripsi "Sesuaikan data dengan catatan revisi".
     - Tahap 2: Lingkaran abu-abu "2", badge pill `• Menunggu Verifikasi` (biru), deskripsi "Tim memeriksa kelengkapan dokumen".
     - Tahap 3: Lingkaran abu-abu "3", badge pill `• Sedang Diproses` (amber), deskripsi "Permohonan masuk ke proses pengadaan".
     - Tahap 4: Lingkaran abu-abu "4", badge pill `• Disetujui` (hijau), deskripsi "Anda menerima hasil permohonan".
2. **Card "Sebelum Mengajukan Ulang":**
   - Latar hijau sangat lembut (`bg-[#F2F9F6] border border-[#A3D9C9]/50 rounded-2xl p-6`).
   - Header: Ikon perisai centang (`ShieldCheck` `#0E7C5A`), judul "Sebelum Mengajukan Ulang", subtitle "Pastikan data sudah benar".
   - Checklist 3 butir dengan ikon centang lingkaran hijau (`CheckCircle2` `#0E7C5A`):
     1. "Semua poin catatan revisi sudah diperbaiki"
     2. "Estimasi anggaran sesuai RAB"
     3. "Surat permohonan berformat PDF dan terbaca jelas"

---

## 2. Kepatuhan Ketat Aturan Antislop

Penerapan aturan dari folder `.agents/skills`:

### 2.1 Antislop Core & UI (`antislop`, `antislop-ui`)
- **Mode Eksekusi:** `during` (pencegahan sejak awal perencanaan).
- **Larangan Karakter Em Dash (R-02):** Dilarang keras memakai karakter em dash (`—`) pada seluruh teks UI, placeholder, label tombol, maupun dokumen kode. Gunakan tanda hubung strip biasa (`-`), titik dua (`:`), tanda kurung, atau titik tengah (`·`).
- **Warna & Palet SIPBAJA (R-01, R-29):** Gunakan token warna konsisten (`brand: #0E7C5A`, `canvas: #F3F6F5`, `surface: #FFFFFF`, `border: #E4EBE8`, `danger: #B42318`). Dilarang memakai gradien ungu-biru AI, background mesh, atau efek glow neon.
- **Responsivitas & Tap Target (R-03):** Seluruh input, dropzone, dan tombol aksi (tombol Kembali, Lihat, dan Ajukan Ulang) memiliki target sentuh minimal 44px dan aman dari overflow di perangkat mobile.
- **Kelengkapan Tiga State UI (R-27):**
  - **Loading State:** Skeleton card shimmer saat mengambil data permohonan yang akan diedit.
  - **Submitting State:** Indikator loading spinner pada tombol "Ajukan Ulang" dan penonaktifan tombol agar tidak terjadi submit ganda.
  - **Error State:** Pesan validasi inline di bawah tiap input serta toast/alert ramah jika terjadi kegagalan server.
- **Aksesibilitas (R-25, R-32):**
  - Seluruh teks memenuhi rasio kontras WCAG AA (minimal 4.5:1).
  - Navigasi keyboard penuh (`Tab` / `Shift+Tab`, `Enter` / `Space`, indikator `focus-visible:ring-2 focus-visible:ring-[#0E7C5A]`).
- **Integritas Kontrol Interaktif (R-26):** Dilarang membuat kontrol buntu. Tombol Kembali memicu navigasi balik, tombol Lihat membuka preview berkas riil, dropzone menerima input file nyata.
- **Prinsip PRD Dokumen:** Berkas lama tidak dihapus saat berkas baru diunggah. Versi berkas dinaikkan (`versi = versi + 1`) dan berkas lama tetap tersimpan di riwayat dokumen.

### 2.2 Higienitas Komentar Kode (`antislop-code`)
- Tanpa banner pemisah dekoratif (`// =======================`).
- Tanpa narasi langkah berulang (`// Step 1:`, `// Step 2:`).
- Tanpa emoji dekoratif dalam komentar kode (`// ✅ Submitted`).
- Komentar hanya menjelaskan aturan bisnis, otorisasi unit, penanganan berkas multi-versi, atau batasan transaksi atomik.

---

## 3. Peta File yang Dibuat / Diubah

| File | Tipe | Perubahan / Tujuan |
|---|---|---|
| `backend/app/Http/Requests/RevisiPermohonanRequest.php` | Form Request | Kelas validasi pengajuan ulang: `judul` wajib, `estimasi_anggaran` wajib numerik min 1, `file_dokumen` opsional/nullable PDF maks 10MB dengan pesan Bahasa Indonesia. |
| `backend/app/Services/PermohonanService.php` | Backend Service | Tambah method `revisiPermohonan(User $user, Permohonan $permohonan, array $data, ?UploadedFile $file): Permohonan` dengan transaksi database: update permohonan, simpan dokumen versi baru jika ada, catat status history `ditolak` -> `diajukan`. |
| `backend/app/Http/Controllers/Pemohon/PermohonanPemohonController.php` | Controller | Tambah method `update(RevisiPermohonanRequest $request, Permohonan $permohonan): JsonResponse` yang memanggil service dan mengembalikan permohonan yang diperbarui. |
| `backend/routes/api.php` | Routes | Daftarkan route `POST /api/v1/pemohon/permohonan/{permohonan}/revisi` di bawah prefix `pemohon`. |
| `backend/tests/Feature/Pemohon/PermohonanRevisiTest.php` | Feature Test | Pengujian komprehensif: revisi dengan upload berkas baru, revisi mempertahankan berkas lama, isolasi unit kerja lain, dan validasi nominal/judul. |
| `frontend/src/types/permohonan.ts` | Frontend Types | Tambah tipe data untuk form payload revisi permohonan. |
| `frontend/src/components/organisms/AlurPermohonanCard.tsx` | Organism Component | Tambahkan prop opsi mode (`mode="revisi"` atau `mode="baru"`) agar dinamis menampilkan teks "Perbaiki Data" dan subjudul revisi. |
| `frontend/src/components/organisms/PanduanPengajuanCard.tsx` | Organism Component | Tambahkan prop opsi mode (`mode="revisi"` atau `mode="baru"`) agar menampilkan "Sebelum Mengajukan Ulang" dan checklist revisi. |
| `frontend/src/components/organisms/PermohonanEditFormCard.tsx` | Organism Component | Komponen formulir edit utama yang memuat kartu berkas aktif, dropzone ganti file, input judul dan estimasi anggaran, serta tombol submit "Ajukan Ulang". |
| `frontend/src/pages/Pemohon/Permohonan/Edit.tsx` | Page Component | Halaman utama Edit Permohonan yang menyatukan breadcrumb, HeroBanner, CatatanPenolakanCard, PermohonanEditFormCard, AlurPermohonanCard, dan PanduanPengajuanCard. |
| `frontend/src/pages/Pemohon/Permohonan/Show.tsx` | Page Component | Pastikan tombol "Perbaiki & Ajukan Ulang" pada kartu catatan penolakan mengarahkan ke `/pemohon/permohonan/:id/edit`. |
| `frontend/src/router/index.tsx` | Router | Daftarkan rute `/pemohon/permohonan/:id/edit` yang memetakan ke halaman `Edit.tsx`. |
| `docs/API_CONTRACT.md` | Dokumentasi | Dokumentasikan endpoint `POST /api/v1/pemohon/permohonan/{id}/revisi`. |

---

## 4. Checklist Implementasi Terstruktur

### Fase 1: Backend Form Request, Service Layer, Controller & Feature Test

- [x] **1.1** Buat Form Request `backend/app/Http/Requests/RevisiPermohonanRequest.php`:
  - Otorisasi: hanya peran 'Pemohon' yang boleh mengajukan revisi.
  - Rules:
    - `judul`: `['required', 'string', 'max:255']`
    - `estimasi_anggaran`: `['required', 'numeric', 'min:1']`
    - `ringkasan_tujuan`: `['nullable', 'string', 'max:1000']`
    - `file_dokumen`: `['nullable', 'file', 'mimes:pdf', 'max:10240']` (opsional: jika pemohon tidak ingin mengganti file lama)
  - Messages dalam Bahasa Indonesia sesuai kaidah `DEVELOPMENT_RULES.md`.

- [x] **1.2** Tambahkan method `revisiPermohonan(User $user, Permohonan $permohonan, array $data, ?UploadedFile $file = null): Permohonan` di `backend/app/Services/PermohonanService.php`:
  - Validasi otorisasi: `$permohonan->unit_id === $user->unit_id`.
  - Validasi status: pastikan permohonan berstatus `ditolak` sebelum diizinkan revisi.
  - Jalankan transaksi database (`DB::transaction`):
    - Update data permohonan: `judul`, `estimasi_anggaran`, `ringkasan_tujuan`, ubah `status` menjadi `diajukan`.
    - Jika ada berkas baru (`$file`):
      - Simpan fisik berkas ter-hash di storage privat (`dokumen/permohonan/UUID.pdf`).
      - Hitung versi dokumen berikutnya (`$latestVersi + 1`).
      - Simpan baris baru di tabel `dokumen` tanpa menghapus dokumen lama (prinsip retensi riwayat PRD).
    - Catat entri baru di `status_history`:
      - `ref_type`: `'permohonan'`
      - `ref_id`: `$permohonan->id`
      - `status_lama`: `'ditolak'`
      - `status_baru`: `'diajukan'`
      - `actor_id`: `$user->id`
    - Kembalikan instance permohonan yang telah diperbarui.

- [x] **1.3** Tambahkan method `update(RevisiPermohonanRequest $request, Permohonan $permohonan): JsonResponse` di `backend/app/Http/Controllers/Pemohon/PermohonanPemohonController.php`:
  - Ambil data tervalidasi via `$request->validated()`.
  - Teruskan `$request->file('file_dokumen')` ke service.
  - Kembalikan response JSON terstruktur (`{ "message": "Permohonan berhasil diperbaiki dan diajukan ulang.", "permohonan": { ... } }`) dengan HTTP 200.

- [x] **1.4** Daftarkan route di `backend/routes/api.php`:
  - Tambahkan `Route::post('permohonan/{permohonan}/revisi', [PermohonanPemohonController::class, 'update'])->name('api.pemohon.permohonan.revisi');` di dalam grup route `pemohon`.

- [x] **1.5** Buat feature test `backend/tests/Feature/Pemohon/PermohonanRevisiTest.php`:
  - Test guest tidak bisa mengakses endpoint revisi (401).
  - Test pemohon unit lain dilarang merevisi permohonan yang bukan miliknya (403).
  - Test revisi permohonan ditolak tanpa mengunggah file baru (mempertahankan berkas lama, status berubah ke `diajukan`).
  - Test revisi permohonan dengan mengunggah berkas PDF baru (dokumen baru tersimpan dengan versi meningkat, status history tercatat).
  - Test permohonan yang statusnya bukan `ditolak` tidak dapat direvisi ulang (422/400).
  - Test validasi form: estimasi anggaran kosong atau negatif ditolak (422).

- [x] **1.6** Jalankan formatting dan pengujian:
  - Jalankan `vendor/bin/pint --dirty --format agent` di direktori backend.
  - Jalankan `php artisan test --filter=PermohonanRevisiTest` dan pastikan seluruh test hijau.

---

### Fase 2: Sinkronisasi API Contract & Frontend TypeScript Types

- [x] **2.1** Perbarui dokumentasi di `docs/API_CONTRACT.md`:
  - Tambahkan spesifikasi endpoint `POST /api/v1/pemohon/permohonan/{permohonanId}/revisi` (Content-Type: `multipart/form-data`).
  - Catat parameter form data (`judul`, `estimasi_anggaran`, `ringkasan_tujuan`, `file_dokumen` opsional).
  - Catat response sukses 200 dan response error 422.

- [x] **2.2** Perbarui definisi tipe di `frontend/src/types/permohonan.ts`:
  - Tambah interface `PermohonanRevisiFormData`: `judul: string`, `estimasi_anggaran: string | number`, `ringkasan_tujuan?: string`, `file_dokumen?: File | null`.
  - Tambah interface `PermohonanRevisiFormErrors`: record field error berbahasa Indonesia.

---

### Fase 3: Komponen Form & Sidebar Reusable

- [x] **3.1** Selaraskan `frontend/src/components/organisms/AlurPermohonanCard.tsx`:
  - Tambahkan prop `mode?: 'create' | 'revisi'`.
  - Jika `mode === 'revisi'`:
    - Subtitle: "Perjalanan permohonan setelah diajukan ulang".
    - Step 1: Judul "Perbaiki Data", badge `Anda di sini` (hijau), deskripsi "Sesuaikan data dengan catatan revisi".
    - Step 2: Badge `• Menunggu Verifikasi` (biru), deskripsi "Tim memeriksa kelengkapan dokumen".
    - Step 3: Badge `• Sedang Diproses` (amber), deskripsi "Permohonan masuk ke proses pengadaan".
    - Step 4: Badge `• Disetujui` (hijau), deskripsi "Anda menerima hasil permohonan".

- [x] **3.2** Selaraskan `frontend/src/components/organisms/PanduanPengajuanCard.tsx`:
  - Tambahkan prop `mode?: 'create' | 'revisi'`.
  - Jika `mode === 'revisi'`:
    - Judul: "Sebelum Mengajukan Ulang", subtitle: "Pastikan data sudah benar".
    - Butir checklist:
      1. "Semua poin catatan revisi sudah diperbaiki"
      2. "Estimasi anggaran sesuai RAB"
      3. "Surat permohonan berformat PDF dan terbaca jelas"

- [x] **3.3** Buat komponen `frontend/src/components/organisms/PermohonanEditFormCard.tsx`:
  - Header: Ikon dokumen hijau-tint, judul "Detail Pengadaan", teks "Kolom bertanda * wajib diisi.".
  - Field Judul Pengadaan: Text input dengan placeholder dan error validation message.
  - Field Nominal / Estimasi Anggaran: Input group dengan prefix "Rp" hijau brand dan format separator ribuan.
  - Field Upload Berkas:
    - Menampilkan kartu berkas aktif yang saat ini tersimpan (`Surat_Permohonan_Printer_Lab.pdf`, ukuran, dan tombol `Lihat`).
    - Area Dropzone: Putus-putus berlatar mint lembut (`border-dashed border-[#7FE0B8] bg-[#EEF5F2]/50`), ikon awan upload, teks "Klik untuk ganti file atau drag & drop", keterangan "PDF (Maks 10MB)".
    - Jika ada file baru yang dipilih: Menampilkan kartu file baru yang siap diunggah beserta tombol bersihkan/batal ganti file.
  - Footer aksi:
    - Kiri: Ikon info dan teks "Permohonan akan diperiksa ulang oleh tim verifikasi.".
    - Kanan: Tombol submit "Ajukan Ulang" (ikon `RotateCcw`, solid hijau brand `#0E7C5A`, min-h 44px, status disabled/loading saat submit).

---

### Fase 4: Halaman Utama Edit Permohonan (`Edit.tsx`) & Integrasi Router

- [x] **4.1** Buat halaman `frontend/src/pages/Pemohon/Permohonan/Edit.tsx`:
  - Hook `useParams` untuk mengambil `:id`.
  - Fetch data detail permohonan saat ini dari `/api/v1/pemohon/permohonan/${id}`.
  - State penanganan 3 kondisi (Loading skeleton, Error dengan tombol Coba Lagi, Form aktif).
  - Breadcrumb: `LIST PERMOHONAN > DETAIL PERMOHONAN` (masing-masing link navigasi).
  - HeroBanner:
    - Eyebrow `EDIT PERMOHONAN`.
    - Judul "Edit Permohonan Pengadaan" berdampingan dengan `StatusPill` `• Ditolak`.
    - Subtitle `Nomor {nomor_surat} · Perbaiki data sesuai catatan revisi pemeriksa.`.
    - Tombol `← Kembali` memicu `navigate('/pemohon/permohonan/' + id)`.
  - Tampilkan `CatatanPenolakanCard` melintang penuh di atas formulir (menampilkan catatan penolakan asli).
  - Tata letak 2 kolom di bawahnya:
    - Kolom Kiri (lebar fleksibel): `PermohonanEditFormCard`.
    - Kolom Kanan (lebar ~340px): `AlurPermohonanCard mode="revisi"` dan `PanduanPengajuanCard mode="revisi"`.
  - Handler submit: Mengirim `FormData` multipart via `api.post('/v1/pemohon/permohonan/' + id + '/revisi', formData)` dan redirect ke `/pemohon/permohonan/:id` setelah sukses.

- [x] **4.2** Daftarkan rute di `frontend/src/router/index.tsx`:
  - Import `PemohonPermohonanEdit` dari `../pages/Pemohon/Permohonan/Edit`.
  - Tambahkan route `<Route path="/pemohon/permohonan/:id/edit" element={<PemohonPermohonanEdit />} />` di dalam grup peran `Pemohon`.

---

### Fase 5: Sinkronisasi Navigasi dari Halaman Detail & Responsivitas Mobile

- [x] **5.1** Perbarui `frontend/src/pages/Pemohon/Permohonan/Show.tsx`:
  - Pastikan tombol "Perbaiki & Ajukan Ulang" pada kartu catatan penolakan mengarahkan ke `/pemohon/permohonan/${permohonan.id}/edit`.

- [x] **5.2** Verifikasi Tata Letak Mobile & Responsivitas:
  - Pada layar mobile (< 1024px), layout 2 kolom otomatis reflow menjadi 1 kolom vertikal dengan urutan: Formulir -> Alur Permohonan -> Panduan.
  - Area dropzone file upload nyaman diakses via sentuhan jari (min-h 120px, tap target 44px).
  - Seluruh tombol aksi mudah ditekan tanpa overflow horizontal.

---

### Fase 6: Standar Higienitas Kode & Audit Kepatuhan Antislop

- [x] **6.1** Audit dan Eliminasi Tanda Em Dash (R-02):
  - Periksa seluruh file baru dan file yang diubah (`grep -n "—" frontend/src/...`).
  - Ganti setiap karakter em dash dengan tanda hubung strip biasa, titik dua, atau kurung.

- [x] **6.2** Audit Higienitas Komentar Kode (`antislop-code`):
  - Pastikan tidak ada banner karakter seperti `// =======` atau `/* ---- */`.
  - Pastikan tidak ada komentar yang mengulang kode yang sudah jelas.
  - Pastikan tidak ada emoji dalam komentar kode.
  - Pastikan tidak ada narasi langkah (`// Step 1:`, `// Step 2:`).

- [x] **6.3** Audit Desain UI & Token (`antislop-ui`):
  - Pastikan token warna, radius, dan bayangan selaras dengan `docs/design.md`.
  - Pastikan tidak ada tombol atau link mati (R-26).
  - Pastikan indikator fokus keyboard kontras dan jelas (R-32).

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
  - Buka halaman detail permohonan yang berstatus "Ditolak".
  - Klik tombol "Perbaiki & Ajukan Ulang".
  - Pastikan halaman `/pemohon/permohonan/:id/edit` terbuka dengan data lama terisi di formulir.
  - Pastikan kartu Catatan dari Pemeriksa menampilkan alasan penolakan asli.
  - Uji tombol "Lihat" pada berkas lama.
  - Uji pemilihan berkas PDF baru melalui dropzone.
  - Uji submit form dengan berkas baru dan tanpa berkas baru.
  - Pastikan status permohonan berubah menjadi "Menunggu Verifikasi" / "diajukan" dan redirect kembali ke detail permohonan.
  - Uji validasi saat judul dikosongkan atau nominal diisi 0/negatif.
