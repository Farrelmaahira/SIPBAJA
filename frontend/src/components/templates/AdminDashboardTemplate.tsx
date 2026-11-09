import type { FC } from 'react';
import AppLayout from './AppLayout';
import HeroBanner from '../organisms/HeroBanner';
import RecentUsersTable, { type RecentUserItem } from '../organisms/RecentUsersTable';
import StatCard from '../molecules/StatCard';
import { Users, Building, Layers } from 'lucide-react';
import { ADMIN_NAV_ITEMS } from '../../constants/adminNav';
import type { AdminStatItem } from '../../types/admin';

export interface AdminDashboardTemplateProps {
  stats?: AdminStatItem[];
  recentUsers?: RecentUserItem[];
  userName?: string;
  isLoading?: boolean;
  onAddUser?: () => void;
  onViewUser?: (user: RecentUserItem) => void;
  onViewAllUsers?: () => void;
}

function StatSkeleton() {
  return (
    <div
      className="p-6 bg-white border border-[#E4EBE8] rounded-[18px] animate-pulse"
      aria-hidden="true"
    >
      <div className="w-14 h-14 rounded-2xl bg-[#EEF5F2]" />
      <div className="mt-4 h-4 w-24 rounded bg-[#EEF5F2]" />
      <div className="mt-2 h-8 w-16 rounded bg-[#EEF5F2]" />
    </div>
  );
}

export const AdminDashboardTemplate: FC<AdminDashboardTemplateProps> = ({
  stats = [],
  recentUsers = [],
  userName = 'Administrator',
  isLoading = false,
  onAddUser,
  onViewUser,
  onViewAllUsers,
}) => {
  const statIcons = [
    { icon: Users, iconBg: 'bg-[#E4F6EC]', iconColor: 'text-[#0E7C5A]' },
    { icon: Building, iconBg: 'bg-[#E8F0FF]', iconColor: 'text-[#1F55C7]' },
    { icon: Layers, iconBg: 'bg-[#EEF5F2]', iconColor: 'text-[#0E7C5A]' },
  ];

  return (
    <AppLayout
      activeRoute="dashboard"
      navItems={ADMIN_NAV_ITEMS}
      roleInitials="AD"
      roleTitle="Administrator"
      roleSubtitle="Panel Admin"
      profileHref="/admin/pengguna"
      notifikasiHref="/admin/dashboard"
    >
      <div className="space-y-6">
        <HeroBanner userName={userName} onAddUser={onAddUser} />

        <section
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          aria-label="Statistik sistem"
          aria-busy={isLoading || undefined}
        >
          {isLoading
            ? [1, 2, 3].map((i) => <StatSkeleton key={i} />)
            : stats.map((stat, idx) => {
                const config = statIcons[idx % statIcons.length];
                return (
                  <StatCard
                    key={stat.label}
                    icon={config.icon}
                    value={stat.value}
                    label={stat.label}
                    unit={stat.unit}
                    iconBg={config.iconBg}
                    iconColor={config.iconColor}
                  />
                );
              })}
        </section>

        <RecentUsersTable
          users={recentUsers}
          onViewUser={onViewUser}
          onViewAll={onViewAllUsers}
        />
      </div>
    </AppLayout>
  );
};

export default AdminDashboardTemplate;
