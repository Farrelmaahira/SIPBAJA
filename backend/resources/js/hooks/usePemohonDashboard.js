import { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { namaBulan } from '../utils/formatPermohonan';

/**
 * Hook stateful untuk halaman Dashboard Pemohon.
 * State UI (viewMode) boleh ada di sini karena murni presentasional.
 * Data bisnis (ringkasan, permohonanAktif) datang dari props Inertia — tidak boleh di-copy ke state.
 */
export default function usePemohonDashboard({ ringkasan, permohonanAktif, statistikBulanan, tahunAktif }) {
    const [viewMode, setViewMode] = useState('bulan');

    // Ubah tahun via Inertia partial reload — hanya statistikBulanan dan tahunAktif yang di-refresh.
    function gantiTahun(tahun) {
        router.get(
            '/pemohon/dashboard',
            { tahun },
            { preserveState: true, only: ['statistikBulanan', 'tahunAktif'] },
        );
    }

    // chartData selalu 12 titik (Jan-Des), dengan label bulan pendek.
    const chartData = useMemo(() => {
        if (!statistikBulanan) return null;
        return statistikBulanan.map((item) => ({
            ...item,
            label: namaBulan(item.bulan),
        }));
    }, [statistikBulanan]);

    return {
        ringkasan: ringkasan ?? { total: 0, menunggu_verifikasi: 0, disetujui: 0, ditolak: 0, tambahan_bulan_ini: 0 },
        permohonanAktif: permohonanAktif ?? [],
        chartData,
        tahunAktif,
        viewMode,
        setViewMode,
        gantiTahun,
    };
}
