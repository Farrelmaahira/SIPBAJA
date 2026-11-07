export type PpbjTabKey = 'permohonan' | 'pengadaan' | 'termin';

export interface PpbjStatItem {
  label: string;
  value: number | string;
  unit: string;
  variant?: 'info' | 'warning' | 'success' | 'primary' | string;
}

export interface PpbjPermohonanItem {
  id: number;
  nomorSurat: string;
  judul: string;
  ringkasanTujuan?: string;
  unitNama: string;
  estimasiAnggaran: number;
  revisiKe: number;
  status: string;
  tanggalPengajuan: string;
  makList: string[];
  jumlahPaket: number;
}

export interface PpbjPengadaanItem {
  id: number;
  nomorSurat: string;
  judul: string;
  unitNama: string;
  makNama: string;
  jenisNama: string;
  metodeNama: string;
  levelNama: string;
  ppkNama: string;
  nominal: number;
  revisiKe: number;
  status: string;
  tanggalDibuat: string;
}

export interface PpbjTerminItem {
  id: number;
  kontrakNomor: string;
  kontrakTipe: string;
  judul: string;
  unitNama: string;
  terminKe: number;
  nominalRencana: number;
  tanggalJatuhTempo: string;
  status: string;
  pembayaranStatus: string;
  pembayaranNominal?: number | null;
  reminderTanggal?: string | null;
}

export interface PpbjDashboardData {
  stats: PpbjStatItem[];
  permohonanMasuk: PpbjPermohonanItem[];
  pengadaanBerjalan: PpbjPengadaanItem[];
  terminKontrak: PpbjTerminItem[];
}

export type PpbjDashboardItem =
  | PpbjPermohonanItem
  | PpbjPengadaanItem
  | PpbjTerminItem;

export interface PpbjAvailableMak {
  id: number;
  permohonan_mak_id: number;
  nama: string;
  kode: string;
  ppk_id: number;
  ppk_nama: string;
}

export interface PpbjReferenceOption {
  id: number | string;
  nama: string;
  min_nominal?: number;
  max_nominal?: number | null;
  perlu_review_pp?: boolean;
}

export interface PpbjReferenceData {
  jenis: PpbjReferenceOption[];
  metode: PpbjReferenceOption[];
  level: PpbjReferenceOption[];
}

export interface PpbjPaketDraftItem {
  id: number;
  makKode: string;
  nominal: number;
  status: string;
  dokumenList?: Array<{
    id: number | string;
    nama_asli?: string;
    ukuran_bytes?: number;
  }>;
}

export interface PpbjPermohonanDetail {
  id: number;
  nomorSurat: string;
  judul: string;
  ringkasanTujuan: string;
  unitNama: string;
  estimasiAnggaran: number;
  revisiKe: number;
  status: string;
  tanggalPengajuan: string;
  pembuatNama: string;
  makList: Array<{ kode: string; nama: string }>;
  paketList: PpbjPaketDraftItem[];
  bisaDipecah: boolean;
  sudahDikunci: boolean;
  sisaAnggaran: number;
  totalNominalPaket: number;
  availableMak: PpbjAvailableMak[];
  referenceData: PpbjReferenceData;
  dokumenList?: Array<{
    id: number | string;
    nama_asli?: string;
    nama_hash?: string;
    ukuran_bytes?: number;
    mime_type?: string;
    tipe_dokumen?: string;
    download_url?: string;
  }>;
}

export interface PpbjStoreDraftItemPayload {
  permohonan_mak_id: number | string;
  jenis_id: number | string;
  metode_id: number | string;
  nominal: number | string;
  level_id?: number | string;
  dokumen?: File | null;
}

export interface PpbjStoreDraftPayload {
  items: PpbjStoreDraftItemPayload[];
}
