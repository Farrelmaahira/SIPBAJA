# Pemohon File Mapping Reconstruction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconstruct the frontend file architecture of the Pemohon role (Dashboard, List, Create, Show, Edit) to strictly conform to Atomic Design, `docs/DEVELOPMENT_RULES.md`, and the service layer pattern established by the Perencanaan module.

**Architecture:**
- **Service Layer (`frontend/src/services/pemohonService.ts`):** Encapsulate all Axios requests (`/v1/pemohon/*`) in a dedicated service module. Pages and hooks no longer call Axios (`api.ts`) directly.
- **Custom Hook (`frontend/src/hooks/usePemohonPermohonan.ts`):** Extract and isolate stateful logic (search query, filter modal, filter selection, pagination, AbortController lifecycle) away from page components.
- **Atomic Templates (`frontend/src/components/templates/`):**
  - Adapt existing `PermohonanIndexTemplate.tsx` for Pemohon list/filter view with zero mock/hardcoded links.
  - Adapt existing `PermohonanShowTemplate.tsx` for Pemohon detail view.
  - Create new `PermohonanEditTemplate.tsx` for revision view (approved by user).
  - Retain `PemohonDashboardTemplate.tsx` and `PermohonanCreateTemplate.tsx`.
- **Pages as Glue (`frontend/src/pages/Pemohon/`):** Refactor `Dashboard.tsx`, `Permohonan/Index.tsx`, `Create.tsx`, `Show.tsx`, and `Edit.tsx` to act purely as glue containers (under 100 lines each) that fetch data via `pemohonService`/hooks and pass data/handlers to templates via props.

**Tech Stack:** React 19, TypeScript, React Router v7, Tailwind CSS v4, Lucide React, Axios.

**Spec:**
- `docs/DEVELOPMENT_RULES.md` (Sections 4, 10, 11: Service layer, Atomic Design, no business logic or fetch in templates/organisms, custom hooks for stateful logic)
- `docs/API_CONTRACT.md` (`/api/v1/pemohon/*`)
- `docs/design.md` (Theme colors: `#0E7C5A`, `#14201C`, `#F3F6F5`, `#E4EBE8`)

## Global Constraints

- No new packages or external dependencies.
- Strict Atomic Design: Templates and organisms are purely presentational; no direct Axios or fetch calls inside templates or organisms.
- Zero fake or hardcoded mock data.
- Do not modify backend API contracts or routes.
- Anti-slop rules: No em dashes, clean comments, standard Indonesian domain terms.

## Review Focus

1. Service Layer Isolation: Confirm no Pemohon page or component imports `api` directly, only `pemohonService`.
2. Pure Presentational Templates: Confirm `PermohonanIndexTemplate`, `PermohonanShowTemplate`, and `PermohonanEditTemplate` contain 0 `api.*` imports and 0 business state logic.
3. Clean Glue Pages: Verify all pages under `frontend/src/pages/Pemohon/` are concise glue components delegating UI to templates.
4. Clean Hook Lifecycle: Verify `usePemohonPermohonan` properly aborts pending requests on unmount or filter changes.
5. TypeScript Compilation: `npx tsc -b` passes with 0 errors and 0 unused variables.

---

### Task 1: Create `frontend/src/services/pemohonService.ts` and Type Definitions

**Files:**
- Create: `frontend/src/services/pemohonService.ts`
- Modify: `frontend/src/types/permohonan.ts`

**Interfaces:**
- `pemohonService.getDashboard(signal?: AbortSignal): Promise<PemohonDashboardResponse>`
- `pemohonService.getPermohonanList(params?: { search?: string; status?: string; page?: number }, signal?: AbortSignal): Promise<PermohonanListResponse>`
- `pemohonService.getPermohonanDetail(id: number | string, signal?: AbortSignal): Promise<PermohonanDetailResponse>`
- `pemohonService.storePermohonan(formData: FormData): Promise<PermohonanMutationResponse>`
- `pemohonService.revisiPermohonan(id: number | string, formData: FormData): Promise<PermohonanMutationResponse>`
- `pemohonService.getDokumenDownloadUrl(id: number | string): string`

- [x] **Step 1: Check and update `frontend/src/types/permohonan.ts`**
Ensure response contracts (`PermohonanListResponse`, `PemohonDashboardResponse`, `PermohonanDetailResponse`, `PermohonanMutationResponse`) match `docs/API_CONTRACT.md`.

- [x] **Step 2: Implement `pemohonService.ts`**
Implement the service methods calling `/v1/pemohon/*` using the shared `api` Axios instance.

- [x] **Step 3: Verify TypeScript compilation**
Run: `cmd.exe /c "cd frontend && npx tsc -b"`
Expected: PASS

---

### Task 2: Create Custom Hook `frontend/src/hooks/usePemohonPermohonan.ts`

**Files:**
- Create: `frontend/src/hooks/usePemohonPermohonan.ts`

**Interfaces:**
- Returns: `{ items, pagination, isLoading, hasError, errorMessage, searchQuery, setSearchQuery, selectedStatus, setSelectedStatus, filterModalOpen, setFilterModalOpen, fetchList, handlePageChange, handleSearchSubmit, handleApplyFilter, handleResetFilter }`

- [x] **Step 1: Implement `usePemohonPermohonan.ts`**
Isolate search query, filter modal state, status selection, and paginated fetch with `AbortController` and error handling.

- [x] **Step 2: Verify TypeScript compilation**
Run: `cmd.exe /c "cd frontend && npx tsc -b"`
Expected: PASS

---

