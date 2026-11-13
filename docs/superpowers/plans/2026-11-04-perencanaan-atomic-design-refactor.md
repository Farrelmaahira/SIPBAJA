# Perencanaan Pages Atomic Design Refactor and Reusable Profile/Notification Organisms Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor Perencanaan pages (`JenisMak/Index.tsx`, `Pengajuan/Index.tsx`, `Rkakl/Index.tsx`, `Notifikasi/Index.tsx`, and `Profil/Index.tsx`) to strictly adhere to Atomic Design and `docs/DEVELOPMENT_RULES.md`, extract reusable organisms for user profile and notifications for cross-role use, eliminate fake static data, and centralize all API queries into `perencanaanService.ts`.

**Architecture:**
- Frontend Service: Add methods in `frontend/src/services/perencanaanService.ts` for Pengajuan list, Jenis MAK CRUD, RKAKL data/upload, and Profil. Pages do not call `api` directly.
- Shared Organisms: Create `UserProfileSection.tsx` (avatar, badges, info grid, and logout action) and `NotificationListCard.tsx` (tab filtering, mark read, delete, list rendering) under `frontend/src/components/organisms/` for general cross-role use.
- Master Data Organisms: Create `JenisMakTable.tsx`, `JenisMakFormModal.tsx`, `HapusJenisMakModal.tsx`, `RkaklActiveCard.tsx`, `RkaklHistoryCard.tsx`, and `RkaklReplaceModal.tsx`.
- Presentation Templates: Create `PerencanaanPengajuanIndexTemplate.tsx`, `PerencanaanJenisMakTemplate.tsx`, and `PerencanaanRkaklTemplate.tsx` under `frontend/src/components/templates/` that receive all data and callbacks via explicit props.
- Pages as Glue: Refactor page files in `frontend/src/pages/Perencanaan/` to only manage state and lifecycle hooks, delegating rendering to templates and API calls to `perencanaanService`.

**Tech Stack:** React 19, TypeScript, React Router v7, Tailwind CSS v4, Lucide React, Axios.

**Spec:**
- `docs/DEVELOPMENT_RULES.md` (Atomic Design: Atoms -> Molecules -> Organisms -> Templates -> Pages; No business logic or fetch in templates/organisms; No fake mock data)
- `docs/design.md` (Theme colors: `#0E7C5A`, `#F3F6F5`, `#14201C`, Plus Jakarta Sans, rounded-22/24px)

## Global Constraints

- No new packages.
- Strict Atomic Design: Organisms and templates are purely presentational; no direct Axios or fetch calls inside templates or organisms.
- Fake default data is forbidden: Replace `DEFAULT_MAK_ROWS` with empty arrays `[]` and show loading skeletons / empty states.
- Reusable components (`UserProfileSection.tsx`, `NotificationListCard.tsx`) must not be hardcoded to the Perencanaan role.

## Review Focus

1. Pure Presentational Templates: Confirm `PerencanaanJenisMakTemplate`, `PerencanaanPengajuanIndexTemplate`, and `PerencanaanRkaklTemplate` contain 0 `api.*` imports and 0 business state logic.
2. Complete elimination of `DEFAULT_MAK_ROWS`: Verify that MAK list displays authentic database records and clean empty message if DB is empty.
3. Profile cross-role reusability: Verify `UserProfileSection` works with any user data shape and arbitrary role badge/initials.
4. Notification list isolation: Verify `NotificationListCard` handles tab changes, mark read, and delete via callbacks passed by the page/hook.
5. TypeScript type safety: All props interfaces and API responses must have strict types without `any` regressions.

---

### Task 1: Expand `perencanaanService.ts` with Complete API Endpoints

**Files:**
- Modify: `frontend/src/services/perencanaanService.ts`
- Modify: `frontend/src/types/perencanaan.ts`

**Interfaces:**
- `perencanaanService.getPengajuanList(params: { q?: string; statuses?: string[]; page?: number }, signal?: AbortSignal)`
- `perencanaanService.getJenisMakList(q?: string, signal?: AbortSignal)`
- `perencanaanService.storeJenisMak(data: { kode: string; nama: string; ppk_user_id: number })`
- `perencanaanService.updateJenisMak(id: number | string, data: { kode: string; nama: string; ppk_user_id: number })`
- `perencanaanService.deleteJenisMak(id: number | string)`
- `perencanaanService.getRkaklData(signal?: AbortSignal)`
- `perencanaanService.replaceRkakl(filename: string)`
- `perencanaanService.getProfilData(signal?: AbortSignal)`

- [ ] **Step 1: Update `frontend/src/types/perencanaan.ts` with domain interfaces**

Add `JenisMakItem`, `JenisMakResponse`, `RkaklHistoryItem`, `RkaklDataResponse`, and `PerencanaanPengajuanListResponse`.

