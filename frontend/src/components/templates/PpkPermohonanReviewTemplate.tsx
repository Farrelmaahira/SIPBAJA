import { useRef, type FC, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Calendar,
  Tag,
  Building2,
  Banknote,
  Eye,
  XCircle,
  CheckCircle2,
  Info,
  Hash,
  Upload,
  X,
} from 'lucide-react';
import PpLayout, { type PpNavItem } from './PpLayout';
import DocumentPreviewModal from '../organisms/DocumentPreviewModal';
import { formatRupiah, formatTanggal } from '../../utils/formatters';
import type { NotificationItem } from '../../types/notification';
import type { PpkPermohonanDetailPayload } from '../../types/ppk';

export interface PreviewDocInfo {
  label?: string;
  category?: string;
  filename?: string;
  size?: string;
}

export interface PpkPermohonanReviewTemplateProps {
  navItems: PpNavItem[];
  detail: PpkPermohonanDetailPayload | null;
  isLoading: boolean;
  previewDoc: PreviewDocInfo | null;
  onOpenPreviewDoc: (doc: PreviewDocInfo) => void;
  onClosePreviewDoc: () => void;
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
  detail,
  isLoading,
  previewDoc,
  onOpenPreviewDoc,
  onClosePreviewDoc,
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

  const permohonan = detail?.permohonan;
  const dokumenPermohonan = detail?.dokumen_permohonan ?? [];
  const makPpkList = detail?.permohonan_mak_ppk ?? permohonan?.permohonan_mak ?? permohonan?.PermohonanMak ?? [];
  const rkaklActive = detail?.rkakl_active ?? null;

  const nomorSurat = permohonan?.nomor_surat || '009/PNJ/2026';
  const judulPermohonan = permohonan?.judul || 'Pengadaan Sarana Prasarana';
  const unitNama = permohonan?.unit?.nama || permohonan?.Unit?.nama || 'Jurusan Teknik Sipil';
  const nominalNilai = permohonan?.estimasi_anggaran ?? permohonan?.nominal ?? 45000000;
  const statusPermohonan = permohonan?.status || 'diteruskan';

  const canGiveDecision =
    statusPermohonan !== 'disetujui' &&
    statusPermohonan !== 'ditolak' &&
    statusPermohonan !== 'selesai';

