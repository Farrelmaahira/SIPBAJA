# Monorepo + RESTful API + TypeScript Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor SIPBAJA from a Laravel+Inertia monolith into a monorepo with a Laravel RESTful API backend and a standalone React+TypeScript frontend communicating via Axios, with zero component or business logic changes.

**Architecture:** Root becomes a monorepo with `backend/` (Laravel API, token-based auth via Sanctum), `frontend/` (React 19 + TypeScript + Vite + Axios, SPA routing via React Router), and `docs/` + `.agents/`. Each subdirectory is independently runnable. Frontend replaces all Inertia primitives (`usePage`, `useForm`, `Head`, `Link`, `router`) with equivalent Axios calls, hooks, and React Router primitives — component tree and UI logic stay unchanged.

**Tech Stack:** PHP 8.5 / Laravel 13 / Laravel Sanctum, React 19 / TypeScript / React Router v7 / Axios, Tailwind CSS v4 / Vite 8

**Spec:** `docs/DEVELOPMENT_RULES.md`, `docs/PRD.md`

## Global Constraints

- PHP 8.5, Laravel 13 — no version bumps.
- SQLite (dev) + PostgreSQL (prod) — no PostgreSQL-specific SQL.
- No new packages without user approval; Sanctum is already in Laravel ecosystem (no extra install needed beyond `php artisan sanctum:install`).
- No business logic changes: Service layer stays intact; only controller response format changes (Inertia → JSON).
- No component or template logic changes: only replace Inertia-specific imports/hooks in Pages and hooks files.
- All route names and API endpoint paths mirror the existing web route structure under `/api/v1/`.
- TypeScript strict mode; no `any` except where unavoidable at boundaries (Axios response types must be typed).
- Domain terms stay Indonesian; technical terms stay English.
- Hooks remain at `frontend/src/hooks/`, utils at `frontend/src/utils/`, pages at `frontend/src/pages/` (mirror of current `Pages/`), components mirror current `components/` structure.

## Review Focus

- **Session cookie vs token auth:** SPA on different origin than API needs CORS + Sanctum SPA cookie setup or token auth. Plan uses Sanctum SPA cookie (same-domain dev proxy); wrong CORS config silently drops auth.
- **File upload (multipart) with Axios:** `PermohonanCreateTemplate` uses `forceFormData`. Axios must send `multipart/form-data` with the `Content-Type` header set correctly (let Axios set it via `FormData`). Test added in Task 9.
- **Inertia partial reload (only:[]):** `gantiTahun` in `usePemohonDashboard` and `useBidang2Dashboard` use Inertia partial reload to fetch only `statistikBulanan`. Replacement must fetch that slice from the API without full page reload. Test added in Task 10.
- **`router.visit` navigation:** Pages using `router.visit(path)` must switch to React Router `navigate(path)`. Missing replacements cause silent no-ops. Test added in Task 11.
- **`usePage().props` pattern:** Several pages read `auth` and other props via `usePage()`. Replacement auth context must be available at same call sites. Test added in Task 6.

---

## Task 1: Monorepo Scaffold

**Files:**
- Create: `backend/` (move all current Laravel files here)
- Create: `frontend/` (new Vite+React+TS project)
- Create: `.agents/` (move current `.agents/` contents)
- Modify: root `README.md` (new monorepo instructions)
- Create: `backend/.env.example` (add `FRONTEND_URL`, `SANCTUM_STATEFUL_DOMAINS`)

**Interfaces:**
- Produces: `backend/` contains full working Laravel app; `frontend/` contains scaffolded Vite TS project with correct dir structure.

- [ ] **Step 1: Create `backend/` and move Laravel files**

  ```bash
  mkdir backend
  # Move all Laravel dirs/files except frontend-specific ones
  # Move: app/ bootstrap/ config/ database/ public/ resources/css/ routes/ storage/ tests/ artisan composer.json composer.lock .env.example
  # Do NOT move: resources/js/ (becomes frontend/src/)  node_modules/ package.json vite.config.js (those go to frontend/)
  ```

- [ ] **Step 2: Scaffold `frontend/` with Vite React+TS template**

  ```bash
  npm create vite@latest frontend -- --template react-ts
  ```

