import { useState, useEffect, useCallback, type FC, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
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
import api from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import DashboardShellTemplate from '../../../components/templates/DashboardShellTemplate';
import HeroBanner from '../../../components/organisms/HeroBanner';
import PermohonanRow from '../../../components/molecules/PermohonanRow';
import FilterPermohonanModal from '../../../components/molecules/FilterPermohonanModal';
import DetailPermohonanModal, { type PermohonanDetailData } from '../../../components/organisms/DetailPermohonanModal';
import type { PermohonanItem } from '../../../types/permohonan';

const COLS = ['NO PERMOHONAN', 'JUDUL PENGADAAN', 'TANGGAL', 'NILAI PENGAJUAN', 'STATUS', 'AKSI'] as const;

function TableSkeletonRows() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((idx) => (
        <tr key={idx} className="border-b border-[#E4EBE8] animate-pulse" aria-hidden="true">
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

function getPaginationRange(currentPage: number, lastPage: number): Array<number | '...'> {
  if (lastPage <= 7) {
    return Array.from({ length: lastPage }, (_, i) => i + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, '...', lastPage];
  }

  if (currentPage >= lastPage - 3) {
    return [1, '...', lastPage - 4, lastPage - 3, lastPage - 2, lastPage - 1, lastPage];
  }

  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', lastPage];
}

export const PermohonanIndex: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedPermohonan, setSelectedPermohonan] = useState<PermohonanDetailData | null>(null);

  const [permohonanList, setPermohonanList] = useState<PermohonanItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [fromItem, setFromItem] = useState(0);
  const [toItem, setToItem] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(1);
    }, 350);

    return () => clearTimeout(handler);
  }, [search]);

  const fetchPermohonan = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      const statusParam = statusFilters.length > 0 ? statusFilters.join(',') : 'semua';
      const res = await api.get<{
        permohonanList?: {
          data?: PermohonanItem[];
          current_page?: number;
          last_page?: number;
          from?: number;
          to?: number;
          total?: number;
        };
        data?: PermohonanItem[];
        current_page?: number;
        last_page?: number;
        from?: number;
        to?: number;
        total?: number;
      }>('/v1/pemohon/permohonan', {
        params: {
          search: debouncedSearch,
          status: statusParam,
          page: currentPage,
        },
      });

      const payload = res.data.permohonanList ?? res.data;
      const items = payload.data ?? [];

      setPermohonanList(items);
      setCurrentPage(payload.current_page ?? 1);
      setLastPage(payload.last_page ?? 1);
      setFromItem(payload.from ?? (items.length > 0 ? 1 : 0));
      setToItem(payload.to ?? items.length);
      setTotalCount(payload.total ?? items.length);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, statusFilters, currentPage]);

  useEffect(() => {
    fetchPermohonan();
  }, [fetchPermohonan]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(search.trim());
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearch('');
    setDebouncedSearch('');
    setCurrentPage(1);
  };

  const handleApplyFilters = (statuses: string[]) => {
    setStatusFilters(statuses);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setStatusFilters([]);
    setCurrentPage(1);
  };

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
      badge: totalCount > 0 ? totalCount : 4,
    },
  ];

  const sidebarProps = {
    navItems,
    activeRoute: 'permohonan',
    brandSubtitle: 'Pengadaan Barang & Jasa',
    sectionTitle: 'MENU',
  };

  const topbarProps = {
    user,
  };

  const paginationPages = getPaginationRange(currentPage, lastPage);
  const isFilterActive = statusFilters.length > 0;

  return (
    <DashboardShellTemplate sidebarProps={sidebarProps} topbarProps={topbarProps}>
      <HeroBanner
        eyebrow="DAFTAR PERMOHONAN"
        title="List Permohonan"
        description="Pantau, cari, dan kelola seluruh permohonan pengadaan Anda."
        ctaLabel="+ Buat Permohonan"
        ctaIcon={Plus}
        onCta={() => navigate('/pemohon/permohonan/create')}
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
              onClick={() => setIsFilterModalOpen(true)}
              className={`inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl border text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] cursor-pointer shrink-0 ${
                isFilterActive
                  ? 'border-[#0E7C5A] bg-[#EEF5F2] text-[#0E7C5A]'
                  : 'border-[#E4EBE8] bg-white text-[#14201C] hover:bg-[#F3F6F5]'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filter</span>
              {isFilterActive && (
                <span className="w-2 h-2 rounded-full bg-[#0E7C5A]" aria-label="Filter aktif" />
              )}
            </button>

            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#8A9A95] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nomor atau judul..."
                className="w-full pl-10 pr-9 py-2.5 min-h-[44px] text-sm rounded-xl border border-[#E4EBE8] bg-white text-[#14201C] placeholder:text-[#8A9A95] focus:outline-none focus:ring-2 focus:ring-[#0E7C5A] focus:border-[#0E7C5A] transition-colors"
              />
              {search && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#8A9A95] hover:text-[#14201C] rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] cursor-pointer"
                  aria-label="Bersihkan pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>

          <p className="text-sm text-[#5F6F6A] font-medium shrink-0">
            {isLoading ? 'Memuat data...' : `${totalCount} permohonan`}
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
                      Terjadi gangguan koneksi ke server. Silakan coba kembali.
                    </p>
                    <button
                      type="button"
                      onClick={() => fetchPermohonan()}
                      className="inline-flex items-center justify-center px-4 py-2 min-h-[44px] rounded-xl bg-[#0E7C5A] text-white text-sm font-semibold hover:bg-[#0A5C43] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] cursor-pointer"
                    >
                      Coba Lagi
                    </button>
                  </td>
                </tr>
              ) : permohonanList.length === 0 ? (
                <tr>
                  <td colSpan={COLS.length} className="py-12 px-4 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center mx-auto mb-3">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-[#14201C]">
                      {isFilterActive || debouncedSearch
                        ? 'Tidak ada permohonan yang sesuai filter'
                        : 'Belum ada permohonan pengadaan'}
                    </p>
                    <p className="text-xs text-[#5F6F6A] mt-1 mb-4">
                      {isFilterActive || debouncedSearch
                        ? 'Coba ubah kata kunci pencarian atau sesuaikan opsi filter status.'
                        : 'Mulai dengan mengajukan permohonan pengadaan barang dan jasa pertama Anda.'}
                    </p>
                    {isFilterActive || debouncedSearch ? (
                      <button
                        type="button"
                        onClick={() => {
                          handleClearSearch();
                          handleResetFilters();
                        }}
                        className="inline-flex items-center justify-center px-4 py-2 min-h-[44px] rounded-xl border border-[#E4EBE8] bg-white text-sm font-semibold text-[#14201C] hover:bg-[#F3F6F5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] cursor-pointer"
                      >
                        Reset Filter
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => navigate('/pemohon/permohonan/create')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-xl bg-[#0E7C5A] text-white text-sm font-semibold hover:bg-[#0A5C43] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Buat Permohonan</span>
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                permohonanList.map((row) => (
                  <PermohonanRow
                    key={row.id}
                    permohonan={row}
                    nomorSurat={row.nomor_surat}
                    judul={row.judul}
                    tanggal={row.created_at}
                    nilaiPengajuan={row.estimasi_anggaran}
                    status={row.status}
                    onDetail={(item) => {
                      if (item?.id) {
                        navigate(`/pemohon/permohonan/${item.id}`);
                      } else {
                        setSelectedPermohonan(item as PermohonanDetailData);
                      }
                    }}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalCount > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#E4EBE8]">
            <p className="text-xs md:text-sm text-[#5F6F6A]">
              Menampilkan {fromItem} - {toItem} dari {totalCount} permohonan
            </p>

            <nav aria-label="Navigasi paginasi" className="flex items-center gap-1.5 self-center sm:self-auto">
              <button
                type="button"
                disabled={currentPage <= 1 || isLoading}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E4EBE8] bg-white text-[#5F6F6A] hover:bg-[#F3F6F5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] cursor-pointer"
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {paginationPages.map((page, index) => {
                if (page === '...') {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="w-9 h-9 flex items-center justify-center text-xs text-[#8A9A95] select-none"
                    >
                      ...
                    </span>
                  );
                }

                const pageNum = page as number;
                const isActive = pageNum === currentPage;

                return (
                  <button
                    key={pageNum}
                    type="button"
                    disabled={isLoading}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`min-w-[36px] h-9 px-2 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] cursor-pointer ${
                      isActive
                        ? 'bg-[#0E7C5A] text-white shadow-xs'
                        : 'bg-white border border-[#E4EBE8] text-[#14201C] hover:bg-[#F3F6F5]'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={`Halaman ${pageNum}`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={currentPage >= lastPage || isLoading}
                onClick={() => setCurrentPage((prev) => Math.min(lastPage, prev + 1))}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E4EBE8] bg-white text-[#5F6F6A] hover:bg-[#F3F6F5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] cursor-pointer"
                aria-label="Halaman berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </nav>
          </div>
        )}
      </div>

      <FilterPermohonanModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        selectedStatuses={statusFilters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      <DetailPermohonanModal
        isOpen={Boolean(selectedPermohonan)}
        onClose={() => setSelectedPermohonan(null)}
        permohonan={selectedPermohonan}
      />
    </DashboardShellTemplate>
  );
};

export default PermohonanIndex;
