# Notification Provider & Postman Collection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun `NotificationProvider` dan consumer hook `useNotifications` untuk tata kelola notifikasi terpusat di frontend React 19 sesuai `DEVELOPMENT_RULES.md`, serta memperbarui `SIPBAJA_API.postman_collection.json`, `SIPBAJA_Local.postman_environment.json`, dan `docs/API_CONTRACT.md`.

**Architecture:** Menerapkan *Shared Data Context Pattern* di level route layout terotentikasi. Layanan API dipisah murni di `notificationService.ts`, state terpusat dikelola di `NotificationContext.tsx`, dan diakses melalui hook `useNotifications.ts`. Komponen presentasional (`DashboardTopbar`, `NotificationDropdown`, `PpTopbar`, `PpNotifikasiIndex`) merefleksikan data notifikasi reaktif secara *real-time* tanpa duplikasi fetch (*No Duplicate Fetch*).

**Tech Stack:** React 19, TypeScript, React Router v7, Tailwind CSS v4, Axios, Laravel 13, Postman Collection Format v2.1.0.

**Spec:** `docs/DEVELOPMENT_RULES.md` (Bagian 10, 11.4, 11.5, 11.6), `docs/API_CONTRACT.md`.

## Global Constraints

- Tech Stack tetap: Laravel 13, PHP 8.5.11, React 19 + TypeScript + Tailwind CSS v4, Axios (DEVELOPMENT_RULES.md Sec. 2).
- Dilarang menambah package data-fetching/caching eksternal (TanStack Query, SWR, dll) tanpa persetujuan (Sec. 2).
- Presentational components (atoms, molecules, organisms, templates) dilarang melakukan fetch/Axios langsung (Sec. 10 & 11).
- Single source of truth request di Service module (`frontend/src/services/notificationService.ts`) (Sec. 11.4).
- Request di hook/context harus dapat dibatalkan via `AbortController` (Sec. 11.2).
- Sinkronisasi wajib: Setiap perubahan endpoint harus tercermin di `docs/API_CONTRACT.md`, Postman collection, dan TypeScript types (Sec. 4.2).

## Review Focus

- Polling / window visibility: Polling berhenti ketika tab tidak aktif (`document.visibilityState === 'hidden'`).
- AbortController cleanup: Unmounting komponen tidak menyebabkan memory leak atau state update pasca unmount.
- Sinkronisasi unread count: Aksi "Tandai Semua Dibaca" atau "Tandai Satu Dibaca" di dropdown langsung mengupdate badge angka di Topbar tanpa refresh.
- Penanganan error 403 / 401: Ditangani terpusat via interceptor Axios tanpa melempar unhandled rejection ke UI.
- Paginasi tab filter (`semua`, `pengingat`, `status`): Konsisten dengan schema pagination backend.

---

### Task 1: Update Postman Collection, Environment & API Contract

**Files:**
- Modify: `docs/SIPBAJA_API.postman_collection.json`
- Modify: `docs/SIPBAJA_Local.postman_environment.json`
- Modify: `docs/API_CONTRACT.md:530-540`

**Interfaces:**
- Produces: Definisi endpoint `/api/v1/notifications` lengkap (List, Summary, Unread Count, Store, Read All, Read One, Delete) dan environment variable `notificationId`.

- [ ] **Step 1: Tambahkan variable `notificationId` ke `docs/SIPBAJA_Local.postman_environment.json`**
  Tambahkan objek variable:
  ```json
  {
    "key": "notificationId",
    "value": "1",
    "type": "default",
    "enabled": true
  }
  ```

- [ ] **Step 2: Tambahkan folder "Notifikasi Terpusat" di `docs/SIPBAJA_API.postman_collection.json`**
  Tambahkan 7 item permintaan di bawah grup rute `/api/v1`:
  1. `GET {{baseUrl}}/api/v1/notifications?tab=semua&per_page=10` (List)
  2. `GET {{baseUrl}}/api/v1/notifications/summary?limit=5` (Summary)
  3. `GET {{baseUrl}}/api/v1/notifications/unread-count` (Unread Count)
  4. `POST {{baseUrl}}/api/v1/notifications` (Kirim Notifikasi)
  5. `POST {{baseUrl}}/api/v1/notifications/read-all` (Mark All Read)
  6. `POST {{baseUrl}}/api/v1/notifications/:notification/read` (Mark One Read)
  7. `DELETE {{baseUrl}}/api/v1/notifications/:notification` (Delete)

