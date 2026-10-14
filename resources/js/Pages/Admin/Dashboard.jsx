import { Head, usePage } from '@inertiajs/react';
import AdminDashboardTemplate from '../../components/templates/AdminDashboardTemplate';

export default function Dashboard() {
    const { auth, stats, recentUsers } = usePage().props;

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
                stats={stats}
                recentUsers={recentUsers}
                user={auth?.user}
                activeRoute="admin.dashboard"
                onAddUser={handleAddUser}
                onViewUser={handleViewUser}
                onViewAllUsers={handleViewAllUsers}
            />
        </>
    );
}
