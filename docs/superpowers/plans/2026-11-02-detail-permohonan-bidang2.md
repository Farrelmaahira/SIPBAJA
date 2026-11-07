# Plan: Halaman Detail Permohonan & Keputusan Persetujuan/Penolakan (Role Bidang 2)

**Tanggal:** 2026-11-02  
**Scope:** Implementasi halaman Detail Permohonan untuk role Bidang 2 (Wakil Direktur 2 / Perencanaan Keuangan & Sarana Prasarana), mencakup ringkasan informasi permohonan, verifikasi jenis MAK dari Perencanaan, live preview surat permohonan, integrasi dokumen RKAKL, modal unggah memo persetujuan (approval), modal catatan alasan penolakan (rejection), audit trail `approval_permohonan` & `status_history`, serta pengujian backend dan frontend.  
**Referensi Desain:**  
- `docs/design/detail_permohonan_bidang2.png` (Tampilan utama halaman detail permohonan role Bidang 2)  
- `docs/design/setuju_permohonan.png` (Modal Unggah Memo Persetujuan Bidang 2)  
- `docs/design/tolak_permohonan.png` (Modal Tolak Permohonan Bidang 2)  
**Dokumen Acuan:**  
- `docs/PRD.md` (Tiered approval Bidang 2: approval dengan memo persetujuan, penolakan dengan alasan)  
- `docs/DEVELOPMENT_RULES.md` (Service Layer, Form Request, Controller by Role, API Contract)  
- `docs/DATABASE_SIPBAJA.md` (Tabel `permohonan`, `approval_permohonan`, `dokumen`, `permohonan_mak`, `status_history`)  
- `docs/design.md` (Token warna, card layout, typography, buttons, modals)  
- `docs/API_CONTRACT.md` (Spesifikasi API Modul Bidang 2)  
- `docs/SIPBAJA_API.postman_collection.json` & `docs/SIPBAJA_Local.postman_environment.json`  
- `docs/SETUP_LOG.md` (Konvensi lingkungan PHP & SQLite)  
- `.agents/skills` (`antislop`, `antislop-code`, `antislop-ui`)

---

## 1. Analisis Visual & Spesifikasi Mockup

### 1.1 Halaman Utama (`detail_permohonan_bidang2.png`)
1. **Navigasi & Header:**
   - **Breadcrumb:** `LIST PENGAJUAN > DETAIL PERMOHONAN` (uppercase, teks kecil warna `#5F6F6A`, "LIST PENGAJUAN" dapat diklik menuju `/bidang-2/pengajuan`).
   - **Topbar:** Lonceng notifikasi dengan badge merah + Profile pill "B2" Bidang 2, "Unit Bidang 2".
   - **Sidebar Menu:** Dashboard, List Pengajuan (badge hitungan aktif, e.g. 4), Dokumen RKAKL.
2. **Hero Banner:**
   - Latar hijau solid brand `#0E7C5A` dengan aksen lengkung `rounded-[24px]` dan dekorasi lingkaran konsentris putih transparan di sisi kanan.
   - Eyebrow: `PERMOHONAN PENGADAAN` (uppercase putih 75%).
   - Judul: "Detail Permohonan" berdampingan dengan `StatusPill` `• Review Permohonan` (pill biru `#E8F0FF`, teks `#1F55C7`, dot `#2F6FED`).
   - Subtitle: `Nomor {nomor_surat} · Diajukan {tanggal_pengajuan}` (contoh: `Nomor 111-FFF-111 · Diajukan 04 Maret 2027`).
   - Aksi Kanan:
     - Tombol `Dokumen RKAKL`: tombol putih rounded dengan ikon dokumen untuk memeriksa berkas RKAKL aktif.
     - Tombol `← Kembali`: tombol semi-transparan putih mengarahkan kembali ke `/bidang-2/pengajuan`.
