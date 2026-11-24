import { useState, type FC, type FormEvent } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Loader2,
  FileText,
  ChevronDown,
  ChevronUp,
  Save,
  Lock,
  Download,
  Eye,
  Hash,
  Calendar,
  Building2,
  Activity,
  Banknote,
  Tag,
  Check,
  X,
  ShoppingCart,
  Package,
} from 'lucide-react';
import AppLayout from '../General/AppLayout';
import HeroBanner from '../../organisms/HeroBanner';
import StatusPill from '../../atoms/StatusPill';
import PerencanaanVerifikasiMakCard from '../../organisms/PerencanaanVerifikasiMakCard';
import { formatRupiah, formatTanggalIndo, formatBytes } from '../../../utils/formatters';
import { PERENCANAAN_NAV_ITEMS } from '@/constants/perencanaanNav';
import type {
  PerencanaanPengajuanDetail,
  PerencanaanMakItem,
  PerencanaanPengadaanChildItem,
} from '../../../types/perencanaan';
import type { DokumenItem } from '../../../types/dokumen';
import type { NotificationItem } from '../../../types/notification';

export interface PerencanaanPengajuanShowTemplateProps {
  detail?: PerencanaanPengajuanDetail | null;
  dokumenList: DokumenItem[];
  isLoading?: boolean;
  mode: 'verifikasi' | 'pengadaan' | 'diteruskan';
  maksList: PerencanaanMakItem[];
  selectedMakIds: number[];
  catatanVerifikasi?: string;
  makError?: string;
  catatanError?: string;
  flashSuccess?: string;
  flashError?: string;
  onAddMak: () => void;
  onRemoveMak: (index: number) => void;
  onChangeMak: (index: number, makId: number) => void;
  onCatatanChange?: (val: string) => void;
  onApproveClick: () => void;
  onRejectClick: () => void;
  onViewDokumen: (doc: DokumenItem) => void;
  onDownloadDokumen: (doc: DokumenItem) => void;
  isViewingDocId?: number | string | null;
  isDownloadingDocId?: number | string | null;
  previewBlobUrl?: string | null;
  previewDocId?: number | string | null;
  isLoadingPreview?: boolean;
  rkaklPreviewBlobUrl?: string | null;
  isLoadingRkaklPreview?: boolean;
  processing?: boolean;

  // Perbaikan Jenis MAK pada Dokumen Pengadaan
  pengadaanMakDrafts?: Record<number, number>;
  updatingPengadaanId?: number | null;
  pengadaanMakErrors?: Record<number, string>;
  onPengadaanMakDraftChange?: (pengadaanId: number, makId: number) => void;
  onSavePengadaanMak?: (pengadaanId: number) => void;

  // Modals
  approveModalOpen: boolean;
  rejectModalOpen: boolean;
  alasanPenolakan: string;
  alasanError?: string;
  catatanApprove?: string;
  onChangeCatatanApprove?: (val: string) => void;
  onCloseApproveModal: () => void;
  onCloseRejectModal: () => void;
  onConfirmApprove: () => void;
  onConfirmReject: (e: FormEvent) => void;
  onAlasanChange: (val: string) => void;
  onBack: () => void;

  recentNotifications?: NotificationItem[];
  unreadNotificationsCount?: number;
}

function isPengadaanLockedByPpk(item: PerencanaanPengadaanChildItem): boolean {
  if (typeof item.bisa_ubah_mak === 'boolean') {
    return !item.bisa_ubah_mak;
  }
  return ['disetujui_ppk', 'proses_pembayaran', 'selesai'].includes(item.status || '');
}

