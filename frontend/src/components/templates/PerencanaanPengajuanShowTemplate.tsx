import { useState, type FC, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Loader2,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  Save,
  Lock,
} from 'lucide-react';
import AppLayout from './AppLayout';
import StatusPill from '../atoms/StatusPill';
import DokumenListCard from '../organisms/DokumenListCard';
import RiwayatStatusTimeline, { type TimelineStepItem } from '../organisms/RiwayatStatusTimeline';
import PerencanaanVerifikasiMakCard from '../organisms/PerencanaanVerifikasiMakCard';
import { formatRupiah, formatTanggalIndo } from '../../utils/formatters';
import { PERENCANAAN_NAV_ITEMS } from '../../pages/Perencanaan/Dashboard';
import type {
  PerencanaanPengajuanDetail,
  PerencanaanMakItem,
  PerencanaanPengadaanChildItem,
} from '../../types/perencanaan';
import type { DokumenItem } from '../../types/dokumen';
import type { NotificationItem } from '../../types/notification';

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
  alasanError: string;
  onCloseApproveModal: () => void;
  onCloseRejectModal: () => void;
  onConfirmApprove: () => void;
  onConfirmReject: (e: FormEvent) => void;
  onAlasanChange: (val: string) => void;

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
  rkaklPreviewBlobUrl = null,
  isLoadingRkaklPreview = false,
  processing = false,
  pengadaanMakDrafts = {},
  updatingPengadaanId = null,
  pengadaanMakErrors = {},
  onPengadaanMakDraftChange,
  onSavePengadaanMak,
  approveModalOpen,
  rejectModalOpen,
  alasanPenolakan,
  alasanError,
  onCloseApproveModal,
  onCloseRejectModal,
  onConfirmApprove,
  onConfirmReject,
  onAlasanChange,
  recentNotifications,
  unreadNotificationsCount,
}) => {
  const [activeDocTab, setActiveDocTab] = useState<'permohonan' | 'rkakl'>('permohonan');

  const permohonan = detail?.permohonan;
  const rawStatus = permohonan?.status || 'diajukan';
  const rkaklActive = detail?.rkakl_active || null;
  const pengadaanChildren: PerencanaanPengadaanChildItem[] = permohonan?.pengadaan || [];

  // Opsi Jenis MAK yang valid untuk perbaikan Dokumen Pengadaan berasal dari PermohonanMak induk
  const permohonanMakOptions: PerencanaanMakItem[] =
    permohonan?.permohonan_mak && permohonan.permohonan_mak.length > 0
      ? permohonan.permohonan_mak
          .map((pm) => pm.mak)
          .filter((m): m is PerencanaanMakItem => Boolean(m))
      : maksList.filter((m) => selectedMakIds.includes(m.id));

  const timelineSteps: TimelineStepItem[] = [
    {
      title: 'Pengajuan Dibuat',
      subtitle: `${permohonan?.pemohon?.nama || 'Pemohon'} • ${formatTanggalIndo(permohonan?.created_at)}`,
      state: 'done',
    },
    {
      title:
        mode === 'verifikasi'
          ? 'Verifikasi Perencanaan'
          : rawStatus === 'ditolak'
            ? 'Ditolak Perencanaan'
            : 'Disetujui Perencanaan',
      subtitle:
        mode === 'verifikasi'
          ? 'Menunggu pemilihan Jenis MAK dan verifikasi anggaran'
          : `Unit Perencanaan • ${formatTanggalIndo(permohonan?.updated_at)}`,
      state:
        mode === 'verifikasi'
          ? 'active'
          : rawStatus === 'ditolak'
            ? 'rejected'
            : 'done',
    },
    {
      title: 'Tindak Lanjut Bidang 2 / PPBJ / Pengadaan',
      subtitle:
        mode === 'pengadaan'
          ? 'Sedang dalam proses pengadaan'
          : mode === 'diteruskan'
            ? 'Menunggu proses tahap selanjutnya'
            : 'Menunggu persetujuan Perencanaan',
      state:
        mode === 'pengadaan'
          ? 'done'
          : mode === 'diteruskan' && rawStatus !== 'ditolak'
            ? 'active'
            : 'pending',
    },
  ];

  const selectedMaksDisplay = maksList.filter((m) => selectedMakIds.includes(m.id));

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
        { label: 'List Pengajuan', href: '/perencanaan/pengajuan' },
        { label: permohonan?.nomor_surat || 'Detail Permohonan' },
      ]}
    >
      {isLoading ? (
        <div className="bg-white rounded-[22px] p-12 border border-[#E4EBE8] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-[#0E7C5A] animate-spin" />
          <p className="text-xs font-medium text-[#5F6F6A]">Memuat detail pengajuan...</p>
        </div>
      ) : (
        <>
          {/* Back Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <Link
                to="/perencanaan/pengajuan"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5F6F6A] hover:text-[#0E7C5A] mb-2 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Daftar Pengajuan</span>
              </Link>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#14201C]">
                  {permohonan?.judul || 'Detail Permohonan Pengadaan'}
                </h1>
                <StatusPill status={rawStatus} />
              </div>
              <p className="text-xs text-[#8A9A95] mt-1">
                No. Permohonan:{' '}
                <strong className="text-[#14201C]">{permohonan?.nomor_surat || '-'}</strong> •
                Diajukan pada {formatTanggalIndo(permohonan?.created_at)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Informasi Permohonan Card */}
              <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
                <div className="pb-4 mb-5 border-b border-[#F0F4F2]">
                  <h3 className="text-base font-bold text-[#14201C]">Informasi Permohonan</h3>
                  <p className="text-xs text-[#8A9A95] mt-0.5">
                    Rincian surat dan pengajuan anggaran dari unit pemohon
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A9A95]">
                      Nomor Surat
                    </p>
                    <p className="text-sm font-bold text-[#14201C] mt-1">
                      {permohonan?.nomor_surat || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A9A95]">
                      Nilai Estimasi Anggaran
                    </p>
                    <p className="text-sm font-extrabold text-[#0E7C5A] mt-1">
                      {formatRupiah(permohonan?.estimasi_anggaran)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A9A95]">
                      Unit Pemohon
                    </p>
                    <p className="text-xs font-semibold text-[#14201C] mt-1">
                      {permohonan?.unit_kerja?.nama ||
                        permohonan?.pemohon_user?.unit_kerja?.nama ||
                        permohonan?.pemohon?.nama ||
                        '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A9A95]">
                      Tanggal Pengajuan
                    </p>
                    <p className="text-xs font-semibold text-[#14201C] mt-1">
                      {formatTanggalIndo(permohonan?.created_at)}
                    </p>
                  </div>
                </div>

                {permohonan?.deskripsi && (
                  <div className="mt-5 pt-4 border-t border-[#F0F4F2]">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A9A95] mb-1.5">
                      Deskripsi / Latar Belakang
                    </p>
                    <p className="text-xs text-[#4B5854] leading-relaxed whitespace-pre-line">
                      {permohonan.deskripsi}
                    </p>
                  </div>
                )}
              </div>

              {/* Tab Switcher: Dokumen Permohonan vs Preview RKAKL */}
              <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-[#F0F4F2]">
                  <div>
                    <h3 className="text-base font-bold text-[#14201C]">
                      Berkas Lampiran &amp; Referensi RKAKL
                    </h3>
                    <p className="text-xs text-[#8A9A95] mt-0.5">
                      Periksa kelengkapan berkas permohonan dan kesesuaian terhadap dokumen RKAKL aktif
                    </p>
                  </div>
                  <div className="inline-flex p-1 rounded-xl bg-[#F3F6F5] border border-[#E4EBE8] text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveDocTab('permohonan')}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                        activeDocTab === 'permohonan'
                          ? 'bg-white text-[#0E7C5A] shadow-2xs'
                          : 'text-[#5F6F6A] hover:text-[#14201C]'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Berkas Permohonan</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveDocTab('rkakl')}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                        activeDocTab === 'rkakl'
                          ? 'bg-white text-[#0E7C5A] shadow-2xs'
                          : 'text-[#5F6F6A] hover:text-[#14201C]'
                      }`}
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Preview RKAKL</span>
                    </button>
                  </div>
                </div>

                {activeDocTab === 'permohonan' ? (
                  <DokumenListCard
                    title="Dokumen Permohonan"
                    subtitle="Surat permohonan beserta dokumen pendukung yang dilampirkan"
                    dokumenList={dokumenList}
                    onView={onViewDokumen}
                    onDownload={onDownloadDokumen}
                    isViewingId={isViewingDocId}
                    isDownloadingId={isDownloadingDocId}
                    previewBlobUrl={previewBlobUrl}
                    previewDocId={previewDocId}
                    isLoadingPreview={isLoadingPreview}
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 bg-[#F8FAF9] p-4 rounded-xl border border-[#E4EBE8]">
                      <div>
                        <p className="text-xs font-bold text-[#14201C]">
                          {rkaklActive?.nama_asli || 'Dokumen RKAKL Aktif'}
                        </p>
                        <p className="text-[11px] text-[#8A9A95] mt-0.5">
                          {rkaklActive
                            ? `Versi ${rkaklActive.versi ?? 1} • Diunggah pada ${formatTanggalIndo(rkaklActive.created_at)}`
                            : 'Belum ada dokumen RKAKL aktif yang diunggah.'}
                        </p>
                      </div>
                      <Link
                        to="/perencanaan/rkakl"
                        className="text-xs font-bold text-[#0E7C5A] hover:underline"
                      >
                        Kelola RKAKL
                      </Link>
                    </div>

                    {isLoadingRkaklPreview ? (
                      <div className="h-[460px] rounded-xl border border-[#E4EBE8] bg-[#F8FAF9] flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 text-[#0E7C5A] animate-spin" />
                        <p className="text-xs text-[#5F6F6A]">Memuat pratinjau dokumen RKAKL...</p>
                      </div>
                    ) : rkaklPreviewBlobUrl ? (
                      <iframe
                        src={rkaklPreviewBlobUrl}
                        title="Pratinjau Dokumen RKAKL"
                        className="w-full h-[520px] rounded-xl border border-[#E4EBE8] bg-white"
                      />
                    ) : (
                      <div className="h-[240px] rounded-xl border border-[#E4EBE8] bg-[#F8FAF9] flex flex-col items-center justify-center gap-2 text-center p-6">
                        <FileSpreadsheet className="w-8 h-8 text-[#C5D2CD]" />
                        <p className="text-xs font-semibold text-[#5F6F6A]">
                          Pratinjau RKAKL belum tersedia.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Perbaikan Jenis MAK pada Dokumen Pengadaan (Turunan) */}
              {pengadaanChildren.length > 0 && (
                <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
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
                              <p className="text-[11px] text-[#8A9A95] mt-0.5">
                                Nilai: <strong className="text-[#0E7C5A]">{formatRupiah(child.nilai)}</strong> •
                                Status: <span className="font-semibold">{child.status}</span>
                              </p>
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

            {/* Right Column (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
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
                <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
                  <div className="pb-4 mb-4 border-b border-[#F0F4F2]">
                    <h3 className="text-base font-bold text-[#14201C]">Jenis MAK Terpilih</h3>
                    <p className="text-xs text-[#8A9A95] mt-0.5">
                      Mata Anggaran Kegiatan yang telah ditetapkan untuk permohonan ini
                    </p>
                  </div>
                  {selectedMaksDisplay.length === 0 ? (
                    <p className="text-xs text-[#8A9A95] italic">Tidak ada data Jenis MAK.</p>
                  ) : (
                    <ul className="space-y-2">
                      {selectedMaksDisplay.map((m) => (
                        <li
                          key={m.id}
                          className="px-3.5 py-2.5 rounded-xl bg-[#F4F8F6] border border-[#E2ECE7] text-xs font-bold text-[#0E7C5A]"
                        >
                          {m.kode ? `${m.kode} - ${m.nama}` : m.nama}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <RiwayatStatusTimeline steps={timelineSteps} />
            </div>
          </div>
        </>
      )}

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
              meneruskannya ke Wakil Direktur Bidang 2?
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