3. **Card 1: Informasi Permohonan (Full Width):**
   - Latar putih rounded `rounded-[24px]`, border `#E4EBE8`, padding `p-6 md:p-8`, shadow halus.
   - Header: Judul "Informasi Permohonan", subtitle "Ringkasan data yang diajukan".
   - Grid 2 kolom dengan 7 item atribut:
     1. Ikon `#` hijau-tint (`#EEF5F2` / teks `#0E7C5A`): Label "Nomor Permohonan" -> `{nomor_surat}`
     2. Ikon kalender: Label "Tanggal Pengajuan" -> `{tanggal_pengajuan}`
     3. Ikon dokumen: Label "Judul Permohonan" -> `{judul}`
     4. Ikon kantor/gedung: Label "Diajukan Oleh" -> `{unit_nama}`
     5. Ikon uang tunai: Label "Nominal/Estimasi" -> format Rupiah `{estimasi_anggaran}`
     6. Ikon status pulse: Label "Status" -> Status pill (`• Review Permohonan`)
     7. Ikon `#` hijau-tint: Label "Jenis MAK" -> `{mak_kode}` (contoh: `532111` yang ditentukan Tim Perencanaan).
4. **Tata Letak 2 Kolom di Bawah Informasi Permohonan:**
   - **Kolom Kiri (Surat Permohonan):**
     - Card "Surat Permohonan" dengan badge pill `• Live Preview` hijau.
     - Baris berkas: ikon PDF merah, nama file `{displayFileName}`, ukuran `{displaySize}`, tombol `Lihat` (eye icon) dan tombol `Unduh` (solid hijau `#0E7C5A`).
     - Kontainer Live Preview aktif: pratinjau PDF interaktif / lembar surat resmi permohonan ber-kop dengan nomor halaman ("Halaman 1 dari 2").
   - **Kolom Kanan (Catatan Perencanaan & Keputusan Bidang 2):**
     - **Card "Catatan dari Perencanaan":**
       - Header: Judul "Catatan dari Perencanaan", subtitle "Masukan Tim Perencanaan untuk permohonan ini".
       - Box abu-abu muda (`bg-[#F9FBFA] border border-[#E4EBE8] rounded-2xl p-4`):
         - Baris atas: `Tim Perencanaan · {tanggal, waktu}` (contoh: `Tim Perencanaan · 05 Maret 2027, 09:30`).
         - Teks catatan: Pesan dari Tim Perencanaan saat meneruskan permohonan (contoh: "Jenis MAK 532111 telah diverifikasi. Mohon periksa kesesuaian nominal dengan Dokumen RKAKL terbaru sebelum memberi keputusan.").
     - **Card "Keputusan Bidang 2":**
       - Header: Judul "Keputusan Bidang 2", subtitle "Tinjau dokumen RKAKL, lalu setujui atau tolak".
       - Tombol `Buka Dokumen RKAKL`: tombol putih berbingkai border, ikon mata `Eye`, lebar penuh (full-width), min-h 44px.
       - Subteks keterangan: `Versi terbaru: Versi {versi} · diperbarui {tanggal}` (contoh: `Versi terbaru: Versi 3 · diperbarui 12 Okt 2026`).
       - Dua tombol keputusan utama (Grid 2 kolom):
         - Kiri: Tombol `Tolak Permohonan` (merah muda lembut: `bg-[#FFF0ED] text-[#D92D20] border border-[#FDA29B]`, ikon `XCircle`).
         - Kanan: Tombol `Setujui Permohonan` (solid hijau brand: `bg-[#0E7C5A] text-white hover:bg-[#0A5C43]`, ikon `CheckCircle2`).

---

### 1.2 Modal Persetujuan (`setuju_permohonan.png`)
1. **Modal Header:**
   - Ikon dokumen hijau mint di dalam kotak rounded (`#E4F6EC` / `#0E7C5A`).
   - Judul: "Unggah Memo Persetujuan".
   - Subtitle: "Lampirkan memo untuk menyetujui permohonan pengadaan".
   - Tombol tutup silang `X` di sudut kanan atas.
2. **Area Dropzone Berkas:**
   - Dropzone putus-putus berlatar mint lembut (`border-dashed border-[#A3D9C9] bg-[#F2F9F6] rounded-2xl p-6`).
   - Ikon upload panah awan hijau mint.
   - Teks instruksi: "Seret & lepas memo persetujuan di sini".
   - Subteks: "Format PDF, maksimal 20 MB".
   - Tombol "Pilih File" (tombol putih border halus).
