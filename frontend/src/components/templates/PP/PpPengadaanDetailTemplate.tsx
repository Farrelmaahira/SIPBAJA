import { useState, useEffect, useMemo, type FC } from 'react';
import {
  ArrowLeft,
  FileText,
  Tag,
  CheckCircle2,
  XCircle,
  Download,
  AlertCircle,
  UserCheck,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import AppLayout, { type AppNavItem as PpNavItem } from '../General/AppLayout';
import HeroBanner from '../../organisms/HeroBanner';
import { InformasiPengadaanCard } from '../../organisms/PP/InformasiPengadaanCard';
import { CatatanRevisiCard } from '../../organisms/PP/CatatanRevisiCard';
import DocumentCard from '../../organisms/DocumentCard';
import KonfirmasiApproveModal from '../../organisms/KonfirmasiApproveModal';
import TolakPengadaanModal from '../../organisms/TolakPengadaanModal';
import { ppService } from '../../../services/ppService';
import { formatBytes } from '../../../utils/formatters';
import type {
  PpPengadaanDetailPayload,
  PpMakItem,
} from '../../../types/pp';
import type { NotificationItem } from '../../../types/notification';
import type { DokumenItem } from '../../../types/dokumen';
import { PP_NAV_ITEMS } from '@/constants/ppNav';

export interface PpPengadaanDetailTemplateProps {
  detail?: PpPengadaanDetailPayload;
  recentNotifications?: NotificationItem[];
  unreadNotificationsCount?: number;
  basePath?: string;
  roleInitials?: string;
  roleTitle?: string | null;
  roleSubtitle?: string | null;
  navItems?: PpNavItem[] | null;
  keputusanTitle?: string;
  keputusanNote?: string;
  confirmApproveOpen: boolean;
  rejectOpen: boolean;
  submitting: boolean;
  rejectError: string;
  flashError?: string;
  onOpenConfirmApprove: () => void;
  onCloseConfirmApprove: () => void;
  onConfirmApprove: () => void;
  onOpenReject: () => void;
  onCloseReject: () => void;
  onConfirmReject: (alasan: string) => void;
}

export const PpPengadaanDetailTemplate: FC<PpPengadaanDetailTemplateProps> = ({
  detail = {},
  recentNotifications = [],
  unreadNotificationsCount = 0,
  basePath = '/pp',
  roleInitials = 'PP',
  roleTitle = 'Pejabat Pengadaan',
  roleSubtitle = 'PP - Pengadaan Barang/Jasa',
  navItems = null,
  keputusanTitle = 'Keputusan PP',
  keputusanNote = 'Khusus pengadaan Rp50 – 200 juta. Pastikan dokumen dan data sudah sesuai.',
  confirmApproveOpen,
  rejectOpen,
  submitting,
  rejectError,
  flashError = '',
  onOpenConfirmApprove,
  onCloseConfirmApprove,
  onConfirmApprove,
  onOpenReject,
  onCloseReject,
  onConfirmReject,
}) => {
  const pengadaan = detail.pengadaan || { id: 0 };
  const permohonan = pengadaan.permohonan || pengadaan.Permohonan || {};
  const unit = permohonan.unit || permohonan.Unit;
  const makData = (pengadaan as { permohonan_mak?: { mak?: { ppk?: { nama?: string } } }; PermohonanMak?: { Mak?: { Ppk?: { nama?: string } } } });
  const ppk = pengadaan.ppk || pengadaan.Ppk || makData.permohonan_mak?.mak?.ppk || makData.PermohonanMak?.Mak?.Ppk;
  const jenis = pengadaan.jenis || pengadaan.Jenis;
  const metode = pengadaan.metode || pengadaan.Metode;
  const level = pengadaan.level || pengadaan.Level;
  const makList: PpMakItem[] = detail.mak_list || [];

  const rawDokumenPengadaan: DokumenItem[] = Array.isArray(detail.dokumen_pengadaan)
    ? (detail.dokumen_pengadaan as DokumenItem[])
    : detail.dokumen_pengadaan
      ? [detail.dokumen_pengadaan as DokumenItem]
      : [];
  const rawDokumenPermohonan: DokumenItem[] = Array.isArray(detail.dokumen_permohonan)
    ? (detail.dokumen_permohonan as DokumenItem[])
    : detail.dokumen_permohonan
      ? [detail.dokumen_permohonan as DokumenItem]
      : [];

  // Cari file dokumen pengadaan utama
  const primaryDokumenPengadaan = useMemo(() => {
    return (
      rawDokumenPengadaan.find((d) => d.tipe_dokumen === 'dokumen_pengadaan') ||
      rawDokumenPengadaan[0] ||
      null
    );
  }, [rawDokumenPengadaan]);

  // Cari dokumen surat permohonan dan memo persetujuan
  const suratPermohonanDoc = useMemo(() => {
    return rawDokumenPermohonan.find(
      (d) => d.tipe_dokumen === 'surat_permohonan' || d.tipe_dokumen === 'permohonan'
    );
  }, [rawDokumenPermohonan]);

  // Memo Persetujuan 1: Dari Bidang 2
  const memoBidang2Doc = useMemo(() => {
    const fromApproval = (detail.memo_permohonan || []).find(
      (d) => d.tahap === 'BIDANG2' || d.tipe_dokumen === 'memo_persetujuan_bidang2'
    );
    if (fromApproval) return fromApproval;

    return (
      rawDokumenPermohonan.find(
        (d) =>
          d.tipe_dokumen === 'memo_persetujuan_bidang2' ||
          (d.tipe_dokumen && d.tipe_dokumen.toLowerCase().includes('bidang2')) ||
          (d.nama_asli && d.nama_asli.toLowerCase().includes('bidang2'))
      ) ||
      rawDokumenPermohonan.filter(
        (d) =>
          d.tipe_dokumen === 'memo_persetujuan' ||
          (d.tipe_dokumen && d.tipe_dokumen.toLowerCase().includes('memo'))
      )[0] ||
      null
    );
  }, [detail.memo_permohonan, rawDokumenPermohonan]);

  // Memo Persetujuan 2: Dari PPK
  const memoPpkDoc = useMemo(() => {
    const fromApproval = (detail.memo_permohonan || []).find(
      (d) => d.tahap === 'PPK' || d.tipe_dokumen === 'memo_persetujuan_ppk'
    );
    if (fromApproval) return fromApproval;

    const specificPpk = rawDokumenPermohonan.find(
      (d) =>
        d.tipe_dokumen === 'memo_persetujuan_ppk' ||
        (d.tipe_dokumen && d.tipe_dokumen.toLowerCase().includes('ppk')) ||
        (d.nama_asli && d.nama_asli.toLowerCase().includes('ppk'))
    );
    if (specificPpk) return specificPpk;

    const allMemos = rawDokumenPermohonan.filter(
      (d) =>
        d.tipe_dokumen === 'memo_persetujuan' ||
        (d.tipe_dokumen && d.tipe_dokumen.toLowerCase().includes('memo'))
    );
    // Jika ada lebih dari satu memo, ambil memo kedua untuk PPK
    return allMemos.length > 1 ? allMemos[1] : null;
  }, [detail.memo_permohonan, rawDokumenPermohonan]);

  // Status Normalization
  const rawStatus = (pengadaan.status || 'menunggu_persetujuan').toLowerCase();
  const isDitolak = rawStatus === 'ditolak';
  const isTerverifikasi =
    rawStatus === 'diteruskan' ||
    rawStatus === 'disetujui' ||
    rawStatus === 'selesai' ||
    rawStatus === 'terverifikasi';
  const isMenungguReview = !isDitolak && !isTerverifikasi;

  // Catatan penolakan jika ditolak
  const rejectionInfo = useMemo(() => {
    const approvals = (pengadaan.approvals as Array<{
      tahap?: string;
      keputusan?: string;
      catatan?: string | null;
      alasan?: string | null;
      created_at?: string;
      actor_nama?: string;
      Actor?: { nama?: string };
    }>) || [];

    const rejectedApp = approvals
      .slice()
      .reverse()
      .find((a) => a.keputusan === 'ditolak' || Boolean(a.catatan || a.alasan));

    const alasan =
      rejectedApp?.catatan ||
      rejectedApp?.alasan ||
      (pengadaan as { catatan_penolakan?: string }).catatan_penolakan ||
      'Dokumen pengadaan memerlukan perbaikan atau pelengkapan berkas.';

    const actor =
      rejectedApp?.actor_nama ||
      rejectedApp?.Actor?.nama ||
      (rejectedApp?.tahap ? `${rejectedApp.tahap}` : 'PP');

    const tanggal = rejectedApp?.created_at
      ? new Date(rejectedApp.created_at).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
      : null;

    return {
      alasan,
      actor,
      tanggal,
    };
  }, [pengadaan]);

  // Formatter helpers
  const formatCurrency = (val?: number | string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(Number(val) || 0);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  // State untuk Live Preview Iframe Dokumen Pengadaan
  const [pengadaanBlobUrl, setPengadaanBlobUrl] = useState<string | null>(null);
  const [loadingPengadaanBlob, setLoadingPengadaanBlob] = useState<boolean>(false);
  const [downloadingDocId, setDownloadingDocId] = useState<number | string | null>(null);

  useEffect(() => {
    if (!primaryDokumenPengadaan?.download_url) {
      setPengadaanBlobUrl(null);
      return;
    }

    const controller = new AbortController();
    setLoadingPengadaanBlob(true);

    ppService
      .fetchDokumenBlob(primaryDokumenPengadaan.download_url, 'inline', controller.signal)
      .then(({ blob }) => {
        const url = URL.createObjectURL(blob);
        setPengadaanBlobUrl(url);
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          console.warn('Gagal memuat blob dokumen pengadaan untuk live preview:', err);
          setPengadaanBlobUrl(null);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingPengadaanBlob(false);
        }
      });

    return () => {
      controller.abort();
      if (pengadaanBlobUrl) {
        URL.revokeObjectURL(pengadaanBlobUrl);
      }
    };
  }, [primaryDokumenPengadaan?.download_url]);

  // Download handler
  const handleDownload = async (doc: DokumenItem) => {
    if (!doc.download_url) return;
    setDownloadingDocId(doc.id);
    try {
      const { blob } = await ppService.fetchDokumenBlob(doc.download_url, 'attachment');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.nama_asli || 'dokumen.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Gagal mengunduh dokumen:', err);
    } finally {
      setDownloadingDocId(null);
    }
  };

  // Handler buka dokumen proses sebelumnya di tab baru
  const handleViewNewTab = async (doc: DokumenItem) => {
    if (!doc.download_url) return;
    try {
      const { blob } = await ppService.fetchDokumenBlob(doc.download_url, 'inline');
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (err) {
      console.error('Gagal membuka dokumen:', err);
    }
  };

  const nomorPengadaan = `PGD-${new Date(pengadaan.created_at || Date.now()).getFullYear()}-${String(pengadaan.id || 0).padStart(4, '0')}`;
  const nomorPermohonan = permohonan.nomor_surat || '-';
  const judulPengadaan = permohonan.judul || 'Pengadaan Barang & Jasa';
  const unitNama = unit?.nama || 'Unit Kerja';
  const tanggalPengajuan = formatDate(pengadaan.created_at || permohonan.created_at);
  const nominalEstimasi = formatCurrency(permohonan.estimasi_anggaran || pengadaan.nominal || 0);

  // Status Badge UI
  const renderHeroStatusBadge = () => {
    if (isTerverifikasi) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F5EF] text-[#0E7C5A] border border-[#A3D9C3]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Terverifikasi
        </span>
      );
    }
    if (isDitolak) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEE4E2] text-[#D92D20] border border-[#FECDCA]">
          <XCircle className="w-3.5 h-3.5" />
          Ditolak
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF3DC] text-[#B54708] border border-[#FEDF89]">
        <AlertCircle className="w-3.5 h-3.5" />
        Menunggu Review
      </span>
    );
  };

  const renderStatusPpValue = () => {
    if (isTerverifikasi) return 'Telah Diverifikasi oleh PP';
    if (isDitolak) return 'Ditolak oleh PP';
    return 'Menunggu Review dari PP';
  };

  const renderStatusPengadaanPill = () => {
    if (isTerverifikasi) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E8F5EF] text-[#0E7C5A]">
          Terverifikasi
        </span>
      );
    }
    if (isDitolak) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEE4E2] text-[#D92D20]">
          Ditolak
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF3DC] text-[#B54708]">
        Menunggu Persetujuan
      </span>
    );
  };

  return (
    <AppLayout
      activeRoute="pengadaan"
      navItems={navItems || PP_NAV_ITEMS}
      roleInitials={roleInitials}
      roleTitle={roleTitle}
      roleSubtitle={roleSubtitle}
      profileHref={`${basePath}/profil`}
      notifikasiHref={`${basePath}/notifikasi`}
      readAllHref={`${basePath}/notifikasi/read-all`}
      notifications={recentNotifications}
      unreadCount={unreadNotificationsCount}
      breadcrumb={[
        { label: 'DAFTAR PENGADAAN', href: `${basePath}/pengadaan` },
        { label: 'DETAIL PENGADAAN' },
      ]}
    >
      <div className="space-y-6 pb-12">
        {/* Flash Error Banner */}
        {flashError && (
          <div className="bg-[#FEF3DC] border border-[#FDE4A0] rounded-2xl p-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[#D97706] shrink-0" />
              <p className="text-sm font-medium text-[#92400E]">{flashError}</p>
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="text-xs font-bold text-[#92400E] hover:underline"
            >
              Muat Ulang
            </button>
          </div>
        )}

        {/* HERO BANNER */}
        <HeroBanner
          eyebrow="PENGADAAN"
          title="Detail Pengadaan"
          statusBadge={renderHeroStatusBadge()}
          description={`Nomor ${nomorPermohonan} · Diajukan ${tanggalPengajuan}`}
          ctaLink={`${basePath}/pengadaan`}
          ctaLinkLabel="Kembali"
          ctaLinkIcon={ArrowLeft}
          ctaVariant="translucent"
        />

        {/* CARD INFORMASI PENGADAAN */}
        <InformasiPengadaanCard
          judul={judulPengadaan}
          unitNama={unitNama}
          nomorPengadaan={nomorPengadaan}
          nomorPermohonan={nomorPermohonan}
          tanggalPengajuan={tanggalPengajuan}
          jenisPengadaan={jenis?.nama || 'Barang'}
          metodePengadaan={metode?.nama || 'Pengadaan Langsung'}
          levelPengadaan={level?.nama || '50-200 Juta'}
          nominal={nominalEstimasi}
          statusPpLabel={renderStatusPpValue()}
          statusPengadaanPill={renderStatusPengadaanPill()}
        />

        {/* CARD CATATAN REVISI */}
        {isDitolak && (
          <CatatanRevisiCard
            actor={rejectionInfo.actor}
            tanggal={rejectionInfo.tanggal}
            alasan={rejectionInfo.alasan}
          />
        )}

        {/* CARD DOKUMEN PROSES SEBELUMNYA */}
        <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
          <div className="pb-4 mb-5 border-b border-[#F0F4F2]">
            <h3 className="text-base font-bold text-[#14201C]">Dokumen Proses Sebelumnya</h3>
            <p className="text-xs text-[#8A9A95] mt-0.5">
              Surat permohonan, memo persetujuan, dan jenis MAK dari Perencanaan
            </p>
          </div>

          {/* Document Rows: Surat Permohonan (Full Width) & Memo Persetujuan (2 Kolom) */}
          <div className="space-y-4 mb-6">
            {/* Baris 1: Surat Permohonan (Lebar Penuh) */}
            <DocumentCard
              category="Surat Permohonan"
              filename={suratPermohonanDoc?.nama_asli || 'Surat_Permohonan.pdf'}
              size={
                suratPermohonanDoc?.ukuran_bytes
                  ? `PDF • ${formatBytes(suratPermohonanDoc.ukuran_bytes)}`
                  : 'PDF • Tersedia'
              }
              onView={
                suratPermohonanDoc?.download_url
                  ? () => handleViewNewTab(suratPermohonanDoc)
                  : undefined
              }
              onDownload={
                suratPermohonanDoc?.download_url
                  ? () => handleDownload(suratPermohonanDoc)
                  : undefined
              }
            />

            {/* Baris 2: Memo Persetujuan (2 Kolom) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DocumentCard
                category="Memo Persetujuan Bidang 2"
                filename={memoBidang2Doc?.nama_asli || 'Memo_Persetujuan_Bidang2.pdf'}
                size={
                  memoBidang2Doc?.ukuran_bytes
                    ? `PDF • ${formatBytes(memoBidang2Doc.ukuran_bytes)}`
                    : 'PDF • Tersedia'
                }
                onView={
                  memoBidang2Doc?.download_url
                    ? () => handleViewNewTab(memoBidang2Doc)
                    : undefined
                }
                onDownload={
                  memoBidang2Doc?.download_url
                    ? () => handleDownload(memoBidang2Doc)
                    : undefined
                }
              />

              <DocumentCard
                category="Memo Persetujuan PPK"
                filename={memoPpkDoc?.nama_asli || 'Memo_Persetujuan_PPK.pdf'}
                size={
                  memoPpkDoc?.ukuran_bytes
                    ? `PDF • ${formatBytes(memoPpkDoc.ukuran_bytes)}`
                    : 'PDF • Tersedia'
                }
                onView={
                  memoPpkDoc?.download_url
                    ? () => handleViewNewTab(memoPpkDoc)
                    : undefined
                }
                onDownload={
                  memoPpkDoc?.download_url
                    ? () => handleDownload(memoPpkDoc)
                    : undefined
                }
              />
            </div>
          </div>

          {/* Baris Jenis MAK dari Perencanaan */}
          <div className="p-4 rounded-xl bg-[#F4F7F5] border border-[#E4EBE8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#E8F5EF] text-[#0E7C5A] flex items-center justify-center shrink-0">
                <Tag className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-[#8A9A95] block">
                  Jenis MAK dari Perencanaan
                </span>
                <span className="text-xs font-bold text-[#14201C] block mt-0.5">
                  {makList.length > 0
                    ? makList.map((m) => (m.kode ? `${m.kode} \u00b7 ${m.nama}` : m.nama)).join(', ')
                    : '532111 \u00b7 Belanja Modal Peralatan dan Mesin'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#5F6F6A] pl-11 sm:pl-0">
              <UserCheck className="w-4 h-4 text-[#0E7C5A] shrink-0" />
              <span className="text-[#8A9A95]">Penanggung Jawab MAK:</span>
              <span className="font-bold text-[#14201C]">
                {ppk?.nama ? `${ppk.nama} \u00b7 PPK` : 'Budi Santoso \u00b7 PPK'}
              </span>
            </div>
          </div>
        </div>

        {/* REVIEW BODY (2 KOLOM: DOKUMEN PENGADAAN & SIDE COLUMN) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Kolom Kiri: Card Dokumen Pengadaan & Live Iframe Preview */}
          <div className="lg:col-span-8 bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] space-y-5">
            <div className="pb-3.5 border-b border-[#F0F4F2] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#14201C]">Dokumen Pengadaan</h3>
                <p className="text-xs text-[#8A9A95] mt-0.5">
                  Pratinjau dokumen pengadaan yang diunggah PPBJ
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E8F5EF] text-[#0E7C5A] border border-[#A3D9C3] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0E7C5A] animate-pulse" />
                Live Preview
              </span>
            </div>

            {/* File info bar */}
            {primaryDokumenPengadaan ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#F4F7F5] border border-[#E4EBE8]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-xs font-bold text-[#14201C] truncate max-w-[220px] sm:max-w-xs md:max-w-md"
                      title={primaryDokumenPengadaan.nama_asli}
                    >
                      {primaryDokumenPengadaan.nama_asli}
                    </p>
                    <p className="text-[11px] text-[#8A9A95] mt-0.5">
                      PDF &bull; {formatBytes(primaryDokumenPengadaan.ukuran_bytes || 0)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {pengadaanBlobUrl && (
                    <a
                      href={pengadaanBlobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E4EBE8] text-xs font-bold text-[#14201C] hover:bg-[#F8FAF9] shadow-2xs transition cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#5F6F6A]" />
                      <span>Lihat</span>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDownload(primaryDokumenPengadaan)}
                    disabled={downloadingDocId === primaryDokumenPengadaan.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0E7C5A] hover:bg-[#0A5C43] text-white text-xs font-bold disabled:opacity-50 shadow-2xs transition cursor-pointer"
                  >
                    {downloadingDocId === primaryDokumenPengadaan.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>Unduh</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#F4F7F5] border border-[#E4EBE8] text-center text-xs text-[#8A9A95]">
                Belum ada berkas dokumen pengadaan yang diunggah PPBJ.
              </div>
            )}

            {/* Iframe Document Preview */}
            <div className="rounded-xl border border-[#E4EBE8] overflow-hidden bg-white shadow-xs">
              {loadingPengadaanBlob ? (
                <div className="h-[560px] flex flex-col items-center justify-center gap-3 bg-[#F8FAF9]">
                  <Loader2 className="w-8 h-8 text-[#0E7C5A] animate-spin" />
                  <p className="text-xs font-semibold text-[#5F6F6A]">
                    Memuat pratinjau dokumen pengadaan...
                  </p>
                </div>
              ) : pengadaanBlobUrl ? (
                <iframe
                  src={`${pengadaanBlobUrl}#toolbar=0&navpanes=0`}
                  title={`Pratinjau dokumen ${primaryDokumenPengadaan?.nama_asli || 'Pengadaan'}`}
                  className="w-full h-[620px] border-0"
                />
              ) : (
                <div className="h-[360px] flex flex-col items-center justify-center gap-2 p-6 text-center bg-[#F8FAF9]">
                  <FileText className="w-10 h-10 text-[#8A9A95]" />
                  <p className="text-sm font-semibold text-[#14201C]">
                    Pratinjau Tidak Tersedia
                  </p>
                  <p className="text-xs text-[#8A9A95] max-w-sm">
                    Berkas dokumen pengadaan belum dapat dipratinjau secara langsung. Gunakan tombol
                    unduh untuk memeriksa dokumen secara offline.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">

            {/* Box Keputusan PP (Tampil aktif jika Menunggu Review) */}
            {isMenungguReview ? (
              <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
                <div className="pb-3.5 mb-4 border-b border-[#F0F4F2]">
                  <h3 className="text-base font-bold text-[#14201C]">{keputusanTitle}</h3>
                  <p className="text-xs text-[#8A9A95] mt-0.5">
                    Tinjau dokumen pengadaan, lalu setujui atau tolak
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F4F7F5] border border-[#E4EBE8] flex items-start gap-2.5 mb-5 text-xs text-[#5F6F6A]">
                  <AlertCircle className="w-4 h-4 text-[#5F6F6A] shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{keputusanNote}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={onOpenReject}
                    className="py-3 px-3 rounded-xl border border-[#FECDCA] bg-[#FEE4E2]/70 hover:bg-[#FEE4E2] text-xs font-bold text-[#D92D20] disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>Revisi Dokumen</span>
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={onOpenConfirmApprove}
                    className="py-3 px-3 rounded-xl bg-[#0E7C5A] hover:bg-[#0A5C43] text-xs font-bold text-white disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Konfirmasi</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
                <div className="pb-3.5 mb-3 border-b border-[#F0F4F2]">
                  <h3 className="text-base font-bold text-[#14201C]">Keputusan Review Selesai</h3>
                  <p className="text-xs text-[#8A9A95] mt-0.5">
                    Dokumen pengadaan ini telah diproses review oleh Pejabat Pengadaan.
                  </p>
                </div>
                <div
                  className={`p-4 rounded-xl text-xs font-medium flex items-center gap-3 ${isTerverifikasi
                    ? 'bg-[#E8F5EF] text-[#0E7C5A] border border-[#A3D9C3]'
                    : 'bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]'
                    }`}
                >
                  {isTerverifikasi ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      <span>Dokumen telah diverifikasi dan diteruskan ke PPK.</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 shrink-0" />
                      <span>Dokumen dikembalikan ke PPBJ untuk direvisi.</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MODAL KONFIRMASI APPROVE */}
        <KonfirmasiApproveModal
          isOpen={confirmApproveOpen}
          onClose={onCloseConfirmApprove}
          onConfirm={onConfirmApprove}
          pengadaan={{
            nominal: permohonan.estimasi_anggaran || pengadaan.nominal,
            permohonan: {
              nomor_surat: nomorPermohonan,
              judul: judulPengadaan,
            },
          }}
          isSubmitting={submitting}
        />

        {/* MODAL TOLAK / REVISI DOKUMEN PENGADAAN */}
        <TolakPengadaanModal
          isOpen={rejectOpen}
          onClose={onCloseReject}
          onConfirm={onConfirmReject}
          pengadaan={{
            permohonan: {
              nomor_surat: nomorPermohonan,
            },
          }}
          isSubmitting={submitting}
          error={rejectError}
        />
      </div>
    </AppLayout>
  );
};

export default PpPengadaanDetailTemplate;