- [ ] **Step 3: Set up `frontend/` directory structure**

  Mirror current structure under `frontend/src/`:
  ```
  frontend/src/
    components/atoms/
    components/molecules/
    components/organisms/
    components/templates/
    hooks/
    pages/          # replaces resources/js/Pages/
    utils/
    services/       # new: Axios API client modules
    types/          # new: shared TypeScript type definitions
    app.tsx         # replaces resources/js/app.jsx
    main.tsx
  ```

- [ ] **Step 4: Move agents folder**

  ```bash
  mkdir .agents
  # Move existing .agents/* content (skills, etc.)
  ```

- [ ] **Step 5: Verify `backend/` runs**

  ```bash
  cd backend && php artisan config:show app.name
  ```
  Expected: app name prints without error.

- [ ] **Step 6: Commit**

  ```bash
  git add .
  git commit -m "chore: scaffold monorepo — backend/ frontend/ structure"
  ```

---

## Task 2: Backend — Install & Configure Sanctum SPA Auth

**Files:**
- Modify: `backend/config/cors.php`
- Modify: `backend/config/sanctum.php`
- Modify: `backend/.env.example`
- Modify: `backend/bootstrap/app.php` (register Sanctum middleware)

**Interfaces:**
- Produces: `GET /api/user` returns authenticated user JSON or 401; CORS allows `FRONTEND_URL` origin with credentials.

- [ ] **Step 1: Write feature test for auth flow**

  ```php
  // tests/Feature/SanctumAuthTest.php
  public function test_unauthenticated_api_returns_401(): void
  {
      $response = $this->getJson('/api/user');
      $response->assertStatus(401);
  }

  public function test_authenticated_api_returns_user(): void
  {
      $user = User::factory()->create();
      $response = $this->actingAs($user)->getJson('/api/user');
      $response->assertStatus(200)->assertJsonPath('id', $user->id);
  }
  ```

- [ ] **Step 2: Run test to verify it fails**

  ```bash
  cd backend && php artisan test --filter=SanctumAuthTest --compact
  ```
  Expected: FAIL — `/api/user` route does not exist yet.

- [ ] **Step 3: Publish Sanctum config and set up**

  ```bash
  cd backend && php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
  ```

- [ ] **Step 4: Add Sanctum stateful middleware to `backend/bootstrap/app.php`**

  Add `\Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class` to the `api` middleware group.

- [ ] **Step 5: Configure `backend/config/cors.php`**

  Set `allowed_origins` to `[env('FRONTEND_URL', 'http://localhost:5173')]`, `supports_credentials` to `true`, `allowed_methods` to `['*']`, `allowed_headers` to `['*']`.

- [ ] **Step 6: Add `GET /api/user` route to `backend/routes/api.php`**

  ```php
  Route::middleware('auth:sanctum')->get('/user', fn (Request $r) => $r->user());
  ```

- [ ] **Step 7: Run test to verify it passes**

  ```bash
  cd backend && php artisan test --filter=SanctumAuthTest --compact
  ```
  Expected: PASS.

- [ ] **Step 8: Commit**

  ```bash
  git add backend/
  git commit -m "feat(backend): configure Sanctum SPA auth and CORS"
  ```

---

## Task 3: Backend — Auth API Endpoints

**Files:**
- Modify: `backend/app/Http/Controllers/AuthController.php`
- Modify: `backend/routes/api.php`
- Create: `backend/tests/Feature/AuthApiTest.php`

**Interfaces:**
- Consumes: `AuthService::attemptLogin()` (unchanged), `LoginRequest` (unchanged).
- Produces:
  - `POST /api/v1/login` → `200 { user: {...}, role: string }` or `422`
  - `POST /api/v1/logout` → `204`

- [ ] **Step 1: Write failing tests**

  ```php
  public function test_login_returns_user_and_role(): void
  {
      $user = User::factory()->create();
      $response = $this->postJson('/api/v1/login', ['login' => $user->email, 'password' => 'password']);
      $response->assertStatus(200)->assertJsonStructure(['user', 'role']);
  }

  public function test_login_invalid_credentials_returns_422(): void
  {
      $response = $this->postJson('/api/v1/login', ['login' => 'x@x.com', 'password' => 'wrong']);
      $response->assertStatus(422);
  }

  public function test_logout_invalidates_session(): void
  {
      $user = User::factory()->create();
      $response = $this->actingAs($user)->postJson('/api/v1/logout');
      $response->assertStatus(204);
  }
  ```

