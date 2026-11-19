import { FileSpreadsheet, FileText, LayoutGrid, Tag } from "lucide-react";

export const PERENCANAAN_NAV_ITEMS = [
    {
        key: 'dashboard',
        label: 'Dashboard',
        icon: LayoutGrid,
        href: '/perencanaan/dashboard',
        badge: null,
    },
    {
        key: 'pengajuan',
        label: 'List Permohonan',
        icon: FileText,
        href: '/perencanaan/permohonan',
        badge: null,
    },
    {
        key: 'mak',
        label: 'Jenis MAK',
        icon: Tag,
        href: '/perencanaan/jenis-mak',
        badge: null,
    },
    {
        key: 'rkakl',
        label: 'Dokumen RKAKL',
        icon: FileSpreadsheet,
        href: '/perencanaan/rkakl',
        badge: null,
    },
];