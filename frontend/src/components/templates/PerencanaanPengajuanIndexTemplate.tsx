import type { FC, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import AppLayout from './AppLayout';
import HeroBanner from '../organisms/HeroBanner';
import CrudTable, { type CrudColumn } from '../organisms/CrudTable';
import FilterPengajuanModal from '../organisms/FilterPengajuanModal';
import StatusPill from '../atoms/StatusPill';
import { PERENCANAAN_NAV_ITEMS } from '../../pages/Perencanaan/Dashboard';
import type { PermohonanTerbaruItem } from '../../types/perencanaan';
import { MONTH_OPTONS } from '@/constants/monthOptions';

export interface PerencanaanPengajuanIndexTemplateProps {
  items: PermohonanTerbaruItem[];
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
  onSearchChange: (val: string) => void;
  onSearchSubmit: (e: FormEvent) => void;
  onBulanChange?: (bulan: string) => void;
  onTahunChange?: (tahun: string) => void;
  onPageChange?: (page: number) => void;
  onOpenFilterModal: () => void;
  onCloseFilterModal: () => void;
  onApplyFilter: (statuses: string[]) => void;
}

export const PerencanaanPengajuanIndexTemplate: FC<PerencanaanPengajuanIndexTemplateProps> = ({
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
  const tahunOptions = ['', String(currentYear), String(currentYear - 1), String(currentYear - 2)];

  const formatCurrency = (val?: number | string) => {
    const numVal = typeof val === 'string' ? Number(val) : val || 0;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(Number.isNaN(numVal) ? 0 : numVal);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const columns: CrudColumn<PermohonanTerbaruItem>[] = [
    {
      key: 'nomor_surat',
      header: 'No Permohonan',
      className: 'font-bold text-[#0E7C5A] whitespace-nowrap',
      render: (item) => (
        <Link
          to={`/perencanaan/pengajuan/${item.id}`}
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
      render: (item) => item.judul || '-',
    },
    {
      key: 'created_at',
      header: 'Tanggal',
      className: 'text-[#5F6F6A] whitespace-nowrap',
      render: (item) => formatDate(item.created_at),
    },
    {
      key: 'estimasi_anggaran',
      header: 'Nilai Pengajuan',
      className: 'font-bold text-[#14201C] whitespace-nowrap',
      render: (item) => formatCurrency(item.estimasi_anggaran),
    },
    {
      key: 'status',
      header: 'Status',
      className: 'whitespace-nowrap',
      render: (item) => <StatusPill status={item.status || 'diajukan'} />,
    },
  ];

  const toolbar = (
    <div className="flex flex-wrap items-center justify-between gap-3 w-full">
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={onOpenFilterModal}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${selectedStatuses.length > 0
            ? 'bg-[#E8F5EF] text-[#0E7C5A] border-[#0E7C5A]'
            : 'bg-white text-[#14201C] border-[#E4EBE8] hover:bg-[#F4F7F5]'
            }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Filter Status</span>
          {selectedStatuses.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#0E7C5A] text-white text-[10px] flex items-center justify-center">
              {selectedStatuses.length}
            </span>
          )}
        </button>

        {onBulanChange && (
          <select
            value={selectedBulan}
            onChange={(e) => onBulanChange(e.target.value)}
            aria-label="Filter Bulan"
            className="px-3.5 py-2.5 rounded-xl border border-[#E4EBE8] text-xs font-semibold text-[#14201C] bg-white focus:ring-2 focus:ring-[#0E7C5A] outline-none cursor-pointer"
          >
            {MONTH_OPTONS.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        )}

        {onTahunChange && (
          <select
            value={selectedTahun}
            onChange={(e) => onTahunChange(e.target.value)}
            aria-label="Filter Tahun"
            className="px-3.5 py-2.5 rounded-xl border border-[#E4EBE8] text-xs font-semibold text-[#14201C] bg-white focus:ring-2 focus:ring-[#0E7C5A] outline-none cursor-pointer"
          >
            {tahunOptions.map((t) => (
              <option key={t} value={t}>
                {t ? `Tahun ${t}` : 'Semua Tahun'}
              </option>
            ))}
          </select>
        )}

        <form onSubmit={onSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-[#8A9A95] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari nomor surat atau judul..."
            className="w-64 sm:w-72 pl-10 pr-4 py-2.5 rounded-xl border border-[#E4EBE8] text-xs text-[#14201C] focus:ring-2 focus:ring-[#0E7C5A] focus:border-transparent outline-none bg-white placeholder-[#8A9A95]"
          />
        </form>
      </div>

      <span className="text-xs text-[#8A9A95] font-medium">
        {totalCount} permohonan
      </span>
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
      navItems={PERENCANAAN_NAV_ITEMS}
      roleInitials="PR"
      roleTitle="Perencanaan"
      roleSubtitle="Unit Perencanaan"
      profileHref="/perencanaan/profil"
      notifikasiHref="/perencanaan/notifikasi"
      readAllHref="/perencanaan/notifikasi/read-all"
      breadcrumb={[
        { label: 'PERENCANAAN', href: '/perencanaan/dashboard' },
        { label: 'LIST PENGAJUAN' },
      ]}
      flash={errorMessage ? { error: errorMessage } : undefined}
    >
      <div className="space-y-6">
        <HeroBanner
          eyebrow="DAFTAR PERMOHONAN"
          title="List Pengajuan"
          description="Pantau, cari, dan verifikasi permohonan pengadaan yang masuk dari berbagai unit kerja."
        />

        <CrudTable
          title="Daftar Permohonan Pengadaan"
          subtitle="Seluruh permohonan pengadaan yang masuk untuk ditinjau"
          columns={columns}
          rows={items}
          isLoading={isLoading}
          toolbar={toolbar}
          footer={footer}
          actions={[
            {
              key: 'view',
              label: 'Detail',
              href: (row) => `/perencanaan/pengajuan/${row.id}`,
            },
          ]}
        />
      </div>

      <FilterPengajuanModal
        isOpen={filterModalOpen}
        onClose={onCloseFilterModal}
        onApply={onApplyFilter}
        selectedStatuses={selectedStatuses}
      />
    </AppLayout>
  );
};

export default PerencanaanPengajuanIndexTemplate;
