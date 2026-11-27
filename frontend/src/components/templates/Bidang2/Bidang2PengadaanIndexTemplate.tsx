import type { FC, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../General/AppLayout';
import HeroBanner from '../../organisms/HeroBanner';
import CrudTable, { type CrudColumn } from '../../organisms/CrudTable';
import StatusPill from '../../atoms/StatusPill';
import TableToolbar from '../../molecules/TableToolbar';
import TableFooter from '../../molecules/TableFooter';
import { BIDANG2_NAV_ITEMS } from '../../../constants/bidang2Nav';
import { formatRupiah } from '../../../utils/formatters';
import type { Bidang2TableItem } from '../../organisms/Bidang2PermohonanTable';
import type { ProfilePillUser } from '../../molecules/ProfilePill';

export interface Bidang2PengadaanIndexTemplateProps {
  user?: ProfilePillUser | null;
  items: Bidang2TableItem[];
  isLoading: boolean;
  hasError: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: (e?: FormEvent) => void;
  selectedStatuses?: string[];
  onApplyFilter?: (statuses: string[]) => void;
  pagination: {
    currentPage: number;
    lastPage: number;
    total: number;
    from: number;
    to: number;
  };
  onPageChange: (page: number) => void;
  onViewDetail: (id: number | string) => void;
  onRetry?: () => void;
}

export const Bidang2PengadaanIndexTemplate: FC<Bidang2PengadaanIndexTemplateProps> = ({
  user,
  items,
  isLoading,
  hasError: _hasError,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  pagination,
  onPageChange,
  onViewDetail,
}) => {
  const columns: CrudColumn<Bidang2TableItem>[] = [
    {
      key: 'nomor_pengadaan',
      header: 'No. Pengadaan / No. Permohonan',
      className: 'whitespace-nowrap',
      render: (row) => (
        <div>
          <Link
            to={`/bidang-2/pengadaan/${row.id}`}
            className="font-bold text-[#0E7C5A] hover:underline"
          >
            {row.nomor_pengadaan || `PGD-${String(row.id).padStart(4, '0')}`}
          </Link>
          <p className="text-[11px] text-[#8A9A95] mt-0.5">
            {row.nomor_permohonan || `Permohonan #${row.id}`}
          </p>
        </div>
      ),
    },
    {
      key: 'judul',
      header: 'Nama Paket Pengadaan',
      render: (row) => (
        <span className="font-bold text-[#14201C] line-clamp-1" title={row.judul || undefined}>
          {row.judul || 'Tanpa Judul Pengadaan'}
        </span>
      ),
    },
    {
      key: 'unit_nama',
      header: 'Diajukan Oleh',
      className: 'whitespace-nowrap text-[#14201C]',
      render: (row) => row.unit_nama || (row.unit as any)?.nama || 'Unit Kampus',
    },
    {
      key: 'nominal',
      header: 'Nilai Pengadaan',
      className: 'font-bold text-[#14201C] whitespace-nowrap',
      render: (row) => {
        const nominal =
          row.nominal !== undefined && row.nominal !== null
            ? Number(row.nominal)
            : Number(row.estimasi_anggaran || 0);
        return formatRupiah(nominal);
      },
    },
    {
      key: 'status',
      header: 'Status',
      className: 'whitespace-nowrap',
      render: (row) => <StatusPill status={row.status || 'menunggu_review'} />,
    },
  ];

  const toolbar = (
    <TableToolbar
      searchValue={searchQuery}
      onSearchChange={onSearchChange}
      onSearchSubmit={onSearchSubmit}
      searchPlaceholder="Cari nomor pengadaan atau judul..."
      onResetFilters={() => onSearchChange('')}
      total={`${pagination.total} pengadaan`}
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
      activeRoute="pengadaan"
      navItems={BIDANG2_NAV_ITEMS}
      roleInitials="WD2"
      roleTitle="Bidang 2"
      roleSubtitle="Wakil Direktur II"
      profileHref="/bidang-2/profil"
      notifikasiHref="/bidang-2/dashboard"
      user={user}
      breadcrumb={[
        { label: 'BIDANG 2', href: '/bidang-2/dashboard' },
        { label: 'LIST PENGADAAN' },
      ]}
    >
      <div className="space-y-6">
        <HeroBanner
          eyebrow="DAFTAR PENGADAAN"
          title="List Pengadaan"
          description="Pantau dan kelola seluruh paket pengadaan yang berjalan di lingkungan Politeknik."
        />

        <CrudTable
          title="Daftar Pengadaan"
          subtitle="Paket pengadaan barang & jasa yang sedang berlangsung"
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

export default Bidang2PengadaanIndexTemplate;
