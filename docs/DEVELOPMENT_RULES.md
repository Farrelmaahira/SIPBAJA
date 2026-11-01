# DEVELOPMENT_RULES.md — SIPBAJA

Read this file fully before every task. Follow it literally.
If a rule is unclear or a business rule is missing: STOP and ask the user. Never guess.

---

## 1. Project Context

SIPBAJA (Sistem Informasi Pengadaan Barang dan Jasa) is a campus procurement information system.

Roles: Pengguna, Perencanaan, Wadir 2 (Bidang 2), PPBJ, PPK, PP, Perlengkapan, Keuangan, Admin.

Success criteria:
- Pemohon can track the status of their permohonan.
- All procurement data is stored centrally.
- No payment is processed before approval by PPK and Bidang 2.
- No payment is late.

---

## 2. Tech Stack (fixed, do not change)

| Layer | Technology |
|---|---|
| Framework | Laravel 13 |
| Language | PHP 8.5.11 |
| Frontend | React 19 + TypeScript + React Router v7 + Tailwind CSS v4 |
| HTTP Client | Axios (SPA session via Sanctum cookie auth) |
| DB (development) | SQLite |
| DB (production target) | PostgreSQL 18 |

Rules:
- Do NOT add any package or library without user approval.
- Do NOT use PostgreSQL-specific features (JSONB operators, arrays, DB triggers, etc.). Migrations and queries must run on both SQLite and PostgreSQL.

---

## 3. Database

- The database design is defined in the database design `.md` file in this workspace (`docs/DATABASE_SIPBAJA.md`).
- That file is the single source of truth. Follow it exactly.
- Do NOT change tables, columns, or relations on your own. If the design looks wrong or incomplete: STOP and ask.
- Every schema change = a NEW migration. Never edit an old migration.

---

## 4. Architecture: Service Layer & API Controllers (mandatory)

Business logic lives ONLY in Service classes. No exceptions, including authentication.

Request flow:

```
React Page (Axios)  ->  API Controller (Role-based Folder)  ->  Service  ->  Model
```

What belongs where:
- Controllers handle only: input, validation call, calling a Service, returning `JsonResponse` or HTTP response (e.g. 200, 201, 204), never Inertia renders or redirects.
- ALL business logic and ALL write queries live in Service classes.
- Controllers must NOT contain business logic or direct Eloquent queries. A controller method that decides, calculates, or queries beyond reading for display is a violation.
- This pattern applies to EVERY feature, without exception.

### 4.1 Controller Organization by Role (Mandatory Foldering)
Every new or existing controller MUST be placed in its role/domain subdirectory inside `backend/app/Http/Controllers/`. Never place role controllers directly in the root controller directory:
- `backend/app/Http/Controllers/Admin/`: Modul Admin (Pengguna, Unit Kerja, MAK, Role, Role-Permission, Dashboard).
- `backend/app/Http/Controllers/Auth/`: Autentikasi dan sesi (Login, Logout).
- `backend/app/Http/Controllers/Bidang2/`: Pengawasan Wakil Direktur II (Dashboard, Pengajuan, RKAKL).
- `backend/app/Http/Controllers/Keuangan/`: Pencairan dan verifikasi realisasi belanja (Dashboard).
- `backend/app/Http/Controllers/Pemohon/`: Pengajuan dan tracking unit jurusan/bagian (Dashboard, Permohonan).
- `backend/app/Http/Controllers/Perencanaan/`: Verifikasi permohonan, penetapan MAK, RKAKL (Dashboard, Pengajuan, Jenis MAK, RKAKL, Notifikasi).
- `backend/app/Http/Controllers/Perlengkapan/`: Inventaris dan sarana prasarana (Dashboard).
- `backend/app/Http/Controllers/Pp/`: Pejabat Pengadaan (Dashboard, Review Pengadaan, Approval, Notifikasi).
- `backend/app/Http/Controllers/PPBJ/`: Pengelola Pengadaan Barang dan Jasa (Dashboard, Permohonan, Draft Paket, Submit Reviewer).
- `backend/app/Http/Controllers/Ppk/`: Pejabat Pembuat Komitmen (Dashboard, Review Pengadaan, Approval Pembayaran, Notifikasi).
- `backend/app/Http/Controllers/Controller.php`: Hanya base controller yang berada di root.

Controllers must use the appropriate namespace (e.g., `namespace App\Http\Controllers\Admin;`) and import `use App\Http\Controllers\Controller;`.

