# PPBJ Permohonan Pengadaan List Implementation Plan (Without Filtering)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun halaman daftar untuk melihat data permohonan pengadaan bagi peran PPBJ pada route `/ppbj/permohonan` (`ppbj.permohonan.index`) secara langsung tanpa fitur filter/pencarian terlebih dahulu, sesuai Service Layer backend, Atomic Design, panduan [DESIGN.md](file:///d:/Farrel/PROJECTS/sipbaja/docs/DESIGN.md), [DEVELOPMENT_RULES.md](file:///d:/Farrel/PROJECTS/sipbaja/docs/DEVELOPMENT_RULES.md), dan [antislop-ui](file:///d:/Farrel/PROJECTS/sipbaja/.agents/skills/antislop-ui/SKILL.md).

**Architecture:**
- Backend: `PermohonanService` mengisolasi kueri data permohonan (`Unit`, `permohonanMak.Mak`, `Pengadaan`) dan memetakan ke array data representatif. Controller `App\Http\Controllers\PPBJ\PermohonanController@index` memanggil service dan mengembalikan Inertia render `Ppbj/Permohonan/Index`.
- Frontend: Menerapkan Atomic Design satu arah (`atoms -> molecules -> templates -> pages`). Komponen `PermohonanTable` dan `PermohonanIndexTemplate` bersifat murni presentasional, merender data permohonan tanpa bilah filter. Halaman `Pages/Ppbj/Permohonan/Index.jsx` bertindak sebagai *glue layer*.
- UI/Design: Mematuhi `antislop-ui` dan `DESIGN.md`: warna brand tunggal Emerald `#0E7C5A`, kanvas `#F3F6F5`, permukaan kartu putih dengan border `#E4EBE8`, tipografi Plus Jakarta Sans, tanpa emoji dekoratif, tap target minimal 44px, dan empty state informatif jika belum ada data. Topbar tidak memuat searchbar (`showSearch: false`).

**Tech Stack:** PHP 8.5.x, Laravel 13, React 19, Inertia.js 3.x, Tailwind CSS v4, SQLite (dev) / PostgreSQL 18 (prod).