- [ ] **Step 2: Run tests to verify they fail**

  ```bash
  cd backend && php artisan test --filter=AuthApiTest --compact
  ```

- [ ] **Step 3: Convert `AuthController` to return JSON**

  Replace `Inertia::render()` with `response()->json()`. `show()` removes Inertia render (frontend handles login page). `store()` returns `response()->json(['user' => $user, 'role' => $role])` after login. `destroy()` returns `response()->noContent()`.

- [ ] **Step 4: Register routes in `backend/routes/api.php`**

  ```php
  Route::prefix('v1')->group(function () {
      Route::middleware('guest')->group(function () {
          Route::post('login', [AuthController::class, 'store']);
      });
      Route::middleware('auth:sanctum')->group(function () {
          Route::post('logout', [AuthController::class, 'destroy']);
      });
  });
  ```

- [ ] **Step 5: Run tests to verify they pass**

  ```bash
  cd backend && php artisan test --filter=AuthApiTest --compact
  ```

- [ ] **Step 6: Commit**

  ```bash
  git commit -m "feat(backend): auth login/logout REST endpoints"
  ```

---

## Task 4: Backend — Convert All Dashboard Controllers to JSON

**Files:**
- Modify: all 8 Dashboard*Controller files (`DashboardAdminController`, `DashboardPemohonController`, `DashboardBidang2Controller`, `DashboardPpbjController`, `DashboardKeuanganController`, `DashboardPerlengkapanController`, `DashboardPpController`, `DashboardPpkController`)
- Modify: `backend/routes/api.php`
- Create: `backend/tests/Feature/DashboardApiTest.php`

**Interfaces:**
- Consumes: existing Service classes (unchanged).
- Produces: each `GET /api/v1/{role}/dashboard` returns `200 { data: {...} }` with same keys as previous Inertia props.

- [ ] **Step 1: Write failing tests (sample 2 controllers)**

  ```php
  public function test_pemohon_dashboard_returns_ringkasan(): void
  {
      $user = User::factory()->pemohon()->create();
      $res = $this->actingAs($user)->getJson('/api/v1/pemohon/dashboard');
      $res->assertStatus(200)->assertJsonStructure(['ringkasan', 'permohonanAktif', 'statistikBulanan', 'tahunAktif']);
  }

  public function test_admin_dashboard_requires_auth(): void
  {
      $res = $this->getJson('/api/v1/admin/dashboard');
      $res->assertStatus(401);
  }
  ```

- [ ] **Step 2: Run tests to verify they fail**

  ```bash
  cd backend && php artisan test --filter=DashboardApiTest --compact
  ```

- [ ] **Step 3: Convert each Dashboard controller**

  Replace `Inertia::render('Role/Page', [...props])` with `response()->json([...same props])`. Remove all `use Inertia\Inertia` imports. Return type changes from `Response` to `JsonResponse`.

- [ ] **Step 4: Register role-prefixed dashboard routes in `backend/routes/api.php`**

  Mirror existing `routes/web.php` role groups under `/api/v1/` with `auth:sanctum` and `role:{Role}` middleware. Example:
  ```php
  Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
      Route::prefix('admin')->middleware('role:Admin')->group(function () {
          Route::get('dashboard', DashboardAdminController::class);
      });
      Route::prefix('pemohon')->middleware('role:Pemohon')->group(function () {
          Route::get('dashboard', DashboardPemohonController::class);
      });
      // ... repeat for all roles
  });
  ```

- [ ] **Step 5: Run tests to verify they pass**

  ```bash
  cd backend && php artisan test --filter=DashboardApiTest --compact
  ```

- [ ] **Step 6: Run pint**

  ```bash
  cd backend && vendor/bin/pint --dirty --format agent
  ```

- [ ] **Step 7: Commit**

  ```bash
  git commit -m "feat(backend): convert dashboard controllers to JSON API"
  ```

---

## Task 5: Backend — Convert All CRUD & Action Controllers to JSON

