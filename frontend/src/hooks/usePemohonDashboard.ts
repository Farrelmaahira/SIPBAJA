import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import api from '../services/api';
import { namaBulan } from '../utils/formatPermohonan';

export interface RingkasanPemohon {
  total: number;
  menunggu_verifikasi: number;
  disetujui: number;
  ditolak: number;
  tambahan_bulan_ini: number;
  [key: string]: any;
}

export interface PermohonanAktifItem {
  id: number;
  nomor_surat?: string | null;
  judul?: string | null;
  estimasi_anggaran?: number | string | null;
  status?: string | null;
  created_at?: string | null;
  ringkasan_tujuan?: string | null;
  [key: string]: any;
}

export interface StatistikBulananItem {
  bulan: number;
  disetujui: number;
  ditolak: number;
  [key: string]: any;
}

export interface ChartDataItem extends StatistikBulananItem {
  label: string;
}

export interface UsePemohonDashboardProps {
  ringkasan?: RingkasanPemohon | null;
  permohonanAktif?: PermohonanAktifItem[] | null;
  statistikBulanan?: StatistikBulananItem[] | null;
  tahunAktif?: number | null;
}

export interface UsePemohonDashboardReturn {
  ringkasan: RingkasanPemohon;
  permohonanAktif: PermohonanAktifItem[];
  chartData: ChartDataItem[] | null;
  tahunAktif: number;
  viewMode: string;
  setViewMode: Dispatch<SetStateAction<string>>;
  gantiTahun: (tahun: number) => Promise<void>;
  isLoadingYear: boolean;
}

/**
 * Stateful hook for the Pemohon Dashboard page.
 * Manages view mode, active year, and fetches monthly statistics asynchronously via Axios.
 */
export function usePemohonDashboard({
  ringkasan: initialRingkasan,
  permohonanAktif: initialPermohonanAktif,
  statistikBulanan: initialStatistikBulanan,
  tahunAktif: initialTahunAktif,
}: UsePemohonDashboardProps = {}): UsePemohonDashboardReturn {
  const [viewMode, setViewMode] = useState<string>('bulan');
  const [statistikBulanan, setStatistikBulanan] = useState<StatistikBulananItem[]>(
    () => initialStatistikBulanan ?? []
  );
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
  }, [initialStatistikBulanan, initialTahunAktif]);

  /**
   * Switch the active calendar year and asynchronously fetch monthly statistics from the API.
   */
  const gantiTahun = async (tahun: number): Promise<void> => {
    setIsLoadingYear(true);
    try {
      const response = await api.get<{
        ringkasan?: RingkasanPemohon;
        permohonanAktif?: PermohonanAktifItem[];
        statistikBulanan?: StatistikBulananItem[];
        tahunAktif?: number;
      }>('/v1/pemohon/dashboard', {
        params: { tahun },
      });

      if (response.data) {
        if (response.data.statistikBulanan) {
          setStatistikBulanan(response.data.statistikBulanan);
        }
        if (response.data.tahunAktif) {
          setTahunAktif(response.data.tahunAktif);
        } else {
          setTahunAktif(tahun);
        }
      }
    } catch (error) {
      console.error('Failed to update year statistics on Pemohon dashboard:', error);
    } finally {
      setIsLoadingYear(false);
    }
  };

  const chartData = useMemo<ChartDataItem[] | null>(() => {
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
    },
    permohonanAktif: initialPermohonanAktif ?? [],
    chartData,
    tahunAktif,
    viewMode,
    setViewMode,
    gantiTahun,
    isLoadingYear,
  };
}

export default usePemohonDashboard;
