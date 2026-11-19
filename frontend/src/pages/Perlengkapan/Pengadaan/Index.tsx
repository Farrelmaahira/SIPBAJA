import { useState, useEffect, useMemo, type FC, type FormEvent } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  PackageOpen,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import perlengkapanService from '../../../services/perlengkapanService';
import DashboardShellTemplate from '../../../components/templates/DashboardShellTemplate';
import HeroBanner from '../../../components/organisms/HeroBanner';
import FilterPengajuanModal, {
  type FilterStatusOption,
} from '../../../components/organisms/FilterPengajuanModal';
import RowActionMenu from '../../../components/organisms/RowActionMenu';
import StatusPill from '../../../components/atoms/StatusPill';
import type { PerlengkapanPengadaanItem } from '../../../types/perlengkapan';

const PERLENGKAPAN_STATUS_OPTIONS: FilterStatusOption[] = [
  {
    key: 'menunggu_input',
    label: 'Menunggu Input',
    pillClass: 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]',
    dotClass: 'bg-[#D97706]',
  },
  {
    key: 'selesai',
    label: 'Selesai',
    pillClass: 'bg-[#E4F6EC] text-[#0B7A4E] border border-[#BDE8D1]',
    dotClass: 'bg-[#0E7C5A]',
  },
];

