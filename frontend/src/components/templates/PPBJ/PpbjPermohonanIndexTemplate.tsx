import type { FC } from 'react';
import AppLayout from '../General/AppLayout';
import HeroBanner from '../../organisms/HeroBanner';
import { CrudTable, type CrudColumn } from '../../organisms/CrudTable';
import TableToolbar from '../../molecules/TableToolbar';
import StatusPill from '../../atoms/StatusPill';
import { PPBJ_NAV_ITEMS } from '../../../constants/ppbjNav';
import { formatRupiah, formatTanggalIndo } from '../../../utils/formatters';
import type { PpbjPermohonanItem } from '../../../types/ppbj';
import type { AppTopbarUser } from '../../organisms/AppTopbar';

export interface PpbjPermohonanIndexTemplateProps {
  user?: AppTopbarUser | null;
  items?: PpbjPermohonanItem[];
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  isLoading?: boolean;
}

export const PpbjPermohonanIndexTemplate: FC<PpbjPermohonanIndexTemplateProps> = ({
  user = null,
  items = [],
  searchQuery = '',
  onSearchChange,
  isLoading = false,
}) => {
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

  return (
    <AppLayout
      activeRoute="permohonan"
      navItems={PPBJ_NAV_ITEMS}
      roleInitials="PB"
      roleTitle="PPBJ"
      roleSubtitle="Pengadaan Barang & Jasa"
      user={user}
      breadcrumb={[
        { label: 'DASHBOARD', href: '/ppbj/dashboard' },
        { label: 'DAFTAR PERMOHONAN' },
      ]}
    >
      <div className="space-y-6">
        <HeroBanner
          eyebrow="DAFTAR PERMOHONAN"
          title="List Permohonan"
          description="Pantau dan kelola seluruh permohonan pengadaan yang ditangani PPBJ."
        />
        <CrudTable<PpbjPermohonanItem>
          title="Daftar Permohonan Pengadaan"
          subtitle="Seluruh permohonan pengadaan yang masuk untuk ditinjau"
          columns={columns}
          rows={items}
          isLoading={isLoading}
          emptyTitle="Tidak ada permohonan ditemukan"
          emptyDescription="Belum ada permohonan pengadaan yang sesuai dengan pencarian Anda."
          className="border-none shadow-none rounded-xl"
          toolbar={
            <TableToolbar
              searchValue={searchQuery}
              onSearchChange={onSearchChange}
            />
          }
          actions={[
            {
              key: 'view',
              label: 'Detail',
              href: row => `/ppbj/permohonan/${row.id}`
            }
          ]}
        />
      </div>
    </AppLayout>
  );
};

export default PpbjPermohonanIndexTemplate;
