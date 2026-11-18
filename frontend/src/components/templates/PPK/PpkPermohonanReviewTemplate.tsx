import { useRef, type FC, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Calendar,
  Tag,
  Building2,
  Banknote,
  XCircle,
  CheckCircle2,
  Info,
  Hash,
  Upload,
  X,
  AlertTriangle,
} from 'lucide-react';
import AppLayout, { type AppNavItem as PpNavItem } from '../General/AppLayout';
import { DokumenListCard } from '../../organisms/DokumenListCard';
import { formatRupiah, formatTanggal } from '../../../utils/formatters';
import type { NotificationItem } from '../../../types/notification';
import type { DokumenItem } from '../../../types/dokumen';
import type { PpkPermohonanViewModel } from '../../../utils/ppkPermohonan';

export interface PpkPermohonanReviewTemplateProps {
  navItems: PpNavItem[];
  viewModel: PpkPermohonanViewModel | null;
  isLoading: boolean;
  error?: string | null;
  onViewDokumen?: (dokumen: DokumenItem) => void;
  onDownloadDokumen?: (dokumen: DokumenItem) => void;
  isViewingDocId?: number | string | null;
  isDownloadingDocId?: number | string | null;
  previewBlobUrl?: string | null;
  previewDocId?: number | string | null;
  isLoadingPreview?: boolean;
  approveModalOpen: boolean;
  onOpenApproveModal: () => void;
  onCloseApproveModal: () => void;
  selectedMemoFile: File | null;
  memoFileError: string;
  catatanApprove: string;
  onSelectMemoFile: (file: File | null) => void;
  onCatatanApproveChange: (val: string) => void;
  onApproveSubmit: (e: FormEvent) => void;
  rejectModalOpen: boolean;
  onOpenRejectModal: () => void;
  onCloseRejectModal: () => void;
  alasanTolak: string;
  alasanError: string;
  onAlasanTolakChange: (val: string) => void;
  onRejectSubmit: (e: FormEvent) => void;
  isSubmitting: boolean;
  recentNotifications: NotificationItem[];
  unreadNotificationsCount: number;
}

