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
