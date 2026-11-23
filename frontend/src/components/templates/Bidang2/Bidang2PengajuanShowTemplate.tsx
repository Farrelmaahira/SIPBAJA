import { useState, type FC } from 'react';
import {
  FileText,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  X,
} from 'lucide-react';
import AppLayout from '../General/AppLayout';
import HeroBanner from '../../organisms/HeroBanner';
import StatusPill from '../../atoms/StatusPill';
import DocumentPreviewModal from '../../organisms/DocumentPreviewModal';
import DokumenListCard from '../../organisms/DokumenListCard';
import { PermohonanInfoSection } from '../../organisms/PermohonanInfoSection';
import CatatanPerencanaanCard from '../../organisms/Bidang2/CatatanPerencanaanCard';
import KeputusanBidang2Card from '../../organisms/Bidang2/KeputusanBidang2Card';
import SetujuPermohonanModal from '../../organisms/Bidang2/SetujuPermohonanModal';
import TolakPermohonanModal from '../../organisms/Bidang2/TolakPermohonanModal';
import { BIDANG2_NAV_ITEMS } from '../../../constants/bidang2Nav';
import type { Bidang2DetailPengajuan } from '../../../types/bidang2';
import type { DokumenItem } from '../../../types/dokumen';
import type { ProfilePillUser } from '../../molecules/ProfilePill';

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
  dokumenList?: DokumenItem[];
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  flashMessage?: string | null;
  onCloseFlash?: () => void;
  previewBlobUrl?: string | null;
  previewDocId?: number | string | null;
  isLoadingPreview?: boolean;
  isViewingDocId?: number | string | null;
  isDownloadingDocId?: number | string | null;
  onViewDokumen?: (doc: DokumenItem) => void;
  onDownloadDokumen?: (doc: DokumenItem) => void;
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
  dokumenList,
  isLoading,
  hasError,
  errorMessage,
  flashMessage,
  onCloseFlash,
  previewBlobUrl = null,
  previewDocId = null,
  isLoadingPreview = false,
  isViewingDocId = null,
  isDownloadingDocId = null,
  onViewDokumen,
  onDownloadDokumen,
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

  return (
    <AppLayout
      activeRoute="pengajuan"
      navItems={BIDANG2_NAV_ITEMS}
      roleInitials="WD2"
      roleTitle="Bidang 2"
      roleSubtitle="Wakil Direktur II"
      profileHref="/bidang-2/profil"
      notifikasiHref="/bidang-2/dashboard"
      user={user}
      breadcrumb={[
        { label: 'BIDANG 2', href: '/bidang-2/dashboard' },
        { label: 'LIST PERMOHONAN', href: '/bidang-2/permohonan' },
        { label: 'DETAIL PERMOHONAN' },
      ]}
    >
      <div className="space-y-6">

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
            <HeroBanner
              eyebrow="PERMOHONAN PENGADAAN"
              title={
                <div className="flex flex-wrap items-center gap-3">
                  <span>Detail Permohonan</span>
                  <StatusPill
                    status={permohonan.status}
                    label={permohonan.status === 'menunggu_bidang2' ? 'Review Permohonan' : undefined}
                  />
                </div>
              }
              description={`Nomor ${permohonan.nomor_surat || '-'} · Diajukan ${permohonan.tanggal_pengajuan || '-'}`}
              ctaLabel="Dokumen RKAKL"
              ctaIcon={FileText}
              ctaVariant="translucent"
              onCta={onOpenRkakl}
              className="md:min-h-[148px]"
            />

            {/* Card 1: Informasi Permohonan (Full Width) */}
            <PermohonanInfoSection
              permohonan={{
                nomor_surat: permohonan.nomor_surat,
                created_at: permohonan.tanggal_pengajuan,
                judul: permohonan.judul,
                unit_nama: permohonan.unit_nama,
                estimasi_anggaran: permohonan.estimasi_anggaran,
                status: permohonan.status,
              }}
            />

            {/* Tata Letak 2 Kolom: Kiri (Dokumen Permohonan Live Preview) & Kanan (Jenis MAK, Catatan & Keputusan) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7">
                <DokumenListCard
                  title="Dokumen Permohonan"
                  dokumenList={
                    dokumenList ||
                    (permohonan.dokumen
                      ? [
                        {
                          id: permohonan.dokumen.id || permohonan.id,
                          nama_asli:
                            permohonan.dokumen.nama_asli ||
                            `Surat_Permohonan_${(permohonan.judul || 'Pengadaan').replace(/\s+/g, '_')}.pdf`,
                          tipe_dokumen: 'surat_permohonan',
                          ukuran_bytes: permohonan.dokumen.ukuran_bytes,
                          mime_type: permohonan.dokumen.mime_type || 'application/pdf',
                          download_url:
                            permohonan.dokumen.download_url ||
                            `/api/v1/bidang-2/permohonan/${permohonan.id}/dokumen`,
                        },
                      ]
                      : [])
                  }
                  nomorSurat={permohonan.nomor_surat}
                  judul={permohonan.judul}
                  unitNama={permohonan.unit_nama}
                  tanggal={permohonan.tanggal_pengajuan}
                  onViewNewTab={onViewDokumen}
                  onDownload={onDownloadDokumen}
                  isViewingId={isViewingDocId}
                  isDownloadingId={isDownloadingDocId}
                  previewBlobUrl={previewBlobUrl}
                  previewDocId={previewDocId}
                  isLoadingPreview={isLoadingPreview}
                />
              </div>

              <div className="lg:col-span-5 space-y-6">
                <CatatanPerencanaanCard
                  catatan={permohonan.catatan_perencanaan}
                  makList={permohonan.mak_list}
                />
                <KeputusanBidang2Card
                  rkakl={permohonan.rkakl_aktif}
                  onOpenRkakl={onOpenRkakl}
                  onOpenTolakModal={() => onToggleTolakModal(true)}
                  onOpenSetujuModal={() => onToggleSetujuModal(true)}
                  status={permohonan.status}
                  keputusan={permohonan.keputusan_bidang2}
                  isMakDetermined={Boolean(
                    permohonan.is_mak_determined ??
                    (permohonan.mak_list && permohonan.mak_list.length > 0)
                  )}
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
          blobUrl={previewBlobUrl}
        />
      </div>
    </AppLayout>
  );
};

export default Bidang2PengajuanShowTemplate;
