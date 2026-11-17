import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';
import AppLayout from './AppLayout';
import HeroBanner from '../organisms/HeroBanner';
import CrudTable, { type CrudColumn } from '../organisms/CrudTable';
import SearchBar from '../molecules/SearchBar';
import StatusPill from '../atoms/StatusPill';
import { PPBJ_NAV_ITEMS } from './PpbjDashboardTemplate';
import { formatRupiah, formatTanggalIndo } from '../../utils/formatters';
import type { PpbjPermohonanItem } from '../../types/ppbj';
import type { AppTopbarUser } from '../organisms/AppTopbar';

export interface PermohonanIndexTemplateProps {
  user?: AppTopbarUser | null;
  items?: PpbjPermohonanItem[];
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  isLoading?: boolean;
}

export const PermohonanIndexTemplate: FC<PermohonanIndexTemplateProps> = ({
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
      className: 'font-bold text-[#0E7C5A] whitespace-nowrap',
      render: (item) => {
        const nomor = item.nomorSurat || '-';
        const jumlahPaket = item.jumlahPaket ?? 0;
        return (
          <div className="flex flex-col">
            <Link
              to={`/ppbj/permohonan/${item.id}`}
              className="hover:underline font-bold"
            >
              {nomor}
            </Link>
            {jumlahPaket > 0 && (
              <span className="text-[11px] font-normal text-[#5F6F6A] mt-0.5 inline-flex items-center gap-1">
                <Layers className="w-3 h-3 text-[#5F6F6A]" />
                {jumlahPaket} Paket
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'judul',
      header: 'Judul & Unit',
      render: (item) => (
        <div>
          <p className="font-bold text-[#14201C] line-clamp-1">{item.judul || 'Tanpa Judul'}</p>
          <p className="text-xs text-[#5F6F6A] mt-0.5">{item.unitNama || '-'}</p>
        </div>
      ),
    },
    {
      key: 'tanggalPengajuan',
      header: 'Tanggal Pengajuan',
      className: 'text-[#5F6F6A] whitespace-nowrap',
      render: (item) => formatTanggalIndo(item.tanggalPengajuan) || '-',
    },
    {
      key: 'estimasiAnggaran',
      header: 'Estimasi Anggaran',
      className: 'font-bold text-[#14201C] whitespace-nowrap',
      render: (item) => formatRupiah(Number(item.estimasiAnggaran || 0)),
    },
    {
      key: 'status',
      header: 'Status',
      className: 'whitespace-nowrap',
      render: (item) => <StatusPill status={item.status || 'review_permohonan'} />,
    },
  ];

  const toolbar = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
      <div className="w-full sm:w-80">
        <SearchBar
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Cari nomor surat atau judul..."
          className="!min-h-[40px] text-xs"
        />
      </div>
      <span className="text-xs text-[#8A9A95] font-medium shrink-0">
        {items.length} permohonan
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
      user={user}
      breadcrumb={[
        { label: 'DASHBOARD', href: '/ppbj/dashboard' },
        { label: 'DAFTAR PERMOHONAN' },
      ]}
    >
      <div className="space-y-6">
        <HeroBanner
          eyebrow="DAFTAR PERMOHONAN"
          title="Daftar Permohonan Pengadaan"
          description="Daftar usulan pengadaan barang dan jasa yang siap dipaketkan dan diproses oleh PPBJ."
        />

        <CrudTable
          title="Daftar Usulan Pengadaan"
          subtitle="Daftar permohonan yang siap diverifikasi dan dipaketkan"
          columns={columns}
          rows={items}
          isLoading={isLoading}
          toolbar={toolbar}
          actions={[
            {
              key: 'view',
              label: 'Proses / Detail',
              href: (row) => `/ppbj/permohonan/${row.id}`,
            },
          ]}
        />
      </div>
    </AppLayout>
  );
};

export default PermohonanIndexTemplate;
