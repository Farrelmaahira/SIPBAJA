import { useEffect, useMemo, useState, useCallback, type Dispatch, type SetStateAction } from 'react';
import pemohonService from '../services/pemohonService';
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
  isLoading: boolean;
  isError: boolean;
  isLoadingYear: boolean;
  refetch: () => void;
}

const DEFAULT_RINGKASAN: RingkasanPemohon = {
  total: 0,
  menunggu_verifikasi: 0,
  disetujui: 0,
  ditolak: 0,
  tambahan_bulan_ini: 0,
};

/**
 * Stateful hook for the Pemohon Dashboard page.
 * Manages view mode, active year, and fetches monthly statistics asynchronously via Axios.
 */
export function usePemohonDashboard(
  initialProps: UsePemohonDashboardProps = {}
): UsePemohonDashboardReturn {
  const [viewMode, setViewMode] = useState<string>('bulan');

  const [ringkasan, setRingkasan] = useState<RingkasanPemohon>(
    () => initialProps.ringkasan ?? DEFAULT_RINGKASAN
  );
  const [permohonanAktif, setPermohonanAktif] = useState<PermohonanAktifItem[]>(
    () => initialProps.permohonanAktif ?? []
  );
  const [statistikBulanan, setStatistikBulanan] = useState<StatistikBulananItem[]>(
    () => initialProps.statistikBulanan ?? []
  );
  const [tahunAktif, setTahunAktif] = useState<number>(
    () => initialProps.tahunAktif ?? new Date().getFullYear()
  );

  const [isLoading, setIsLoading] = useState<boolean>(!initialProps.ringkasan);
  const [isError, setIsError] = useState<boolean>(false);
  const [isLoadingYear, setIsLoadingYear] = useState<boolean>(false);

  const fetchDashboardData = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setIsError(false);
    try {
      const data = await pemohonService.getDashboard(undefined, signal);
      if (data) {
        if (data.ringkasan) {
          setRingkasan(data.ringkasan);
        }
        if (data.permohonanAktif) {
          setPermohonanAktif(data.permohonanAktif);
        }
        if (data.statistikBulanan) {
          setStatistikBulanan(data.statistikBulanan);
        }
        if (data.tahunAktif) {
          setTahunAktif(data.tahunAktif);
        }
      }
    } catch (error: unknown) {
      if (!signal?.aborted) {
        setIsError(true);
        console.error('Failed to fetch Pemohon dashboard data:', error);
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    // If initialProps were not provided, fetch from backend
    if (!initialProps.ringkasan && !initialProps.permohonanAktif) {
      const controller = new AbortController();
      void fetchDashboardData(controller.signal);

      return () => {
        controller.abort();
      };
    }
  }, [fetchDashboardData, initialProps.ringkasan, initialProps.permohonanAktif]);

  /**
   * Switch the active calendar year and asynchronously fetch monthly statistics from the API.
   */
  const gantiTahun = async (tahun: number): Promise<void> => {
    setIsLoadingYear(true);
    try {
      const data = await pemohonService.getDashboard({ tahun });

      if (data) {
        if (data.statistikBulanan) {
          setStatistikBulanan(data.statistikBulanan);
        }
        if (data.tahunAktif) {
          setTahunAktif(data.tahunAktif);
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

  const refetch = useCallback(() => {
    void fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    ringkasan,
    permohonanAktif,
    chartData,
    tahunAktif,
    viewMode,
    setViewMode,
    gantiTahun,
    isLoading,
    isError,
    isLoadingYear,
    refetch,
  };
}

export default usePemohonDashboard;
