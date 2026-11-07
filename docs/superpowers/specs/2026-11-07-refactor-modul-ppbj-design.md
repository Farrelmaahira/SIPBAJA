# Spesifikasi Desain: Refaktorisasi & Standardisasi Modul PPBJ

Tanggal: 2026-11-07
Penulis: Antigravity Assistant & Tim Pengembang SIPBAJA
Status: Approved

---

## 1. Latar Belakang & Tujuan
Modul PPBJ (Pengelola Pengadaan Barang dan Jasa) pada aplikasi SIPBAJA saat ini masih menggunakan pola legacy pada beberapa komponen frontend (menggunakan `DashboardShellTemplate` lama alih-alih `AppLayout`, kode HTML hardcoded alih-alih `HeroBanner`, belum menggunakan `DokumenListCard`, ketiadaan service module frontend, dan penggunaan tipe `any`). Di sisi backend, response detail permohonan belum menyertakan konteks pemecahan paket (`splitContext`) dan beberapa aksi mutasi belum menggunakan Form Request terdedikasi sesuai aturan arsitektur di `docs/DEVELOPMENT_RULES.md`.

Tujuan dari refaktorisasi ini adalah:
1. Memastikan kode backend mematuhi aturan Controller, Service Layer berbasis domain, dan Form Request (Aturan 4 & 4.3).
2. Memastikan frontend mengadopsi komponen-komponen bersama (*reusable atomic/shared components*) yang sudah digunakan oleh aktor lain (`AppLayout`, `HeroBanner`, `DokumenListCard`, `SearchBar`, `StatusPill`).
3. Mengabstraksikan semua panggilan API PPBJ ke dalam service module frontend (`frontend/src/services/ppbjService.ts`) dengan penanganan `AbortController` (Aturan 11.2 & 11.4).
4. Menghilangkan tipe `any` dengan mendefinisikan interface TypeScript yang kuat di `frontend/src/types/ppbj.ts`.

---

## 2. Arsitektur & Desain Backend

### 2.1 Endpoint & Controller (`backend/app/Http/Controllers/PPBJ/`)
- **`DashboardPpbjController`**: Tetap memanggil `PpbjDashboardService::getDashboardData()`.
- **`PermohonanController`**:
  - `index()`: Mengembalikan daftar permohonan status `disetujui` / `diproses_ppbj` via `PermohonanService::getPermohonanPpbjList()`.
  - `show(string $id)`: Mengambil detail permohonan dari `PermohonanService::getPermohonanDetail((int) $id)` DAN menggabungkan konteks pemecahan paket dari `PengadaanService::getSplitContext((int) $id)`:
    ```php
    $detail = $this->permohonanService->getPermohonanDetail((int) $id);
    $splitContext = $this->pengadaanService->getSplitContext((int) $id);
    return response()->json([
        'permohonan' => array_merge($detail, $splitContext),
    ]);
    ```
  - `storeDraft(StoreDraftPengadaanRequest $request, string $id)`: Menyimpan draft paket pengadaan via `PengadaanService::simpanDraftPengadaan()`.
  - `destroyDraft(HapusDraftPengadaanRequest $request, string $id)`: Menghapus draft paket via `PengadaanService::hapusDraftPengadaan()`. Mengembalikan response 204 No Content.
  - `submitReviewer(SubmitPengadaanReviewerRequest $request, string $id)`: Mengirim paket ke reviewer dan mengunci permohonan via `PengadaanService::submitKeReviewer()`. Mengembalikan response 200 JSON `{ "message": "..." }`.

### 2.2 Form Request (`backend/app/Http/Requests/PPBJ/`)
- `StoreDraftPengadaanRequest.php`: Sudah ada, validasi array `items` paket pengadaan.
- `HapusDraftPengadaanRequest.php`: Validasi otorisasi peran PPBJ untuk menghapus draft pengadaan.
- `SubmitPengadaanReviewerRequest.php`: Validasi otorisasi peran PPBJ untuk submit permohonan ke reviewer.

---

## 3. Arsitektur & Desain Frontend