**Files:**
- Modify: `Admin/PenggunaController`, `Admin/MakController`, `Admin/RoleController`, `Admin/RolePermissionController`, `Admin/UnitKerjaController`
- Modify: `PermohonanPemohonController`, `PerencanaanController`, `PengajuanBidang2Controller`, `RkaklBidang2Controller`
- Modify: `PPBJ/PermohonanController`, `PpController`, `PpkController`
- Modify: `backend/routes/api.php`
- Create: `backend/tests/Feature/PermohonanApiTest.php`, `backend/tests/Feature/AdminCrudApiTest.php`

**Interfaces:**
- Consumes: all existing Service and Request classes (unchanged).
- Produces:
  - `GET /api/v1/{role}/{resource}` → `200 { data: [...] }`
  - `POST /api/v1/{role}/{resource}` → `201 { data: {...} }` or `422 { errors: {...} }`
  - `PUT/PATCH /api/v1/{role}/{resource}/{id}` → `200 { data: {...} }`
  - `DELETE /api/v1/{role}/{resource}/{id}` → `204`
  - Action routes (approve/reject/kirim): → `200 { message: string }` or `422`

- [ ] **Step 1: Write failing tests (sample)**

  ```php
  // PermohonanApiTest
  public function test_pemohon_can_store_permohonan(): void
  {
      $user = User::factory()->pemohon()->create();
      $res = $this->actingAs($user)->postJson('/api/v1/pemohon/permohonan', [...valid data]);
      $res->assertStatus(201)->assertJsonStructure(['data' => ['id', 'judul']]);
  }

  public function test_perencanaan_can_approve_permohonan(): void
  {
      $user = User::factory()->perencanaan()->create();
      $permohonan = Permohonan::factory()->diajukan()->create();
      $res = $this->actingAs($user)->postJson("/api/v1/perencanaan/pengajuan/{$permohonan->id}/approve", ['mak_ids' => [1]]);
      $res->assertStatus(200)->assertJsonPath('message', 'Permohonan disetujui.');
  }
  ```

- [ ] **Step 2: Run tests to verify they fail**

  ```bash
  cd backend && php artisan test --filter="PermohonanApiTest|AdminCrudApiTest" --compact
  ```

- [ ] **Step 3: Convert all controllers**

  Pattern for each controller method:
  - `index()`: return `response()->json(['data' => $service->list(...)])`
  - `store()`: return `response()->json(['data' => $service->create(...)], 201)`
  - `update()`: return `response()->json(['data' => $service->update(...)])`
  - `destroy()`: return `response()->noContent()`
  - `approve()/reject()/etc.`: return `response()->json(['message' => '...'])`
  - Remove all `Inertia::render()`, `redirect()`, `back()` in favor of JSON.
  - File download endpoints (`downloadDokumen`) keep returning `response()->download()`.

- [ ] **Step 4: Add all resource + action routes to `backend/routes/api.php`**

  Mirror `routes/web.php` structure under `/api/v1/` for every role group and resource.

- [ ] **Step 5: Run tests to verify they pass**

  ```bash
  cd backend && php artisan test --compact
  ```

- [ ] **Step 6: Run pint**

  ```bash
  cd backend && vendor/bin/pint --dirty --format agent
  ```

- [ ] **Step 7: Remove `routes/web.php` non-static routes**

  `routes/web.php` keeps only the SPA catch-all route that returns the frontend `index.html` (or is removed entirely if frontend is served separately). Remove Inertia-specific controller imports.

- [ ] **Step 8: Remove Inertia package from backend**

  ```bash
  cd backend && composer remove inertiajs/inertia-laravel
  ```

- [ ] **Step 9: Commit**

  ```bash
  git commit -m "feat(backend): convert all resource/action controllers to JSON API; remove Inertia"
  ```

---

## Task 6: Frontend — Axios Client & Auth Context

**Files:**
- Create: `frontend/src/services/api.ts` — Axios instance
- Create: `frontend/src/services/authService.ts`
- Create: `frontend/src/contexts/AuthContext.tsx`
- Create: `frontend/src/types/auth.ts`
- Create: `frontend/src/hooks/useAuth.ts`

**Interfaces:**
- Produces:
  - `api` — Axios instance with `baseURL = import.meta.env.VITE_API_URL`, `withCredentials: true`, request interceptor for CSRF token header.
  - `authService.login(login: string, password: string): Promise<{ user: User; role: string }>` — calls `POST /api/v1/login`
  - `authService.logout(): Promise<void>` — calls `POST /api/v1/logout`
  - `AuthContext` — provides `{ user: User | null, role: string | null, isLoading: boolean, login, logout }`
  - `useAuth(): AuthContextValue` — hook that reads `AuthContext`

