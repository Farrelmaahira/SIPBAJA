import { Head, usePage } from '@inertiajs/react';
import AdminDashboardTemplate from '../../components/templates/AdminDashboardTemplate';
import useUserSearch from '../../hooks/useUserSearch';
import normalizeAdminStats from '../../utils/normalizeAdminStats';

export default function Dashboard() {
    const { auth, stats, recentUsers, isLoading } = usePage().props;

    const { query, setQuery, filteredUsers } = useUserSearch(recentUsers ?? []);

    const handleAddUser = () => {
        // Navigasi atau modal tambah pengguna
    };

    const handleViewUser = (user) => {
        // Modal atau navigasi detail pengguna
    };

    const handleViewAllUsers = () => {
        // Navigasi ke daftar seluruh pengguna
    };

    return (
        <>
            <Head title="Dashboard Administrator - SIPBAJA" />
            <AdminDashboardTemplate
                stats={normalizeAdminStats(stats)}
                filteredUsers={filteredUsers}
                user={auth?.user}
                activeRoute="admin.dashboard"
                searchQuery={query}
                onSearchChange={(e) => setQuery(e.target.value)}
                isLoading={isLoading ?? false}
                onAddUser={handleAddUser}
                onViewUser={handleViewUser}
                onViewAllUsers={handleViewAllUsers}
            />
        </>
    );
}
