# Perencanaan Pengajuan Show Atomic Design & Clean Architecture Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merefaktor halaman detail pengajuan perencanaan (`frontend/src/pages/Perencanaan/Pengajuan/Show.tsx`) agar 100% mematuhi aturan arsitektur, Atomic Design, dan larangan *fake default data* pada `docs/DEVELOPMENT_RULES.md`.

**Architecture:** Memisahkan kode monolitik `Show.tsx` (677 baris) ke dalam arsitektur bertingkat: Service Module (`perencanaanService.ts`) untuk interaksi HTTP terisolasi, strict TypeScript types (`perencanaan.ts`), Organisms mandiri (`PerencanaanVerifikasiMakCard.tsx`, penggunaan ulang `StatusPill.tsx`), Template presentasional murni (`PerencanaanPengajuanShowTemplate.tsx`) yang menangani layout dan skeleton loading, serta Page tipis (`Show.tsx`) sebagai lem (*glue*) orkestrator state dan router.

**Tech Stack:** React 19, TypeScript, React Router v7, Tailwind CSS v4, Axios, Lucide React, PHPUnit / Vitest.

**Spec:** `docs/DEVELOPMENT_RULES.md` (Bagian 4, 6, 7, 10, 11), `docs/API_CONTRACT.md`

## Global Constraints

- Source of Truth mutlak: `docs/DEVELOPMENT_RULES.md`.
- Larangan keras *Fake Default Data* (Section 11): Dilarang menggunakan fallback dummy (`111-FFF-111`, `Pengadaan Komputer`, `100000000`, `04 Maret 2027`, dll.). Tampilkan skeleton saat `isLoading` dan `-` / `Rp 0` saat data kosong.
- Larangan *Direct API Calls in Components* (Section 11.4): Semua pemanggilan endpoint backend wajib melalui service module di `frontend/src/services/`.
- Aturan *Atomic Design Hierarchy* (Section 10): atoms → molecules → organisms → templates → pages. Page hanya bertindak sebagai lem orkestrasi (*glue only*).
- Larangan `any` tanpa alasan jelas: Semua data permohonan, MAK, dokumen, dan approval harus memiliki tipe TypeScript yang ketat.
- Lifecycle & Cleanup (Section 11.2): Pengambilan data awal di `useEffect` wajib dapat dibatalkan via `AbortController`.
- Format PHP dengan `vendor/bin/pint --dirty --format agent` jika ada file PHP yang disentuh.
- Verifikasi frontend wajib lulus `npm.cmd --prefix frontend run build` tanpa error.

## Review Focus

- **Penghapusan Fake Data secara Total** — pastikan tidak ada lagi fallback dummy string/angka seperti `DEFAULT_MAKS`, nomor surat palsu, nominal 100 juta, atau tanggal default 2027.
- **Transisi Loading & Skeleton** — saat halaman pertama kali dimuat (`isLoading = true`), antarmuka harus merender skeleton loader yang elegan dan proporsional tanpa layout shift.
- **Pembatalan Request (AbortController)** — jika pengguna berpindah halaman sebelum request detail selesai, request harus di-abort secara bersih tanpa error console / state update unmounted.
- **Integritas Alur MAK & Approval** — aksi pemilihan MAK dinamis, tombol tambah/hapus baris MAK, modal penolakan (catatan min 5 karakter), dan konfirmasi persetujuan harus tetap berfungsi presisi sesuai aturan bisnis.
- **Preservasi Fitur Download & Preview Dokumen** — fungsi preview dokumen PDF di tab baru via Axios blob dan unduh langsung berkas asli yang baru saja dibuat harus tetap bekerja optimal tanpa regresi.

---

## File Structure & Responsibilities

