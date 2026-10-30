/**
 * Format angka nominal ke format mata uang Rupiah.
 * Contoh: 150000000 -> "Rp 150.000.000"
 */
export function formatRupiah(value: number | string | null | undefined): string {
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
 */
export function formatTanggalIndo(
  dateString: string | Date | null | undefined,
  longMonth: boolean = false
): string {
  if (!dateString || dateString === '-') {
    return '-';
  }

  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
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
