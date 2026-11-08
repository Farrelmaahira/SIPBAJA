import type { FC, FormEvent } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Plus,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Inbox,
  X,
} from 'lucide-react';
import DashboardShellTemplate from './DashboardShellTemplate';
import HeroBanner from '../organisms/HeroBanner';
import PermohonanRow, {
  type PermohonanRowData,
} from '../molecules/PermohonanRow';
import FilterPermohonanModal from '../molecules/FilterPermohonanModal';
import DetailPermohonanModal, {
  type PermohonanDetailData,
} from '../organisms/DetailPermohonanModal';
import type { PermohonanItem } from '../../types/permohonan';
import type { ProfilePillUser } from '../molecules/ProfilePill';

const COLS = [
  'NO PERMOHONAN',
  'JUDUL PENGADAAN',
  'TANGGAL',
  'NILAI PENGAJUAN',
  'STATUS',
  'AKSI',
] as const;

function TableSkeletonRows() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((idx) => (
        <tr
          key={idx}
          className="border-b border-[#E4EBE8] animate-pulse"
          aria-hidden="true"
        >
          <td className="py-4 px-4">
            <div className="h-4 w-28 bg-[#EEF5F2] rounded" />
          </td>
          <td className="py-4 px-4">
            <div className="h-4 w-52 bg-[#EEF5F2] rounded" />
          </td>
          <td className="py-4 px-4">
            <div className="h-4 w-24 bg-[#EEF5F2] rounded" />
          </td>
          <td className="py-4 px-4">
            <div className="h-4 w-28 bg-[#EEF5F2] rounded" />
          </td>
          <td className="py-4 px-4">
            <div className="h-6 w-32 bg-[#EEF5F2] rounded-full" />
          </td>
          <td className="py-4 px-4 text-right">
            <div className="h-8 w-8 bg-[#EEF5F2] rounded-lg ml-auto" />
          </td>
        </tr>
      ))}
    </>
  );
}

function getPaginationRange(
  currentPage: number,
  lastPage: number
): Array<number | '...'> {
  if (lastPage <= 7) {
    return Array.from({ length: lastPage }, (_, i) => i + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, '...', lastPage];
  }

  if (currentPage >= lastPage - 3) {
    return [
      1,
      '...',
      lastPage - 4,
      lastPage - 3,
      lastPage - 2,
      lastPage - 1,
      lastPage,
    ];
  }

  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', lastPage];
}

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
  onViewDetailModal: (item: PermohonanRowData) => void;
  selectedDetailModalItem: PermohonanDetailData | null;
  onCloseDetailModal: () => void;
}

export const PemohonPermohonanIndexTemplate: FC<
  PemohonPermohonanIndexTemplateProps
