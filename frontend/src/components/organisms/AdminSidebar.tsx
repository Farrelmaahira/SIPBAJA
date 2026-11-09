import type { FC } from 'react';
import { LayoutGrid, Users, Building, Layers, ShieldCheck, KeyRound } from 'lucide-react';
import DashboardSidebar, { type DashboardNavItem, type DashboardSidebarProps } from './DashboardSidebar';

export const adminNavItems: DashboardNavItem[] = [
  {
    key: 'admin.dashboard',
    label: 'Dashboard',
    icon: LayoutGrid,
    href: '/admin/dashboard',
  },
  {
    key: 'admin.pengguna.index',
    label: 'Pengguna',
    icon: Users,
    href: '/admin/pengguna',
  },
  {
    key: 'admin.unit-kerja.index',
    label: 'Unit Kerja',
    icon: Building,
    href: '/admin/unit-kerja',
  },
  {
    key: 'admin.mak.index',
    label: 'Master MAK',
    icon: Layers,
    href: '/admin/mak',
  },
  {
    key: 'admin.role.index',
    label: 'Peran',
    icon: ShieldCheck,
    href: '/admin/role',
  },
  {
    key: 'admin.role-permission.index',
    label: 'Hak Akses',
    icon: KeyRound,
    href: '/admin/role-permission',
  },
];

export const adminSidebarPreset: Partial<DashboardSidebarProps> = {
  navItems: adminNavItems,
  brandSubtitle: 'Panel Administrator',
  sectionTitle: 'Manajemen Sistem',
  navAriaLabel: 'Navigasi admin',
  drawerAriaLabel: 'Menu navigasi admin',
};

export interface AdminSidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
  activeRoute?: string;
}

export const AdminSidebar: FC<AdminSidebarProps> = ({
  mobileOpen = false,
  onClose,
  activeRoute = 'admin.dashboard',
}) => {
  return (
    <DashboardSidebar
      {...adminSidebarPreset}
      activeRoute={activeRoute}
      mobileOpen={mobileOpen}
      onClose={onClose}
    />
  );
};

export default AdminSidebar;