3. **Card Berkas Terpilih (Active Selection):**
   - Menampilkan ikon PDF merah.
   - Nama berkas (contoh: `Memo_Persetujuan_111-FFF-111.pdf`).
   - Subteks: `PDF · 1 MB · Siap diunggah`.
   - Tombol silang `X` untuk membatalkan/mengganti berkas.
4. **Footer Modal:**
   - Kiri: Tombol `Batal` (putih border halus, rounded-xl, min-h 44px).
   - Kanan: Tombol `Setujui Permohonan` (solid hijau `#0E7C5A`, text white, rounded-xl, min-h 44px).

---

### 1.3 Modal Penolakan (`tolak_permohonan.png`)
1. **Modal Header:**
   - Ikon lingkaran merah silang (`#FEE4E2` / `#E5484D`).
   - Judul: "Tolak Permohonan".
   - Subtitle: `Nomor {nomor_surat} · {judul}` (contoh: `Nomor 111-FFF-111 · Pengadaan Komputer`).
   - Tombol tutup silang `X` di sudut kanan atas.
2. **Input Textarea:**
   - Label: `Catatan Penolakan *`.
   - Placeholder: "Tuliskan alasan penolakan agar pemohon dapat memperbaiki permohonan...".
   - Subteks bawah: "Catatan dikirim ke pemohon dan Tim Perencanaan sebagai dasar revisi.".
   - Counter karakter: `0/500`.
3. **Footer Modal:**
   - Kiri: Tombol `Batal`.
   - Kanan: Tombol `Tolak Permohonan` (solid merah `#E5484D` / `#D92D20`, teks putih, rounded-xl, ikon `XCircle`, min-h 44px).

---

## 2. Kepatuhan Ketat Aturan Antislop

### 2.1 Antislop Core & UI (`antislop`, `antislop-ui`)
- **Mode Eksekusi:** `during (session override)`.
- **Larangan Em Dash (R-02):** Dilarang keras memakai karakter em dash (`—`). Gunakan tanda hubung strip biasa (`-`), titik dua (`:`), tanda kurung, atau titik tengah (`·`).
- **Palet Warna Asli SIPBAJA (R-01, R-29):**
  - Brand: `#0E7C5A` (hijau zamrud institusional)
  - Dark brand: `#0A5C43`
  - Canvas: `#F3F6F5`
  - Surface: `#FFFFFF`
  - Border: `#E4EBE8`
  - Danger: `#D92D20` / `#E5484D`
  - Tanpa gradien ungu-biru AI, background mesh, atau efek glow neon.
- **Responsivitas & Tap Target (R-03):** Seluruh input, textarea, tombol modal, dan kartu aksi memiliki tap target minimal 44px dan aman dari overflow mobile.
- **Kelengkapan Tiga State UI (R-27):**
  - **Loading State:** Skeleton shimmer saat data permohonan atau dokumen dimuat.
  - **Action Submitting State:** Spinner loading pada tombol Setujui / Tolak dan penonaktifan tombol agar tidak terjadi submit ganda.
  - **Error State:** Pesan inline error berbahasa Indonesia di bawah input berkas atau textarea, serta banner alert jika terjadi kegagalan jaringan.
- **Integritas Kontrol Interaktif (R-26):** Tombol Kembali aktif navigasi, tombol Buka RKAKL membuka pratinjau berkas RKAKL riil, tombol Lihat & Unduh surat permohonan memicu streaming berkas riil.
- **Prinsip PRD & Database:**
  - Persetujuan Bidang 2 wajib menyimpan berkas memo ke tabel `dokumen` (`tipe_dokumen: 'memo_persetujuan'`) dan mereferensikan `memo_dokumen_id` pada tabel `approval_permohonan`.
  - Penolakan Bidang 2 mencatat alasan di tabel `approval_permohonan` (`tahap: 'BIDANG2'`, `keputusan: 'ditolak'`, `alasan: $alasan`), menaikkan `revisi_ke` permohonan, dan mengubah status permohonan menjadi `'ditolak'`.

### 2.2 Higienitas Komentar Kode (`antislop-code`)
- Tanpa banner karakter pemisah dekoratif (`// =======================`).
- Tanpa narasi langkah berulang (`// Step 1:`, `// Step 2:`).
- Tanpa emoji dekoratif dalam komentar kode (`// ✅ Approved`).
- Komentar hanya menjelaskan aturan bisnis, otorisasi peran, manipulasi multi-dokumen, atau batasan transaksi atomik.

