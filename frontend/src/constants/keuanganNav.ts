import type { AppNavItem } from '@/components/organisms/AppSidebar';
import { LayoutGrid, ClipboardList } from 'lucide-react';

export const KEUANGAN_NAV_ITEMS: AppNavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    href: '/keuangan/dashboard',
    icon: LayoutGrid,
  },
  {
    key: 'pengadaan',
    label: 'List Pengadaan',
    href: '/keuangan/pengadaan',
    icon: ClipboardList,
  },
];

export default KEUANGAN_NAV_ITEMS;
