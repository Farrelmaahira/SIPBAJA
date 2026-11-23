import { AdminMakItem } from "./admin";
import { DokumenItem } from "./dokumen";

export type PpbjTabKey = 'permohonan' | 'pengadaan' | 'termin';

export interface PpbjStatItem {
  label: string;
  value: number | string;
  unit: string;
  variant?: 'info' | 'warning' | 'success' | 'primary' | string;
}

export interface PpbjPermohonanItem {
  id: number;
  nomorSurat?: string;
  nomor_surat?: string;
  judul: string;
  ringkasanTujuan?: string;
  unitNama?: string;
  unit_nama?: string;
  estimasiAnggaran?: number;
  estimasi_anggaran?: number;
  revisiKe?: number;
  revisi_ke?: number;
  status: string;
  tanggalPengajuan?: string;
  tanggal_pengajuan?: string;
  makList?: string[];
  jumlahPaket?: number;
}

interface permohonanMak {
  id: number,
  mak_id: number,
  ditentukan_oleh: number,
  mak: AdminMakItem
}

export interface PpbjPengadaanItem {
  id: number;
  nomorSurat?: string;
  judul?: string;
  unitNama?: string;
  makNama?: string;
  jenisNama?: string;
  metodeNama?: string;
  levelNama?: string;
  ppkNama?: string;
  jenis?: string;
  metode?: string;
  level?: string;
  permohonan?: PpbjPermohonanItem;
  nominal?: number | null;
  revisiKe?: number;
  permohonanMak?: permohonanMak;
  reviewPp?: boolean;
  status: string;
  tanggalDibuat?: string;
  dokumenList?: DokumenItem[];
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
  nominal?: number | null;
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
  catatanPerencanaan?: string;
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
  level_id: number | string;
  dokumen?: File | null;
}

export interface PpbjStoreDraftPayload {
  items: PpbjStoreDraftItemPayload[];
}

export interface PpbjPengadaanDetail {
  id: number;
  permohonan_mak_id?: number;
  nominal: number;
  status: string;
  revisi_ke: number;
  bisa_edit_draft: boolean;
  bisa_edit_kontrak: boolean;
  available_mak?: Array<{
    id: number;
    mak_id?: number;
    nama: string;
    kode?: string;
  }>;
  reference_data?: {
    jenis?: PpbjReferenceOption[];
    metode?: PpbjReferenceOption[];
    level?: PpbjReferenceOption[];
  };
  permohonan: {
    id: number;
    nomor_surat: string;
    judul: string;
    estimasi_anggaran: number;
    unit_nama: string;
    tanggal_pengajuan?: string;
    created_at?: string;
  };
  created_at?: string;
  mak: {
    id?: number;
    nama: string;
    kode: string;
    ppk_nama: string;
  };
  jenis: {
    id: number;
    nama: string;
  };
  metode: {
    id: number;
    nama: string;
  };
  level: {
    id: number;
    nama: string;
    perlu_review_pp: boolean;
  };
  tracking?: {
    stepper: Array<{
      key: string;
      label: string;
      status: 'selesai' | 'sedang_berlangsung' | 'belum_dimulai';
    }>;
    timeline: Array<{
      id: number | string;
      tanggal: string;
      keterangan: string;
      actor_nama?: string;
      aktif?: boolean;
    }>;
  };
  kontrak?: {
    id: number;
    tipe: string;
    nomor: string;
    tanggal: string | null;
    vendor_nama: string;
    nominal_kontrak: number;
    tanggal_jatuh_tempo: string | null;
    tanggal_reminder: string | null;
    dokumen?: {
      id: number;
      nama_asli: string;
      download_url: string;
      tipe_dokumen?: string;
    } | null;
    dokumen_items?: Array<{
      id: number;
      nama_asli: string;
      tipe_dokumen: string;
      ukuran_bytes: number;
      mime_type: string;
      download_url: string;
    }>;
  } | null;
  dokumen_list: Array<{
    id: number;
    nama_asli: string;
    tipe_dokumen: string;
    ukuran_bytes: number;
    mime_type: string;
    download_url: string;
  }>;
  approvals: Array<{
    id: number;
    tahap: string;
    keputusan: string;
    catatan?: string | null;
    alasan?: string | null;
    actor_nama?: string;
    actor?: {
      id?: number;
      nama?: string;
    };
    created_at?: string | null;
  }>;
}

export interface PpbjSimpanKontrakPayload {
  tipe?: 'Kontrak' | 'SPK' | 'Surat Pesanan' | 'Kwitansi' | 'Invoice' | string;
  nomor?: string;
  tanggal?: string;
  vendor_nama: string;
  nominal_kontrak: number | string;
  tanggal_jatuh_tempo?: string;
  tanggal_reminder?: string;
  dokumen?: File | null;
  dokumen_surat_kontrak?: File | null;
  dokumen_spk?: File | null;
  dokumen_surat_pemesanan?: File | null;
  dokumen_kwitansi?: File | null;
  dokumen_invoice?: File | null;
}

export interface PpbjUpdateKlasifikasiPayload {
  permohonan_mak_id: number | string;
  jenis_id: number | string;
  metode_id: number | string;
  level_id: number | string;
  dokumen?: File | null;
}