### 4.2 API Contract Compliance
Every API endpoint created or modified MUST strictly comply with the API Contract in `docs/API_CONTRACT.md`:
- **Routing & Prefix:** All endpoints must be registered under the `/api/v1/` prefix in `backend/routes/api.php` and protected by `auth:sanctum` (plus role middleware where applicable).
- **Authentication Support:** Must support both Sanctum Bearer token (`Authorization: Bearer <token>`) and stateful session cookies with CSRF protection.
- **Success Response Standards:**
  - Single resource / mutation: JSON containing `message` and/or `data` / entity object (HTTP 200 or 201).
  - Deletions: HTTP 204 No Content or `{ "message": "..." }`.
  - Collections: Must adhere to the paginated or list schema defined in `docs/API_CONTRACT.md`.
- **Error Response Standards:**
  - 422: Form validation errors with Indonesian error messages (`{ "message": "...", "errors": { "field": ["pesan error"] } }`).
  - 422: Business constraint / relation integrity errors (`{ "message": "Deskripsi kesalahan aturan bisnis" }`).
  - 401: Unauthenticated access (`{ "message": "Unauthenticated." }`).
  - 403: Role or permission forbidden (`{ "message": "Akses ditolak untuk peran Anda." }`).
  - 404: Model or resource not found (`{ "message": "No query results for model [...]" }`).
  - 429: Rate-limited request (`{ "message": "Terlalu banyak percobaan..." }`).
- **Synchronous Updates:** If an endpoint contract is added or modified, update:
  1. `docs/API_CONTRACT.md`
  2. `docs/SIPBAJA_API.postman_collection.json`
  3. Frontend TypeScript types in `frontend/src/types/api.ts`

### 4.3 General Architecture Rules
- Controllers handle only: input, validation call, calling a Service, returning `JsonResponse` or HTTP response (e.g. 200, 201, 204), never Inertia renders or redirects.
- ALL business logic and ALL write queries live in Service classes.
- Controllers must NOT contain business logic or direct Eloquent queries.
- One Service per domain, located in `backend/app/Services/`.
  Examples: `AuthService`, `PermohonanService`, `PengadaanService`, `KontrakService`, `PembayaranService`, `RencanaPembayaranService`.
- A Service method that writes to more than one table MUST use a DB transaction.
- Services must not depend on Request or session objects. Pass plain data (arrays, DTOs, models) as parameters.
- Validation: Form Request. Authorization: Policy/Gate per role.
- Every inbound data MUST use a dedicated Form Request class in `backend/app/Http/Requests/` so input is structured. Name PascalCase with `Request` suffix (example `SimpanPermohonanRequest`). Controllers only call the Request validation, then pass `validated()` to the Service. Services must NEVER read raw input. `authorize()` enforces the Policy/Gate per role. `rules()` and `messages()` use Bahasa Indonesia.
- Notifications triggered by `status_history` changes: use Laravel Observer / model events. NEVER use DB triggers.

---

## 5. Business Rules

### 5.1 Procurement level (by nominal)
- Below 50 million: Pengadaan Langsung.
- 50–200 million: handled by PP.
- Above 200 million: handled by PPK.
- PPK signs the review at ALL levels.
- PP reviews ONLY the 50–200 million level.

### 5.2 Approvals and documents
- Rejection MUST include a reason.
- Approval permohonan (Bidang 2) and approval pembayaran (PPK and Bidang 2) MUST include an uploaded memo persetujuan document.
- A payment must NEVER be processed before approval by both PPK and Bidang 2.
- Priority is a number: 1 = main, 2 = second, 3 = last.

### 5.3 PPK accounts
- There are 4 PPK accounts, one per MAK type: BLU Fisik, BLU Non-Fisik, RM Fisik, RM Non-Fisik.

### 5.4 MAK
- Perencanaan determines the MAK(s) of a permohonan. One permohonan can have many MAK. Perencanaan does NOT enter a nominal per MAK.
- PPBJ splits a permohonan into pengadaan and assigns each pengadaan to exactly ONE MAK, chosen from the MAK already set by Perencanaan.
- One MAK can fund many pengadaan from the same permohonan.
- A pengadaan's MAK can only be changed while PPBJ is creating the pengadaan document. No MAK change later in the process.

### 5.5 Payment
- Termin schedule is fixed when the contract is issued.
- Realized payment nominal MUST equal the planned nominal exactly. No partial or different amounts.
- Payment reminders are per termin, not per contract.

### 5.6 Progress tracking
- Progress tracking for pemohon is scoped per unit (`unit_id`), not per individual user.

---

## 6. Naming Conventions

- PHP class files and class names: PascalCase (`PermohonanService.php`, `AuthService`)
- Methods and PHP variables: camelCase (`hitungTotal()`, `$nominalPengadaan`)
- TypeScript / React component files: PascalCase (`Button.tsx`, `AdminDashboardTemplate.tsx`)
- TypeScript custom hooks: camelCase prefixed with `use` (`useUserSearch.ts`)
- TypeScript utils / services: camelCase (`api.ts`, `formatRupiah.ts`)

