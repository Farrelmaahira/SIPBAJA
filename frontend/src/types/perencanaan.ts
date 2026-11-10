import type { PermohonanItem } from './permohonan';
import type { DokumenItem } from './dokumen';
import type { NotificationItem } from './notification';

export type { DokumenItem, NotificationItem };

export interface PpkOption {
  id: number;
  nama: string;
  email: string;
}

export interface PerencanaanMakItem {
  id: number;
  nama: string;
  kode?: string | null;
  ppk_user_id?: number | null;
  permohonan_mak_count?: number;
  Ppk?: PpkOption | null;
  ppk?: PpkOption | null;
  ppk_user?: PpkOption | null;
}

export type PerencanaanMakRawItem = PerencanaanMakItem;

export type DokumenPermohonanDetail = DokumenItem;

export interface ApprovalHistoryItem {
  id: number | string;
  tahap?: string;
  keputusan?: string;
  status_sebelum?: string | null;
  status_sesudah?: string | null;
  alasan?: string | null;
  catatan?: string | null;
  created_at?: string | null;
  actor?: {
    id: number;
    nama: string;
  } | null;
  Actor?: {
    id: number;
    nama: string;
    Role?: {
      id: number;
      nama: string;
    } | null;
  } | null;
}

export interface OpsiPermohonanMakItem {
  permohonan_mak_id: number;
  mak_id: number;
  kode: string;
  nama: string;
  ppk_user_id: number;
  ppk_nama: string;
}

export interface PerencanaanPengadaanChildItem {
  id: number;
  permohonan_id: number;
  permohonan_mak_id?: number;
  mak_id?: number | null;
  ppk_id?: number | null;
  pp_user_id?: number | null;
  judul?: string | null;
  nilai?: number | string | null;
  nominal?: number | null;
  status: string;
  revisi_ke?: number;
  bisa_ubah_mak?: boolean;
  mak?: PerencanaanMakItem | null;
  Ppk?: PpkOption | null;
  PermohonanMak?: {
    id: number;
    mak_id: number;
    Mak?: PerencanaanMakItem | null;
  } | null;
}

export type PerencanaanPengadaanPaketItem = PerencanaanPengadaanChildItem;

export interface PerencanaanPermohonanMakPivot {
  id: number;
  permohonan_id?: number;
  mak_id: number;
  mak?: PerencanaanMakItem | null;
}

export interface PerencanaanPengajuanDetail {
  permohonan: PermohonanItem & {
    estimasi_anggaran?: number | string | null;
    Approvals?: ApprovalHistoryItem[];
    status_histories?: ApprovalHistoryItem[];
    Pengadaan?: PerencanaanPengadaanChildItem[];
    pengadaan?: PerencanaanPengadaanChildItem[];
    permohonan_mak?: PerencanaanPermohonanMakPivot[];
    Unit?: {
      id: number;
      nama: string;
    } | null;
    unit_kerja?: {
      id: number;
      nama: string;
    } | null;
    Creator?: {
      id: number;
      nama: string;
    } | null;
    pemohon?: {
      id: number;
      nama: string;
    } | null;
    pemohon_user?: {
      id: number;
      nama: string;
      email?: string;
      unit_kerja?: {
        id: number;
        nama: string;
      } | null;
    } | null;
  };
  maks: PerencanaanMakItem[];
  selected_mak_ids: number[];
  dokumen?: DokumenPermohonanDetail | null;
  dokumen_permohonan?: DokumenPermohonanDetail[];
  rkakl_active?: DokumenPermohonanDetail | null;
}

export interface PerencanaanPengajuanDetailResponse {
  detail: PerencanaanPengajuanDetail;
  recentNotifications?: NotificationItem[];
  unreadNotificationsCount?: number;
}

export interface PerencanaanPengadaanDetail {
  pengadaan: PerencanaanPengadaanChildItem & {
    Permohonan?: PermohonanItem & {
      Unit?: { id: number; nama: string } | null;
    };
  };
  dokumen_pengadaan?: DokumenItem[];
  bisa_ubah_mak: boolean;
  opsi_permohonan_mak: OpsiPermohonanMakItem[];
}

export interface PerencanaanPengadaanDetailResponse {
  data?: PerencanaanPengadaanDetail;
  detail?: PerencanaanPengadaanDetail;
}

export interface PerencanaanPengajuanListResponse {
  permohonan?: {
    data?: PermohonanTerbaruItem[];
    total?: number;
    current_page?: number;
    last_page?: number;
    per_page?: number;
  };
  data?: PermohonanTerbaruItem[];
  filters?: {
    q?: string;
    search?: string;
    status?: string;
    statuses?: string[];
    bulan?: string | number;
    tahun?: string | number;
    unit_id?: string | number;
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

export interface JenisMakResponse {
  maks?:
    | {
        data?: PerencanaanMakRawItem[];
        current_page?: number;
        last_page?: number;
        total?: number;
      }
    | PerencanaanMakRawItem[];
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
  ukuran_bytes?: number;
  tahun_anggaran?: string | number;
  download_url?: string;
  updated_at?: string;
  created_at?: string;
}

export interface RkaklHistoryItem {
  id: number | string;
  nama_asli?: string;
  filename?: string;
  path?: string;
  meta?: string;
  versi?: number;
  ukuran_bytes?: number;
  tahun_anggaran?: string | number;
  download_url?: string;
  updated_at?: string;
  created_at?: string;
}

export interface RkaklResponse {
  rkakl?: {
    active_doc?: RkaklActiveDoc | null;
    history?: RkaklHistoryItem[];
    items?: RkaklHistoryItem[];
    tahun?: string | number | null;
  };
  data?: {
    active_doc?: RkaklActiveDoc | null;
    history?: RkaklHistoryItem[];
    items?: RkaklHistoryItem[];
    tahun?: string | number | null;
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
  estimasi_anggaran?: number | string;
  status?: string;
  Unit?: {
    id: number;
    nama: string;
  } | null;
   [key: string]: unknown;
}

export interface PerencanaanDashboardResponse {
  stats?: PerencanaanDashboardStats;
  permohonanTerbaru?: PermohonanTerbaruItem[];
  recentNotifications?: NotificationItem[];
  unreadNotificationsCount?: number;
}
