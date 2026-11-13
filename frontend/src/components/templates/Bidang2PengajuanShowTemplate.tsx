import { useState, type FC } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  ArrowLeft,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  X,
  Eye,
  Download,
  Loader2,
  ShoppingCart,
} from 'lucide-react';
import DashboardShellTemplate from './DashboardShellTemplate';
import StatusPill from '../atoms/StatusPill';
import DocumentPreviewModal from '../organisms/DocumentPreviewModal';
import InformasiPermohonanCard from '../organisms/Bidang2/InformasiPermohonanCard';
import CatatanPerencanaanCard from '../organisms/Bidang2/CatatanPerencanaanCard';
import KeputusanBidang2Card from '../organisms/Bidang2/KeputusanBidang2Card';
import SetujuPermohonanModal from '../organisms/Bidang2/SetujuPermohonanModal';
import TolakPermohonanModal from '../organisms/Bidang2/TolakPermohonanModal';
import type { Bidang2DetailPengajuan } from '../../types/bidang2';
import type { ProfilePillUser } from '../molecules/ProfilePill';

const NAV_ITEMS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/bidang-2/dashboard',
  },
  {
    key: 'pengajuan',
    label: 'List Permohonan',
    icon: ClipboardList,
    href: '/bidang-2/pengajuan',
    badge: 4,
  },
  {
    key: 'pengadaan',
    label: 'List Pengadaan',
    icon: ShoppingCart,
    href: '/bidang-2/pengadaan',
  },
  {
    key: 'rkakl',
    label: 'Dokumen RKAKL',
    icon: FileText,
    href: '/bidang-2/rkakl',
  },
];

function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return '8 MB';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  const kb = bytes / 1024;
  return `${Math.round(kb)} KB`;
}

export interface Bidang2PengajuanShowTemplateProps {
  user?: ProfilePillUser | null;
  permohonan: Bidang2DetailPengajuan | null;
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  flashMessage?: string | null;
  onCloseFlash?: () => void;
  pdfBlobUrl?: string | null;
  isLoadingPdf?: boolean;
  pdfLoadFailed?: boolean;
  isSetujuModalOpen: boolean;
  onToggleSetujuModal: (open: boolean) => void;
  isTolakModalOpen: boolean;
  onToggleTolakModal: (open: boolean) => void;
  onSetujuSubmit: (fileMemo: File) => Promise<void>;
  onTolakSubmit: (alasan: string) => Promise<void>;
  onOpenRkakl: () => void;
  onBack: () => void;
  onRetry?: () => void;
}