> = ({
  user = {},
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
  onViewDetailModal,
  selectedDetailModalItem,
  onCloseDetailModal,
}) => {
  const isFilterActive = selectedStatuses.length > 0;
  const paginationPages = getPaginationRange(
    pagination.currentPage,
    pagination.lastPage
  );

  const navItems = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/pemohon/dashboard',
    },
    {
      key: 'permohonan',
      label: 'List Permohonan',
      icon: ClipboardList,
      href: '/pemohon/permohonan',
      badge: pagination.total > 0 ? pagination.total : 4,
    },
  ];

  return (
    <DashboardShellTemplate
      sidebarProps={{
        navItems,
        activeRoute: 'permohonan',
        brandSubtitle: 'Pengadaan Barang & Jasa',
        sectionTitle: 'MENU',
      }}
      topbarProps={{
        user,
      }}
    >
      <HeroBanner
        eyebrow="DAFTAR PERMOHONAN"
        title="List Permohonan"
        description="Pantau, cari, dan kelola seluruh permohonan pengadaan Anda."
        ctaLabel="+ Buat Permohonan"
        ctaIcon={Plus}
        onCta={onCreatePermohonan}
      />

      <div className="bg-white rounded-[24px] border border-[#E4EBE8] shadow-[0_4px_16px_rgba(20,32,28,0.04)] p-6 md:p-8 space-y-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#14201C] tracking-tight">
            Daftar Permohonan
          </h2>
          <p className="text-sm text-[#5F6F6A] mt-1">
            Seluruh permohonan pengadaan yang Anda ajukan
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onToggleFilterModal(true)}
              className={`inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl border text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] cursor-pointer shrink-0 ${
                isFilterActive
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
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#E4EBE8]">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr className="bg-[#F1F7F4] border-b border-[#E4EBE8]">
                {COLS.map((col, idx) => (
                  <th
                    key={col}
                    scope="col"
                    className={`py-3.5 px-4 text-[11px] font-bold text-[#8A9A95] uppercase tracking-wider whitespace-nowrap ${
                      idx === COLS.length - 1 ? 'text-right' : 'text-left'
                    }`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableSkeletonRows />
              ) : hasError ? (
                <tr>
                  <td colSpan={COLS.length} className="py-12 px-4 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-[#FDECEC] text-[#B42318] flex items-center justify-center mx-auto mb-3">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-[#14201C]">
                      Gagal memuat data permohonan
                    </p>
                    <p className="text-xs text-[#5F6F6A] mt-1 mb-4">
                      {errorMessage ||
                        'Terjadi gangguan koneksi ke server. Silakan coba kembali.'}
                    </p>
                    <button
                      type="button"
                      onClick={onRetry}
                      className="inline-flex items-center justify-center min-h-[40px] px-4 py-2 rounded-xl bg-[#0E7C5A] text-white text-xs font-semibold hover:bg-[#0A6348] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] cursor-pointer"
                    >
                      Coba Lagi
                    </button>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={COLS.length} className="py-12 px-4 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center mx-auto mb-3">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-[#14201C]">
                      Tidak ada permohonan ditemukan
                    </p>
                    <p className="text-xs text-[#5F6F6A] mt-1">
                      {isFilterActive || searchQuery
                        ? 'Coba sesuaikan kata kunci pencarian atau filter yang dipilih.'
                        : 'Belum ada permohonan yang diajukan oleh unit Anda.'}
                    </p>
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <PermohonanRow
                    key={item.id ?? index}
                    permohonan={item}
                    onDetail={onViewDetailModal}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && !hasError && pagination.total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E4EBE8]">
            <p className="text-xs text-[#5F6F6A]">
              Menampilkan{' '}
              <span className="font-semibold text-[#14201C]">
                {pagination.from}
              </span>{' '}
              sampai{' '}
              <span className="font-semibold text-[#14201C]">
                {pagination.to}
              </span>{' '}
              dari{' '}
              <span className="font-semibold text-[#14201C]">
                {pagination.total}
              </span>{' '}
              permohonan
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
                className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-[#E4EBE8] text-[#14201C] hover:bg-[#F3F6F5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] cursor-pointer"
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                {paginationPages.map((page, idx) =>
                  typeof page === 'number' ? (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onPageChange(page)}
                      className={`min-w-[36px] h-9 px-3 rounded-xl text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] cursor-pointer ${
                        pagination.currentPage === page
                          ? 'bg-[#0E7C5A] text-white shadow-sm'
                          : 'border border-[#E4EBE8] text-[#14201C] hover:bg-[#F3F6F5]'
                      }`}
                      aria-current={
                        pagination.currentPage === page ? 'page' : undefined
                      }
                    >
                      {page}
                    </button>
                  ) : (
                    <span
                      key={idx}
                      className="px-2 text-xs font-semibold text-[#8A9A95]"
                    >
                      ...
                    </span>
                  )
                )}
              </div>

              <button
                type="button"
                onClick={() => onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.lastPage}
                className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-[#E4EBE8] text-[#14201C] hover:bg-[#F3F6F5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] cursor-pointer"
                aria-label="Halaman berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <FilterPermohonanModal
        isOpen={filterModalOpen}
        onClose={() => onToggleFilterModal(false)}
        selectedStatuses={selectedStatuses}
        onApply={onApplyFilters}
        onReset={onResetFilters}
      />

      <DetailPermohonanModal
        isOpen={selectedDetailModalItem !== null}
        onClose={onCloseDetailModal}
        permohonan={selectedDetailModalItem}
      />
    </DashboardShellTemplate>
  );
};

export default PemohonPermohonanIndexTemplate;

