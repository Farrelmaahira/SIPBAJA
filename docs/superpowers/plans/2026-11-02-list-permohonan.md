# Plan: Halaman List Permohonan dan Filter (Role Pemohon)

**Tanggal:** 2026-11-02  
**Scope:** Implementasi halaman List Permohonan pengadaan dan filter status popover/modal untuk role Pemohon (Jurusan/Unit/Bidang), mencakup penyelarasan backend API, komponen frontend, interaktivitas, responsivitas, dan kepatuhan antislop.  
**Referensi Desain:**  
- `docs/design/list_permohonan_jurusan.png` (Tampilan utama halaman list permohonan)  
- `docs/design/filter_jurusan.png` (Tampilan modal/popover filter status permohonan)  
**Dokumen Acuan:**  
- `docs/PRD.md` (Requirement spesifik Pemohon & tracking permohonan)  
- `docs/DEVELOPMENT_RULES.md` (Arsitektur Service Layer, Form Request, Controller by Role, API Contract)  
- `docs/DATABASE_SIPBAJA.md` (Skema tabel `permohonan`, `dokumen`, `units`, `status_history`)  
- `docs/design.md` (Token warna, tipografi Plus Jakarta Sans, card styling, tombol, tabel)  
- `docs/API_CONTRACT.md` (Kontrak API `/api/v1/pemohon/permohonan`)  
- `.agents/skills` (`antislop`, `antislop-code`, `antislop-ui`)

---

## 1. Analisis Desain & Spesifikasi Mockup

### 1.1 Analisis `list_permohonan_jurusan.png`

Tampilan halaman utama terdiri dari beberapa blok komponen:

1. **Sidebar Navigasi:**
   - Brand lockup: Logo box hijau kubus dengan teks "SIPBAJA" dan subtitle "Pengadaan Barang & Jasa".
   - Kategori menu: Label "MENU" kapital dengan warna `text-muted`.
   - Item menu aktif: "List Permohonan" (ikon daftar/clipboard, background hijau brand `#0E7C5A`, teks putih, dengan badge pill angka count "4" di sisi kanan).
   - Item menu sekunder: "Dashboard" (ikon grid layout, tidak aktif).

2. **Topbar:**
   - Notification button: Lingkaran putih border halus dengan ikon bel dan badge titik merah notifikasi aktif di pojok kanan atas.
   - User profile pill: Badge inisial avatar ("JT" dengan lingkaran hijau tua), teks nama unit "Jurusan TIK", subtitle peran "Jurusan/Unit/Bidang", dan ikon chevron-down.

3. **Hero Banner:**
   - Container hijau pekat `#0E7C5A` dengan sudut melengkung `rounded-[24px]` dan dua lingkaran dekoratif aksen halus di sisi kanan.
   - Eyebrow: "DAFTAR PERMOHONAN" (teks kecil putih 75% uppercase tanpa border badge).
   - Title: "List Permohonan" (putih tebal 24-26px).
   - Subtitle: "Pantau, cari, dan kelola seluruh permohonan pengadaan Anda." (putih 85%).
   - CTA Kanan: Tombol putih "+ Buat Permohonan" (teks hijau brand tebal `#0E7C5A`, ikon plus, minimum target sentuh 44px).

