import { useState, useEffect, useMemo, type FC } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Calendar,
  Layers,
  Building2,
  Tag,
  CheckCircle2,
  XCircle,
  Eye,
  Download,
  AlertCircle,
  UserCheck,
  Coins,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import AppLayout, { type AppNavItem as PpNavItem } from '../General/AppLayout';
import KonfirmasiApproveModal from '../../organisms/KonfirmasiApproveModal';
import TolakPengadaanModal from '../../organisms/TolakPengadaanModal';
import DocumentPreviewModal from '../../organisms/DocumentPreviewModal';
import { ppService } from '../../../services/ppService';
import { formatBytes } from '../../../utils/formatters';
import type {
  PpPengadaanDetailPayload,
  PpDocumentPreviewInfo,
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
  previewDoc: PpDocumentPreviewInfo | null;
  onOpenConfirmApprove: () => void;
  onCloseConfirmApprove: () => void;
  onConfirmApprove: () => void;
  onOpenReject: () => void;
  onCloseReject: () => void;
  onConfirmReject: (alasan: string) => void;
  onSelectPreviewDoc: (doc: PpDocumentPreviewInfo | null) => void;
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
  previewDoc,
  onOpenConfirmApprove,
  onCloseConfirmApprove,
  onConfirmApprove,
  onOpenReject,
  onCloseReject,
  onConfirmReject,
  onSelectPreviewDoc,
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

  const rawDokumenPengadaan: DokumenItem[] = (detail.dokumen_pengadaan as DokumenItem[]) || [];
  const rawDokumenPermohonan: DokumenItem[] = (detail.dokumen_permohonan as DokumenItem[]) || [];

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

  const memoPersetujuanDoc = useMemo(() => {
    return rawDokumenPermohonan.find(
      (d) =>
        d.tipe_dokumen === 'memo_persetujuan' ||
        d.tipe_dokumen === 'memo_persetujuan_bidang2' ||
        d.tipe_dokumen === 'memo_persetujuan_ppk' ||
        (d.tipe_dokumen && d.tipe_dokumen.toLowerCase().includes('memo'))
    );
  }, [rawDokumenPermohonan]);

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

  // View modal handler (untuk dokumen proses sebelumnya)
  const handleViewModal = (doc: DokumenItem, category: string) => {
    onSelectPreviewDoc({
      category,
      filename: doc.nama_asli,
      size: formatBytes(doc.ukuran_bytes || 0),
      fileUrl: doc.download_url || undefined,
      download_url: doc.download_url || undefined,
    });
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
        <section
          className="relative overflow-hidden bg-gradient-to-r from-[#075E43] to-[#129A6E] text-white rounded-[24px] p-6 md:p-8 min-h-[148px] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_4px_20px_rgba(14,124,90,0.15)]"
          aria-labelledby="hero-title"
        >
          {/* Decorative concentric circles (Figma Deco 1, 2, 3) */}
          <div
            className="absolute -right-16 -top-16 w-[260px] h-[260px] rounded-full border border-white/10 pointer-events-none hidden sm:block"
            aria-hidden="true"
          />
          <div
            className="absolute -right-6 -bottom-12 w-[170px] h-[170px] rounded-full border border-white/15 pointer-events-none hidden sm:block"
            aria-hidden="true"
          />
          <div
            className="absolute right-40 top-4 w-[80px] h-[80px] rounded-full border border-white/5 pointer-events-none hidden sm:block"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-xl">
            <p className="text-[11px] font-bold text-white/75 tracking-wider uppercase mb-1">
              PENGADAAN
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 id="hero-title" className="text-xl md:text-2xl font-bold tracking-tight text-white">
                Detail Pengadaan
              </h1>
              {renderHeroStatusBadge()}
            </div>
            <p className="text-xs md:text-sm text-white/85 mt-1.5 leading-relaxed">
              Nomor {nomorPermohonan} &nbsp;&middot;&nbsp; Diajukan {tanggalPengajuan}
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <Link
              to={`${basePath}/pengadaan`}
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-150 bg-white/15 text-white hover:bg-white/25 border border-white/20 shadow-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
              <span>Kembali</span>
            </Link>
          </div>
        </section>

        {/* CARD INFORMASI PENGADAAN (GRID 3 KOLOM) */}
        <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
          <div className="pb-4 mb-5 border-b border-[#F0F4F2]">
            <p className="text-[11px] font-bold text-[#8A9A95] tracking-wider uppercase">
              INFORMASI PENGADAAN
            </p>
            <h2 className="text-lg font-bold text-[#14201C] mt-1">{judulPengadaan}</h2>
            <p className="text-xs text-[#8A9A95] mt-0.5">Diajukan oleh {unitNama}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Kolom 1 */}
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-medium text-[#8A9A95] block">No. Pengadaan</span>
                <span className="text-sm font-bold text-[#14201C] block mt-0.5">
                  {nomorPengadaan}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-medium text-[#8A9A95] block">Nomor Permohonan</span>
                <span className="text-sm font-bold text-[#14201C] block mt-0.5">
                  {nomorPermohonan}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-medium text-[#8A9A95] block">Tanggal Pengajuan</span>
                <span className="text-sm font-bold text-[#14201C] block mt-0.5">
                  {tanggalPengajuan}
                </span>
              </div>
            </div>

            {/* Kolom 2 */}
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-medium text-[#8A9A95] block">Jenis Pengadaan</span>
                <span className="text-sm font-bold text-[#14201C] block mt-0.5">
                  {jenis?.nama || 'Barang'}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-medium text-[#8A9A95] block">Metode Pengadaan</span>
                <span className="text-sm font-bold text-[#14201C] block mt-0.5">
                  {metode?.nama || 'Pengadaan Langsung'}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-medium text-[#8A9A95] block">Level Pengadaan</span>
                <span className="text-sm font-bold text-[#14201C] block mt-0.5">
                  {level?.nama || '50-200 Juta'}
                </span>
              </div>
            </div>

            {/* Kolom 3 */}
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-medium text-[#8A9A95] block">Nominal / Estimasi</span>
                <span className="text-sm font-bold text-[#0E7C5A] block mt-0.5">
                  {nominalEstimasi}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-medium text-[#8A9A95] block">Status PP</span>
                <span className="text-sm font-bold text-[#14201C] block mt-0.5">
                  {renderStatusPpValue()}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-medium text-[#8A9A95] block">Status Pengadaan</span>
                <div className="mt-1">{renderStatusPengadaanPill()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD CATATAN REVISI (Hanya muncul jika Ditolak atau memiliki riwayat penolakan aktif) */}
        {isDitolak && (
          <div className="bg-[#FEF3F2] rounded-[16px] p-6 border border-[#FECDCA] shadow-xs">
            <div className="flex items-start gap-3.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#B42318]">Catatan Revisi</h3>
                <p className="text-xs text-[#8A9A95] mt-0.5">
                  Ditolak oleh {rejectionInfo.actor}
                  {rejectionInfo.tanggal ? ` \u00b7 ${rejectionInfo.tanggal}` : ''}
                </p>
              </div>
            </div>

            <div className="bg-white/80 rounded-xl p-4 border border-[#FECDCA]/60">
              <span className="text-[10px] font-extrabold tracking-wider text-[#B42318] uppercase block mb-1">
                ALASAN PENOLAKAN
              </span>
              <p className="text-xs text-[#344054] leading-relaxed font-medium">
                {rejectionInfo.alasan}
              </p>
            </div>
          </div>
        )}

        {/* CARD DOKUMEN PROSES SEBELUMNYA */}
        <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
          <div className="pb-4 mb-5 border-b border-[#F0F4F2]">
            <h3 className="text-base font-bold text-[#14201C]">Dokumen Proses Sebelumnya</h3>
            <p className="text-xs text-[#8A9A95] mt-0.5">
              Surat permohonan, memo persetujuan, dan jenis MAK dari Perencanaan
            </p>
          </div>

          {/* Document Rows: Surat Permohonan & Memo Persetujuan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Surat Permohonan Card */}
            <div className="bg-white rounded-[14px] p-5 border border-[#E4EBE8] flex flex-col justify-between hover:border-[#129A6E]/50 transition-colors">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-[#8A9A95] block">
                        Surat Permohonan
                      </span>
                      <p
                        className="text-xs font-bold text-[#14201C] truncate mt-0.5"
                        title={suratPermohonanDoc?.nama_asli || 'Surat Permohonan Pengadaan'}
                      >
                        {suratPermohonanDoc?.nama_asli || 'Surat_Permohonan.pdf'}
                      </p>
                      <p className="text-[11px] text-[#8A9A95] mt-0.5">
                        PDF &bull;{' '}
                        {suratPermohonanDoc?.ukuran_bytes
                          ? formatBytes(suratPermohonanDoc.ukuran_bytes)
                          : 'Tersedia'}
                      </p>
                    </div>
                  </div>
                  {suratPermohonanDoc?.download_url && (
                    <button
                      type="button"
                      onClick={() => handleDownload(suratPermohonanDoc)}
                      disabled={downloadingDocId === suratPermohonanDoc.id}
                      className="w-8 h-8 rounded-lg border border-[#E4EBE8] text-[#5F6F6A] hover:bg-[#F4F7F5] hover:text-[#0E7C5A] flex items-center justify-center transition cursor-pointer"
                      title="Unduh Berkas"
                    >
                      {downloadingDocId === suratPermohonanDoc.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#0E7C5A]" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 p-2 rounded-lg bg-[#F4F7F5] border border-[#E4EBE8]/60 text-xs text-[#5F6F6A] mb-4">
                  <Tag className="w-3.5 h-3.5 text-[#0E7C5A] shrink-0" />
                  <span className="text-[11px] text-[#8A9A95]">Jenis MAK:</span>
                  <span className="text-[11px] font-bold text-[#14201C] truncate">
                    {makList[0]?.nama || 'Belanja Modal Peralatan dan Mesin'}
                  </span>
                </div>
              </div>

              <div>
                {suratPermohonanDoc ? (
                  <button
                    type="button"
                    onClick={() => handleViewModal(suratPermohonanDoc, 'Surat Permohonan')}
                    className="w-full py-2 px-3 rounded-xl border border-[#E4EBE8] bg-[#F8FAF9] hover:bg-[#EEF5F2] text-xs font-bold text-[#0E7C5A] transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Lihat Dokumen</span>
                  </button>
                ) : (
                  <span className="text-xs text-[#8A9A95] italic block text-center py-2">
                    Berkas surat tidak ditemukan
                  </span>
                )}
              </div>
            </div>

            {/* Memo Persetujuan Card */}
            <div className="bg-white rounded-[14px] p-5 border border-[#E4EBE8] flex flex-col justify-between hover:border-[#129A6E]/50 transition-colors">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#E8F5EF] text-[#0E7C5A] flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-[#8A9A95] block">
                        Memo Persetujuan
                      </span>
                      <p
                        className="text-xs font-bold text-[#14201C] truncate mt-0.5"
                        title={memoPersetujuanDoc?.nama_asli || 'Memo Persetujuan'}
                      >
                        {memoPersetujuanDoc?.nama_asli || 'Memo_Persetujuan.pdf'}
                      </p>
                      <p className="text-[11px] text-[#8A9A95] mt-0.5">
                        PDF &bull;{' '}
                        {memoPersetujuanDoc?.ukuran_bytes
                          ? formatBytes(memoPersetujuanDoc.ukuran_bytes)
                          : 'Tersedia'}
                      </p>
                    </div>
                  </div>
                  {memoPersetujuanDoc?.download_url && (
                    <button
                      type="button"
                      onClick={() => handleDownload(memoPersetujuanDoc)}
                      disabled={downloadingDocId === memoPersetujuanDoc.id}
                      className="w-8 h-8 rounded-lg border border-[#E4EBE8] text-[#5F6F6A] hover:bg-[#F4F7F5] hover:text-[#0E7C5A] flex items-center justify-center transition cursor-pointer"
                      title="Unduh Berkas"
                    >
                      {downloadingDocId === memoPersetujuanDoc.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#0E7C5A]" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 p-2 rounded-lg bg-[#F4F7F5] border border-[#E4EBE8]/60 text-xs text-[#5F6F6A] mb-4">
                  <Tag className="w-3.5 h-3.5 text-[#0E7C5A] shrink-0" />
                  <span className="text-[11px] text-[#8A9A95]">Jenis MAK:</span>
                  <span className="text-[11px] font-bold text-[#14201C] truncate">
                    {makList[0]?.nama || 'Belanja Modal Peralatan dan Mesin'}
                  </span>
                </div>
              </div>

              <div>
                {memoPersetujuanDoc ? (
                  <button
                    type="button"
                    onClick={() => handleViewModal(memoPersetujuanDoc, 'Memo Persetujuan')}
                    className="w-full py-2 px-3 rounded-xl border border-[#E4EBE8] bg-[#F8FAF9] hover:bg-[#EEF5F2] text-xs font-bold text-[#0E7C5A] transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Lihat Dokumen</span>
                  </button>
                ) : (
                  <span className="text-xs text-[#8A9A95] italic block text-center py-2">
                    Belum ada memo persetujuan
                  </span>
                )}
              </div>
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

          {/* Kolom Kanan: Side Column (Rincian & Keputusan PP) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Box Rincian Pengadaan Mini */}
            <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
              <h3 className="text-sm font-bold text-[#14201C] pb-3 border-b border-[#F0F4F2]">
                Ringkasan Pengadaan
              </h3>

              <div className="divide-y divide-[#F0F4F2] text-xs">
                <div className="flex items-center gap-3 py-3">
                  <div className="w-8 h-8 rounded-lg bg-[#E8F5EF] text-[#0E7C5A] flex items-center justify-center shrink-0">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[#8A9A95] block text-[11px]">Estimasi Anggaran</span>
                    <span className="font-bold text-[#0E7C5A] block mt-0.5">
                      {nominalEstimasi}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 py-3">
                  <div className="w-8 h-8 rounded-lg bg-[#E8F5EF] text-[#0E7C5A] flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[#8A9A95] block text-[11px]">Jenis Pengadaan</span>
                    <span className="font-bold text-[#14201C] block mt-0.5">
                      {jenis?.nama || 'Barang'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 py-3">
                  <div className="w-8 h-8 rounded-lg bg-[#E8F5EF] text-[#0E7C5A] flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[#8A9A95] block text-[11px]">Diunggah Oleh</span>
                    <span className="font-bold text-[#14201C] block mt-0.5">PPBJ</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <div className="w-8 h-8 rounded-lg bg-[#E8F5EF] text-[#0E7C5A] flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[#8A9A95] block text-[11px]">Tanggal Pengajuan</span>
                    <span className="font-bold text-[#14201C] block mt-0.5">
                      {tanggalPengajuan}
                    </span>
                  </div>
                </div>
              </div>
            </div>

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
                  className={`p-4 rounded-xl text-xs font-medium flex items-center gap-3 ${
                    isTerverifikasi
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

        {/* MODAL PREVIEW DOKUMEN PROSES SEBELUMNYA */}
        <DocumentPreviewModal
          isOpen={Boolean(previewDoc)}
          onClose={() => onSelectPreviewDoc(null)}
          category={previewDoc?.category}
          filename={previewDoc?.filename}
          size={previewDoc?.size}
        />
      </div>
    </AppLayout>
  );
};

export default PpPengadaanDetailTemplate;
