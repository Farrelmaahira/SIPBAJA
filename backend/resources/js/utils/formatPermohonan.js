const BULAN_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

/**
 * Format angka ke rupiah tanpa desimal.
 * @param {number|string|null} nominal
 * @returns {string}
 */
export function formatRupiah(nominal) {
    const angka = Number(nominal);
    if (Number.isNaN(angka)) return 'Rp -';
    return 'Rp ' + angka.toLocaleString('id-ID', { maximumFractionDigits: 0 });
}

/**
 * Format ISO date string ke "DD Mmm YYYY" dalam bahasa Indonesia.
 * @param {string|null} isoString
 * @returns {string}
 */
export function formatTanggal(isoString) {
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
 * @param {number} bulan
 * @returns {string}
 */
export function namaBulan(bulan) {
    return BULAN_ID[bulan - 1] ?? String(bulan);
}

/**
 * Kembalikan label dan variant StatusPill berdasarkan nilai status permohonan dari DB.
 * @param {string|null} status
 * @returns {{ label: string, variant: string }}
 */
export function labelStatusPermohonan(status) {
    const map = {
        diajukan: { label: 'Diajukan', variant: 'neutral' },
        menunggu_bidang2: { label: 'Menunggu Persetujuan', variant: 'info' },
        disetujui: { label: 'Disetujui', variant: 'success' },
        ditolak: { label: 'Ditolak', variant: 'danger' },
        proses_pengadaan: { label: 'Proses Pengadaan', variant: 'warning' },
    };
    return map[status] ?? { label: status ?? '-', variant: 'neutral' };
}