- [ ] **Step 1: Create `frontend/src/types/auth.ts`**

  ```typescript
  export interface User {
    id: number;
    nama: string;
    email: string;
    role?: { nama: string };
  }
  export interface AuthContextValue {
    user: User | null;
    role: string | null;
    isLoading: boolean;
    login: (login: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
  }
  ```

- [ ] **Step 2: Create `frontend/src/services/api.ts`**

  Axios instance with `baseURL`, `withCredentials: true`. Add a request interceptor that reads XSRF-TOKEN cookie and sets `X-XSRF-TOKEN` header (Sanctum SPA requirement).

- [ ] **Step 3: Create `frontend/src/services/authService.ts`**

  Signature: `login(login, password)` calls `api.post('/v1/login', ...)`, `logout()` calls `api.post('/v1/logout')`. `getUser()` calls `api.get('/user')`.

- [ ] **Step 4: Create `frontend/src/contexts/AuthContext.tsx`**

  On mount, call `authService.getUser()` to restore session. Provide `login` and `logout` methods that update state.

- [ ] **Step 5: Create `frontend/src/hooks/useAuth.ts`**

  ```typescript
  export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
  }
  ```

- [ ] **Step 6: Verify by running `tsc --noEmit` in `frontend/`**

  ```bash
  cd frontend && npx tsc --noEmit
  ```
  Expected: no errors.

- [ ] **Step 7: Commit**

  ```bash
  git commit -m "feat(frontend): Axios client, AuthService, AuthContext, useAuth"
  ```

---

## Task 7: Frontend — React Router Setup & App Entry

**Files:**
- Modify: `frontend/src/main.tsx`
- Create: `frontend/src/app.tsx`
- Create: `frontend/src/router/index.tsx` — all app routes
- Create: `frontend/src/router/ProtectedRoute.tsx`
- Create: `frontend/src/router/RoleRoute.tsx`

**Interfaces:**
- Consumes: `AuthContext` (Task 6).
- Produces: React Router v7 `<BrowserRouter>` with routes mirroring web.php structure. `ProtectedRoute` redirects unauthenticated users to `/`. `RoleRoute` redirects wrong-role users to their dashboard.

- [ ] **Step 1: Install React Router**

  ```bash
  cd frontend && npm install react-router-dom@^7
  ```

- [ ] **Step 2: Create `frontend/src/router/ProtectedRoute.tsx`**

  Reads `useAuth()`. If `isLoading`, renders skeleton. If not `user`, redirects to `/`. Otherwise renders `<Outlet />`.

- [ ] **Step 3: Create `frontend/src/router/RoleRoute.tsx`**

  Props: `allowedRoles: string[]`. Reads `useAuth()`. If `role` not in `allowedRoles`, redirects to `/{role}/dashboard`. Otherwise renders `<Outlet />`.

- [ ] **Step 4: Create `frontend/src/router/index.tsx`**

  Define all routes mirroring `web.php` using React Router's object-based routes. Example:
  ```typescript
  { path: '/', element: <Login /> },
  { element: <ProtectedRoute />, children: [
    { element: <RoleRoute allowedRoles={['Admin']} />, children: [
      { path: '/admin/dashboard', element: <AdminDashboard /> },
      { path: '/admin/pengguna', element: <PenggunaIndex /> },
      // ... etc
    ]},
    // ... other roles
  ]},
  ```

- [ ] **Step 5: Update `frontend/src/main.tsx`**

  Wrap app in `<AuthProvider>` and `<BrowserRouter>` (or `<RouterProvider>` for data router).

- [ ] **Step 6: Run `tsc --noEmit`**

  ```bash
  cd frontend && npx tsc --noEmit
  ```
  Expected: no errors.

- [ ] **Step 7: Commit**

  ```bash
  git commit -m "feat(frontend): React Router setup, ProtectedRoute, RoleRoute"
  ```

---

## Task 8: Frontend — Copy & Convert All Components and Utils