export const PerlengkapanPengadaanIndex: FC = () => {
  const { user } = useAuth();

  const [items, setItems] = useState<PerlengkapanPengadaanItem[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);

  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPengadaan = async (
    page: number,
    search: string,
    statuses: string[],
    signal?: AbortSignal
  ) => {
    setIsLoading(true);
    try {
      const response = await perlengkapanService.getPengadaanList(
        {
          page,
          per_page: 10,
          search,
          status: statuses,
        },
        signal
      );

      setItems(response.data || []);
      setTotal(response.total || 0);
      setCurrentPage(response.current_page || 1);
      setLastPage(response.last_page || 1);
      setFrom(response.from || 0);
      setTo(response.to || 0);
    } catch (err: unknown) {
      if (signal?.aborted) return;
      console.error('Failed to fetch Perlengkapan pengadaan list:', err);
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    void fetchPengadaan(currentPage, activeSearch, selectedStatuses, controller.signal);
    return () => controller.abort();
  }, [currentPage, activeSearch, selectedStatuses]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setActiveSearch(searchInput.trim());
  };

  const handleApplyFilter = (statuses: string[]) => {
    setCurrentPage(1);
    setSelectedStatuses(statuses);
  };

  const formatRupiah = (val?: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const pageNumbers = useMemo(() => {
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
  }, [currentPage, lastPage]);

  const sidebarProps = useMemo(
    () => ({
      navItems: [
        {
          key: 'dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
          href: '/perlengkapan/dashboard',
        },
        {
          key: 'pengadaan',
          label: 'List Pengadaan',
          icon: ClipboardList,
          href: '/perlengkapan/pengadaan',
          badge: total > 0 ? total : 4,
        },
      ],
      activeRoute: 'pengadaan',
      brandSubtitle: 'Pengadaan Barang & Jasa',
      sectionTitle: 'Menu',
    }),
    [total]
  );

  const topbarProps = useMemo(
    () => ({
      user: user
        ? {
            ...user,
            initials: 'PL',
            unitSubtitle: 'Unit Perlengkapan',
          }
        : {
            nama: 'Perlengkapan',
            initials: 'PL',
            unitSubtitle: 'Unit Perlengkapan',
          },
    }),
    [user]
  );

  return (
    <DashboardShellTemplate sidebarProps={sidebarProps} topbarProps={topbarProps}>
      <div className="space-y-6">
        {/* Hero Banner */}
        <HeroBanner
          eyebrow="DAFTAR PENGADAAN"
          title="List Pengadaan"
          description="Pantau pengadaan yang perlu diinput dokumentasi barang dan dokumen penerimaan barang."
        />

        {/* Main Card */}
        <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
          {/* Header & Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#F0F4F2]">
            <div>
              <h2 className="text-base font-bold text-[#14201C]">Daftar Pengadaan</h2>
              <p className="text-xs text-[#5F6F6A] mt-0.5">
                Pengadaan yang ditangani Perlengkapan
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Filter Button */}
              <button
                type="button"
                onClick={() => setFilterModalOpen(true)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  selectedStatuses.length > 0
                    ? 'bg-[#E8F5EF] text-[#0E7C5A] border-[#0E7C5A]'
                    : 'bg-white text-[#14201C] border-[#E4EBE8] hover:bg-[#F4F7F5]'
                }`}
              >
                <Filter className="w-3.5 h-3.5 text-[#5F6F6A]" />
                <span>Filter</span>
                {selectedStatuses.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#0E7C5A] text-white text-[10px] font-bold flex items-center justify-center">
                    {selectedStatuses.length}
                  </span>
                )}
              </button>

              {/* Search Form */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="w-4 h-4 text-[#8A9A95] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Cari nomor atau judul..."
                  className="w-56 sm:w-64 pl-10 pr-3.5 py-2 rounded-xl border border-[#E4EBE8] text-xs text-[#14201C] focus:ring-2 focus:ring-[#0E7C5A] focus:border-transparent outline-none bg-white placeholder-[#8A9A95]"
                />
              </form>

              {/* Total Count */}
              <span className="text-xs text-[#8A9A95] font-medium whitespace-nowrap pl-1">
                {total} pengadaan
              </span>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="border-b border-[#E4EBE8] text-[11px] font-bold text-[#8A9A95] uppercase tracking-wider">
                  <th className="py-3.5 px-4">NO PENGADAAN</th>
                  <th className="py-3.5 px-4">JUDUL PENGADAAN</th>
                  <th className="py-3.5 px-4">DIAJUKAN OLEH</th>
                  <th className="py-3.5 px-4">NILAI PENGAJUAN</th>
                  <th className="py-3.5 px-4">STATUS</th>
                  <th className="py-3.5 px-4 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F4F2]">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#8A9A95]">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-[#0E7C5A]" />
                        <span className="text-xs font-medium text-[#5F6F6A]">
                          Memuat data pengadaan...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#8A9A95]">
                      <div className="flex flex-col items-center justify-center gap-2.5 max-w-sm mx-auto">
                        <div className="w-12 h-12 rounded-2xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center">
                          <PackageOpen className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-[#14201C]">
                          Belum Ada Pengadaan
                        </p>
                        <p className="text-xs text-[#5F6F6A] leading-relaxed">
                          Tidak ditemukan pengadaan yang sesuai dengan kriteria pencarian atau filter.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-[#F9FBFA] transition-colors group"
                    >
                      <td className="py-4 px-4 align-middle">
                        <span className="font-bold text-xs text-[#0E7C5A] block tracking-tight">
                          {item.nomor_pengadaan}
                        </span>
                        <span className="text-[11px] text-[#8A9A95] font-medium block mt-0.5">
                          {item.nomor_permohonan}
                        </span>
                      </td>
                      <td className="py-4 px-4 align-middle font-semibold text-xs text-[#14201C] max-w-xs truncate">
                        {item.judul}
                      </td>
                      <td className="py-4 px-4 align-middle text-xs text-[#5F6F6A] font-medium">
                        {item.diajukan_oleh}
                      </td>
                      <td className="py-4 px-4 align-middle text-xs font-semibold text-[#14201C]">
                        {formatRupiah(item.nilai_pengajuan)}
                      </td>
                      <td className="py-4 px-4 align-middle">
                        <StatusPill
                          status={item.status}
                          label={item.status_label || (item.status === 'selesai' ? 'Selesai' : 'Menunggu Input')}
                        />
                      </td>
                      <td className="py-4 px-4 align-middle text-center">
                        <RowActionMenu
                          item={item}
                          viewHref={`/perlengkapan/pengadaan/${item.id}`}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {!isLoading && total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 mt-2 border-t border-[#F0F4F2]">
              <p className="text-xs text-[#8A9A95] font-medium order-2 sm:order-1">
                Menampilkan {from}–{to} dari {total} pengadaan
              </p>

              <div className="flex items-center gap-1.5 order-1 sm:order-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage <= 1}
                  aria-label="Halaman sebelumnya"
                  className={`w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-medium transition-colors ${
                    currentPage <= 1
                      ? 'border-[#E4EBE8] text-[#B2C0BC] cursor-not-allowed bg-[#F9FBFA]'
                      : 'border-[#E4EBE8] text-[#14201C] hover:bg-[#F4F7F5] cursor-pointer'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {pageNumbers.map((p, idx) => {
                  if (p === '...') {
                    return (
                      <span
                        key={`ellipsis-${idx}`}
                        className="w-8 h-8 flex items-center justify-center text-xs text-[#8A9A95] font-medium"
                      >
                        ...
                      </span>
                    );
                  }

                  const pageNum = p as number;
                  const isActive = pageNum === currentPage;

                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-[32px] h-8 px-2 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#0E7C5A] text-white shadow-xs'
                          : 'text-[#5F6F6A] hover:bg-[#F4F7F5] hover:text-[#14201C]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, lastPage))}
                  disabled={currentPage >= lastPage}
                  aria-label="Halaman selanjutnya"
                  className={`w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-medium transition-colors ${
                    currentPage >= lastPage
                      ? 'border-[#E4EBE8] text-[#B2C0BC] cursor-not-allowed bg-[#F9FBFA]'
                      : 'border-[#E4EBE8] text-[#14201C] hover:bg-[#F4F7F5] cursor-pointer'
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter Modal */}
      <FilterPengajuanModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        selectedStatuses={selectedStatuses}
        onApply={handleApplyFilter}
        options={PERLENGKAPAN_STATUS_OPTIONS}
      />
    </DashboardShellTemplate>
  );
};

export default PerlengkapanPengadaanIndex;
