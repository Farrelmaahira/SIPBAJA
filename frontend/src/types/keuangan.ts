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

export interface KeuanganTrackingStep {
  id: string;
  label: string;
  status: 'selesai' | 'current' | 'pending';
  sublabel?: string;
  icon?: string;
}

export interface KeuanganTimelineItem {
  waktu: string;
  deskripsi: string;
}

export interface KeuanganDokumenItem {
  id: number | string;
  tipe: string;
  nama: string;
  ukuran: string;
  url: string;
  is_image?: boolean;
  kategori?: 'permohonan' | 'pengadaan' | 'pembelian' | 'pembayaran' | 'vendor' | string;
}

export interface KeuanganDokumenKategoriGroup {
  label: string;
  deskripsi: string;
  items: KeuanganDokumenItem[];
  verifikasi_pp?: string;
  persetujuan_ppk?: string;
}

export interface KeuanganDokumenKategoriMap {
  permohonan: KeuanganDokumenKategoriGroup;
  pengadaan: KeuanganDokumenKategoriGroup;
  pembelian: KeuanganDokumenKategoriGroup;
  pembayaran: KeuanganDokumenKategoriGroup;
  vendor: KeuanganDokumenKategoriGroup;
}

export interface KeuanganMakItem {
  kode: string;
  nama: string;
  penanggung_jawab: string;
}

export interface KeuanganInformasiPengadaan {
  no_pengadaan: string;
  jenis_pengadaan: string;
  nominal_estimasi: number;
  verifikasi_pp: string;
  nomor_permohonan: string;
  metode_pengadaan: string;
  biaya_riil: number;
  persetujuan_ppk: string;
  tanggal_pengajuan: string;
  level_pengadaan: string;
  nama_vendor: string;
  status_pengadaan: string;
  status_label: string;
}

export interface KeuanganBuktiBayarItem {
  id: number | string;
  nama: string;
  ukuran: string;
  url: string;
}

export interface KeuanganPembayaranDetail {
  status: string;
  status_label?: string;
  tanggal_pembayaran?: string | null;
  dokumen_bukti_bayar?: KeuanganBuktiBayarItem[];
}

export interface KeuanganPengadaanDetail {
  id: number | string;
  nomor_pengadaan: string;
  nomor_permohonan: string;
  judul: string;
  unit_pemohon: string;
  tanggal_pengajuan: string;
  tanggal_pengingat: string;
  status: string;
  status_label: string;
  informasi_pengadaan: KeuanganInformasiPengadaan;
  tracking_proses: {
    stepper: KeuanganTrackingStep[];
    timeline: KeuanganTimelineItem[];
  };
  dokumen_diterima: KeuanganDokumenItem[];
  dokumen_kategori?: KeuanganDokumenKategoriMap;
  jenis_mak: KeuanganMakItem[];
  pembayaran?: KeuanganPembayaranDetail;
}
