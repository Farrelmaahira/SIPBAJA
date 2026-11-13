import type { FC, FormEvent } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  ShoppingCart,
} from 'lucide-react';
import DashboardShellTemplate from './DashboardShellTemplate';
import HeroBanner from '../organisms/HeroBanner';
import Bidang2PermohonanTable from '../organisms/Bidang2PermohonanTable';
import FilterPengajuanModal, {
  type FilterStatusOption,
} from '../organisms/FilterPengajuanModal';
import type { Bidang2PengajuanListItem } from '../../types/bidang2';
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
  hasError,
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
  const sidebarProps = {
    navItems: NAV_ITEMS,
    activeRoute: 'pengajuan',
    brandSubtitle: 'Pengadaan Barang & Jasa',
    sectionTitle: 'Menu',
  };

  const topbarProps = {
    user,
  };

  return (
    <DashboardShellTemplate sidebarProps={sidebarProps} topbarProps={topbarProps}>
      <div className="space-y-6">
        {/* Hero Banner sesuai mockup bidang2_list_permohonan.png */}
        <HeroBanner
          eyebrow="DAFTAR PERMOHONAN"
          title="List Permohonan"
          description="Pantau dan review permohonan serta pengajuan yang masuk ke Bidang 2."
        />

        {/* Tabel Organism Bidang2PermohonanTable dalam mode Full List */}
        <Bidang2PermohonanTable
          isFullList
          variant="permohonan"
          title="Daftar Permohonan"
          subtitle="Permohonan dan pengajuan yang perlu direview Bidang 2"
          rows={items}
          totalCount={pagination.total}
          isLoading={isLoading}
          isError={hasError}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onSearchSubmit={onSearchSubmit}
          onOpenFilter={onOpenFilterModal}
          activeFilterCount={selectedStatuses.length}
          pagination={pagination}
          onPageChange={onPageChange}
          onDetail={(item) => onViewDetail(item.id)}
        />
      </div>

      {/* Modal Filter Pengajuan */}
      {onCloseFilterModal && onApplyFilter && (
        <FilterPengajuanModal
          isOpen={filterModalOpen}
          onClose={onCloseFilterModal}
          onApply={onApplyFilter}
          selectedStatuses={selectedStatuses}
          options={BIDANG2_FILTER_STATUS_OPTIONS}
        />
      )}
    </DashboardShellTemplate>
  );
};

export default Bidang2PengajuanIndexTemplate;
