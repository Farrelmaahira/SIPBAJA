import { useState } from 'react';
import AdminSidebar from '../organisms/AdminSidebar';
import AdminTopbar from '../organisms/AdminTopbar';
import HeroBanner from '../organisms/HeroBanner';
import RecentUsersTable from '../organisms/RecentUsersTable';
import StatCard from '../molecules/StatCard';
import UsersIcon from '../atoms/icons/UsersIcon';
import BuildingIcon from '../atoms/icons/BuildingIcon';
import LayersIcon from '../atoms/icons/LayersIcon';

export default function AdminDashboardTemplate({
    stats = {},
    recentUsers = [],
    user = {},
    activeRoute = 'admin.dashboard',
    onAddUser,
    onViewUser,
    onViewAllUsers,
}) {
    const [mobileOpen, setMobileOpen] = useState(false);
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
        <div className="min-h-screen flex bg-[#F3F6F5] text-[#14201C] font-sans antialiased">
            {/* Sidebar */}
            <AdminSidebar
                mobileOpen={mobileOpen}
                onClose={() => setMobileOpen(false)}
                activeRoute={activeRoute}
            />

            {/* Main Area */}
            <div className="flex-1 min-w-0 flex flex-col min-h-screen">
                <main className="flex-1 p-5 md:py-7 md:px-10 max-w-7xl w-full mx-auto flex flex-col gap-7">
                    {/* Topbar */}
                    <AdminTopbar
                        onMenuClick={() => setMobileOpen(true)}
                        user={user}
                        searchValue={searchQuery}
                        onSearchChange={(e) => setSearchQuery(e.target.value)}
                    />

                    {/* Hero Banner */}
                    <HeroBanner
                        userName={user?.nama || user?.name || 'Administrator'}
                        onAddUser={onAddUser}
                    />

                    {/* Stats Grid: 3 columns */}
                    <section
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                        aria-label="Statistik sistem"
                    >
                        <StatCard
                            icon={UsersIcon}
                            value={totalPengguna}
                            label="Total Pengguna"
                            unit="akun"
                            iconBg="bg-[#E4F6EC]"
                            iconColor="text-[#0E7C5A]"
                        />
                        <StatCard
                            icon={BuildingIcon}
                            value={totalUnit}
                            label="Unit Kerja Terdaftar"
                            unit="unit"
                            iconBg="bg-[#E8F0FF]"
                            iconColor="text-[#1F55C7]"
                        />
                        <StatCard
                            icon={LayersIcon}
                            value={totalMak}
                            label="Kode Anggaran MAK"
                            unit="kode"
                            iconBg="bg-[#EEF5F2]"
                            iconColor="text-[#0E7C5A]"
                        />
                    </section>

                    {/* Recent Users Table */}
                    <RecentUsersTable
                        users={filteredUsers}
                        onViewUser={onViewUser}
                        onViewAll={onViewAllUsers}
                    />
                </main>
            </div>
        </div>
    );
}