4. **Card Utama "Daftar Permohonan":**
   - Latar putih dengan border lembut `#E4EBE8` dan sudut melengkung `rounded-[20px]`.
   - Header:
     - Judul: "Daftar Permohonan" (tebal, 20px, `text-primary` `#14201C`).
     - Deskripsi: "Seluruh permohonan pengadaan yang Anda ajukan" (`text-secondary` `#5F6F6A`).
   - Controls Toolbar:
     - Tombol `[Filter]`: Tombol putih berbingkai border `#E4EBE8` dengan ikon corong filter (membuka modal/popover filter).
     - Kolom Pencarian: Input teks rounded dengan ikon kaca pembesar dan placeholder "Cari nomor atau judul...".
     - Indikator Total: Teks counter di sisi kanan, contoh "238 permohonan" (`text-secondary`).
   - Tabel Data:
     - Baris Header: Latar `surface-table-head` (`#F1F7F4`), teks kapital 11px tebal warna `#8A9A95`, letter-spacing lebar.
     - Kolom:
       1. `NO PERMOHONAN` (lebar ~180px, nomor surat berwarna hijau brand `#0E7C5A` sebagai tombol link interaktif).
       2. `JUDUL PENGADAAN` (fleksibel/fill, teks medium warna `#14201C`).
       3. `TANGGAL` (format tanggal Indonesia "DD Mmm YYYY", contoh "12 Okt 2026", warna `#5F6F6A`).
       4. `NILAI PENGAJUAN` (format Rupiah tanpa desimal "Rp 185.000.000", warna `#14201C`).
       5. `STATUS` (StatusPill dengan titik warna dan latar ber-tint):
          - "• Menunggu Persetujuan" (biru: dot `#2F6FED`, teks `#1F55C7`, bg `#E8F0FF`).
          - "• Disetujui" (hijau: dot `#12A06B`, teks `#0B7A4E`, bg `#E4F6EC`).
          - "• Ditolak" (merah: dot `#E5484D`, teks `#B42318`, bg `#FDECEC`).
          - "• Sedang Diproses" (kuning/amber: dot `#D97706`, teks `#B45309`, bg `#FEF3C7`).
       6. `AKSI` (tombol icon 3-titik vertikal/kebab menu untuk opsi detail dan unduh dokumen).
   - Pagination Footer:
     - Kiri: Teks "Menampilkan 1-10 dari 238 permohonan" (`text-secondary`).
     - Kanan: Kontrol navigasi halaman `< 1 2 3 4 ... 24 >` dengan status tombol aktif berwarna hijau brand `#0E7C5A` teks putih.

---

### 1.2 Analisis `filter_jurusan.png`

Modal/popover filter memiliki spesifikasi visual dan fungsional:

1. **Struktur Kontainer:**
   - Card putih berbingkai border halus dengan rounded corners (~20px) dan shadow elevasi terukur.
   - Header: Judul "Filter" (font tebal 18-20px) dan tombol tutup silang (`×`) di pojok kanan atas dengan akses keyboard `Escape`.
2. **Kategori Filter:**
   - Label grup: "STATUS PERMOHONAN" (font 12px semi bold uppercase warna `#5F6F6A`).
   - Daftar Checkbox Interaktif dengan StatusPill:
     - Checkbox 1: Pill "• Menunggu Persetujuan" (biru)
     - Checkbox 2: Pill "• Sedang Diproses" (kuning/amber)
     - Checkbox 3: Pill "• Disetujui" (hijau)
     - Checkbox 4: Pill "• Ditolak" (merah)
   - Setiap baris dapat diklik (label click triggers checkbox toggle).
3. **Aksi Footer:**
   - Tombol "Reset": Tombol sekunder putih dengan border `#E4EBE8`, teks hitam/medium, membersihkan seluruh pilihan filter.
   - Tombol "Terapkan": Tombol primer warna hijau brand `#0E7C5A`, teks putih, menerapkan filter ke daftar data tabel dan menutup modal.

---

## 2. Kepatuhan Ketat Aturan Antislop

Implementasi wajib menerapkan prinsip dari `.agents/skills/antislop`, `antislop-code`, dan `antislop-ui`:

### 2.1 Antislop Core & UI (`antislop`, `antislop-ui`)
- **Mode Eksekusi:** `during` (pencegahan sejak awal penulisan kode).
- **Larangan Tanda Em Dash (R-02):** Tidak boleh ada karakter em dash (`—`) pada seluruh teks UI, judul, tooltip, placeholder, maupun dokumen implementasi. Gunakan tanda hubung strip biasa (`-`), titik dua (`:`), atau tanda kurung (`()`).
- **Warna & Palet (R-01, R-29):** Gunakan token warna SIPBAJA (`brand: #0E7C5A`, `canvas: #F3F6F5`, `surface: #FFFFFF`, `border: #E4EBE8`). Dilarang memakai gradien biru-ungu generik AI atau glow neon.
- **Responsivitas Mobile (R-03):** Seluruh elemen responsif tanpa overflow horizontal. Tabel mendukung scroll horizontal bersih, input dan tombol memenuhi minimum target sentuh 44px.
- **Tipografi & Ikon (R-04, R-06):** Font Plus Jakarta Sans dengan hierarki jelas. Ikon relevan menggunakan Lucide (2px stroke, round join), dilarang memakai ikon spark/magic/robot AI.
- **Status UI Lengkap (R-27):**
  - **Loading state:** Skeleton rows elegan dengan animasi shimmer halus pada tabel saat memuat data.
  - **Empty state:** Tampilan informatif ketika data permohonan kosong atau tidak ditemukan dengan tombol reset filter atau buat permohonan baru.
  - **Error state:** Pesan kegagalan komunikasi API yang ramah dan tombol "Coba Lagi".
