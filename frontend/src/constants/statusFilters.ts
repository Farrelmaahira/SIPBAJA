import type { FilterStatusOption } from '../components/molecules/FilterStatusPopover';

export const ACTIVE_STATUS_FILTER_OPTIONS: FilterStatusOption[] = [
  {
    key: 'aktif',
    label: 'Aktif',
    pillClass: 'bg-[#E4F6EC] text-[#0B7A4E]',
    dotClass: 'bg-[#12A06B]',
  },
  {
    key: 'nonaktif',
    label: 'Nonaktif',
    pillClass: 'bg-[#FDECEC] text-[#B42318]',
    dotClass: 'bg-[#E5484D]',
  },
];

export const PEMOHON_STATUS_OPTIONS: FilterStatusOption[] = [
  { key: 'ditolak', label: 'Ditolak', pillClass: 'bg-[#FDECEC] text-[#B42318]', dotClass: 'bg-[#E5484D]' },
  { key: 'sedang_diajukan', label: 'Sedang Diajukan', pillClass: 'bg-[#FEF6EE] text-[#B54708]', dotClass: 'bg-[#F79009]' },
  { key: 'sedang_diproses', label: 'Sedang Diproses', pillClass: 'bg-[#EBF7F3] text-[#0E7C5A]', dotClass: 'bg-[#0E7C5A]' },
  { key: 'selesai', label: 'Selesai', pillClass: 'bg-[#E4F6EC] text-[#0B7A4E]', dotClass: 'bg-[#12A06B]' },
];

export const PERENCANAAN_STATUS_OPTIONS: FilterStatusOption[] = [
  { key: 'ditolak', label: 'Ditolak', pillClass: 'bg-[#FDECEC] text-[#B42318]', dotClass: 'bg-[#E5484D]' },
  { key: 'menunggu_jenis_mak', label: 'Menunggu Jenis MAK', pillClass: 'bg-[#FEF6EE] text-[#B54708]', dotClass: 'bg-[#F79009]' },
  { key: 'sedang_diproses', label: 'Sedang Diproses', pillClass: 'bg-[#EBF7F3] text-[#0E7C5A]', dotClass: 'bg-[#0E7C5A]' },
  { key: 'selesai', label: 'Selesai', pillClass: 'bg-[#E4F6EC] text-[#0B7A4E]', dotClass: 'bg-[#12A06B]' },
];

export const BIDANG2_PERMOHONAN_STATUS_OPTIONS: FilterStatusOption[] = [
  { key: 'ditolak', label: 'Ditolak', pillClass: 'bg-[#FDECEC] text-[#B42318]', dotClass: 'bg-[#E5484D]' },
  { key: 'menunggu_jenis_mak', label: 'Menunggu Jenis MAK', pillClass: 'bg-[#FEF6EE] text-[#B54708]', dotClass: 'bg-[#F79009]' },
  { key: 'review_surat_permohonan', label: 'Review Surat Permohonan', pillClass: 'bg-[#EFF8FF] text-[#175CD3]', dotClass: 'bg-[#2E90FA]' },
  { key: 'menunggu_persetujuan_ppk', label: 'Menunggu Persetujuan PPK', pillClass: 'bg-[#FEF6EE] text-[#B54708]', dotClass: 'bg-[#F79009]' },
  { key: 'sedang_diproses', label: 'Sedang Diproses', pillClass: 'bg-[#EBF7F3] text-[#0E7C5A]', dotClass: 'bg-[#0E7C5A]' },
  { key: 'selesai', label: 'Selesai', pillClass: 'bg-[#E4F6EC] text-[#0B7A4E]', dotClass: 'bg-[#12A06B]' },
];

export const PPBJ_PERMOHONAN_STATUS_OPTIONS: FilterStatusOption[] = [
  { key: 'menunggu_dokumen_pengadaan', label: 'Menunggu Dokumen Pengadaan', pillClass: 'bg-[#FEF6EE] text-[#B54708]', dotClass: 'bg-[#F79009]' },
  { key: 'dokumen_pengadaan_ditolak', label: 'Dokumen Pengadaan Ditolak', pillClass: 'bg-[#FDECEC] text-[#B42318]', dotClass: 'bg-[#E5484D]' },
  { key: 'sedang_diproses', label: 'Sedang Diproses', pillClass: 'bg-[#EBF7F3] text-[#0E7C5A]', dotClass: 'bg-[#0E7C5A]' },
  { key: 'selesai', label: 'Selesai', pillClass: 'bg-[#E4F6EC] text-[#0B7A4E]', dotClass: 'bg-[#12A06B]' },
];

