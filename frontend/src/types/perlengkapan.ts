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

export interface PerlengkapanTrackingStep {
  key: string;
  label: string;
  status: 'selesai' | 'sedang_diproses' | 'belum_dimulai';
}

export interface PerlengkapanTimelineItem {
  tanggal: string;
  keterangan: string;
  aktif?: boolean;
}

export interface PerlengkapanDokumenItem {
  id: number | string;
  nama: string;
  label?: string;
  tipe: string;
  ukuran: string;
  url: string;
}

export interface PerlengkapanVendorInfo {
  nama: string;
  dokumen: PerlengkapanDokumenItem[];
}

export interface PerlengkapanPenerimaanInfo {
  id: number | string;
  tanggal_terima: string;
  diterima_oleh: string;
  dokumen_barang: PerlengkapanDokumenItem[];
  dokumentasi_foto: PerlengkapanDokumenItem[];
}

export interface PerlengkapanPengadaanDetail {
  id: number | string;
  nomor_pengadaan: string;
  nomor_permohonan: string;
  tanggal_pengajuan: string;
  judul: string;
  diajukan_oleh: string;
  nominal: number;
  nominal_kontrak?: number | null;
  status: string;
  status_label?: string;
  vendor: PerlengkapanVendorInfo;
  tracking: {
    stepper: PerlengkapanTrackingStep[];
    timeline: PerlengkapanTimelineItem[];
  };
  penerimaan?: PerlengkapanPenerimaanInfo | null;
}
