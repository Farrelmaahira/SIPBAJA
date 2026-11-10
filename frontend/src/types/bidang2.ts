export interface Bidang2PermohonanMakItem {
  id: number | string;
  kode: string;
  nama: string;
  [key: string]: unknown;
}

export interface Bidang2DokumenItem {
  id: number | string;
  nama_asli: string;
  ukuran_bytes: number;
  mime_type: string;
  download_url: string;
  [key: string]: unknown;
}

export interface CatatanPerencanaanData {
  pemeriksa_nama: string;
  pemeriksa_peran: string;
  tanggal: string | null;
  catatan: string;
  [key: string]: unknown;
}

export interface RkaklAktifInfo {
  versi: number;
  nama_asli: string;
  updated_at: string;
  download_url: string;
  [key: string]: unknown;
}

export interface KeputusanBidang2Data {
  id?: number | string;
  keputusan: 'disetujui' | 'ditolak' | string;
  alasan?: string | null;
  memo?: Bidang2DokumenItem | null;
  decided_at?: string | null;
  [key: string]: unknown;
}

export interface Bidang2DetailPengajuan {
  id: number | string;
  nomor_surat: string;
  judul: string;
  ringkasan_tujuan: string;
  unit_nama: string;
  estimasi_anggaran: number;
  revisi_ke: number;
  status: string;
  tanggal_pengajuan: string;
  created_at?: string | null;
  mak_list: Bidang2PermohonanMakItem[];
  dokumen: Bidang2DokumenItem | null;
  catatan_perencanaan: CatatanPerencanaanData;
  rkakl_aktif: RkaklAktifInfo;
  keputusan_bidang2?: KeputusanBidang2Data | null;
  [key: string]: unknown;
}

export interface Bidang2DetailApiResponse {
  permohonan: Bidang2DetailPengajuan;
}

export interface Bidang2PengajuanListItem {
  id: number | string;
  nomor_surat?: string | null;
  judul?: string | null;
  unit_id?: number | string;
  unit_nama?: string;
  created_at?: string | null;
  tanggal_pengajuan?: string | null;
  estimasi_anggaran?: number | string | null;
  status?: string | null;
  catatan_perencanaan?: CatatanPerencanaanData | null;
  dokumen?: Bidang2DokumenItem | null;
  [key: string]: unknown;
}

export interface Bidang2PengajuanListFilters {
  status: string;
  search: string;
}

export interface Bidang2PengajuanListResponse {
  permohonanList: {
    data: Bidang2PengajuanListItem[];
    current_page?: number;
    last_page?: number;
    from?: number;
    to?: number;
    total?: number;
  };
  filters: Bidang2PengajuanListFilters;
}

export interface Bidang2MutationResponse {
  message: string;
  permohonan?: unknown;
}
