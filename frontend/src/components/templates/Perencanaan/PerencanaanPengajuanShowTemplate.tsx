import { type FC, type FormEvent } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronDown,
  Save,
  Lock,
  Check,
} from 'lucide-react';
import AppLayout from '../General/AppLayout';
import HeroBanner from '../../organisms/HeroBanner';
import StatusPill from '../../atoms/StatusPill';
import { PermohonanInfoSection } from '../../organisms/PermohonanInfoSection';
import { CatatanPerencanaanCard } from '../../organisms/Bidang2/CatatanPerencanaanCard';
import DokumenListCard from '../../organisms/DokumenListCard';
import CatatanPenolakanCard from '../../molecules/CatatanPenolakanCard';
import PerencanaanVerifikasiMakCard from '../../organisms/PerencanaanVerifikasiMakCard';
import RiwayatStatusTimeline, {
  type TimelineStepItem,
  type TimelineLogItem,
} from '../../organisms/RiwayatStatusTimeline';
import { formatRupiah, formatTanggalIndo } from '../../../utils/formatters';
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
  previewBlobUrl,
  previewDocId,
  isLoadingPreview = false,
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
  const permohonan = detail?.permohonan;
  const rawStatus = (permohonan?.status || 'diajukan').toLowerCase();
  const isSelesai = rawStatus === 'selesai' || rawStatus === 'barang_diterima';
  const isDitolak = rawStatus === 'ditolak';
  const isDiteruskan = rawStatus === 'diteruskan';
  const isDisetujui = ['disetujui', 'proses_pengadaan', 'sedang_diproses', 'selesai', 'barang_diterima'].includes(rawStatus);
  const pengadaanChildren: PerencanaanPengadaanChildItem[] = permohonan?.pengadaan || [];

  const permohonanMakOptions: PerencanaanMakItem[] =
    permohonan?.permohonan_mak && permohonan.permohonan_mak.length > 0
      ? permohonan.permohonan_mak
        .map((pm) => pm.mak)
        .filter((m): m is PerencanaanMakItem => Boolean(m))
      : (detail?.maks ?? maksList).filter((m) => (detail?.selected_mak_ids ?? selectedMakIds).includes(m.id));

  const unitNama =
    permohonan?.unit_kerja?.nama ||
    (permohonan as any)?.Unit?.nama ||
    (permohonan as any)?.unit?.nama ||
    (permohonan as any)?.pemohon_user?.unit_kerja?.nama ||
    (permohonan as any)?.pemohon?.nama ||
    'Jurusan Teknik Informatika & Komputer';

  // Stepper & Timeline Data
  const trackingData = detail?.tracking;

  const approvalPerencanaan =
    detail?.approval_perencanaan ||
    permohonan?.Approvals?.find(
      (a) => (a.tahap || '').toUpperCase() === 'PERENCANAAN'
    );
  const isPerencanaanDone = Boolean(approvalPerencanaan) || isDiteruskan || isDisetujui;

  const permohonanSteps: TimelineStepItem[] = [
    {
      key: 'diajukan',
      title: 'Diajukan Pemohon',
      subtitle: 'Permohonan diajukan oleh unit pemohon',
      state: 'done',
    },
    {
      key: 'verifikasi_perencanaan',
      title: 'Verifikasi Perencanaan',
      subtitle: isDitolak && !isPerencanaanDone
        ? 'Permohonan ditolak pada tahap perencanaan'
        : isPerencanaanDone
        ? 'Telah diverifikasi dan Jenis MAK ditetapkan'
        : 'Menunggu verifikasi dan penentuan Jenis MAK',
      state: isDitolak && !isPerencanaanDone
        ? 'rejected'
        : isPerencanaanDone
        ? 'done'
        : 'active',
    },
    {
      key: 'persetujuan_bidang2',
      title: 'Persetujuan Bidang 2',
      subtitle: isDitolak && isPerencanaanDone
        ? 'Permohonan ditolak oleh Bidang 2'
        : isDisetujui
        ? 'Disetujui oleh Wakil Direktur II'
        : isDiteruskan
        ? 'Menunggu persetujuan Wakil Direktur II'
        : 'Menunggu verifikasi perencanaan selesai',
      state: isDitolak && isPerencanaanDone
        ? 'rejected'
        : isDisetujui
        ? 'done'
        : isDiteruskan
        ? 'active'
        : 'pending',
    },
    {
      key: 'diteruskan_ppbj',
      title: 'Diteruskan ke PPBJ',
      subtitle: isDisetujui
        ? 'Disetujui dan diteruskan ke PPBJ untuk proses pengadaan'
        : 'Menunggu seluruh persetujuan diselesaikan',
      state: isDisetujui ? 'done' : 'pending',
    },
  ];

  const timelineLogs: TimelineLogItem[] =
    detail?.history && detail.history.length > 0
      ? detail.history.map((h, idx) => ({
          id: h.id,
          waktu: h.waktu || null,
          deskripsi: h.deskripsi,
          actor_nama: h.actor_nama || null,
          actor_role: h.actor_role || null,
          aktif: idx === 0,
        }))
      : trackingData?.timeline && trackingData.timeline.length > 0
      ? trackingData.timeline.map((t, idx) => ({
          id: t.id ?? idx,
          waktu: t.tanggal || null,
          deskripsi: t.keterangan,
          actor_nama: t.actor_nama || null,
          aktif: idx === 0,
        }))
      : [
          {
            id: 1,
            waktu: formatTanggalIndo(
              permohonan?.created_at ? String(permohonan.created_at) : undefined
            ),
            deskripsi: `Permohonan diajukan oleh ${unitNama}`,
            actor_nama:
              (permohonan as any)?.pembuat_nama ||
              (permohonan as any)?.pemohon?.nama ||
              'Pemohon',
            actor_role: 'Pemohon',
            aktif: true,
          },
        ];

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
          { label: 'LIST PENGAJUAN', href: '/perencanaan/permohonan' },
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
        { label: 'LIST PENGAJUAN', href: '/perencanaan/permohonan' },
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
        <PermohonanInfoSection
          permohonan={{
            nomor_surat: permohonan?.nomor_surat,
            created_at: permohonan?.created_at,
            judul: permohonan?.judul,
            unit_nama: unitNama,
            pembuat_nama: (permohonan as any)?.pembuat_nama || (permohonan as any)?.pemohon?.nama,
            estimasi_anggaran: permohonan?.estimasi_anggaran,
            status: rawStatus,
          }}
        />

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
          <CatatanPenolakanCard catatan={detail?.catatan_penolakan} />
        )}

        {/* Two-Column Section (Dokumen Permohonan & Timeline Proses) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left Column: Dokumen Permohonan */}
          <DokumenListCard
            title="Dokumen Permohonan"
            dokumenList={dokumenList}
            nomorSurat={permohonan?.nomor_surat}
            onViewNewTab={onViewDokumen}
            onDownload={onDownloadDokumen}
            isViewingId={isViewingDocId}
            isDownloadingId={isDownloadingDocId}
            previewBlobUrl={previewBlobUrl}
            previewDocId={previewDocId}
            isLoadingPreview={isLoadingPreview}
            autoExpand={true}
          />

          {/* Right Column: MAK & Timeline, atau Verifikasi MAK */}
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
            <div className="space-y-6">
              <CatatanPerencanaanCard
                catatan={{
                  catatan: detail?.approval_perencanaan?.alasan ?? null,
                  pemeriksa_peran: 'Tim Perencanaan',
                }}
                makList={permohonanMakOptions.map((mak) => ({
                  id: mak.id,
                  kode: mak.kode ?? '',
                  nama: mak.nama,
                  ppk_nama:
                    mak.ppk_user?.nama || mak.ppk?.nama || mak.Ppk?.nama || null,
                }))}
              />

              <RiwayatStatusTimeline
                title="Timeline Proses"
                subtitle={
                  isSelesai
                    ? 'Seluruh tahapan telah diselesaikan'
                    : 'Posisi permohonan dalam alur proses'
                }
                steps={permohonanSteps}
                logs={timelineLogs}
              />
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
