import { useMemo, useState } from 'react';

/**
 * Custom hook untuk mengelola state interaktif dashboard PPBJ.
 * Menangani state pergantian tab dan pencarian/filter reaktif.
 *
 * @param {Object} props
 * @param {Array} props.permohonanMasuk
 * @param {Array} props.pengadaanBerjalan
 * @param {Array} props.terminKontrak
 * @param {Array} props.stats
 * @returns {Object}
 */
export default function usePpbjDashboard({
    permohonanMasuk = [],
    pengadaanBerjalan = [],
    terminKontrak = [],
    stats = [],
} = {}) {
    const [activeTab, setActiveTab] = useState('permohonan');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredItems = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();

        if (activeTab === 'permohonan') {
            if (!q) return permohonanMasuk;
            return permohonanMasuk.filter((item) =>
                [item.nomorSurat, item.judul, item.unitNama, item.status]
                    .filter(Boolean)
                    .some((val) => String(val).toLowerCase().includes(q))
            );
        }

        if (activeTab === 'pengadaan') {
            if (!q) return pengadaanBerjalan;
            return pengadaanBerjalan.filter((item) =>
                [
                    item.nomorSurat,
                    item.judul,
                    item.unitNama,
                    item.makNama,
                    item.levelNama,
                    item.status,
                ]
                    .filter(Boolean)
                    .some((val) => String(val).toLowerCase().includes(q))
            );
        }

        if (activeTab === 'termin') {
            if (!q) return terminKontrak;
            return terminKontrak.filter((item) =>
                [
                    item.kontrakNomor,
                    item.judul,
                    item.unitNama,
                    item.status,
                    item.pembayaranStatus,
                ]
                    .filter(Boolean)
                    .some((val) => String(val).toLowerCase().includes(q))
            );
        }

        return [];
    }, [activeTab, searchQuery, permohonanMasuk, pengadaanBerjalan, terminKontrak]);

    return {
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        filteredItems,
        stats,
    };
}
