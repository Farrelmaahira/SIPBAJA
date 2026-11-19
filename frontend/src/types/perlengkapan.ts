export interface PerlengkapanPengadaanItem {
  id: number | string;
  nomor_pengadaan: string;
  nomor_permohonan: string;
  judul: string;
  diajukan_oleh: string;
  nilai_pengajuan: number;
  status: string;
  status_label?: string;
  [key: string]: unknown;
}

export interface PerlengkapanDashboardSummary {
  total_pengadaan_masuk: number;
}

export interface PerlengkapanDashboardData {
  summary: PerlengkapanDashboardSummary;
  pengadaan_masuk: PerlengkapanPengadaanItem[];
}

export interface PerlengkapanPengadaanListResponse {
  data: PerlengkapanPengadaanItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

