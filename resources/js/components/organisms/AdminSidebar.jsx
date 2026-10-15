import { LayoutGrid, Users, Building, Layers } from 'lucide-react';
import DashboardSidebar from './DashboardSidebar';

export const adminNavItems = [
    {
        key: 'admin.dashboard',
        label: 'Dashboard',
        icon: LayoutGrid,
        href: '/admin/dashboard',
    },
    {
        key: 'admin.users',
        label: 'Pengguna',
        icon: Users,
        href: '#pengguna',
    },
    {
        key: 'admin.units',
        label: 'Unit Kerja',
        icon: Building,
        href: '#unit-kerja',
    },
    {
        key: 'admin.mak',
        label: 'Master MAK',
        icon: Layers,
        href: '#master-mak',
    },
];

export const adminSidebarPreset = {
    navItems: adminNavItems,
    brandSubtitle: 'Panel Administrator',
    sectionTitle: 'Manajemen Sistem',
    navAriaLabel: 'Navigasi admin',
    drawerAriaLabel: 'Menu navigasi admin',
};

export default function AdminSidebar({
    mobileOpen = false,
    onClose,
    activeRoute = 'admin.dashboard',
}) {
    return (
        <DashboardSidebar
            {...adminSidebarPreset}
            activeRoute={activeRoute}
            mobileOpen={mobileOpen}
            onClose={onClose}
        />
    );
}
