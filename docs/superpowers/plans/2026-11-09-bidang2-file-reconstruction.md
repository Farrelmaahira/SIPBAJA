# Bidang 2 (Wadir II) File Reconstruction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconstruct the frontend file architecture of the Bidang 2 (Wakil Direktur II) role (Dashboard, Pengajuan List, Pengajuan Detail, and Dokumen RKAKL) to strictly adhere to Atomic Design, `docs/DEVELOPMENT_RULES.md`, and the Service Layer pattern established by the Perencanaan module.

**Architecture:**
- **Service Layer (`frontend/src/services/bidang2Service.ts`):** Encapsulate all Axios requests (`/v1/bidang-2/*`) in a dedicated service module. Pages and hooks no longer import or call Axios (`api.ts`) directly with URL literals.
- **Custom Hooks (`frontend/src/hooks/`):**
  - Refactor `useBidang2Dashboard.ts` into a self-contained hook with `AbortController` lifecycle handling.
  - Create `useBidang2Pengajuan.ts` to isolate filter, search, pagination, and fetch lifecycle away from the page component.
- **Atomic Templates (`frontend/src/components/templates/`):**
  - Retain and reuse existing `Bidang2DashboardTemplate.tsx` without creating new components.
  - Create `Bidang2PengajuanIndexTemplate.tsx` for list and filter views.
  - Create `Bidang2PengajuanShowTemplate.tsx` for detail and approval/rejection views.
  - Create `Bidang2RkaklTemplate.tsx` for RKAKL document inspection.
- **Pages as Glue (`frontend/src/pages/Bidang2/`):** Refactor `Dashboard.tsx`, `Pengajuan/Index.tsx`, `Pengajuan/Show.tsx`, and `Rkakl/Index.tsx` to act purely as glue containers (under 60-120 lines each) that fetch data via `bidang2Service`/hooks and pass data/handlers to templates via props.

**Tech Stack:** React 19, TypeScript, React Router v7, Tailwind CSS v4, Lucide React, Axios.

**Spec:**
- `docs/DEVELOPMENT_RULES.md` (Sections 4, 10, 11: Service layer, Atomic Design, no business logic or fetch in templates/organisms, custom hooks for stateful logic)
- `docs/API_CONTRACT.md` (`/api/v1/bidang-2/*`)
- `docs/design.md` (Theme colors: `#0E7C5A`, `#14201C`, `#F3F6F5`, `#E4EBE8`)

## Global Constraints

- No new packages or external dependencies.
- Strict Atomic Design: Templates and organisms are purely presentational; no direct Axios or fetch calls inside templates or organisms.
- Zero fake or hardcoded mock data.
- Do not modify backend API contracts or routes.
- Anti-slop rules: No em dashes, clean comments, standard Indonesian domain terms.

## Review Focus

1. Service Layer Isolation: Confirm no Bidang 2 page or component imports `api` directly, only `bidang2Service`.
2. Pure Presentational Templates: Confirm `Bidang2DashboardTemplate`, `Bidang2PengajuanIndexTemplate`, `Bidang2PengajuanShowTemplate`, and `Bidang2RkaklTemplate` contain 0 `api.*` imports and 0 business state logic.
3. Clean Glue Pages: Verify all pages under `frontend/src/pages/Bidang2/` are concise glue components delegating UI to templates.
4. Clean Hook Lifecycle: Verify `useBidang2Dashboard` and `useBidang2Pengajuan` properly abort pending requests on unmount or filter changes.
5. TypeScript Compilation: `npx tsc -b` passes with 0 errors and 0 unused variables.

---

### Task 1: Create `frontend/src/services/bidang2Service.ts` and Type Definitions

**Files:**
- Create: `frontend/src/services/bidang2Service.ts`
- Modify: `frontend/src/types/bidang2.ts`

**Interfaces:**
- `bidang2Service.getDashboard(params?: { tahun?: number }, signal?: AbortSignal): Promise<Bidang2DashboardData>`
- `bidang2Service.getPengajuanList(params?: { search?: string; status?: string; page?: number }, signal?: AbortSignal): Promise<Bidang2PengajuanListResponse>`
- `bidang2Service.getPengajuanDetail(id: number | string, signal?: AbortSignal): Promise<Bidang2DetailApiResponse>`
- `bidang2Service.approvePengajuan(id: number | string, formData: FormData): Promise<Bidang2MutationResponse>`
- `bidang2Service.rejectPengajuan(id: number | string, alasan: string): Promise<Bidang2MutationResponse>`
- `bidang2Service.downloadMemoUrl(id: number | string): string`
- `bidang2Service.downloadDokumenUrl(id: number | string): string`
- `bidang2Service.getRkakl(signal?: AbortSignal): Promise<unknown>`

- [x] **Step 1: Update `frontend/src/types/bidang2.ts` with API responses**
- [x] **Step 2: Implement `frontend/src/services/bidang2Service.ts`**
- [x] **Step 3: Verify TypeScript compilation**
Run: `cmd.exe /c "cd frontend && npx tsc -b"`
Expected: PASS

