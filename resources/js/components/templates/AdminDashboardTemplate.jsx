import { useState } from 'react';
import DashboardShellTemplate from './DashboardShellTemplate';
import { adminSidebarPreset } from '../organisms/AdminSidebar';
import { adminTopbarPreset } from '../organisms/AdminTopbar';
import HeroBanner from '../organisms/HeroBanner';
import RecentUsersTable from '../organisms/RecentUsersTable';
import StatCard from '../molecules/StatCard';
import { Users, Building, Layers } from 'lucide-react';

export default function AdminDashboardTemplate({
    stats = {},
    recentUsers = [],
    user = {},
    activeRoute = 'admin.dashboard',
    onAddUser,
    onViewUser,
    onViewAllUsers,
}) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredUsers = recentUsers.filter((u) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            (u.nama && u.nama.toLowerCase().includes(q)) ||
            (u.email && u.email.toLowerCase().includes(q)) ||
            (u.unit && u.unit.toLowerCase().includes(q)) ||
            (u.role && u.role.toLowerCase().includes(q))
        );
    });

    const totalPengguna = stats.totalPengguna ?? stats.total_pengguna ?? 128;
    const totalUnit = stats.totalUnit ?? stats.total_unit ?? 24;
    const totalMak = stats.totalMak ?? stats.total_mak ?? 86;

    return (
        <DashboardShellTemplate
            sidebarProps={{ ...adminSidebarPreset, activeRoute }}
            topbarProps={{
                ...adminTopbarPreset,
                user,
                searchValue: searchQuery,
                onSearchChange: (e) => setSearchQuery(e.target.value),
            }}
        >
            <HeroBanner
                userName={user?.nama || user?.name || 'Administrator'}
                onAddUser={onAddUser}
            />

            <section
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                aria-label="Statistik sistem"
            >
                <StatCard
                    icon={Users}
                    value={totalPengguna}
                    label="Total Pengguna"
                    unit="akun"
                    iconBg="bg-[#E4F6EC]"
                    iconColor="text-[#0E7C5A]"
                />
                <StatCard
                    icon={Building}
                    value={totalUnit}
                    label="Unit Kerja Terdaftar"
                    unit="unit"
                    iconBg="bg-[#E8F0FF]"
                    iconColor="text-[#1F55C7]"
                />
                <StatCard
                    icon={Layers}
                    value={totalMak}
                    label="Kode Anggaran MAK"
                    unit="kode"
                    iconBg="bg-[#EEF5F2]"
                    iconColor="text-[#0E7C5A]"
                />
            </section>

            <RecentUsersTable
                users={filteredUsers}
                onViewUser={onViewUser}
                onViewAll={onViewAllUsers}
            />
        </DashboardShellTemplate>
    );
}
