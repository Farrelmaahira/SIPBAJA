import type { FC, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { SlidersHorizontal, Search, X, Plus } from 'lucide-react';
import AppLayout from './AppLayout';
import HeroBanner from '../organisms/HeroBanner';
import FilterPermohonanModal from '../molecules/FilterPermohonanModal';
import CrudTable, { type CrudColumn } from '../organisms/CrudTable';
import Modal from '../organisms/Modal';
import Pagination from '../molecules/Pagination';
import StatusPill from '../atoms/StatusPill';
import { PEMOHON_NAV_ITEMS } from '../../constants/pemohonNav';
import { formatRupiah, formatTanggal } from '../../utils/formatPermohonan';
import type { PermohonanItem } from '../../types/permohonan';
import type { ProfilePillUser } from '../molecules/ProfilePill';

export interface PemohonPermohonanIndexTemplateProps {
  user?: ProfilePillUser | null;
  items: PermohonanItem[];
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: (e: FormEvent) => void;
  onClearSearch: () => void;
  filterModalOpen: boolean;
  onToggleFilterModal: (open: boolean) => void;
  selectedStatuses: string[];
  onApplyFilters: (statuses: string[]) => void;
  onResetFilters: () => void;
  pagination: {
    currentPage: number;
    lastPage: number;
    total: number;
    from: number;
    to: number;
  };
  onPageChange: (page: number) => void;
  onRetry: () => void;
  onCreatePermohonan: () => void;
  onView: (item: PermohonanItem) => void;
  onEdit: (item: PermohonanItem) => void;
  onDelete: (item: PermohonanItem) => void;
  deleteTarget: PermohonanItem | null;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
  isDeleting?: boolean;
}

export const PemohonPermohonanIndexTemplate: FC<
  PemohonPermohonanIndexTemplateProps
> = ({
  items,
  isLoading,
  hasError,
  errorMessage,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  filterModalOpen,
  onToggleFilterModal,
  selectedStatuses,
  onApplyFilters,
  onResetFilters,
  pagination,
  onPageChange,
  onRetry,
  onCreatePermohonan,
  onView,
  onEdit,
  onDelete,
  deleteTarget,
  onCancelDelete,
  onConfirmDelete,
  isDeleting = false,
}) => {
    const isFilterActive = selectedStatuses.length > 0;

    const columns: CrudColumn<PermohonanItem>[] = [
      {
        key: 'nomor_surat',
        header: 'No Permohonan',
        className: 'font-bold text-[#0E7C5A] whitespace-nowrap',
        render: (item) => (
          <Link
            to={`/pemohon/permohonan/${item.id}`}
            className="hover:underline"
          >
            {item.nomor_surat || '-'}
          </Link>
        ),
      },
      {
        key: 'judul',
        header: 'Judul Pengadaan',
        className: 'font-bold text-[#14201C]',
        render: (item) => item.judul || 'Tanpa Judul',
      },
      {
        key: 'created_at',
        header: 'Tanggal',
        className: 'text-[#5F6F6A] whitespace-nowrap',
        render: (item) => formatTanggal(item.created_at),
      },
      {
        key: 'estimasi_anggaran',
        header: 'Nilai Pengajuan',
        className: 'font-bold text-[#14201C] whitespace-nowrap',
        render: (item) => formatRupiah(item.estimasi_anggaran),
      },
      {
        key: 'status',
        header: 'Status',
        className: 'whitespace-nowrap',
        render: (item) => <StatusPill status={item.status} />,
      },
    ];

    const toolbar = (
      <>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => onToggleFilterModal(true)}
            className={`inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl border text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] cursor-pointer shrink-0 ${isFilterActive
              ? 'border-[#0E7C5A] bg-[#EEF5F2] text-[#0E7C5A]'
              : 'border-[#E4EBE8] bg-white text-[#14201C] hover:bg-[#F3F6F5]'
              }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filter</span>
            {isFilterActive && (
              <span
                className="w-2 h-2 rounded-full bg-[#0E7C5A]"
                aria-label="Filter aktif"
              />
            )}
          </button>

          <form onSubmit={onSearchSubmit} className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#8A9A95] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari nomor atau judul..."
              className="w-full pl-10 pr-9 py-2.5 min-h-[44px] text-sm rounded-xl border border-[#E4EBE8] bg-white text-[#14201C] placeholder:text-[#8A9A95] focus:outline-none focus:ring-2 focus:ring-[#0E7C5A] focus:border-[#0E7C5A] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={onClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#8A9A95] hover:text-[#14201C] rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] cursor-pointer"
                aria-label="Bersihkan pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>

        <p className="text-sm text-[#5F6F6A] font-medium shrink-0">
          {isLoading ? 'Memuat data...' : `${pagination.total} permohonan`}
        </p>
      </>
    );

    return (
      <AppLayout
        activeRoute="permohonan"
        navItems={PEMOHON_NAV_ITEMS}
        roleInitials="PM"
        roleTitle="Pemohon"
        roleSubtitle="Unit Pemohon"
        profileHref="/pemohon/dashboard"
        notifikasiHref="/pemohon/dashboard"
      >
        <div className="space-y-6">
          <HeroBanner
            eyebrow="DAFTAR PERMOHONAN"
            title="List Permohonan"
            description="Pantau, cari, dan kelola seluruh permohonan pengadaan Anda."
            ctaLabel="Buat Permohonan"
            ctaIcon={Plus}
            onCta={onCreatePermohonan}
          />

          {hasError ? (
            <div className="bg-white rounded-[22px] p-8 border border-[#E4EBE8] text-center">
              <p className="text-sm font-semibold text-[#14201C]">Gagal memuat data permohonan</p>
              <p className="text-xs text-[#5F6F6A] mt-1 mb-4">
                {errorMessage || 'Terjadi gangguan koneksi ke server. Silakan coba kembali.'}
              </p>
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center justify-center min-h-[40px] px-4 py-2 rounded-xl bg-[#0E7C5A] text-white text-xs font-semibold hover:bg-[#0A6348] transition-colors cursor-pointer"
              >
                Coba Lagi
              </button>
            </div>
          ) : (
            <CrudTable<PermohonanItem>
              title="Daftar Permohonan"
              subtitle="Seluruh permohonan pengadaan yang Anda ajukan"
              toolbar={toolbar}
              columns={columns}
              rows={items}
              isLoading={isLoading}
              loadingText="Memuat data permohonan..."
              emptyTitle="Tidak ada permohonan ditemukan"
              emptyDescription={
                isFilterActive || searchQuery
                  ? 'Coba sesuaikan kata kunci pencarian atau filter yang dipilih.'
                  : 'Belum ada permohonan yang diajukan oleh unit Anda.'
              }
              actionsAlign="right"
              onView={(item) => onView(item)}
              onEdit={(item) => onEdit(item)}
              onDelete={(item) => onDelete(item)}
              footer={
                <Pagination
                  currentPage={pagination.currentPage}
                  lastPage={pagination.lastPage}
                  total={pagination.total}
                  from={pagination.from}
                  to={pagination.to}
                  onPageChange={onPageChange}
                />
              }
            />
          )}
        </div>

        <FilterPermohonanModal
          isOpen={filterModalOpen}
          onClose={() => onToggleFilterModal(false)}
          selectedStatuses={selectedStatuses}
          onApply={onApplyFilters}
          onReset={onResetFilters}
        />

        <Modal
          open={deleteTarget !== null}
          onClose={onCancelDelete}
          title="Hapus Permohonan"
          footer={
            <>
              <button
                type="button"
                onClick={onCancelDelete}
                className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-xl border border-[#E4EBE8] text-sm font-semibold text-[#5F6F6A] hover:bg-[#EEF5F2] transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={onConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-xl bg-[#E5484D] hover:bg-[#B42318] text-white text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </>
          }
        >
          <p className="text-sm text-[#5F6F6A]">
            Apakah Anda yakin ingin menghapus permohonan{' '}
            <span className="font-semibold text-[#14201C]">{deleteTarget?.nomor_surat || deleteTarget?.judul}</span>?
            Data dan berkas pendukung yang telah dihapus tidak dapat dipulihkan.
          </p>
        </Modal>
      </AppLayout>
    );
  };

export default PemohonPermohonanIndexTemplate;
