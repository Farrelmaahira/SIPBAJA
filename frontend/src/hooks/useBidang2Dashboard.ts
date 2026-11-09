import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import api from '../services/api';
import { namaBulan } from '../utils/formatPermohonan';

export interface RingkasanBidang2 {
  total: number;
  menunggu_verifikasi: number;
  disetujui: number;
  ditolak: number;
  tambahan_bulan_ini: number;
  disetujui_bulan_ini: number;
  [key: string]: any;
}

export interface RiwayatTerbaruBidang2Item {
  id: number;
  unit_id?: number | null;
  nomor_surat?: string | null;
  judul?: string | null;
  estimasi_anggaran?: number | string | null;
  status?: string | null;
  created_at?: string | null;
  ringkasan_tujuan?: string | null;
  unit?: { id?: number; nama?: string } | null;
  dokumen?: unknown[];
  [key: string]: any;
}

export interface StatistikBulananBidang2Item {
  bulan: number;
  disetujui: number;
  ditolak: number;
  [key: string]: any;
}

export interface ChartDataBidang2Item extends StatistikBulananBidang2Item {
  label: string;
}

export interface UseBidang2DashboardProps {
  ringkasan?: RingkasanBidang2 | null;
  riwayatTerbaru?: RiwayatTerbaruBidang2Item[] | null;
  statistikBulanan?: StatistikBulananBidang2Item[] | null;
  totalDisetujui?: number | null;
  totalDitolak?: number | null;
  tahunAktif?: number | null;
}

export interface UseBidang2DashboardReturn {
  ringkasan: RingkasanBidang2;
  riwayatTerbaru: RiwayatTerbaruBidang2Item[];
  chartData: ChartDataBidang2Item[] | null;
  totalDisetujui: number;
  totalDitolak: number;
  tahunAktif: number;
  viewMode: string;
  setViewMode: Dispatch<SetStateAction<string>>;
  gantiTahun: (tahun: number) => Promise<void>;
  selectedPermohonan: RiwayatTerbaruBidang2Item | null;
  setSelectedPermohonan: Dispatch<SetStateAction<RiwayatTerbaruBidang2Item | null>>;
  isLoadingYear: boolean;
}

/**
 * Stateful hook for the Bidang 2 Dashboard page.
 * Manages view mode, selection, active year statistics, and asynchronous Axios requests.
 */
export function useBidang2Dashboard({
  ringkasan: initialRingkasan,
  riwayatTerbaru: initialRiwayatTerbaru,
  statistikBulanan: initialStatistikBulanan,
  totalDisetujui: initialTotalDisetujui,
  totalDitolak: initialTotalDitolak,
  tahunAktif: initialTahunAktif,
}: UseBidang2DashboardProps = {}): UseBidang2DashboardReturn {
  const [viewMode, setViewMode] = useState<string>('tahun');
  const [selectedPermohonan, setSelectedPermohonan] = useState<RiwayatTerbaruBidang2Item | null>(null);
  const [statistikBulanan, setStatistikBulanan] = useState<StatistikBulananBidang2Item[]>(
    () => initialStatistikBulanan ?? []
  );
  const [totalDisetujui, setTotalDisetujui] = useState<number>(() => initialTotalDisetujui ?? 0);
  const [totalDitolak, setTotalDitolak] = useState<number>(() => initialTotalDitolak ?? 0);
  const [tahunAktif, setTahunAktif] = useState<number>(
    () => initialTahunAktif ?? new Date().getFullYear()
  );
  const [isLoadingYear, setIsLoadingYear] = useState<boolean>(false);

  useEffect(() => {
    if (initialStatistikBulanan) {
      setStatistikBulanan(initialStatistikBulanan);
    }
    if (initialTahunAktif) {
      setTahunAktif(initialTahunAktif);
    }
    if (initialTotalDisetujui !== undefined && initialTotalDisetujui !== null) {
      setTotalDisetujui(initialTotalDisetujui);
    }
    if (initialTotalDitolak !== undefined && initialTotalDitolak !== null) {
      setTotalDitolak(initialTotalDitolak);
    }
  }, [initialStatistikBulanan, initialTahunAktif, initialTotalDisetujui, initialTotalDitolak]);

  /**
   * Fetch updated annual metrics and monthly statistics for Bidang 2 from the API.
   */
  const gantiTahun = async (tahun: number): Promise<void> => {
    setIsLoadingYear(true);
    try {
      const response = await api.get<{
        ringkasan?: RingkasanBidang2;
        riwayatTerbaru?: RiwayatTerbaruBidang2Item[];
        statistikBulanan?: StatistikBulananBidang2Item[];
        totalDisetujui?: number;
        totalDitolak?: number;
        tahunAktif?: number;
      }>('/v1/bidang-2/dashboard', {
        params: { tahun },
      });

      if (response.data) {
        if (response.data.statistikBulanan) {
          setStatistikBulanan(response.data.statistikBulanan);
        }
        if (response.data.totalDisetujui !== undefined) {
          setTotalDisetujui(response.data.totalDisetujui);
        }
        if (response.data.totalDitolak !== undefined) {
          setTotalDitolak(response.data.totalDitolak);
        }
        if (response.data.tahunAktif) {
          setTahunAktif(response.data.tahunAktif);
        } else {
          setTahunAktif(tahun);
        }
      }
    } catch (error) {
      console.error('Failed to update Bidang 2 dashboard data for year:', error);
    } finally {
      setIsLoadingYear(false);
    }
  };

  const chartData = useMemo<ChartDataBidang2Item[] | null>(() => {
    if (!statistikBulanan || statistikBulanan.length === 0) return null;
    return statistikBulanan.map((item) => ({
      ...item,
      label: namaBulan(item.bulan),
    }));
  }, [statistikBulanan]);

  return {
    ringkasan: initialRingkasan ?? {
      total: 0,
      menunggu_verifikasi: 0,
      disetujui: 0,
      ditolak: 0,
      tambahan_bulan_ini: 0,
      disetujui_bulan_ini: 0,
    },
    riwayatTerbaru: initialRiwayatTerbaru ?? [],
    chartData,
    totalDisetujui,
    totalDitolak,
    tahunAktif,
    viewMode,
    setViewMode,
    gantiTahun,
    selectedPermohonan,
    setSelectedPermohonan,
    isLoadingYear,
  };
}

export default useBidang2Dashboard;
