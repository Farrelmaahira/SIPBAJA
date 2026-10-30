import { LayoutDashboard, ClipboardList, FileText, CheckCircle, XCircle } from 'lucide-react';
import DashboardShellTemplate from './DashboardShellTemplate';
import HeroBanner from '../organisms/HeroBanner';
import StatCard from '../molecules/StatCard';
import StatistikChart from '../organisms/StatistikChart';
import PermohonanTable from '../organisms/PermohonanTable';

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

function StatSkeleton() {
    return (
        <div className="p-6 bg-white border border-[#E4EBE8] rounded-[18px] animate-pulse" aria-hidden="true">
            <div className="w-14 h-14 rounded-2xl bg-[#EEF5F2]" />
            <div className="mt-4 h-4 w-24 rounded bg-[#EEF5F2]" />
            <div className="mt-2 h-8 w-16 rounded bg-[#EEF5F2]" />
        </div>
    );
}

export default function PemohonDashboardTemplate({
    user,
    ringkasan,
    permohonanAktif,
    chartData,
    tahunAktif,
    gantiTahun,
    isLoading = false,
    isError = false,
    onBuatPermohonan,
}) {
    const tambahanLabel =
        ringkasan.tambahan_bulan_ini > 0 ? `+${ringkasan.tambahan_bulan_ini} bulan ini` : null;

    const statCards = [
        {
            key: 'total',
            icon: FileText,
            label: 'Total Permohonan',
            value: ringkasan.total,
            iconBg: 'bg-[#E4F6EC]',
            iconColor: 'text-[#0E7C5A]',
            badge: tambahanLabel ? { label: tambahanLabel, variant: 'success' } : null,
        },
        {
            key: 'menunggu',
            icon: ClipboardList,
            label: 'Menunggu Verifikasi',
            value: ringkasan.menunggu_verifikasi,
            iconBg: 'bg-[#E8F0FF]',
            iconColor: 'text-[#1F55C7]',
            badge: ringkasan.menunggu_verifikasi > 0 ? { label: 'Dalam antrean', variant: 'info' } : null,
        },
        {
            key: 'disetujui',
            icon: CheckCircle,
            label: 'Disetujui',
            value: ringkasan.disetujui,
            iconBg: 'bg-[#E4F6EC]',
            iconColor: 'text-[#0E7C5A]',
            badge: null,
        },
        {
            key: 'ditolak',
            icon: XCircle,
            label: 'Ditolak',
            value: ringkasan.ditolak,
            iconBg: 'bg-[#FDECEC]',
            iconColor: 'text-[#B42318]',
            badge: ringkasan.ditolak > 0 ? { label: 'Perlu revisi', variant: 'danger' } : null,
        },
    ];

    // Badge count sidebar: jumlah permohonan yang menunggu verifikasi
    const navItems = NAV_ITEMS.map((item) => {
        if (item.key === 'permohonan' && ringkasan.menunggu_verifikasi > 0) {
            return { ...item, badge: ringkasan.menunggu_verifikasi };
        }
        return item;
    });

    const sidebarProps = {
        navItems,
        activeRoute: 'dashboard',
        brandSubtitle: 'Pengadaan Barang & Jasa',
        sectionTitle: 'Menu',
    };

    const topbarProps = {
        user,
    };

    return (
        <DashboardShellTemplate sidebarProps={sidebarProps} topbarProps={topbarProps}>
            <HeroBanner
                eyebrow="Dashboard"
                title={`Selamat datang, ${user?.unit?.nama ?? user?.nama ?? 'Jurusan/Unit'}`}
                description="Pantau dan kelola seluruh permohonan pengadaan Anda dalam satu tempat."
                ctaLabel="Buat Permohonan"
                onCta={onBuatPermohonan}
            />

            <section
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
                aria-label="Ringkasan permohonan"
                aria-busy={isLoading || undefined}
            >
                {isLoading
                    ? statCards.map((c) => <StatSkeleton key={c.key} />)
                    : statCards.map((c) => (
                          <StatCard
                              key={c.key}
                              icon={c.icon}
                              label={c.label}
                              value={c.value}
                              iconBg={c.iconBg}
                              iconColor={c.iconColor}
                              badge={c.badge}
                          />
                      ))}
            </section>

            <StatistikChart
                chartData={chartData}
                tahunAktif={tahunAktif}
                gantiTahun={gantiTahun}
                isLoading={isLoading && !chartData}
            />

            <PermohonanTable
                rows={permohonanAktif}
                isLoading={isLoading}
                isError={isError}
                onBuatPermohonan={onBuatPermohonan}
            />
        </DashboardShellTemplate>
    );
}