export const PPK_PERMOHONAN_STATUS_OPTIONS: FilterStatusOption[] = [
  { key: 'ditolak', label: 'Ditolak', pillClass: 'bg-[#FDECEC] text-[#B42318]', dotClass: 'bg-[#E5484D]' },
  { key: 'menunggu_jenis_mak', label: 'Menunggu Jenis MAK', pillClass: 'bg-[#FEF6EE] text-[#B54708]', dotClass: 'bg-[#F79009]' },
  { key: 'review_surat_permohonan', label: 'Review Surat Permohonan', pillClass: 'bg-[#EFF8FF] text-[#175CD3]', dotClass: 'bg-[#2E90FA]' },
  { key: 'menunggu_persetujuan_bidang_2', label: 'Menunggu Persetujuan Bidang 2', pillClass: 'bg-[#FEF6EE] text-[#B54708]', dotClass: 'bg-[#F79009]' },
  { key: 'sedang_diproses', label: 'Sedang Diproses', pillClass: 'bg-[#EBF7F3] text-[#0E7C5A]', dotClass: 'bg-[#0E7C5A]' },
  { key: 'selesai', label: 'Selesai', pillClass: 'bg-[#E4F6EC] text-[#0B7A4E]', dotClass: 'bg-[#12A06B]' },
];

export const PENGADAAN_STATUS_OPTIONS: FilterStatusOption[] = [
  { key: 'review_dokumen_pengadaan_pp', label: 'Review Dokumen Pengadaan oleh PP', pillClass: 'bg-[#EFF8FF] text-[#175CD3]', dotClass: 'bg-[#2E90FA]' },
  { key: 'dokumen_pengadaan_ditolak_pp', label: 'Dokumen Pengadaan Ditolak PP', pillClass: 'bg-[#FDECEC] text-[#B42318]', dotClass: 'bg-[#E5484D]' },
  { key: 'diverifikasi_pp', label: 'Diverivikasi PP', pillClass: 'bg-[#E4F6EC] text-[#0B7A4E]', dotClass: 'bg-[#12A06B]' },
  { key: 'review_dokumen_pengadaan_ppk', label: 'Review Dokumen Pengadaan oleh PPK', pillClass: 'bg-[#EFF8FF] text-[#175CD3]', dotClass: 'bg-[#2E90FA]' },
  { key: 'dokumen_pengadaan_ditolak_ppk', label: 'Dokumen Pengadaan Ditolak PPK', pillClass: 'bg-[#FDECEC] text-[#B42318]', dotClass: 'bg-[#E5484D]' },
  { key: 'menunggu_proses_pengadaan', label: 'Menunggu Proses Pengadaan', pillClass: 'bg-[#FEF6EE] text-[#B54708]', dotClass: 'bg-[#F79009]' },
  { key: 'proses_pengadaan', label: 'Proses Pengadaan', pillClass: 'bg-[#EBF7F3] text-[#0E7C5A]', dotClass: 'bg-[#0E7C5A]' },
  { key: 'review_dokumen_pembayaran', label: 'Review Dokumen Pembayaran', pillClass: 'bg-[#EFF8FF] text-[#175CD3]', dotClass: 'bg-[#2E90FA]' },
  { key: 'dokumen_pembayaran_ditolak', label: 'Dokumen Pembayaran Ditolak', pillClass: 'bg-[#FDECEC] text-[#B42318]', dotClass: 'bg-[#E5484D]' },
  { key: 'menunggu_legalitas_vendor', label: 'Menunggu Legalitas Vendor', pillClass: 'bg-[#FEF6EE] text-[#B54708]', dotClass: 'bg-[#F79009]' },
  { key: 'proses_pembayaran', label: 'Proses Pembayaran', pillClass: 'bg-[#EBF7F3] text-[#0E7C5A]', dotClass: 'bg-[#0E7C5A]' },
  { key: 'selesai', label: 'Selesai', pillClass: 'bg-[#E4F6EC] text-[#0B7A4E]', dotClass: 'bg-[#12A06B]' },
];

export const PP_PENGADAAN_STATUS_OPTIONS: FilterStatusOption[] = [
  { key: 'verifikasi_gagal', label: 'Verifikasi Gagal', pillClass: 'bg-[#FDECEC] text-[#B42318]', dotClass: 'bg-[#E5484D]' },
  { key: 'review_dokumen_pengadaan', label: 'Review Dokumen Pengadaan', pillClass: 'bg-[#EFF8FF] text-[#175CD3]', dotClass: 'bg-[#2E90FA]' },
  { key: 'terverifikasi', label: 'Terverifikasi', pillClass: 'bg-[#E4F6EC] text-[#0B7A4E]', dotClass: 'bg-[#12A06B]' },
];

export const PERLENGKAPAN_STATUS_OPTIONS: FilterStatusOption[] = [
  { key: 'menunggu_proses_perlengkapan', label: 'Menunggu Proses Perlengkapan', pillClass: 'bg-[#FEF6EE] text-[#B54708]', dotClass: 'bg-[#F79009]' },
  { key: 'selesai_proses_perlengkapan', label: 'Selesai Proses Perlengkapan', pillClass: 'bg-[#E4F6EC] text-[#0B7A4E]', dotClass: 'bg-[#12A06B]' },
];

export const KEUANGAN_STATUS_OPTIONS: FilterStatusOption[] = [
  { key: 'menunggu_bukti_pembayaran', label: 'Menunggu Bukti Pembayaran', pillClass: 'bg-[#FEF6EE] text-[#B54708]', dotClass: 'bg-[#F79009]' },
  { key: 'selesai', label: 'Selesai', pillClass: 'bg-[#E4F6EC] text-[#0B7A4E]', dotClass: 'bg-[#12A06B]' },
];