- [ ] **Step 2: Add methods in `frontend/src/services/perencanaanService.ts`**

Implement all required endpoints calling `/v1/perencanaan/*` using the shared Axios instance.

- [ ] **Step 3: Verify TypeScript compilation**

Run: `npm.cmd --prefix frontend run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend/src/types/perencanaan.ts frontend/src/services/perencanaanService.ts
git commit -m "feat(frontend): add complete API methods to perencanaanService"
```

---

### Task 2: Build General Reusable Organisms: `UserProfileSection` and `NotificationListCard`

**Files:**
- Create: `frontend/src/components/organisms/UserProfileSection.tsx`
- Create: `frontend/src/components/organisms/NotificationListCard.tsx`
- Modify: `frontend/src/pages/Perencanaan/Profil/Index.tsx`
- Modify: `frontend/src/pages/Perencanaan/Notifikasi/Index.tsx`

**Interfaces:**
```ts
export interface UserProfileSectionProps {
  user: {
    id?: number | string;
    nama?: string;
    email?: string;
    role?: string | { nama: string };
    unit?: string | { nama: string };
    [key: string]: unknown;
  } | null;
  roleInitials?: string;
  roleTitle?: string | null;
  roleSubtitle?: string | null;
  badgeLabel?: string | null;
  onLogoutClick?: () => void;
  isLoading?: boolean;
}
```

```ts
export interface NotificationListCardProps {
  notifications: NotificationItem[];
  activeTab: string;
  totalCount?: number;
  unreadCount?: number;
  isLoading?: boolean;
  onTabChange: (tab: string) => void;
  onMarkAllAsRead: () => void;
  onMarkOneRead: (item: NotificationItem) => void;
  onDeleteNotification: (item: NotificationItem) => void;
}
```

- [ ] **Step 1: Create `frontend/src/components/organisms/UserProfileSection.tsx`**

Extract avatar card and detail information card into a reusable organism following `docs/design.md`.

- [ ] **Step 2: Create `frontend/src/components/organisms/NotificationListCard.tsx`**

Extract notification category tabs, grouping (Hari Ini, Kemarin, Sebelumnya), item cards, and actions into a reusable organism.

- [ ] **Step 3: Update `frontend/src/pages/Perencanaan/Profil/Index.tsx`**

Refactor page to fetch profile via `perencanaanService.getProfilData()` (or use auth user), render `PpLayout` with `UserProfileSection`, and handle logout via `LogoutModal`.

- [ ] **Step 4: Update `frontend/src/pages/Perencanaan/Notifikasi/Index.tsx`**

Refactor page to use `useNotifications()` hook and render `PpLayout` with `NotificationListCard`.

- [ ] **Step 5: Verify TypeScript compilation**

Run: `npm.cmd --prefix frontend run build`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/organisms/UserProfileSection.tsx frontend/src/components/organisms/NotificationListCard.tsx frontend/src/pages/Perencanaan/Profil/Index.tsx frontend/src/pages/Perencanaan/Notifikasi/Index.tsx
git commit -m "feat(frontend): create reusable UserProfileSection and NotificationListCard organisms"
```

---

### Task 3: Refactor `JenisMak`: Organisms, Template, and Page

**Files:**
- Create: `frontend/src/components/organisms/JenisMakTable.tsx`
- Create: `frontend/src/components/organisms/JenisMakFormModal.tsx`
- Create: `frontend/src/components/organisms/HapusJenisMakModal.tsx`
- Create: `frontend/src/components/templates/PerencanaanJenisMakTemplate.tsx`
- Modify: `frontend/src/pages/Perencanaan/JenisMak/Index.tsx`

**Features:**
- Eliminate `DEFAULT_MAK_ROWS` completely.
- `JenisMakTable`: Display list of MAK, penanggung jawab, usage count, action buttons (edit/delete), loading skeleton, and empty message.
- `JenisMakFormModal`: Controlled inputs for `Kode MAK`, `Nama MAK`, and optional `PPK Penanggung Jawab`.
- `HapusJenisMakModal`: Confirm deletion modal.
- `PerencanaanJenisMakTemplate`: Pure layout containing hero banner, search bar, table organism, and modals.
- `JenisMak/Index.tsx`: Glue page managing state (`search`, `maks`, `ppkOptions`, `isLoading`, `processing`, modal open states) and calling `perencanaanService`.

- [ ] **Step 1: Create `JenisMakTable.tsx`, `JenisMakFormModal.tsx`, and `HapusJenisMakModal.tsx`**

Implement presentational organisms in `frontend/src/components/organisms/`.

- [ ] **Step 2: Create `frontend/src/components/templates/PerencanaanJenisMakTemplate.tsx`**

Assemble organisms into template with `PpLayout`.

- [ ] **Step 3: Refactor `frontend/src/pages/Perencanaan/JenisMak/Index.tsx`**

Remove fake rows and direct `api` calls. Connect `perencanaanService` to `PerencanaanJenisMakTemplate`.

- [ ] **Step 4: Verify TypeScript compilation**

Run: `npm.cmd --prefix frontend run build`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/organisms/JenisMakTable.tsx frontend/src/components/organisms/JenisMakFormModal.tsx frontend/src/components/organisms/HapusJenisMakModal.tsx frontend/src/components/templates/PerencanaanJenisMakTemplate.tsx frontend/src/pages/Perencanaan/JenisMak/Index.tsx
git commit -m "refactor(frontend): apply atomic design to Perencanaan JenisMak page and remove mock data"
```