---

## 3. Peta File yang Dibuat / Diubah

| File | Tipe | Perubahan / Tujuan |
|---|---|---|
| `backend/app/Services/Bidang2Service.php` | Backend Service | Service layer khusus peran Bidang 2: `getPengajuanList()`, `getDetailPengajuan()`, `setujuPengajuan()`, `tolakPengajuan()`, `getDokumenRkaklAktif()`. |
| `backend/app/Http/Requests/Bidang2/SetujuPermohonanBidang2Request.php` | Form Request | Validasi unggah memo persetujuan: `file_memo` (required, file, mimes:pdf, max:20480 KB), otorisasi role 'Bidang 2'. |
| `backend/app/Http/Requests/Bidang2/TolakPermohonanBidang2Request.php` | Form Request | Validasi alasan penolakan: `alasan` (required, string, min:5, max:500), otorisasi role 'Bidang 2'. |
| `backend/app/Http/Controllers/Bidang2/PengajuanBidang2Controller.php` | Controller | Refactor ke Service Layer: tambah method `show()`, `approve()`, `reject()`, dan `downloadMemo()`. |
| `backend/routes/api.php` | Routes | Daftarkan rute `GET pengajuan/{permohonan}`, `POST pengajuan/{permohonan}/approve`, `POST pengajuan/{permohonan}/reject`, `GET pengajuan/{permohonan}/memo`. |
| `backend/tests/Feature/Bidang2/PengajuanBidang2DetailTest.php` | Feature Test | Pengujian komprehensif endpoint detail, approval dengan memo, dan penolakan dengan catatan. |
| `docs/API_CONTRACT.md` | Dokumentasi | Dokumentasikan endpoint detail, approve, dan reject modul Bidang 2. |
| `frontend/src/types/bidang2.ts` | Frontend Types | Interface TypeScript untuk detail permohonan Bidang 2, catatan perencanaan, info RKAKL, dan payload keputusan. |
| `frontend/src/components/organisms/Bidang2/InformasiPermohonanCard.tsx` | Organism Component | Komponen ringkasan data permohonan dengan 7 item data ber-ikon. |
| `frontend/src/components/organisms/Bidang2/CatatanPerencanaanCard.tsx` | Organism Component | Komponen kotak catatan verifikasi dari Tim Perencanaan. |
| `frontend/src/components/organisms/Bidang2/KeputusanBidang2Card.tsx` | Organism Component | Komponen kartu keputusan aksi Buka RKAKL, Tolak, dan Setujui. |
| `frontend/src/components/organisms/Bidang2/SetujuPermohonanModal.tsx` | Organism Modal | Modal pop-up unggah berkas memo persetujuan Bidang 2. |
| `frontend/src/components/organisms/Bidang2/TolakPermohonanModal.tsx` | Organism Modal | Modal pop-up formulir textarea catatan alasan penolakan. |
| `frontend/src/pages/Bidang2/Pengajuan/Show.tsx` | Page Component | Halaman detail utama Bidang 2 yang menggabungkan seluruh komponen di atas. |
| `frontend/src/pages/Bidang2/Pengajuan/Index.tsx` | Page Component | Hubungkan tombol "Detail" tabel agar navigasi ke `/bidang-2/pengajuan/:id`. |
| `frontend/src/router/index.tsx` | Router | Daftarkan rute `/bidang-2/pengajuan/:id` untuk role Bidang 2. |

---

## 4. Checklist Implementasi Terstruktur

### Fase 1: Backend Service Layer, Form Requests, Controller & Feature Tests

