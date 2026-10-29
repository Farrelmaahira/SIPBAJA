/**
 * Format angka ke mata uang Rupiah (contoh: Rp 48.500.000)
 */
export function formatRupiah(nominal) {
    const val = Number(nominal || 0);
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(val);
}

/**
 * Format tanggal ke Bahasa Indonesia (contoh: 15 Jan 2026)
 */
export function formatTanggal(dateStr, options = { day: '2-digit', month: 'short', year: 'numeric' }) {
    if (!dateStr) return '15 Jan 2026';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString('id-ID', options);
}
