export interface DokumenItem {
  id: number | string;
  nama_asli: string;
  tipe_dokumen?: string | null;
  ukuran_bytes?: number | null;
  mime_type?: string | null;
  download_url?: string | null;
  versi?: number | null;
  created_at?: string | null;
}

