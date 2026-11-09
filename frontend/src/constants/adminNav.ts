import { LayoutGrid, Users, Building, Layers, ShieldCheck, KeyRound } from 'lucide-react';
import type { AppNavItem } from '../components/organisms/AppSidebar';

export const ADMIN_NAV_ITEMS: AppNavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: LayoutGrid,
    href: '/admin/dashboard',
  },
  {
    key: 'pengguna',
    label: 'Pengguna',
    icon: Users,
    href: '/admin/pengguna',
  },
  {
    key: 'unit-kerja',
    label: 'Unit Kerja',
    icon: Building,
    href: '/admin/unit-kerja',
  },
  {
    key: 'mak',
    label: 'Master MAK',
    icon: Layers,
    href: '/admin/mak',
  },
  {
    key: 'role',
    label: 'Peran',
    icon: ShieldCheck,
    href: '/admin/role',
  },
  {
    key: 'role-permission',
    label: 'Hak Akses',
    icon: KeyRound,
    href: '/admin/role-permission',
  },
];

