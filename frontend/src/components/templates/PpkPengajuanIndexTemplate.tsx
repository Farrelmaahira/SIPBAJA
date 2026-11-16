import { type FC, type FormEvent } from 'react';
import { SlidersHorizontal, ChevronLeft, ChevronRight, FileText, Eye } from 'lucide-react';
import PpLayout, { type PpNavItem } from './PpLayout';
import SearchBar from '../molecules/SearchBar';
import SelectInput from '../molecules/SelectInput';
import PpkPengajuanTable from '../organisms/PpkPengajuanTable';
import FilterPengajuanModal, { type FilterOption } from '../organisms/FilterPengajuanModal';
import type { NotificationItem } from '../../types/notification';
import type { PpPaginationMeta, PpkRkaklDoc, PpkTableRow } from '../../types/ppk';

export const PPK_FILTER_OPTIONS: FilterOption[] = [
  {
    value: 'menunggu_persetujuan',
    label: 'Menunggu Persetujuan',
    dotClass: 'bg-[#F59E0B]',
  },
  {
    value: 'review_pembayaran',
    label: 'Review Pembayaran',
    dotClass: 'bg-[#3B82F6]',
  },
  {
    value: 'disetujui',
    label: 'Disetujui',
    dotClass: 'bg-[#10B981]',
  },
  {
    value: 'ditolak',
    label: 'Ditolak',
    dotClass: 'bg-[#EF4444]',
  },
];

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

export interface PpkPengajuanIndexTemplateProps {
  navItems: PpNavItem[];
  activeTab: 'pengadaan' | 'permohonan';
  onTabChange: (tab: 'pengadaan' | 'permohonan') => void;
  rows: PpkTableRow[];
  meta: PpPaginationMeta;
  search: string;
  onSearchChange: (val: string) => void;
  onSearchSubmit: (e: FormEvent) => void;
  selectedStatuses: string[];
  bulan: string;
  tahun: string;
  onBulanChange: (val: string) => void;
  onTahunChange: (val: string) => void;
  filterOpen: boolean;
  onOpenFilter: () => void;
  onCloseFilter: () => void;
  onApplyFilter: (statuses: string[]) => void;
  onPageChange: (page: number) => void;
  activeRkakl: PpkRkaklDoc | null;
  onPreviewRkakl: (doc: PpkRkaklDoc) => void;
  isLoading: boolean;
  recentNotifications: NotificationItem[];
  unreadNotificationsCount: number;
}

export const PpkPengajuanIndexTemplate: FC<PpkPengajuanIndexTemplateProps> = ({
  navItems,
  activeTab,
  onTabChange,
  rows,
  meta,
  search,
  onSearchChange,
  onSearchSubmit,
  selectedStatuses,
  bulan,
  tahun,
  onBulanChange,
  onTahunChange,
  filterOpen,
  onOpenFilter,
  onCloseFilter,
  onApplyFilter,
  onPageChange,
  activeRkakl,
  onPreviewRkakl,
  isLoading,
  recentNotifications,
  unreadNotificationsCount,
}) => {
  const currentYear = new Date().getFullYear();
  const tahunOptions = [
    { value: String(currentYear), label: String(currentYear) },
    { value: String(currentYear - 1), label: String(currentYear - 1) },
    { value: String(currentYear - 2), label: String(currentYear - 2) },
  ];

  const currentPage = meta.current_page || 1;
  const lastPage = meta.last_page || 1;

  return (
    <PpLayout
      activeRoute="pengajuan"
      navItems={navItems}
      roleInitials="PPK"
      roleTitle="PPK"
      roleSubtitle="Pejabat Pembuat Komitmen"
      profileHref="/ppk/profil"
      notifikasiHref="/ppk/notifikasi"
      readAllHref="/ppk/notifikasi/read-all"
      notifications={recentNotifications}
      unreadCount={unreadNotificationsCount}
    >
      {/* Banner RKAKL Aktif */}
      {activeRkakl && (
        <div className="mb-6 bg-white rounded-[22px] border border-[#E4EBE8] p-5 shadow-[0_4px_16px_rgba(13,51,38,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#E8F5EF] flex items-center justify-center text-[#0E7C5A] shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E4F6EC] text-[#0B7A4E]">
                  RKAKL AKTIF {activeRkakl.tahun_anggaran || '2026'}
                </span>
                <span className="text-xs text-[#8A9A95]">v{activeRkakl.versi ?? 1}</span>
              </div>
              <p className="text-sm font-bold text-[#14201C] mt-1">{activeRkakl.nama_asli}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onPreviewRkakl(activeRkakl)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0E7C5A] hover:bg-[#0B684A] text-white text-xs font-bold transition shadow-[0_4px_12px_rgba(14,124,90,0.2)] cursor-pointer self-start sm:self-auto"
          >
            <Eye className="w-4 h-4" />
            <span>Pratinjau RKAKL</span>
          </button>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white rounded-[22px] border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] overflow-hidden">
        {/* Tab Header */}
        <div className="px-6 pt-5 pb-0 border-b border-[#F0F4F2] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onTabChange('pengadaan')}
              className={`px-4 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                activeTab === 'pengadaan'
                  ? 'bg-[#E8F5EF] text-[#0E7C5A]'
                  : 'text-[#6B7280] hover:bg-[#F4F7F5]'
              }`}
            >
              Dokumen Pengadaan
            </button>
            <button
              type="button"
              onClick={() => onTabChange('permohonan')}
              className={`px-4 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                activeTab === 'permohonan'
                  ? 'bg-[#E8F5EF] text-[#0E7C5A]'
                  : 'text-[#6B7280] hover:bg-[#F4F7F5]'
              }`}
            >
              Dokumen Turunan (MAK)
            </button>
          </div>

          <div className="text-xs text-[#8A9A95]">
            Menampilkan <strong className="text-[#14201C]">{rows.length}</strong> data
          </div>
        </div>

        {/* Filter / Search Bar */}
        <div className="p-6 border-b border-[#F0F4F2] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <form onSubmit={onSearchSubmit} className="flex-1 max-w-md">
            <SearchBar
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari nomor surat atau judul..."
            />
          </form>

          <div className="flex flex-wrap items-center gap-3">
            <SelectInput
              value={bulan}
              onChange={(e) => onBulanChange(e.target.value)}
              options={BULAN_OPTIONS}
              placeholder="Semua Bulan"
              className="w-36"
            />

            <SelectInput
              value={tahun}
              onChange={(e) => onTahunChange(e.target.value)}
              options={tahunOptions}
              placeholder="Semua Tahun"
              className="w-36"
            />

            <button
              type="button"
              onClick={onOpenFilter}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                selectedStatuses.length > 0
                  ? 'bg-[#E8F5EF] text-[#0E7C5A] border-[#0E7C5A]'
                  : 'bg-[#F7FAF9] text-[#14201C] border-[#E4EBE8] hover:bg-[#EEF3F0]'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Status</span>
              {selectedStatuses.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#0E7C5A] text-white text-[10px] flex items-center justify-center font-bold">
                  {selectedStatuses.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Organism: Table */}
        <PpkPengajuanTable
          rows={rows}
          isLoading={isLoading}
          emptyMessage="Belum ada data pengajuan pada tab ini."
        />

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="px-6 py-4 border-t border-[#F0F4F2] flex items-center justify-between">
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
        isOpen={filterOpen}
        onClose={onCloseFilter}
        selectedStatuses={selectedStatuses}
        onApplyFilter={onApplyFilter}
        options={PPK_FILTER_OPTIONS}
      />
    </PpLayout>
  );
};

export default PpkPengajuanIndexTemplate;
