import { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { namaBulan } from '../utils/formatPermohonan';

export default function useBidang2Dashboard({
    ringkasan,
    riwayatTerbaru,
    statistikBulanan,
    totalDisetujui,
    totalDitolak,
    tahunAktif,
}) {
    const [viewMode, setViewMode] = useState('tahun');
    const [selectedPermohonan, setSelectedPermohonan] = useState(null);

    function gantiTahun(tahun) {
        router.get(
            '/bidang-2/dashboard',
            { tahun },
            { preserveState: true, only: ['statistikBulanan', 'totalDisetujui', 'totalDitolak', 'tahunAktif'] },
        );
    }

    const chartData = useMemo(() => {
        if (!statistikBulanan) return null;
        return statistikBulanan.map((item) => ({
            ...item,
            label: namaBulan(item.bulan),
        }));
    }, [statistikBulanan]);

    return {
        ringkasan: ringkasan ?? {
            total: 0,
            menunggu_verifikasi: 0,
            disetujui: 0,
            ditolak: 0,
            tambahan_bulan_ini: 0,
            disetujui_bulan_ini: 0,
        },
        riwayatTerbaru: riwayatTerbaru ?? [],
        chartData,
        totalDisetujui: totalDisetujui ?? 0,
        totalDitolak: totalDitolak ?? 0,
        tahunAktif: tahunAktif ?? new Date().getFullYear(),
        viewMode,
        setViewMode,
        gantiTahun,
        selectedPermohonan,
        setSelectedPermohonan,
    };
}