export const PerencanaanPengajuanShowTemplate: FC<PerencanaanPengajuanShowTemplateProps> = ({
  detail,
  dokumenList,
  isLoading = false,
  mode,
  maksList,
  selectedMakIds,
  catatanVerifikasi = '',
  makError = '',
  catatanError = '',
  flashSuccess = '',
  flashError = '',
  onAddMak,
  onRemoveMak,
  onChangeMak,
  onCatatanChange,
  onApproveClick,
  onRejectClick,
  onViewDokumen,
  onDownloadDokumen,
  isViewingDocId,
  isDownloadingDocId,
  previewBlobUrl: _previewBlobUrl,
  previewDocId: _previewDocId,
  isLoadingPreview: _isLoadingPreview = false,
  rkaklPreviewBlobUrl: _rkaklPreviewBlobUrl = null,
  isLoadingRkaklPreview: _isLoadingRkaklPreview = false,
  processing = false,
  pengadaanMakDrafts = {},
  updatingPengadaanId = null,
  pengadaanMakErrors = {},
  onPengadaanMakDraftChange,
  onSavePengadaanMak,
  approveModalOpen,
  rejectModalOpen,
  alasanPenolakan,
  alasanError = '',
  catatanApprove: _catatanApprove = '',
  onChangeCatatanApprove: _onChangeCatatanApprove,
  onCloseApproveModal,
  onCloseRejectModal,
  onConfirmApprove,
  onConfirmReject,
  onAlasanChange,
  onBack,
  recentNotifications,
  unreadNotificationsCount,
}) => {
  const [timelineExpanded, setTimelineExpanded] = useState<boolean>(true);

  const permohonan = detail?.permohonan;
  const rawStatus = (permohonan?.status || 'diajukan').toLowerCase();
  const isSelesai = rawStatus === 'selesai' || rawStatus === 'barang_diterima';
  const isDitolak = rawStatus === 'ditolak';
  const pengadaanChildren: PerencanaanPengadaanChildItem[] = permohonan?.pengadaan || [];

  const permohonanMakOptions: PerencanaanMakItem[] =
    permohonan?.permohonan_mak && permohonan.permohonan_mak.length > 0
      ? permohonan.permohonan_mak
        .map((pm) => pm.mak)
        .filter((m): m is PerencanaanMakItem => Boolean(m))
      : (detail?.maks ?? maksList).filter((m) => (detail?.selected_mak_ids ?? selectedMakIds).includes(m.id));

  const selectedMaksDisplay = (detail?.maks ?? maksList).filter((m) =>
    (detail?.selected_mak_ids ?? selectedMakIds).includes(m.id)
  );

  const firstMak = selectedMaksDisplay[0];
  const makKodeNama = firstMak
    ? (firstMak.kode ? `${firstMak.kode} - ${firstMak.nama}` : firstMak.nama)
    : '3112 - Belanja Modal Peralatan dan Mesin';

  const ppkName =
    firstMak?.Ppk?.nama ||
    firstMak?.ppk?.nama ||
    firstMak?.ppk_user?.nama ||
    (permohonan as any)?.permohonan_mak?.[0]?.mak?.ppk?.nama ||
    (permohonan as any)?.permohonan_mak?.[0]?.mak?.Ppk?.nama ||
    'Budi Santoso';

  const unitNama =
    permohonan?.unit_kerja?.nama ||
    (permohonan as any)?.Unit?.nama ||
    (permohonan as any)?.unit?.nama ||
    (permohonan as any)?.pemohon_user?.unit_kerja?.nama ||
    (permohonan as any)?.pemohon?.nama ||
    'Jurusan Teknik Informatika & Komputer';

  // Dokumen surat permohonan utama
  const primaryDoc =
    dokumenList.find((d) => d.tipe_dokumen === 'surat_permohonan') ||
    detail?.dokumen ||
    dokumenList[0];

  // Stepper & Timeline Data
  const trackingData = detail?.tracking;

  const defaultStepper = [
    {
      key: 'permohonan',
      label: 'Permohonan',
      subtext: isDitolak ? 'Ditolak' : 'Disetujui',
      status: 'selesai',
    },
    {
      key: 'pengadaan',
      label: 'Pengadaan',
      subtext: isSelesai ? 'Selesai' : mode === 'pengadaan' ? 'Sedang berlangsung' : 'Belum dimulai',
      status: isSelesai || mode === 'pengadaan' ? 'selesai' : 'belum_dimulai',
    },
    {
      key: 'pembelian_barang',
      label: 'Pembelian Barang',
      subtext: isSelesai ? 'Selesai' : 'Belum dimulai',
      status: isSelesai ? 'selesai' : 'belum_dimulai',
    },
    {
      key: 'penerimaan_barang',
      label: 'Penerimaan Barang',
      subtext: isSelesai ? 'Selesai' : 'Belum dimulai',
      status: isSelesai ? 'selesai' : 'belum_dimulai',
    },
    {
      key: 'selesai',
      label: 'Selesai',
      subtext: isSelesai ? 'Selesai' : 'Belum dimulai',
      status: isSelesai ? 'selesai' : 'belum_dimulai',
    },
  ];

  const stepperItems = trackingData?.stepper
    ? trackingData.stepper.map((s) => ({
      key: s.key,
      label: s.label,
      subtext: s.status === 'selesai' ? (s.key === 'permohonan' ? 'Disetujui' : 'Selesai') : s.status === 'sedang_berlangsung' ? 'Sedang berlangsung' : 'Belum dimulai',
      status: s.status,
    }))
    : defaultStepper;

  const defaultTimelineEvents = [
    {
      id: 1,
      tanggal: '14-03-2027 10:30',
      keterangan: 'Pengadaan dinyatakan selesai',
      aktif: true,
    },
    {
      id: 2,
      tanggal: '12-03-2027 16:15',
      keterangan: 'Barang diterima dan dokumen pembayaran lengkap',
      aktif: false,
    },
    {
      id: 3,
      tanggal: '09-03-2027 09:40',
      keterangan: 'Pembelian barang selesai dilakukan',
      aktif: false,
    },
    {
      id: 4,
      tanggal: '06-03-2027 13:05',
      keterangan: 'Pengadaan diproses oleh PPBJ',
      aktif: false,
    },
    {
      id: 5,
      tanggal: '05-03-2027 14:20',
      keterangan: 'Permohonan disetujui oleh Perencanaan',
      aktif: false,
    },
  ];

  const rawTimeline = trackingData?.timeline && trackingData.timeline.length > 0
    ? trackingData.timeline
    : detail?.history && detail.history.length > 0
      ? detail.history.map((h, idx) => ({
        id: h.id,
        tanggal: h.waktu || '05-03-2027 14:20',
        keterangan: h.deskripsi,
        aktif: idx === 0,
      }))
      : defaultTimelineEvents;

  const visibleTimeline = timelineExpanded || rawTimeline.length <= 5 ? rawTimeline : rawTimeline.slice(0, 5);

  const tanggalSelesai = formatTanggalIndo(
    (permohonan as any)?.updated_at || (permohonan as any)?.created_at ? String((permohonan as any)?.updated_at || permohonan?.created_at) : undefined
  );

  if (isLoading || !permohonan) {
    return (
      <AppLayout
        activeRoute="pengajuan"
        notifications={recentNotifications as any}
        unreadCount={unreadNotificationsCount}
        navItems={PERENCANAAN_NAV_ITEMS}
        roleInitials="PR"
        roleTitle="Perencanaan"
        roleSubtitle="Unit Perencanaan"
        profileHref="/perencanaan/profil"
        notifikasiHref="/perencanaan/notifikasi"
        readAllHref="/perencanaan/notifikasi/read-all"
        breadcrumb={[
          { label: 'LIST PENGAJUAN', href: '/perencanaan/pengajuan' },
          { label: 'DETAIL PERMOHONAN' },
        ]}
      >
        <div className="space-y-6 animate-pulse">
          <div className="h-32 bg-gray-200 rounded-[24px]" />
          <div className="h-64 bg-white rounded-[22px] border border-gray-100" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-white rounded-[22px] border border-gray-100" />
            <div className="h-96 bg-white rounded-[22px] border border-gray-100" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      activeRoute="pengajuan"
      navItems={PERENCANAAN_NAV_ITEMS}
      roleInitials="PR"
      roleTitle="Perencanaan"
      roleSubtitle="Unit Perencanaan"
      profileHref="/perencanaan/profil"
      notifikasiHref="/perencanaan/notifikasi"
      readAllHref="/perencanaan/notifikasi/read-all"
      notifications={recentNotifications}
      unreadCount={unreadNotificationsCount}
      flash={
        flashError || flashSuccess
          ? { error: flashError || undefined, success: flashSuccess || undefined }
          : undefined
      }
      breadcrumb={[
        { label: 'LIST PENGAJUAN', href: '/perencanaan/pengajuan' },
        { label: 'DETAIL PERMOHONAN' },
      ]}
    >
      <div className="space-y-6 my-2">
        {/* Hero Banner with Status Pill & Back CTA */}
        <HeroBanner
          eyebrow="PERMOHONAN MASUK"
          title={
            <div className="flex flex-wrap items-center gap-3">
              <span>Detail Permohonan</span>
              <StatusPill status={rawStatus} />
            </div>
          }
          description={`Nomor ${permohonan?.nomor_surat || '111-FFF-111'} · Diajukan ${formatTanggalIndo(permohonan?.created_at ? String(permohonan.created_at) : undefined)}`}
          ctaLabel="Kembali"
          ctaIcon={ArrowLeft}
          ctaVariant="translucent"
          onCta={onBack}
        />

        {/* Informasi Permohonan Card (Full Width) */}
        <section
          className="bg-white rounded-[22px] md:rounded-[24px] border border-[#E4EBE8] shadow-[0_4px_16px_rgba(20,32,28,0.04)] p-6 md:p-8"
          aria-labelledby="info-permohonan-title"
        >
          <div>
            <h2
              id="info-permohonan-title"
              className="text-base md:text-lg font-bold text-[#14201C]"
            >
              Informasi Permohonan
            </h2>
            <p className="text-xs text-[#5F6F6A] mt-0.5">
              Ringkasan data yang diajukan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 pt-5">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Nomor Permohonan */}
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0 shadow-2xs">
                  <Hash className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <p className="text-xs text-[#5F6F6A]">Nomor Permohonan</p>
                  <p className="text-xs md:text-sm font-bold text-[#14201C] mt-0.5">
                    {permohonan?.nomor_surat || '111-FFF-111'}
                  </p>
                </div>
              </div>

              {/* Nomor Referensi Srikandi */}
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0 shadow-2xs">
                  <Hash className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <p className="text-xs text-[#5F6F6A]">Nomor Referensi Srikandi</p>
                  <p className="text-xs md:text-sm font-bold text-[#14201C] mt-0.5">
                    {(permohonan as any)?.nomor_srikandi || (permohonan as any)?.nomor_referensi || '025/ND/KS.01/2026'}
                  </p>
                </div>
              </div>

              {/* Judul Permohonan */}
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0 shadow-2xs">
                  <FileText className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <p className="text-xs text-[#5F6F6A]">Judul Permohonan</p>
                  <p className="text-xs md:text-sm font-bold text-[#14201C] mt-0.5">
                    {permohonan?.judul || 'Pengadaan Komputer'}
                  </p>
                </div>
              </div>

              {/* Nominal/Estimasi */}
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0 shadow-2xs">
                  <Banknote className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <p className="text-xs text-[#5F6F6A]">Nominal/Estimasi</p>
                  <p className="text-xs md:text-sm font-bold text-[#14201C] mt-0.5">
                    {formatRupiah(permohonan?.estimasi_anggaran)}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Tanggal Pengajuan */}
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0 shadow-2xs">
                  <Calendar className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <p className="text-xs text-[#5F6F6A]">Tanggal Pengajuan</p>
                  <p className="text-xs md:text-sm font-bold text-[#14201C] mt-0.5">
                    {formatTanggalIndo(permohonan?.created_at ? String(permohonan.created_at) : undefined)}
                  </p>
                </div>
              </div>

              {/* Diajukan Oleh */}
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0 shadow-2xs">
                  <Building2 className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <p className="text-xs text-[#5F6F6A]">Diajukan Oleh</p>
                  <p className="text-xs md:text-sm font-bold text-[#14201C] mt-0.5">
                    {unitNama}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center shrink-0 shadow-2xs">
                  <Activity className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <p className="text-xs text-[#5F6F6A] mb-1">Status</p>
                  <StatusPill status={rawStatus} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Status Callout / Banner (Pengadaan Selesai / Ditolak) */}
        {isSelesai && (
          <div className="flex items-center gap-3.5 p-4 md:p-5 rounded-2xl bg-[#E8F5EF] border border-[#A3D9C3] text-[#0E7C5A]">
            <div className="w-8 h-8 rounded-full bg-[#0E7C5A] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Check className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#0E7C5A]">Pengadaan Selesai</h4>
              <p className="text-xs text-[#2A755C] mt-0.5">
                Seluruh tahapan, dari permohonan hingga penerimaan barang, selesai pada {tanggalSelesai}.
              </p>
            </div>
          </div>
        )}

        {isDitolak && (
          <div className="flex items-center gap-3.5 p-4 md:p-5 rounded-2xl bg-[#FEE4E2] border border-[#FECDCA] text-[#D92D20]">
            <div className="w-8 h-8 rounded-full bg-[#D92D20] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <X className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#D92D20]">Permohonan Ditolak</h4>
              <p className="text-xs text-[#B42318] mt-0.5">
                {detail?.approval_perencanaan?.alasan || (permohonan as any)?.catatan_penolakan?.alasan || 'Permohonan ditolak oleh Pemeriksa.'}
              </p>
            </div>
          </div>
        )}

        {/* Two-Column Section (Dokumen Permohonan & Timeline Proses) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left Column: Dokumen Permohonan */}
          <div className="bg-white rounded-[22px] md:rounded-[24px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(20,32,28,0.04)] space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#14201C]">Dokumen Permohonan</h3>
              <p className="text-xs text-[#5F6F6A] mt-0.5">
                {dokumenList.length || 1} dokumen terlampir · Jenis MAK dan penanggung jawab
              </p>
            </div>

            {/* Box Berkas Surat Permohonan */}
            {primaryDoc ? (
              <div className="rounded-2xl border border-[#E4EBE8] bg-white p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-[#5F6F6A]">Surat Permohonan</p>
                      <p className="text-xs md:text-sm font-bold text-[#14201C] truncate">
                        {primaryDoc.nama_asli || `Surat_Permohonan_${permohonan?.judul || 'Pengadaan'}.pdf`}
                      </p>
                      <p className="text-[11px] text-[#8A9A95] mt-0.5">
                        PDF • {primaryDoc.ukuran_bytes ? formatBytes(primaryDoc.ukuran_bytes) : '8 MB'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDownloadDokumen(primaryDoc)}
                    disabled={isDownloadingDocId === primaryDoc.id}
                    className="w-9 h-9 rounded-xl border border-[#E4EBE8] hover:bg-[#F4F7F5] text-[#5F6F6A] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                    title="Unduh Dokumen"
                  >
                    {isDownloadingDocId === primaryDoc.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#0E7C5A]" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Tombol Lihat Dokumen Full Width */}
                <button
                  type="button"
                  onClick={() => onViewDokumen(primaryDoc)}
                  disabled={isViewingDocId === primaryDoc.id}
                  className="w-full py-2.5 px-4 rounded-xl border border-[#0E7C5A] text-[#0E7C5A] text-xs font-semibold hover:bg-[#EEF5F2] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {isViewingDocId === primaryDoc.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  <span>Lihat Dokumen</span>
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl border border-[#E4EBE8] bg-[#F8FAF9] text-center text-xs text-[#5F6F6A]">
                Dokumen surat permohonan belum diunggah.
              </div>
            )}

            {/* Sub-card Jenis MAK & Penanggung Jawab (Mint Green) */}
            <div className="p-4 rounded-2xl bg-[#EAF6F1] border border-[#CDE9DE] flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-[#D8EFE5] text-[#0E7C5A] flex items-center justify-center shrink-0 mt-0.5">
                <Tag className="w-4 h-4" />
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <p className="text-[#5F6F6A] font-medium">Jenis MAK</p>
                  <p className="font-bold text-[#14201C] mt-0.5">
                    {makKodeNama}
                  </p>
                </div>
                <div>
                  <p className="text-[#5F6F6A] font-medium">Penanggung Jawab MAK</p>
                  <p className="font-bold text-[#14201C] mt-0.5">
                    {ppkName} · PPK
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Timeline Proses atau Verifikasi MAK */}
          {mode === 'verifikasi' ? (
            <PerencanaanVerifikasiMakCard
              maksList={maksList}
              selectedMakIds={selectedMakIds}
              catatan={catatanVerifikasi}
              makError={makError}
              catatanError={catatanError}
              onAddMak={onAddMak}
              onRemoveMak={onRemoveMak}
              onChangeMak={onChangeMak}
              onCatatanChange={onCatatanChange}
              onApproveClick={onApproveClick}
              onRejectClick={onRejectClick}
              processing={processing}
            />
          ) : (
            <div className="bg-white rounded-[22px] md:rounded-[24px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(20,32,28,0.04)] space-y-6">
              {/* Header Timeline */}
              <div>
                <h3 className="text-base font-bold text-[#14201C]">Timeline Proses</h3>
                <p className="text-xs text-[#5F6F6A] mt-0.5">
                  {isSelesai ? 'Seluruh tahapan telah diselesaikan' : 'Posisi permohonan dalam alur proses'}
                </p>
              </div>

              {/* Horizontal Stepper */}
              <div className="pt-1 pb-4 overflow-x-auto">
                <div className="flex items-center justify-between min-w-[460px] relative">
                  {stepperItems.map((step, idx) => {
                    const isStepSelesai = step.status === 'selesai';
                    const isStepActive = step.status === 'sedang_berlangsung';

                    let StepIcon = Check;
                    if (step.key === 'permohonan') StepIcon = Check;
                    else if (step.key === 'pengadaan') StepIcon = isStepSelesai ? Check : FileText;
                    else if (step.key === 'pembelian_barang') StepIcon = isStepSelesai ? Check : ShoppingCart;
                    else if (step.key === 'penerimaan_barang') StepIcon = isStepSelesai ? Check : Package;
                    else if (step.key === 'selesai') StepIcon = CheckCircle2;

                    const nextStep = stepperItems[idx + 1];
                    const isLineActive =
                      nextStep && (nextStep.status === 'selesai' || nextStep.status === 'sedang_berlangsung');

                    return (
                      <div key={step.key} className="flex-1 flex flex-col items-center relative group">
                        {/* Connecting Line */}
                        {idx < stepperItems.length - 1 && (
                          <div
                            className={`absolute top-3.5 left-1/2 w-full h-[2px] -z-0 ${
                              isLineActive ? 'bg-[#0E7C5A]' : 'bg-[#E4EBE8]'
                            }`}
                          />
                        )}

                        {/* Step Circle */}
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center relative z-10 transition-transform ${
                            isStepSelesai
                              ? 'bg-[#0E7C5A] text-white shadow-xs'
                              : isStepActive
                              ? 'bg-[#0E7C5A] text-white ring-4 ring-[#E8F5EF]'
                              : 'bg-white border-2 border-[#D5DFDC] text-[#8A9A95]'
                          }`}
                        >
                          <StepIcon className="w-3.5 h-3.5" />
                        </div>

                        {/* Labels */}
                        <p className="text-[11px] font-bold text-[#14201C] mt-2 text-center whitespace-nowrap">
                          {step.label}
                        </p>
                        <p
                          className={`text-[10px] font-medium mt-0.5 text-center whitespace-nowrap ${
                            isStepSelesai
                              ? 'text-[#0E7C5A]'
                              : isStepActive
                              ? 'text-[#0E7C5A]'
                              : 'text-[#8A9A95]'
                          }`}
                        >
                          {step.subtext}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Vertical Timeline Events */}
              <div className="pt-4 border-t border-[#F0F4F2] space-y-3.5">
                {visibleTimeline.map((item, idx) => (
                  <div key={item.id ?? idx} className="flex items-start gap-3.5 text-xs">
                    {/* Timestamp */}
                    <span className="font-mono text-[#5F6F6A] w-28 sm:w-32 shrink-0 pt-0.5">
                      {item.tanggal}
                    </span>

                    {/* Indicator Dot & Vertical Connector Line */}
                    <div className="flex flex-col items-center pt-1.5 shrink-0">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          item.aktif
                            ? 'bg-[#0E7C5A] ring-2 ring-[#BDE8D1]'
                            : 'bg-[#0E7C5A]'
                        }`}
                      />
                      {idx < visibleTimeline.length - 1 && (
                        <span className="w-0.5 h-6 bg-[#CDE9DE] mt-1" />
                      )}
                    </div>

                    {/* Event Description */}
                    <div className="text-[#14201C] font-normal leading-relaxed flex-1">
                      <span>{item.keterangan}</span>
                    </div>
                  </div>
                ))}

                {/* Toggle Button */}
                {rawTimeline.length > 5 && (
                  <div className="flex justify-center pt-3">
                    <button
                      type="button"
                      onClick={() => setTimelineExpanded(!timelineExpanded)}
                      className="text-xs font-semibold text-[#0E7C5A] hover:text-[#0A5C43] inline-flex items-center gap-1 transition-colors cursor-pointer py-1"
                    >
                      <span>{timelineExpanded ? 'Tampilkan Lebih Sedikit' : 'Tampilkan Selengkapnya'}</span>
                      {timelineExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Perbaikan Jenis MAK pada Dokumen Pengadaan (Turunan) jika ada child */}
        {pengadaanChildren.length > 0 && mode === 'pengadaan' && (
          <div className="bg-white rounded-[22px] md:rounded-[24px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(20,32,28,0.04)]">
            <div className="pb-4 mb-4 border-b border-[#F0F4F2]">
              <h3 className="text-base font-bold text-[#14201C]">
                Dokumen Pengadaan (Turunan) &amp; Perbaikan Jenis MAK
              </h3>
              <p className="text-xs text-[#8A9A95] mt-0.5">
                Perencanaan dapat memperbaiki Jenis MAK pada Dokumen Pengadaan menggunakan salah satu Jenis MAK dari permohonan induk selama PPK belum menyetujui.
              </p>
            </div>

            <div className="space-y-4">
              {pengadaanChildren.map((child) => {
                const isLocked = isPengadaanLockedByPpk(child);
                const currentMakId =
                  pengadaanMakDrafts[child.id] ?? child.mak_id ?? child.mak?.id ?? 0;
                const isSavingThis = updatingPengadaanId === child.id;
                const childError = pengadaanMakErrors[child.id];

                return (
                  <div
                    key={child.id}
                    className="p-4 rounded-xl border border-[#E4EBE8] bg-[#FAFCFB] space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-[#14201C]">
                          {child.judul || `Paket Pengadaan #${child.id}`}
                        </p>
                        <div className="text-[11px] text-[#8A9A95] mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span>Nilai: <strong className="text-[#0E7C5A]">{formatRupiah(child.nilai)}</strong></span>
                          <span>•</span>
                          <span>Status:</span>
                          <StatusPill status={child.status} />
                        </div>
                      </div>
                      {isLocked && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FEF3DC] text-[#9A5B00]">
                          <Lock className="w-3 h-3" />
                          <span>Terkunci (Telah Disetujui PPK)</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                      <div className="relative flex-1">
                        <select
                          value={currentMakId}
                          disabled={isLocked || isSavingThis}
                          onChange={(e) =>
                            onPengadaanMakDraftChange?.(child.id, Number(e.target.value))
                          }
                          className="w-full appearance-none px-3.5 py-2.5 pr-9 rounded-xl border border-[#E4EBE8] bg-white text-xs font-medium text-[#14201C] focus:outline-none focus:border-[#0E7C5A] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {permohonanMakOptions.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.kode ? `${opt.kode} - ${opt.nama}` : opt.nama}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-[#8A9A95] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>

                      <button
                        type="button"
                        disabled={
                          isLocked ||
                          isSavingThis ||
                          !currentMakId ||
                          currentMakId === (child.mak_id ?? child.mak?.id)
                        }
                        onClick={() => onSavePengadaanMak?.(child.id)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0E7C5A] hover:bg-[#0A5C43] text-xs font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
                      >
                        {isSavingThis ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Save className="w-3.5 h-3.5" />
                        )}
                        <span>Simpan Jenis MAK</span>
                      </button>
                    </div>

                    {childError && (
                      <p className="text-[11px] font-medium text-[#D92D20]">{childError}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal Konfirmasi Setujui */}
      {approveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[24px] border border-[#E3EAE6] shadow-xl w-full max-w-[440px] p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E4F6EC] text-[#0E7C5A] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#14201C]">
                  Setujui &amp; Teruskan Permohonan
                </h3>
                <p className="text-xs text-[#8A9A95] mt-0.5">
                  Pastikan Jenis MAK yang dipilih sudah sesuai dengan RKAKL
                </p>
              </div>
            </div>

            <p className="text-xs text-[#5F6F6A] leading-relaxed">
              Apakah Anda yakin ingin menyetujui permohonan{' '}
              <strong className="text-[#14201C]">{permohonan?.nomor_surat || ''}</strong> dan
              meneruskannya ke tahap berikutnya?
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0F4F2]">
              <button
                type="button"
                onClick={onCloseApproveModal}
                disabled={processing}
                className="px-4 py-2 rounded-xl border border-[#E4EBE8] text-xs font-semibold text-[#5F6F6A] hover:bg-[#F4F7F5] transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={onConfirmApprove}
                disabled={processing || selectedMakIds.filter(Boolean).length === 0}
                className="px-5 py-2 rounded-xl bg-[#0E7C5A] hover:bg-[#0A5C43] text-xs font-bold text-white disabled:opacity-50 transition-colors cursor-pointer"
              >
                {processing ? 'Memproses...' : 'Ya, Simpan dan Kirim'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tolak Permohonan */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
          <form
            onSubmit={onConfirmReject}
            className="bg-white rounded-[24px] border border-[#E3EAE6] shadow-xl w-full max-w-[460px] p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#14201C]">Tolak Permohonan</h3>
                <p className="text-xs text-[#8A9A95] mt-0.5">
                  Berikan alasan penolakan yang jelas kepada unit pemohon
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#14201C] mb-1.5">
                Alasan Penolakan <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={alasanPenolakan}
                onChange={(e) => onAlasanChange(e.target.value)}
                placeholder="Tuliskan alasan penolakan (minimal 5 karakter)..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4EBE8] text-xs text-[#14201C] focus:outline-none focus:ring-2 focus:ring-[#D92D20] bg-[#FAFCFB] focus:bg-white"
              />
              {alasanError && (
                <p className="text-[11px] font-medium text-[#D92D20] mt-1">{alasanError}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0F4F2]">
              <button
                type="button"
                onClick={onCloseRejectModal}
                disabled={processing}
                className="px-4 py-2 rounded-xl border border-[#E4EBE8] text-xs font-semibold text-[#5F6F6A] hover:bg-[#F4F7F5] transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={processing || !alasanPenolakan.trim()}
                className="px-5 py-2 rounded-xl bg-[#D92D20] hover:bg-[#B42318] text-xs font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {processing ? 'Menolak...' : 'Tolak Permohonan'}
              </button>
            </div>
          </form>
        </div>
      )}
    </AppLayout>
  );
};

export default PerencanaanPengajuanShowTemplate;