- **Aksesibilitas (R-25, R-32):**
  - Kontras teks memenuhi standar WCAG AA (rasio minimal 4.5:1).
  - Aksesibilitas keyboard penuh: fokus dapat dipindah dengan `Tab` / `Shift+Tab`, tombol diaktifkan dengan `Enter` / `Space`, dan popover/modal dapat ditutup dengan `Escape`.
  - Fokus visual selalu jelas dengan `focus-visible:ring-2 focus-visible:ring-[#0E7C5A]`.
- **Integritas Kontrol Interaktif (R-26):** Dilarang membuat tombol atau tautan tanpa fungsi nyata. Semua kontrol (search, filter, pagination, row action, download, create) memiliki handler operasional.

### 2.2 Higienitas Komentar Kode (`antislop-code`)
- Dilarang membuat banner separator dekoratif seperti `// =======================` atau `/* ---- FILTER ---- */`.
- Dilarang membuat komentar yang sekadar mengulang kode yang sudah jelas (signature echo atau restating obvious), seperti `// Set search value` di atas `setSearch(val)`.
- Dilarang memakai emoji dekoratif di dalam komentar kode (`// ✅ Filter applied`).
- Dilarang menarasikan alur langkah per langkah (`// Step 1: Validate`, `// Step 2: Query`).
- Komentar hanya digunakan untuk menjelaskan alasan bisnis, batasan teknis (workaround), atau aturan otorisasi/keamanan yang tidak tampak langsung dari sintaksis.

---

## 3. Peta File yang Dibuat / Diubah

| File | Tipe | Perubahan / Tujuan |
|---|---|---|
| `backend/app/Services/PermohonanService.php` | Backend Service | Mendukung filter multi-status (array/comma-separated) serta query search nomor surat dan judul secara fleksibel. |
| `backend/app/Http/Controllers/Pemohon/PermohonanPemohonController.php` | Controller | Menyesuaikan pembacaan parameter query status multi-select pada endpoint `index`. |
| `backend/tests/Feature/Pemohon/PermohonanListTest.php` | Feature Test | Pengujian komprehensif endpoint list permohonan: filter multi-status, pencarian, paginasi, dan isolasi unit kerja. |
| `frontend/src/types/permohonan.ts` | Frontend Types | Definisi tipe TypeScript untuk item permohonan, parameter filter, status opsi, dan meta pagination. |
| `frontend/src/components/atoms/StatusPill.tsx` | Atom Component | Penambahan dukungan status `menunggu_persetujuan` dan `sedang_diproses` sesuai desain token. |
| `frontend/src/components/molecules/FilterPermohonanModal.tsx` | Molecule Component | Komponen popover/modal filter interaktif status permohonan dengan opsi multi-select, tombol Reset, dan Terapkan. |
| `frontend/src/components/molecules/PermohonanRow.tsx` | Molecule Component | Penyelarasan format baris tabel, link nomor surat, status pill, dan dropdown menu aksi dengan aria-label lengkap. |
| `frontend/src/components/organisms/PermohonanTable.tsx` | Organism Component | Komponen tabel modular lengkap dengan skeleton loading, empty state, error state, dan bar navigasi pagination. |
| `frontend/src/pages/Pemohon/Permohonan/Index.tsx` | Page Component | Rekonstruksi halaman List Permohonan agar 100% presisi dengan `list_permohonan_jurusan.png` dan terintegrasi dengan filter popover. |
| `frontend/src/utils/formatPermohonan.ts` | Utils | Pemutakhiran fungsi label dan warna status untuk mengakomodasi status yang ada pada desain. |
| `docs/API_CONTRACT.md` | Dokumentasi | Penyelarasan parameter filter status pada endpoint `GET /api/v1/pemohon/permohonan`. |

