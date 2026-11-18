import { useState, useEffect, useMemo, type FC } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Hash,
  FileText,
  Banknote,
  Calendar,
  Building2,
  Activity,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  X,
} from 'lucide-react';
import AppLayout from '../General/AppLayout';
import HeroBanner from '../../organisms/HeroBanner';
import StatusPill from '../../atoms/StatusPill';
import CatatanPenolakanCard from '../../molecules/CatatanPenolakanCard';
import DokumenListCard from '../../organisms/DokumenListCard';
import pemohonService from '../../../services/pemohonService';
import { formatRupiah, formatTanggal } from '../../../utils/formatPermohonan';
import { PEMOHON_NAV_ITEMS } from '../../../constants/pemohonNav';
import type { PermohonanDetailInfo } from '../../../types/permohonan';
import type { ProfilePillUser } from '../../molecules/ProfilePill';
import type { DokumenItem } from '../../../types/dokumen';

export interface PemohonPermohonanShowTemplateProps {
  user?: ProfilePillUser | null;
  permohonan: PermohonanDetailInfo | null;
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  flashMessage?: string | null;
  onCloseFlash?: () => void;
  onRetry: () => void;
  onBack: () => void;
  onRevisi: () => void;
}

export const PemohonPermohonanShowTemplate: FC<
  PemohonPermohonanShowTemplateProps