### 3.1 Type Definitions (`frontend/src/types/ppbj.ts`)
Mendefinisikan tipe data spesifik modul PPBJ:
- `PpbjStatItem`: `{ label: string, value: number | string, unit: string, variant?: string }`
- `PpbjPermohonanItem`: Metadata usulan pengadaan di dashboard / list.
- `PpbjPengadaanItem`: Metadata paket pengadaan berjalan.
- `PpbjTerminItem`: Metadata termin kontrak siap bayar.
- `PpbjDashboardData`: `{ stats: PpbjStatItem[], permohonanMasuk: PpbjPermohonanItem[], pengadaanBerjalan: PpbjPengadaanItem[], terminKontrak: PpbjTerminItem[] }`
- `PpbjPermohonanDetail`: Detail permohonan + context split pengadaan (`bisaDipecah`, `sudahDikunci`, `sisaAnggaran`, `totalNominalPaket`, `availableMak`, `referenceData`, `dokumenList`).

### 3.2 Service Module (`frontend/src/services/ppbjService.ts`)
Mengabstraksikan seluruh komunikasi HTTP PPBJ dengan `api.ts`:
- `getDashboard(signal?: AbortSignal): Promise<PpbjDashboardData>`
- `getPermohonanList(signal?: AbortSignal): Promise<PpbjPermohonanItem[]>`
- `getPermohonanDetail(id: number | string, signal?: AbortSignal): Promise<PpbjPermohonanDetail>`
- `storeDraftPengadaan(id: number | string, data: FormData | object): Promise<ApiMessageResponse>`
- `destroyDraftPengadaan(paketId: number | string): Promise<void>`
- `submitReviewer(id: number | string): Promise<ApiMessageResponse>`

### 3.3 Adopsi Komponen Bersama & Template
1. **Navigasi & Layout (`AppLayout`)**:
   - `PPBJ_NAV_ITEMS`:
     - Dashboard (`/ppbj/dashboard`)
     - Pengajuan Permohonan (`/ppbj/permohonan`)
   - `roleInitials="PB"`, `roleTitle="PPBJ"`, `roleSubtitle="Pengadaan Barang & Jasa"`.
   - Menggantikan ketergantungan pada `DashboardShellTemplate`.
2. **Dashboard (`frontend/src/pages/Ppbj/Dashboard.tsx` & `PpbjDashboardTemplate.tsx`)**:
   - Menggunakan `HeroBanner` dengan prop `eyebrow="DASHBOARD PPBJ"`, `title="Selamat datang, {nama}"`.
   - Menggunakan `StatCard` untuk metrik statistik.
   - Menyempurnakan `PpbjTabbedTable` agar tab switch (*Permohonan Masuk*, *Pengadaan Berjalan*, *Termin Kontrak*), badge counts, dan `SearchBar` ter-render aktif.
3. **List Permohonan (`frontend/src/pages/Ppbj/Permohonan/Index.tsx` & `PermohonanIndexTemplate.tsx`)**:
   - Terintegrasi dengan `AppLayout`.
   - Menampilkan tabel usulan pengadaan dengan `StatusPill`, pencarian `SearchBar`, dan aksi tombol *Paketkan* menuju `Show.tsx`.
4. **Detail Permohonan (`frontend/src/pages/Ppbj/Permohonan/Show.tsx` & `PermohonanShowTemplate.tsx`)**:
   - Terintegrasi dengan `AppLayout`.
   - Mengadopsi `DokumenListCard` untuk preview surat permohonan pemohon dengan live preview PDF iframe dan tombol download resmi.
   - Menggunakan `PengadaanSplitForm` yang terisi otomatis dengan opsi MAK dan referensi jenis/metode/level dari backend.
   - Penanganan flash success/error dan tombol submit ke reviewer dengan konfirmasi modal.

---

## 4. Rencana Pengujian
1. **Backend**:
   - Feature Test: `backend/tests/Feature/PPBJ/PermohonanControllerTest.php` menguji seluruh endpoint PPBJ (`dashboard`, `permohonan.index`, `permohonan.show` beserta `splitContext`, `storeDraft`, `destroyDraft`, `submitReviewer`).
   - Feature Test existing (`PengadaanServiceTest`, `PermohonanServiceTest`) tetap 100% lulus.
   - Code style: `vendor/bin/pint --format agent` wajib lolos.
2. **Frontend**:
   - TypeScript check & bundle: `npm.cmd run build` (`tsc -b && vite build`) wajib berhasil tanpa peringatan tipe atau `any`.

