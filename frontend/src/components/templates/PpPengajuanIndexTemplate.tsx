import type { FC, FormEvent } from 'react';
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import PpLayout from './PpLayout';
import HeroBanner from '../organisms/HeroBanner';
import SearchBar from '../molecules/SearchBar';
import SelectInput from '../molecules/SelectInput';
import PpPengajuanTable from '../organisms/PpPengajuanTable';
import FilterPengajuanModal from '../organisms/FilterPengajuanModal';
import type { PpPengadaanItem } from '../../types/pp';
import type { NotificationItem } from '../../types/notification';

export interface PpPengajuanIndexTemplateProps {
  items: PpPengadaanItem[];
  totalCount: number;
  searchQuery: string;
  selectedStatuses: string[];
  selectedBulan?: string;
  selectedTahun?: string;
  currentPage?: number;
  lastPage?: number;
  isLoading?: boolean;
  errorMessage?: string;
  filterModalOpen: boolean;
  recentNotifications?: NotificationItem[];
  unreadNotificationsCount?: number;
  onSearchChange: (val: string) => void;
  onSearchSubmit: (e: FormEvent) => void;
  onBulanChange?: (bulan: string) => void;
  onTahunChange?: (tahun: string) => void;
  onPageChange?: (page: number) => void;
  onOpenFilterModal: () => void;
  onCloseFilterModal: () => void;
  onApplyFilter: (statuses: string[]) => void;
}

const BULAN_OPTIONS = [
  { value: '1', label: 'Januari' },
  { value: '2', label: 'Februari' },
  { value: '3', label: 'Maret' },
  { value: '4', label: 'April' },
  { value: '5', label: 'Mei' },
  { value: '6', label: 'Juni' },
  { value: '7', label: 'Juli' },
  { value: '8', label: 'Agustus' },
  { value: '9', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
];

export const PpPengajuanIndexTemplate: FC<PpPengajuanIndexTemplateProps> = ({
  items,
  totalCount,
  searchQuery,
  selectedStatuses,
  selectedBulan = '',
  selectedTahun = '',
  currentPage = 1,
  lastPage = 1,
  isLoading = false,
  errorMessage = '',
  filterModalOpen,
  recentNotifications = [],
  unreadNotificationsCount = 0,
  onSearchChange,
  onSearchSubmit,
  onBulanChange,
  onTahunChange,
  onPageChange,
  onOpenFilterModal,
  onCloseFilterModal,
  onApplyFilter,
}) => {
  const currentYear = new Date().getFullYear();
  const tahunOptions = [
    { value: String(currentYear), label: String(currentYear) },
    { value: String(currentYear - 1), label: String(currentYear - 1) },
    { value: String(currentYear - 2), label: String(currentYear - 2) },
  ];

  return (
    <PpLayout
      activeRoute="pengajuan"
      notifications={recentNotifications}
      unreadCount={unreadNotificationsCount}
      flash={errorMessage ? { error: errorMessage } : undefined}
    >
      {/* Hero Banner */}
      <HeroBanner
        eyebrow="DAFTAR PENGAJUAN"
        title="Daftar Pengajuan PP"
        description="Pantau dan kelola pengajuan pengadaan bernilai Rp50 - 200 juta yang membutuhkan verifikasi Pejabat Pengadaan."
        className="mb-6"
      />

      {/* Main Table Card */}
      <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
        {/* Filter bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#F0F4F2]">
          <form onSubmit={onSearchSubmit} className="flex-1 max-w-md">
            <SearchBar
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari nomor surat atau judul..."
            />
          </form>

          <div className="flex flex-wrap items-center gap-3">
            {onBulanChange && (
              <SelectInput
                value={selectedBulan}
                onChange={(e) => onBulanChange(e.target.value)}
                options={BULAN_OPTIONS}
                placeholder="Semua Bulan"
                className="w-36"
              />
            )}

            {onTahunChange && (
              <SelectInput
                value={selectedTahun}
                onChange={(e) => onTahunChange(e.target.value)}
                options={tahunOptions}
                placeholder="Semua Tahun"
                className="w-36"
              />
            )}

            <button
              type="button"
              onClick={onOpenFilterModal}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                selectedStatuses.length > 0
                  ? 'bg-[#E8F5EF] text-[#0E7C5A] border-[#0E7C5A]'
                  : 'bg-[#F7FAF9] text-[#14201C] border-[#E4EBE8] hover:bg-[#EEF3F0]'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Status</span>
              {selectedStatuses.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#0E7C5A] text-white text-[10px] flex items-center justify-center font-bold">
                  {selectedStatuses.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Total count summary */}
        <div className="flex items-center justify-between py-4">
          <p className="text-xs text-[#5F6F6A]">
            Menampilkan <strong className="text-[#14201C]">{items.length}</strong> dari{' '}
            <strong className="text-[#14201C]">{totalCount}</strong> pengadaan
          </p>
        </div>

        {/* Organism: Table */}
        <PpPengajuanTable
          items={items}
          isLoading={isLoading}
          emptyMessage="Tidak ada pengajuan ditemukan."
        />

        {/* Pagination */}
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

      <FilterPengajuanModal
        isOpen={filterModalOpen}
        onClose={onCloseFilterModal}
        selectedStatuses={selectedStatuses}
        onApplyFilter={onApplyFilter}
      />
    </PpLayout>
  );
};

export default PpPengajuanIndexTemplate;
