import type { FC, FormEvent } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  ShoppingCart,
} from 'lucide-react';
import DashboardShellTemplate from './DashboardShellTemplate';
import HeroBanner from '../organisms/HeroBanner';
import Bidang2PermohonanTable, {
  type Bidang2TableItem,
  type FilterStatusOption,
} from '../organisms/Bidang2PermohonanTable';
import type { ProfilePillUser } from '../molecules/ProfilePill';

const NAV_ITEMS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/bidang-2/dashboard',
  },
  {
    key: 'pengajuan',
    label: 'List Permohonan',
    icon: ClipboardList,
    href: '/bidang-2/pengajuan',
    badge: 4,
  },
  {
    key: 'pengadaan',
    label: 'List Pengadaan',
    icon: ShoppingCart,
    href: '/bidang-2/pengadaan',
  },
  {
    key: 'rkakl',
    label: 'Dokumen RKAKL',
    icon: FileText,
    href: '/bidang-2/rkakl',
  },
];

const BIDANG2_PENGADAAN_FILTER_OPTIONS: FilterStatusOption[] = [
  {
    key: 'review_pengajuan',
    label: 'Review Pengajuan',
    pillClass: 'bg-[#F3E8FF] text-[#6D28D9] border border-[#DDD6FE]',
    dotClass: 'bg-[#7C3AED]',
  },
  {
    key: 'disetujui',
    label: 'Disetujui',
    pillClass: 'bg-[#E8F5E9] text-[#0E7C5A] border border-[#C8E6C9]',
    dotClass: 'bg-[#0E7C5A]',
  },
  {
    key: 'selesai',
    label: 'Selesai',
    pillClass: 'bg-[#E8F5E9] text-[#0E7C5A] border border-[#C8E6C9]',
    dotClass: 'bg-[#0E7C5A]',
  },
];

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
  hasError,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  selectedStatuses = [],
  onApplyFilter,
  pagination,
  onPageChange,
  onViewDetail,
}) => {
  const sidebarProps = {
    navItems: NAV_ITEMS,
    activeRoute: 'pengadaan',
    brandSubtitle: 'Pengadaan Barang & Jasa',
    sectionTitle: 'Menu',
  };

  const topbarProps = {
    user,
  };

  return (
    <DashboardShellTemplate sidebarProps={sidebarProps} topbarProps={topbarProps}>
      <div className="space-y-6">
        <HeroBanner
          eyebrow="DAFTAR PENGADAAN"
          title="List Pengadaan"
          description="Pantau proses dan riwayat pengadaan barang & jasa untuk Bidang 2."
        />

        <Bidang2PermohonanTable
          isFullList
          variant="pengadaan"
          title="Daftar Pengadaan"
          subtitle="Seluruh riwayat proses pengadaan barang dan jasa"
          rows={items}
          totalCount={pagination.total}
          isLoading={isLoading}
          isError={hasError}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onSearchSubmit={onSearchSubmit}
          selectedStatuses={selectedStatuses}
          onApplyFilter={onApplyFilter}
          filterOptions={BIDANG2_PENGADAAN_FILTER_OPTIONS}
          pagination={pagination}
          onPageChange={onPageChange}
          onDetail={(item) => onViewDetail(item.id)}
        />
      </div>
    </DashboardShellTemplate>
  );
};

export default Bidang2PengadaanIndexTemplate;