```
frontend/src/
├── types/
│   └── perencanaan.ts                      [Baru] Strict TypeScript interfaces untuk domain Perencanaan
├── utils/
│   └── formatters.ts                       [Modifikasi] Tambahkan formatBytes(bytes?: number)
├── services/
│   └── perencanaanService.ts               [Baru] Domain service untuk API Perencanaan
├── components/
│   ├── atoms/
│   │   └── StatusPill.tsx                  [Digunakan Kembali] Standarisasi pill status
│   ├── organisms/
│   │   ├── PerencanaanVerifikasiMakCard.tsx [Baru] Organism pemilihan MAK dinamis
│   │   └── DokumenPermohonanCard.tsx       [Baru] Organism metadata dokumen & aksi lihat/unduh
│   └── templates/
│       └── PerencanaanPengajuanShowTemplate.tsx [Baru] Template presentasional murni + skeleton
└── pages/
    └── Perencanaan/
        └── Pengajuan/
            └── Show.tsx                    [Refactor Total] Page orkestrator tipis (~100 baris)
```

---

## Task 1: Strict Types, Utils & Domain Service Extraction

**Files:**
- Create: `frontend/src/types/perencanaan.ts`
- Modify: `frontend/src/utils/formatters.ts`
- Create: `frontend/src/services/perencanaanService.ts`

**Interfaces:**
- Produces: 
  - `PerencanaanPengajuanDetail`, `PerencanaanMakItem`, `DokumenPermohonanDetail` di `types/perencanaan.ts`.
  - `formatBytes` di `utils/formatters.ts`.
  - `perencanaanService` methods (`getPengajuanDetail`, `approvePengajuan`, `rejectPengajuan`, `getDokumenBlob`) di `services/perencanaanService.ts`.

- [ ] **Step 1: Buat tipe data terstruktur `frontend/src/types/perencanaan.ts`**

  Buat interface eksplisit tanpa `any`:
  ```typescript
  import type { PermohonanItem } from './permohonan';

  export interface PerencanaanMakItem {
    id: number;
    nama: string;
    kode?: string | null;
    ppk_user_id?: number | null;
    Ppk?: {
      id: number;
      nama: string;
      email: string;
    } | null;
  }

  export interface DokumenPermohonanDetail {
    id: number | string;
    nama_asli: string;
    ukuran_bytes?: number | null;
    mime_type?: string | null;
    download_url?: string | null;
  }

  export interface ApprovalHistoryItem {
    id: number | string;
    tahap: string;
    keputusan: string;
    catatan?: string | null;
    created_at?: string | null;
    Actor?: {
      id: number;
      nama: string;
      Role?: {
        id: number;
        nama: string;
      } | null;
    } | null;
  }

  export interface PerencanaanPengajuanDetail {
    permohonan: PermohonanItem & {
      estimasi_anggaran?: number | null;
      Approvals?: ApprovalHistoryItem[];
      Unit?: {
        id: number;
        nama: string;
      } | null;
      Creator?: {
        id: number;
        nama: string;
      } | null;
    };
    maks: PerencanaanMakItem[];
    selected_mak_ids: number[];
    dokumen?: DokumenPermohonanDetail | null;
    dokumen_permohonan?: DokumenPermohonanDetail[];
  }

  export interface PerencanaanPengajuanDetailResponse {
    detail: PerencanaanPengajuanDetail;
    recentNotifications?: unknown[];
    unreadNotificationsCount?: number;
  }
  ```

- [ ] **Step 2: Tambahkan helper `formatBytes` di `frontend/src/utils/formatters.ts`**

  Tambahkan fungsi murni:
  ```typescript
  /**
   * Format ukuran file dari bytes ke format ramah pengguna (KB/MB).
   */
  export function formatBytes(bytes?: number | null): string {
    if (!bytes || bytes <= 0) return '0 KB';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    const kb = bytes / 1024;
    return `${Math.round(kb)} KB`;
  }
  ```

