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
| Frontend | React + Inertia.js + Tailwind CSS |
| DB (development) | SQLite |
| DB (production target) | PostgreSQL 18 |

Rules:
- Do NOT add any package or library without user approval.
- Do NOT use PostgreSQL-specific features (JSONB operators, arrays, DB triggers, etc.). Migrations and queries must run on both SQLite and PostgreSQL.
- Design system is not decided yet. Use plain Tailwind utilities only.

---

## 3. Database

- The database design is defined in the database design `.md` file in this workspace.
- That file is the single source of truth. Follow it exactly.
- Do NOT change tables, columns, or relations on your own. If the design looks wrong or incomplete: STOP and ask.
- Every schema change = a NEW migration. Never edit an old migration.

---

## 4. Architecture: Service Layer (mandatory)

Business logic lives ONLY in Service classes. No exceptions, including authentication.

Request flow:

```
React Page (Inertia)  ->  Controller  ->  Service  ->  Model
```

What belongs where:
- Controllers handle only: input, validation call, calling a Service, returning the Inertia response/redirect.
- ALL business logic and ALL write queries live in Service classes.
- Controllers must NOT contain business logic or direct Eloquent queries. A controller method that decides, calculates, or queries beyond reading for display is a violation.
- This pattern applies to EVERY feature, without exception.

Rules:
- Controllers handle only: input, validation call, calling a Service, returning the Inertia response/redirect.
- ALL business logic and ALL write queries live in Service classes.
- Controllers must NOT contain business logic or direct Eloquent queries.
- One Service per domain, located in `app/Services/`.
  Examples: `AuthService`, `PermohonanService`, `PengadaanService`, `KontrakService`, `PembayaranService`, `RencanaPembayaranService`.
- A Service method that writes to more than one table MUST use a DB transaction.
- Services must not depend on Request or session objects. Pass plain data (arrays, DTOs, models) as parameters.
- Validation: Form Request. Authorization: Policy/Gate per role.
- Every inbound data MUST use a dedicated Form Request class in `app/Http/Requests/` so input is structured. Name PascalCase with `Request` suffix (example `SimpanPermohonanRequest`). Controllers only call the Request validation, then pass `validated()` to the Service. Services must NEVER read raw input. `authorize()` enforces the Policy/Gate per role. `rules()` and `messages()` use Bahasa Indonesia.
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

Exceptions (do NOT use PascalCase or camelCase here):
- Database table and column names: snake_case (follow the database design file)
- Blade / Livewire view files: kebab-case
- Route URIs and route names: kebab-case / dot notation
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

---

## 8. Workflow

1. Read this file and the database design file.
2. Do ONE small task at a time. Stay inside its scope.
3. Run tests and the code formatter after finishing.
4. Report: files changed, what was done, and every assumption made.
5. If blocked or unsure: stop and ask. Do not guess.

---

## 9. Not Decided Yet (ask the user, do not decide yourself)

- Folder structure beyond `app/Services/` (frontend structure is decided: components in Section 10, hooks/utils in Section 11)
- Design system / UI component library
- Testing strategy
- Commit message format

---

## 10. Frontend: Atomic Design (React + Inertia)

- Hierarchy satu arah: atoms → molecules → organisms → templates → pages.
- Lokasi: `resources/js/components/atoms/`, `molecules/`, `organisms/`, `templates/`; pages di `resources/js/Pages/`.
- Pages hanya perekat: panggil hook/util (Section 11), teruskan hasil ke satu template lewat props. Tanpa fetch. State yang dipakai lebih dari satu bagian wajib hidup di page.
- Atoms presentational saja. Props eksplisit. Tanpa global state. Tanpa fetch.
- Molecules gabung atoms. Organisms gabung molecules. Templates atur layout. Pages pilih template + copy.
- Layer boleh dilewati bila tidak ada yang dikelompokkan; arah tetap satu arah.
- Cek komponen existing sebelum buat baru.
- Styling: plain Tailwind utilities saja. Design system belum diputuskan.
- Tanpa business logic di komponen React. Normalisasi, format, dan mapping pindah ke hook/util (Section 11); template hanya render props.
- Error pages: tiap `Pages/Errors/*.jsx` render `ErrorTemplate` bersama dengan `{status, title, message}`.

---

## 11. Pemisahan Logic dari Tampilan

- Template/komponen UI murni presentasi: dilarang `useState` untuk data bisnis, filter, sort, kalkulasi, normalisasi, atau fetch; yang boleh hanya state UI lokal murni (buka/tutup dropdown, tab aktif); terima semua data dan handler lewat props.
  - Salah: `AdminDashboardTemplate` menyimpan `searchQuery` dan menghitung `filteredUsers` di dalam template.
  - Benar: template terima `searchQuery`, `onSearchChange`, dan `users` yang sudah difilter lewat props.
- Logic stateful (search, filter, sort, pagination) wajib di custom hook di `resources/js/hooks/use<Nama>.js`, pakai `useMemo` untuk hasil turunan, return object `{ state, setter, hasilTurunan }`.
  - Salah: filter `recentUsers` inline di body template.
  - Benar: `const { query, setQuery, filteredUsers } = useUserSearch(recentUsers)` dipanggil di page, hasilnya dioper ke template.
- Logic murni (normalisasi, format, mapping) wajib di util `resources/js/utils/<nama>.js` sebagai fungsi murni tanpa efek samping agar mudah dites.
  - Salah: `stats.totalPengguna ?? stats.total_pengguna ?? 128` tersebar di template.
  - Benar: `normalizeAdminStats(stats)` di util, template hanya render `stats.totalPengguna`.
- Normalisasi format API (camelCase vs snake_case) diutamakan di layer API/controller/resource; komponen hanya terima satu format.
  - Salah: template membaca dua format (`stats.totalPengguna ?? stats.total_pengguna`).
  - Benar: backend kirim satu format, atau satu fungsi normalisasi di page/util sebelum props diteruskan.
- Dilarang default data palsu: pakai `0` / `null` / `[]`, sediakan prop `isLoading`, tampilkan skeleton atau `"-"`.
  - Salah: `const totalPengguna = stats.totalPengguna ?? 128`.
  - Benar: `const totalPengguna = stats.totalPengguna ?? 0` + `{isLoading ? <Skeleton /> : totalPengguna}`.
- Page/container adalah perekat: panggil hook dan util, oper hasil ke template lewat props; state yang dipakai lebih dari satu bagian (contoh search di topbar + tabel) wajib hidup di page, bukan di template.
  - Salah: `searchQuery` hidup di `AdminDashboardTemplate` lalu dipakai topbar dan tabel di dalamnya.
  - Benar: `Pages/Admin/Dashboard.jsx` panggil `useUserSearch`, teruskan `searchQuery` / `onSearchChange` / `filteredUsers` ke template.
- Checklist sebelum commit: template tanpa `useState` bisnis/filter? tidak ada angka/data hardcode palsu? hook dan util bisa dites terpisah?
