import type { FC, FormEvent } from 'react';
import { Upload, FileText, History, Loader2, Trash2 } from 'lucide-react';
import AppLayout from './AppLayout';
import DokumenListCard from '../organisms/DokumenListCard';
import RkaklReplaceModal from '../organisms/RkaklReplaceModal';
import { formatTanggalIndo } from '../../utils/formatters';
import { PERENCANAAN_NAV_ITEMS } from '../../pages/Perencanaan/Dashboard';
import type { DokumenItem } from '../../types/dokumen';
import type { RkaklHistoryItem } from '../../types/perencanaan';

export interface PerencanaanRkaklTemplateProps {
  activeFilename: string;
  activeVersion: string | number;
  activeDocId?: number | string | null;
  activeDokumenList: DokumenItem[];
  historyList: RkaklHistoryItem[];
  selectedTahun?: string;
  tahunAnggaran?: number;
  isLoading?: boolean;
  replaceModalOpen: boolean;
  selectedFile: string;
  fileError?: string;
  isFileValid?: boolean;
  processing?: boolean;
  deletingDocId?: number | string | null;
  flashSuccess?: string;
  flashError?: string;
  onTahunChange?: (val: string) => void;
  onTahunAnggaranChange?: (val: number) => void;
  onOpenReplaceModal: () => void;
  onCloseReplaceModal: () => void;
  onFileChange: (file: File) => void;
  onReplaceSubmit: (e: FormEvent) => void;
  onSelectHistoryDoc: (doc: RkaklHistoryItem) => void;
  onDeleteDoc?: (docId: number | string) => void;
  onViewDokumen: (doc: DokumenItem) => void;
  onDownloadDokumen: (doc: DokumenItem) => void;
  isViewingDocId?: number | string | null;
  isDownloadingDocId?: number | string | null;
  previewBlobUrl?: string | null;
  previewDocId?: number | string | null;
  isLoadingPreview?: boolean;
}

