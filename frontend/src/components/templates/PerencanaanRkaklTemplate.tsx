import type { FC, FormEvent } from 'react';
import { Pencil } from 'lucide-react';
import AppLayout from './AppLayout';
import { PERENCANAAN_NAV_ITEMS } from '../../pages/Perencanaan/Dashboard';
import DokumenListCard from '../organisms/DokumenListCard';
import RkaklHistoryCard from '../organisms/RkaklHistoryCard';
import RkaklReplaceModal from '../organisms/RkaklReplaceModal';
import type { DokumenItem } from '../../types/dokumen';
import type { RkaklHistoryItem } from '../../types/perencanaan';

export interface PerencanaanRkaklTemplateProps {
  activeFilename: string;
  activeVersion: number | string;
  activeDokumenList: DokumenItem[];
  historyList: RkaklHistoryItem[];
  isLoading?: boolean;
  replaceModalOpen: boolean;
  selectedFile: string;
  processing?: boolean;
  onOpenReplaceModal: () => void;
  onCloseReplaceModal: () => void;
  onFileChange: (fileName: string) => void;
  onReplaceSubmit: (e: FormEvent) => void;
  onSelectHistoryDoc?: (doc: RkaklHistoryItem) => void;

  // Document action & preview props
  onViewDokumen?: (doc: DokumenItem) => void;
  onDownloadDokumen?: (doc: DokumenItem) => void;
  isViewingDocId?: number | string | null;
  isDownloadingDocId?: number | string | null;
  previewBlobUrl?: string | null;
  previewDocId?: number | string | null;
  isLoadingPreview?: boolean;
}

export const PerencanaanRkaklTemplate: FC<PerencanaanRkaklTemplateProps> = ({
  activeFilename: _activeFilename,
  activeVersion: _activeVersion,
  activeDokumenList,
  historyList,
  isLoading = false,
  replaceModalOpen,
  selectedFile,
  processing = false,
  onOpenReplaceModal,
  onCloseReplaceModal,
  onFileChange,
  onReplaceSubmit,
  onSelectHistoryDoc,
  onViewDokumen,
  onDownloadDokumen,
  isViewingDocId,
  isDownloadingDocId,
  previewBlobUrl,
  previewDocId,
  isLoadingPreview = false,
}) => {
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
    >
      {/* Hero Top Banner */}
      <div className="relative overflow-hidden rounded-[24px] bg-[#0E7C5A] p-6 sm:px-9 sm:py-8 text-white shadow-[0_10px_24px_rgba(13,51,38,0.14)] mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/75 block mb-1">
              DATA MASTER
            </span>
            <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight leading-tight">
              Dokumen RKAKL
            </h1>
            <p className="text-xs sm:text-sm text-white/85 mt-1.5">
              Kelola dokumen RKAKL yang dipakai sebagai acuan verifikasi anggaran.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenReplaceModal}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-[#F1F7F4] text-[#0E7C5A] text-xs font-bold shadow-sm transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Ganti Dokumen</span>
          </button>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2 cols): Dokumen RKAKL Aktif via DokumenListCard */}
        <div className="lg:col-span-2">
          <DokumenListCard
            title="Dokumen RKAKL Aktif"
            dokumenList={activeDokumenList}
            judul="RKA-K/L Tahun Anggaran 2026"
            unitNama="POLITEKNIK NEGERI JAKARTA"
            onViewNewTab={onViewDokumen}
            onDownload={onDownloadDokumen}
            isViewingId={isViewingDocId}
            isDownloadingId={isDownloadingDocId}
            previewBlobUrl={previewBlobUrl}
            previewDocId={previewDocId}
            isLoadingPreview={isLoadingPreview}
          />
        </div>

        {/* Right Column (1 col): Riwayat Versi Dokumen */}
        <div className="space-y-6">
          <RkaklHistoryCard
            history={historyList}
            isLoading={isLoading}
            onSelectHistoryDoc={onSelectHistoryDoc}
          />
        </div>
      </div>

      {/* Modal Replace Dokumen */}
      <RkaklReplaceModal
        isOpen={replaceModalOpen}
        selectedFile={selectedFile}
        processing={processing}
        onClose={onCloseReplaceModal}
        onFileChange={onFileChange}
        onSubmit={onReplaceSubmit}
      />
    </AppLayout>
  );
};

export default PerencanaanRkaklTemplate;
