import type { AppNavItem } from "@/components/organisms/AppSidebar";
import { LayoutGrid, ShoppingCart } from 'lucide-react';

export const PP_NAV_ITEMS: AppNavItem[] = [
    {
        key: 'dashboard',
        label: 'Dashboard',
        href: '/pp/dashboard',
        icon: LayoutGrid,
    },
    {
        key: 'pengadaan',
        label: 'List Pengadaan',
        href: '/pp/pengadaan',
        icon: ShoppingCart,
    },
];