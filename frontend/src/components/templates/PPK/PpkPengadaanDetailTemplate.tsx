import { useMemo, type FC } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';
import AppLayout, { type AppNavItem } from '../General/AppLayout';
import HeroBanner from '../../organisms/HeroBanner';
import { InformasiPengadaanCard } from '../../organisms/PP/InformasiPengadaanCard';
import TrackingPengadaanCard from '../../organisms/TrackingPengadaanCard';
import { CatatanRevisiCard } from '../../organisms/PP/CatatanRevisiCard';
import { DokumenProsesCard } from '../../organisms/PP/DokumenProsesCard';
import DokumenListCard from '../../organisms/DokumenListCard';
import KonfirmasiApproveModal from '../../organisms/KonfirmasiApproveModal';
import TolakPengadaanModal from '../../organisms/TolakPengadaanModal';
import { formatCurrency } from '../../../utils/formatCurrency';
import { formatTanggalIndo } from '../../../utils/formatters';
import type {
  PpPengadaanDetailPayload,
  PpMakItem,
} from '../../../types/pp';
import type { NotificationItem } from '../../../types/notification';
import type { DokumenItem } from '../../../types/dokumen';
import type { PpbjPembayaranContext } from '../../../types/ppbj';
import PimpinanPembayaranReviewCard from '../../organisms/Pembayaran/PimpinanPembayaranReviewCard';
import { PPK_NAV_ITEMS } from '@/constants/ppkNav';

export interface PpkPengadaanDetailTemplateProps {
  detail?: PpPengadaanDetailPayload;
  recentNotifications?: NotificationItem[];
  unreadNotificationsCount?: number;
  basePath?: string;
  roleInitials?: string;
  roleTitle?: string | null;
  roleSubtitle?: string | null;
  navItems?: AppNavItem[] | null;
  primaryDokumenPengadaan: DokumenItem | null;
  previewBlobUrl: string | null;
  isLoadingPreview: boolean;
  downloadingDocId: number | string | null;
  onDownloadDokumen: (doc: DokumenItem) => void;
  onViewDokumen: (doc: DokumenItem) => void;
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
  pembayaranContext?: PpbjPembayaranContext | null;
  isLoadingPembayaran?: boolean;
  onApprovePembayaran?: (memo: File, catatan?: string) => Promise<void>;
  onRejectPembayaran?: (alasan: string) => Promise<void>;
  flashSuccess?: string | null;
}

