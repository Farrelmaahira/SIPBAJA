import { Head } from '@inertiajs/react';
import useBidang2Dashboard from '../../hooks/useBidang2Dashboard';
import Bidang2DashboardTemplate from '../../components/templates/Bidang2DashboardTemplate';

export default function Dashboard({
    auth,
    ringkasan,
    riwayatTerbaru,
    statistikBulanan,
    totalDisetujui,
    totalDitolak,
    tahunAktif,
}) {
    const {
        ringkasan: ringkasanData,
        riwayatTerbaru: riwayatData,
        chartData,
        totalDisetujui: statDisetujui,
        totalDitolak: statDitolak,
        tahunAktif: activeYear,
        viewMode,
        setViewMode,
        gantiTahun,
        selectedPermohonan,
        setSelectedPermohonan,
    } = useBidang2Dashboard({
        ringkasan,
        riwayatTerbaru,
        statistikBulanan,
        totalDisetujui,
        totalDitolak,
        tahunAktif,
    });

    return (
        <>
            <Head title="Dashboard Bidang 2 - SIPBAJA" />
            <Bidang2DashboardTemplate
                user={auth?.user}
                ringkasan={ringkasanData}
                riwayatTerbaru={riwayatData}
                chartData={chartData}
                totalDisetujui={statDisetujui}
                totalDitolak={statDitolak}
                tahunAktif={activeYear}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                gantiTahun={gantiTahun}
                selectedPermohonan={selectedPermohonan}
                onSelectPermohonan={setSelectedPermohonan}
                onCloseDetail={() => setSelectedPermohonan(null)}
            />
        </>
    );
}
