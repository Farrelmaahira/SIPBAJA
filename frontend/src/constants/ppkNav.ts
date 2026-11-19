import type { AppNavItem } from "@/components/organisms/AppSidebar";
import { FileText, LayoutGrid, ShoppingCart } from "lucide-react";

export const PPK_NAV_ITEMS: AppNavItem[] = [
    {
        key: 'dashboard',
        label: 'Dashboard',
        href: '/ppk/dashboard',
        icon: LayoutGrid,
    },
    {
        key: 'permohonan',
        label: 'List Permohonan',
        href: '/ppk/permohonan',
        icon: FileText,
    },
    {
        key: 'pengadaan',
        label: 'List Pengadaan',
        href: '/ppk/pengadaan',
        icon: ShoppingCart,
    },
];