export interface KeuanganPengadaanItem {
  id: number | string;
  nomor_pengadaan: string;
  nomor_permohonan: string;
  judul: string;
  diajukan_oleh: string;
  nilai_pengajuan: number;
  status: string;
  status_label: string;
  [key: string]: unknown;
}

export interface KeuanganDashboardSummary {
  total_menunggu_pembayaran: number;
}

export interface KeuanganDashboardData {
  summary: KeuanganDashboardSummary;
  pengadaan_menunggu_pembayaran: KeuanganPengadaanItem[];
}

export interface KeuanganPengadaanListResponse {
  data: KeuanganPengadaanItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}
