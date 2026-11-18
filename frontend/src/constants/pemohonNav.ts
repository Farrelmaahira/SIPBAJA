import { LayoutDashboard, ClipboardList } from 'lucide-react';
import type { AppNavItem } from '../components/organisms/AppSidebar';

export const PEMOHON_NAV_ITEMS: AppNavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/pemohon/dashboard',
  },
  {
    key: 'permohonan',
    label: 'List Permohonan',
    icon: ClipboardList,
    href: '/pemohon/permohonan',
  },
];
