import {
    LayoutDashboard,
    FileText,
    Package,
    CreditCard,
    Plus,
    ClipboardList
} from 'lucide-react';
import DashboardShellTemplate from './DashboardShellTemplate';
import StatCard from '../molecules/StatCard';
import PpbjTabbedTable from '../molecules/PpbjTabbedTable';

export default function PpbjDashboardTemplate({
    user = {},
    stats = [],
    activeTab = 'permohonan',
    onTabChange,
    searchQuery = '',
    onSearchChange,
    items = [],
    counts = { permohonan: 0, pengadaan: 0, termin: 0 },
}) {
    const displayName = user?.nama || user?.name || 'Petugas PPBJ';

    const statConfig = [
        {
            icon: FileText,
            label: stats[0]?.label || 'Permohonan Masuk',
            value: stats[0]?.value ?? 0,
            unit: stats[0]?.unit || 'Permohonan',
            iconBg: 'bg-[#E8F0FF]',
            iconColor: 'text-[#1F55C7]',
        },
        {
            icon: Package,
            label: stats[1]?.label || 'Pengadaan Berjalan',
            value: stats[1]?.value ?? 0,
            unit: stats[1]?.unit || 'Paket',
            iconBg: 'bg-[#FEF6EE]',
            iconColor: 'text-[#B54708]',
        },
        {
            icon: CreditCard,
            label: stats[2]?.label || 'Termin Siap Bayar',
            value: stats[2]?.value ?? 0,
            unit: stats[2]?.unit || 'Termin',
            iconBg: 'bg-[#E4F6EC]',
            iconColor: 'text-[#0B7A4E]',
        },
    ];

    const navItems = [
        {
            key: 'dashboard',
            label: 'Dashboard',
            href: '/ppbj/dashboard',
            icon: LayoutDashboard,
        },
        {
            key: 'pengajuan',
            label: 'Pengajuan',
            href: '/ppbj/permohonan',
            icon: ClipboardList
        },
    ];

    return (
        <DashboardShellTemplate
            sidebarProps={{
                navItems,
                activeRoute: 'dashboard',
                brandSubtitle: 'Pengadaan Barang & Jasa',
                sectionTitle: 'MENU UTAMA',
            }}
            topbarProps={{
                user,
                showSearch: false,
            }}
        >
            {/* Hero Banner */}
            <section
                className="relative overflow-hidden bg-[#0E7C5A] text-white rounded-[24px] p-7 md:py-8 md:px-9 min-h-[148px] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_10px_24px_rgba(13,51,38,0.14)]"
                aria-labelledby="hero-ppbj-title"
            >
                {/* Decorative circles */}
                <div
                    className="absolute -right-16 -top-16 w-[260px] h-[260px] rounded-full bg-white/[0.08] pointer-events-none hidden sm:block"
                    aria-hidden="true"
                />
                <div
                    className="absolute right-24 -bottom-20 w-[170px] h-[170px] rounded-full bg-white/[0.07] pointer-events-none hidden sm:block"
                    aria-hidden="true"
                />

                <div className="relative z-10 max-w-2xl">
                    <p className="text-[12px] font-semibold tracking-[0.14em] text-white/75 uppercase mb-1.5">
                        DASHBOARD PPBJ
                    </p>
                    <h1
                        id="hero-ppbj-title"
                        className="text-2xl md:text-[26px] font-bold leading-tight tracking-tight text-white mb-2"
                    >
                        Selamat datang, {displayName}
                    </h1>
                    <p className="text-xs md:text-sm text-white/85 leading-relaxed">
                        Kelola pemaketan permohonan, penugasan PPK, penerbitan kontrak, serta pemantauan termin pembayaran.
                    </p>
                </div>
            </section>

            {/* Stat Cards Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-5" aria-label="Ringkasan Statistik">
                {statConfig.map((item, index) => (
                    <StatCard
                        key={index}
                        icon={item.icon}
                        label={item.label}
                        value={item.value}
                        unit={item.unit}
                        iconBg={item.iconBg}
                        iconColor={item.iconColor}
                    />
                ))}
            </section>

            {/* Tabbed Table Section */}
            <section aria-label="Daftar Data Pengadaan">
                <PpbjTabbedTable
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                    searchQuery={searchQuery}
                    onSearchChange={onSearchChange}
                    items={items}
                    counts={counts}
                />
            </section>
        </DashboardShellTemplate>
    );
}
