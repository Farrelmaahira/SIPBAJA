import type { FC } from 'react';
import { LayoutDashboard, ClipboardList } from 'lucide-react';
import DashboardShellTemplate from './DashboardShellTemplate';
import PermohonanTable, { type PermohonanTableItem } from '../molecules/PermohonanTable';
import type { ProfilePillUser } from '../molecules/ProfilePill';

export interface PermohonanIndexTemplateProps {
  user?: ProfilePillUser | null;
  items?: PermohonanTableItem[];
}

export const PermohonanIndexTemplate: FC<PermohonanIndexTemplateProps> = ({
  user = {},
  items = [],
}) => {
  const navItems = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      href: '/ppbj/dashboard',
      icon: LayoutDashboard,
    },
    {
      key: 'pengajuan',
      label: 'Pengajuan',
      href: '/ppbj/permohonan',
      icon: ClipboardList,
    },
  ];

  return (
    <DashboardShellTemplate
      sidebarProps={{
        navItems,
        activeRoute: 'pengajuan',
        brandSubtitle: 'Pengadaan Barang & Jasa',
        sectionTitle: 'MENU UTAMA',
      }}
      topbarProps={{
        user,
        showSearch: false,
      }}
    >
      {/* Page Header */}
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-[#14201C]">
          Daftar Permohonan Pengadaan
        </h1>
        <p className="text-sm text-[#5F6F6A]">
          Daftar seluruh usulan pengadaan barang dan jasa yang diajukan oleh unit kerja di lingkungan Politeknik Negeri Jakarta.
        </p>
      </header>

      {/* Table Section */}
      <section aria-label="Tabel Permohonan Pengadaan">
        <PermohonanTable items={items} />
      </section>
    </DashboardShellTemplate>
  );
};

export default PermohonanIndexTemplate;
