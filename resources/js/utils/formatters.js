/**
 * Format angka nominal ke format mata uang Rupiah.
 * Contoh: 150000000 -> "Rp 150.000.000"
 *
 * @param {number|string|null|undefined} value
 * @returns {string}
 */
export function formatRupiah(value) {
    if (value === null || value === undefined || value === '') {
        return 'Rp 0';
    }

    const numeric = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numeric)) {
        return 'Rp 0';
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(numeric);
}

/**
 * Format tanggal ISO (YYYY-MM-DD atau ISO string) ke teks Bahasa Indonesia.
 * Contoh: "2026-10-26" -> "26 Okt 2026"
 *
 * @param {string|Date|null|undefined} dateString
 * @param {boolean} [longMonth=false]
 * @returns {string}
 */
export function formatTanggalIndo(dateString, longMonth = false) {
    if (!dateString || dateString === '-') {
        return '-';
    }

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return String(dateString);
        }

        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: longMonth ? 'long' : 'short',
            year: 'numeric',
        }).format(date);
    } catch {
        return String(dateString);
    }
}