---

## 4. Checklist Implementasi Terstruktur

### Fase 1: Backend Service, Controller & Feature Test (PHP 8.5 / Laravel 13)

- [x] **1.1** Perbarui method `daftarPermohonan` di `backend/app/Services/PermohonanService.php`:
  - Parameter `$status` menerima string atau array (mendukung format koma `menunggu_persetujuan,sedang_diproses` atau array `status[]`).
  - Lakukan mapping nilai status UI (`menunggu_persetujuan` ke status model terkait seperti `menunggu_bidang2` atau `diajukan`).
  - Gunakan `whereIn('status', $statusArray)` jika ada pilihan status aktif.
  - Pertahankan filter wajib `unit_id = $user->unit_id` (PRD 5.6: visibilitas berbasis unit).
  - Eager load relasi berkas dokumen `Dokumen`.
  - Paginasi 10 item per halaman dengan `withQueryString()`.

- [x] **1.2** Perbarui method `index` di `backend/app/Http/Controllers/Pemohon/PermohonanPemohonController.php`:
  - Baca parameter `status` dan `search` dari `Request`.
  - Teruskan data yang telah disanitasi ke `PermohonanService`.
  - Kembalikan `JsonResponse` dengan format standar API Contract (`permohonanList` terpaginasi dan `filters`).
  - Pastikan tidak ada query Eloquent langsung di dalam controller.

- [x] **1.3** Buat feature test `backend/tests/Feature/Pemohon/PermohonanListTest.php`:
  - Test autentikasi: guest ditolak dengan status 401.
  - Test otorisasi peran: hanya role Pemohon yang dapat mengakses.
  - Test isolasi unit: pemohon hanya melihat data permohonan milik unit kerjanya sendiri.
  - Test pencarian: filter berdasarkan kata kunci nomor surat dan judul pengadaan berfungsi akurat.
  - Test filter status: pemohon dapat memfilter permohonan dengan satu atau beberapa status sekaligus.
  - Test pagination: halaman kedua mengembalikan potongan data yang tepat.

- [x] **1.4** Jalankan linter dan formatter:
  - Eksekusi `vendor/bin/pint --dirty --format agent` di direktori backend.
  - Jalankan `php artisan test --filter=PermohonanListTest` dan pastikan semua test hijau (PASSED).

---

### Fase 2: Sinkronisasi API Contract & Tipe Data TypeScript

- [x] **2.1** Perbarui dokumentasi `docs/API_CONTRACT.md`:
  - Catat dukungan parameter query `status` (bisa berupa nilai tunggal, string dipisah koma, atau array multi-status).
  - Pastikan contoh request dan response JSON mencerminkan format terpaginasi terkini.

- [x] **2.2** Buat/perbarui tipe TypeScript di `frontend/src/types/permohonan.ts`:
  - Interface `PermohonanItem`: `id`, `nomor_surat`, `judul`, `ringkasan_tujuan`, `estimasi_anggaran`, `status`, `revisi_ke`, `created_at`.
  - Interface `PermohonanListResponse`: `data`, `links`, `meta` / `from`, `to`, `total`, `current_page`, `last_page`.
  - Interface `FilterStatusOption`: `key`, `label`, `colorVariant`.

- [x] **2.3** Perbarui utils di `frontend/src/utils/formatPermohonan.ts`:
  - Tambahkan mapping status untuk `menunggu_persetujuan` dan `sedang_diproses`.
  - Pastikan `formatRupiah` menangani angka null/undefined secara aman.
  - Pastikan `formatTanggal` menghasilkan tanggal dalam Bahasa Indonesia sesuai format mockup ("12 Okt 2026").

---

### Fase 3: Atoms & Molecules (StatusPill & Filter Modal)

- [x] **3.1** Selaraskan `frontend/src/components/atoms/StatusPill.tsx`:
  - Tambahkan key config `menunggu_persetujuan` (dot `#2F6FED`, text `#1F55C7`, bg `#E8F0FF`, label "Menunggu Persetujuan").
  - Tambahkan key config `sedang_diproses` (dot `#D97706`, text `#B45309`, bg `#FEF3C7`, label "Sedang Diproses").
  - Pastikan indikator titik bulat (`w-[7px] h-[7px]`) dan pill rounded-full sesuai desain `filter_jurusan.png`.

