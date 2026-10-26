import { Head } from '@inertiajs/react';
import usePemohonDashboard from '../../hooks/usePemohonDashboard';
import PemohonDashboardTemplate from '../../components/templates/PemohonDashboardTemplate';

export default function Dashboard({
    auth,
    ringkasan,
    permohonanAktif,
    statistikBulanan,
    tahunAktif,
}) {
    const {
        ringkasan: ringkasanData,
        permohonanAktif: listPermohonan,
        chartData,
        tahunAktif: activeYear,
        gantiTahun,
    } = usePemohonDashboard({
        ringkasan,
        permohonanAktif,
        statistikBulanan,
        tahunAktif,
    });

    const handleBuatPermohonan = () => {
        // TODO: Arahkan ke route formulir pengajuan permohonan (misal: route('pemohon.permohonan.create'))
        // saat fitur pembuatan permohonan telah diimplementasikan.
        alert('Fitur Buat Permohonan sedang dalam pengembangan untuk modul berikutnya.');
    };

    return (
        <>
            <Head title="Dashboard Pemohon - SIPBAJA" />
            <PemohonDashboardTemplate
                user={auth?.user}
                ringkasan={ringkasanData}
                permohonanAktif={listPermohonan}
                chartData={chartData}
                tahunAktif={activeYear}
                gantiTahun={gantiTahun}
                onBuatPermohonan={handleBuatPermohonan}
            />
        </>
    );
}
