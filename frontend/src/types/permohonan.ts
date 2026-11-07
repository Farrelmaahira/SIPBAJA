import type { PaginatedResponse } from './api';

export type PermohonanStatusKey =
  | 'diajukan'
  | 'menunggu_verifikasi'
  | 'menunggu_bidang2'
  | 'menunggu_persetujuan'
  | 'sedang_diproses'
  | 'proses_pengadaan'
  | 'disetujui'
  | 'selesai'
  | 'ditolak';

export interface PermohonanDokumen {
  id?: number | string;
  ref_type?: string;
  ref_id?: number | string;
  tipe_dokumen?: string;
  versi?: number;
  nama_asli?: string;
  nama_hash?: string;
  mime_type?: string;
  ukuran_bytes?: number;
  uploaded_by?: number | string;
  created_at?: string;
  [key: string]: unknown;
}

export interface PermohonanItem {
  id?: number | string;
  unit_id?: number | string;
  created_by?: number | string;
  nomor_surat?: string | null;
  judul?: string | null;
  ringkasan_tujuan?: string | null;
  estimasi_anggaran?: number | string | null;
  revisi_ke?: number;
  status?: PermohonanStatusKey | string | null;
  created_at?: string | null;
  dokumen?: PermohonanDokumen[];
  [key: string]: unknown;
}

export interface PermohonanListFilters {
  status: string;
  search: string;
}

export interface PermohonanListApiResponse {
  permohonanList: PaginatedResponse<PermohonanItem>;
  filters: PermohonanListFilters;
}

export interface CatatanPenolakanData {
  alasan: string;
  pemeriksa_peran: string;
  pemeriksa_nama: string;
  diperiksa_at: string | null;
  [key: string]: unknown;
}

export interface TimelineStageInfo {
  tahap: string;
  label: string;
  status: 'completed' | 'active' | 'rejected' | 'pending';
  keterangan: string;
  [key: string]: unknown;
}

export interface TimelineHistoryItem {
  id: number;
  status_lama?: string | null;
  status_baru: string;
  deskripsi: string;
  actor_nama?: string | null;
  actor_role?: string | null;
  waktu?: string | null;
  [key: string]: unknown;
}

export interface PermohonanDokumenDetail {
  id: number | string;
  nama_asli: string;
  ukuran_bytes: number;
  mime_type: string;
  download_url: string;
  [key: string]: unknown;
}

export interface PermohonanDetailInfo extends PermohonanItem {
  unit_nama?: string;
  pembuat_nama?: string;
  dokumen?: PermohonanDokumenDetail & PermohonanDokumen[];
  catatan_penolakan?: CatatanPenolakanData | null;
  timeline_stages?: TimelineStageInfo[];
  history?: TimelineHistoryItem[];
  [key: string]: unknown;
}

export interface PermohonanDetailApiResponse {
  permohonan: PermohonanDetailInfo;
}

export interface PermohonanRevisiFormData {
  judul: string;
  estimasi_anggaran: string | number;
  ringkasan_tujuan?: string;
  file_dokumen?: File | null;
}

export interface PermohonanRevisiFormErrors {
  judul?: string;
  estimasi_anggaran?: string;
  ringkasan_tujuan?: string;
  file_dokumen?: string;
  general?: string;
}

