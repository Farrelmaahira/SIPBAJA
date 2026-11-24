import type { FC } from 'react';
import { Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import AppLayout from '../General/AppLayout';
import HeroBanner from '../../organisms/HeroBanner';
import StatusPill from '../../atoms/StatusPill';
import InformasiPengadaanCard from '../../organisms/PP/InformasiPengadaanCard';
import TrackingPengadaanCard from '../../organisms/TrackingPengadaanCard';
import PimpinanPembayaranReviewCard from '../../organisms/Pembayaran/PimpinanPembayaranReviewCard';
import { BIDANG2_NAV_ITEMS } from '../../../constants/bidang2Nav';
import { formatRupiah, formatTanggalIndo } from '../../../utils/formatters';
import type { PpbjPembayaranContext } from '../../../types/ppbj';
import type { DokumenItem } from '../../../types/dokumen';
import type { ProfilePillUser } from '../../molecules/ProfilePill';

export interface Bidang2PengadaanShowTemplateProps {
  user?: ProfilePillUser | null;
  pengadaanId?: string;
  detailData: any;
  pembayaranContext: PpbjPembayaranContext | null;
  isLoading: boolean;
  isLoadingPembayaran: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  onCloseSuccess?: () => void;
  onCloseError?: () => void;
  isViewingDocId?: number | string | null;
  isDownloadingDocId?: number | string | null;
  onApprovePembayaran: (memo: File, catatan?: string) => Promise<void>;
  onRejectPembayaran: (alasan: string) => Promise<void>;
  onViewDokumen: (doc: DokumenItem) => void;
  onDownloadDokumen: (doc: DokumenItem) => void;
}

export const Bidang2PengadaanShowTemplate: FC<Bidang2PengadaanShowTemplateProps> = ({
  user,
  pengadaanId,
  detailData,
  pembayaranContext,
  isLoading,
  isLoadingPembayaran,
  errorMessage,
  successMessage,
  onCloseSuccess,
  onCloseError,
  isViewingDocId = null,
  isDownloadingDocId = null,
  onApprovePembayaran,
  onRejectPembayaran,
  onViewDokumen,
  onDownloadDokumen,
}) => {
  const pengadaan = detailData?.pengadaan;
  const tracking = detailData?.tracking;

  return (
    <AppLayout
      activeRoute="pengadaan"
      navItems={BIDANG2_NAV_ITEMS}
      roleInitials="WD2"
      roleTitle="Bidang 2"
      roleSubtitle="Wakil Direktur II"
      profileHref="/bidang-2/profil"
      notifikasiHref="/bidang-2/dashboard"
      user={user}
      breadcrumb={[
        { label: 'BIDANG 2', href: '/bidang-2/dashboard' },
        { label: 'LIST PENGADAAN', href: '/bidang-2/pengadaan' },
        { label: `DETAIL #${pengadaanId || '1'}` },
      ]}
    >
      <div className="space-y-6 pb-12">
        {/* Navigation & Header */}
        <div>
          <HeroBanner
            eyebrow={`DETAIL PENGADAAN #${pengadaanId || '1'}`}
            title={`Paket Pengadaan #${pengadaanId || '1'}`}
            description="Informasi rincian paket pengadaan barang dan jasa serta peninjauan persetujuan pembayaran."
          />
        </div>

        {/* Success Banner */}
        {successMessage && (
          <div className="p-4 bg-[#E4F6EC] border border-[#BDE8D1] rounded-[22px] text-xs font-bold text-[#0B7A4E] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#0E7C5A]" />
              <span>{successMessage}</span>
            </div>
            {onCloseSuccess && (
              <button
                type="button"
                onClick={onCloseSuccess}
                className="text-[#0E7C5A] hover:text-[#0A5C43] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Error Banner */}
        {errorMessage && (
          <div className="p-4 bg-[#FEF3F2] border border-[#FECDCA] rounded-[22px] text-xs text-[#B42318] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#D92D20]" />
              <span>{errorMessage}</span>
            </div>
            {onCloseError && (
              <button
                type="button"
                onClick={onCloseError}
                className="text-[#B42318] hover:text-[#7A271A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[360px] gap-3 bg-white rounded-[22px] border border-[#E4EBE8] p-8 shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
            <Loader2 className="w-8 h-8 animate-spin text-[#0E7C5A]" />
            <p className="text-sm font-semibold text-[#5F6F6A]">Memuat detail pengadaan...</p>
          </div>
        ) : (
          <>
            {/* 1. INFORMASI PENGADAAN CARD */}
            <InformasiPengadaanCard
              judul={pengadaan?.permohonan?.judul || pengadaan?.judul || 'Paket Pengadaan'}
              unitNama={pengadaan?.permohonan?.unit?.nama || pengadaan?.unit_nama || 'Unit Kerja'}
              nomorPengadaan={`#${pengadaan?.id || pengadaanId || '1'}`}
              nomorPermohonan={pengadaan?.permohonan?.nomor_surat || '-'}
              tanggalPengajuan={
                pengadaan?.permohonan?.created_at
                  ? formatTanggalIndo(pengadaan.permohonan.created_at, true)
                  : pengadaan?.created_at
                    ? formatTanggalIndo(pengadaan.created_at, true)
                    : '-'
              }
              jenisPengadaan={pengadaan?.jenis?.nama || '-'}
              metodePengadaan={pengadaan?.metode?.nama || '-'}
              levelPengadaan={pengadaan?.level?.nama || '-'}
              nominal={formatRupiah(
                pengadaan?.kontrak?.nominal_kontrak ?? pengadaan?.nominal ?? 0,
              )}
              statusPpLabel={pengadaan?.level?.perlu_review_pp ? 'Memerlukan Verifikasi PP' : 'Bypass PP'}
              statusPengadaanPill={<StatusPill status={pengadaan?.status || 'review_pengajuan'} />}
            />

            {/* 2. TRACKING PROSES PENGADAAN (FR-05) */}
            <TrackingPengadaanCard
              statusPengadaan={pengadaan?.status}
              stepper={tracking?.stepper}
              timeline={tracking?.timeline}
            />

            {/* 3. CARD REVIEW & PERSETUJUAN PEMBAYARAN BIDANG 2 (FR-55, FR-56, FR-57) */}
            {pembayaranContext?.pembayaran && (
              <PimpinanPembayaranReviewCard
                role="BIDANG2"
                context={pembayaranContext}
                isLoading={isLoadingPembayaran}
                onApprove={onApprovePembayaran}
                onReject={onRejectPembayaran}
                onViewDokumen={onViewDokumen}
                onDownloadDokumen={onDownloadDokumen}
                isViewingDocId={isViewingDocId}
                isDownloadingDocId={isDownloadingDocId}
                autoExpand={false}
              />
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Bidang2PengadaanShowTemplate;