---

### Task 4: Refactor `Pengajuan/Index`: Template and Page

**Files:**
- Create: `frontend/src/components/templates/PerencanaanPengajuanIndexTemplate.tsx`
- Modify: `frontend/src/pages/Perencanaan/Pengajuan/Index.tsx`

**Features:**
- `PerencanaanPengajuanIndexTemplate`: Pure layout with Hero banner, search input, filter trigger button, table with columns (No Permohonan, Judul, Tanggal, Nilai Pengajuan, Status, Aksi), and `FilterPengajuanModal`.
- `Pengajuan/Index.tsx`: Calls `perencanaanService.getPengajuanList()`, handles filter states, and passes pure props to the template.

- [ ] **Step 1: Create `frontend/src/components/templates/PerencanaanPengajuanIndexTemplate.tsx`**

Create presentational template using `PpLayout` and design tokens from `docs/design.md`.

- [ ] **Step 2: Refactor `frontend/src/pages/Perencanaan/Pengajuan/Index.tsx`**

Replace monolithic JSX with `PerencanaanPengajuanIndexTemplate` and route API calls through `perencanaanService.getPengajuanList`.

- [ ] **Step 3: Verify TypeScript compilation**

Run: `npm.cmd --prefix frontend run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/templates/PerencanaanPengajuanIndexTemplate.tsx frontend/src/pages/Perencanaan/Pengajuan/Index.tsx
git commit -m "refactor(frontend): apply atomic design to Perencanaan Pengajuan Index page"
```

---

### Task 5: Refactor `Rkakl`: Organisms, Template, and Page

**Files:**
- Create: `frontend/src/components/organisms/RkaklActiveCard.tsx`
- Create: `frontend/src/components/organisms/RkaklHistoryCard.tsx`
- Create: `frontend/src/components/organisms/RkaklReplaceModal.tsx`
- Create: `frontend/src/components/templates/PerencanaanRkaklTemplate.tsx`
- Modify: `frontend/src/pages/Perencanaan/Rkakl/Index.tsx`

**Features:**
- `RkaklActiveCard`: Paper sheet preview with metadata, version, active status, and action buttons ("Ganti Dokumen", "Lihat Dokumen").
- `RkaklHistoryCard`: List of historical versions of RKAKL.
- `RkaklReplaceModal`: File selection modal to upload/replace active RKAKL.
- `PerencanaanRkaklTemplate`: Pure layout combining the active card, history card, replace modal, and `DocumentPreviewModal`.
- `Rkakl/Index.tsx`: Glue page managing state and calling `perencanaanService.getRkaklData()` & `perencanaanService.replaceRkakl()`.

- [ ] **Step 1: Create `RkaklActiveCard.tsx`, `RkaklHistoryCard.tsx`, and `RkaklReplaceModal.tsx`**

Implement organisms under `frontend/src/components/organisms/`.

- [ ] **Step 2: Create `frontend/src/components/templates/PerencanaanRkaklTemplate.tsx`**

Create presentational template with `PpLayout`.

- [ ] **Step 3: Refactor `frontend/src/pages/Perencanaan/Rkakl/Index.tsx`**

Delegate rendering to `PerencanaanRkaklTemplate` and API calls to `perencanaanService`.

- [ ] **Step 4: Verify TypeScript compilation and bundling**

Run: `npm.cmd --prefix frontend run build`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/organisms/RkaklActiveCard.tsx frontend/src/components/organisms/RkaklHistoryCard.tsx frontend/src/components/organisms/RkaklReplaceModal.tsx frontend/src/components/templates/PerencanaanRkaklTemplate.tsx frontend/src/pages/Perencanaan/Rkakl/Index.tsx
git commit -m "refactor(frontend): apply atomic design to Perencanaan Rkakl page"
```

---

### Task 6: Full Verification & Code Quality Check

**Files:**
- All changed files.

- [ ] **Step 1: Run full frontend build**

Run: `npm.cmd --prefix frontend run build`
Expected: PASS with 0 errors.

- [ ] **Step 2: Run backend test suite**

Run: `php artisan test`
Expected: 110 passed.

- [ ] **Step 3: Final commit if any adjustments needed**

