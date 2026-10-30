import { LayoutDashboard, ClipboardList, ArrowLeft } from 'lucide-react';
import DashboardShellTemplate from './DashboardShellTemplate';
import HeroBanner from '../organisms/HeroBanner';
import PermohonanFormCard from '../organisms/PermohonanFormCard';
import AlurPermohonanCard from '../organisms/AlurPermohonanCard';
import PanduanPengajuanCard from '../organisms/PanduanPengajuanCard';

const NAV_ITEMS = [
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

export default function PermohonanCreateTemplate({
    user,
    data,
    setData,
    errors,
    processing,
    onSubmit,
    onKembali,
}) {
    const sidebarProps = {
        navItems: NAV_ITEMS,
        activeRoute: 'permohonan',
        brandSubtitle: 'Pengadaan Barang & Jasa',
        sectionTitle: 'Menu',
    };

    const topbarProps = {
        user,
    };

    return (
        <DashboardShellTemplate sidebarProps={sidebarProps} topbarProps={topbarProps}>
            {/* Hero Banner Form Pengajuan */}
            <HeroBanner
                eyebrow="PERMOHONAN BARU"
                title="Buat Permohonan Pengadaan"
                description="Lengkapi data berikut untuk membuat permohonan pengadaan."
                ctaLabel="Kembali"
                ctaIcon={ArrowLeft}
                ctaVariant="translucent"
                onCta={onKembali}
            />

            {/* Layout Grid 2 Kolom Form & Panduan */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2">
                    <PermohonanFormCard
                        data={data}
                        setData={setData}
                        errors={errors}
                        processing={processing}
                        onSubmit={onSubmit}
                    />
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <AlurPermohonanCard />
                    <PanduanPengajuanCard />
                </div>
            </div>
        </DashboardShellTemplate>
    );
}
