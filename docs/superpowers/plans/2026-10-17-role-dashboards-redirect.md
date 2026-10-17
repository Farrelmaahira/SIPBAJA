# Role Dashboards and Post-Login Redirect Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menyediakan rute, controller, template dashboard (sidebar tanpa item navigasi dan topbar), serta halaman dashboard untuk 8 peran non-admin (Pemohon, Perencanaan, Bidang 2, PPBJ, PP, PPK, Perlengkapan, Keuangan) sehingga proses login pada `AuthController` berhasil me-redirect pengguna ke dashboard masing-masing.

**Architecture:** Menggunakan arsitektur monolitik Laravel 13 + Inertia.js + React 19. Setiap peran memiliki Controller invokable di `app/Http/Controllers/` dan Page React di `resources/js/Pages/<Role>/Dashboard.jsx`. Halaman-halaman tersebut mengonsumsi template bersama `RoleDashboardTemplate.jsx` yang memanfaatkan `DashboardShellTemplate` dengan `sidebarProps` tanpa link navigasi (`navItems: []`) dan `DashboardTopbar`.

**Tech Stack:** Laravel 13, PHP 8.5.11, React 19, Inertia.js v2, Tailwind CSS v4, PHPUnit.

**Spec:** [docs/PRD.md](file:///d:/Farrel/PROJECTS/sipbaja/docs/PRD.md), [docs/DEVELOPMENT_RULES.md](file:///d:/Farrel/PROJECTS/sipbaja/docs/DEVELOPMENT_RULES.md), [docs/design.md](file:///d:/Farrel/PROJECTS/sipbaja/docs/design.md).

## Global Constraints

- Sesuai [DEVELOPMENT_RULES.md](file:///d:/Farrel/PROJECTS/sipbaja/docs/DEVELOPMENT_RULES.md) Bagian 10 & 11:
  - Struktur Atomic Design: komponen UI di `components/templates/`, halaman di `Pages/<Role>/`.
  - Template murni presentasional (tidak ada `useState` untuk data bisnis, tidak ada hardcoded mock data palsu).
  - Menggunakan utilitas Tailwind CSS murni dan token warna yang sudah ada di [docs/design.md](file:///d:/Farrel/PROJECTS/sipbaja/docs/design.md) (Canvas `#F3F6F5`, Brand `#0E7C5A`, Border `#E4EBE8`, Text `#14201C`, `#5F6F6A`, `#8A9A95`).
- Logika redirect di [app/Http/Controllers/AuthController.php](file:///d:/Farrel/PROJECTS/sipbaja/app/Http/Controllers/AuthController.php) disesuaikan agar role dengan spasi dinormalisasi:
  - `$role = str_replace(' ', '', strtolower($user->Role->nama));`
  - `$route = $role . '.dashboard';`
  - Nama rute: `pemohon.dashboard`, `perencanaan.dashboard`, `bidang2.dashboard`, `ppbj.dashboard`, `pp.dashboard`, `ppk.dashboard`, `perlengkapan.dashboard`, `keuangan.dashboard`, serta `admin.dashboard`.
- Controller invokable satu peran satu file di `app/Http/Controllers/`, tidak memuat query bisnis ilegal.
- Seluruh pengujian menggunakan PHPUnit via `php artisan test --compact`.

## Review Focus

1. **Sinkronisasi Nama Rute `bidang2.dashboard`:** `AuthController` menormalisasi spasi pada nama peran (`str_replace(' ', '', ...)`) sehingga `Bidang 2` mengarah ke rute `'bidang2.dashboard'`.
2. **Kelengkapan 8 Peran Non-Admin:** Pemohon, Perencanaan, Bidang 2, PPBJ, PP, PPK, Perlengkapan, dan Keuangan semuanya memiliki rute, controller, dan page dashboard.
3. **Sidebar Tanpa Navigasi Terlebih Dahulu:** Sesuai permintaan pengguna, sidebar menampilkan identitas brand SIPBAJA namun daftar menu navigasi kosong (`navItems: []`).
4. **Proteksi Autentikasi:** Semua rute dashboard wajib dibungkus middleware `auth` dan me-redirect tamu ke rute `login`.
5. **Perbaikan Regresi Test Login:** Memperbaiki pengujian di `tests/Feature/Auth/LoginTest.php` yang sebelumnya mencari rute usang `route('dashboard')` dan memverifikasi redirect setiap role.

---

### Task 1: Shared UI Template `RoleDashboardTemplate.jsx`

**Files:**
- Create: `resources/js/components/templates/RoleDashboardTemplate.jsx`

**Interfaces:**
- Consumes:
  - `resources/js/components/templates/DashboardShellTemplate.jsx`
  - `user` object dari props Inertia (`auth.user`)
- Produces:
  - `RoleDashboardTemplate({ roleTitle, roleDescription, user, children })`

- [ ] **Step 1: Buat template `RoleDashboardTemplate.jsx`**
  Implementasikan template yang membungkus `DashboardShellTemplate` dengan `sidebarProps={{ navItems: [] }}` (sidebar tanpa navigasi), `topbarProps={{ user }}`, serta hero banner bertema `#0E7C5A` yang menampilkan judul peran dan status unit pengguna.

- [ ] **Step 2: Jalankan build Vite untuk memastikan tidak ada syntax error**
  Run: `npm run build`
  Expected: Build sukses tanpa error bundling.

- [ ] **Step 3: Commit Task 1**
  ```bash
  git add resources/js/components/templates/RoleDashboardTemplate.jsx
  git commit -m "feat(ui): create generic role dashboard template with clean sidebar and topbar"
  ```

---

### Task 2: Controller & Route Setup untuk 8 Peran Non-Admin

**Files:**
- Modify: `app/Http/Controllers/AuthController.php`
- Create: `app/Http/Controllers/DashboardPemohonController.php`
- Create: `app/Http/Controllers/DashboardPerencanaanController.php`
- Create: `app/Http/Controllers/DashboardBidang2Controller.php`
- Create: `app/Http/Controllers/DashboardPpbjController.php`
- Create: `app/Http/Controllers/DashboardPpController.php`
- Create: `app/Http/Controllers/DashboardPpkController.php`
- Create: `app/Http/Controllers/DashboardPerlengkapanController.php`
- Create: `app/Http/Controllers/DashboardKeuanganController.php`
- Modify: `routes/web.php`

**Interfaces:**
- Consumes:
  - `Illuminate\Http\Request`
  - `Inertia\Inertia::render()`
- Produces:
  - Normalisasi `$role = str_replace(' ', '', strtolower($user->Role->nama));` di `AuthController.php`.
  - Rute GET terdaftar di `routes/web.php`:
    - `/pemohon/dashboard` (`pemohon.dashboard`) -> `DashboardPemohonController`
    - `/perencanaan/dashboard` (`perencanaan.dashboard`) -> `DashboardPerencanaanController`
    - `/bidang-2/dashboard` (`bidang2.dashboard`) -> `DashboardBidang2Controller`
    - `/ppbj/dashboard` (`ppbj.dashboard`) -> `DashboardPpbjController`
    - `/pp/dashboard` (`pp.dashboard`) -> `DashboardPpController`
    - `/ppk/dashboard` (`ppk.dashboard`) -> `DashboardPpkController`
    - `/perlengkapan/dashboard` (`perlengkapan.dashboard`) -> `DashboardPerlengkapanController`
    - `/keuangan/dashboard` (`keuangan.dashboard`) -> `DashboardKeuanganController`

- [ ] **Step 1: Update normalisasi role di `app/Http/Controllers/AuthController.php`**
  Ganti baris penentuan rute:
  ```php
  $role = str_replace(' ', '', strtolower($user->Role->nama));
  $route = $role . '.dashboard';
  ```

- [ ] **Step 2: Buat 8 Invokable Controller di `app/Http/Controllers/`**
  Setiap controller me-return Inertia view masing-masing:
  - `DashboardPemohonController`: `Pemohon/Dashboard`
  - `DashboardPerencanaanController`: `Perencanaan/Dashboard`
  - `DashboardBidang2Controller`: `Bidang2/Dashboard`
  - `DashboardPpbjController`: `Ppbj/Dashboard`
  - `DashboardPpController`: `Pp/Dashboard`
  - `DashboardPpkController`: `Ppk/Dashboard`
  - `DashboardPerlengkapanController`: `Perlengkapan/Dashboard`
  - `DashboardKeuanganController`: `Keuangan/Dashboard`

- [ ] **Step 3: Daftarkan rute di `routes/web.php` dalam grup middleware `auth`**
  Pastikan nama rute:
  `pemohon.dashboard`, `perencanaan.dashboard`, `bidang2.dashboard`, `ppbj.dashboard`, `pp.dashboard`, `ppk.dashboard`, `perlengkapan.dashboard`, `keuangan.dashboard`.

- [ ] **Step 4: Verifikasi daftar rute via Artisan**
  Run: `php artisan route:list --path=dashboard`
  Expected: Seluruh 8 rute baru + rute admin terdaftar dengan nama rutenya masing-masing.

- [ ] **Step 5: Format kode PHP dengan Laravel Pint**
  Run: `vendor/bin/pint --format agent`

- [ ] **Step 6: Commit Task 2**
  ```bash
  git add app/Http/Controllers/ routes/web.php
  git commit -m "feat(routes): add dashboard controllers and routes for all non-admin roles"
  ```

---

### Task 3: React Pages Scaffold untuk 8 Peran Non-Admin

**Files:**
- Create: `resources/js/Pages/Pemohon/Dashboard.jsx`
- Create: `resources/js/Pages/Perencanaan/Dashboard.jsx`
- Create: `resources/js/Pages/Bidang2/Dashboard.jsx`
- Create: `resources/js/Pages/Ppbj/Dashboard.jsx`
- Create: `resources/js/Pages/Pp/Dashboard.jsx`
- Create: `resources/js/Pages/Ppk/Dashboard.jsx`
- Create: `resources/js/Pages/Perlengkapan/Dashboard.jsx`
- Create: `resources/js/Pages/Keuangan/Dashboard.jsx`

**Interfaces:**
- Consumes:
  - `resources/js/components/templates/RoleDashboardTemplate.jsx`
  - `usePage().props` (`auth.user`)
- Produces:
  - React Component export default untuk masing-masing halaman Inertia.

- [ ] **Step 1: Buat 8 file Page Dashboard**
  Setiap file menyertakan `<Head title="..." />` dan merender `RoleDashboardTemplate` dengan props `roleTitle` sesuai perannya (misal "Dashboard Pemohon", "Dashboard PPK", dsb.) serta meneruskan `user={auth?.user}`.

- [ ] **Step 2: Jalankan build Vite untuk memverifikasi seluruh komponen page terbundle dengan baik**
  Run: `npm run build`
  Expected: Build sukses tanpa error kompilasi JSX/React.

- [ ] **Step 3: Commit Task 3**
  ```bash
  git add resources/js/Pages/
  git commit -m "feat(pages): scaffold dashboard pages for 8 non-admin roles"
  ```

---

### Task 4: Automated Feature Tests & Verification

**Files:**
- Modify: `tests/Feature/Auth/LoginTest.php`
- Create: `tests/Feature/Dashboard/RoleDashboardAccessTest.php`

**Interfaces:**
- Consumes:
  - `UserSeeder` & `RoleSeeder`
  - Routes yang baru dibuat
- Produces:
  - Test suite lengkap untuk redirect per role dan akses dashboard.

- [ ] **Step 1: Perbarui `tests/Feature/Auth/LoginTest.php`**
  Ganti referensi usang `route('dashboard')` menjadi `route('admin.dashboard')` untuk login admin, dan periksa redirect login PPK ke `route('ppk.dashboard')`.

- [ ] **Step 2: Buat `tests/Feature/Dashboard/RoleDashboardAccessTest.php`**
  Uji:
  - Login untuk semua 9 akun role di `UserSeeder` masing-masing mengarah ke route dashboard yang tepat.
  - Setiap endpoint dashboard (`pemohon`, `perencanaan`, `bidang-2`, `ppbj`, `pp`, `ppk`, `perlengkapan`, `keuangan`) mengembalikan status HTTP 200 OK ketika diakses oleh user terautentikasi.
  - Guest yang mengakses rute-rute dashboard tersebut dialihkan (302) ke rute `login`.

- [ ] **Step 3: Jalankan test suite PHPUnit**
  Run: `php artisan test --compact`
  Expected: Semua test pass (termasuk LoginTest dan RoleDashboardAccessTest).

- [ ] **Step 4: Jalankan Laravel Pint untuk memastikan kebersihan format kode**
  Run: `vendor/bin/pint --format agent`

- [ ] **Step 5: Commit Task 4**
  ```bash
  git add tests/Feature/
  git commit -m "test(auth): add role dashboard redirect and access feature tests"
  ```
