import type { FC, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../General/AppLayout';
import HeroBanner from '../../organisms/HeroBanner';
import CrudTable, { type CrudColumn } from '../../organisms/CrudTable';
import TableToolbar from '../../molecules/TableToolbar';
import TableFooter from '../../molecules/TableFooter';
import StatusPill from '../../atoms/StatusPill';
import FilterPengajuanModal from '../../organisms/FilterPengajuanModal';
import { formatRupiah, formatTanggal } from '../../../utils/formatters';
import type { PpPengadaanItem } from '../../../types/pp';
import type { NotificationItem } from '../../../types/notification';
import { PP_NAV_ITEMS } from '@/constants/ppNav';

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
          ? `/pp/pengadaan/${item.id}/review`
          : `/pp/pengadaan/${item.id}`;

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
    <TableToolbar
      searchValue={searchQuery}
      onSearchChange={onSearchChange}
      onSearchSubmit={onSearchSubmit}
      filterStatusLabel="Status"
      filterStatusCount={selectedStatuses.length}
      onFilterStatusClick={onOpenFilterModal}
      selectedBulan={selectedBulan}
      onBulanChange={onBulanChange}
      selectedTahun={selectedTahun}
      onTahunChange={onTahunChange}
      total={`${items.length} / ${totalCount} pengadaan`}
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
      roleInitials="PP"
      roleTitle="Pejabat Pengadaan"
      roleSubtitle="Unit Layanan Pengadaan"
      profileHref="/pp/profil"
      notifikasiHref="/pp/notifikasi"
      notifications={recentNotifications}
      unreadCount={unreadNotificationsCount}
      navItems={PP_NAV_ITEMS}
      breadcrumb={[
        { label: 'PP', href: '/pp/dashboard' },
        { label: 'DAFTAR PENGADAAN' },
      ]}
      flash={errorMessage ? { error: errorMessage } : undefined}
    >
      <div className="space-y-6">
        <HeroBanner
          eyebrow="DAFTAR PENGADAAN"
          title="Daftar Pengadaan PP"
          description="Pantau dan kelola pengadaan bernilai Rp50 - 200 juta yang membutuhkan verifikasi Pejabat Pengadaan."
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
                  ? `/pp/pengadaan/${row.id}/review`
                  : `/pp/pengadaan/${row.id}`,
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