- [x] **1.1** Buat Service Class `backend/app/Services/Bidang2Service.php`:
  - Method `getPengajuanList(string $status, string $search, int $perPage = 10): LengthAwarePaginator`:
    - Mengambil data permohonan dengan relasi `unit`, `Dokumen`, `PermohonanMak.Mak`.
    - Filter pencarian nomor surat / judul dan filter status permohonan.
  - Method `getDetailPengajuan(Permohonan $permohonan): array`:
    - Load relasi: `unit`, `Dokumen`, `PermohonanMak.Mak`, `Approvals.Actor.Role`, `statusHistory`.
    - Format data respon:
      - `id`, `nomor_surat`, `judul`, `ringkasan_tujuan`, `estimasi_anggaran`, `revisi_ke`, `status`, `created_at`
      - `unit_nama`: nama unit pemohon
      - `mak_list`: kode dan nama MAK yang telah diverifikasi Perencanaan
      - `dokumen`: metadata surat permohonan aktif (`id`, `nama_asli`, `ukuran_bytes`, `download_url`)
      - `catatan_perencanaan`: catatan masukan verifikasi dari Tim Perencanaan (waktu, peran, catatan/alasan)
      - `rkakl_aktif`: info dokumen RKAKL versi aktif (`versi`, `nama_asli`, `updated_at`, `download_url`)
      - `approval_bidang2`: keputusan Bidang 2 jika sudah diputuskan (keputusan, memo info, catatan penolakan)
  - Method `setujuPengajuan(User $actor, Permohonan $permohonan, UploadedFile $fileMemo): Permohonan`:
    - Validasi otorisasi peran Bidang 2.
    - Validasi bahwa permohonan dapat disetujui (status bukan sudah `disetujui`).
    - Jalankan dalam transaksi `DB::transaction`:
      - Simpan fisik berkas memo ke direktori privat (`dokumen/memo/{UUID}.pdf`).
      - Simpan metadata ke tabel `dokumen` (`ref_type: 'approval_permohonan'`, `tipe_dokumen: 'memo_persetujuan'`, `versi: 1`).
      - Catat/update baris pada `approval_permohonan`:
        - `permohonan_id: $permohonan->id`
        - `tahap: 'BIDANG2'`
        - `revisi_ke: $permohonan->revisi_ke`
        - `keputusan: 'disetujui'`
        - `memo_dokumen_id: $memoDokumen->id`
        - `actor_id: $actor->id`
      - Update status permohonan menjadi `'disetujui'`.
      - Catat riwayat pada `status_history`:
        - `ref_type: 'permohonan'`
        - `ref_id: $permohonan->id`
        - `status_lama: $statusLama`
        - `status_baru: 'disetujui'`
        - `actor_id: $actor->id`
      - Kembalikan instance permohonan.
  - Method `tolakPengajuan(User $actor, Permohonan $permohonan, string $alasan): Permohonan`:
    - Validasi otorisasi peran Bidang 2.
    - Jalankan dalam transaksi `DB::transaction`:
      - Catat/update baris pada `approval_permohonan`:
        - `permohonan_id: $permohonan->id`
        - `tahap: 'BIDANG2'`
        - `revisi_ke: $permohonan->revisi_ke`
        - `keputusan: 'ditolak'`
        - `alasan: $alasan`
        - `actor_id: $actor->id`
      - Update status permohonan menjadi `'ditolak'` dan naikkan `revisi_ke` (`$permohonan->revisi_ke + 1`).
      - Catat riwayat pada `status_history`:
        - `ref_type: 'permohonan'`
        - `ref_id: $permohonan->id`
        - `status_lama: $statusLama`
        - `status_baru: 'ditolak'`
        - `actor_id: $actor->id`
      - Kembalikan instance permohonan.
  - Method `getDokumenRkaklAktif(): ?Dokumen`:
    - Mengambil berkas RKAKL dengan `versi` tertinggi dari tabel `dokumen`.

- [x] **1.2** Buat Form Request Classes:
  - `backend/app/Http/Requests/Bidang2/SetujuPermohonanBidang2Request.php`:
    - Otorisasi: `$this->user()?->Role?->nama === 'Bidang 2'`.
    - Rules: `'file_memo' => ['required', 'file', 'mimes:pdf', 'max:20480']` (maks 20 MB sesuai mockup).
    - Messages: Pesan validasi Bahasa Indonesia.
  - `backend/app/Http/Requests/Bidang2/TolakPermohonanBidang2Request.php`:
    - Otorisasi: `$this->user()?->Role?->nama === 'Bidang 2'`.
    - Rules: `'alasan' => ['required', 'string', 'min:5', 'max:500']`.
    - Messages: Pesan validasi Bahasa Indonesia.

