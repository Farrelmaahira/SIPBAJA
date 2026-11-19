import type { AppNavItem } from '@/components/organisms/AppSidebar';
import { LayoutGrid, ClipboardList } from 'lucide-react';

export const PERLENGKAPAN_NAV_ITEMS: AppNavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    href: '/perlengkapan/dashboard',
    icon: LayoutGrid,
  },
  {
    key: 'pengadaan',
    label: 'List Pengadaan',
    href: '/perlengkapan/pengadaan',
    icon: ClipboardList,
  },
];

export default PERLENGKAPAN_NAV_ITEMS;
