import type { FC, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../General/AppLayout';
import HeroBanner from '../../organisms/HeroBanner';
import CrudTable, { type CrudColumn } from '../../organisms/CrudTable';
import { FilterStatusToolbar } from '../../molecules/FilterStatusToolbar';
import { PERENCANAAN_STATUS_OPTIONS } from '../../../constants/statusFilters';
import TableFooter from '../../molecules/TableFooter';
import StatusPill from '../../atoms/StatusPill';
import type { PermohonanTerbaruItem } from '../../../types/perencanaan';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { PERENCANAAN_NAV_ITEMS } from '@/constants/perencanaanNav';

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

  const columns: CrudColumn<PermohonanTerbaruItem>[] = [
    {
      key: 'nomor_surat',
      header: 'No Permohonan',
      className: 'font-bold text-[#0E7C5A] whitespace-nowrap',
      render: (item) => (
        <Link
          to={`/perencanaan/permohonan/${item.id}`}
          className="hover:underline"
        >
          {item.nomor_surat || '-'}
        </Link>
      ),
    },
    {
      key: 'judul',
      header: 'Judul Permohonan',
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
    <FilterStatusToolbar
      searchValue={searchQuery}
      onSearchChange={onSearchChange}
      selectedStatuses={selectedStatuses}
      filterOpen={filterModalOpen}
      onToggleFilter={(open) => (open ? onOpenFilterModal() : onCloseFilterModal())}
      onApplyFilters={onApplyFilter}
      options={PERENCANAAN_STATUS_OPTIONS}
      statusSectionTitle="STATUS PERMOHONAN"
      selectedBulan={selectedBulan}
      onBulanChange={onBulanChange}
      selectedTahun={selectedTahun}
      onTahunChange={onTahunChange}
      onResetFilters={() => {
        onSearchChange('');
        onBulanChange('');
        onTahunChange('');
        onApplyFilter([]);
      }}
    />
  );

  const footer = (
    <TableFooter
      currentPage={currentPage}
      lastPage={lastPage}
      isLoading={isLoading}
      onPageChange={onPageChange}
    />
  );

  return (
    <AppLayout
      activeRoute="permohonan"
      navItems={PERENCANAAN_NAV_ITEMS}
      roleInitials="PR"
      roleTitle="Perencanaan"
      roleSubtitle="Unit Perencanaan"
      profileHref="/perencanaan/profil"
      notifikasiHref="/perencanaan/notifikasi"
      readAllHref="/perencanaan/notifikasi/read-all"
      breadcrumb={[
        { label: 'PERENCANAAN', href: '/perencanaan/dashboard' },
        { label: 'LIST PERMOHONAN' },
      ]}
      flash={errorMessage ? { error: errorMessage } : undefined}
    >
      <div className="space-y-6">
        <HeroBanner
          eyebrow="DAFTAR PERMOHONAN"
          title="List Permohonan"
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
              href: (row) => `/perencanaan/permohonan/${row.id}`,
            },
          ]}
        />
      </div>
    </AppLayout>
  );
};

export default PerencanaanPengajuanIndexTemplate;
