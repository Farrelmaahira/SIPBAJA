import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import AppLayout from '../General/AppLayout';
import HeroBanner from '../../organisms/HeroBanner';
import { CrudTable, type CrudColumn } from '../../organisms/CrudTable';
import StatusPill from '../../atoms/StatusPill';
import SearchBar from '../../molecules/SearchBar';
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
  const navigate = useNavigate();

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
    {
      key: 'actions',
      header: <span className="sr-only">Aksi</span>,
      render: (item) => (
        <button
          type="button"
          onClick={() => navigate(`/ppbj/permohonan/${item.id}`)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E4EBE8] bg-white text-xs font-semibold text-[#0E7C5A] hover:bg-[#F3F6F5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] cursor-pointer"
        >
          <span>Paketkan</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
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
        {/* Hero Banner Organism */}
        <HeroBanner
          eyebrow="DAFTAR PERMOHONAN"
          title="List Permohonan"
          description="Pantau dan kelola seluruh permohonan pengadaan yang ditangani PPBJ."
        />

        {/* Card Container for Table & Search */}
        <section
          aria-label="Daftar Permohonan Pengadaan"
          className="bg-white rounded-[22px] border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] p-6 space-y-5"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-[#14201C]">
                Daftar Permohonan
              </h2>
              <p className="text-xs text-[#5F6F6A] mt-0.5">
                Permohonan dan pengajuan pengadaan yang ditangani PPBJ ({items.length} permohonan)
              </p>
            </div>

            <div className="w-full md:w-72">
              <SearchBar
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder="Cari nomor atau judul…"
                className="!min-h-[40px] text-xs"
              />
            </div>
          </div>

          <CrudTable<PpbjPermohonanItem>
            columns={columns}
            rows={items}
            isLoading={isLoading}
            emptyTitle="Tidak ada permohonan ditemukan"
            emptyDescription="Belum ada permohonan pengadaan yang sesuai dengan pencarian Anda."
            className="border-none shadow-none rounded-xl"
          />
        </section>
      </div>
    </AppLayout>
  );
};

export default PpbjPermohonanIndexTemplate;
