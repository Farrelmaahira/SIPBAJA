import type { NotificationItem } from './notification';
import type { CatatanPerencanaanData, Bidang2PermohonanMakItem } from './bidang2';
import type {
  PpApprovalItem,
  PpDokumenItem,
  PpMakItem,
  PpPaginationMeta,
  PpPengadaanDetailPayload,
  PpPengadaanItem,
} from './pp';

export interface PpkDashboardStats {
  total?: number;
  menunggu?: number;
  disetujui?: number;
  ditolak?: number;
  tambahan_bulan_ini?: number;
  disetujui_bulan_ini?: number;
  ditolak_tahun_ini?: number;
}

export interface PpkPermohonanMakItem {
  id: number;
  permohonan_id?: number;
  mak_id: number;
  mak?: {
    id: number;
    kode?: string;
    nama: string;
    ppk_user_id?: number;
    ppk?: {
      id: number;
      nama: string;
      email?: string;
    } | null;
  } | null;
  Mak?: {
    id: number;
    kode?: string;
    nama: string;
    ppk_user_id?: number;
    Ppk?: {
      id: number;
      nama: string;
      email?: string;
    } | null;
  } | null;
}

export interface PpkPermohonanItem {
  id: number;
  nomor_surat?: string;
  judul?: string;
  deskripsi?: string | null;
  nominal?: number;
  estimasi_anggaran?: number;
  status?: string;
  revisi_ke?: number;
  unit_id?: number;
  created_at?: string;
  updated_at?: string;
  unit?: {
    id?: number;
    nama?: string;
  } | null;
  Unit?: {
    id?: number;
    nama?: string;
  } | null;
  creator?: {
    id?: number;
    nama?: string;
    email?: string;
  } | null;
  Creator?: {
    id?: number;
    nama?: string;
    email?: string;
  } | null;
  permohonan_mak?: PpkPermohonanMakItem[];
  PermohonanMak?: PpkPermohonanMakItem[];
  approvals?: PpApprovalItem[];
  Approvals?: PpApprovalItem[];
}

export interface PpkPermohonanDetailPayload {
  permohonan: PpkPermohonanItem;
  dokumen_permohonan?: PpDokumenItem[];
  permohonan_mak_ppk?: PpkPermohonanMakItem[];
  catatan_perencanaan?: CatatanPerencanaanData | null;
  mak_list?: Bidang2PermohonanMakItem[];
}

export interface PpkDashboardResponse {
  stats?: PpkDashboardStats;
  pengajuanTerbaru?: PpPengadaanItem[];
  permohonanTerbaru?: PpkPermohonanItem[];
  statistikBulanan?: { bulan: number; disetujui: number; ditolak: number }[];
  statistikTahunan?: { tahun: number; disetujui: number; ditolak: number }[];
  recentNotifications?: NotificationItem[];
  unreadNotificationsCount?: number;
}

export interface PpkPengajuanFilters {
  q?: string;
  search?: string;
  statuses?: string[];
  status?: string;
  bulan?: string;
  tahun?: string;
  unit_id?: string;
  page?: number;
  per_page?: number;
}

export interface PpkPengajuanListResponse {
  pengajuan?: {
    data?: PpPengadaanItem[];
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
  data?: PpPengadaanItem[];
  filters?: PpkPengajuanFilters;
  recentNotifications?: NotificationItem[];
  unreadNotificationsCount?: number;
}

export interface PpkPermohonanListResponse {
  message?: string;
  data?: PpkPermohonanItem[];
  meta?: PpPaginationMeta;
  filters?: PpkPengajuanFilters;
}

export interface PpkPermohonanDetailResponse {
  message?: string;
  data?: PpkPermohonanDetailPayload;
}

export interface PpkPengajuanDetailResponse {
  detail?: PpPengadaanDetailPayload;
  data?: PpPengadaanDetailPayload;
  recentNotifications?: NotificationItem[];
  unreadNotificationsCount?: number;
}

export interface PpkActionResponse {
  message: string;
  data?: PpPengadaanItem | PpkPermohonanItem;
}

export interface PpkTableRow {
  id: number;
  nomor_surat: string;
  judul: string;
  unit: string;
  tanggal: string;
  nominal: number;
  status: string;
  sourceType?: 'pengadaan' | 'permohonan';
  [key: string]: unknown;
}

export type {
  PpApprovalItem,
  PpDokumenItem,
  PpMakItem,
  PpPaginationMeta,
  PpPengadaanDetailPayload,
  PpPengadaanItem,
};