- [ ] **Step 3: Buat service module `frontend/src/services/perencanaanService.ts`**

  Sesuai Section 11.4 `DEVELOPMENT_RULES.md`:
  ```typescript
  import api from './api';
  import type { ApiMessageResponse } from '../types/api';
  import type { PerencanaanPengajuanDetailResponse } from '../types/perencanaan';

  export const perencanaanService = {
    /**
     * Mengambil detail pengajuan permohonan untuk peran Perencanaan.
     */
    async getPengajuanDetail(
      id: string | number,
      signal?: AbortSignal
    ): Promise<PerencanaanPengajuanDetailResponse> {
      const response = await api.get<PerencanaanPengajuanDetailResponse>(
        `/v1/perencanaan/pengajuan/${id}`,
        { signal }
      );
      return response.data;
    },

    /**
     * Menyetujui permohonan dan menetapkan jenis MAK.
     */
    async approvePengajuan(
      id: string | number,
      makIds: number[]
    ): Promise<ApiMessageResponse> {
      const response = await api.post<ApiMessageResponse>(
        `/v1/perencanaan/pengajuan/${id}/approve`,
        { mak_ids: makIds }
      );
      return response.data;
    },

    /**
     * Menolak permohonan dengan catatan/alasan penolakan.
     */
    async rejectPengajuan(
      id: string | number,
      alasan: string
    ): Promise<ApiMessageResponse> {
      const response = await api.post<ApiMessageResponse>(
        `/v1/perencanaan/pengajuan/${id}/reject`,
        { alasan }
      );
      return response.data;
    },

    /**
     * Mengambil blob file dokumen PDF terotentikasi.
     */
    async fetchDokumenBlob(
      downloadUrl: string,
      disposition: 'inline' | 'attachment' = 'attachment'
    ): Promise<{ blob: Blob; contentType?: string }> {
      const url = disposition === 'inline' ? `${downloadUrl}?disposition=inline` : downloadUrl;
      const response = await api.get<Blob>(url, { responseType: 'blob' });
      const rawContentType = response.headers['content-type'];
      const contentType = typeof rawContentType === 'string' ? rawContentType : 'application/pdf';
      return {
        blob: new Blob([response.data], { type: contentType }),
        contentType,
      };
    },
  };

  export default perencanaanService;
  ```

- [ ] **Step 4: Verifikasi build TypeScript**

  Run: `npm.cmd --prefix frontend run build`
  Expected: Build sukses, types & service valid.

- [ ] **Step 5: Commit**

  ```bash
  git add frontend/src/types/perencanaan.ts frontend/src/utils/formatters.ts frontend/src/services/perencanaanService.ts
  git commit -m "feat(perencanaan): add domain types, formatBytes util, and perencanaanService"
  ```

---

## Task 2: Ekstraksi Organisms (Verifikasi MAK & Dokumen Permohonan)

**Files:**
- Create: `frontend/src/components/organisms/PerencanaanVerifikasiMakCard.tsx`
- Create: `frontend/src/components/organisms/PerencanaanDokumenCard.tsx`

**Interfaces:**
- `PerencanaanVerifikasiMakCard`: Menerima `maksList`, `selectedMakIds`, `onAddMak`, `onRemoveMak`, `onChangeMak`, `onApproveClick`, `onRejectClick`, `processing`.
- `PerencanaanDokumenCard`: Menerima `dokumen`, `nomorSurat`, `judul`, `unitNama`, `tanggal`, `onViewNewTab`, `onDownload`, `isViewing`, `isDownloading`.

- [ ] **Step 1: Buat organism `PerencanaanVerifikasiMakCard.tsx`**

  Pindahkan antarmuka pemilihan MAK dinamis dan tombol aksi Verifikasi / Tolak ke komponen terisolasi:
  ```typescript
  import type { FC } from 'react';
  import { Plus, Trash2, CheckCircle2, XCircle, ChevronDown, Loader2 } from 'lucide-react';
  import type { PerencanaanMakItem } from '../../types/perencanaan';

  export interface PerencanaanVerifikasiMakCardProps {
    maksList: PerencanaanMakItem[];
    selectedMakIds: number[];
    onAddMak: () => void;
    onRemoveMak: (index: number) => void;
    onChangeMak: (index: number, makId: number) => void;
    onApproveClick: () => void;
    onRejectClick: () => void;
    processing?: boolean;
    disabled?: boolean;
  }
  ```
  Komponen hanya menangani presentasi form MAK, error saat kosong, dan tombol pemicu modal.

