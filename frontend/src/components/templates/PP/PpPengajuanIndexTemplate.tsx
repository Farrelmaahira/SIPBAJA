import type { FC, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import AppLayout from '../General/AppLayout';
import HeroBanner from '../../organisms/HeroBanner';
import CrudTable, { type CrudColumn } from '../../organisms/CrudTable';
import SearchBar from '../../molecules/SearchBar';
import SelectInput from '../../molecules/SelectInput';
import StatusPill from '../../atoms/StatusPill';
import FilterPengajuanModal from '../../organisms/FilterPengajuanModal';
import { formatRupiah, formatTanggal } from '../../../utils/formatters';
import type { PpPengadaanItem } from '../../../types/pp';
import type { NotificationItem } from '../../../types/notification';

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

  const columns: CrudColumn<PpPengadaanItem>[] = [
    {
      key: 'nomor_surat',
      header: 'No Permohonan',
      className: 'font-bold text-[#0E7C5A] whitespace-nowrap',
      render: (item) => {
        const permohonan = item.permohonan || item.Permohonan;
        const isWaiting =
          item.status === 'menunggu_persetujuan' || item.status === 'menunggu_review';
        const targetHref = isWaiting
          ? `/pp/pengajuan/${item.id}/review`
          : `/pp/pengajuan/${item.id}`;

        return (
          <Link to={targetHref} className="hover:underline">
            {permohonan?.nomor_surat || '-'}
          </Link>
        );
      },
    },
    {
      key: 'judul',
      header: 'Judul Pengadaan',
      render: (item) => {
        const permohonan = item.permohonan || item.Permohonan;
        const unit = permohonan?.unit || permohonan?.Unit;
        return (
          <div>
            <p className="font-bold text-[#14201C] line-clamp-1">{permohonan?.judul || '-'}</p>
            <p className="text-[11px] text-[#8A9A95] mt-0.5">{unit?.nama || '-'}</p>
          </div>
        );
      },
    },
    {
      key: 'created_at',
      header: 'Tanggal',
      className: 'text-[#5F6F6A] whitespace-nowrap',
      render: (item) => formatTanggal(item.created_at),
    },
    {
      key: 'nominal',
      header: 'Nilai Pengadaan',
      className: 'font-bold text-[#14201C] whitespace-nowrap',
      render: (item) => formatRupiah(item.nominal),
    },
    {
      key: 'status',
      header: 'Status',
      className: 'whitespace-nowrap',
      render: (item) => <StatusPill status={item.status} />,
    },
  ];

  const toolbar = (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full">
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

        <span className="text-xs text-[#8A9A95] font-medium ml-2">
          {items.length} / {totalCount} pengadaan
        </span>
      </div>
    </div>
  );

  const footer = lastPage > 1 && onPageChange ? (
    <div className="flex items-center justify-between pt-5 border-t border-[#F0F4F2]">
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
  ) : null;

  return (
    <AppLayout
      activeRoute="pengajuan"
      roleInitials="PP"
      roleTitle="Pejabat Pengadaan"
      roleSubtitle="Unit Layanan Pengadaan"
      profileHref="/pp/profil"
      notifikasiHref="/pp/notifikasi"
      notifications={recentNotifications}
      unreadCount={unreadNotificationsCount}
      breadcrumb={[
        { label: 'PEJABAT PENGADAAN', href: '/pp/dashboard' },
        { label: 'DAFTAR PENGAJUAN' },
      ]}
      flash={errorMessage ? { error: errorMessage } : undefined}
    >
      <div className="space-y-6">
        <HeroBanner
          eyebrow="DAFTAR PENGAJUAN"
          title="Daftar Pengajuan PP"
          description="Pantau dan kelola pengajuan pengadaan bernilai Rp50 - 200 juta yang membutuhkan verifikasi Pejabat Pengadaan."
        />

        <CrudTable
          title="Daftar Pengadaan Barang & Jasa"
          subtitle="Pengadaan dalam wewenang review Pejabat Pengadaan"
          columns={columns}
          rows={items}
          isLoading={isLoading}
          toolbar={toolbar}
          footer={footer}
          actions={[
            {
              key: 'view',
              label: 'Detail / Review',
              href: (row) =>
                row.status === 'menunggu_persetujuan' || row.status === 'menunggu_review'
                  ? `/pp/pengajuan/${row.id}/review`
                  : `/pp/pengajuan/${row.id}`,
            },
          ]}
        />
      </div>

      <FilterPengajuanModal
        isOpen={filterModalOpen}
        onClose={onCloseFilterModal}
        selectedStatuses={selectedStatuses}
        onApplyFilter={onApplyFilter}
      />
    </AppLayout>
  );
};

export default PpPengajuanIndexTemplate;