- [x] **1.3** Refactor & Lengkapi `backend/app/Http/Controllers/Bidang2/PengajuanBidang2Controller.php`:
  - Inject `Bidang2Service` via constructor.
  - Method `index()` delegasi ke service.
  - Method `show(Request $request, Permohonan $permohonan): JsonResponse` mengembalikan detail lengkap permohonan.
  - Method `approve(SetujuPermohonanBidang2Request $request, Permohonan $permohonan): JsonResponse` memproses memo dan mengembalikan status 200.
  - Method `reject(TolakPermohonanBidang2Request $request, Permohonan $permohonan): JsonResponse` memproses penolakan dan mengembalikan status 200.
  - Method `downloadMemo(Request $request, Permohonan $permohonan): StreamedResponse` mengunduh/streaming berkas memo persetujuan.

- [x] **1.4** Daftarkan Rute di `backend/routes/api.php`:
  - Di dalam grup `prefix('bidang-2')->middleware('role:Bidang 2')`:
    - `GET pengajuan/{permohonan}` -> `show`
    - `POST pengajuan/{permohonan}/approve` -> `approve`
    - `POST pengajuan/{permohonan}/reject` -> `reject`
    - `GET pengajuan/{permohonan}/memo` -> `downloadMemo`

- [x] **1.5** Buat Feature Test `backend/tests/Feature/Bidang2/PengajuanBidang2DetailTest.php`:
  - Test guest tidak bisa mengakses endpoint detail (401).
  - Test role lain dilarang mengakses modul Bidang 2 (403).
  - Test Bidang 2 berhasil melihat detail permohonan dengan struktur JSON lengkap (200).
  - Test Bidang 2 menyetujui permohonan dengan mengunggah memo PDF (200, status permohonan menjadi 'disetujui', memo tersimpan di storage).
  - Test Bidang 2 menyetujui tanpa berkas memo ditolak validasi (422).
  - Test Bidang 2 menolak permohonan dengan alasan valid (200, status permohonan menjadi 'ditolak', revisi_ke bertambah, status_history tercatat).
  - Test Bidang 2 menolak tanpa catatan atau catatan terlalu pendek ditolak validasi (422).

- [x] **1.6** Jalankan Formatting & Eksekusi Test Backend:
  - Jalankan `vendor/bin/pint --dirty --format agent`.
  - Jalankan `php artisan test --filter=PengajuanBidang2DetailTest` dan pastikan seluruh test hijau.

---

### Fase 2: Sinkronisasi API Contract & Frontend TypeScript Types

- [x] **2.1** Perbarui `docs/API_CONTRACT.md`:
  - Dokumentasikan endpoint `GET /api/v1/bidang-2/pengajuan/{id}` beserta contoh response JSON lengkap.
  - Dokumentasikan endpoint `POST /api/v1/bidang-2/pengajuan/{id}/approve` (multipart/form-data dengan `file_memo`).
  - Dokumentasikan endpoint `POST /api/v1/bidang-2/pengajuan/{id}/reject` (JSON payload dengan `alasan`).
  - Dokumentasikan endpoint `GET /api/v1/bidang-2/pengajuan/{id}/memo`.

- [x] **2.2** Buat File Types `frontend/src/types/bidang2.ts`:
  - Definisi interface `Bidang2DetailPengajuan`: properti permohonan, dokumen, mak, catatan perencanaan, dan RKAKL.
  - Definisi interface `CatatanPerencanaanData`: info pemeriksa, tanggal, dan teks catatan.
  - Definisi interface `RkaklAktifInfo`: versi, nama_asli, updated_at, download_url.
  - Definisi interface `KeputusanBidang2Data`: keputusan (`disetujui` | `ditolak`), memo info, alasan penolakan.

---

### Fase 3: Komponen Organisms & Modals Reusable

- [x] **3.1** Buat `frontend/src/components/organisms/Bidang2/InformasiPermohonanCard.tsx`:
  - Card putih rounded `rounded-[24px]` border `#E4EBE8`.
  - 7 grid item data dengan badge ikon kotak rounded:
    1. Nomor Permohonan
    2. Tanggal Pengajuan
    3. Judul Permohonan
    4. Diajukan Oleh (Unit pemohon)
    5. Nominal / Estimasi Anggaran (format Rupiah)
    6. Status Permohonan (`StatusPill`)
    7. Jenis MAK (Kode MAK dari Perencanaan)

