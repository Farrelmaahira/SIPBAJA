import type { FC, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Banknote,
  Hash,
  Tag,
  CheckCircle2,
  XCircle,
  X,
  Info,
  Clock,
  Layers,
} from 'lucide-react';
import PpLayout from './PpLayout';
import StatusPill from '../atoms/StatusPill';
import PerencanaanDokumenCard from '../organisms/PerencanaanDokumenCard';
import PerencanaanVerifikasiMakCard from '../organisms/PerencanaanVerifikasiMakCard';
import type { PerencanaanPengajuanDetail, PerencanaanMakItem } from '../../types/perencanaan';
import { formatRupiah, formatTanggalIndo } from '../../utils/formatters';
import { PERENCANAAN_NAV_ITEMS } from '../../pages/Perencanaan/Dashboard';

export interface PerencanaanPengajuanShowTemplateProps {
  detail?: PerencanaanPengajuanDetail | null;
  isLoading?: boolean;
  mode: 'verifikasi' | 'pengadaan' | 'diteruskan';
  maksList: PerencanaanMakItem[];
  selectedMakIds: number[];
  onAddMak: () => void;
  onRemoveMak: (index: number) => void;
  onChangeMak: (index: number, makId: number) => void;
  onApproveClick: () => void;
  onRejectClick: () => void;
  onViewDokumen: () => void;
  onDownloadDokumen: () => void;
  isViewingDoc?: boolean;
  isDownloadingDoc?: boolean;
  processing?: boolean;

  // Modals
  approveModalOpen: boolean;
  rejectModalOpen: boolean;
  alasanPenolakan: string;
  alasanError?: string;
  onCloseApproveModal: () => void;
  onCloseRejectModal: () => void;
  onConfirmApprove: () => void;
  onConfirmReject: (e: FormEvent) => void;
  onAlasanChange: (val: string) => void;

  // Notifications
  recentNotifications?: unknown[];
  unreadNotificationsCount?: number;
}