Exceptions (do NOT use PascalCase or camelCase here):
- Database table and column names: snake_case (follow the database design file)
- Route URIs: kebab-case
- Config keys and `.env` keys

Domain terms stay in Indonesian (`Permohonan`, `Pengadaan`, `Kontrak`, `Pembayaran`). Technical words stay in English (`Service`, `Observer`, `Policy`).

---

## 7. Forbidden

- Do NOT change anything in Section 2 (stack) or Section 3 (database) without user approval.
- Do NOT add packages.
- Do NOT invent business rules.
- Do NOT put business logic in controllers, React components, Blade views, or Models.
- Do NOT place role controllers directly in the root of `backend/app/Http/Controllers/`; always place them into their designated role subdirectory (e.g. `Admin/`, `Pemohon/`, `Perencanaan/`).
- Do NOT create, return, or alter API endpoints that violate the specifications in `docs/API_CONTRACT.md`.
- Do NOT use DB triggers.
- Do NOT edit old migrations.
- Do NOT refactor or "clean up" code outside the scope of the current task.
- Do NOT delete files or data unless the task says so.
- Do NOT use `@inertiajs/react` or Inertia primitives (`usePage`, `useForm`, `router`, `Head`, `Link`).
- Do NOT use direct `fetch()` in pages or components; use the shared Axios instance from `frontend/src/services/api.ts`.
- Do NOT call Axios or import service modules inside atoms, molecules, organisms, or templates (Section 10).
- Do NOT add a data-fetching/caching library (TanStack Query, SWR, etc.) without user approval.

---

## 8. Workflow

1. Read this file and the database design file.
2. Do ONE small task at a time. Stay inside its scope.
3. Run tests and the code formatter after finishing.
4. Report: files changed, what was done, and every assumption made.
5. If blocked or unsure: stop and ask. Do not guess.

---

## 9. Not Decided Yet (ask the user, do not decide yourself)

- Design system / external UI component library
- Testing strategy beyond feature tests and TypeScript build checks
- Commit message format

---

## 10. Frontend: Atomic Design (React + TypeScript)

- One-way hierarchy: atoms → molecules → organisms → templates → pages.
- Locations: `frontend/src/components/atoms/`, `molecules/`, `organisms/`, `templates/`; pages in `frontend/src/pages/`.
- Navigation: Use React Router v7 navigation (`useNavigate`, `Link` from `react-router-dom`).
- Pages are glue only: call hooks, utils, and services (Section 11), pass the results to a single template via props. No direct fetch or Axios calls inside templates. State used by more than one part of the same page MUST live in the page.
- Exception: data shared across many pages (notifications, current user profile) lives in a Context Provider mounted at the route layout level (Section 11.6), not in a page or template.
- Atoms, molecules, organisms, and templates are presentational only. Explicit props. No fetch, no Axios, no service imports. Local UI state only (dropdown open/close, active tab).
- Molecules combine atoms. Organisms combine molecules. Templates handle layout. Pages choose the template + copy.
- A layer may be skipped when there is nothing to group; the direction stays one-way.
- Check existing components before creating new ones.
- Styling: plain Tailwind utilities only.
- No business logic in React components. Normalization, formatting, and mapping move to hooks/utils/services (Section 11); templates only render props.
- Error pages: error views in `frontend/src/pages/error/` render the shared `ErrorTemplate` with `{status, title, message}`.

---

## 11. Separating Logic from Presentation

- Templates/UI components are purely presentational: `useState` is forbidden for business data, filters, sorting, calculations, normalization, or fetching; only purely local UI state is allowed (dropdown open/close, active tab); receive all data and handlers via props.
  - Wrong: `AdminDashboardTemplate` stores `searchQuery` and computes `filteredUsers` inside the template.
  - Right: the template receives `searchQuery`, `onSearchChange`, and the already-filtered `users` via props.
- Stateful logic (search, filter, sort, pagination) MUST live in a custom hook at `frontend/src/hooks/use<Name>.ts`, use `useMemo` for derived results, and return an object `{ state, setter, derivedResult }`.
  - Wrong: filtering `recentUsers` inline in the template body.
  - Right: `const { query, setQuery, filteredUsers } = useUserSearch(recentUsers)` is called in the page, and the result is passed to the template.
- Pure logic (normalization, formatting, mapping) MUST live in a util at `frontend/src/utils/<name>.ts` as pure functions without side effects so they are easy to test.
  - Wrong: `stats.totalPengguna ?? stats.total_pengguna ?? 128` scattered across templates.
  - Right: `normalizeAdminStats(stats)` in a util; the template only renders `stats.totalPengguna`.