- [ ] **Step 2: Buat organism `PerencanaanDokumenCard.tsx`**

  Pindahkan kartu file metadata dan area live preview berkas permohonan ke komponen terisolasi:
  ```typescript
  import type { FC } from 'react';
  import { FileText, Eye, Download, Loader2 } from 'lucide-react';
  import type { DokumenPermohonanDetail } from '../../types/perencanaan';
  import { formatBytes } from '../../utils/formatters';

  export interface PerencanaanDokumenCardProps {
    dokumen?: DokumenPermohonanDetail | null;
    nomorSurat?: string | null;
    judul?: string | null;
    unitNama?: string | null;
    tanggal?: string | null;
    onViewNewTab: () => void;
    onDownload: () => void;
    isViewing?: boolean;
    isDownloading?: boolean;
  }
  ```
  Render nama dokumen asli, ukuran aktual terformat dari `formatBytes`, status tombol loading, dan live preview resmi tanpa nilai fallback palsu.

- [ ] **Step 3: Verifikasi build frontend**

  Run: `npm.cmd --prefix frontend run build`
  Expected: Build sukses, 0 error.

- [ ] **Step 4: Commit**

  ```bash
  git add frontend/src/components/organisms/PerencanaanVerifikasiMakCard.tsx frontend/src/components/organisms/PerencanaanDokumenCard.tsx
  git commit -m "feat(perencanaan): extract VerifikasiMakCard and DokumenCard organisms"
  ```

---

## Task 3: Pembuatan Template Presentasional Murni & Skeleton Loading

**Files:**
- Create: `frontend/src/components/templates/PerencanaanPengajuanShowTemplate.tsx`

**Interfaces:**
- Consumes: Organisms dari Task 2, `StatusPill` atom, `PpLayout` template.
- Produces: Komponen template murni tanpa `useState` data bisnis, menerima semua data dan event handlers via props, menyediakan tampilan skeleton lengkap saat `isLoading = true`.

- [ ] **Step 1: Rancang Props Interface untuk Template**

  ```typescript
  import type { FC } from 'react';
  import type { PerencanaanPengajuanDetail, PerencanaanMakItem } from '../../types/perencanaan';

  export interface PerencanaanPengajuanShowTemplateProps {
    detail?: PerencanaanPengajuanDetail | null;
    isLoading?: boolean;
    mode: 'verifikasi' | 'pengadaan' | 'diteruskan';
    maksList: PerencanaanMakItem[];
    selectedMakIds: number[];
    onAddMak: () => void;
    onRemoveMak: (index: number) => void;
    onChangeMak: (index: number, makId: number) => void;
    onApproveClick: () => void;
    onRejectClick: () => void;
    onViewDokumen: () => void;
    onDownloadDokumen: () => void;
    isViewingDoc?: boolean;
    isDownloadingDoc?: boolean;
    processing?: boolean;
    // Modals
    approveModalOpen: boolean;
    rejectModalOpen: boolean;
    alasanPenolakan: string;
    alasanError?: string;
    onCloseApproveModal: () => void;
    onCloseRejectModal: () => void;
    onConfirmApprove: () => void;
    onConfirmReject: (e: React.FormEvent) => void;
    onAlasanChange: (val: string) => void;
    // Notification & Layout
    recentNotifications?: unknown[];
    unreadNotificationsCount?: number;
  }
  ```

- [ ] **Step 2: Implementasi Skeleton State saat `isLoading === true`**

  Jika `isLoading`:
  - Render banner skeleton dengan placeholder pulsing Tailwind (`animate-pulse bg-white/20`).
  - Render grid card informasi skeleton (`h-4 bg-gray-200 rounded`).
  - Render dokumen card skeleton dan MAK card skeleton.
  - Bebas dari fake default data (tidak menampilkan nomor palsu atau nominal palsu).

