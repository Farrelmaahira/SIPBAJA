import type { PermohonanItem } from './permohonan';
import type { DokumenItem } from './dokumen';

export type { DokumenItem };

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

export type DokumenPermohonanDetail = DokumenItem;

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

export interface PerencanaanPengajuanListResponse {
  permohonan?: {
    data?: PermohonanItem[];
    total?: number;
    current_page?: number;
    last_page?: number;
    [key: string]: unknown;
  };
  data?: PermohonanItem[];
  filters?: {
    q?: string;
    statuses?: string[];
  };
}

export interface JenisMakRow {
  id: number;
  kode: string;
  nama: string;
  penanggung_jawab: string;
  digunakan: number;
  updated?: string;
  ppk_user_id: number;
}

export interface PpkOption {
  id: number;
  nama: string;
  email: string;
}

export interface JenisMakResponse {
  maks?:
    | {
        data?: Array<{
          id: number;
          nama: string;
          ppk_user_id?: number | null;
          permohonan_mak_count?: number;
          Ppk?: PpkOption | null;
          ppk?: PpkOption | null;
          [key: string]: unknown;
        }>;
      }
    | Array<{
        id: number;
        nama: string;
        ppk_user_id?: number | null;
        permohonan_mak_count?: number;
        Ppk?: PpkOption | null;
        ppk?: PpkOption | null;
        [key: string]: unknown;
      }>;
  ppkOptions?: PpkOption[];
  filters?: {
    q?: string;
  };
}

export interface RkaklActiveDoc {
  id?: number | string;
  nama_asli?: string;
  path?: string;
  versi?: number;
  updated_at?: string;
  [key: string]: unknown;
}

export interface RkaklHistoryItem {
  id: number | string;
  nama_asli?: string;
  filename?: string;
  path?: string;
  meta?: string;
  versi?: number;
  updated_at?: string;
  [key: string]: unknown;
}

export interface RkaklResponse {
  rkakl?: {
    active_doc?: RkaklActiveDoc | null;
    history?: RkaklHistoryItem[];
  };
  data?: {
    active_doc?: RkaklActiveDoc | null;
    history?: RkaklHistoryItem[];
  };
}

export interface PerencanaanProfilResponse {
  user: {
    id: number;
    nama: string;
    email: string;
    role_id?: number;
    unit_id?: number | null;
    Role?: {
      id: number;
      nama: string;
    } | null;
    Unit?: {
      id: number;
      nama: string;
    } | null;
    [key: string]: unknown;
  };
}

export interface PerencanaanDashboardStats {
  total?: number;
  diajukan?: number;
  selesai?: number;
  ditolak?: number;
}

export interface PermohonanTerbaruItem {
  id: number;
  nomor_surat?: string;
  judul?: string;
  created_at?: string;
  estimasi_anggaran?: number;
  status?: string;
  [key: string]: unknown;
}

export interface PerencanaanDashboardResponse {
  stats?: PerencanaanDashboardStats;
  permohonanTerbaru?: PermohonanTerbaruItem[];
  recentNotifications?: unknown[];
  unreadNotificationsCount?: number;
}