**Spec:** [docs/PRD.md](file:///d:/Farrel/PROJECTS/sipbaja/docs/PRD.md), [docs/DESIGN.md](file:///d:/Farrel/PROJECTS/sipbaja/docs/DESIGN.md), [docs/DEVELOPMENT_RULES.md](file:///d:/Farrel/PROJECTS/sipbaja/docs/DEVELOPMENT_RULES.md), [docs/DATABASE_SIPBAJA.md](file:///d:/Farrel/PROJECTS/sipbaja/docs/DATABASE_SIPBAJA.md).

## Global Constraints

- Logika bisnis dan kueri data hanya berada di Service Layer (`app/Services/PermohonanService.php`); Controller dilarang memuat kueri Eloquent langsung.
- Fitur filter (dropdown status, dropdown unit, atau form pencarian) ditiadakan terlebih dahulu pada iterasi ini sesuai arahan pengguna.
- Seluruh copy antarmuka menggunakan Bahasa Indonesia format *sentence case*, tanpa karakter em dash (`—`) atau emoji dekoratif.
- Format kode PHP wajib mematuhi standar PSR-12 dan diverifikasi dengan `php vendor/bin/pint --format agent`.
- Skema database 100% mengikuti [DATABASE_SIPBAJA.md](file:///d:/Farrel/PROJECTS/sipbaja/docs/DATABASE_SIPBAJA.md) tanpa DB triggers atau fitur PostgreSQL-spesifik.

## Review Focus

1. **Permohonan Kosong (Empty State):** Saat database belum memiliki data permohonan, UI menampilkan pesan ramah informatif, bukan tabel patah atau kotak kosong tanpa konteks.
2. **Permohonan Tanpa MAK:** Jika suatu permohonan belum memiliki MAK terkait, kolom MAK menampilkan badge netral "Belum ditentukan" dan tidak memicu galat null pointer.
3. **Presisi Nominal Anggaran:** Estimasi anggaran berukuran besar (misal > Rp 10 Miliar) terformat rapi dengan util `formatRupiah` tanpa terpotong atau overflow secara horizontal.
4. **Indikator Revisi:** Permohonan dengan `revisi_ke > 0` menampilkan penanda revisi yang jelas agar PPBJ dapat mengidentifikasi riwayat pengajuan ulang.
5. **Aksesibilitas & Kontras:** Baris tabel memiliki kontras teks yang terbaca dan aksi tombol detail/proses memiliki tap target minimal 44px.

---

### Task 1: Backend Service Method for PPBJ Permohonan List

**Files:**
- Create: `app/Services/PermohonanService.php`
- Test: `tests/Feature/PPBJ/PermohonanServiceTest.php`

**Interfaces:**
- Produces: `PermohonanService::getPermohonanPpbjList(): array`
  ```php
  [
      [
          'id' => int,
          'nomorSurat' => string,
          'judul' => string,
          'ringkasanTujuan' => string,
          'unitNama' => string,
          'estimasiAnggaran' => float,
          'revisiKe' => int,
          'status' => string,
          'tanggalPengajuan' => string,
          'makList' => string[],
          'jumlahPaket' => int,
      ],
      ...
  ]
  ```

- [x] **Step 1: Write the failing test**

Buat file `tests/Feature/PPBJ/PermohonanServiceTest.php` yang memverifikasi bahwa:
- `PermohonanService::getPermohonanPpbjList()` mengembalikan data permohonan terurut berdasarkan `created_at` menurun.
- Setiap entri memuat atribut `id`, `nomorSurat`, `judul`, `unitNama`, `estimasiAnggaran`, `status`, `revisiKe`, `makList`, dan `jumlahPaket`.
- Menggunakan database seeder baseline untuk memastikan integritas data teruji.

- [x] **Step 2: Run test to verify it fails**

Run: `php artisan test tests/Feature/PPBJ/PermohonanServiceTest.php`
Expected: FAIL (class `App\Services\PermohonanService` does not exist).

- [x] **Step 3: Implement `PermohonanService.php`**

Implementasikan `app/Services/PermohonanService.php`:
- `getPermohonanPpbjList(): array`:
  - Kueri `Permohonan::with(['Unit', 'permohonanMak.Mak', 'Pengadaan'])->orderByDesc('created_at')->get()`.
  - Format setiap record ke bentuk representasional dengan penanganan aman untuk tanggal `created_at` via `Carbon::parse` dan daftar MAK.

- [x] **Step 4: Run test to verify it passes**

Run: `php artisan test tests/Feature/PPBJ/PermohonanServiceTest.php`
Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add app/Services/PermohonanService.php tests/Feature/PPBJ/PermohonanServiceTest.php
git commit -m "feat(ppbj): add permohonan service for ppbj procurement list"
```

---

### Task 2: Controller & Route Wiring for `/ppbj/permohonan`

**Files:**
- Modify: `app/Http/Controllers/PPBJ/PermohonanController.php`
- Test: `tests/Feature/PPBJ/PermohonanControllerTest.php`

**Interfaces:**
- Consumes: `PermohonanService::getPermohonanPpbjList(): array`
- Route: `GET /ppbj/permohonan` (`ppbj.permohonan.index`)
- Produces: Render Inertia `Ppbj/Permohonan/Index` dengan props:
  ```php
  [
      'permohonanList' => array,
  ]
  ```

- [x] **Step 1: Write the failing test**

Buat file `tests/Feature/PPBJ/PermohonanControllerTest.php`:
- Tamu (guest) diredirect ke login saat mengakses `GET /ppbj/permohonan`.
- Pengguna non-PPBJ ditolak dengan status HTTP 403 Forbidden.
- Pengguna PPBJ dapat mengakses `GET /ppbj/permohonan` dengan status HTTP 200 OK dan menerima render komponen `Ppbj/Permohonan/Index` beserta props `permohonanList`.

- [x] **Step 2: Run test to verify it fails**

Run: `php artisan test tests/Feature/PPBJ/PermohonanControllerTest.php`
Expected: FAIL (`index` method belum mengembalikan response Inertia).

- [x] **Step 3: Implement `PermohonanController@index`**

Perbarui `app/Http/Controllers/PPBJ/PermohonanController.php`:
- Inject `PermohonanService` melalui constructor promotion.
- Pada method `index()`, ambil data permohonan via `$this->permohonanService->getPermohonanPpbjList()` dan kembalikan `Inertia::render('Ppbj/Permohonan/Index', ['permohonanList' => ...])`.

- [x] **Step 4: Run test to verify it passes**

Run: `php artisan test tests/Feature/PPBJ/PermohonanControllerTest.php`
Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add app/Http/Controllers/PPBJ/PermohonanController.php tests/Feature/PPBJ/PermohonanControllerTest.php
git commit -m "feat(ppbj): wire permohonan controller index to service and inertia response"
```

---

### Task 3: Presentational Components (`PermohonanTable` & `PermohonanIndexTemplate`)

**Files:**
- Create: `resources/js/components/molecules/PermohonanTable.jsx`
- Create: `resources/js/components/templates/PermohonanIndexTemplate.jsx`

**Interfaces:**
- `PermohonanTable`: Menerima props murni: `{ items = [] }`.
- `PermohonanIndexTemplate`: Menerima props murni: `{ user = {}, items = [] }`.

- [x] **Step 1: Implement `PermohonanTable.jsx`**

Buat komponen tabel di `resources/js/components/molecules/PermohonanTable.jsx`:
- Tanpa bilah filter atau pencarian.
- Card wrapper putih beradius 20px, border `#E4EBE8`, shadow `shadow-[0_4px_16px_rgba(13,51,38,0.05)]`.
- Header tabel berlatar `#F1F7F4`, teks uppercase 11px font-semibold text-[#5F6F6A] tracking-[0.8px].
- Kolom tabel:
  1. No Permohonan (`nomorSurat` font-semibold text-[#0E7C5A]).
  2. Judul Pengadaan & Unit (`judul` teks medium text-[#14201C], `unitNama` teks sekunder text-[#5F6F6A]).
  3. Tanggal Pengajuan (`formatTanggalIndo(item.tanggalPengajuan)`).
  4. Sumber Dana (MAK) (badge chip `#EAF5F1` text-[#0A5C43], atau tanda netral "-" jika kosong).
  5. Estimasi Anggaran (`formatRupiah(item.estimasiAnggaran)`).
  6. Status (`StatusPill` dengan penanda revisi jika `revisiKe > 0`).
  7. Aksi (tombol "Paketkan" atau ikon aksi dengan tap target minimal 44px).
- Empty state informatif jika `items.length === 0`: "Belum ada permohonan pengadaan yang masuk."

- [x] **Step 2: Implement `PermohonanIndexTemplate.jsx`**

Buat template tata letak di `resources/js/components/templates/PermohonanIndexTemplate.jsx`:
- Membungkus halaman dengan `DashboardShellTemplate`.
- Topbar dikonfigurasi dengan `showSearch: false` agar tidak muncul searchbar redundan di atas.
- Navigasi sidebar menandai item menu `pengajuan` (`/ppbj/permohonan`) sebagai aktif.
- Menampilkan header halaman: judul "Daftar Permohonan Pengadaan" (24px Bold text-[#14201C]) dan deskripsi alur kerja PPBJ.
- Merender `PermohonanTable` dengan melewatkan prop `items`.

- [x] **Step 3: Verify with build**

Run: `cmd /c npm run build`
Expected: PASS tanpa error kompilasi.

- [x] **Step 4: Commit**

```bash
git add resources/js/components/molecules/PermohonanTable.jsx resources/js/components/templates/PermohonanIndexTemplate.jsx
git commit -m "feat(ppbj): implement presentational PermohonanTable and PermohonanIndexTemplate"
```

---

### Task 4: Inertia Glue Page & Navigation Linking

**Files:**
- Create: `resources/js/Pages/Ppbj/Permohonan/Index.jsx`
- Modify: `resources/js/components/templates/PpbjDashboardTemplate.jsx`

**Interfaces:**
- `Pages/Ppbj/Permohonan/Index.jsx`: Menerima prop `{ permohonanList = [] }` dari Inertia dan mengopernya langsung ke `PermohonanIndexTemplate`.
- Sidebar pada `PpbjDashboardTemplate`: Tautan menu "Pengajuan" mengarah ke `/ppbj/permohonan`.

- [x] **Step 1: Implement `Pages/Ppbj/Permohonan/Index.jsx`**

Buat file halaman Inertia `resources/js/Pages/Ppbj/Permohonan/Index.jsx`:
- Menampilkan `<Head title="Daftar Permohonan Pengadaan - SIPBAJA" />`.
- Mengambil `auth.user` dari `usePage().props`.
- Merender `PermohonanIndexTemplate` dengan melewatkan `user` dan `items: permohonanList`.

- [x] **Step 2: Update Sidebar Link in `PpbjDashboardTemplate.jsx`**

Pastikan tautan navigasi `pengajuan` pada `PpbjDashboardTemplate.jsx` mengarah ke `/ppbj/permohonan`.

- [x] **Step 3: Build production assets**

Run: `cmd /c npm run build`
Expected: Build sukses, aset bundel terdaftar dalam manifest tanpa peringatan.

- [x] **Step 4: Commit**

```bash
git add resources/js/Pages/Ppbj/Permohonan/Index.jsx resources/js/components/templates/PpbjDashboardTemplate.jsx
git commit -m "feat(ppbj): wire Inertia glue page and connect sidebar navigation link"
```

---

### Task 5: End-to-End Verification, Code Formatting, & Test Suite

**Files:**
- All modified PHP and JS files

- [x] **Step 1: Run complete PHP test suite**

Run: `php artisan test`
Expected: 100% tes unit dan feature lulus tanpa kegagalan (0 failures).

- [x] **Step 2: Run Pint Code Formatter**

Run: `php vendor/bin/pint --format agent`
Expected: Seluruh kode PHP sesuai standar PSR-12 dan aturan project.

- [x] **Step 3: Verify browser route access with artisan route:list**

Run: `php artisan route:list --name=ppbj.permohonan`
Expected: Rute `ppbj.permohonan.index` terdaftar dan mengarah ke `App\Http\Controllers\PPBJ\PermohonanController@index`.

- [x] **Step 4: Commit**

```bash
git add .
git commit -m "chore(ppbj): format code with pint and verify test suite for permohonan list"
```