- [ ] **Step 3: Implementasi Render Konten Penuh saat Data Tersedia**

  - Gunakan `StatusPill` atom resmi untuk menampilkan status permohonan.
  - Gunakan `formatRupiah` dan `formatTanggalIndo` dari utils.
  - Render `PerencanaanDokumenCard` dan `PerencanaanVerifikasiMakCard`.
  - Render modal persetujuan dan penolakan yang bersih.

- [ ] **Step 4: Verifikasi build frontend**

  Run: `npm.cmd --prefix frontend run build`
  Expected: Build sukses.

- [ ] **Step 5: Commit**

  ```bash
  git add frontend/src/components/templates/PerencanaanPengajuanShowTemplate.tsx
  git commit -m "feat(perencanaan): create pure presentational PerencanaanPengajuanShowTemplate"
  ```

---

## Task 4: Refactor `Show.tsx` Menjadi Page Orkestrator Tipis

**Files:**
- Modify: `frontend/src/pages/Perencanaan/Pengajuan/Show.tsx`

**Interfaces:**
- Consumes: `perencanaanService`, `useParams`, `useNavigate`, `PerencanaanPengajuanShowTemplate`.
- Produces: Komponen Page tipis (*glue only*) bebas pemanggilan direct axios, bebas inline modal markup, memiliki `AbortController` cleanup dan state loading terstandarisasi.

- [ ] **Step 1: Refactor total `Show.tsx`**

  - Hapus seluruh konstanta hardcoded `DEFAULT_MAKS`, fallback nominal dummy, fallback tanggal dummy, dan fallback nomor dummy.
  - Tambahkan `AbortController` di dalam `useEffect`:
    ```typescript
    useEffect(() => {
      if (!id) return;
      const controller = new AbortController();
      setIsLoading(true);

      perencanaanService.getPengajuanDetail(id, controller.signal)
        .then((res) => {
          setDetail(res.detail);
          if (res.detail.selected_mak_ids?.length) {
            setSelectedMakIds(res.detail.selected_mak_ids);
          } else if (res.detail.maks?.length) {
            setSelectedMakIds([res.detail.maks[0].id]);
          }
        })
        .catch((err) => {
          if (!controller.signal.aborted) {
            console.error('Gagal mengambil data pengajuan:', err);
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setIsLoading(false);
          }
        });

      return () => controller.abort();
    }, [id]);
    ```
  - Integrasikan handler `approvePengajuan` dan `rejectPengajuan` menggunakan `perencanaanService`.
  - Integrasikan handler dokumen menggunakan `perencanaanService.fetchDokumenBlob`.
  - Kembalikan hanya `<PerencanaanPengajuanShowTemplate ... />` dengan melempar props yang bersih.
  - Target ukuran file `Show.tsx`: turun dari 677 baris menjadi ~120 baris.

- [ ] **Step 2: Jalankan build frontend**

  Run: `npm.cmd --prefix frontend run build`
  Expected: Build sukses, 0 error TypeScript, 0 Vite error.

- [ ] **Step 3: Commit**

  ```bash
  git add frontend/src/pages/Perencanaan/Pengajuan/Show.tsx
  git commit -m "refactor(perencanaan): transform Show.tsx into thin glue page complying with DEVELOPMENT_RULES"
  ```

---

## Task 5: Verifikasi Penuh (Backend Tests, Frontend Build, Pint Formatter)

**Files:**
- Full suite verification

**Interfaces:**
- Consumes: Task 1 s/d Task 4.
- Produces: Jaminan bebas regresi kode backend maupun frontend.

- [ ] **Step 1: Jalankan PHPUnit Backend Test Suite**

  Run: `php backend/vendor/bin/phpunit -c backend/phpunit.xml`
  Expected: 110 passed, 549 assertions, 0 errors.

- [ ] **Step 2: Jalankan Laravel Pint Formatter**

  Run: `php backend/vendor/bin/pint --dirty --format agent`
  Expected: passed.

- [ ] **Step 3: Jalankan Frontend Production Build**

  Run: `npm.cmd --prefix frontend run build`
  Expected: Exit code 0, chunking valid.

