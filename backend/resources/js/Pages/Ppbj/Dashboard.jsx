import { Head, usePage } from '@inertiajs/react';
import usePpbjDashboard from '../../hooks/usePpbjDashboard';
import PpbjDashboardTemplate from '../../components/templates/PpbjDashboardTemplate';

export default function Dashboard({
    stats = [],
    permohonanMasuk = [],
    pengadaanBerjalan = [],
    terminKontrak = [],
}) {
    const { auth } = usePage().props;

    const {
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        filteredItems,
    } = usePpbjDashboard({
        permohonanMasuk,
        pengadaanBerjalan,
        terminKontrak,
        stats,
    });

    const counts = {
        permohonan: permohonanMasuk.length,
        pengadaan: pengadaanBerjalan.length,
        termin: terminKontrak.length,
    };

    return (
        <>
            <Head title="Dashboard PPBJ - SIPBAJA" />
            <PpbjDashboardTemplate
                user={auth?.user}
                stats={stats}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                items={filteredItems}
                counts={counts}
            />
        </>
    );
}