export const PerencanaanRkaklTemplate: FC<PerencanaanRkaklTemplateProps> = ({
  activeDokumenList,
  historyList,
  activeDocId,
  selectedTahun = '',
  tahunAnggaran,
  isLoading = false,
  replaceModalOpen,
  selectedFile,
  fileError = '',
  isFileValid = true,
  processing = false,
  deletingDocId = null,
  flashSuccess = '',
  flashError = '',
  onTahunChange,
  onTahunAnggaranChange,
  onOpenReplaceModal,
  onCloseReplaceModal,
  onFileChange,
  onReplaceSubmit,
  onSelectHistoryDoc,
  onDeleteDoc,
  onViewDokumen,
  onDownloadDokumen,
  isViewingDocId,
  isDownloadingDocId,
  previewBlobUrl,
  previewDocId,
  isLoadingPreview = false,
}) => {
  const currentYear = new Date().getFullYear();
  const tahunOptions = ['', String(currentYear), String(currentYear - 1), String(currentYear - 2)];

  return (
    <AppLayout
      activeRoute="rkakl"
      navItems={PERENCANAAN_NAV_ITEMS}
      roleInitials="PR"
      roleTitle="Perencanaan"
      roleSubtitle="Unit Perencanaan"
      profileHref="/perencanaan/profil"
      notifikasiHref="/perencanaan/notifikasi"
      readAllHref="/perencanaan/notifikasi/read-all"
      flash={
        flashError || flashSuccess
          ? { error: flashError || undefined, success: flashSuccess || undefined }
          : undefined
      }
    >
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-[24px] bg-[#0E7C5A] p-6 sm:px-9 sm:py-8 text-white shadow-[0_10px_24px_rgba(13,51,38,0.14)] mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/75 block mb-1">
              MANAJEMEN ANGGARAN
            </span>
            <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight leading-tight">
              Dokumen RKAKL
            </h1>
            <p className="text-xs sm:text-sm text-white/85 mt-1.5">
              Unggah, perbarui, dan kelola dokumen Rencana Kerja dan Anggaran Kementerian/Lembaga.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            {onTahunChange && (
              <select
                value={selectedTahun}
                onChange={(e) => onTahunChange(e.target.value)}
                aria-label="Filter Tahun Anggaran"
                className="px-4 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/25 text-xs font-bold outline-none cursor-pointer"
              >
                {tahunOptions.map((t) => (
                  <option key={t} value={t} className="text-[#14201C]">
                    {t ? `Tahun ${t}` : 'Semua Tahun'}
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={onOpenReplaceModal}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-[#F1F7F4] text-[#0E7C5A] text-xs font-bold shadow-sm transition-colors cursor-pointer shrink-0"
            >
              <Upload className="w-4 h-4" />
              <span>{activeDokumenList.length > 0 ? 'Ganti Dokumen RKAKL' : 'Unggah RKAKL Baru'}</span>
            </button>
          </div>
        </div>
        <div
          className="absolute -right-10 -top-20 w-[280px] h-[280px] rounded-full bg-white/8 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute right-28 -bottom-20 w-[190px] h-[190px] rounded-full bg-white/8 pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {isLoading ? (
        <div className="bg-white rounded-[22px] p-12 border border-[#E4EBE8] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-[#0E7C5A] animate-spin" />
          <p className="text-xs font-medium text-[#5F6F6A]">Memuat data dokumen RKAKL...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <DokumenListCard
              title="Dokumen RKAKL Aktif"
              subtitle="Dokumen acuan verifikasi anggaran tahun berjalan"
              dokumenList={activeDokumenList}
              onView={onViewDokumen}
              onDownload={onDownloadDokumen}
              isViewingId={isViewingDocId}
              isDownloadingId={isDownloadingDocId}
              previewBlobUrl={previewBlobUrl}
              previewDocId={previewDocId}
              isLoadingPreview={isLoadingPreview}
            />

            {activeDocId && onDeleteDoc && (
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={deletingDocId === activeDocId}
                  onClick={() => onDeleteDoc(activeDocId)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#FECDCA] bg-[#FEE4E2]/70 hover:bg-[#FEE4E2] text-xs font-bold text-[#D92D20] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {deletingDocId === activeDocId ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>Hapus Dokumen RKAKL Aktif</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Column (4 cols): Riwayat Versi RKAKL */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
              <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-[#F0F4F2]">
                <div className="w-8 h-8 rounded-lg bg-[#EAF6F1] text-[#0E7C5A] flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#14201C]">Riwayat Pembaruan</h3>
                  <p className="text-xs text-[#8A9A95]">Daftar arsip versi RKAKL sebelumnya</p>
                </div>
              </div>

              {historyList.length === 0 ? (
                <div className="py-8 text-center">
                  <FileText className="w-7 h-7 mx-auto mb-2 text-[#C5D2CD]" />
                  <p className="text-xs text-[#8A9A95]">Belum ada riwayat pembaruan RKAKL.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {historyList.map((doc, idx) => (
                    <div
                      key={doc.id ?? idx}
                      className="w-full p-3.5 rounded-xl border border-[#E4EBE8] hover:border-[#0E7C5A] hover:bg-[#F7FAF8] transition flex items-center justify-between gap-2"
                    >
                      <button
                        type="button"
                        onClick={() => onSelectHistoryDoc(doc)}
                        className="min-w-0 flex-1 text-left cursor-pointer"
                      >
                        <p className="text-xs font-bold text-[#14201C] truncate">
                          {doc.nama_asli || `RKAKL_v${doc.versi || idx + 1}.pdf`}
                        </p>
                        <p className="text-[11px] text-[#8A9A95] mt-0.5">
                          Versi {doc.versi || idx + 1} • {formatTanggalIndo(doc.created_at)}
                        </p>
                      </button>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-2 py-0.5 rounded-md bg-[#EAF6F1] text-[#0E7C5A] text-[10px] font-bold">
                          v{doc.versi || idx + 1}
                        </span>
                        {doc.id && onDeleteDoc && (
                          <button
                            type="button"
                            disabled={deletingDocId === doc.id}
                            onClick={() => onDeleteDoc(doc.id!)}
                            className="p-1.5 rounded-lg border border-[#FECDCA] hover:bg-[#FEE4E2] text-[#D92D20] transition-colors cursor-pointer disabled:opacity-50"
                            title="Hapus versi RKAKL ini"
                            aria-label="Hapus versi RKAKL"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <RkaklReplaceModal
        isOpen={replaceModalOpen}
        selectedFile={selectedFile}
        fileError={fileError}
        isFileValid={isFileValid}
        tahunAnggaran={tahunAnggaran}
        processing={processing}
        onClose={onCloseReplaceModal}
        onFileChange={onFileChange}
        onTahunAnggaranChange={onTahunAnggaranChange}
        onSubmit={onReplaceSubmit}
      />
    </AppLayout>
  );
};

export default PerencanaanRkaklTemplate;