- [ ] **Step 3: Tambahkan dokumentasi detail Section 3.10 di `docs/API_CONTRACT.md`**
  Dokumentasikan spesifikasi request parameter, header, request body, dan sample JSON response untuk semua endpoint notifikasi terpusat.

- [ ] **Step 4: Validasi JSON schema file Postman**
  Jalankan verifikasi integritas JSON menggunakan node/python:
  ```bash
  node -e "JSON.parse(fs.readFileSync('docs/SIPBAJA_API.postman_collection.json'))"
  node -e "JSON.parse(fs.readFileSync('docs/SIPBAJA_Local.postman_environment.json'))"
  ```
  Expected: Tidak ada error syntax JSON.

- [ ] **Step 5: Commit perubahan dokumentasi Postman & Kontrak API**
  ```bash
  git add docs/SIPBAJA_API.postman_collection.json docs/SIPBAJA_Local.postman_environment.json docs/API_CONTRACT.md
  git commit -m "docs(api): add centralized notifications endpoints to postman and api contract"
  ```

---

### Task 2: Frontend Notification Types & API Service Layer

**Files:**
- Create: `frontend/src/types/notification.ts`
- Create: `frontend/src/services/notificationService.ts`
- Modify: `frontend/src/types/api.ts` (re-export or unified definitions)

**Interfaces:**
- Produces: `notificationService.getNotifications()`, `getSummary()`, `getUnreadCount()`, `markAsRead()`, `markAllAsRead()`, `deleteNotification()`, `sendNotification()`.

- [ ] **Step 1: Buat tipe data TypeScript di `frontend/src/types/notification.ts`**
  Definisikan:
  - `NotificationItem`: `{ id: number; judul: string; pesan: string; channel: string; ref_type?: string | null; ref_id?: number | null; read_at?: string | null; created_at: string; waktu_relatif?: string }`
  - `NotificationSummaryResponse`: `{ recentNotifications: NotificationItem[]; unreadNotificationsCount: number; unreadCount: number }`
  - `NotificationListResponse`: `{ notifications: { data: NotificationItem[]; total: number; current_page: number; last_page: number; per_page: number }; unreadCount: number; activeTab: string }`
  - `NotificationTab`: `'semua' | 'pengingat' | 'status'`

- [ ] **Step 2: Buat service module murni di `frontend/src/services/notificationService.ts`**
  Implementasikan fungsi HTTP murni menggunakan shared Axios `api`:
  - `getSummary(limit?: number, signal?: AbortSignal): Promise<NotificationSummaryResponse>`
  - `getUnreadCount(signal?: AbortSignal): Promise<number>`
  - `getNotifications(tab?: string, page?: number, perPage?: number, signal?: AbortSignal): Promise<NotificationListResponse>`
  - `markAsRead(id: number | string): Promise<{ message: string }>`
  - `markAllAsRead(): Promise<{ message: string; affected: number }>`
  - `deleteNotification(id: number | string): Promise<{ message: string }>`

- [ ] **Step 3: Verifikasi kompilasi TypeScript service**
  ```bash
  npm.cmd --prefix frontend run build
  ```
  Expected: Berhasil tanpa error tipe.

- [ ] **Step 4: Commit types dan service**
  ```bash
  git add frontend/src/types/notification.ts frontend/src/services/notificationService.ts
  git commit -m "feat(frontend): create notification types and api service module"
  ```

---

### Task 3: Notification Context & Custom Hook

**Files:**
- Create: `frontend/src/contexts/NotificationContext.tsx`
- Create: `frontend/src/hooks/useNotifications.ts`
- Modify: `frontend/src/hooks/index.ts`