> = ({
  permohonan,
  isLoading,
  hasError,
  errorMessage,
  flashMessage,
  onCloseFlash,
  onRetry,
  onBack,
  onRevisi,
}) => {
    const isDitolak = permohonan?.status === 'ditolak';

    const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
    const [previewDocId, setPreviewDocId] = useState<number | string | null>(null);
    const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);
    const [isViewingDocId, setIsViewingDocId] = useState<number | string | null>(null);
    const [isDownloadingDocId, setIsDownloadingDocId] = useState<number | string | null>(null);

    const dokumenList: DokumenItem[] = useMemo(() => {
      if (!permohonan) return [];

      const rawList = Array.isArray(permohonan.dokumen)
        ? permohonan.dokumen
        : permohonan.dokumen
          ? [permohonan.dokumen]
          : [];

      if (rawList.length === 0) {
        return [
          {
            id: permohonan.id ?? '1',
            nama_asli: `Surat_Permohonan_${(permohonan.judul || 'Pengadaan').replace(/\s+/g, '_')}.pdf`,
            tipe_dokumen: 'surat_permohonan',
            download_url: `/api/v1/pemohon/permohonan/${permohonan.id}/dokumen`,
          },
        ];
      }

      return rawList.map((d: any, idx: number) => ({
        id: d.id || idx + 1,
        nama_asli:
          d.nama_asli ||
          `Surat_Permohonan_${(permohonan.judul || 'Pengadaan').replace(/\s+/g, '_')}.pdf`,
        tipe_dokumen: d.tipe_dokumen || 'surat_permohonan',
        ukuran_bytes: d.ukuran_bytes,
        mime_type: d.mime_type || 'application/pdf',
        download_url:
          d.download_url || `/api/v1/pemohon/permohonan/${permohonan.id}/dokumen`,
      }));
    }, [permohonan]);

    // Preload preview blob for the surat_permohonan document (matching Perencanaan & Bidang 2)
    useEffect(() => {
      const targetDoc =
        dokumenList.find(
          (d) => d.tipe_dokumen === 'surat_permohonan' || d.tipe_dokumen === 'permohonan'
        ) || dokumenList[0];

      if (!targetDoc?.download_url) {
        setPreviewBlobUrl(null);
        setPreviewDocId(null);
        setIsLoadingPreview(false);
        return;
      }

      let isMounted = true;
      let currentBlobUrl: string | null = null;
      const controller = new AbortController();

      setIsLoadingPreview(true);
      setPreviewDocId(targetDoc.id);

      pemohonService
        .fetchDokumenBlob(targetDoc.download_url, 'inline', controller.signal)
        .then(({ blob }) => {
          if (!isMounted) return;
          currentBlobUrl = URL.createObjectURL(blob);
          setPreviewBlobUrl(currentBlobUrl);
        })
        .catch((err) => {
          if (!isMounted || controller.signal.aborted) return;
          console.error('Gagal memuat pratinjau inline dokumen:', err);
        })
        .finally(() => {
          if (isMounted) {
            setIsLoadingPreview(false);
          }
        });

      return () => {
        isMounted = false;
        controller.abort();
        if (currentBlobUrl) {
          URL.revokeObjectURL(currentBlobUrl);
        }
      };
    }, [dokumenList]);

    const handleViewNewTab = async (doc: DokumenItem) => {
      if (!doc.download_url) return;
      setIsViewingDocId(doc.id);
      try {
        const { blob } = await pemohonService.fetchDokumenBlob(doc.download_url, 'inline');
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
      } catch (err) {
        console.error('Gagal membuka dokumen:', err);
      } finally {
        setIsViewingDocId(null);
      }
    };

    const handleDownload = async (doc: DokumenItem) => {
      if (!doc.download_url) return;
      setIsDownloadingDocId(doc.id);
      try {
        const { blob } = await pemohonService.fetchDokumenBlob(doc.download_url, 'attachment');
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = doc.nama_asli || 'Dokumen.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
      } catch (err) {
        console.error('Gagal mengunduh dokumen:', err);
      } finally {
        setIsDownloadingDocId(null);
      }
    };

    return (
      <AppLayout
        activeRoute="permohonan"
        navItems={PEMOHON_NAV_ITEMS}
        roleInitials="PM"
        roleTitle="Pemohon"
        roleSubtitle="Unit Pemohon"
        profileHref="/pemohon/dashboard"
        notifikasiHref="/pemohon/dashboard"
      >
        {/* Breadcrumb Nav */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-bold text-[#8A9A95] tracking-wider uppercase mb-1"
        >
          <Link
            to="/pemohon/permohonan"
            className="hover:text-[#0E7C5A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] rounded px-1"
          >
            LIST PERMOHONAN
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
              Gagal Memuat Detail Permohonan
            </h2>
            <p className="text-xs md:text-sm text-[#5F6F6A] max-w-md mx-auto">
              {errorMessage ||
                'Permohonan tidak ditemukan atau terjadi kendala saat memuat data.'}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-xl bg-[#0E7C5A] text-white text-xs font-semibold hover:bg-[#0A5C43] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Coba Lagi</span>
              </button>
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

            {/* Hero Banner with Status Pill & Back CTA */}
            <HeroBanner
              eyebrow="PERMOHONAN PENGADAAN"
              title={
                <div className="flex flex-wrap items-center gap-3">
                  <span>Detail Permohonan</span>
                  <StatusPill status={permohonan.status} />
                </div>
              }
              description={`Nomor ${permohonan.nomor_surat || '-'} · Diajukan ${formatTanggal(permohonan.created_at)}`}
              ctaLabel="Kembali"
              ctaIcon={ArrowLeft}
              ctaVariant="translucent"
              onCta={onBack}
            />

            {/* Informasi Permohonan */}
            <section
              className="bg-white rounded-[24px] border border-[#E4EBE8] shadow-[0_4px_16px_rgba(20,32,28,0.04)] p-6 md:p-8 space-y-6"
              aria-labelledby="info-permohonan-title"
            >
              <div>
                <h2
                  id="info-permohonan-title"
                  className="text-lg md:text-xl font-bold text-[#14201C]"
                >
                  Informasi Permohonan
                </h2>
                <p className="text-xs md:text-sm text-[#5F6F6A] mt-0.5">
                  Ringkasan data yang diajukan
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 pt-2">
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-10 h-10 rounded-xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0 shadow-xs"
                    aria-hidden="true"
                  >
                    <Hash className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#5F6F6A]">Nomor Permohonan</p>
                    <p className="text-sm font-bold text-[#14201C] mt-0.5">
                      {permohonan.nomor_surat || '-'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div
                    className="w-10 h-10 rounded-xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0 shadow-xs"
                    aria-hidden="true"
                  >
                    <Calendar className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#5F6F6A]">Tanggal Pengajuan</p>
                    <p className="text-sm font-bold text-[#14201C] mt-0.5">
                      {formatTanggal(permohonan.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div
                    className="w-10 h-10 rounded-xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0 shadow-xs"
                    aria-hidden="true"
                  >
                    <FileText className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#5F6F6A]">Judul Permohonan</p>
                    <p className="text-sm font-bold text-[#14201C] mt-0.5">
                      {permohonan.judul || '-'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div
                    className="w-10 h-10 rounded-xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0 shadow-xs"
                    aria-hidden="true"
                  >
                    <Building2 className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#5F6F6A]">Diajukan Oleh</p>
                    <p className="text-sm font-bold text-[#14201C] mt-0.5">
                      {permohonan.unit_nama || permohonan.pembuat_nama || '-'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div
                    className="w-10 h-10 rounded-xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0 shadow-xs"
                    aria-hidden="true"
                  >
                    <Banknote className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#5F6F6A]">Nominal/Estimasi</p>
                    <p className="text-sm font-bold text-[#14201C] mt-0.5">
                      {formatRupiah(permohonan.estimasi_anggaran)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div
                    className="w-10 h-10 rounded-xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0 shadow-xs"
                    aria-hidden="true"
                  >
                    <Activity className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#5F6F6A] mb-1">Status</p>
                    <StatusPill status={permohonan.status} />
                  </div>
                </div>
              </div>
            </section>

            {/* Conditional Layouts based on Status */}
            {isDitolak ? (
              <div className="space-y-6">
                <CatatanPenolakanCard
                  catatan={permohonan.catatan_penolakan}
                  onRevisi={onRevisi}
                />

                <DokumenListCard
                  title="Dokumen Surat Permohonan"
                  dokumenList={dokumenList}
                  nomorSurat={permohonan.nomor_surat}
                  judul={permohonan.judul}
                  unitNama={permohonan.unit_nama}
                  tanggal={formatTanggal(permohonan.created_at)}
                  onViewNewTab={handleViewNewTab}
                  onDownload={handleDownload}
                  isViewingId={isViewingDocId}
                  isDownloadingId={isDownloadingDocId}
                  previewBlobUrl={previewBlobUrl}
                  previewDocId={previewDocId}
                  isLoadingPreview={isLoadingPreview}
                />
              </div>
            ) : (
              <div className="w-full">
                <DokumenListCard
                  title="Dokumen Surat Permohonan"
                  dokumenList={dokumenList}
                  nomorSurat={permohonan.nomor_surat}
                  judul={permohonan.judul}
                  unitNama={permohonan.unit_nama}
                  tanggal={formatTanggal(permohonan.created_at)}
                  onViewNewTab={handleViewNewTab}
                  onDownload={handleDownload}
                  isViewingId={isViewingDocId}
                  isDownloadingId={isDownloadingDocId}
                  previewBlobUrl={previewBlobUrl}
                  previewDocId={previewDocId}
                  isLoadingPreview={isLoadingPreview}
                />
              </div>
            )}
          </div>
        )}
      </AppLayout>
    );
  };

export default PemohonPermohonanShowTemplate;

