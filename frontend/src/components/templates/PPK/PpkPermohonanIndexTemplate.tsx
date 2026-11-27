import { type FC, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import AppLayout, { type AppNavItem } from '../General/AppLayout';
import HeroBanner from '../../organisms/HeroBanner';
import CrudTable, { type CrudColumn } from '../../organisms/CrudTable';
import { FilterStatusToolbar } from '../../molecules/FilterStatusToolbar';
import { PPK_PERMOHONAN_STATUS_OPTIONS } from '../../../constants/statusFilters';
import TableFooter from '../../molecules/TableFooter';
import StatusPill from '../../atoms/StatusPill';
import { formatRupiah, formatTanggal } from '../../../utils/formatters';
import type { NotificationItem } from '../../../types/notification';
import type { PpPaginationMeta, PpkTableRow } from '../../../types/ppk';

export interface PpkPermohonanIndexTemplateProps {
  navItems: AppNavItem[];
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
  isLoading: boolean;
  error?: string | null;
  recentNotifications: NotificationItem[];
  unreadNotificationsCount: number;
}

export const PpkPermohonanIndexTemplate: FC<PpkPermohonanIndexTemplateProps> = ({
  navItems,
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
  isLoading,
  error = null,
  recentNotifications,
  unreadNotificationsCount,
}) => {
  const currentPage = meta.current_page || 1;
  const lastPage = meta.last_page || 1;

  const columns: CrudColumn<PpkTableRow>[] = [
    {
      key: 'nomor_surat',
      header: 'No Permohonan',
      className: 'font-bold text-[#0E7C5A] whitespace-nowrap',
      render: (row) => (
        <Link to={`/ppk/permohonan/${row.id}/review`} className="hover:underline">
          {row.nomor_surat || '-'}
        </Link>
      ),
    },
    {
      key: 'judul',
      header: 'Judul Permohonan',
      className: 'font-bold text-[#14201C]',
      render: (row) => row.judul || '-',
    },
    {
      key: 'unit',
      header: 'Unit Pemohon',
      className: 'text-[#5F6F6A]',
      render: (row) => row.unit || '-',
    },
    {
      key: 'tanggal',
      header: 'Tanggal',
      className: 'text-[#5F6F6A] whitespace-nowrap',
      render: (row) => formatTanggal(row.tanggal),
    },
    {
      key: 'nominal',
      header: 'Estimasi Anggaran',
      className: 'font-bold text-[#14201C] whitespace-nowrap',
      render: (row) => formatRupiah(row.nominal),
    },
    {
      key: 'status',
      header: 'Status',
      className: 'whitespace-nowrap',
      render: (row) => <StatusPill status={row.status} />,
    },
  ];

  const toolbar = (
    <FilterStatusToolbar
      searchValue={search}
      onSearchChange={onSearchChange}
      selectedStatuses={selectedStatuses}
      filterOpen={filterOpen}
      onToggleFilter={(open) => (open ? onOpenFilter() : onCloseFilter())}
      onApplyFilters={onApplyFilter}
      options={PPK_PERMOHONAN_STATUS_OPTIONS}
      statusSectionTitle="STATUS PERMOHONAN"
      selectedBulan={bulan}
      onBulanChange={onBulanChange}
      selectedTahun={tahun}
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
      navItems={navItems}
      roleInitials="PPK"
      roleTitle="PPK"
      roleSubtitle="Pejabat Pembuat Komitmen"
      profileHref="/ppk/profil"
      notifikasiHref="/ppk/notifikasi"
      readAllHref="/ppk/notifikasi/read-all"
      notifications={recentNotifications}
      unreadCount={unreadNotificationsCount}
      breadcrumb={[
        { label: 'PPK', href: '/ppk/dashboard' },
        { label: 'DAFTAR PERMOHONAN' },
      ]}
    >
      <div className="space-y-6">
        <HeroBanner
          eyebrow="DAFTAR PERMOHONAN"
          title="Daftar Permohonan PPK"
          description="Pantau dan review permohonan yang terikat dengan Jenis MAK dalam wewenang Anda."
        />

        {error && (
          <div className="flex items-start gap-2.5 rounded-[14px] border border-[#FECDCA] bg-[#FEF3F2] px-4 py-3 text-xs text-[#B42318]">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        <CrudTable
          title="Daftar Permohonan"
          subtitle="Permohonan yang terikat Jenis MAK dalam wewenang PPK"
          columns={columns}
          rows={rows}
          isLoading={isLoading}
          toolbar={toolbar}
          footer={footer}
          emptyTitle={error ? 'Daftar permohonan gagal dimuat' : undefined}
          actions={[
            {
              key: 'view',
              label: 'Detail / Review',
              href: (row) => `/ppk/permohonan/${row.id}/review`,
            },
          ]}
        />
      </div>
    </AppLayout>
  );
};

export default PpkPermohonanIndexTemplate;