- [x] **3.2** Buat `frontend/src/components/organisms/Bidang2/CatatanPerencanaanCard.tsx`:
  - Header: Judul "Catatan dari Perencanaan", subtitle "Masukan Tim Perencanaan untuk permohonan ini".
  - Kotak catatan abu-abu berbingkai border halus.
  - Menampilkan header `Tim Perencanaan · {tanggal, waktu}` dan isi pesan verifikasi.

- [x] **3.3** Buat `frontend/src/components/organisms/Bidang2/KeputusanBidang2Card.tsx`:
  - Header: Judul "Keputusan Bidang 2", subtitle "Tinjau dokumen RKAKL, lalu setujui atau tolak".
  - Tombol full-width `Buka Dokumen RKAKL` (ikon `Eye`, min-h 44px).
  - Teks subjudul: `Versi terbaru: Versi {versi} · diperbarui {tanggal}`.
  - Dua tombol aksi:
    - Tombol `Tolak Permohonan` (merah lembut `#FFF0ED`, teks `#D92D20`, border `#FDA29B`, ikon `XCircle`, min-h 44px).
    - Tombol `Setujui Permohonan` (solid hijau brand `#0E7C5A`, teks putih, hover `#0A5C43`, ikon `CheckCircle2`, min-h 44px).
  - Jika permohonan telah diputuskan (sudah disetujui / ditolak), menampilkan banner status hasil keputusan Bidang 2.

- [x] **3.4** Buat Modal `frontend/src/components/organisms/Bidang2/SetujuPermohonanModal.tsx`:
  - Mengimplementasikan desain `setuju_permohonan.png`:
  - Header: Ikon dokumen hijau mint, Judul "Unggah Memo Persetujuan", subtitle "Lampirkan memo untuk menyetujui permohonan pengadaan", tombol silang `X`.
  - Area Dropzone: Putus-putus mint, teks "Seret & lepas memo persetujuan di sini", "Format PDF, maksimal 20 MB", tombol "Pilih File".
  - Card Berkas Terpilih: Menampilkan nama berkas, ukuran, status "Siap diunggah", dan tombol hapus `X`.
  - Footer: Tombol `Batal` dan tombol solid hijau `Setujui Permohonan` (dengan spinner loading saat proses kirim).

- [x] **3.5** Buat Modal `frontend/src/components/organisms/Bidang2/TolakPermohonanModal.tsx`:
  - Mengimplementasikan desain `tolak_permohonan.png`:
  - Header: Ikon lingkaran merah silang, Judul "Tolak Permohonan", subtitle `Nomor {nomor_surat} · {judul}`, tombol silang `X`.
  - Input textarea: Label `Catatan Penolakan *`, placeholder ramah, subteks keterangan, dan counter karakter dinamis `0/500`.
  - Footer: Tombol `Batal` dan tombol solid merah `Tolak Permohonan` (dengan spinner loading saat proses submit).

---

### Fase 4: Halaman Utama Detail Pengajuan Bidang 2 (`Show.tsx`) & Integrasi Router

- [x] **4.1** Buat Halaman `frontend/src/pages/Bidang2/Pengajuan/Show.tsx`:
  - Mengambil parameter `:id` via `useParams`.
  - Fetch data detail pengajuan dari `/v1/bidang-2/pengajuan/${id}`.
  - State penanganan 3 kondisi (Loading skeleton, Error state dengan Coba Lagi, Data aktif).
  - Breadcrumb: `LIST PENGAJUAN > DETAIL PERMOHONAN`.
  - HeroBanner:
    - Eyebrow `PERMOHONAN PENGADAAN`.
    - Judul "Detail Permohonan" + `StatusPill`.
    - Subtitle `Nomor {nomor_surat} · Diajukan {tanggal_pengajuan}`.
    - Tombol `Dokumen RKAKL` membuka tautan berkas RKAKL aktif.
    - Tombol `← Kembali` kembali ke `/bidang-2/pengajuan`.
  - Tampilkan `InformasiPermohonanCard` melintang penuh.
  - Tata letak 2 kolom di bawahnya:
    - Kolom Kiri: `SuratPermohonanCard` (live preview aktif).
    - Kolom Kanan: `CatatanPerencanaanCard` dan `KeputusanBidang2Card`.
  - Integrasi modal:
    - Handler submit persetujuan (mengirim `FormData` berisi `file_memo`).
    - Handler submit penolakan (mengirim JSON berisi `alasan`).
    - Flash banner / toast sukses saat keputusan berhasil disimpan.