**Interfaces:**
- Produces: `NotificationProvider` component dan `useNotifications()` hook dengan nilai:
  `{ recentNotifications, notifications, unreadCount, totalCount, activeTab, isLoading, error, setActiveTab, refetchSummary, fetchList, markAsRead, markAllAsRead, deleteNotification }`.

- [ ] **Step 1: Buat context provider di `frontend/src/contexts/NotificationContext.tsx`**
  - Pasang state terpusat: `recentNotifications`, `notifications`, `unreadCount`, `totalCount`, `activeTab`, `isLoading`, `error`.
  - Pasang polling ringan (misal 30-60 detik) dengan pengecekan `document.visibilityState === 'visible'`.
  - Bersihkan interval dan batalkan request via `AbortController` pada cleanup `useEffect`.
  - Implementasikan aksi optimistik atau re-fetch otomatis pada `markAsRead`, `markAllAsRead`, dan `deleteNotification`.

- [ ] **Step 2: Buat consumer hook di `frontend/src/hooks/useNotifications.ts`**
  - Sediakan hook `useNotifications()` yang melempar error deskriptif jika dipanggil di luar `NotificationProvider`.
  - Ekspor hook melalui `frontend/src/hooks/index.ts`.

- [ ] **Step 3: Uji kompilasi frontend**
  ```bash
  npm.cmd --prefix frontend run build
  ```
  Expected: Build lulus tanpa warning/error TypeScript.

- [ ] **Step 4: Commit context & hook**
  ```bash
  git add frontend/src/contexts/NotificationContext.tsx frontend/src/hooks/useNotifications.ts frontend/src/hooks/index.ts
  git commit -m "feat(frontend): implement NotificationContext and useNotifications hook"
  ```

---

### Task 4: Mounting Provider di Router & Integrasi Topbar

**Files:**
- Modify: `frontend/src/router/index.tsx`
- Modify: `frontend/src/components/organisms/DashboardTopbar.tsx`
- Modify: `frontend/src/components/organisms/NotificationDropdown.tsx`
- Modify: `frontend/src/components/organisms/PpTopbar.tsx`

**Interfaces:**
- Consumes: `NotificationProvider`, `useNotifications()`.

- [ ] **Step 1: Pasang `NotificationProvider` di `frontend/src/router/index.tsx`**
  Bungkus seluruh rute yang berada di dalam `<ProtectedRoute>` dengan `<NotificationProvider>` agar state notifikasi hidup di seluruh layout terotentikasi.

- [ ] **Step 2: Hubungkan `DashboardTopbar.tsx` dengan `useNotifications`**
  - Ganti state lokal `unreadCount` di `DashboardTopbar` dengan `unreadCount` dari `useNotifications()`.
  - Hapus pemanggilan API mandiri di dalam `DashboardTopbar`.

- [ ] **Step 3: Hubungkan `PpTopbar.tsx` dengan `useNotifications`**
  - Buat `PpTopbar` membaca data default `unreadCount` dan `recentNotifications` dari context jika props tidak di-supply secara spesifik.
  - Hubungkan trigger badge dan dropdown.

- [ ] **Step 4: Sempurnakan `NotificationDropdown.tsx`**
  - Gunakan aksi `markAllAsRead`, `markAsRead`, dan data `recentNotifications`/`unreadCount` dari context.
  - Komponen murni render presentasi dan aksi memanggil handler context.

- [ ] **Step 5: Verifikasi build frontend**
  ```bash
  npm.cmd --prefix frontend run build
  ```
  Expected: Build sukses.

- [ ] **Step 6: Commit integrasi Topbar & Router**
  ```bash
  git add frontend/src/router/index.tsx frontend/src/components/organisms/DashboardTopbar.tsx frontend/src/components/organisms/NotificationDropdown.tsx frontend/src/components/organisms/PpTopbar.tsx
  git commit -m "feat(frontend): mount NotificationProvider in protected routes and integrate topbars"
  ```

