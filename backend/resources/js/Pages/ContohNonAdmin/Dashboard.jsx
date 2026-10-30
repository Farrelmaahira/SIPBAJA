import { Head } from '@inertiajs/react';
import { LayoutGrid, FileText } from 'lucide-react';
import DashboardShellTemplate from '../../components/templates/DashboardShellTemplate';

const unitNavItems = [
    {
        key: 'unit.dashboard',
        label: 'Dashboard',
        icon: LayoutGrid,
        href: '/unit/dashboard',
    },
    {
        key: 'unit.permohonan',
        label: 'Permohonan Saya',
        icon: FileText,
        href: '#permohonan',
    },
];

export default function Dashboard() {
    return (
        <>
            <Head title="Dashboard Unit - SIPBAJA" />
            <DashboardShellTemplate
                sidebarProps={{
                    navItems: unitNavItems,
                    activeRoute: 'unit.dashboard',
                    brandSubtitle: 'Panel Unit Kerja',
                    sectionTitle: 'Permohonan Saya',
                    navAriaLabel: 'Navigasi unit',
                    drawerAriaLabel: 'Menu navigasi unit',
                }}
                topbarProps={{
                    searchPlaceholder: 'Cari permohonan...',
                    searchId: 'unit-search-input',
                    notificationAriaLabel: 'Notifikasi unit',
                }}
            >
                <section className="rounded-2xl bg-white border border-[#E4EBE8] p-6">
                    <h1 className="text-lg font-bold text-[#14201C]">
                        Contoh scaffold non-admin
                    </h1>
                    <p className="mt-1 text-sm text-[#5F6F6A]">
                        Halaman ini membuktikan shell dipakai role lain tanpa
                        menyentuh organism. Ganti dengan halaman role sungguhan
                        saat implementasi.
                    </p>
                </section>
            </DashboardShellTemplate>
        </>
    );
}
