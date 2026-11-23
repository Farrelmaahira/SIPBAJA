import { useState, useEffect, type FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import AppLayout from '../../../components/templates/General/AppLayout';
import HeroBanner from '../../../components/organisms/HeroBanner';
import StatusPill from '../../../components/atoms/StatusPill';
import InformasiPengadaanCard from '../../../components/organisms/PP/InformasiPengadaanCard';
import TrackingPengadaanCard from '../../../components/organisms/TrackingPengadaanCard';
import PimpinanPembayaranReviewCard from '../../../components/organisms/Pembayaran/PimpinanPembayaranReviewCard';
import DocumentPreviewModal from '../../../components/organisms/DocumentPreviewModal';
import { BIDANG2_NAV_ITEMS } from '../../../constants/bidang2Nav';
import { formatRupiah, formatTanggalIndo } from '../../../utils/formatters';
import { bidang2Service } from '../../../services/bidang2Service';
import type { PpbjPembayaranContext } from '../../../types/ppbj';
import type { DokumenItem } from '../../../types/dokumen';

export const Bidang2PengadaanShow: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [detailData, setDetailData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [pembayaranContext, setPembayaranContext] = useState<PpbjPembayaranContext | null>(null);
  const [isLoadingPembayaran, setIsLoadingPembayaran] = useState<boolean>(false);

  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewDocId, setPreviewDocId] = useState<number | string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);

  const fetchPembayaranContext = (signal?: AbortSignal) => {
    if (!id) return;
    setIsLoadingPembayaran(true);
    bidang2Service
      .getPembayaranReview(id, signal)
      .then((data) => setPembayaranContext(data))
      .catch((err) => {
        if (err?.name !== 'CanceledError') {
          // ignore context error
        }
      })
      .finally(() => setIsLoadingPembayaran(false));
  };

  const fetchDetail = (signal?: AbortSignal) => {
    if (!id) return;
    setIsLoading(true);

    bidang2Service
      .getPengadaanDetail(id, signal)
      .then((data) => {
        setDetailData(data);
      })
      .catch((err) => {
        if (err?.name !== 'CanceledError') {
          setErrorMessage('Gagal memuat detail pengadaan.');
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    fetchDetail(controller.signal);
    fetchPembayaranContext(controller.signal);
    return () => controller.abort();
  }, [id]);

  const handleApprove = async (memo: File, catatan?: string) => {
    if (!id) return;
    const res = await bidang2Service.approvePembayaran(id, memo, catatan);
    setSuccessMessage(res.message || 'Persetujuan pembayaran berhasil dikirim.');
    fetchPembayaranContext();
    fetchDetail();
  };

  const handleReject = async (alasan: string) => {
    if (!id) return;
    const res = await bidang2Service.rejectPembayaran(id, alasan);
    setSuccessMessage(res.message || 'Penolakan pembayaran berhasil dikirim.');
    fetchPembayaranContext();
    fetchDetail();
  };

  const handleViewDokumen = async (doc: DokumenItem) => {
    if (!doc.download_url) return;
    setIsLoadingPreview(true);
    setPreviewDocId(doc.id);
    try {
      const blob = await bidang2Service.getDokumenBlob(doc.download_url);
      const url = URL.createObjectURL(blob);
      setPreviewBlobUrl(url);
    } catch {
      setErrorMessage('Gagal membuka pratinjau dokumen.');
      setPreviewDocId(null);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleDownloadDokumen = async (doc: DokumenItem) => {
    if (!doc.download_url) return;
    try {
      const blob = await bidang2Service.getDokumenBlob(doc.download_url);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.nama_asli || 'dokumen.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setErrorMessage('Gagal mengunduh dokumen.');
    }
  };

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
        { label: `DETAIL #${id || '1'}` },
      ]}
    >
      <div className="space-y-6 pb-12">
        <div>
          <button
            type="button"
            onClick={() => navigate('/bidang-2/pengadaan')}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#0E7C5A] hover:underline cursor-pointer mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar Pengadaan</span>
          </button>
          <HeroBanner
            eyebrow={`DETAIL PENGADAAN #${id || '1'}`}
            title={`Paket Pengadaan #${id || '1'}`}
            description="Informasi rincian paket pengadaan barang dan jasa."
          />
        </div>

        {successMessage && (
          <div className="p-4 bg-[#E4F6EC] border border-[#BDE8D1] rounded-[22px] text-xs font-bold text-[#0B7A4E]">
            {successMessage}
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[360px] gap-3 bg-white rounded-[22px] border border-[#E4EBE8] p-8">
            <Loader2 className="w-8 h-8 animate-spin text-[#0E7C5A]" />
            <p className="text-sm font-semibold text-[#5F6F6A]">Memuat detail pengadaan...</p>
          </div>
        ) : errorMessage ? (
          <div className="p-6 bg-[#FEF3F2] border border-[#FECDCA] rounded-[22px] text-xs text-[#B42318] text-center">
            {errorMessage}
          </div>
        ) : (
          <>
            {/* 1. INFORMASI PENGADAAN CARD */}
            <InformasiPengadaanCard
              judul={pengadaan?.permohonan?.judul || pengadaan?.judul || 'Paket Pengadaan'}
              unitNama={pengadaan?.permohonan?.unit?.nama || pengadaan?.unit_nama || 'Unit Kerja'}
              nomorPengadaan={`#${pengadaan?.id || id}`}
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
              nominal={formatRupiah(pengadaan?.nominal || 0)}
              statusPpLabel={pengadaan?.level?.perlu_review_pp ? 'Memerlukan Verifikasi PP' : 'Bypass PP'}
              statusPengadaanPill={<StatusPill status={pengadaan?.status || 'review_pengajuan'} />}
            />

            {/* 2. TRACKING PROSES PENGADAAN (FR-05) - Selalu di bawah Informasi Pengadaan */}
            <TrackingPengadaanCard
              statusPengadaan={pengadaan?.status}
              stepper={tracking?.stepper}
              timeline={tracking?.timeline}
            />

            {/* 3. CARD REVIEW & PERSETUJUAN PEMBAYARAN BIDANG 2 (FR-55, FR-56, FR-57) - Di paling bawah */}
            {pembayaranContext?.pembayaran && (
              <PimpinanPembayaranReviewCard
                role="BIDANG2"
                context={pembayaranContext}
                isLoading={isLoadingPembayaran}
                onApprove={handleApprove}
                onReject={handleReject}
                onViewDokumen={handleViewDokumen}
                onDownloadDokumen={handleDownloadDokumen}
                previewBlobUrl={previewBlobUrl}
                previewDocId={previewDocId}
                isLoadingPreview={isLoadingPreview}
              />
            )}

            {/* Document Preview Modal */}
            {previewDocId && previewBlobUrl && (
              <DocumentPreviewModal
                open={Boolean(previewDocId)}
                onClose={() => {
                  if (previewBlobUrl) {
                    URL.revokeObjectURL(previewBlobUrl);
                  }
                  setPreviewBlobUrl(null);
                  setPreviewDocId(null);
                }}
                blobUrl={previewBlobUrl}
                label="Pratinjau Dokumen"
              />
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Bidang2PengadaanShow;
