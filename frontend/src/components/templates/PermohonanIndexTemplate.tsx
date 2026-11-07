import type { FC } from 'react';
import AppLayout from './AppLayout';
import PermohonanTable from '../molecules/PermohonanTable';
import SearchBar from '../molecules/SearchBar';
import { PPBJ_NAV_ITEMS } from './PpbjDashboardTemplate';
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
        {/* Page Header & Search */}
        <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#14201C]">
              Daftar Permohonan Pengadaan
            </h1>
            <p className="text-xs text-[#5F6F6A] mt-1">
              Daftar usulan pengadaan barang dan jasa yang siap dipaketkan dan diproses oleh PPBJ ({items.length} usulan).
            </p>
          </div>

          <div className="w-full md:w-72">
            <SearchBar
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Cari nomor surat atau judul..."
              className="!min-h-[40px] text-xs"
            />
          </div>
        </div>

        {/* Table Section */}
        <section aria-label="Tabel Permohonan Pengadaan">
          <PermohonanTable items={items} isLoading={isLoading} />
        </section>
      </div>
    </AppLayout>
  );
};

export default PermohonanIndexTemplate;