  return (
    <PpLayout
      activeRoute="pengajuan"
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
        { label: 'LIST PENGAJUAN', href: '/ppk/pengajuan' },
        { label: 'REVIEW PERMOHONAN AWAL PPK' },
      ]}
    >
      {/* Hero Top Banner */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#0A5C42] to-[#17A373] p-6 sm:px-9 sm:py-8 text-white shadow-[0_10px_24px_rgba(13,51,38,0.14)] mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/75 block mb-2">
              PERSETUJUAN AWAL PERMOHONAN
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight leading-9">
                Review Dokumen Turunan Permohonan
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF3DC] text-[#9A5B00]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                Menunggu Persetujuan PPK
              </span>
            </div>
            <p className="text-sm text-white/85 mt-2">
              Nomor {nomorSurat} · Diajukan {formatTanggal(permohonan?.created_at || '2026-04-02')}
            </p>
          </div>

          <Link
            to="/ppk/pengajuan"
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
      ) : (
        <>
          {/* Informasi Permohonan */}
          <div className="bg-white rounded-[20px] p-6 sm:p-8 border border-[#E3EAE6] shadow-[0_8px_12px_rgba(13,26,20,0.06)] mb-6">
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
                  <p className="font-semibold text-sm text-[#0F6A49] mt-0.5">{nomorSurat}</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 pb-4 border-b border-[#E3EAE6]">
                <div className="w-10 h-10 rounded-xl bg-[#EBF7F1] text-[#0F6A49] flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-[#6B7A73]">Tanggal Pengajuan</p>
                  <p className="font-semibold text-sm text-[#0E1B16] mt-0.5">
                    {formatTanggal(permohonan?.created_at || '2026-04-02')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 pb-4 border-b border-[#E3EAE6]">
                <div className="w-10 h-10 rounded-xl bg-[#EBF7F1] text-[#0F6A49] flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-[#6B7A73]">Judul Permohonan</p>
                  <p className="font-semibold text-sm text-[#0E1B16] mt-0.5">{judulPermohonan}</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 pb-4 border-b border-[#E3EAE6]">
                <div className="w-10 h-10 rounded-xl bg-[#EBF7F1] text-[#0F6A49] flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-[#6B7A73]">Unit Pemohon</p>
                  <p className="font-semibold text-sm text-[#0E1B16] mt-0.5">{unitNama}</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#EBF7F1] text-[#0F6A49] flex items-center justify-center shrink-0">
                  <Banknote className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-[#6B7A73]">Estimasi Anggaran</p>
                  <p className="font-semibold text-sm text-[#0E1B16] mt-0.5">
                    {formatRupiah(nominalNilai)}
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
                    {makPpkList.length > 0 ? (
                      makPpkList.map((pm) => {
                        const makObj = pm.mak || pm.Mak;
                        return (
                          <p key={pm.id}>
                            {makObj?.kode || makObj?.id || pm.mak_id} · {makObj?.nama || 'Jenis MAK'}
                          </p>
                        );
                      })
                    ) : (
                      <p>532111 · Belanja Modal Peralatan dan Mesin</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dokumen Permohonan + RKAKL + Keputusan PPK */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-[20px] p-6 sm:p-8 border border-[#E3EAE6] shadow-[0_8px_12px_rgba(13,26,20,0.06)]">
                <div className="mb-5">
                  <h3 className="text-lg font-bold text-[#0E1B16]">
                    Berkas Permohonan & Acuan RKAKL
                  </h3>
                  <p className="text-xs text-[#6B7A73] mt-0.5">
                    Pratinjau surat permohonan dari unit pemohon beserta dokumen RKAKL aktif
                  </p>
                </div>

                <div className="space-y-4">
                  {(dokumenPermohonan.length > 0
                    ? dokumenPermohonan
                    : [
                        {
                          id: 1,
                          nama_asli: `Surat_Permohonan_${nomorSurat.replace(/\//g, '_')}.pdf`,
                          tipe_dokumen: 'surat_permohonan',
                          ukuran_bytes: 2450000,
                        },
                      ]
                  ).map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 rounded-[14px] bg-[#F5F8F6] border border-[#E3EAE6] flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-[#FDE6E4] text-[#D92D20] flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#0F6A49]">
                            {doc.tipe_dokumen === 'memo_persetujuan'
                              ? 'Memo Persetujuan PPK'
                              : 'Surat Permohonan'}
                          </p>
                          <p className="text-sm font-semibold text-[#0E1B16] truncate">
                            {doc.nama_asli}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          onOpenPreviewDoc({
                            label: 'Surat Permohonan',
                            filename: doc.nama_asli,
                            size: 'PDF',
                          })
                        }
                        className="px-4 py-2.5 rounded-xl border border-[#CBD6D0] bg-white hover:bg-[#F4F7F5] text-xs font-semibold text-[#3F4E47] inline-flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Lihat</span>
                      </button>
                    </div>
                  ))}

                  {rkaklActive && (
                    <div className="p-4 rounded-[14px] bg-[#EBF7F1] border border-[#DDF3E6] flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-white text-[#0F6A49] flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#0F6A49]">
                            Dokumen RKAKL Aktif (Read-Only)
                          </p>
                          <p className="text-sm font-semibold text-[#0E1B16] truncate">
                            {rkaklActive.nama_asli}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          onOpenPreviewDoc({
                            label: 'Dokumen RKAKL',
                            filename: rkaklActive.nama_asli,
                            size: `Versi ${rkaklActive.versi ?? 1} • PDF`,
                          })
                        }
                        className="px-4 py-2.5 rounded-xl border border-[#16825C] bg-white hover:bg-[#F4F9F6] text-xs font-semibold text-[#0F6A49] inline-flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Pratinjau RKAKL</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-[20px] p-6 sm:p-8 border border-[#E3EAE6] shadow-[0_8px_12px_rgba(13,26,20,0.06)]">
                <div className="mb-5">
                  <h3 className="text-lg font-bold text-[#0E1B16]">
                    Keputusan Persetujuan Awal PPK
                  </h3>
                  <p className="text-xs text-[#6B7A73] mt-0.5">
                    Persetujuan awal permohonan wajib disertai unggahan Memo Persetujuan Surat Permohonan
                  </p>
                </div>

                <div className="p-4 rounded-[14px] bg-[#F5F8F6] border border-[#E3EAE6] flex items-start gap-2.5 mb-6 text-xs text-[#3F4E47]">
                  <Info className="w-4 h-4 text-[#3F4E47] shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Keputusan Bidang 2 dan PPK berjalan paralel. Permohonan akan diteruskan otomatis
                    ke PPBJ setelah keduanya menyetujui.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={!canGiveDecision || isSubmitting}
                    onClick={onOpenRejectModal}
                    className="py-3 px-3 rounded-xl border border-[#FECDCA] bg-[#FEE4E2]/70 hover:bg-[#FEE4E2] text-xs font-bold text-[#D92D20] transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>Tolak Permohonan</span>
                  </button>
                  <button
                    type="button"
                    disabled={!canGiveDecision || isSubmitting}
                    onClick={onOpenApproveModal}
                    className="py-3 px-3 rounded-xl bg-[#0E7C5A] hover:bg-[#0A5C43] text-xs font-bold text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
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

      <DocumentPreviewModal
        isOpen={Boolean(previewDoc)}
        onClose={onClosePreviewDoc}
        category={previewDoc?.label || previewDoc?.category}
        filename={previewDoc?.filename}
        size={previewDoc?.size}
      />
    </PpLayout>
  );
};

export default PpkPermohonanReviewTemplate;
