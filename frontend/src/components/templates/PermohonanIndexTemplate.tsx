import type { FC, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Search } from 'lucide-react';
import AppLayout from './AppLayout';
import HeroBanner from '../organisms/HeroBanner';
import { CrudTable, type CrudColumn } from '../organisms/CrudTable';
import StatusPill from '../atoms/StatusPill';
import { PPBJ_NAV_ITEMS } from '../../constants/ppbjNav';
import { formatRupiah, formatTanggalIndo } from '../../utils/formatters';
import type { PpbjPermohonanItem } from '../../types/ppbj';
import { MONTH_OPTONS } from '@/constants/monthOptions';

export interface PermohonanIndexTemplateProps {
  items: PpbjPermohonanItem[];
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

export const PermohonanIndexTemplate: FC<PermohonanIndexTemplateProps> = ({
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
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const tahunOptions = ['', String(currentYear), String(currentYear - 1), String(currentYear - 2)];

  const columns: CrudColumn<PpbjPermohonanItem>[] = [
    {
      key: 'nomorSurat',
      header: 'No Permohonan',
      render: (item) => (
        <span className="font-semibold text-xs text-[#14201C]">
          {item.nomorSurat || '-'}
        </span>
      ),
    },
    {
      key: 'judul',
      header: 'Judul Pengadaan',
      render: (item) => (
        <span className="text-xs text-[#14201C] line-clamp-1 max-w-xs font-medium">
          {item.judul || '-'}
        </span>
      ),
    },
    {
      key: 'unitNama',
      header: 'Diajukan Oleh',
      render: (item) => (
        <span className="text-xs text-[#5F6F6A]">
          {item.unitNama || '-'}
        </span>
      ),
    },
    {
      key: 'tanggalPengajuan',
      header: 'Tanggal',
      render: (item) => (
        <span className="text-xs text-[#5F6F6A] whitespace-nowrap">
          {formatTanggalIndo(item.tanggalPengajuan)}
        </span>
      ),
    },
    {
      key: 'estimasiAnggaran',
      header: 'Nilai Pengajuan',
      render: (item) => (
        <span className="text-xs font-bold text-[#0E7C5A] whitespace-nowrap">
          {formatRupiah(item.estimasiAnggaran)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <StatusPill
          status={item.status}
          label={item.status === 'disetujui' ? 'Review PPBJ' : undefined}
        />
      ),
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

  return (
    <AppLayout
      activeRoute="permohonan"
      navItems={PPBJ_NAV_ITEMS}
      roleInitials="PB"
      roleTitle="PPBJ"
      roleSubtitle="Pengadaan Barang & Jasa"
      breadcrumb={[
        { label: 'DASHBOARD', href: '/ppbj/dashboard' },
        { label: 'DAFTAR PERMOHONAN' },
      ]}
    >
      <div className="space-y-6">
        {/* Hero Banner Organism */}
        <HeroBanner
          eyebrow="DAFTAR PERMOHONAN"
          title="List Permohonan"
          description="Pantau dan kelola seluruh permohonan pengadaan yang ditangani PPBJ."
        />

        <CrudTable
          title="Daftar Permohonan Pengadaan"
          subtitle="Seluruh permohonan pengadaan yang masuk untuk ditinjau"
          columns={columns}
          rows={items}
          isLoading={isLoading}
          toolbar={toolbar}
          emptyTitle="Tidak ada permohonan ditemukan"
          emptyDescription="Belum ada permohonan pengadaan yang sesuai dengan pencarian Anda."
          actions={[
            {
              key: 'view',
              label: 'Detail',
              href: (row) => `/ppbj/permohonan/${row.id}`
            }
          ]}
        />
      </div>
    </AppLayout>
  );
};

export default PermohonanIndexTemplate;
