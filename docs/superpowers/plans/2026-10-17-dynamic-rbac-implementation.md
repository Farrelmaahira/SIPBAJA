# Dynamic RBAC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menggantikan otorisasi hak akses RBAC yang masih hardcoded (`isAdmin`) dengan sistem otorisasi dinamis berbasis permissions (`role_permissions`), memproteksi seluruh rute dashboard dan modul admin dengan middleware peran (`EnsureUserHasRole`), serta membagikan daftar permission ke frontend via Inertia.js.

**Architecture:** Memanfaatkan sistem otorisasi standar Laravel 13 (Gate & Policy) yang terintegrasi langsung dengan model `Role` dan `Permission` via relasi `role_permissions`. Pengecekan izin dienkapsulasi pada model `User` (`hasRole`, `hasPermission`, `getPermissionCodes`). Pembatasan akses halaman dashboard dan modul admin ditegakkan di level HTTP route via middleware `EnsureUserHasRole`, sedangkan aksi data (CRUD) ditegakkan oleh Laravel Policy berbasis kode permission dinamis.

**Tech Stack:** Laravel 13, PHP 8.5.11, Inertia.js v2, PHPUnit.

**Spec:** [docs/PRD.md](file:///d:/Farrel/PROJECTS/sipbaja/docs/PRD.md), [docs/DEVELOPMENT_RULES.md](file:///d:/Farrel/PROJECTS/sipbaja/docs/DEVELOPMENT_RULES.md).

## Global Constraints

- Mengikuti aturan konvensi kode di [AGENTS.md](file:///d:/Farrel/PROJECTS/sipbaja/AGENTS.md):
  - Menggunakan PHP 8 constructor property promotion dan return type declarations eksplisit.
  - Setiap perubahan PHP wajib lulus format linting Pint: `vendor/bin/pint --format agent`.
  - Pengujian dijalankan menggunakan PHPUnit via `php vendor/bin/phpunit` atau `php artisan test --compact`.
- Menjaga integritas skema database yang sudah ada: tabel `roles`, `permissions`, `role_permissions`, dan `users.role_id` tidak boleh diubah strukturnya, hanya data relasi seeder dan logika otorisasi yang disempurnakan.
- Sesuai PRD Bagian Fitur & Keamanan: *No cross-role access* (pengguna peran A tidak boleh membuka dashboard atau fitur peran B), dan otorisasi ditegakkan secara ketat di sisi server.
- Super-admin bypass: Peran `Admin` memiliki akses menyeluruh ke seluruh sistem.

## Review Focus

1. **Sinkronisasi Default Permission Seluruh Peran:** Pastikan seeder `RbacSeeder` menyinkronkan seluruh 9 peran dengan daftar kode permission masing-masing, bukan hanya peran `Admin`.
2. **Pencegahan Akses Lintas Peran (*Cross-Role Access*):** Akses ke route `/admin/*`, `/pemohon/*`, `/ppk/*`, dsb. wajib ditolak dengan HTTP 403 jika pengguna tidak memiliki peran yang berwenang.
3. **Pemberian Izin Dinamis via Policy:** Policy (`UserPolicy`, `RolePolicy`, `UnitPolicy`, `MakPolicy`) memvalidasi kode izin spesifik (`akun.view`, `role.create`, `unit.update`, `MAK.delete`, dll.) melalui `$user->hasPermission(...)` dan bukan hardcoded string role nama.
4. **Perubahan Hak Akses Real-Time:** Ketika admin mencentang atau menghapus izin peran pada menu Matriks Hak Akses (`admin.role-permission`), perubahan langsung berdampak pada autorisasi user terkait tanpa perlu restart session.
5. **Ketersediaan Props Permission di Sisi Klien:** Frontend React menerima array kode permission pada `auth.user.permissions` via `HandleInertiaRequests` untuk kebutuhan kondisional UI di masa mendatang.

---

### Task 1: Lengkapi Seeder Default Permissions untuk Seluruh 9 Peran

**Files:**
- Modify: `database/seeders/RbacSeeder.php:15-38`
- Test: `tests/Feature/Admin/RolePermissionTest.php`

**Interfaces:**
- Consumes: Model `Role`, Model `Permission`
- Produces: Sinkronisasi relasi pivot `role_permissions` untuk 9 peran (Pemohon, Perencanaan, Bidang 2, PPBJ, PP, PPK, Perlengkapan, Keuangan, Admin)

- [ ] **Step 1: Tulis test verifikasi bahwa seluruh peran memiliki default permissions setelah seeding**
  Tambahkan test method `test_seluruh_peran_memiliki_default_permissions_setelah_seeding()` di `tests/Feature/Admin/RolePermissionTest.php` yang mengecek bahwa setiap peran dalam seeder memiliki permissions > 0 di tabel pivot.

- [ ] **Step 2: Jalankan test untuk memastikan test gagal (failing test)**
  Run: `php vendor/bin/phpunit tests/Feature/Admin/RolePermissionTest.php --filter=test_seluruh_peran_memiliki_default_permissions_setelah_seeding`
  Expected: FAIL karena saat ini hanya Admin yang di-sync.

- [ ] **Step 3: Update `database/seeders/RbacSeeder.php`**
  Iterasikan seluruh item dalam array `$map` pada `RbacSeeder`:
  ```php
  foreach ($map as $roleName => $permissionCodes) {
      $role = Role::where('nama', $roleName)->first();
      if ($role) {
          $permissionIds = Permission::whereIn('kode', $permissionCodes)->pluck('id');
          $role->Permissions()->sync($permissionIds);
      }
  }
  ```

- [ ] **Step 4: Jalankan test untuk memverifikasi kelulusan**
  Run: `php vendor/bin/phpunit tests/Feature/Admin/RolePermissionTest.php`
  Expected: PASS

- [ ] **Step 5: Format dan commit Task 1**
  ```bash
  vendor/bin/pint --format agent
  git add database/seeders/RbacSeeder.php tests/Feature/Admin/RolePermissionTest.php
  git commit -m "feat(rbac): sync default permissions for all nine roles in RbacSeeder"
  ```

---

### Task 2: Implementasi Helper RBAC pada Model `User`

**Files:**
- Modify: `app/Models/User.php:35-69`
- Test: `tests/Unit/UserRbacTest.php`

**Interfaces:**
- Consumes: Relasi `Role::Permissions`
- Produces:
  - `User::hasRole(string|array $roles): bool`
  - `User::hasPermission(string $permissionCode): bool`
  - `User::getPermissionCodes(): array`

- [ ] **Step 1: Buat unit test `tests/Unit/UserRbacTest.php`**
  Uji skenario:
  - `hasRole('Admin')` bernilai `true` untuk user admin dan `false` untuk user non-admin.
  - `hasRole(['Pemohon', 'Admin'])` bernilai `true` jika user memiliki salah satu peran tersebut.
  - `hasPermission('MAK.view')` bernilai `true` untuk Admin (super-admin bypass) atau peran yang memiliki izin tersebut.
  - `hasPermission('MAK.delete')` bernilai `false` untuk peran yang tidak memiliki izin tersebut.
  - `getPermissionCodes()` mengembalikan array string kode izin yang valid.

- [ ] **Step 2: Jalankan test untuk memverifikasi kegagalan**
  Run: `php vendor/bin/phpunit tests/Unit/UserRbacTest.php`
  Expected: FAIL (method `hasRole` dan `hasPermission` belum ada).

- [ ] **Step 3: Implementasikan method RBAC di `app/Models/User.php`**
  Tambahkan method:
  ```php
  public function hasRole(string|array $roles): bool
  {
      $roleName = $this->Role?->nama;
      if (! $roleName) {
          return false;
      }

      $roles = (array) $roles;

      return in_array($roleName, $roles, true);
  }

  public function getPermissionCodes(): array
  {
      if (! $this->Role) {
          return [];
      }

      if ($this->hasRole('Admin')) {
          return Permission::pluck('kode')->all();
      }

      return $this->Role->Permissions()->pluck('kode')->all();
  }

  public function hasPermission(string $permissionCode): bool
  {
      if ($this->hasRole('Admin')) {
          return true;
      }

      return in_array($permissionCode, $this->getPermissionCodes(), true);
  }
  ```

- [ ] **Step 4: Jalankan test unit untuk memverifikasi kelulusan**
  Run: `php vendor/bin/phpunit tests/Unit/UserRbacTest.php`
  Expected: PASS

- [ ] **Step 5: Format dan commit Task 2**
  ```bash
  vendor/bin/pint --format agent
  git add app/Models/User.php tests/Unit/UserRbacTest.php
  git commit -m "feat(rbac): implement hasRole, hasPermission, and getPermissionCodes on User model"
  ```

---

### Task 3: Middleware Proteksi Rute Berdasarkan Peran (`EnsureUserHasRole`)

**Files:**
- Create: `app/Http/Middleware/EnsureUserHasRole.php`
- Modify: `bootstrap/app.php:20-25`
- Test: `tests/Feature/Auth/RoleMiddlewareTest.php`

**Interfaces:**
- Consumes: `User::hasRole(string|array $roles)`
- Produces: Middleware alias `'role'` yang menerima satu atau banyak nama peran (`role:Admin`, `role:Pemohon,Perencanaan`) dan mengembalikan response 403 Forbidden jika user tidak memenuhi syarat.

- [ ] **Step 1: Buat feature test `tests/Feature/Auth/RoleMiddlewareTest.php`**
  Uji pengujian middleware:
  - User dengan peran yang sesuai dapat melewati middleware (status 200).
  - User dengan peran berbeda ditolak dengan status 403 Forbidden.
  - Tamu yang belum login diredirect ke login oleh middleware auth sebelumnya.

- [ ] **Step 2: Jalankan test untuk memverifikasi kegagalan**
  Run: `php vendor/bin/phpunit tests/Feature/Auth/RoleMiddlewareTest.php`
  Expected: FAIL (middleware belum terdaftar).

- [ ] **Step 3: Buat middleware `app/Http/Middleware/EnsureUserHasRole.php`**
  ```php
  namespace App\Http\Middleware;

  use Closure;
  use Illuminate\Http\Request;
  use Symfony\Component\HttpFoundation\Response;

  class EnsureUserHasRole
  {
      public function handle(Request $request, Closure $next, string ...$roles): Response
      {
          $user = $request->user();

          if (! $user || ! $user->hasRole($roles)) {
              abort(403, 'Akses ditolak untuk peran Anda.');
          }

          return $next($request);
      }
  }
  ```

- [ ] **Step 4: Daftarkan alias middleware di `bootstrap/app.php`**
  ```php
  ->withMiddleware(function (Middleware $middleware): void {
      $middleware->web(append: [
          HandleInertiaRequests::class,
      ]);
      $middleware->alias([
          'role' => EnsureUserHasRole::class,
      ]);
  })
  ```

- [ ] **Step 5: Jalankan test untuk memverifikasi kelulusan**
  Run: `php vendor/bin/phpunit tests/Feature/Auth/RoleMiddlewareTest.php`
  Expected: PASS

- [ ] **Step 6: Format dan commit Task 3**
  ```bash
  vendor/bin/pint --format agent
  git add app/Http/Middleware/EnsureUserHasRole.php bootstrap/app.php tests/Feature/Auth/RoleMiddlewareTest.php
  git commit -m "feat(rbac): create EnsureUserHasRole middleware and register role alias"
  ```

---

### Task 4: Refactor Kebijakan (Policies) dari Hardcoded `isAdmin` Menjadi Permission Dinamis

**Files:**
- Modify: `app/Policies/UserPolicy.php`
- Modify: `app/Policies/RolePolicy.php`
- Modify: `app/Policies/UnitPolicy.php`
- Modify: `app/Policies/MakPolicy.php`
- Test: `tests/Feature/Admin/PenggunaTest.php`, `tests/Feature/Admin/RoleTest.php`, `tests/Feature/Admin/UnitKerjaTest.php`, `tests/Feature/Admin/MakTest.php`

**Interfaces:**
- Consumes: `User::hasPermission(string $permissionCode)`
- Produces: Otorisasi berbasis hak akses granular (`akun.*`, `role.*`, `unit.*`, `MAK.*`)

- [ ] **Step 1: Tulis test pengujian otorisasi dinamis berbasis permission di `tests/Feature/Admin/MakTest.php`**
  Tambahkan pengujian: Jika suatu peran non-admin (misal PPBJ) diberi izin `MAK.view` melalui tabel pivot `role_permissions`, pengguna tersebut diizinkan melihat daftar MAK (status 200, bukan 403).

- [ ] **Step 2: Jalankan test untuk memverifikasi kegagalan**
  Run: `php vendor/bin/phpunit tests/Feature/Admin/MakTest.php`
  Expected: FAIL (karena policy `MakPolicy` saat ini masih memeriksa `$user->role?->nama === 'Admin'`).

- [ ] **Step 3: Refactor `app/Policies/UserPolicy.php`**
  Ganti method `isAdmin()` dengan pengecekan permission:
  - `viewAny`, `view`: `$user->hasPermission('akun.view')`
  - `create`: `$user->hasPermission('akun.create')`
  - `update`: `$user->hasPermission('akun.update')`
  - `delete`: `$user->hasPermission('akun.delete')`

- [ ] **Step 4: Refactor `app/Policies/RolePolicy.php`**
  - `viewAny`, `view`: `$user->hasPermission('role.view')`
  - `create`: `$user->hasPermission('role.create')`
  - `update`: `$user->hasPermission('role.update')`
  - `delete`: `$user->hasPermission('role.delete')`

- [ ] **Step 5: Refactor `app/Policies/UnitPolicy.php`**
  - `viewAny`, `view`: `$user->hasPermission('unit.view')`
  - `create`: `$user->hasPermission('unit.create')`
  - `update`: `$user->hasPermission('unit.update')`
  - `delete`: `$user->hasPermission('unit.delete')`

- [ ] **Step 6: Refactor `app/Policies/MakPolicy.php`**
  - `viewAny`, `view`: `$user->hasPermission('MAK.view')`
  - `create`: `$user->hasPermission('MAK.create')`
  - `update`: `$user->hasPermission('MAK.update')`
  - `delete`: `$user->hasPermission('MAK.delete')`

- [ ] **Step 7: Jalankan seluruh test admin untuk memverifikasi kelulusan**
  Run: `php vendor/bin/phpunit tests/Feature/Admin`
  Expected: PASS seluruh pengujian admin CRUD.

- [ ] **Step 8: Format dan commit Task 4**
  ```bash
  vendor/bin/pint --format agent
  git add app/Policies/*.php tests/Feature/Admin/MakTest.php
  git commit -m "refactor(rbac): migrate policies from hardcoded isAdmin to dynamic permission checks"
  ```

---

### Task 5: Proteksi Rute Dashboard & Admin di `routes/web.php` (*No Cross-Role Access*)

**Files:**
- Modify: `routes/web.php:25-67`
- Modify: `tests/Feature/Dashboard/RoleDashboardAccessTest.php:50-69`

**Interfaces:**
- Consumes: Middleware `role:<RoleName>`
- Produces: Penegakan ketat akses dashboard dan modul admin sesuai peran pengguna yang sedang login.

- [ ] **Step 1: Perbarui pengujian `tests/Feature/Dashboard/RoleDashboardAccessTest.php`**
  Ganti test lama `test_user_terautentikasi_dapat_mengakses_setiap_dashboard` menjadi:
  - `test_pengguna_hanya_dapat_mengakses_dashboard_perannya_sendiri()`: Pengguna peran X berhasil mengakses dashboard X (status 200).
  - `test_pengguna_dilarang_mengakses_dashboard_peran_lain()`: Pengguna peran X ditolak dengan status 403 Forbidden saat membuka dashboard peran Y.
  - `test_bukan_admin_dilarang_mengakses_admin_dashboard()`: Pengguna selain Admin ditolak dengan status 403 saat mengakses `/admin/dashboard`.

- [ ] **Step 2: Jalankan test untuk memverifikasi kegagalan**
  Run: `php vendor/bin/phpunit tests/Feature/Dashboard/RoleDashboardAccessTest.php`
  Expected: FAIL karena route saat ini belum memiliki middleware role.

- [ ] **Step 3: Pasang middleware `role` pada grup rute di `routes/web.php`**
  - Prefix `admin` -> `middleware(['auth', 'role:Admin'])`
  - Prefix `pemohon` -> `middleware(['auth', 'role:Pemohon'])`
  - Prefix `perencanaan` -> `middleware(['auth', 'role:Perencanaan'])`
  - Prefix `bidang-2` -> `middleware(['auth', 'role:Bidang 2'])`
  - Prefix `ppbj` -> `middleware(['auth', 'role:PPBJ'])`
  - Prefix `pp` -> `middleware(['auth', 'role:PP'])`
  - Prefix `ppk` -> `middleware(['auth', 'role:PPK'])`
  - Prefix `perlengkapan` -> `middleware(['auth', 'role:Perlengkapan'])`
  - Prefix `keuangan` -> `middleware(['auth', 'role:Keuangan'])`

- [ ] **Step 4: Jalankan test dashboard untuk memverifikasi kelulusan**
  Run: `php vendor/bin/phpunit tests/Feature/Dashboard/RoleDashboardAccessTest.php`
  Expected: PASS (seluruh penegakan akses rute dashboard berhasil).

- [ ] **Step 5: Format dan commit Task 5**
  ```bash
  vendor/bin/pint --format agent
  git add routes/web.php tests/Feature/Dashboard/RoleDashboardAccessTest.php
  git commit -m "feat(rbac): enforce role middleware across admin and all role dashboard routes"
  ```

---

### Task 6: Bagikan Daftar Permissions ke Frontend via Inertia

**Files:**
- Modify: `app/Http/Middleware/HandleInertiaRequests.php:36-48`
- Test: `tests/Feature/Auth/InertiaSharedDataTest.php`

**Interfaces:**
- Consumes: `User::getPermissionCodes()`
- Produces: `auth.user.permissions` (array of strings) di setiap response Inertia.

- [ ] **Step 1: Buat feature test `tests/Feature/Auth/InertiaSharedDataTest.php`**
  Uji bahwa props `auth.user.permissions` memuat array permission yang sesuai dengan role pengguna yang login, dan `auth.user` bernilai `null` untuk tamu.

- [ ] **Step 2: Jalankan test untuk memverifikasi kegagalan**
  Run: `php vendor/bin/phpunit tests/Feature/Auth/InertiaSharedDataTest.php`
  Expected: FAIL (key `permissions` belum ada pada `auth.user`).

- [ ] **Step 3: Update `app/Http/Middleware/HandleInertiaRequests.php`**
  ```php
  'auth' => [
      'user' => $request->user() ? [
          'id' => $request->user()->id,
          'nama' => $request->user()->nama,
          'email' => $request->user()->email,
          'role' => $request->user()->Role?->nama,
          'permissions' => $request->user()->getPermissionCodes(),
      ] : null,
  ],
  ```

- [ ] **Step 4: Jalankan test untuk memverifikasi kelulusan**
  Run: `php vendor/bin/phpunit tests/Feature/Auth/InertiaSharedDataTest.php`
  Expected: PASS

- [ ] **Step 5: Format dan commit Task 6**
  ```bash
  vendor/bin/pint --format agent
  git add app/Http/Middleware/HandleInertiaRequests.php tests/Feature/Auth/InertiaSharedDataTest.php
  git commit -m "feat(rbac): share user permissions list to Inertia frontend props"
  ```

---

### Task 7: Verifikasi Menyeluruh & Regresi Suite Test

**Files:**
- Test: Seluruh unit dan feature test di `tests/`

- [ ] **Step 1: Jalankan seluruh suite pengujian PHPUnit**
  Run: `php vendor/bin/phpunit`
  Expected: Seluruh test (Unit dan Feature) lulus 100% tanpa kegagalan.

- [ ] **Step 2: Jalankan formatting agent Pint**
  Run: `vendor/bin/pint --format agent`
  Expected: Tidak ada file PHP yang melanggar aturan format.

- [ ] **Step 3: Jalankan bundling aset Vite untuk memastikan kelancaran build**
  Run: `npm run build`
  Expected: Build sukses tanpa error kompilasi.