**Files:**
- Copy: all files from `resources/js/components/` → `frontend/src/components/` (rename `.jsx` to `.tsx`)
- Copy: all files from `resources/js/utils/` → `frontend/src/utils/` (rename `.js` to `.ts`)
- No logic changes — only add TypeScript type annotations to props and function signatures.

**Interfaces:**
- Produces: all `.tsx` components pass `tsc --noEmit` with minimal prop type declarations. Each component file adds an `interface Props` or `type Props` for its props.

- [ ] **Step 1: Copy component files and rename extensions**

  ```bash
  # Copy atoms, molecules, organisms, templates preserving structure
  cp -r resources/js/components/. frontend/src/components/
  # Rename all .jsx to .tsx
  find frontend/src/components -name "*.jsx" -exec bash -c 'mv "$0" "${0%.jsx}.tsx"' {} \;
  ```

- [ ] **Step 2: Copy utils and rename**

  ```bash
  cp resources/js/utils/*.js frontend/src/utils/
  # Rename .js to .ts
  ```

- [ ] **Step 3: Add TypeScript prop types to each component**

  For each `.tsx` component file: add `interface Props { ... }` before the component function. Use `React.FC<Props>` or typed function signature. Do not change any logic or JSX.

- [ ] **Step 4: Fix all TypeScript errors (`tsc --noEmit`)**

  ```bash
  cd frontend && npx tsc --noEmit 2>&1 | head -50
  ```
  Fix errors iteratively: mostly missing prop types and implicit `any`. Do not change component logic.

- [ ] **Step 5: Commit**

  ```bash
  git commit -m "feat(frontend): migrate components and utils to TypeScript"
  ```

---

## Task 9: Frontend — Convert Pages to TypeScript + Replace Inertia Primitives

**Files:**
- Copy: all files from `resources/js/Pages/` → `frontend/src/pages/` (rename `.jsx` to `.tsx`)
- Modify: every page file to replace Inertia imports with React Router + useAuth + Axios equivalents.

**Interfaces:**
- Consumes: `useAuth` (Task 6), React Router `useNavigate`, `Link`, `useParams`, `useSearchParams`.
- Produces: each page fetches its data from the API on mount (via `useEffect` + Axios), passes props to the same template it used before.

**Replacement map (apply to every page):**

| Remove (Inertia) | Replace with |
|---|---|
| `import { Head } from '@inertiajs/react'` | `import { Helmet } from 'react-helmet-async'` (or `document.title = ...`) |
| `import { usePage } from '@inertiajs/react'` | `const { user } = useAuth()` |
| `import { useForm } from '@inertiajs/react'` | local `useState` + `authService.login()` or Axios call |
| `import { router } from '@inertiajs/react'` | `import { useNavigate } from 'react-router-dom'` |
| `import { Link } from '@inertiajs/react'` | `import { Link } from 'react-router-dom'` |
| `usePage().props` | `useAuth()` for `auth.user`; API fetch for all other props |
| `router.visit(path)` | `navigate(path)` |
| `router.post(path, data, opts)` | `api.post(path, data).then(...)` |
| `router.get(path, params, opts)` | `api.get(path, { params }).then(...)` |
| `<Head title="..." />` | `document.title = "..."` in `useEffect` or `react-helmet-async` |

- [ ] **Step 1: Install `react-helmet-async`**

  ```bash
  cd frontend && npm install react-helmet-async
  ```

- [ ] **Step 2: Copy and rename all Pages to `frontend/src/pages/`**

  ```bash
  cp -r resources/js/Pages/. frontend/src/pages/
  find frontend/src/pages -name "*.jsx" -exec bash -c 'mv "$0" "${0%.jsx}.tsx"' {} \;
  ```

- [ ] **Step 3: Convert `frontend/src/pages/Auth/Login.tsx`**

  Replace `useForm` from Inertia with local `useState`. On submit call `authService.login(login, password)` then `navigate('/{role}/dashboard')`. Remove `<Head>`. Add `document.title = 'Masuk ke SIPBAJA'` in `useEffect`.

- [ ] **Step 4: Convert each remaining page — apply replacement map above**

  For pages that read props from Inertia (`usePage().props` or function params from Inertia), fetch data via `useEffect` + Axios on mount. Pass the same props shape to templates. Add `isLoading` state initialized to `true`, set to `false` after fetch.

  For file upload (PermohonanCreate): use `new FormData()` and `api.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } })`.

