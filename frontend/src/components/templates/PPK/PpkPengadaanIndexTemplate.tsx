import type { FC, FormEvent } from 'react';
import AppLayout, { type AppNavItem } from '../General/AppLayout';
import HeroBanner from '../../organisms/HeroBanner';
import CrudTable, { type CrudColumn } from '../../organisms/CrudTable';
import { FilterStatusToolbar } from '../../molecules/FilterStatusToolbar';
import TableFooter from '../../molecules/TableFooter';
import StatusPill from '../../atoms/StatusPill';
import { PENGADAAN_STATUS_OPTIONS } from '../../../constants/statusFilters';
import { formatRupiah, formatTanggal } from '../../../utils/formatters';
import type { PpPengadaanItem } from '../../../types/pp';
import type { NotificationItem } from '../../../types/notification';
import { PPK_NAV_ITEMS } from '@/constants/ppkNav';

export interface PpkPengadaanIndexTemplateProps {
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
  navItems?: AppNavItem[];
  onSearchChange: (val: string) => void;
  onSearchSubmit: (e: FormEvent) => void;
  onBulanChange?: (bulan: string) => void;
  onTahunChange?: (tahun: string) => void;
  onPageChange?: (page: number) => void;
  onOpenFilterModal: () => void;
  onCloseFilterModal: () => void;
  onApplyFilter: (statuses: string[]) => void;
}

export const PpkPengadaanIndexTemplate: FC<PpkPengadaanIndexTemplateProps> = ({
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
  navItems = PPK_NAV_ITEMS,
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
      key: 'nomor_pengadaan',
      header: 'No. Pengadaan',
      className: 'font-bold text-[#14201C] whitespace-nowrap',
      render: (item) => {
        const year = new Date(item.created_at || Date.now()).getFullYear();
        const paddedId = String(item.id || 0).padStart(4, '0');
        return `PGD-${year}-${paddedId}`;
      },
    },
    {
      key: 'judul',
      header: 'Judul Pengadaan & Unit',
      render: (item) => {
        const permohonan = item.permohonan || item.Permohonan;
        const unit = permohonan?.unit || permohonan?.Unit;
        return (
          <div className="min-w-0 py-0.5">
            <p className="font-bold text-xs text-[#14201C] leading-snug line-clamp-1">
              {permohonan?.judul || '-'}
            </p>
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
      render: (item) => {
        const status = (item.status || '').toLowerCase();
        const level = item.level || item.Level;
        const perluReviewPp = Boolean(level?.perlu_review_pp);

        if (perluReviewPp && (status === 'menunggu_persetujuan' || status === 'diajukan')) {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FEF3DC] text-[#B54708] border border-[#FEDF89]">
              Menunggu Verifikasi PP
            </span>
          );
        }

        if (perluReviewPp && status === 'diteruskan') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#E8F5EF] text-[#0E7C5A] border border-[#A3D9C3]">
              Siap Otorisasi PPK
            </span>
          );
        }

        return <StatusPill status={item.status} />;
      },
    },
  ];

  const toolbar = (
    <FilterStatusToolbar
      searchValue={searchQuery}
      onSearchChange={onSearchChange}
      filterStatusLabel="Status"
      selectedStatuses={selectedStatuses}
      filterOpen={filterModalOpen}
      onToggleFilter={(open) => (open ? onOpenFilterModal() : onCloseFilterModal())}
      onApplyFilters={onApplyFilter}
      options={PENGADAAN_STATUS_OPTIONS}
      statusSectionTitle="STATUS PENGADAAN"
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
      activeRoute="pengadaan"
      roleInitials="PPK"
      roleTitle="Pejabat Pembuat Komitmen"
      roleSubtitle="PPK - Pengadaan Barang/Jasa"
      navItems={navItems}
      profileHref="/ppk/profil"
      notifikasiHref="/ppk/notifikasi"
      notifications={recentNotifications}
      unreadCount={unreadNotificationsCount}
      breadcrumb={[
        { label: 'PPK', href: '/ppk/dashboard' },
        { label: 'DAFTAR PENGADAAN' },
      ]}
      flash={errorMessage ? { error: errorMessage } : undefined}
    >
      <div className="space-y-6">
        <HeroBanner
          eyebrow="DAFTAR PENGADAAN"
          title="Daftar Pengadaan PPK"
          description="Pantau dan kelola seluruh dokumen pengadaan yang menjadi tanggung jawab MAK Anda untuk otorisasi komitmen eksekusi."
        />

        <CrudTable
          title="Daftar Pengadaan Barang & Jasa"
          subtitle="Pengadaan sesuai penetapan MAK penanggung jawab PPK"
          columns={columns}
          rows={items}
          isLoading={isLoading}
          toolbar={toolbar}
          footer={footer}
          actions={[
            {
              key: 'view',
              label: 'Detail / Review',
              href: (row) => `/ppk/pengadaan/${row.id}`,
            },
          ]}
        />
      </div>
    </AppLayout>
  );
};

export default PpkPengadaanIndexTemplate;