export const PpkPengadaanDetailTemplate: FC<PpkPengadaanDetailTemplateProps> = ({
  detail = {},
  recentNotifications = [],
  unreadNotificationsCount = 0,
  basePath = '/ppk',
  roleInitials = 'PPK',
  roleTitle = 'Pejabat Pembuat Komitmen',
  roleSubtitle = 'PPK - Pengadaan Barang/Jasa',
  navItems = null,
  primaryDokumenPengadaan,
  previewBlobUrl,
  isLoadingPreview,
  downloadingDocId,
  onDownloadDokumen,
  onViewDokumen,
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
  pembayaranContext = null,
  isLoadingPembayaran = false,
  onApprovePembayaran,
  onRejectPembayaran,
  flashSuccess = null,
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

  const rawDokumenPermohonan: DokumenItem[] = Array.isArray(detail.dokumen_permohonan)
    ? (detail.dokumen_permohonan as DokumenItem[])
    : detail.dokumen_permohonan
      ? [detail.dokumen_permohonan as DokumenItem]
      : [];

  const dokumenPengadaanList: DokumenItem[] = useMemo(() => {
    if (Array.isArray(detail.dokumen_pengadaan)) {
      return detail.dokumen_pengadaan as DokumenItem[];
    }
    if (primaryDokumenPengadaan) {
      return [primaryDokumenPengadaan];
    }
    if (detail.dokumen_pengadaan) {
      return [detail.dokumen_pengadaan as DokumenItem];
    }
    return [];
  }, [detail.dokumen_pengadaan, primaryDokumenPengadaan]);

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
    return allMemos.length > 1 ? allMemos[1] : null;
  }, [detail.memo_permohonan, rawDokumenPermohonan]);

  // Status & Workflow Normalization
  const rawStatus = (pengadaan.status || 'menunggu_persetujuan').toLowerCase();
  const isDraft = rawStatus === 'draft';
  const isDitolak = rawStatus === 'ditolak';
  const isDisetujui = rawStatus === 'disetujui' || rawStatus === 'selesai';
  const perluReviewPp = Boolean(level?.perlu_review_pp);

  // Aturan Otorisasi Komitmen PPK (FR-49):
  // 1. Level 50-200jt (perlu_review_pp = true): Hanya bisa diotorisasi jika sudah berstatus 'diteruskan' (lolos verifikasi PP).
  //    Jika masih 'menunggu_review' / 'menunggu_persetujuan', PPK bisa melihat pratinjau dokumen namun tombol keputusan menunggu PP.
  // 2. Level < 50jt atau > 200jt (perlu_review_pp = false): Langsung bisa diotorisasi saat status 'menunggu_review' / 'menunggu_persetujuan'.
  const isMenungguVerifikasiPp =
    perluReviewPp &&
    (rawStatus === 'menunggu_review' ||
      rawStatus === 'menunggu_persetujuan' ||
      rawStatus === 'diajukan');

  const canAuthorizePpk =
    !isDraft &&
    !isDitolak &&
    !isDisetujui &&
    ((!perluReviewPp &&
      (rawStatus === 'menunggu_review' ||
        rawStatus === 'menunggu_persetujuan' ||
        rawStatus === 'diajukan')) ||
      (perluReviewPp && rawStatus === 'diteruskan'));

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
      (rejectedApp?.tahap ? `${rejectedApp.tahap}` : 'PPK');

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

  const nomorPengadaan = `PGD-${new Date(pengadaan.created_at || Date.now()).getFullYear()}-${String(pengadaan.id || 0).padStart(4, '0')}`;
  const nomorPermohonan = permohonan.nomor_surat || '-';
  const judulPengadaan = permohonan.judul || 'Pengadaan Barang & Jasa';
  const unitNama = unit?.nama || 'Unit Kerja';
  const tanggalPengajuan = formatTanggalIndo(pengadaan.created_at || permohonan.created_at, true);
  const kontrak = pengadaan.kontrak || pengadaan.Kontrak;
  const nominalEstimasi = formatCurrency(kontrak?.nominal_kontrak || 0);

  // Status Badge UI
  const renderHeroStatusBadge = () => {
    if (isDisetujui) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F5EF] text-[#0E7C5A] border border-[#A3D9C3]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Disetujui PPK
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
    if (isMenungguVerifikasiPp) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF3DC] text-[#B54708] border border-[#FEDF89]">
          <Clock className="w-3.5 h-3.5" />
          Menunggu Verifikasi PP
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F5EF] text-[#0E7C5A] border border-[#A3D9C3]">
        <AlertCircle className="w-3.5 h-3.5" />
        Siap Otorisasi PPK
      </span>
    );
  };

  return (
    <AppLayout
      activeRoute="pengadaan"
      roleInitials={roleInitials}
      roleTitle={roleTitle || 'Pejabat Pembuat Komitmen'}
      roleSubtitle={roleSubtitle || 'PPK - Pengadaan Barang/Jasa'}
      navItems={navItems || PPK_NAV_ITEMS}
      profileHref={`${basePath}/profil`}
      notifikasiHref={`${basePath}/notifikasi`}
      notifications={recentNotifications}
      unreadCount={unreadNotificationsCount}
      flash={
        flashError || flashSuccess
          ? { error: flashError || undefined, success: flashSuccess || undefined }
          : undefined
      }
      breadcrumb={[
        { label: 'PPK', href: `${basePath}/dashboard` },
        { label: 'DAFTAR PENGADAAN', href: `${basePath}/pengadaan` },
        { label: 'DETAIL PENGADAAN' },
      ]}
    >
      <div className="space-y-6 pb-12">
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
          levelPengadaan={level?.nama || (perluReviewPp ? '50-200 Juta' : '> 200 Juta')}
          nominal={nominalEstimasi}
          statusPpLabel={isDisetujui ? 'Telah Diotorisasi PPK' : isDitolak ? 'Ditolak oleh PPK' : isMenungguVerifikasiPp ? 'Menunggu Verifikasi PP' : 'Siap Otorisasi PPK'}
          statusPengadaanPill={renderHeroStatusBadge()}
        />

        {/* TRACKING PROSES (FR-05) - Selalu tepat di bawah Informasi Pengadaan */}
        <TrackingPengadaanCard
          statusPengadaan={rawStatus}
          stepper={detail?.tracking?.stepper as any}
          timeline={detail?.tracking?.timeline as any}
        />

        {/* CARD CATATAN REVISI */}
        {isDitolak && (
          <CatatanRevisiCard
            actor={rejectionInfo.actor}
            tanggal={rejectionInfo.tanggal}
            alasan={rejectionInfo.alasan}
          />
        )}

        <DokumenProsesCard
          suratPermohonanDoc={suratPermohonanDoc}
          memoBidang2Doc={memoBidang2Doc}
          memoPpkDoc={memoPpkDoc}
          makList={makList}
          ppkNama={ppk?.nama}
          onView={onViewDokumen}
          onDownload={onDownloadDokumen}
        />

        {/* REVIEW BODY (DOKUMEN PENGADAAN FULL WIDTH & AKSI OTORISASI) */}
        <div className="space-y-6">
          <DokumenListCard
            title="Dokumen Pengadaan"
            dokumenList={dokumenPengadaanList}
            nomorSurat={nomorPengadaan}
            onViewNewTab={onViewDokumen}
            onDownload={onDownloadDokumen}
            previewBlobUrl={previewBlobUrl}
            previewDocId={primaryDokumenPengadaan?.id}
            isLoadingPreview={isLoadingPreview}
            isDownloadingId={downloadingDocId}
            emptyTitle="Belum ada berkas dokumen pengadaan"
            emptyDescription="Berkas dokumen pengadaan yang diunggah oleh PPBJ akan muncul di sini."
            autoExpand={true}
          />

          {/* Kotak Keputusan Otorisasi PPK (Full Width Banner / Card) */}
          {canAuthorizePpk ? (
            <div className="w-full bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-4 border-b border-[#F0F4F2]">
                <div>
                  <h3 className="text-base font-bold text-[#14201C]">Otorisasi Komitmen PPK</h3>
                  <p className="text-xs text-[#8A9A95] mt-0.5">
                    Tinjau dokumen pengadaan, lalu berikan otorisasi atau tolak untuk revisi
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={onOpenReject}
                    className="py-2.5 px-4 rounded-xl border border-[#FECDCA] bg-[#FEE4E2]/70 hover:bg-[#FEE4E2] text-xs font-bold text-[#D92D20] disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>Revisi Dokumen</span>
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={onOpenConfirmApprove}
                    className="py-2.5 px-4 rounded-xl bg-[#0E7C5A] hover:bg-[#0A5C43] text-xs font-bold text-white disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Konfirmasi Otorisasi</span>
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F4F7F5] border border-[#E4EBE8] flex items-start gap-2.5 text-xs text-[#5F6F6A]">
                <AlertCircle className="w-4 h-4 text-[#5F6F6A] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Pastikan rincian pengadaan dan ketersediaan anggaran telah sesuai sebelum memberikan otorisasi komitmen.
                </p>
              </div>
            </div>
          ) : isMenungguVerifikasiPp ? (
            <div className="w-full bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
              <div className="pb-3.5 mb-3 border-b border-[#F0F4F2]">
                <h3 className="text-base font-bold text-[#14201C]">Proses Verifikasi PP</h3>
                <p className="text-xs text-[#8A9A95] mt-0.5">
                  Pengadaan level nominal Rp50 – 200 juta
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#FEF3DC] text-[#92400E] border border-[#FDE4A0] text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <Clock className="w-4 h-4 shrink-0 text-[#D97706]" />
                  <span>Menunggu Verifikasi Administratif PP</span>
                </div>
                <p className="text-[11px] leading-relaxed text-[#78350F]">
                  Dokumen pengadaan ini sedang dalam proses verifikasi oleh Pejabat Pengadaan (PP). Tombol otorisasi komitmen PPK akan aktif setelah PP menyetujui dokumen ini.
                </p>
              </div>
            </div>
          ) : isDraft ? (
            <div className="w-full bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
              <div className="pb-3.5 mb-3 border-b border-[#F0F4F2]">
                <h3 className="text-base font-bold text-[#14201C]">Dokumen Masih Draft</h3>
                <p className="text-xs text-[#8A9A95] mt-0.5">
                  Paket pengadaan belum diajukan ke reviewer
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F0F4F2] text-[#5F6F6A] border border-[#CFDAD6] text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#5F6F6A]" />
                  <span>Menunggu Pengajuan PPBJ</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Paket pengadaan ini masih berupa draf pada PPBJ dan belum disubmit ke tahapan review.
                </p>
              </div>
            </div>
          ) : isDitolak ? (
            <div className="w-full bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
              <div className="pb-3.5 mb-3 border-b border-[#F0F4F2]">
                <h3 className="text-base font-bold text-[#14201C]">Keputusan Review Selesai</h3>
                <p className="text-xs text-[#8A9A95] mt-0.5">
                  Dokumen pengadaan ini telah diproses otorisasi oleh PPK.
                </p>
              </div>
              <div className="p-4 rounded-xl text-xs font-medium flex items-center gap-3 bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]">
                <XCircle className="w-5 h-5 shrink-0" />
                <span>Dokumen ditolak dan dikembalikan ke PPBJ untuk direvisi.</span>
              </div>
            </div>
          ) : isDisetujui ? (
            <div className="w-full bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
              <div className="pb-3.5 mb-3 border-b border-[#F0F4F2]">
                <h3 className="text-base font-bold text-[#14201C]">Keputusan Review Selesai</h3>
                <p className="text-xs text-[#8A9A95] mt-0.5">
                  Dokumen pengadaan ini telah diproses otorisasi oleh PPK.
                </p>
              </div>
              <div className="p-4 rounded-xl text-xs font-medium flex items-center gap-3 bg-[#E8F5EF] text-[#0E7C5A] border border-[#A3D9C3]">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Dokumen telah diotorisasi dan diteruskan ke PPBJ untuk kontrak.</span>
              </div>
            </div>
          ) : null}
        </div>

        {/* CARD VERIFIKASI PEMBAYARAN & MEMO PPK (FR-55, FR-56, FR-57) - DI PALING BAWAH */}
        {pembayaranContext?.pembayaran && onApprovePembayaran && onRejectPembayaran && (
          <PimpinanPembayaranReviewCard
            role="PPK"
            context={pembayaranContext}
            isLoading={isLoadingPembayaran}
            onApprove={onApprovePembayaran}
            onReject={onRejectPembayaran}
            onViewDokumen={onViewDokumen}
            onDownloadDokumen={onDownloadDokumen}
            previewBlobUrl={previewBlobUrl}
            previewDocId={primaryDokumenPengadaan?.id}
            isLoadingPreview={isLoadingPreview}
          />
        )}

        {/* MODAL KONFIRMASI APPROVE */}
        <KonfirmasiApproveModal
          isOpen={confirmApproveOpen}
          onClose={onCloseConfirmApprove}
          onConfirm={onConfirmApprove}
          pengadaan={{
            nominal: kontrak?.nominal_kontrak || 0,
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

export default PpkPengadaanDetailTemplate;
