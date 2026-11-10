import type { FC, FormEvent } from 'react';
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import AppLayout from './AppLayout';
import JenisMakTable from '../organisms/JenisMakTable';
import JenisMakFormModal from '../organisms/JenisMakFormModal';
import HapusJenisMakModal from '../organisms/HapusJenisMakModal';
import type { JenisMakRow, PpkOption } from '../../types/perencanaan';
import { PERENCANAAN_NAV_ITEMS } from '../../pages/Perencanaan/Dashboard';

export interface PerencanaanJenisMakTemplateProps {
  rows: JenisMakRow[];
  searchQuery: string;
  currentPage?: number;
  lastPage?: number;
  isLoading?: boolean;
  processing?: boolean;
  flashSuccess?: string;
  flashError?: string;
  onSearchChange: (val: string) => void;
  onSearchSubmit: (e: FormEvent) => void;
  onPageChange?: (page: number) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (row: JenisMakRow) => void;
  onOpenDeleteModal: (row: JenisMakRow) => void;

  // Modal Form
  formModalOpen: boolean;
  isEdit: boolean;
  formKode: string;
  formNama: string;
  formPpkId: number;
  ppkOptions?: PpkOption[];
  fieldErrors?: Record<string, string>;
  formError?: string;
  onCloseFormModal: () => void;
  onFormKodeChange: (val: string) => void;
  onFormNamaChange: (val: string) => void;
  onFormPpkChange: (val: number) => void;
  onFormSubmit: (e: FormEvent) => void;

  // Modal Delete
  deleteModalOpen: boolean;
  deleteTarget?: JenisMakRow | null;
  deleteError?: string;
  onCloseDeleteModal: () => void;
  onConfirmDelete: () => void;
}

export const PerencanaanJenisMakTemplate: FC<PerencanaanJenisMakTemplateProps> = ({
  rows,
  searchQuery,
  currentPage = 1,
  lastPage = 1,
  isLoading = false,
  processing = false,
  flashSuccess = '',
  flashError = '',
  onSearchChange,
  onSearchSubmit,
  onPageChange,
  onOpenAddModal,
  onOpenEditModal,
  onOpenDeleteModal,

  formModalOpen,
  isEdit,
  formKode,
  formNama,
  formPpkId,
  ppkOptions = [],
  fieldErrors = {},
  formError = '',
  onCloseFormModal,
  onFormKodeChange,
  onFormNamaChange,
  onFormPpkChange,
  onFormSubmit,

  deleteModalOpen,
  deleteTarget,
  deleteError = '',
  onCloseDeleteModal,
  onConfirmDelete,
}) => {
  return (
    <AppLayout
      activeRoute="mak"
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
      {/* Hero Top Banner */}
      <div className="relative overflow-hidden rounded-[24px] bg-[#0E7C5A] p-6 sm:px-9 sm:py-8 text-white shadow-[0_10px_24px_rgba(13,51,38,0.14)] mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/75 block mb-1">
              DATA MASTER
            </span>
            <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight leading-tight">
              Jenis MAK
            </h1>
            <p className="text-xs sm:text-sm text-white/85 mt-1.5">
              Kelola Jenis MAK (Mata Anggaran Kegiatan) dan penanggung jawabnya.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-[#F1F7F4] text-[#0E7C5A] text-xs font-bold shadow-sm transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jenis MAK</span>
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

      {/* Main Table Card */}
      <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#F0F4F2]">
          <div>
            <h3 className="text-base font-bold text-[#14201C]">Daftar Jenis MAK</h3>
            <p className="text-xs text-[#8A9A95] mt-0.5">
              Menampilkan {rows.length} data Jenis MAK
            </p>
          </div>

          <form onSubmit={onSearchSubmit} className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-[#8A9A95] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari kode atau nama MAK..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E4EBE8] bg-[#FAFCFB] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E7C5A] text-[#14201C]"
            />
          </form>
        </div>

        <JenisMakTable
          rows={rows}
          isLoading={isLoading}
          onEdit={onOpenEditModal}
          onDelete={onOpenDeleteModal}
        />

        {lastPage > 1 && onPageChange && (
          <div className="flex items-center justify-between pt-5 mt-4 border-t border-[#F0F4F2]">
            <span className="text-xs text-[#8A9A95]">
              Halaman <strong className="text-[#14201C]">{currentPage}</strong> dari{' '}
              <strong className="text-[#14201C]">{lastPage}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1 || isLoading}
                onClick={() => onPageChange(currentPage - 1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#E4EBE8] text-xs font-semibold text-[#14201C] hover:bg-[#F4F7F5] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Sebelumnya</span>
              </button>
              <button
                type="button"
                disabled={currentPage >= lastPage || isLoading}
                onClick={() => onPageChange(currentPage + 1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#E4EBE8] text-xs font-semibold text-[#14201C] hover:bg-[#F4F7F5] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <JenisMakFormModal
        isOpen={formModalOpen}
        isEdit={isEdit}
        kode={formKode}
        nama={formNama}
        ppkUserId={formPpkId}
        ppkOptions={ppkOptions}
        processing={processing}
        fieldErrors={fieldErrors}
        formError={formError}
        onClose={onCloseFormModal}
        onKodeChange={onFormKodeChange}
        onNamaChange={onFormNamaChange}
        onPpkChange={onFormPpkChange}
        onSubmit={onFormSubmit}
      />

      <HapusJenisMakModal
        isOpen={deleteModalOpen}
        targetMak={deleteTarget}
        processing={processing}
        deleteError={deleteError}
        onClose={onCloseDeleteModal}
        onConfirm={onConfirmDelete}
      />
    </AppLayout>
  );
};

export default PerencanaanJenisMakTemplate;
