const BULAN_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'] as const;

export type StatusPermohonanVariant = 'neutral' | 'info' | 'success' | 'danger' | 'warning';

export interface StatusPermohonanInfo {
  label: string;
  variant: StatusPermohonanVariant;
}

/**
 * Format angka ke rupiah tanpa desimal.
 */
export function formatRupiah(nominal: number | string | null | undefined): string {
  const angka = Number(nominal);
  if (Number.isNaN(angka)) return 'Rp -';
  return 'Rp ' + angka.toLocaleString('id-ID', { maximumFractionDigits: 0 });
}

/**
 * Format ISO date string ke "DD Mmm YYYY" dalam bahasa Indonesia.
 */
export function formatTanggal(isoString: string | null | undefined): string {
  if (!isoString) return '-';
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return '-';
  const dd = String(d.getDate()).padStart(2, '0');
  const mmm = BULAN_ID[d.getMonth()];
  const yyyy = d.getFullYear();
  return `${dd} ${mmm} ${yyyy}`;
}

/**
 * Nama singkat bulan dalam bahasa Indonesia (index 1-12).
 */
export function namaBulan(bulan: number): string {
  return BULAN_ID[bulan - 1] ?? String(bulan);
}

/**
 * Kembalikan label dan variant StatusPill berdasarkan nilai status permohonan dari DB.
 */
export function labelStatusPermohonan(status: string | null | undefined): StatusPermohonanInfo {
  const map: Record<string, StatusPermohonanInfo> = {
    diajukan: { label: 'Diajukan', variant: 'neutral' },
    menunggu_bidang2: { label: 'Menunggu Persetujuan', variant: 'info' },
    disetujui: { label: 'Disetujui', variant: 'success' },
    ditolak: { label: 'Ditolak', variant: 'danger' },
    proses_pengadaan: { label: 'Proses Pengadaan', variant: 'warning' },
  };
  return map[status ?? ''] ?? { label: status ?? '-', variant: 'neutral' };
}
