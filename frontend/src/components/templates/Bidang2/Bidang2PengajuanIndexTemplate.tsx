import type { FC, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../General/AppLayout';
import HeroBanner from '../../organisms/HeroBanner';
import CrudTable, { type CrudColumn } from '../../organisms/CrudTable';
import StatusPill from '../../atoms/StatusPill';
import { FilterStatusToolbar } from '../../molecules/FilterStatusToolbar';
import { BIDANG2_PERMOHONAN_STATUS_OPTIONS } from '../../../constants/statusFilters';
import TableFooter from '../../molecules/TableFooter';
import { BIDANG2_NAV_ITEMS } from '../../../constants/bidang2Nav';
import { formatRupiah, formatTanggal } from '../../../utils/formatters';
import type { Bidang2PengajuanListItem } from '../../../types/bidang2';
import type { ProfilePillUser } from '../../molecules/ProfilePill';

const BIDANG2_FILTER_STATUS_OPTIONS: FilterStatusOption[] = [
  {
    key: 'menunggu_bidang2',
    label: 'Review Permohonan',
    pillClass: 'bg-[#EFF4FE] text-[#2F68D6] border border-[#D0E1FD]',
    dotClass: 'bg-[#2F68D6]',
  },
  {
    key: 'disetujui',
    label: 'Disetujui',
    pillClass: 'bg-[#E8F5E9] text-[#0E7C5A] border border-[#C8E6C9]',
    dotClass: 'bg-[#0E7C5A]',
  },
  {
    key: 'ditolak',
    label: 'Ditolak',
    pillClass: 'bg-[#FDECEC] text-[#E5484D] border border-[#FECDCA]',
    dotClass: 'bg-[#E5484D]',
  },
];

export interface Bidang2PengajuanIndexTemplateProps {
  user?: ProfilePillUser | null;
  items: Bidang2PengajuanListItem[];
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: (e?: FormEvent) => void;
  selectedStatus?: string;
  selectedStatuses?: string[];
  filterModalOpen?: boolean;
  onOpenFilterModal?: () => void;
  onCloseFilterModal?: () => void;
  onApplyFilter?: (statuses: string[]) => void;
  onStatusChange?: (status: string) => void;
  pagination: {
    currentPage: number;
    lastPage: number;
    total: number;
    from: number;
    to: number;
  };
  onPageChange: (page: number) => void;
  onViewDetail: (id: number | string) => void;
  onDownloadDokumen?: (id: number | string) => void;
  onRetry?: () => void;
}

export const Bidang2PengajuanIndexTemplate: FC<Bidang2PengajuanIndexTemplateProps> = ({
  user,
  items,
  isLoading,
  hasError: _hasError,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  selectedStatuses = [],
  filterModalOpen = false,
  onOpenFilterModal,
  onCloseFilterModal,
  onApplyFilter,
  pagination,
  onPageChange,
  onViewDetail,
}) => {
  const columns: CrudColumn<Bidang2PengajuanListItem>[] = [
    {
      key: 'nomor_surat',
      header: 'No Permohonan',
      className: 'font-bold text-[#0E7C5A] whitespace-nowrap',
      render: (item) => (
        <Link
          to={`/bidang-2/pengajuan/${item.id}`}
          className="hover:underline font-bold"
        >
          {item.nomor_surat || '-'}
        </Link>
      ),
    },
    {
      key: 'judul',
      header: 'Judul Permohonan',
      render: (item) => (
        <span className="font-bold text-[#14201C] line-clamp-1" title={item.judul || undefined}>
          {item.judul || 'Tanpa Judul'}
        </span>
      ),
    },
    {
      key: 'unit_nama',
      header: 'Diajukan Oleh',
      className: 'whitespace-nowrap text-[#14201C]',
      render: (item) => item.unit_nama || 'Unit Kampus',
    },
    {
      key: 'created_at',
      header: 'Tanggal Pengajuan',
      className: 'text-[#5F6F6A] whitespace-nowrap',
      render: (item) => formatTanggal(item.created_at || item.tanggal_pengajuan),
    },
    {
      key: 'estimasi_anggaran',
      header: 'Nilai Pengajuan',
      className: 'font-bold text-[#14201C] whitespace-nowrap',
      render: (item) => formatRupiah(Number(item.estimasi_anggaran || 0)),
    },
    {
      key: 'status',
      header: 'Status',
      className: 'whitespace-nowrap',
      render: (item) => (
        <StatusPill
          status={item.status}
          label={item.status === 'menunggu_bidang2' ? 'Review Permohonan' : undefined}
        />
      ),
    },
  ];

  const toolbar = (
    <FilterStatusToolbar
      searchValue={searchQuery}
      onSearchChange={onSearchChange}
      searchPlaceholder="Cari nomor surat atau judul..."
      selectedStatuses={selectedStatuses}
      filterOpen={filterModalOpen}
      onToggleFilter={(open) => (open ? onOpenFilterModal?.() : onCloseFilterModal?.())}
      onApplyFilters={onApplyFilter ?? (() => {})}
      options={BIDANG2_PERMOHONAN_STATUS_OPTIONS}
      statusSectionTitle="STATUS PERMOHONAN"
      onResetFilters={() => {
        onSearchChange('');
        onApplyFilter?.([]);
      }}
    />
  );

  const footer = (
    <TableFooter
      currentPage={pagination.currentPage}
      lastPage={pagination.lastPage}
      isLoading={isLoading}
      onPageChange={onPageChange}
    />
  );

  return (
    <AppLayout
      activeRoute="pengajuan"
      navItems={BIDANG2_NAV_ITEMS}
      roleInitials="WD2"
      roleTitle="Bidang 2"
      roleSubtitle="Wakil Direktur II"
      profileHref="/bidang-2/profil"
      notifikasiHref="/bidang-2/dashboard"
      user={user}
      breadcrumb={[
        { label: 'BIDANG 2', href: '/bidang-2/dashboard' },
        { label: 'LIST PERMOHONAN' },
      ]}
    >
      <div className="space-y-6">
        <HeroBanner
          eyebrow="DAFTAR PERMOHONAN"
          title="List Permohonan"
          description="Pantau dan review permohonan serta pengajuan yang masuk ke Bidang 2."
        />

        <CrudTable
          title="Daftar Permohonan"
          subtitle="Permohonan dan pengajuan yang perlu direview Bidang 2"
          columns={columns}
          rows={items}
          isLoading={isLoading}
          toolbar={toolbar}
          footer={footer}
          actions={[
            {
              key: 'view',
              label: 'Detail',
              onClick: (item) => onViewDetail(item.id),
            },
          ]}
        />
      </div>
    </AppLayout>
  );
};

export default Bidang2PengajuanIndexTemplate;
