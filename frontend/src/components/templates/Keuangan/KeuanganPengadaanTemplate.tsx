import type { FC, FormEvent } from 'react';
import { Filter, Search, PackageOpen, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import AppLayout from '../General/AppLayout';
import HeroBanner from '../../organisms/HeroBanner';
import StatusPill from '../../atoms/StatusPill';
import RowActionMenu from '../../organisms/RowActionMenu';
import FilterPengajuanModal, { type FilterStatusOption } from '../../organisms/FilterPengajuanModal';
import { KEUANGAN_NAV_ITEMS } from '../../../constants/keuanganNav';
import { formatRupiah } from '../../../utils/formatters';
import type { KeuanganPengadaanItem } from '../../../types/keuangan';

export const KEUANGAN_STATUS_OPTIONS: FilterStatusOption[] = [
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

export interface KeuanganPengadaanTemplateProps {
  items: KeuanganPengadaanItem[];
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

export const KeuanganPengadaanTemplate: FC<KeuanganPengadaanTemplateProps> = ({
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
      navItems={KEUANGAN_NAV_ITEMS}
      roleInitials="KE"
      roleTitle="Keuangan"
      roleSubtitle="Unit Keuangan"
      basePath="/keuangan"
      profileHref="/keuangan/profil"
      notifikasiHref="/keuangan/notifikasi"
    >
      <div className="space-y-6">
        {/* Hero Banner */}
        <HeroBanner
          eyebrow="DAFTAR PENGADAAN"
          title="List Pengadaan"
          description="Pantau pengadaan yang perlu diinput bukti pembayarannya."
        />

        {/* Main Card */}
        <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
          {/* Header & Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#F0F4F2]">
            <div>
              <h2 className="text-base font-bold text-[#14201C]">Daftar Pengadaan</h2>
              <p className="text-xs text-[#5F6F6A] mt-0.5 font-medium">
                Pengadaan yang ditangani Keuangan
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Filter Button */}
              <button
                type="button"
                onClick={onOpenFilterModal}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] ${
                  selectedStatuses.length > 0
                    ? 'bg-[#EEF5F2] text-[#0E7C5A] border-[#A8DAC7]'
                    : 'bg-white text-[#4A5568] border-[#E2E8F0] hover:bg-slate-50'
                }`}
                aria-label="Filter status pengadaan"
              >
                <Filter className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Filter</span>
                {selectedStatuses.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#0E7C5A] text-white text-[10px] font-bold flex items-center justify-center">
                    {selectedStatuses.length}
                  </span>
                )}
              </button>

              {/* Search Bar */}
              <form onSubmit={onSearchSubmit} className="relative w-full sm:w-64">
                <Search
                  className="w-4 h-4 text-[#8A9A95] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => onSearchInputChange(e.target.value)}
                  placeholder="Cari nomor atau judul..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#14201C] placeholder-[#8A9A95] focus:outline-none focus:border-[#0E7C5A] focus:ring-1 focus:ring-[#0E7C5A] transition-colors"
                />
              </form>

              {/* Total counter label on far right */}
              <span className="text-xs font-medium text-[#8A9A95] ml-auto lg:ml-2">
                {total} pengadaan
              </span>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#EEF3F0] text-[11px] font-bold text-[#5F6F6A] uppercase tracking-wider">
                  <th className="py-3.5 px-4 rounded-l-xl">NO PENGADAAN</th>
                  <th className="py-3.5 px-4">JUDUL PENGADAAN</th>
                  <th className="py-3.5 px-4">DIAJUKAN OLEH</th>
                  <th className="py-3.5 px-4">NILAI PENGAJUAN</th>
                  <th className="py-3.5 px-4">STATUS</th>
                  <th className="py-3.5 px-4 text-center rounded-r-xl">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F4F2] text-xs">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-14 text-center text-[#8A9A95]">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 text-[#0E7C5A] animate-spin" />
                        <p className="text-xs text-[#5F6F6A] font-medium">
                          Memuat daftar pengadaan...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-14 text-center text-[#8A9A95]">
                      <div className="flex flex-col items-center justify-center gap-2.5 max-w-sm mx-auto">
                        <div className="w-12 h-12 rounded-2xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center">
                          <PackageOpen className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-[#14201C]">
                          Belum Ada Data Pengadaan
                        </p>
                        <p className="text-xs text-[#5F6F6A] leading-relaxed">
                          Tidak ditemukan paket pengadaan yang sesuai dengan pencarian atau filter yang dipilih.
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
                      <td className="py-4 px-4 align-middle font-semibold text-[#14201C] max-w-xs truncate">
                        {item.judul}
                      </td>
                      <td className="py-4 px-4 align-middle text-[#5F6F6A] font-medium">
                        {item.diajukan_oleh}
                      </td>
                      <td className="py-4 px-4 align-middle font-semibold text-[#14201C]">
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
                          viewHref={`/keuangan/pengadaan/${item.id}`}
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 mt-4 border-t border-[#F0F4F2] text-xs text-[#5F6F6A]">
              <p>
                Menampilkan <span className="font-semibold text-[#14201C]">{from}-{to}</span> dari{' '}
                <span className="font-semibold text-[#14201C]">{total}</span> permohonan
              </p>

              <div className="flex items-center gap-1.5" aria-label="Navigasi halaman">
                <button
                  type="button"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="w-8 h-8 rounded-lg border border-[#E2E8F0] flex items-center justify-center text-[#5F6F6A] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Halaman sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {pageNumbers.map((p, idx) =>
                  typeof p === 'number' ? (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onPageChange(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                        p === currentPage
                          ? 'bg-[#0E7C5A] text-white shadow-sm'
                          : 'border border-[#E2E8F0] text-[#5F6F6A] hover:bg-slate-50'
                      }`}
                      aria-current={p === currentPage ? 'page' : undefined}
                    >
                      {p}
                    </button>
                  ) : (
                    <span
                      key={idx}
                      className="w-8 h-8 flex items-center justify-center text-[#8A9A95] font-semibold"
                    >
                      {p}
                    </span>
                  )
                )}

                <button
                  type="button"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage >= lastPage}
                  className="w-8 h-8 rounded-lg border border-[#E2E8F0] flex items-center justify-center text-[#5F6F6A] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Halaman berikutnya"
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
        onApply={onApplyFilter}
        selectedStatuses={selectedStatuses}
        options={KEUANGAN_STATUS_OPTIONS}
      />
    </AppLayout>
  );
};

export default KeuanganPengadaanTemplate;