- [ ] **Step 5: Run `tsc --noEmit`**

  ```bash
  cd frontend && npx tsc --noEmit
  ```
  Expected: no errors.

- [ ] **Step 6: Commit**

  ```bash
  git commit -m "feat(frontend): convert all pages to TypeScript, replace Inertia with Axios+Router"
  ```

---

## Task 10: Frontend — Convert Hooks to TypeScript (Replace Inertia Router)

**Files:**
- Copy: `resources/js/hooks/` → `frontend/src/hooks/` (rename `.js` to `.ts`)
- Modify: `usePemohonDashboard.ts`, `useBidang2Dashboard.ts` — replace `router.get(...)` with Axios calls.
- Other hooks (`usePpbjDashboard`, `useSearchFilter`, `useUserSearch`): add types only, no logic change.

**Interfaces:**
- Produces:
  - `usePemohonDashboard`: `gantiTahun(tahun: number): void` — calls `api.get('/api/v1/pemohon/dashboard', { params: { tahun } })` and updates local state `statistikBulanan` and `tahunAktif`.
  - `useBidang2Dashboard`: same pattern for `/api/v1/bidang-2/dashboard`.
  - All hooks export typed return objects.

- [ ] **Step 1: Copy hooks and rename**

  ```bash
  cp resources/js/hooks/*.js frontend/src/hooks/
  # rename to .ts
  ```

- [ ] **Step 2: Convert `frontend/src/hooks/usePemohonDashboard.ts`**

  Remove `import { router } from '@inertiajs/react'`. Import `api` from `../services/api`. Change `gantiTahun` to call `api.get(...)`, receive response, and call `setStatistikBulanan(response.data.statistikBulanan)` and `setTahunAktif(tahun)`. Add `useState` for `statistikBulanan` and `tahunAktif`, initialized from props.

- [ ] **Step 3: Convert `frontend/src/hooks/useBidang2Dashboard.ts`**

  Same pattern as Step 2 for `/api/v1/bidang-2/dashboard`.

- [ ] **Step 4: Add TypeScript types to `useSearchFilter.ts` and `useUserSearch.ts`**

  Add generic type parameters and return type annotations. No logic changes.

- [ ] **Step 5: Run `tsc --noEmit`**

  ```bash
  cd frontend && npx tsc --noEmit
  ```

- [ ] **Step 6: Commit**

  ```bash
  git commit -m "feat(frontend): convert hooks to TypeScript, replace Inertia router with Axios"
  ```

---

## Task 11: Frontend — Vite Config, Environment, Dev Proxy

**Files:**
- Modify: `frontend/vite.config.ts`
- Create: `frontend/.env.example`
- Create: `frontend/tsconfig.json`

**Interfaces:**
- Produces: `npm run dev` in `frontend/` proxies `/api` to `http://localhost:8000/api` so CORS and cookies work in local dev. `VITE_API_URL` points to backend.

- [ ] **Step 1: Create `frontend/.env.example`**

  ```
  VITE_API_URL=http://localhost:8000
  VITE_APP_NAME=SIPBAJA
  ```

- [ ] **Step 2: Configure `frontend/vite.config.ts`**

  Add `server.proxy` for `/api`:
  ```typescript
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        credentials: true,
      },
      '/sanctum': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
  ```
  Keep Tailwind CSS v4 and React plugins. Remove `laravel-vite-plugin`.

- [ ] **Step 3: Configure `frontend/tsconfig.json`**

  Set `strict: true`, `jsx: "react-jsx"`, `target: "ES2022"`, `moduleResolution: "bundler"`, `paths: { "@/*": ["./src/*"] }`.

- [ ] **Step 4: Verify dev server starts**

  ```bash
  cd frontend && npm run dev
  ```
  Expected: server starts at `http://localhost:5173` without errors.

- [ ] **Step 5: Verify backend serves API**

  ```bash
  cd backend && php artisan serve
  curl http://localhost:8000/api/v1/login -X POST -H "Content-Type: application/json" -d '{"login":"x","password":"x"}'
  ```
  Expected: `422` response with validation errors JSON.

- [ ] **Step 6: Commit**

  ```bash
  git commit -m "feat(frontend): Vite config with dev proxy, TypeScript config, env"
  ```

---

