import { type FC, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Eye } from 'lucide-react';
import AppLayout, { type AppNavItem } from '../General/AppLayout';
import HeroBanner from '../../organisms/HeroBanner';
import CrudTable, { type CrudColumn } from '../../organisms/CrudTable';
import FilterPengajuanModal from '../../organisms/FilterPengajuanModal';
import TableToolbar from '../../molecules/TableToolbar';
import TableFooter from '../../molecules/TableFooter';
import StatusPill from '../../atoms/StatusPill';
import { formatRupiah, formatTanggal } from '../../../utils/formatters';
import type { NotificationItem } from '../../../types/notification';
import type { PpPaginationMeta, PpkRkaklDoc, PpkTableRow } from '../../../types/ppk';

export interface PpkPengajuanIndexTemplateProps {
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
  recentNotifications: NotificationItem[];
  unreadNotificationsCount: number;
}

export const PpkPengajuanIndexTemplate: FC<PpkPengajuanIndexTemplateProps> = ({
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
        <Link to={`/ppk/pengajuan/${row.id}/review?type=permohonan`} className="hover:underline">
          {row.nomor_surat || '-'}
        </Link>
      ),
    },
    {
      key: 'judul',
      header: 'Judul Pengadaan',
      className: 'font-bold text-[#14201C]',
      render: (row) => row.judul || '-',
    },
    {
      key: 'tanggal',
      header: 'Tanggal',
      className: 'text-[#5F6F6A] whitespace-nowrap',
      render: (row) => formatTanggal(row.tanggal),
    },
    {
      key: 'nominal',
      header: 'Nilai Pengajuan',
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
    <TableToolbar
      searchValue={search}
      onSearchChange={onSearchChange}
      onSearchSubmit={onSearchSubmit}
      filterStatusCount={selectedStatuses.length}
      onFilterStatusClick={onOpenFilter}
      selectedBulan={bulan}
      onBulanChange={onBulanChange}
      selectedTahun={tahun}
      onTahunChange={onTahunChange}
      total={`${meta.total ?? rows.length} permohonan`}
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
      breadcrumb={[
        { label: 'PPK', href: '/ppk/dashboard' },
        { label: 'DAFTAR PENGAJUAN' },
      ]}
    >
      <div className="space-y-6">
        <HeroBanner
          eyebrow="DAFTAR PERMOHONAN"
          title="Daftar Permohonan PPK"
          description="Pantau dan verifikasi permohonan pengadaan yang terikat dengan Jenis MAK dalam wewenang Anda."
        />

        <CrudTable
          title="Daftar Permohonan Pengadaan"
          subtitle="Permohonan pengadaan yang terikat Jenis MAK dalam wewenang PPK"
          columns={columns}
          rows={rows}
          isLoading={isLoading}
          toolbar={toolbar}
          footer={footer}
          actions={[
            {
              key: 'view',
              label: 'Detail / Review',
              href: (row) => `/ppk/pengajuan/${row.id}/review?type=permohonan`,
            },
          ]}
        />
      </div>

      <FilterPengajuanModal
        isOpen={filterOpen}
        onClose={onCloseFilter}
        selectedStatuses={selectedStatuses}
        onApplyFilter={onApplyFilter}
      />
    </AppLayout>
  );
};

export default PpkPengajuanIndexTemplate;