export const Bidang2PengajuanShowTemplate: FC<Bidang2PengajuanShowTemplateProps> = ({
  user,
  permohonan,
  isLoading,
  hasError,
  errorMessage,
  flashMessage,
  onCloseFlash,
  pdfBlobUrl,
  isLoadingPdf = false,
  pdfLoadFailed = false,
  isSetujuModalOpen,
  onToggleSetujuModal,
  isTolakModalOpen,
  onToggleTolakModal,
  onSetujuSubmit,
  onTolakSubmit,
  onOpenRkakl,
  onBack,
  onRetry,
}) => {
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const displayFileName =
    permohonan?.dokumen?.nama_asli ||
    `Surat_Permohonan_${(permohonan?.judul || 'Pengadaan').replace(/\s+/g, '_')}.pdf`;
  const displaySize = formatBytes(permohonan?.dokumen?.ukuran_bytes);
  const downloadUrl = permohonan?.dokumen?.download_url;

  const sidebarProps = {
    navItems: NAV_ITEMS,
    activeRoute: 'pengajuan',
    brandSubtitle: 'Pengadaan Barang & Jasa',
    sectionTitle: 'Menu',
  };

  const topbarProps = {
    user,
  };

  return (
    <DashboardShellTemplate sidebarProps={sidebarProps} topbarProps={topbarProps}>
      {/* Breadcrumb Nav */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs font-bold text-[#8A9A95] tracking-wider uppercase mb-1"
      >
        <Link
          to="/bidang-2/pengajuan"
          className="hover:text-[#0E7C5A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] rounded px-1"
        >
          LIST PENGAJUAN
        </Link>
        <span aria-hidden="true">&gt;</span>
        <span className="text-[#14201C] px-1">DETAIL PERMOHONAN</span>
      </nav>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-6 animate-pulse">
          <div className="h-40 bg-[#EEF5F2] rounded-[24px]" />
          <div className="h-64 bg-white rounded-[24px] border border-[#E4EBE8] p-6 space-y-4">
            <div className="h-6 w-48 bg-[#EEF5F2] rounded" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-12 bg-[#EEF5F2] rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {!isLoading && (hasError || !permohonan) && (
        <div className="bg-white rounded-[24px] border border-[#E4EBE8] shadow-sm p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FDECEC] text-[#B42318] flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-[#14201C]">
            Gagal Memuat Detail Pengajuan
          </h2>
          <p className="text-xs md:text-sm text-[#5F6F6A] max-w-md mx-auto">
            {errorMessage || 'Permohonan tidak ditemukan atau terjadi kendala saat memuat data.'}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-xl bg-[#0E7C5A] text-white text-xs font-semibold hover:bg-[#0A5C43] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Coba Lagi</span>
              </button>
            )}
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-xl border border-[#E4EBE8] bg-white text-xs font-semibold text-[#14201C] hover:bg-[#F3F6F5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] cursor-pointer"
            >
              Kembali ke Daftar
            </button>
          </div>
        </div>
      )}

      {/* Success Content */}
      {!isLoading && permohonan && (
        <div className="space-y-6">
          {/* Flash Message Banner */}
          {flashMessage && (
            <div className="p-4 rounded-2xl bg-[#EEF5F2] border border-[#7FE0B8] text-[#0E7C5A] text-sm font-medium flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{flashMessage}</span>
              </div>
              {onCloseFlash && (
                <button
                  type="button"
                  onClick={onCloseFlash}
                  className="text-[#0E7C5A] hover:opacity-70 p-1 rounded transition-opacity"
                  aria-label="Tutup pemberitahuan"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Hero Banner with Custom Header Actions */}
          <div className="relative overflow-hidden bg-[#0E7C5A] text-white rounded-[24px] p-6 md:p-8 min-h-[148px] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_4px_20px_rgba(14,124,90,0.15)]">
            <div
              className="absolute -right-16 -top-16 w-[260px] h-[260px] rounded-full border border-white/10 pointer-events-none hidden sm:block"
              aria-hidden="true"
            />
            <div
              className="absolute -right-6 -bottom-12 w-[170px] h-[170px] rounded-full border border-white/15 pointer-events-none hidden sm:block"
              aria-hidden="true"
            />

            <div className="relative z-10 max-w-xl">
              <p className="text-[11px] font-bold tracking-[1.4px] text-white/75 uppercase mb-1">
                PERMOHONAN PENGADAAN
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  Detail Permohonan
                </h1>
                <StatusPill
                  status={permohonan.status}
                  label={permohonan.status === 'menunggu_bidang2' ? 'Review Permohonan' : undefined}
                />
              </div>
              <p className="text-xs md:text-sm text-white/85 mt-2 leading-relaxed">
                Nomor {permohonan.nomor_surat || '-'} · Diajukan {permohonan.tanggal_pengajuan || '-'}
              </p>
            </div>

            {/* Aksi Kanan: Tombol Dokumen RKAKL dan Kembali */}
            <div className="relative z-10 flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={onOpenRkakl}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#0E7C5A] text-xs md:text-sm font-semibold hover:bg-[#F3F6F5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white shadow-2xs cursor-pointer min-h-[44px]"
              >
                <FileText className="w-4 h-4 stroke-[2.2]" />
                <span>Dokumen RKAKL</span>
              </button>

              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 text-white text-xs md:text-sm font-semibold hover:bg-white/25 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer min-h-[44px]"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
                <span>Kembali</span>
              </button>
            </div>
          </div>

          {/* Card 1: Informasi Permohonan (Full Width) */}
          <InformasiPermohonanCard data={permohonan} />

          {/* Tata Letak 2 Kolom: Kiri (Dokumen Permohonan Live Preview) & Kanan (Catatan & Keputusan) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
              {/* Header Card Live Preview */}
              <div className="pb-4 mb-4 border-b border-[#F0F4F2] flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#14201C]">Dokumen Permohonan</h2>
                  <p className="text-xs text-[#5F6F6A] mt-0.5">
                    Surat permohonan pengadaan yang dilampirkan oleh unit pengaju
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#EAF6F1] text-[#0E7C5A]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0E7C5A]" aria-hidden="true" />
                  Live Preview
                </span>
              </div>

              {/* Action Bar File */}
              <div className="p-3.5 rounded-2xl bg-[#F4F7F5] border border-[#E4EBE8] flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#14201C] truncate" title={displayFileName}>
                      {displayFileName}
                    </p>
                    <p className="text-[11px] text-[#8A9A95]">PDF • {displaySize}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsPreviewModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E4EBE8] text-xs font-bold text-[#14201C] hover:bg-[#F8FAF9] transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#5F6F6A]" />
                    <span>Lihat</span>
                  </button>
                  {downloadUrl && (
                    <a
                      href={downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0E7C5A] hover:bg-[#0A5C43] text-white text-xs font-bold transition-colors shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Kontainer Live Preview: Menampilkan Berkas Nyata yang Diunggah Jurusan */}
              {!permohonan.dokumen ? (
                <div className="rounded-2xl bg-[#EFF3F1] p-8 text-center border border-[#E4EBE8]">
                  <FileText className="w-10 h-10 text-[#8A9A95] mx-auto mb-2" />
                  <p className="text-sm font-semibold text-[#14201C]">
                    Belum Ada Berkas yang Diunggah
                  </p>
                  <p className="text-xs text-[#5F6F6A] mt-1">
                    Jurusan pengaju belum melampirkan berkas dokumen surat permohonan fisik.
                  </p>
                </div>
              ) : isLoadingPdf ? (
                <div className="rounded-2xl bg-[#EFF3F1] p-12 text-center border border-[#E4EBE8] flex flex-col items-center justify-center gap-3 min-h-[460px]">
                  <Loader2 className="w-8 h-8 text-[#0E7C5A] animate-spin" />
                  <p className="text-xs font-semibold text-[#14201C]">
                    Memuat Berkas Surat Permohonan Jurusan...
                  </p>
                  <p className="text-[11px] text-[#5F6F6A]">
                    Menyiapkan pratinjau langsung dokumen yang diunggah pemohon.
                  </p>
                </div>
              ) : pdfBlobUrl && !pdfLoadFailed ? (
                <div className="rounded-2xl bg-[#EFF3F1] p-4 sm:p-5 border border-[#E4EBE8] space-y-3">
                  <iframe
                    src={`${pdfBlobUrl}#toolbar=0&navpanes=0`}
                    title={`Pratinjau Surat Permohonan - ${displayFileName}`}
                    className="w-full h-[520px] rounded-xl border border-[#E4EBE8] bg-white shadow-xs"
                  />
                  <div className="flex items-center justify-between px-2 text-xs text-[#5F6F6A]">
                    <span className="font-semibold text-[#14201C] truncate max-w-sm">
                      {displayFileName}
                    </span>
                    <span className="px-3 py-1 bg-[#0E7C5A] text-white rounded-full text-[10px] font-bold tracking-wide">
                      Dokumen Asli Jurusan
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-[#EFF3F1] p-8 text-center border border-[#E4EBE8] space-y-3">
                  <AlertCircle className="w-10 h-10 text-[#D92D20] mx-auto" />
                  <div>
                    <p className="text-sm font-semibold text-[#14201C]">
                      Pratinjau Langsung Tidak Tersedia
                    </p>
                    <p className="text-xs text-[#5F6F6A] mt-1">
                      Berkas fisik telah diunggah oleh jurusan. Anda dapat melihatnya lewat tombol Lihat atau mengunduhnya langsung.
                    </p>
                  </div>
                  {downloadUrl && (
                    <a
                      href={downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0E7C5A] text-white text-xs font-semibold hover:bg-[#0A5C43] transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Unduh Berkas Surat</span>
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="lg:col-span-5 space-y-6">
              <CatatanPerencanaanCard catatan={permohonan.catatan_perencanaan} />
              <KeputusanBidang2Card
                rkakl={permohonan.rkakl_aktif}
                onOpenRkakl={onOpenRkakl}
                onOpenTolakModal={() => onToggleTolakModal(true)}
                onOpenSetujuModal={() => onToggleSetujuModal(true)}
                status={permohonan.status}
                keputusan={permohonan.keputusan_bidang2}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal Unggah Memo Persetujuan */}
      <SetujuPermohonanModal
        isOpen={isSetujuModalOpen}
        onClose={() => onToggleSetujuModal(false)}
        onConfirm={onSetujuSubmit}
        nomorSurat={permohonan?.nomor_surat}
      />

      {/* Modal Tolak Permohonan */}
      <TolakPermohonanModal
        isOpen={isTolakModalOpen}
        onClose={() => onToggleTolakModal(false)}
        onConfirm={onTolakSubmit}
        nomorSurat={permohonan?.nomor_surat}
        judul={permohonan?.judul}
      />

      {/* Modal Pratinjau Dokumen Penuh */}
      <DocumentPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        category="Surat Permohonan"
        filename={displayFileName}
        size={`PDF • ${displaySize}`}
        downloadUrl={downloadUrl}
        blobUrl={pdfBlobUrl}
      />
    </DashboardShellTemplate>
  );
};

export default Bidang2PengajuanShowTemplate;
