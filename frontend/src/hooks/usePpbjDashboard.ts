import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';

export type PpbjTab = 'permohonan' | 'pengadaan' | 'termin';

export interface PpbjStatItem {
  label: string;
  value: number;
  unit: string;
  variant: string;
  [key: string]: any;
}

export interface PpbjPermohonanItem {
  id: number;
  nomorSurat?: string | null;
  judul?: string | null;
  ringkasanTujuan?: string | null;
  unitNama?: string | null;
  estimasiAnggaran?: number | null;
  revisiKe?: number | null;
  status?: string | null;
  tanggalPengajuan?: string | null;
  makList?: string[];
  jumlahPaket?: number;
  [key: string]: any;
}

export interface PpbjPengadaanItem {
  id: number;
  nomorSurat?: string | null;
  judul?: string | null;
  unitNama?: string | null;
  makNama?: string | null;
  jenisNama?: string | null;
  metodeNama?: string | null;
  levelNama?: string | null;
  ppkNama?: string | null;
  nominal?: number | null;
  revisiKe?: number | null;
  status?: string | null;
  tanggalDibuat?: string | null;
  [key: string]: any;
}

export interface PpbjTerminItem {
  id: number;
  kontrakNomor?: string | null;
  kontrakTipe?: string | null;
  judul?: string | null;
  unitNama?: string | null;
  terminKe?: number | null;
  nominalRencana?: number | null;
  tanggalJatuhTempo?: string | null;
  status?: string | null;
  pembayaranStatus?: string | null;
  pembayaranNominal?: number | null;
  reminderTanggal?: string | null;
  [key: string]: any;
}

export type PpbjDashboardItem =
  | PpbjPermohonanItem
  | PpbjPengadaanItem
  | PpbjTerminItem;

export interface UsePpbjDashboardProps {
  permohonanMasuk?: PpbjPermohonanItem[];
  pengadaanBerjalan?: PpbjPengadaanItem[];
  terminKontrak?: PpbjTerminItem[];
  stats?: PpbjStatItem[];
}

export interface UsePpbjDashboardReturn {
  activeTab: PpbjTab;
  setActiveTab: Dispatch<SetStateAction<PpbjTab>>;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  filteredItems: PpbjDashboardItem[];
  stats: PpbjStatItem[];
}

/**
 * Custom hook to manage interactive state for the PPBJ dashboard.
 * Handles tab transitions and reactive query filtering across categories.
 */
export function usePpbjDashboard({
  permohonanMasuk = [],
  pengadaanBerjalan = [],
  terminKontrak = [],
  stats = [],
}: UsePpbjDashboardProps = {}): UsePpbjDashboardReturn {
  const [activeTab, setActiveTab] = useState<PpbjTab>('permohonan');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredItems = useMemo<PpbjDashboardItem[]>(() => {
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

export default usePpbjDashboard;
