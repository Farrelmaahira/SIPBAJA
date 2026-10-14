# Admin Dashboard UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun antarmuka (UI) Dashboard Admin pada SIPBAJA yang presisi mengikuti panduan desain [docs/design.md](file:///d:/Farrel/PROJECTS/sipbaja/docs/design.md) dan referensi visual [docs/design/dashboard.png](file:///d:/Farrel/PROJECTS/sipbaja/docs/design/dashboard.png), dengan arsitektur Atomic Design serta kepatuhan penuh pada aturan `antislop-ui` dan `antislop-code`.

**Architecture:** Frontend React 19 dengan Inertia.js dan Tailwind CSS v4, terstruktur ke dalam hierarki Atomic Design satu arah (`atoms -> molecules -> organisms -> templates -> pages`). Halaman `Pages/Admin/Dashboard.jsx` murni bertugas mem-pass props ke `AdminDashboardTemplate` tanpa business logic.

**Tech Stack:** React 19, Inertia.js, Tailwind CSS v4, Laravel 13 (routing & page delivery).

**Spec:** [docs/design.md](file:///d:/Farrel/PROJECTS/sipbaja/docs/design.md), [docs/DEVELOPMENT_RULES.md](file:///d:/Farrel/PROJECTS/sipbaja/docs/DEVELOPMENT_RULES.md), referensi gambar [docs/design/dashboard.png](file:///d:/Farrel/PROJECTS/sipbaja/docs/design/dashboard.png).

## Global Constraints

- Menggunakan utilitas Tailwind CSS murni, tanpa dependensi icon library eksternal (icon dibuat sebagai komponen atom SVG inline dengan style Lucide: 2px stroke, round caps/joins).
- Desain warna strictly mengacu pada `docs/design.md`:
  - Canvas: `#F3F6F5`
  - Brand: `#0E7C5A`, Brand Dark: `#0A5C43`, Brand Mint: `#7FE0B8`
  - Surface: `#FFFFFF`, Surface Tint: `#EAF5F1`, Surface Table Head: `#F1F7F4`, Surface Input: `#F7FAF9`, Surface Chip: `#EEF5F2`
  - Border: `#E4EBE8`
  - Teks: Primary `#14201C`, Secondary `#5F6F6A`, Muted `#8A9A95`
  - Shadow dasar hijau lembut: `rgba(13, 51, 38, a)`
- Aturan `antislop-ui` (Mode 1: DURING):
  - R-02: Dilarang menggunakan karakter em dash (`—`) pada copy UI. Gunakan tanda koma, titik dua, atau tanda kurung.
  - R-03: Responsif sempurna dari layar mobile (<768px), tablet (768–1023px), hingga desktop (≥1024px). Minimum tap target 44px pada layar sentuh. Bebas horizontal overflow.
  - R-11: Variasi radius konsisten (10 chip, 12 button/input/nav, 14 CTA, 16 icon box/help card, 18 stat card, 20 table card, 24 hero, 999 pill).
  - R-25: Kontras warna teks memenuhi standar WCAG AA.
  - R-26: Elemen interaktif fungsional (drawer mobile dapat dibuka/tutup, dropdown profile interaktif, search bar memiliki state aktif).
  - R-27: Menyediakan empty state jika daftar pengguna kosong.
- Aturan `antislop-code`:
  - Tidak ada komentar dekoratif seperti `// ===============`.
  - Tidak ada narasi baris demi baris (`// step 1...`).
  - Komentar hanya berupa penjelasan singkat (1-2 baris) pada keputusan struktur atau styling non-obvious.

## Review Focus

1. **Akurasi Visual terhadap `dashboard.png`:** Warna solid hijau `#0E7C5A` pada banner hero dengan 2 lingkaran dekoratif transparan putih, 3 stat card proporsional, serta tabel dengan header abu-hijau pucat `#F1F7F4`.
2. **Kesesuaian Peran Admin:** Copy dan konten disesuaikan untuk kebutuhan Admin (kelola akun pengguna, unit kerja, MAK) bukan permohonan unit.
3. **Respon Mobile (<768px):** Sidebar 272px bertransformasi menjadi off-canvas drawer dengan backdrop gelap, stat cards reflow ke 1 kolom, dan tabel dapat di-scroll horizontal tanpa merusak canvas halaman.
4. **Kepatuhan Aturan Anti-Slop (No Em Dash & No Dead Links):** Seluruh string teks UI berbahasa Indonesia bersih dari karakter em dash dan link navigasi mengarah ke rute yang valid.
5. **Kerapian Atomic Design:** Komponen berada di layer folder yang benar (`atoms/`, `molecules/`, `organisms/`, `templates/`, `Pages/`) dan tidak ada props drilling yang menyimpang dari hierarki satu arah.

---

### Task 1: Route Setup & Dummy Data Wiring

**Files:**
- Modify: `routes/web.php`
- Create: `resources/js/Pages/Admin/Dashboard.jsx` (initial placeholder)

**Interfaces:**
- Route: `GET /admin/dashboard` mengembalikan render Inertia `Admin/Dashboard` dengan mock props:
  ```json
  {
    "stats": [
      { "label": "Total Pengguna", "value": 24, "unit": "Akun", "variant": "primary" },
      { "label": "Unit Terdaftar", "value": 8, "unit": "Unit", "variant": "info" },
      { "label": "MAK Aktif", "value": 4, "unit": "MAK", "variant": "success" }
    ],
    "recentUsers": [
      { "id": 1, "nama": "Dr. Ahmad Farhan", "email": "farhan@pnj.ac.id", "role": "Perencanaan", "unit": "Pusat Perencanaan", "status": "aktif", "tanggal": "14 Mei 2026" },
      { "id": 2, "nama": "Siti Nurhaliza, M.T.", "email": "siti@pnj.ac.id", "role": "Pemohon", "unit": "Teknik Informatika", "status": "aktif", "tanggal": "14 Mei 2026" },
      { "id": 3, "nama": "Bambang Sudarsono", "email": "bambang@pnj.ac.id", "role": "PPK", "unit": "Pengadaan Kampus", "status": "aktif", "tanggal": "13 Mei 2026" },
      { "id": 4, "nama": "Rina Marlina, S.E.", "email": "rina@pnj.ac.id", "role": "Keuangan", "unit": "Bagian Keuangan", "status": "nonaktif", "tanggal": "10 Mei 2026" }
    ]
  }
  ```

- [x] **Step 1: Tambahkan rute `/admin/dashboard` di `routes/web.php`**
- [x] **Step 2: Buat file halaman `resources/js/Pages/Admin/Dashboard.jsx` minimal**
- [x] **Step 3: Uji rute via browser/request assertion**
- [x] **Step 4: Commit Task 1**

```bash
git add routes/web.php resources/js/Pages/Admin/Dashboard.jsx
git commit -m "feat(admin-ui): register admin dashboard route and initial page scaffold"
```

---

### Task 2: Atoms (SVG Icons, StatusPill, Button & IconButton)

**Files:**
- Create: `resources/js/components/atoms/icons/DashboardIcon.jsx`
- Create: `resources/js/components/atoms/icons/UsersIcon.jsx`
- Create: `resources/js/components/atoms/icons/BuildingIcon.jsx`
- Create: `resources/js/components/atoms/icons/LayersIcon.jsx`
- Create: `resources/js/components/atoms/icons/SearchIcon.jsx`
- Create: `resources/js/components/atoms/icons/BellIcon.jsx`
- Create: `resources/js/components/atoms/icons/PlusIcon.jsx`
- Create: `resources/js/components/atoms/icons/ArrowRightIcon.jsx`
- Create: `resources/js/components/atoms/icons/MenuIcon.jsx`
- Create: `resources/js/components/atoms/icons/XIcon.jsx`
- Create: `resources/js/components/atoms/icons/EyeIcon.jsx`
- Create: `resources/js/components/atoms/icons/ChevronDownIcon.jsx`
- Create: `resources/js/components/atoms/StatusPill.jsx`
- Create: `resources/js/components/atoms/PrimaryButton.jsx`
- Create: `resources/js/components/atoms/IconButton.jsx`

**Interfaces:**
- `StatusPill`: `{ status: 'aktif' | 'nonaktif' | 'pending', label?: string }`
  - 'aktif': bg `#E4F6EC`, text `#0B7A4E`, dot `#12A06B`
  - 'nonaktif': bg `#FDECEC`, text `#B42318`, dot `#E5484D`
  - 'pending': bg `#E8F0FF`, text `#1F55C7`, dot `#2F6FED`
- `PrimaryButton`: `{ children, onClick, type, className, icon: Component }`
- `IconButton`: `{ children, onClick, ariaLabel, className }`

- [x] **Step 1: Buat komponen icon atoms (SVG 2px stroke, clean Lucide line style)**
- [x] **Step 2: Buat `StatusPill.jsx` dengan dot 7px dan teks Semibold 12px**
- [x] **Step 3: Buat `PrimaryButton.jsx` dan `IconButton.jsx` dengan tap target minimal 44px**
- [x] **Step 4: Jalankan build test `npm run build`**
- [x] **Step 5: Commit Task 2**

```bash
git add resources/js/components/atoms/
git commit -m "feat(admin-ui): create atomic UI components (icons, StatusPill, buttons)"
```

---

### Task 3: Molecules (ProfilePill, SearchBar, HelpCard, StatCard, NavItem)

**Files:**
- Create: `resources/js/components/molecules/ProfilePill.jsx`
- Create: `resources/js/components/molecules/SearchBar.jsx`
- Create: `resources/js/components/molecules/HelpCard.jsx`
- Create: `resources/js/components/molecules/StatCard.jsx`
- Create: `resources/js/components/molecules/SidebarNavItem.jsx`

**Interfaces:**
- `ProfilePill`: Menampilkan avatar lingkaran 40px berlatar `#D6EFE4`, inisial nama Bold 14px `#0E7C5A`, nama admin SemiBold 14px `#14201C`, sub-label 11px `#8A9A95`, dan chevron.
- `SearchBar`: Input field berlatar `#F7FAF9` dengan border `#E4EBE8`, icon pencarian 18px `#8A9A95`, placeholder 14px "Cari data pengguna...".
- `HelpCard`: Card kotak berlatar `#EAF5F1`, radius 16px, dengan judul SemiBold 13px `#0A5C43` dan teks panduan 12px `#5F6F6A`.
- `StatCard`: Card berlatar putih dengan border `#E4EBE8`, radius 18px, icon box 56x56 radius 16px dengan warna status, angka statistik Bold 34px, label 13px Medium, dan unit 13px.
- `SidebarNavItem`: Item navigasi padding 12x16 radius 12px dengan icon 20px dan teks 14px. State aktif berlatar `#0E7C5A` dengan teks & icon putih.

- [x] **Step 1: Implementasikan `SidebarNavItem.jsx` dan `HelpCard.jsx`**
- [x] **Step 2: Implementasikan `StatCard.jsx` dengan varian ikon dan warna token**
- [x] **Step 3: Implementasikan `SearchBar.jsx` dan `ProfilePill.jsx`**
- [x] **Step 4: Jalankan build test `npm run build`**
- [x] **Step 5: Commit Task 3**

```bash
git add resources/js/components/molecules/
git commit -m "feat(admin-ui): build dashboard molecules (StatCard, ProfilePill, SearchBar, NavItem)"
```

---

### Task 4: Organisms (AdminSidebar, AdminTopbar, HeroBanner, RecentUsersTable)

**Files:**
- Create: `resources/js/components/organisms/AdminSidebar.jsx`
- Create: `resources/js/components/organisms/AdminTopbar.jsx`
- Create: `resources/js/components/organisms/HeroBanner.jsx`
- Create: `resources/js/components/organisms/RecentUsersTable.jsx`

**Interfaces:**
- `AdminSidebar`:
  - Brand header dengan logo tile rounded square `#0E7C5A`, kubus paket isometrik, dan wordmark SIPBAJA.
  - Section label: "MANAJEMEN SISTEM" (uppercase tracking +1.1 11px).
  - Nav list: Dashboard (aktif), Pengguna, Unit Kerja, Master MAK.
  - Help card di bagian bawah sidebar.
  - Responsive off-canvas drawer untuk tampilan layar <768px.
- `AdminTopbar`:
  - Tombol hamburger menu (hanya muncul di layar mobile/tablet).
  - Search bar input.
  - Notification icon button dengan badge dot merah 10px `#E5484D`.
  - Profile pill admin.
- `HeroBanner`:
  - Tinggi 148px, radius 24px, warna solid `#0E7C5A`, shadow halus.
  - 2 lingkaran dekoratif transparan putih di sudut kanan (260px & 170px).
  - Eyebrow: "DASHBOARD ADMINISTRATOR" (uppercase white 75%).
  - Judul: "Selamat datang, [Nama Pengguna]".
  - Subtitle: "Kelola akun pengguna, unit kerja, dan konfigurasi master data pengadaan."
  - CTA putih: tombol "Tambah Pengguna" dengan ikon plus hijau.
- `RecentUsersTable`:
  - Card putih radius 20px dengan border `#E4EBE8`.
  - Header tabel `#F1F7F4` teks uppercase 11px: NAMA & EMAIL, PERAN, UNIT KERJA, STATUS, AKSI.
  - Baris data tinggi 68px, hover `#F7FAF9`, icon chip pengguna, status pill, tombol detail (eye icon).
  - Empty state ramah jika daftar pengguna kosong.
  - Footer kartu dengan text link "Lihat Semua Pengguna →" `#0E7C5A`.

- [x] **Step 1: Implementasikan `AdminSidebar.jsx` lengkap dengan kontrol drawer mobile**
- [x] **Step 2: Implementasikan `AdminTopbar.jsx`**
- [x] **Step 3: Implementasikan `HeroBanner.jsx` presisi mengikuti `docs/design/dashboard.png`**
- [x] **Step 4: Implementasikan `RecentUsersTable.jsx` dengan data rows dan empty state**
- [x] **Step 5: Jalankan build test `npm run build`**
- [x] **Step 6: Commit Task 4**

```bash
git add resources/js/components/organisms/
git commit -m "feat(admin-ui): create dashboard organisms (Sidebar, Topbar, HeroBanner, Table)"
```

---

### Task 5: Template & Page Assembly (`AdminDashboardTemplate` & `Dashboard.jsx`)

**Files:**
- Create: `resources/js/components/templates/AdminDashboardTemplate.jsx`
- Modify: `resources/js/Pages/Admin/Dashboard.jsx`

**Interfaces:**
- `AdminDashboardTemplate`:
  - Menerima props `{ stats, recentUsers, user, activeRoute, onAddUser, onSearch }`.
  - Struktur layout: sidebar fixed 272px di desktop, main content dengan background `#F3F6F5`, padding 28px vertikal / 40px horizontal.
  - Susunan vertikal (gap 28px): Topbar -> HeroBanner -> 3 Kolom Stat Cards -> RecentUsersTable.
  - State lokal untuk membuka dan menutup mobile drawer.
- `Dashboard.jsx`:
  - Menerima props dari Inertia: `{ auth, stats, recentUsers }`.
  - Me-render `AdminDashboardTemplate` secara deklaratif.

- [x] **Step 1: Buat `AdminDashboardTemplate.jsx` dengan layout grid dan responsive handling**
- [x] **Step 2: Sambungkan `resources/js/Pages/Admin/Dashboard.jsx` dengan template**
- [x] **Step 3: Jalankan Vite build `npm run build` dan pastikan manifest terbit tanpa error**
- [x] **Step 4: Commit Task 5**

```bash
git add resources/js/components/templates/ resources/js/Pages/Admin/Dashboard.jsx
git commit -m "feat(admin-ui): assemble AdminDashboardTemplate and connect to Admin/Dashboard page"
```

---

### Task 6: Visual & Anti-Slop Quality Gate Audit

**Files:**
- Verification & code hygiene audit across all created files

- [x] **Step 1: Audit Copywriting Anti-Slop (R-02)**
  - Pastikan tidak ada karakter em dash (`—`) di seluruh teks antarmuka.
  - Pastikan seluruh UI copy dalam Bahasa Indonesia sentence case.
- [x] **Step 2: Audit Responsive & Accessibility (R-03, R-25, R-32)**
  - Pastikan mobile menu drawer dapat dibuka dan ditutup dengan tombol `Escape` atau klik backdrop.
  - Verifikasi kontras warna teks pada status pill dan card.
  - Verifikasi minimum tap target 44px pada elemen tombol di layar sentuh.
- [x] **Step 3: Audit Hygiene Komentar Kode (`antislop-code`)**
  - Pastikan tidak ada banner karakter berulang `// =========`, emoji dekoratif, atau narasi baris per baris di seluruh file `.jsx`.
- [x] **Step 4: Jalankan `npm run build` dan `vendor/bin/pint --dirty --format agent`**
- [x] **Step 5: Commit final hasil verifikasi**

```bash
git add -A
git commit -m "chore(admin-ui): verify responsive layout, antislop standards, and build bundle"
```
