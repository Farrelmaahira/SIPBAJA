import type { DokumenItem } from './dokumen';
import type { NotificationItem } from './notification';

export type { DokumenItem, NotificationItem };

export interface PpDashboardStats {
  total?: number;
  menunggu?: number;
  disetujui?: number;
  ditolak?: number;
}

export interface PpChartMonthlyItem {
  bulan: string;
  bulan_angka?: number;
  disetujui: number;
  ditolak: number;
}

export interface PpChartData {
  tahun?: number;
  data?: PpChartMonthlyItem[];
  total_disetujui?: number;
  total_ditolak?: number;
}

export interface PpUnitInfo {
  id?: number;
  nama?: string;
}

export interface PpPermohonanInfo {
  id?: number;
  nomor_surat?: string;
  judul?: string;
  deskripsi?: string;
  estimasi_anggaran?: number | string;
  created_at?: string;
  unit?: PpUnitInfo | null;
  Unit?: PpUnitInfo | null;
}

export interface PpMakItem {
  id: number;
  kode?: string | null;
  nama: string;
}

export interface PpPengadaanItem {
  id: number;
  permohonan_id?: number;
  permohonan_mak_id?: number;
  nominal?: number | string;
  status?: string;
  revisi_ke?: number;
  created_at?: string;
  permohonan?: PpPermohonanInfo | null;
  Permohonan?: PpPermohonanInfo | null;
  ppk?: {
    id?: number;
    nama?: string;
    email?: string;
  } | null;
  Ppk?: {
    id?: number;
    nama?: string;
    email?: string;
  } | null;
  jenis?: {
    id?: number;
    nama?: string;
  } | null;
  Jenis?: {
    id?: number;
    nama?: string;
  } | null;
  metode?: {
    id?: number;
    nama?: string;
  } | null;
  Metode?: {
    id?: number;
    nama?: string;
  } | null;
  level?: {
    id?: number;
    nama?: string;
    perlu_review_pp?: boolean;
  } | null;
  Level?: {
    id?: number;
    nama?: string;
    perlu_review_pp?: boolean;
  } | null;
  kontrak?: {
    id?: number;
    tanggal?: string;
    nomor_kontrak?: string;
  } | null;
  Kontrak?: {
    id?: number;
    tanggal?: string;
    nomor_kontrak?: string;
  } | null;
  penerimaan?: {
    id?: number;
    tanggal_terima?: string;
  } | null;
  Penerimaan?: {
    id?: number;
    tanggal_terima?: string;
  } | null;
  [key: string]: unknown;
}

export interface PpDashboardResponse {
  stats?: PpDashboardStats;
  chart?: PpChartData;
  pengadaanPerluReview?: PpPengadaanItem[];
  pengadaan_perlu_review?: PpPengadaanItem[];
  recentNotifications?: NotificationItem[];
  unreadNotificationsCount?: number;
}

export interface PpPengajuanFilterParams {
  q?: string;
  search?: string;
  status?: string;
  statuses?: string[];
  bulan?: string | number;
  tahun?: string | number;
  unit_id?: string | number;
  page?: number;
}

export interface PpPengajuanListResponse {
  pengajuan?: {
    data?: PpPengadaanItem[];
    total?: number;
    current_page?: number;
    last_page?: number;
    per_page?: number;
  };
  data?: PpPengadaanItem[];
  filters?: PpPengajuanFilterParams;
  recentNotifications?: NotificationItem[];
  unreadNotificationsCount?: number;
}

export interface PpPengadaanDetailPayload {
  pengadaan?: PpPengadaanItem;
  dokumen_permohonan?: DokumenItem[];
  dokumen_pengadaan?: DokumenItem[];
  mak_list?: PpMakItem[];
}

export interface PpPengadaanDetailResponse {
  detail?: PpPengadaanDetailPayload;
  data?: PpPengadaanDetailPayload;
  recentNotifications?: NotificationItem[];
  unreadNotificationsCount?: number;
}

export interface PpDocumentPreviewInfo {
  category: string;
  filename: string;
  size: string;
}
