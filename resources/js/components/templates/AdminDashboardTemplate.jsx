import DashboardShellTemplate from './DashboardShellTemplate';
import { adminSidebarPreset } from '../organisms/AdminSidebar';
import { adminTopbarPreset } from '../organisms/AdminTopbar';
import HeroBanner from '../organisms/HeroBanner';
import RecentUsersTable from '../organisms/RecentUsersTable';
import StatCard from '../molecules/StatCard';
import { Users, Building, Layers } from 'lucide-react';

const statCards = [
    {
        key: 'totalPengguna',
        icon: Users,
        label: 'Total Pengguna',
        unit: 'akun',
        iconBg: 'bg-[#E4F6EC]',
        iconColor: 'text-[#0E7C5A]',
    },
    {
        key: 'totalUnit',
        icon: Building,
        label: 'Unit Kerja Terdaftar',
        unit: 'unit',
        iconBg: 'bg-[#E8F0FF]',
        iconColor: 'text-[#1F55C7]',
    },
    {
        key: 'totalMak',
        icon: Layers,
        label: 'Kode Anggaran MAK',
        unit: 'kode',
        iconBg: 'bg-[#EEF5F2]',
        iconColor: 'text-[#0E7C5A]',
    },
];

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

export default function AdminDashboardTemplate({
    stats = { totalPengguna: 0, totalUnit: 0, totalMak: 0 },
    filteredUsers = [],
    user = {},
    activeRoute = 'admin.dashboard',
    searchQuery = '',
    onSearchChange,
    isLoading = false,
    onAddUser,
    onViewUser,
    onViewAllUsers,
}) {
    return (
        <DashboardShellTemplate
            sidebarProps={{ ...adminSidebarPreset, activeRoute }}
            topbarProps={{
                ...adminTopbarPreset,
                user,
                searchValue: searchQuery,
                onSearchChange,
            }}
        >
            <HeroBanner
                userName={user?.nama || user?.name || 'Administrator'}
                onAddUser={onAddUser}
            />

            <section
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                aria-label="Statistik sistem"
                aria-busy={isLoading || undefined}
            >
                {isLoading
                    ? statCards.map((card) => <StatSkeleton key={card.key} />)
                    : statCards.map((card) => (
                          <StatCard
                              key={card.key}
                              icon={card.icon}
                              value={stats[card.key] ?? 0}
                              label={card.label}
                              unit={card.unit}
                              iconBg={card.iconBg}
                              iconColor={card.iconColor}
                          />
                      ))}
            </section>

            <RecentUsersTable
                users={filteredUsers}
                onViewUser={onViewUser}
                onViewAll={onViewAllUsers}
            />
        </DashboardShellTemplate>
    );
}