## Task 12: Update `docs/DEVELOPMENT_RULES.md`

**Files:**
- Modify: `docs/DEVELOPMENT_RULES.md`

**Interfaces:**
- Produces: updated rules document reflecting monorepo structure, TypeScript, RESTful API, Axios, React Router. No business rules change.

- [ ] **Step 1: Update Section 2 (Tech Stack)**

  Replace the Frontend row. Old: `React + Inertia.js + Tailwind CSS`. New:
  ```
  | Layer       | Technology                                               |
  |-------------|----------------------------------------------------------|
  | Framework   | Laravel 13                                               |
  | Language    | PHP 8.5.11                                               |
  | Frontend    | React 19 + TypeScript + React Router v7 + Tailwind CSS v4|
  | HTTP Client | Axios (SPA session via Sanctum cookie auth)              |
  | DB (dev)    | SQLite                                                   |
  | DB (prod)   | PostgreSQL 18                                            |
  ```

- [ ] **Step 2: Update Section 4 (Architecture) request flow**

  Old: `React Page (Inertia) -> Controller -> Service -> Model`
  New:
  ```
  React Page (Axios) -> Laravel API Controller -> Service -> Model
  ```
  Update controller rule: Controllers return `JsonResponse` (not Inertia response/redirect). Remove mention of Inertia response.

- [ ] **Step 3: Update Section 7 (Forbidden)**

  Add: `Do NOT use Inertia primitives (usePage, useForm, router, Head, Link from @inertiajs/react).`
  Add: `Do NOT use fetch() in pages or hooks — use the shared Axios instance from frontend/src/services/api.ts.`

- [ ] **Step 4: Update Section 10 (Frontend: Atomic Design)**

  - Replace `resources/js/components/` with `frontend/src/components/`.
  - Replace `resources/js/Pages/` with `frontend/src/pages/`.
  - Replace "No fetch" with "No direct Axios calls in templates or atoms — Axios calls belong in pages or service modules."
  - Add: "Navigation uses React Router `useNavigate` and `<Link>` from `react-router-dom`."

- [ ] **Step 5: Update Section 11 (Logic/Presentation)**

  Replace hook path `resources/js/hooks/use<Name>.js` with `frontend/src/hooks/use<Name>.ts`.
  Replace util path `resources/js/utils/<name>.js` with `frontend/src/utils/<name>.ts`.
  Add: "API service modules live in `frontend/src/services/<name>.ts` as typed Axios wrappers."

- [ ] **Step 6: Add Section 12: Monorepo Structure**

  ```markdown
  ## 12. Monorepo Structure

  Root layout:
  - `backend/`  — Laravel 13 API (PHP). Run with `php artisan serve`.
  - `frontend/` — React 19 + TypeScript SPA. Run with `npm run dev`.
  - `docs/`     — Design, database, and process documentation.
  - `.agents/`  — AI agent skills and configuration.

  Commands run from subdirectory, not root. Example: `cd backend && php artisan migrate`.
  Commits follow existing convention. CI must run `cd backend && php artisan test` and `cd frontend && npx tsc --noEmit`.
  ```

- [ ] **Step 7: Commit**

  ```bash
  git commit -m "docs: update DEVELOPMENT_RULES for monorepo, TypeScript, RESTful API"
  ```

---

## Task 13: Final Verification

**Files:** none new.

- [ ] **Step 1: Run full backend test suite**

  ```bash
  cd backend && php artisan test --compact
  ```
  Expected: all tests pass.

- [ ] **Step 2: Run TypeScript check on frontend**

  ```bash
  cd frontend && npx tsc --noEmit
  ```
  Expected: 0 errors.

- [ ] **Step 3: Build frontend**

  ```bash
  cd frontend && npm run build
  ```
  Expected: build succeeds.

- [ ] **Step 4: Manual smoke test — login flow**

  Start both servers. Visit `http://localhost:5173`. Login with a valid user. Confirm redirect to `/{role}/dashboard`. Confirm dashboard data loads from API.

- [ ] **Step 5: Manual smoke test — file upload**

  As Pemohon, submit a new Permohonan with a PDF. Confirm `201` response and redirect to permohonan index.

- [ ] **Step 6: Final commit**

  ```bash
  git commit -m "chore: final verification — monorepo RESTful API TypeScript refactor complete"
  ```

