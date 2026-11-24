import { useState, useEffect, useMemo, type FC } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  X,
  AlertCircle,
  Pencil,
  Trash2,
} from 'lucide-react';
import AppLayout from '../General/AppLayout';
import HeroBanner from '../../organisms/HeroBanner';
import StatusPill from '../../atoms/StatusPill';
import Modal from '../../organisms/Modal';
import CatatanPenolakanCard from '../../molecules/CatatanPenolakanCard';
import DokumenListCard from '../../organisms/DokumenListCard';
import TrackingPengadaanCard from '../../organisms/TrackingPengadaanCard';
import { PermohonanInfoSection } from '../../organisms/PermohonanInfoSection';
import pemohonService from '../../../services/pemohonService';
import { PEMOHON_NAV_ITEMS } from '../../../constants/pemohonNav';
import { formatTanggal } from '../../../utils/formatPermohonan';
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
  onDelete?: () => void;
  isDeleting?: boolean;
  deleteModalOpen?: boolean;
  onConfirmDelete?: () => void;
  onCancelDelete?: () => void;
}

export const PemohonPermohonanShowTemplate: FC<
  PemohonPermohonanShowTemplateProps
> = ({
  user = null,
  permohonan,
  isLoading,
  hasError,
  errorMessage,
  flashMessage,
  onCloseFlash,
  onRetry,
  onBack,
  onRevisi,
  onDelete,
  isDeleting = false,
  deleteModalOpen = false,
  onConfirmDelete,
  onCancelDelete,
}) => {
    const isDitolak = permohonan?.status === 'ditolak';

    const canModifyOrDelete = useMemo(() => {
      if (!permohonan) return false;
      const s = (permohonan.status || '').toLowerCase();
      const nonModifiable = [
        'menunggu_persetujuan',
        'disetujui',
        'diproses_ppbj',
        'pengadaan',
        'siap_spk',
        'kontrak_terbit',
        'berjalan',
        'barang_diterima',
        'selesai',
      ];
      return !nonModifiable.includes(s);
    }, [permohonan]);

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
        user={user}
        activeRoute="permohonan"
        navItems={PEMOHON_NAV_ITEMS}
        roleInitials="PM"
        roleTitle="Pemohon"
        roleSubtitle="Unit Pemohon"
        profileHref="/pemohon/profil"
        notifikasiHref="/pemohon/notifikasi"
        breadcrumb={[
          {
            label: 'Dashboard',
            href: '/pemohon/dashboard'
          },
          {
            label: 'Detail Permohonan',
            href: `/pemohon/permohonan/${permohonan?.id}`
          },
        ]}
      >
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
            <PermohonanInfoSection permohonan={permohonan} />

            {/* Catatan Penolakan jika status ditolak */}
            {isDitolak && (
              <CatatanPenolakanCard
                catatan={permohonan.catatan_penolakan}
                onRevisi={onRevisi}
              />
            )}

            {/* Tracking Pengadaan List - Sesuai dengan jumlah pengadaan pada permohonan tersebut */}
            {permohonan.pengadaan && permohonan.pengadaan.length > 0 && (
              <div className="space-y-6">
                {permohonan.pengadaan.map((pgd, idx) => (
                  <TrackingPengadaanCard
                    key={pgd.id ?? idx}
                    nomorPengadaan={pgd.nomor_pengadaan}
                    judulPengadaan={pgd.judul || permohonan.judul || 'Pengadaan'}
                    nominal={pgd.nominal ?? permohonan.estimasi_anggaran ?? undefined}
                    statusPengadaan={pgd.status}
                    statusLabel={pgd.status_label}
                    stepper={pgd.stepper}
                    timeline={pgd.timeline}
                  />
                ))}
              </div>
            )}

            {/* Dokumen Surat Permohonan */}
            <DokumenListCard
              title="Surat Permohonan"
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

            {/* Aksi Pengelolaan Permohonan: Ubah & Batalkan / Hapus (Kondisi belum diproses/disetujui) */}
            {canModifyOrDelete && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-[#E4EBE8] shadow-xs">
                <div>
                  <h4 className="text-sm font-bold text-[#14201C]">Kelola Permohonan</h4>
                  <p className="text-xs text-[#5F6F6A] mt-0.5">
                    Permohonan ini belum diproses atau disetujui pada tahapan selanjutnya, sehingga Anda masih dapat melakukan perubahan data atau membatalkannya.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  {onRevisi && (
                    <button
                      type="button"
                      onClick={onRevisi}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl border border-[#0E7C5A] bg-[#EEF5F2] hover:bg-[#E0EFEA] text-[#0E7C5A] text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>{isDitolak ? 'Revisi Permohonan' : 'Ubah Permohonan'}</span>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={onDelete}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl border border-[#FECDCA] bg-white hover:bg-[#FEE4E2]/60 text-[#D92D20] text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Batalkan Permohonan</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <Modal
          open={deleteModalOpen}
          onClose={onCancelDelete || (() => {})}
          title="Batalkan / Hapus Permohonan"
          footer={
            <>
              <button
                type="button"
                onClick={onCancelDelete}
                className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-xl border border-[#E4EBE8] text-sm font-semibold text-[#5F6F6A] hover:bg-[#EEF5F2] transition-colors cursor-pointer"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={onConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-xl bg-[#D92D20] text-sm font-semibold text-white hover:bg-[#B42318] transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Batalkan & Hapus'}
              </button>
            </>
          }
        >
          <p className="text-sm text-[#5F6F6A]">
            Apakah Anda yakin ingin membatalkan dan menghapus permohonan{' '}
            <strong className="text-[#14201C]">{permohonan?.nomor_surat || 'ini'}</strong>?
            Data permohonan dan berkas pendukung yang telah dihapus tidak dapat dipulihkan.
          </p>
        </Modal>
      </AppLayout>
    );
  };

export default PemohonPermohonanShowTemplate;