- [x] **3.2** Buat komponen `frontend/src/components/molecules/FilterPermohonanModal.tsx`:
  - Implementasi popover/modal mengacu ke `docs/design/filter_jurusan.png`.
  - Header: Label "Filter" tebal dengan tombol close silang (`×`) bersuara aria-label "Tutup filter".
  - Section label: "STATUS PERMOHONAN" (`text-xs font-semibold text-[#5F6F6A] uppercase tracking-wider`).
  - Opsi Checkbox dengan StatusPill:
    1. `menunggu_persetujuan` ("• Menunggu Persetujuan")
    2. `sedang_diproses` ("• Sedang Diproses")
    3. `disetujui` ("• Disetujui")
    4. `ditolak` ("• Ditolak")
  - State lokal sementara untuk seleksi multi-checkbox saat modal terbuka.
  - Tombol aksi:
    - Tombol "Reset" (membersihkan checklist dan mengembalikan state kosong).
    - Tombol "Terapkan" (mengirimkan array status terpilih ke parent dan menutup modal).
  - Aksesibilitas:
    - Menutup saat tombol `Escape` ditekan.
    - Menutup saat backdrop/klik di luar modal terdeteksi.
    - Focus trap sederhana dan fokus kembali ke tombol pembuka saat ditutup.

- [x] **3.3** Selaraskan `frontend/src/components/molecules/PermohonanRow.tsx`:
  - Kolom nomor surat: Link tombol dengan warna hijau brand `#0E7C5A` dan hover underline.
  - Kolom judul pengadaan: Teks medium `#14201C` dengan tooltip bawaan untuk judul panjang.
  - Kolom tanggal: Teks abu-abu `#5F6F6A` dengan format "DD Mmm YYYY".
  - Kolom nilai pengajuan: Format rupiah bold `#14201C`.
  - Kolom status: Render menggunakan `StatusPill`.
  - Kolom aksi: Tombol kebab 3-titik vertikal (`MoreVertical`) dengan dropdown popover untuk aksi "Lihat Detail" dan "Unduh Dokumen".
  - Dropdown aksi dapat ditutup dengan klik luar dan tombol `Escape`.

---

### Fase 4: Organisms (PermohonanTable & Toolbar)

- [x] **4.1** Buat/perbarui `frontend/src/components/organisms/PermohonanTable.tsx`:
  - Membungkus tabel dengan styling kartu putih, border `#E4EBE8`, dan `rounded-[20px]`.
  - Header baris tabel dengan latar `surface-table-head` (`#F1F7F4`), teks uppercase tracking-wider.
  - Penanganan state lengkap (R-27):
    - **Loading State:** 5 baris skeleton shimmer yang mencakup seluruh kolom dengan layout proporsional.
    - **Empty State:** Ikon folder/dokumen kosong, pesan "Tidak ada permohonan yang sesuai filter", serta tombol pembantu "Reset Filter" atau "Buat Permohonan Baru".
    - **Error State:** Pesan kesalahan "Gagal memuat data permohonan", dengan tombol "Coba Lagi".
  - Footer navigasi paginasi:
    - Teks info: "Menampilkan {from}-{to} dari {total} permohonan".
    - Tombol navigasi halaman: Tombol panah Sebelumnya (`<`), nomor halaman dengan penanda halaman aktif (background hijau brand `#0E7C5A` rounded), elipsis (`...`), dan panah Selanjutnya (`>`).

---

### Fase 5: Halaman Utama `PermohonanIndex.tsx` & Responsivitas Mobile