export const PerencanaanPengajuanShowTemplate: FC<PerencanaanPengajuanShowTemplateProps> = ({
  detail,
  isLoading = false,
  mode,
  maksList,
  selectedMakIds,
  onAddMak,
  onRemoveMak,
  onChangeMak,
  onApproveClick,
  onRejectClick,
  onViewDokumen,
  onDownloadDokumen,
  isViewingDoc = false,
  isDownloadingDoc = false,
  processing = false,

  approveModalOpen,
  rejectModalOpen,
  alasanPenolakan,
  alasanError = '',
  onCloseApproveModal,
  onCloseRejectModal,
  onConfirmApprove,
  onConfirmReject,
  onAlasanChange,

  recentNotifications = [],
  unreadNotificationsCount = 0,
}) => {
  const permohonan = detail?.permohonan;
  const statusStr = permohonan?.status || 'diajukan';
  const unitNama = permohonan?.Unit?.nama || (permohonan as any)?.unit?.nama || '-';
  const creatorNama = permohonan?.Creator?.nama || (permohonan as any)?.creator?.nama || '-';

  if (isLoading || !permohonan) {
    return (
      <PpLayout
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
          { label: 'DASHBOARD', href: '/perencanaan/dashboard' },
          { label: 'MEMUAT PENGAJUAN...' },
        ]}
      >
        <div className="space-y-6 animate-pulse">
          <div className="h-32 bg-gray-200 rounded-[24px]" />
          <div className="h-64 bg-white rounded-[22px] border border-gray-100" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-white rounded-[22px] border border-gray-100" />
            <div className="h-96 bg-white rounded-[22px] border border-gray-100" />
          </div>
        </div>
      </PpLayout>
    );
  }

  const selectedMaksData = maksList.filter((m) => selectedMakIds.includes(m.id));

  return (
    <PpLayout
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
        { label: 'DASHBOARD', href: '/perencanaan/dashboard' },
        { label: mode === 'pengadaan' ? 'DETAIL PENGADAAN' : 'DETAIL PERMOHONAN' },
      ]}
    >
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-[24px] bg-[#0E7C5A] p-6 sm:px-9 sm:py-7 text-white shadow-[0_10px_24px_rgba(13,51,38,0.14)] mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/75 block mb-1">
              {mode === 'pengadaan' ? 'PENGADAAN MASUK' : 'PERMOHONAN MASUK'}
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight">
                {mode === 'pengadaan' ? 'Detail Pengadaan' : 'Detail Permohonan'}
              </h1>
              <StatusPill status={statusStr} />
            </div>
            <p className="text-xs text-white/85 mt-1.5">
              Nomor {permohonan.nomor_surat || '-'} · Diajukan {formatTanggalIndo(permohonan.created_at, true)}
            </p>
          </div>

          <Link
            to="/perencanaan/pengajuan"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-bold transition-colors shrink-0 self-start sm:self-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </Link>
        </div>
        <div
          className="absolute -right-10 -top-20 w-[260px] h-[260px] rounded-full bg-white/8 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute right-28 -bottom-20 w-[180px] h-[180px] rounded-full bg-white/8 pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* Card 1: Informasi Permohonan / Pengadaan */}
      <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] mb-6">
        <div className="pb-4 mb-5 border-b border-[#F0F4F2]">
          <h3 className="text-base font-bold text-[#14201C]">
            {mode === 'pengadaan' ? 'Informasi Pengadaan' : 'Informasi Permohonan'}
          </h3>
          <p className="text-xs text-[#8A9A95] mt-0.5">
            {mode === 'pengadaan' ? 'Ringkasan data pengadaan' : 'Ringkasan data yang diajukan'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 text-xs">
          <div className="flex items-center gap-3.5 pb-4 border-b border-[#F4F7F5]">
            <div className="w-9 h-9 rounded-xl bg-[#F4F7F5] text-[#0E7C5A] flex items-center justify-center shrink-0">
              <Hash className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[#8A9A95] text-[11px]">Nomor Surat</p>
              <p className="font-bold text-[#14201C] mt-0.5">{permohonan.nomor_surat || '-'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 pb-4 border-b border-[#F4F7F5]">
            <div className="w-9 h-9 rounded-xl bg-[#F4F7F5] text-[#0E7C5A] flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[#8A9A95] text-[11px]">Tanggal Pengajuan</p>
              <p className="font-bold text-[#14201C] mt-0.5">
                {formatTanggalIndo(permohonan.created_at, true)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 pb-4 border-b border-[#F4F7F5]">
            <div className="w-9 h-9 rounded-xl bg-[#F4F7F5] text-[#0E7C5A] flex items-center justify-center shrink-0">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[#8A9A95] text-[11px]">Judul Pengadaan</p>
              <p className="font-bold text-[#14201C] mt-0.5">{permohonan.judul || '-'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 pb-4 border-b border-[#F4F7F5]">
            <div className="w-9 h-9 rounded-xl bg-[#F4F7F5] text-[#0E7C5A] flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[#8A9A95] text-[11px]">Unit Kerja Pemohon</p>
              <p className="font-bold text-[#14201C] mt-0.5">
                {unitNama} (diajukan oleh {creatorNama})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 pb-4 border-b border-[#F4F7F5]">
            <div className="w-9 h-9 rounded-xl bg-[#F4F7F5] text-[#0E7C5A] flex items-center justify-center shrink-0">
              <Banknote className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[#8A9A95] text-[11px]">Estimasi Anggaran</p>
              <p className="font-bold text-[#0E7C5A] text-sm mt-0.5">
                {formatRupiah(permohonan.estimasi_anggaran ?? (permohonan as any).nominal)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 pb-4 border-b border-[#F4F7F5]">
            <div className="w-9 h-9 rounded-xl bg-[#F4F7F5] text-[#0E7C5A] flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[#8A9A95] text-[11px]">Status Saat Ini</p>
              <div className="mt-1">
                <StatusPill status={statusStr} />
              </div>
            </div>
          </div>
        </div>

        {permohonan.ringkasan_tujuan && (
          <div className="mt-4 pt-4 border-t border-[#F4F7F5] text-xs">
            <p className="text-[#8A9A95] text-[11px] mb-1">Ringkasan Tujuan</p>
            <p className="text-[#14201C] leading-relaxed">{permohonan.ringkasan_tujuan}</p>
          </div>
        )}
      </div>

      {/* Main Review Section: Dokumen & Verifikasi MAK */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <PerencanaanDokumenCard
            dokumen={detail.dokumen || (detail.dokumen_permohonan && detail.dokumen_permohonan[0])}
            nomorSurat={permohonan.nomor_surat}
            judul={permohonan.judul}
            unitNama={unitNama}
            tanggal={permohonan.created_at}
            onViewNewTab={onViewDokumen}
            onDownload={onDownloadDokumen}
            isViewing={isViewingDoc}
            isDownloading={isDownloadingDoc}
          />
        </div>

        <div>
          {mode === 'verifikasi' ? (
            <PerencanaanVerifikasiMakCard
              maksList={maksList}
              selectedMakIds={selectedMakIds}
              onAddMak={onAddMak}
              onRemoveMak={onRemoveMak}
              onChangeMak={onChangeMak}
              onApproveClick={onApproveClick}
              onRejectClick={onRejectClick}
              processing={processing}
            />
          ) : (
            <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
              <div className="pb-4 mb-4 border-b border-[#F0F4F2]">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#14201C]">Jenis MAK</h3>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#E4F6EC] text-[#0B7A4E]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Tersimpan
                  </span>
                </div>
                <p className="text-xs text-[#8A9A95] mt-0.5">
                  Mata Anggaran Kegiatan yang ditetapkan untuk permohonan ini
                </p>
              </div>

              <div className="space-y-2.5">
                {selectedMaksData.length > 0 ? (
                  selectedMaksData.map((mak) => (
                    <div
                      key={mak.id}
                      className="p-3 rounded-xl bg-[#F4F7F5] border border-[#E4EBE8] flex items-start gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#0E7C5A] mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#14201C]">{mak.nama}</p>
                        <p className="text-[11px] text-[#8A9A95] mt-0.5">
                          PPK: {mak.Ppk?.nama || 'Pejabat Pembuat Komitmen'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#8A9A95] italic">Tidak ada rincian MAK tersimpan.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Riwayat Approval */}
      {permohonan.Approvals && permohonan.Approvals.length > 0 && (
        <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] mb-6">
          <div className="pb-4 mb-4 border-b border-[#F0F4F2] flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#14201C]">Riwayat Persetujuan &amp; Catatan</h3>
              <p className="text-xs text-[#8A9A95] mt-0.5">
                Jejak audit keputusan pemeriksa permohonan
              </p>
            </div>
            <Clock className="w-5 h-5 text-[#8A9A95]" />
          </div>

          <div className="divide-y divide-[#F0F4F2]">
            {permohonan.Approvals.map((app) => (
              <div key={app.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#14201C]">
                      {app.Actor?.Role?.nama || app.Actor?.nama || app.tahap}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        app.keputusan === 'disetujui'
                          ? 'bg-[#E4F6EC] text-[#0B7A4E]'
                          : 'bg-[#FDECEC] text-[#B42318]'
                      }`}
                    >
                      {app.keputusan}
                    </span>
                  </div>
                  {app.catatan && (
                    <p className="text-xs text-[#5F6F6A] bg-[#F9FBFA] p-2.5 rounded-lg border border-[#E4EBE8]">
                      {app.catatan}
                    </p>
                  )}
                </div>
                <span className="text-[11px] text-[#8A9A95] shrink-0">
                  {formatTanggalIndo(app.created_at, true)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Approve */}
      {approveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-[#E4EBE8]">
            <div className="w-12 h-12 rounded-2xl bg-[#E4F6EC] text-[#0E7C5A] flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-center mb-5">
              <h3 className="text-base font-bold text-[#14201C]">Verifikasi Permohonan?</h3>
              <p className="text-xs text-[#5F6F6A] mt-1.5 leading-relaxed">
                Permohonan akan diverifikasi dengan <strong>{selectedMakIds.length} Jenis MAK</strong> dan diteruskan ke tahap berikutnya.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onCloseApproveModal}
                disabled={processing}
                className="py-2.5 px-3 rounded-xl border border-[#E4EBE8] text-xs font-bold text-[#5F6F6A] hover:bg-[#F4F7F5] disabled:opacity-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={onConfirmApprove}
                disabled={processing}
                className="py-2.5 px-3 rounded-xl bg-[#0E7C5A] hover:bg-[#0A5C43] text-xs font-bold text-white disabled:opacity-50 transition-colors shadow-xs"
              >
                {processing ? 'Memproses...' : 'Ya, Verifikasi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reject */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-[#E4EBE8]">
            <div className="flex items-start justify-between pb-4 border-b border-[#F0F4F2]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FDECEC] text-[#D92D20] flex items-center justify-center shrink-0">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#14201C]">Tolak Permohonan</h3>
                  <p className="text-xs text-[#8A9A95]">Nomor {permohonan.nomor_surat || '-'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onCloseRejectModal}
                className="w-8 h-8 rounded-lg border border-[#E4EBE8] text-[#8A9A95] hover:text-[#14201C] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={onConfirmReject} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-[#14201C] mb-1.5">
                  Catatan / Alasan Penolakan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={alasanPenolakan}
                  onChange={(e) => onAlasanChange(e.target.value)}
                  rows={4}
                  placeholder="Tuliskan catatan alasan penolakan secara jelas (minimal 5 karakter)..."
                  className="w-full p-3 rounded-xl border border-[#E4EBE8] text-xs font-medium text-[#14201C] focus:outline-none focus:border-[#0E7C5A]"
                />
                {alasanError && (
                  <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    <span>{alasanError}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onCloseRejectModal}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-[#E4EBE8] text-[#5F6F6A] hover:bg-[#F4F7F5]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#D92D20] hover:bg-[#B42318] text-white disabled:opacity-50"
                >
                  {processing ? 'Memproses...' : 'Tolak Permohonan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PpLayout>
  );
};

export default PerencanaanPengajuanShowTemplate;
