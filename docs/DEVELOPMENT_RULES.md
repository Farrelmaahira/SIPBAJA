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

## 4. Architecture: Service Layer (mandatory)

Business logic lives ONLY in Service classes. No exceptions, including authentication.

Request flow:

```
React Page (Axios)  ->  API Controller  ->  Service  ->  Model
```

What belongs where:
- Controllers handle only: input, validation call, calling a Service, returning `JsonResponse` or HTTP response (e.g. 200, 201, 204), never Inertia renders or redirects.
- ALL business logic and ALL write queries live in Service classes.
- Controllers must NOT contain business logic or direct Eloquent queries. A controller method that decides, calculates, or queries beyond reading for display is a violation.
- This pattern applies to EVERY feature, without exception.

Rules:
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
- Do NOT use DB triggers.
- Do NOT edit old migrations.
- Do NOT refactor or "clean up" code outside the scope of the current task.
- Do NOT delete files or data unless the task says so.
- Do NOT use `@inertiajs/react` or Inertia primitives (`usePage`, `useForm`, `router`, `Head`, `Link`).
- Do NOT use direct `fetch()` in pages or components; use the shared Axios instance from `frontend/src/services/api.ts`.

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
- Pages are glue only: call hooks, utils, and services (Section 11), pass the results to a single template via props. No direct fetch or Axios calls inside templates. State used by more than one part MUST live in the page.
- Atoms are presentational only. Explicit props. No global state. No fetch.
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
