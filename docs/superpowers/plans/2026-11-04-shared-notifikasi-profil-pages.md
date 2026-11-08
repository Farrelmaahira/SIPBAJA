# Shared Notifikasi and Profil Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify the Notifikasi and Profil pages across all roles into shared, reusable page components (`SharedNotifikasiPage` and `SharedProfilPage`) while preserving role-specific URLs (`/:role/notifikasi` and `/:role/profil`) and adhering to Atomic Design principles.

**Architecture:** Create two shared page components under `frontend/src/pages/Shared/` that wrap the generic organisms (`NotificationListCard` and `UserProfileSection`) inside `AppLayout`. Each shared page auto-detects or accepts `basePath` and role configurations. Existing role-specific page entries (`Perencanaan`, `Pp`, `Ppk`) and router definitions delegate to these shared pages without breaking changes.

**Tech Stack:** React 19, TypeScript, React Router 7, Tailwind CSS, Lucide React icons, Vite.

**Spec:** In-chat approved design (Option B: Role-specific URL structure with shared page implementation).

## Global Constraints

- Adhere to `docs/DEVELOPMENT_RULES.md` and Atomic Design: organisms remain context-agnostic, templates provide structural layouts, pages manage routing & data.
- UI styling must strictly follow `docs/design.md` (Plus Jakarta Sans, brand `#0E7C5A`, solid fills, no gradients).
- Zero breaking changes to existing routes: `/perencanaan/notifikasi`, `/perencanaan/profil`, `/pp/notifikasi`, `/pp/profil`, `/ppk/notifikasi`, `/ppk/profil`.
- No direct unhandled axios calls; leverage `useNotifications` and `useAuth` hooks.

## Review Focus

- Role base path resolution: Accessing `/perencanaan/notifikasi` or `/ppk/notifikasi` must resolve the correct return link (`/perencanaan/dashboard` vs `/ppk/dashboard`).
- Profile data retrieval: User profile information and role badges must reflect the logged-in user without hardcoding.
- Notification action handling: Tab filtering (*Semua*, *Pengingat*, *Status*), marking as read, and deleting notifications must function smoothly across roles.
- Type safety and build validity: Frontend build (`npm.cmd --prefix frontend run build`) must pass with 0 errors.

---

### Task 1: Create `SharedNotifikasiPage` Component

**Files:**
- Create: `frontend/src/pages/Shared/SharedNotifikasiPage.tsx`

- [ ] **Step 1.1: Implement `SharedNotifikasiPage`**
  - Use `useLocation` to derive `basePath` from the URL path (e.g. `/perencanaan`, `/pp`, `/ppk`, `/pemohon`, `/bidang-2`) if not explicitly passed as a prop.
  - Consume `useNotifications` hook for state and actions (`notifications`, `unreadCount`, `totalCount`, `activeTab`, `fetchList`, `markAsRead`, `markAllAsRead`, `deleteNotification`, `isLoading`).
  - Render inside `AppLayout` with `activeRoute="notifikasi"`.
  - Include the standard Hero Banner with title "Semua Notifikasi" and a "Kembali" link pointing to `${basePath}/dashboard`.
  - Render `NotificationListCard` organism with handlers.

- [ ] **Step 1.2: Verify Compilation**
  - Run `npm.cmd --prefix frontend run build` to confirm compilation.

- [ ] **Step 1.3: Commit**
  - `git add frontend/src/pages/Shared/SharedNotifikasiPage.tsx`
  - `git commit -m "feat(frontend): create SharedNotifikasiPage component"`

---

### Task 2: Create `SharedProfilPage` Component

**Files:**
- Create: `frontend/src/pages/Shared/SharedProfilPage.tsx`

- [ ] **Step 2.1: Implement `SharedProfilPage`**
  - Use `useLocation` to derive `basePath` if not explicitly passed as a prop.
  - Consume `useAuth` hook for user information and logout functionality.
  - Render inside `AppLayout` with `activeRoute="dashboard"`.
  - Include the Hero Banner with title "Profil Saya" and a "Kembali" link pointing to `${basePath}/dashboard`.
  - Render `UserProfileSection` organism with role initials, display name, and subtitle.
  - Handle logout confirmation modal and navigate to `/` on logout.

- [ ] **Step 2.2: Verify Compilation**
  - Run `npm.cmd --prefix frontend run build` to confirm compilation.

- [ ] **Step 2.3: Commit**
  - `git add frontend/src/pages/Shared/SharedProfilPage.tsx`
  - `git commit -m "feat(frontend): create SharedProfilPage component"`

---

### Task 3: Migrate Role Notifikasi and Profil Pages to Use Shared Pages

**Files:**
- Modify: `frontend/src/pages/Perencanaan/Notifikasi/Index.tsx`
- Modify: `frontend/src/pages/Perencanaan/Profil/Index.tsx`
- Modify: `frontend/src/pages/Pp/Notifikasi/Index.tsx`
- Modify: `frontend/src/pages/Pp/Profil/Index.tsx`
- Modify: `frontend/src/pages/Ppk/Notifikasi/Index.tsx`
- Modify: `frontend/src/pages/Ppk/Profil/Index.tsx`

- [ ] **Step 3.1: Update Perencanaan Notifikasi and Profil**
  - Delegate `PerencanaanNotifikasiIndex` to `SharedNotifikasiPage` with `basePath="/perencanaan"`.
  - Delegate `PerencanaanProfilIndex` to `SharedProfilPage` with `basePath="/perencanaan"`.

- [ ] **Step 3.2: Update PP Notifikasi and Profil**
  - Refactor `frontend/src/pages/Pp/Notifikasi/Index.tsx` (previously ~320 lines of repetitive code) to delegate to `SharedNotifikasiPage` with `basePath="/pp"`.
  - Refactor `frontend/src/pages/Pp/Profil/Index.tsx` (previously ~240 lines of repetitive code) to delegate to `SharedProfilPage` with `basePath="/pp"`.

- [ ] **Step 3.3: Update PPK Notifikasi and Profil**
  - Refactor `frontend/src/pages/Ppk/Notifikasi/Index.tsx` and `frontend/src/pages/Ppk/Profil/Index.tsx` to delegate to `SharedNotifikasiPage` and `SharedProfilPage` with `basePath="/ppk"`.

- [ ] **Step 3.4: Verify Router and Frontend Compilation**
  - Verify routes in `frontend/src/router/index.tsx`.
  - Run `npm.cmd --prefix frontend run build` to confirm zero compilation errors.

- [ ] **Step 3.5: Commit**
  - `git add frontend/src/pages/Perencanaan/ frontend/src/pages/Pp/ frontend/src/pages/Ppk/`
  - `git commit -m "refactor(frontend): migrate role notifikasi and profil pages to shared pages"`

---

### Task 4: Final Verification and Clean-up

**Files:**
- Document: `docs/superpowers/plans/2026-11-04-shared-notifikasi-profil-pages.md`

- [ ] **Step 4.1: Run Full Frontend Build**
  - Execute `npm.cmd --prefix frontend run build` to verify clean production bundle.

- [ ] **Step 4.2: Run Backend Tests**
  - Execute `php artisan test` in backend to ensure backend API compatibility remains intact.

- [ ] **Step 4.3: Final Commit**
  - Commit any remaining documentation and ensure working directory is clean.

