import type { FC, FormEvent } from 'react';
import { Filter, Search, PackageOpen, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import AppLayout from '../General/AppLayout';
import HeroBanner from '../../organisms/HeroBanner';
import StatusPill from '../../atoms/StatusPill';
import RowActionMenu from '../../organisms/RowActionMenu';
import FilterPengajuanModal, { type FilterStatusOption } from '../../organisms/FilterPengajuanModal';
import { PERLENGKAPAN_NAV_ITEMS } from '../../../constants/perlengkapanNav';
import { formatRupiah } from '../../../utils/formatters';
import type { PerlengkapanPengadaanItem } from '../../../types/perlengkapan';

export const PERLENGKAPAN_STATUS_OPTIONS: FilterStatusOption[] = [
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

export interface PerlengkapanPengadaanTemplateProps {
  items: PerlengkapanPengadaanItem[];
  isLoading?: boolean;
  total: number;
  currentPage: number;
  lastPage: number;
  from: number;
  to: number;
  pageNumbers: (number | string)[];
  onPageChange: (page: number) => void;
  searchInput: string;
  onSearchInputChange: (val: string) => void;
  onSearchSubmit: (e: FormEvent) => void;
  selectedStatuses: string[];
  filterModalOpen: boolean;
  onOpenFilterModal: () => void;
  onCloseFilterModal: () => void;
  onApplyFilter: (statuses: string[]) => void;
}

export const PerlengkapanPengadaanTemplate: FC<PerlengkapanPengadaanTemplateProps> = ({
  items,
  isLoading = false,
  total,
  currentPage,
  lastPage,
  from,
  to,
  pageNumbers,
  onPageChange,
  searchInput,
  onSearchInputChange,
  onSearchSubmit,
  selectedStatuses,
  filterModalOpen,
  onOpenFilterModal,
  onCloseFilterModal,
  onApplyFilter,
}) => {
  return (
    <AppLayout
      activeRoute="pengadaan"
      navItems={PERLENGKAPAN_NAV_ITEMS}
      roleInitials="PL"
      roleTitle="Perlengkapan"
      roleSubtitle="Unit Perlengkapan"
      basePath="/perlengkapan"
      profileHref="/perlengkapan/profil"
      notifikasiHref="/perlengkapan/notifikasi"
    >
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
                onClick={onOpenFilterModal}
                className={`inline-flex items-center gap-2 px-3.5 py-2 min-h-[44px] rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
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
              <form onSubmit={onSearchSubmit} className="relative">
                <Search className="w-4 h-4 text-[#8A9A95] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => onSearchInputChange(e.target.value)}
                  placeholder="Cari nomor atau judul..."
                  className="w-56 sm:w-64 pl-10 pr-3.5 py-2 min-h-[44px] rounded-xl border border-[#E4EBE8] text-xs text-[#14201C] focus:ring-2 focus:ring-[#0E7C5A] focus:border-transparent outline-none bg-white placeholder-[#8A9A95]"
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
                  onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
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
                  if (typeof p === 'string') {
                    return (
                      <span key={`dots-${idx}`} className="px-1 text-xs text-[#8A9A95]">
                        ...
                      </span>
                    );
                  }

                  const isActive = p === currentPage;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => onPageChange(p)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-[#0E7C5A] text-white shadow-xs'
                          : 'border border-[#E4EBE8] text-[#14201C] hover:bg-[#F4F7F5] cursor-pointer'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => onPageChange(Math.min(currentPage + 1, lastPage))}
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
        onClose={onCloseFilterModal}
        selectedStatuses={selectedStatuses}
        onApply={onApplyFilter}
        options={PERLENGKAPAN_STATUS_OPTIONS}
      />
    </AppLayout>
  );
};

export default PerlengkapanPengadaanTemplate;
