import { LayoutGrid, ClipboardList, ShoppingCart } from 'lucide-react';
import type { AppNavItem } from '../components/organisms/AppSidebar';

export const PPBJ_NAV_ITEMS: AppNavItem[] = [
    {
        key: 'dashboard',
        label: 'Dashboard',
        icon: LayoutGrid,
        href: '/ppbj/dashboard',
    },
    {
        key: 'permohonan',
        label: 'List Permohonan',
        icon: ClipboardList,
        href: '/ppbj/permohonan',
    },
    {
        key: 'pengadaan',
        label: 'List Pengadaan',
        icon: ShoppingCart,
        href: '/ppbj/pengadaan',
    },
];