export const PpkPermohonanReviewTemplate: FC<PpkPermohonanReviewTemplateProps> = ({
  navItems,
  viewModel,
  isLoading,
  error = null,
  onViewDokumen,
  onDownloadDokumen,
  isViewingDocId = null,
  isDownloadingDocId = null,
  previewBlobUrl = null,
  previewDocId = null,
  isLoadingPreview = false,
  approveModalOpen,
  onOpenApproveModal,
  onCloseApproveModal,
  selectedMemoFile,
  memoFileError,
  catatanApprove,
  onSelectMemoFile,
  onCatatanApproveChange,
  onApproveSubmit,
  rejectModalOpen,
  onOpenRejectModal,
  onCloseRejectModal,
  alasanTolak,
  alasanError,
  onAlasanTolakChange,
  onRejectSubmit,
  isSubmitting,
  recentNotifications,
  unreadNotificationsCount,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <AppLayout
      activeRoute="permohonan"
      navItems={navItems}
      roleInitials="PPK"
      roleTitle="PPK"
      roleSubtitle="Pejabat Pembuat Komitmen"
      profileHref="/ppk/profil"
      notifikasiHref="/ppk/notifikasi"
      readAllHref="/ppk/notifikasi/read-all"
      notifications={recentNotifications}
      unreadCount={unreadNotificationsCount}
      breadcrumb={[
        { label: 'DAFTAR PERMOHONAN', href: '/ppk/permohonan' },
        { label: 'REVIEW PERMOHONAN AWAL PPK' },
      ]}
    >
      <div className="space-y-6">
        {/* Hero Top Banner */}
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#0A5C42] to-[#17A373] p-6 sm:px-9 sm:py-8 text-white shadow-[0_10px_24px_rgba(13,51,38,0.14)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/75 block mb-2">
                PERSETUJUAN AWAL PERMOHONAN
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight leading-9">
                  Review Permohonan
                </h1>
                {viewModel?.canDecide && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/16 text-white">
                    Menunggu Persetujuan PPK
                  </span>
                )}
              </div>
              <p className="text-sm text-white/85 mt-2">
                Nomor {viewModel?.nomorSurat ?? '-'} · Diajukan{' '}
                {formatTanggal(viewModel?.tanggal)}
              </p>
            </div>

            <Link
              to="/ppk/permohonan"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-[14px] bg-white/16 hover:bg-white/25 border border-white/35 text-white text-sm font-semibold transition-colors shrink-0 self-start sm:self-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-[20px] p-12 border border-[#E3EAE6] text-center">
            <div className="w-7 h-7 border-2 border-[#0E7C5A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-[#6B7A73]">Memuat detail permohonan PPK...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-[20px] p-8 border border-[#FECDCA] text-center">
            <p className="text-sm font-semibold text-[#D92D20]">{error}</p>
          </div>
        ) : !viewModel ? (
          <div className="bg-white rounded-[20px] p-8 border border-[#E3EAE6] text-center">
            <p className="text-sm text-[#6B7A73]">Detail permohonan tidak tersedia.</p>
          </div>
        ) : (
          <>
            {/* Informasi Permohonan */}
            <div className="bg-white rounded-[20px] p-6 sm:p-8 border border-[#E3EAE6] shadow-[0_8px_12px_rgba(13,26,20,0.06)]">
              <div className="mb-6 pb-4 border-b border-[#E3EAE6]">
                <h3 className="text-lg font-bold text-[#0E1B16]">Informasi Permohonan</h3>
                <p className="text-xs text-[#6B7A73] mt-0.5">
                  Ringkasan permohonan yang terikat dengan Jenis MAK Anda
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm">
                <div className="flex items-center gap-3.5 pb-4 border-b border-[#E3EAE6]">
                  <div className="w-10 h-10 rounded-xl bg-[#EBF7F1] text-[#0F6A49] flex items-center justify-center shrink-0">
                    <Hash className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7A73]">Nomor Permohonan</p>
                    <p className="font-semibold text-sm text-[#0F6A49] mt-0.5">
                      {viewModel.nomorSurat}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 pb-4 border-b border-[#E3EAE6]">
                  <div className="w-10 h-10 rounded-xl bg-[#EBF7F1] text-[#0F6A49] flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7A73]">Tanggal Pengajuan</p>
                    <p className="font-semibold text-sm text-[#0E1B16] mt-0.5">
                      {formatTanggal(viewModel.tanggal)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 pb-4 border-b border-[#E3EAE6]">
                  <div className="w-10 h-10 rounded-xl bg-[#EBF7F1] text-[#0F6A49] flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7A73]">Judul Permohonan</p>
                    <p className="font-semibold text-sm text-[#0E1B16] mt-0.5">
                      {viewModel.judul}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 pb-4 border-b border-[#E3EAE6]">
                  <div className="w-10 h-10 rounded-xl bg-[#EBF7F1] text-[#0F6A49] flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7A73]">Unit Pemohon</p>
                    <p className="font-semibold text-sm text-[#0E1B16] mt-0.5">
                      {viewModel.unitNama}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#EBF7F1] text-[#0F6A49] flex items-center justify-center shrink-0">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7A73]">Estimasi Anggaran</p>
                    <p className="font-semibold text-sm text-[#0E1B16] mt-0.5">
                      {formatRupiah(viewModel.estimasiAnggaran)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#EBF7F1] text-[#0F6A49] flex items-center justify-center shrink-0">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7A73]">Jenis MAK Terikat PPK</p>
                    <div className="font-semibold text-xs text-[#0E1B16] mt-0.5 space-y-0.5">
                      {viewModel.makList.length > 0 ? (
                        viewModel.makList.map((mak) => (
                          <p key={mak.id}>
                            {mak.kode} · {mak.nama}
                          </p>
                        ))
                      ) : (
                        <p className="text-[#8A9A95]">Belum ada MAK terikat</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dokumen Permohonan + Keputusan PPK */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-6">
                <DokumenListCard
                  title="Berkas Permohonan"
                  dokumenList={viewModel.dokumenList}
                  nomorSurat={viewModel.nomorSurat}
                  onViewNewTab={onViewDokumen}
                  onDownload={onDownloadDokumen}
                  isViewingId={isViewingDocId}
                  isDownloadingId={isDownloadingDocId}
                  previewBlobUrl={previewBlobUrl}
                  previewDocId={previewDocId}
                  isLoadingPreview={isLoadingPreview}
                  emptyTitle="Belum ada berkas terlampir"
                  emptyDescription="Surat permohonan akan ditampilkan di sini setelah diunggah oleh unit pemohon."
                />
              </div>

              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white rounded-[20px] p-6 sm:p-8 border border-[#E3EAE6] shadow-[0_8px_12px_rgba(13,26,20,0.06)]">
                  <div className="mb-5">
                    <h3 className="text-lg font-bold text-[#0E1B16]">
                      Keputusan Persetujuan Awal PPK
                    </h3>
                    <p className="text-xs text-[#6B7A73] mt-0.5">
                      Persetujuan awal permohonan wajib disertai unggahan Memo Persetujuan Surat
                      Permohonan
                    </p>
                  </div>

                  <div className="p-4 rounded-[14px] bg-[#F5F8F6] border border-[#E3EAE6] flex items-start gap-2.5 mb-6 text-xs text-[#3F4E47]">
                    <Info className="w-4 h-4 text-[#3F4E47] shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      Keputusan Bidang 2 dan PPK berjalan paralel. Permohonan akan diteruskan
                      otomatis ke PPBJ setelah keduanya menyetujui.
                    </p>
                  </div>

                  {viewModel.decisionBlockedReason && (
                    <div className="p-4 rounded-[14px] bg-[#FEF3DC] border border-[#FDE4A0] flex items-start gap-2.5 mb-5 text-xs text-[#92400E]">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#F59E0B]" />
                      <p className="leading-relaxed">{viewModel.decisionBlockedReason}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={!viewModel.canDecide || isSubmitting}
                      onClick={onOpenRejectModal}
                      className="py-3 px-3 rounded-xl border border-[#FECDCA] bg-[#FEE4E2]/70 hover:bg-[#FEE4E2] text-xs font-bold text-[#D92D20] transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle className="w-4 h-4 shrink-0" />
                      <span>Tolak Permohonan</span>
                    </button>
                    <button
                      type="button"
                      disabled={!viewModel.canDecide || isSubmitting}
                      onClick={onOpenApproveModal}
                      className="py-3 px-3 rounded-xl bg-[#0E7C5A] hover:bg-[#0A5C43] text-xs font-bold text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Setujui Permohonan</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Modal Setujui Permohonan + Unggah Memo Persetujuan Surat Permohonan */}
        {approveModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
            <form
              onSubmit={onApproveSubmit}
              className="bg-white rounded-[24px] border border-[#E3EAE6] shadow-[0_8px_12px_rgba(13,26,20,0.06)] w-full max-w-[520px] p-8 flex flex-col gap-5"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-[14px] bg-[#EBF7F1] text-[#0F6A49] flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-[#0E1B16]">
                    Unggah Memo Persetujuan Surat Permohonan
                  </h3>
                  <p className="text-xs text-[#6B7A73] mt-0.5">
                    Wajib melampirkan berkas Memo Persetujuan (PDF/JPG/PNG, maks. 10 MB)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onCloseApproveModal}
                  className="text-[#6B7A73] hover:text-[#0E1B16] transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  onSelectMemoFile(file);
                }}
                className="hidden"
              />
              <div>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-[14px] bg-[#F5F8F6] border-[1.5px] border-dashed border-[#E3EAE6] hover:border-[#16825C] px-6 py-7 flex flex-col items-center justify-center gap-2.5 text-center cursor-pointer transition"
                >
                  <div className="w-12 h-12 rounded-[14px] bg-[#EBF7F1] text-[#0F6A49] flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-[#0E1B16]">
                    {selectedMemoFile ? selectedMemoFile.name : 'Pilih berkas Memo Persetujuan'}
                  </p>
                  <p className="text-xs text-[#6B7A73]">
                    Format PDF, JPG, atau PNG (maksimal 10 MB)
                  </p>
                </div>
                {memoFileError && (
                  <p className="text-xs font-medium text-[#D92D20] mt-2">{memoFileError}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0E1B16] mb-1.5">
                  Catatan Persetujuan (Opsional)
                </label>
                <textarea
                  rows={3}
                  value={catatanApprove}
                  onChange={(e) => onCatatanApproveChange(e.target.value)}
                  placeholder="Tambahkan catatan persetujuan bila diperlukan..."
                  className="w-full p-3 rounded-xl border border-[#CBD6D0] text-xs text-[#0E1B16] focus:outline-none focus:ring-1 focus:ring-[#0E7C5A]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onCloseApproveModal}
                  className="px-5 py-3 rounded-xl border border-[#CBD6D0] text-sm font-semibold text-[#3F4E47] hover:bg-[#F4F7F5] transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!selectedMemoFile || Boolean(memoFileError) || isSubmitting}
                  className="px-5 py-3 rounded-xl bg-[#0E7C5A] hover:bg-[#0A5C43] text-sm font-semibold text-white transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Setujui Permohonan'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal Tolak Permohonan */}
        {rejectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
            <form
              onSubmit={onRejectSubmit}
              className="bg-white rounded-[24px] border border-[#E3EAE6] shadow-[0_8px_12px_rgba(13,26,20,0.06)] w-full max-w-[500px] p-8 flex flex-col gap-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-[14px] bg-[#FDE6E4] text-[#D92D20] flex items-center justify-center shrink-0">
                  <XCircle className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-[#0E1B16]">Tolak Permohonan</h3>
                  <p className="text-xs text-[#6B7A73] mt-0.5">
                    Berikan alasan penolakan (minimal 5 karakter)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onCloseRejectModal}
                  className="text-[#6B7A73] hover:text-[#0E1B16] transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0E1B16] mb-2">
                  Alasan Penolakan <span className="text-[#D92D20]">*</span>
                </label>
                <textarea
                  rows={4}
                  value={alasanTolak}
                  onChange={(e) => onAlasanTolakChange(e.target.value)}
                  placeholder="Tuliskan alasan penolakan permohonan..."
                  className="w-full p-3 rounded-xl border border-[#CBD6D0] text-xs text-[#0E1B16] focus:outline-none focus:ring-1 focus:ring-[#0E7C5A]"
                />
                {alasanError && <p className="text-xs text-[#D92D20] mt-1">{alasanError}</p>}
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onCloseRejectModal}
                  className="px-5 py-3 rounded-xl border border-[#CBD6D0] text-sm font-semibold text-[#3F4E47] hover:bg-[#F4F7F5] transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={alasanTolak.trim().length < 5 || isSubmitting}
                  className="px-5 py-3 rounded-xl bg-[#D92D20] hover:bg-[#B42318] text-sm font-semibold text-white transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Memproses...' : 'Tolak Permohonan'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default PpkPermohonanReviewTemplate;
