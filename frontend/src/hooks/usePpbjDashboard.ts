import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import type {
  PpbjTabKey,
  PpbjStatItem,
  PpbjPermohonanItem,
  PpbjPengadaanItem,
  PpbjTerminItem,
} from '../types/ppbj';

export type {
  PpbjTabKey,
  PpbjStatItem,
  PpbjPermohonanItem,
  PpbjPengadaanItem,
  PpbjTerminItem,
};

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
  activeTab: PpbjTabKey;
  setActiveTab: Dispatch<SetStateAction<PpbjTabKey>>;
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
  const [activeTab, setActiveTab] = useState<PpbjTabKey>('permohonan');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredItems = useMemo<PpbjDashboardItem[]>(() => {
    const q = searchQuery.trim().toLowerCase();

    if (activeTab === 'permohonan') {
      if (!q) return permohonanMasuk;
      return permohonanMasuk.filter((item) => {
        const nomor = (item.nomorSurat || '').toLowerCase();
        const judul = (item.judul || '').toLowerCase();
        const unit = (item.unitNama || '').toLowerCase();
        return nomor.includes(q) || judul.includes(q) || unit.includes(q);
      });
    }

    if (activeTab === 'pengadaan') {
      if (!q) return pengadaanBerjalan;
      return pengadaanBerjalan.filter((item) => {
        const nomor = (item.nomorSurat || '').toLowerCase();
        const judul = (item.judul || '').toLowerCase();
        const mak = (item.makNama || '').toLowerCase();
        const ppk = (item.ppkNama || '').toLowerCase();
        return nomor.includes(q) || judul.includes(q) || mak.includes(q) || ppk.includes(q);
      });
    }

    if (activeTab === 'termin') {
      if (!q) return terminKontrak;
      return terminKontrak.filter((item) => {
        const kontrak = (item.kontrakNomor || '').toLowerCase();
        const judul = (item.judul || '').toLowerCase();
        const unit = (item.unitNama || '').toLowerCase();
        return kontrak.includes(q) || judul.includes(q) || unit.includes(q);
      });
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