### Task 3: Refactor `PermohonanIndexTemplate.tsx` & Page `pages/Pemohon/Permohonan/Index.tsx`

**Files:**
- Modify: `frontend/src/components/templates/PermohonanIndexTemplate.tsx`
- Modify: `frontend/src/pages/Pemohon/Permohonan/Index.tsx`

**Interfaces:**
- `PermohonanIndexTemplateProps`: Receives items, pagination, loading, search, filter handlers, navigation callbacks, and user session.
- `PemohonPermohonanIndex`: Page glue component invoking `usePemohonPermohonan` and passing props to `PermohonanIndexTemplate`.

- [x] **Step 1: Refactor `PermohonanIndexTemplate.tsx`**
Update `PermohonanIndexTemplate.tsx` into a presentation template with Pemohon sidebar/header, table, search input, filter modal trigger, and pagination controls.

- [x] **Step 2: Refactor `frontend/src/pages/Pemohon/Permohonan/Index.tsx`**
Replace 450+ lines of inline markup with clean glue code (approx. 50-70 lines) calling `usePemohonPermohonan` and rendering `PermohonanIndexTemplate`.

- [x] **Step 3: Verify TypeScript compilation**
Run: `cmd.exe /c "cd frontend && npx tsc -b"`
Expected: PASS

---

### Task 4: Refactor `PermohonanShowTemplate.tsx` & Page `pages/Pemohon/Permohonan/Show.tsx`

**Files:**
- Modify: `frontend/src/components/templates/PermohonanShowTemplate.tsx`
- Modify: `frontend/src/pages/Pemohon/Permohonan/Show.tsx`

**Interfaces:**
- `PermohonanShowTemplateProps`: Receives `permohonan`, `isLoading`, `hasError`, `errorMessage`, `onBack`, `onNavigateEdit`, `user`.
- `PemohonPermohonanShow`: Page glue component invoking `pemohonService.getPermohonanDetail` and rendering `PermohonanShowTemplate`.

- [x] **Step 1: Refactor `PermohonanShowTemplate.tsx`**
Reconstruct `PermohonanShowTemplate.tsx` to hold the detail presentation layout (HeroBanner, StatusPill, CatatanPenolakanCard, SuratPermohonanCard, TimelineProsesCard, PanduanPengajuanCard, AlurPermohonanCard).

- [x] **Step 2: Refactor `frontend/src/pages/Pemohon/Permohonan/Show.tsx`**
Convert `Show.tsx` into a lean glue component (approx. 60-80 lines) delegating rendering to `PermohonanShowTemplate`.

- [x] **Step 3: Verify TypeScript compilation**
Run: `cmd.exe /c "cd frontend && npx tsc -b"`
Expected: PASS

---

### Task 5: Create `PermohonanEditTemplate.tsx` & Refactor Page `pages/Pemohon/Permohonan/Edit.tsx`

**Files:**
- Create: `frontend/src/components/templates/PermohonanEditTemplate.tsx`
- Modify: `frontend/src/pages/Pemohon/Permohonan/Edit.tsx`

**Interfaces:**
- `PermohonanEditTemplateProps`: Receives `permohonan`, `formData`, `formErrors`, `isSubmitting`, `isLoading`, `hasError`, `errorMessage`, `onFieldChange`, `onFileChange`, `onSubmit`, `onBack`, `user`.
- `PemohonPermohonanEdit`: Page glue component handling revision submission via `pemohonService.revisiPermohonan` and rendering `PermohonanEditTemplate`.

- [x] **Step 1: Create `PermohonanEditTemplate.tsx`**
Build presentational template featuring the edit form card, rejection note card, sidebar navigation, and side guides.

- [x] **Step 2: Refactor `frontend/src/pages/Pemohon/Permohonan/Edit.tsx`**
Simplify `Edit.tsx` into a glue container using `pemohonService` for initial load and revision submission.

- [x] **Step 3: Verify TypeScript compilation**
Run: `cmd.exe /c "cd frontend && npx tsc -b"`
Expected: PASS

---

### Task 6: Refactor `Dashboard.tsx` and `Create.tsx` to use `pemohonService`

**Files:**
- Modify: `frontend/src/pages/Pemohon/Dashboard.tsx`
- Modify: `frontend/src/pages/Pemohon/Permohonan/Create.tsx`

- [x] **Step 1: Refactor `Dashboard.tsx`**
Replace `api.get('/v1/pemohon/dashboard')` with `pemohonService.getDashboard(signal)`.

- [x] **Step 2: Refactor `Create.tsx`**
Replace `api.post('/v1/pemohon/permohonan', formData)` with `pemohonService.storePermohonan(formData)`.

- [x] **Step 3: Verify TypeScript compilation**
Run: `cmd.exe /c "cd frontend && npx tsc -b"`
Expected: PASS

---

### Task 7: Full Verification & Code Quality

**Files:**
- Verify all modified and created files.

- [x] **Step 1: Run TypeScript full check**
Run: `cmd.exe /c "cd frontend && npx tsc -b"`
Expected: PASS with 0 errors.

- [x] **Step 2: Run Frontend build**
Run: `cmd.exe /c "cd frontend && npm run build"`
Expected: PASS with build manifest generated.

- [x] **Step 3: Run Backend feature tests**
Run: `cmd.exe /c "cd backend && php artisan test tests/Feature/Pemohon"`
Expected: All tests PASS.

- [x] **Step 4: Run Pint formatter**
Run: `cmd.exe /c "cd backend && vendor/bin/pint --dirty --format agent"`
Expected: Clean formatting.