---

### Task 5: Refactoring Layout & Halaman Notifikasi Penuh

**Files:**
- Modify: `frontend/src/components/templates/PpLayout.tsx`
- Modify: `frontend/src/pages/Pp/Notifikasi/Index.tsx`
- Modify: `frontend/src/pages/Perencanaan/Notifikasi/Index.tsx`
- Modify: `frontend/src/pages/Ppk/Notifikasi/Index.tsx`

**Interfaces:**
- Consumes: `useNotifications()` untuk sinkronisasi daftar lengkap notifikasi, tab change, mark read, dan delete.

- [ ] **Step 1: Bersihkan kebutuhan prop-drilling di `PpLayout.tsx`**
  - `PpLayout` memanfaatkan `useNotifications()` untuk mengisi `notifications` dan `unreadCount` ke `PpTopbar` secara otomatis.
  - Halaman-halaman dashboard tidak lagi wajib mem-passing props `recentNotifications` atau `unreadNotificationsCount`.

- [ ] **Step 2: Refactor `frontend/src/pages/Pp/Notifikasi/Index.tsx`**
  - Gunakan `useNotifications()` untuk sinkronisasi list `notifications`, `activeTab`, `setActiveTab`, `markOneRead`, dan `markAllRead`.
  - Tambahkan tombol/aksi hapus notifikasi yang memanggil `deleteNotification(id)`.

- [ ] **Step 3: Verifikasi halaman turunan (`PerencanaanNotifikasiIndex`, `PpkNotifikasiIndex`)**
  - Pastikan halaman turunan mewarisi integrasi context dengan mulus.

- [ ] **Step 4: Verifikasi build frontend**
  ```bash
  npm.cmd --prefix frontend run build
  ```
  Expected: Build sukses dalam < 2 detik.

- [ ] **Step 5: Commit refactoring layout & halaman**
  ```bash
  git add frontend/src/components/templates/PpLayout.tsx frontend/src/pages/Pp/Notifikasi/Index.tsx frontend/src/pages/Perencanaan/Notifikasi/Index.tsx frontend/src/pages/Ppk/Notifikasi/Index.tsx
  git commit -m "refactor(frontend): refactor layout and notification pages to consume NotificationContext"
  ```

---

### Task 6: Comprehensive Testing, Quality Gates & Verification

**Files:**
- Test: `backend/tests/Feature/NotificationApiTest.php`
- Test: `backend/tests/Unit/Services/NotificationServiceTest.php`

- [ ] **Step 1: Jalankan seluruh test suite backend PHPUnit**
  ```bash
  php backend/vendor/bin/phpunit -c backend/phpunit.xml
  ```
  Expected: Seluruh test (minimal 93 tests) berstatus passed dengan 0 failures.

- [ ] **Step 2: Jalankan linter dan code formatter Laravel Pint**
  ```bash
  php backend/vendor/bin/pint --format agent
  ```
  Expected: Semua file backend bersih dan terformat rapi.

- [ ] **Step 3: Jalankan kompilasi produksi frontend**
  ```bash
  npm.cmd --prefix frontend run build
  ```
  Expected: Output bundle Vite sukses tanpa error TypeScript.

- [ ] **Step 4: Commit hasil verifikasi akhir (jika ada perbaikan format)**
  ```bash
  git status
  ```
  Expected: Working tree clean.

---

## Self-Review Checklist
- [x] **Spec coverage**: Mencakup `NotificationProvider`, `useNotifications`, integrasi Topbar, halaman Notifikasi, `SIPBAJA_API.postman_collection.json`, `SIPBAJA_Local.postman_environment.json`, dan `docs/API_CONTRACT.md`.
- [x] **Atomic design compliance**: Presentational components tidak memanggil API langsung, data disediakan melalui hook/context.
- [x] **No Duplicate Fetch**: Summary/unread diambil terpusat di Provider, bukan berkali-kali di setiap topbar.
- [x] **Cleanup lifecycle**: AbortController dan interval polling dibersihkan dengan benar saat unmount.