- [x] **4.2** Perbarui `frontend/src/pages/Bidang2/Pengajuan/Index.tsx`:
  - Ubah aksi tombol "Detail" pada tabel agar melakukan navigasi `navigate('/bidang-2/pengajuan/' + row.id)`.

- [x] **4.3** Daftarkan Rute di `frontend/src/router/index.tsx`:
  - Import `Bidang2PengajuanShow` dari `../pages/Bidang2/Pengajuan/Show`.
  - Tambahkan route `<Route path="/bidang-2/pengajuan/:id" element={<Bidang2PengajuanShow />} />` di dalam grup peran `Bidang 2`.

---

### Fase 5: Integrasi Pratinjau Dokumen RKAKL & Navigasi Terkait

- [x] **5.1** Integrasi Aksi "Buka Dokumen RKAKL":
  - Ketika tombol "Dokumen RKAKL" di HeroBanner atau "Buka Dokumen RKAKL" di kartu keputusan diklik:
    - Membuka berkas PDF RKAKL versi aktif di tab baru dengan URL `/api/v1/perencanaan/rkakl/{id}/dokumen?disposition=inline` atau rute RKAKL Bidang 2 `/bidang-2/rkakl`.

- [x] **5.2** Verifikasi Responsivitas Mobile:
  - Pada layar mobile (< 1024px), layout 2 kolom otomatis menjadi 1 kolom vertikal (Surat Permohonan -> Catatan Perencanaan -> Keputusan Bidang 2).
  - Modal persetujuan dan penolakan tampil nyaman di layar smartphone dengan tap target minimal 44px.

---

### Fase 6: Higienitas Kode & Audit Standar Antislop

- [x] **6.1** Audit dan Eliminasi Tanda Em Dash (R-02):
  - Periksa seluruh file baru dan file yang diubah (`grep -n "—"`).
  - Pastikan tidak ada karakter em dash yang menyusup ke teks UI atau kode.

- [x] **6.2** Audit Higienitas Komentar Kode (`antislop-code`):
  - Tanpa banner karakter pembatas (`// =======`).
  - Tanpa komentar mengulang kode yang jelas.
  - Tanpa emoji dalam komentar kode.
  - Tanpa narasi langkah berulang.

- [x] **6.3** Audit Desain UI & Token (`antislop-ui`):
  - Pastikan palet warna konsisten dengan `docs/design.md` (`#0E7C5A`, `#F3F6F5`, `#E4EBE8`, `#14201C`).
  - Pastikan indikator fokus keyboard jelas dan kontras (R-32).
  - Pastikan tidak ada tautan atau tombol mati tanpa aksi (R-26).

---

### Fase 7: Pengujian, Formatting & Delivery Gate (R-35)

- [ ] **7.1** Backend Code Styling & Formatting:
  - Jalankan `vendor/bin/pint --dirty --format agent` di folder backend.

- [ ] **7.2** Backend Feature Test Execution:
  - Jalankan `php artisan test --filter=PengajuanBidang2DetailTest` dan pastikan seluruh test lolos tanpa kegagalan.

- [ ] **7.3** Frontend TypeScript Compilation & Bundling:
  - Jalankan `npx tsc -b` di folder frontend dan pastikan 0 error.
  - Jalankan `npm run build` di folder frontend dan pastikan proses build selesai tanpa error.

- [ ] **7.4** Verifikasi Alur Fungsional & Delivery:
  - Buka halaman `/bidang-2/pengajuan` dan klik tombol Detail pada permohonan.
  - Pastikan halaman detail `/bidang-2/pengajuan/:id` terbuka dengan informasi permohonan lengkap.
  - Uji live preview surat permohonan dan tombol unduh berkas.
  - Uji pembukaan dokumen RKAKL.
  - Uji modal Setujui Permohonan: upload memo PDF dan pastikan status permohonan berubah menjadi "Disetujui".
  - Uji modal Tolak Permohonan: input alasan penolakan dan pastikan status permohonan berubah menjadi "Ditolak".