---

### Task 2: Reconstruct Dashboard (`useBidang2Dashboard.ts` & `pages/Bidang2/Dashboard.tsx`)

**Files:**
- Modify: `frontend/src/hooks/useBidang2Dashboard.ts`
- Modify: `frontend/src/pages/Bidang2/Dashboard.tsx`
- Reuse: `frontend/src/components/templates/Bidang2DashboardTemplate.tsx`

**Interfaces:**
- `useBidang2Dashboard`: Self-contained hook fetching on mount via `bidang2Service.getDashboard` with `AbortController`.
- `Bidang2Dashboard`: Pure glue component passing data to existing `Bidang2DashboardTemplate`.

- [x] **Step 1: Refactor `useBidang2Dashboard.ts`**
- [x] **Step 2: Refactor `frontend/src/pages/Bidang2/Dashboard.tsx`**
- [x] **Step 3: Verify TypeScript compilation**
Run: `cmd.exe /c "cd frontend && npx tsc -b"`
Expected: PASS

---

### Task 3: Create Custom Hook `frontend/src/hooks/useBidang2Pengajuan.ts`

**Files:**
- Create: `frontend/src/hooks/useBidang2Pengajuan.ts`

**Interfaces:**
- Returns: `{ items, pagination, isLoading, hasError, errorMessage, searchQuery, setSearchQuery, selectedStatus, setSelectedStatus, handleSearchSubmit, handleStatusChange, handlePageChange, refetch }`

- [x] **Step 1: Implement `useBidang2Pengajuan.ts`**
- [x] **Step 2: Verify TypeScript compilation**
Run: `cmd.exe /c "cd frontend && npx tsc -b"`
Expected: PASS

---

### Task 4: Create `Bidang2PengajuanIndexTemplate.tsx` & Refactor `pages/Bidang2/Pengajuan/Index.tsx`

**Files:**
- Create: `frontend/src/components/templates/Bidang2PengajuanIndexTemplate.tsx`
- Modify: `frontend/src/pages/Bidang2/Pengajuan/Index.tsx`

**Interfaces:**
- `Bidang2PengajuanIndexTemplateProps`: Receives items, pagination, loading, search, filter status, and navigation callbacks.
- `PengajuanIndex`: Pure glue component calling `useBidang2Pengajuan` and rendering `Bidang2PengajuanIndexTemplate`.

- [x] **Step 1: Create `Bidang2PengajuanIndexTemplate.tsx`**
- [x] **Step 2: Refactor `frontend/src/pages/Bidang2/Pengajuan/Index.tsx`**
- [x] **Step 3: Verify TypeScript compilation**
Run: `cmd.exe /c "cd frontend && npx tsc -b"`
Expected: PASS

---

### Task 5: Create `Bidang2PengajuanShowTemplate.tsx` & Refactor `pages/Bidang2/Pengajuan/Show.tsx`

**Files:**
- Create: `frontend/src/components/templates/Bidang2PengajuanShowTemplate.tsx`
- Modify: `frontend/src/pages/Bidang2/Pengajuan/Show.tsx`

**Interfaces:**
- `Bidang2PengajuanShowTemplateProps`: Receives `permohonan`, `isLoading`, `hasError`, `errorMessage`, `flashMessage`, `isSubmitting`, `onApprove`, `onReject`, `onBack`, `user`.
- `Bidang2PengajuanShow`: Pure glue component managing approve/reject actions and passing state to `Bidang2PengajuanShowTemplate`.

- [x] **Step 1: Create `Bidang2PengajuanShowTemplate.tsx`**
- [x] **Step 2: Refactor `frontend/src/pages/Bidang2/Pengajuan/Show.tsx`**
- [x] **Step 3: Verify TypeScript compilation**
Run: `cmd.exe /c "cd frontend && npx tsc -b"`
Expected: PASS

---

### Task 6: Create `Bidang2RkaklTemplate.tsx` & Refactor `pages/Bidang2/Rkakl/Index.tsx`

**Files:**
- Create: `frontend/src/components/templates/Bidang2RkaklTemplate.tsx`
- Modify: `frontend/src/pages/Bidang2/Rkakl/Index.tsx`

**Interfaces:**
- `Bidang2RkaklTemplateProps`: Receives `rkaklData`, `isLoading`, `hasError`, `user`.
- `RkaklIndex`: Pure glue component invoking `bidang2Service.getRkakl` and rendering `Bidang2RkaklTemplate`.

- [x] **Step 1: Create `Bidang2RkaklTemplate.tsx`**
- [x] **Step 2: Refactor `frontend/src/pages/Bidang2/Rkakl/Index.tsx`**
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
Run: `cmd.exe /c "cd /d C:\Users\vall\Documents\SIPBAJA\backend && php artisan test tests/Feature/Bidang2"`
Expected: All tests PASS.

- [x] **Step 4: Run Pint formatter**
Run: `cmd.exe /c "cd /d C:\Users\vall\Documents\SIPBAJA\backend && vendor\bin\pint.bat --dirty --format agent"`
Expected: Clean formatting.