- [x] **5.1** Rombak `frontend/src/pages/Pemohon/Permohonan/Index.tsx`:
  - Sesuaikan Sidebar props:
    - Menu aktif "List Permohonan" membawa badge count angka dinamis (atau jumlah permohonan yang memerlukan perhatian).
    - Menu "Dashboard" mengarah ke `/pemohon/dashboard`.
  - Sesuaikan `HeroBanner`:
    - Eyebrow: "DAFTAR PERMOHONAN".
    - Title: "List Permohonan".
    - Subtitle: "Pantau, cari, dan kelola seluruh permohonan pengadaan Anda.".
    - CTA: "+ Buat Permohonan" mengarah ke `/pemohon/permohonan/create`.
  - Toolbar Kontrol pada Card Utama:
    - Tombol `[Filter]` dengan ikon corong, menampilkan badge dot jika ada filter aktif.
    - Kolom input search "Cari nomor atau judul..." dengan debounce pencarian 350ms (atau submit search).
    - Counter total permohonan di sebelah kanan: contoh "238 permohonan".
  - Terintegrasi dengan `FilterPermohonanModal` untuk filter status multi-select.
  - Terintegrasi dengan `DetailPermohonanModal` saat user mengklik nomor surat atau aksi "Lihat Detail".
  - Integrasi unduh dokumen langsung memanggil endpoint `/api/v1/pemohon/permohonan/{id}/dokumen`.

- [x] **5.2** Verifikasi Tata Letak Mobile & Responsivitas (R-03):
  - Pada layar kecil (`< 768px`), toolbar filter dan search menyusun secara vertikal (stacked) dengan rapi.
  - Tabel memiliki pembungkus `overflow-x-auto` yang mulus tanpa merusak layout luar halaman.
  - Seluruh target tombol interaktif memiliki tinggi minimal 44px untuk kenyamanan sentuhan jari.

---

### Fase 6: Penerapan Aturan Antislop & Higienitas Kode

- [x] **6.1** Audit dan Eliminasi Tanda Em Dash (R-02):
  - Periksa seluruh file baru dan file yang diubah (`grep -n "—" frontend/src/...`).
  - Ganti setiap karakter em dash dengan tanda hubung strip biasa, titik dua, atau kurung.

- [x] **6.2** Audit Higienitas Komentar Kode (`antislop-code`):
  - Pastikan tidak ada banner karakter seperti `// =======` atau `/* ---- */`.
  - Pastikan tidak ada komentar yang mengulang kode (`// Render table`, `// Handle click`).
  - Pastikan tidak ada emoji dalam komentar kode.
  - Pastikan tidak ada narasi langkah (`// Step 1:`, `// Step 2:`).

- [x] **6.3** Audit Desain UI & Token (`antislop-ui`):
  - Pastikan tidak ada gradien biru-ungu generik.
  - Pastikan bayangan kartu halus dan natural (`shadow-sm` atau token elevation SIPBAJA).
  - Pastikan tidak ada elemen interaktif yang mati atau link buntu (R-26).
  - Pastikan fokus keyboard memiliki indikator yang kontras dan jelas (R-32).

---

### Fase 7: Pengujian, Formatting & Delivery Gate (R-35)

- [ ] **7.1** Backend Code Styling:
  - Jalankan `vendor/bin/pint --dirty --format agent` di folder backend.

- [ ] **7.2** Backend Test Execution:
  - Jalankan `php artisan test --compact` untuk memastikan seluruh rangkaian pengujian backend sukses tanpa regresi.

- [ ] **7.3** Frontend TypeScript Check & Bundling:
  - Jalankan pemeriksaan tipe: `npx tsc --noEmit` di folder frontend.
  - Jalankan build frontend: `npm run build` di folder frontend dan pastikan tidak ada error manifest atau asset.

- [ ] **7.4** Verifikasi Manual Antarmuka (Browser Checklist):
  - Login sebagai user Jurusan/Unit (Pemohon).
  - Akses menu `/pemohon/permohonan`.
  - Verifikasi kesesuaian visual dengan `docs/design/list_permohonan_jurusan.png`.
  - Buka modal filter, pilih status, klik "Terapkan", pastikan daftar tabel terfilter sesuai pilihan.
  - Buka modal filter, klik "Reset", pastikan pilihan kembali bersih dan tabel memuat ulang semua data.
  - Masukkan kata kunci pada search bar, pastikan hasil pencarian responsif.
  - Uji tombol navigasi pagination halaman 1, 2, dan seterusnya.
  - Uji klik nomor surat untuk membuka detail modal.
  - Uji tombol kebab aksi 3-titik untuk opsi detail dan unduh dokumen.
  - Uji navigasi keyboard menggunakan `Tab`, `Enter`, dan tombol `Escape` untuk menutup modal filter.