- API and HTTP communication MUST live in service modules at `frontend/src/services/` (e.g. `frontend/src/services/api.ts`, `frontend/src/services/authService.ts`). Components and pages must never call `fetch()` directly.
- API format normalization (camelCase vs snake_case) is preferred at the API/controller/resource layer; components receive only one format.
  - Wrong: the template reads two formats (`stats.totalPengguna ?? stats.total_pengguna`).
  - Right: the backend sends one format, or a single normalization function in the page/util runs before props are passed down.
- Fake default data is forbidden: use `0` / `null` / `[]`, provide an `isLoading` prop, and show a skeleton or `"-"`.
  - Wrong: `const totalPengguna = stats.totalPengguna ?? 128`.
  - Right: `const totalPengguna = stats.totalPengguna ?? 0` + `{isLoading ? <Skeleton /> : totalPengguna}`.
- Page/container is glue: it calls hooks, utils, and services, and passes the results to the template via props; state used by more than one part (example: search in the topbar + table) MUST live in the page, not in the template.
  - Wrong: `searchQuery` lives in `AdminDashboardTemplate` and is then used by the topbar and table inside it.
  - Right: `frontend/src/pages/Admin/Dashboard.tsx` calls `useUserSearch` and passes `searchQuery` / `onSearchChange` / `filteredUsers` to the template.
- Checklist before commit: template free of business/filter `useState`? No fake hardcoded numbers/data? Hooks, utils, and services testable in isolation?

### 11.1 Fetch Hook Contract
Every hook that fetches data MUST return `{ data, isLoading, error, refetch }`.
- `data` defaults to `null` or `[]`, never fake data.
- `error` holds a message string or `null`. Pages pass it to the template for display.
- `refetch` is the only way to reload manually.

### 11.2 Fetch Lifecycle & Cleanup
- Every request in a hook MUST be cancellable via `AbortController`, aborted in the `useEffect` cleanup.
- Every polling interval MUST be cleared in the `useEffect` cleanup (`clearInterval`).
- Ignore aborted requests: do not set state or show an error for them.
- Polling interval value lives in a named constant, not an inline number.
- Polling pauses while the tab is hidden (`document.visibilityState`).

### 11.3 Centralized HTTP Error Handling
Handled once in the response interceptor of `frontend/src/services/api.ts`, never repeated in hooks or components:
- 401: clear session state and redirect to login.
- 403: render the `ErrorTemplate` 403 view.
- 422: pass `message` and `errors` through to the caller untouched.
- 429: surface the `message` from the API (rate limit).
- Network error / 5xx: return a generic Indonesian error message.

### 11.4 Service Module Rules
- One service file per domain in `frontend/src/services/` (`notifikasiService.ts`, `authService.ts`).
- Service functions only call the shared Axios instance and return typed data. No state, no React imports.
- Request/response types come from `frontend/src/types/api.ts`.
- Endpoints follow `docs/API_CONTRACT.md` under `/api/v1/`.

### 11.5 No Duplicate Fetch
- The same endpoint MUST NOT be fetched by more than one mounted hook instance at the same time.
- Data needed by more than one page or layout part (topbar badge + dropdown + page) is fetched once in a Context Provider and read through a consumer hook.
- Do NOT add a data-fetching/caching library (TanStack Query, SWR, etc.) without user approval (Section 2).

### 11.6 Shared Data Context Pattern
- Location: `frontend/src/contexts/<Name>Context.tsx` for the provider, `frontend/src/hooks/use<Name>.ts` for the consumer hook.
- The provider calls the fetch hook once and exposes `{ data, isLoading, error, refetch }`.
- The provider is mounted in the role layout route, so all pages under that layout share it.
- Organisms and templates never import the provider. The page reads the consumer hook and passes data to the template via props.

### 11.7 Checklist Addition
Before commit: no fetch in organisms/molecules? Abort and interval cleanup present? Error and loading states exposed? No duplicate fetch of the same endpoint? 401/403/429 handled only in the interceptor?

---

## 12. Monorepo Structure & Workflow

### 12.1 Directory Structure
- `backend/`: Laravel 13 REST API application (PHP 8.5.11, SQLite/PostgreSQL, Sanctum cookie auth, API controllers returning JSON).
- `frontend/`: React 19 SPA application (TypeScript, React Router v7, Tailwind CSS v4, Axios).
- `docs/`: System documentation, specifications, database design, and architecture rules.
- `.agents/`: AI skills, rules, and assistant configuration.

### 12.2 Development Commands
- Backend API server:
  ```bash
  cd backend && php artisan serve
  ```
- Frontend dev server (with Vite dev proxy to backend):
  ```bash
  cd frontend && npm run dev
  ```

### 12.3 Testing & Build Verification
- Backend tests:
  ```bash
  cd backend && php artisan test
  ```
- Frontend TypeScript check and build:
  ```bash
  cd frontend && npm run build
  ```