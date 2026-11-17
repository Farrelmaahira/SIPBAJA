import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  FileText,
  Package,
  ClipboardList,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import AppLayout from './AppLayout';
import HeroBanner from '../organisms/HeroBanner';
import StatCard from '../molecules/StatCard';
import PpbjTabbedTable, {
  type PpbjTabKey,
  type PpbjTabbedTableCounts,
} from '../molecules/PpbjTabbedTable';
import type { PpbjStatItem, PpbjDashboardItem } from '../../types/ppbj';
import type { AppTopbarUser } from '../organisms/AppTopbar';

export const PPBJ_NAV_ITEMS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: LayoutGrid,
    href: '/ppbj/dashboard',
    badge: null,
  },
  {
    key: 'permohonan',
    label: 'List Permohonan',
    icon: ClipboardList,
    href: '/ppbj/permohonan',
    badge: null,
  },
];

export interface PpbjDashboardTemplateProps {
  user?: AppTopbarUser | null;
  stats?: PpbjStatItem[];
  activeTab?: PpbjTabKey;
  onTabChange?: (tab: PpbjTabKey) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  items?: PpbjDashboardItem[];
  counts?: PpbjTabbedTableCounts;
  isLoading?: boolean;
}

export const PpbjDashboardTemplate: FC<PpbjDashboardTemplateProps> = ({
  user = null,
  stats = [],
  activeTab = 'permohonan',
  onTabChange,
  searchQuery = '',
  onSearchChange,
  items = [],
  counts = { permohonan: 0, pengadaan: 0, termin: 0 },
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const displayName = user?.nama || user?.name || 'Petugas PPBJ';

  const statIcons = [FileText, Package, CheckCircle2, XCircle];
  const statBgColors = ['bg-[#E8F0FF]', 'bg-[#FEF6EE]', 'bg-[#E4F6EC]', 'bg-[#FEE4E2]'];
  const statTextColors = ['text-[#1F55C7]', 'text-[#B54708]', 'text-[#0B7A4E]', 'text-[#D92D20]'];

  return (
    <AppLayout
      activeRoute="dashboard"
      navItems={PPBJ_NAV_ITEMS}
      roleInitials="PB"
      roleTitle="PPBJ"
      roleSubtitle="Pengadaan Barang & Jasa"
      user={user}
      breadcrumb={[
        { label: 'DASHBOARD', href: '/ppbj/dashboard' },
        { label: 'RINGKASAN' },
      ]}
    >
      <div className="space-y-6">
        {/* Hero Banner Organism */}
        <HeroBanner
          eyebrow="DASHBOARD"
          title={`Selamat datang, ${displayName}`}
          description="Pantau, verifikasi, dan kelola seluruh permohonan pengadaan yang masuk dalam satu tempat."
          ctaLabel="Lihat Pengajuan"
          ctaVariant="translucent"
          onCta={() => navigate('/ppbj/permohonan')}
        />

        {/* Stat Cards Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" aria-label="Ringkasan Statistik">
          {stats.slice(0, 4).map((item, index) => (
            <StatCard
              key={index}
              icon={statIcons[index] || FileText}
              label={item.label}
              value={item.value}
              unit={item.unit}
              iconBg={statBgColors[index] || 'bg-[#E8F0FF]'}
              iconColor={statTextColors[index] || 'text-[#1F55C7]'}
            />
          ))}
        </section>

        {/* Tabbed Table Section */}
        <section aria-label="Daftar Data Pengadaan">
          <PpbjTabbedTable
            activeTab={activeTab}
            onTabChange={onTabChange}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            items={items}
            counts={counts}
            isLoading={isLoading}
          />
        </section>
      </div>
    </AppLayout>
  );
};

export default PpbjDashboardTemplate;
