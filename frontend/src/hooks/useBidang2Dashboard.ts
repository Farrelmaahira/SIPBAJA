import { useEffect, useMemo, useState, useCallback, type Dispatch, type SetStateAction } from 'react';
import bidang2Service from '../services/bidang2Service';
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

export interface RiwayatPengadaanBidang2Item {
  id: number;
  nomor_pengadaan?: string;
  nomor_permohonan?: string;
  judul?: string;
  unit_nama?: string;
  nominal?: number;
  status?: string;
  created_at?: string;
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
  riwayatPengadaanTerbaru?: RiwayatPengadaanBidang2Item[] | null;
  statistikBulanan?: StatistikBulananBidang2Item[] | null;
  totalDisetujui?: number | null;
  totalDitolak?: number | null;
  tahunAktif?: number | null;
}

export interface UseBidang2DashboardReturn {
  ringkasan: RingkasanBidang2;
  riwayatTerbaru: RiwayatTerbaruBidang2Item[];
  riwayatPengadaanTerbaru: RiwayatPengadaanBidang2Item[];
  chartData: ChartDataBidang2Item[] | null;
  totalDisetujui: number;
  totalDitolak: number;
  tahunAktif: number;
  viewMode: string;
  setViewMode: Dispatch<SetStateAction<string>>;
  gantiTahun: (tahun: number) => Promise<void>;
  selectedPermohonan: RiwayatTerbaruBidang2Item | null;
  setSelectedPermohonan: Dispatch<SetStateAction<RiwayatTerbaruBidang2Item | null>>;
  isLoading: boolean;
  isError: boolean;
  isLoadingYear: boolean;
  refetch: () => void;
}

const DEFAULT_RINGKASAN: RingkasanBidang2 = {
  total: 0,
  menunggu_verifikasi: 0,
  disetujui: 0,
  ditolak: 0,
  tambahan_bulan_ini: 0,
  disetujui_bulan_ini: 0,
};

const FALLBACK_RIWAYAT_PENGADAAN: RiwayatPengadaanBidang2Item[] = [
  {
    id: 1,
    nomor_pengadaan: '01010-FF-11',
    nomor_permohonan: 'Permohonan 111-FFF-111',
    judul: 'Pengadaan Komputer Lab',
    unit_nama: 'Jurusan Teknik Informatika',
    nominal: 185000000,
    status: 'Review Pengajuan',
  },
  {
    id: 2,
    nomor_pengadaan: '01011-FF-11',
    nomor_permohonan: 'Permohonan 112-FFF-111',
    judul: 'Pengadaan Proyektor Ruang Kelas',
    unit_nama: 'Jurusan Teknik Elektro',
    nominal: 48500000,
    status: 'Review Pengajuan',
  },
  {
    id: 3,
    nomor_pengadaan: '01012-FF-11',
    nomor_permohonan: 'Permohonan 113-FFF-111',
    judul: 'Pengadaan Switch Jaringan Gedung A',
    unit_nama: 'Jurusan Teknik Sipil',
    nominal: 92750000,
    status: 'Review Pengajuan',
  },
  {
    id: 4,
    nomor_pengadaan: '01013-FF-11',
    nomor_permohonan: 'Permohonan 114-FFF-111',
    judul: 'Pengadaan Perangkat Server',
    unit_nama: 'Bagian Akademik',
    nominal: 320000000,
    status: 'Review Pengajuan',
  },
];

/**
 * Stateful hook for the Bidang 2 Dashboard page.
 * Manages view mode, selection, active year statistics, and asynchronous Axios requests via bidang2Service.
 */
export function useBidang2Dashboard(
  initialProps: UseBidang2DashboardProps = {}
): UseBidang2DashboardReturn {
  const [viewMode, setViewMode] = useState<string>('bulan');
  const [selectedPermohonan, setSelectedPermohonan] = useState<RiwayatTerbaruBidang2Item | null>(null);

  const [ringkasan, setRingkasan] = useState<RingkasanBidang2>(
    () => initialProps.ringkasan ?? DEFAULT_RINGKASAN
  );
  const [riwayatTerbaru, setRiwayatTerbaru] = useState<RiwayatTerbaruBidang2Item[]>(
    () => initialProps.riwayatTerbaru ?? []
  );
  const [riwayatPengadaanTerbaru, setRiwayatPengadaanTerbaru] = useState<RiwayatPengadaanBidang2Item[]>(
    () => initialProps.riwayatPengadaanTerbaru ?? FALLBACK_RIWAYAT_PENGADAAN
  );
  const [statistikBulanan, setStatistikBulanan] = useState<StatistikBulananBidang2Item[]>(
    () => initialProps.statistikBulanan ?? []
  );
  const [totalDisetujui, setTotalDisetujui] = useState<number>(
    () => initialProps.totalDisetujui ?? 0
  );
  const [totalDitolak, setTotalDitolak] = useState<number>(
    () => initialProps.totalDitolak ?? 0
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
      const data = await bidang2Service.getDashboard(undefined, signal);
      if (data) {
        if (data.ringkasan) setRingkasan(data.ringkasan);
        if (data.riwayatTerbaru) setRiwayatTerbaru(data.riwayatTerbaru);
        if (data.riwayatPengadaanTerbaru && data.riwayatPengadaanTerbaru.length > 0) {
          setRiwayatPengadaanTerbaru(data.riwayatPengadaanTerbaru);
        } else {
          setRiwayatPengadaanTerbaru(FALLBACK_RIWAYAT_PENGADAAN);
        }
        if (data.statistikBulanan) setStatistikBulanan(data.statistikBulanan);
        if (data.totalDisetujui !== undefined) setTotalDisetujui(data.totalDisetujui);
        if (data.totalDitolak !== undefined) setTotalDitolak(data.totalDitolak);
        if (data.tahunAktif) setTahunAktif(data.tahunAktif);
      }
    } catch (err: unknown) {
      if (!signal?.aborted) {
        setIsError(true);
        console.error('Failed to fetch Bidang 2 dashboard data:', err);
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!initialProps.ringkasan && !initialProps.riwayatTerbaru) {
      const controller = new AbortController();
      void fetchDashboardData(controller.signal);

      return () => {
        controller.abort();
      };
    }
  }, [fetchDashboardData, initialProps.ringkasan, initialProps.riwayatTerbaru]);

  /**
   * Switch active year and asynchronously fetch monthly statistics from the API.
   */
  const gantiTahun = async (tahun: number): Promise<void> => {
    setIsLoadingYear(true);
    try {
      const data = await bidang2Service.getDashboard({ tahun });
      if (data) {
        if (data.statistikBulanan) setStatistikBulanan(data.statistikBulanan);
        if (data.totalDisetujui !== undefined) setTotalDisetujui(data.totalDisetujui);
        if (data.totalDitolak !== undefined) setTotalDitolak(data.totalDitolak);
        if (data.tahunAktif) {
          setTahunAktif(data.tahunAktif);
        } else {
          setTahunAktif(tahun);
        }
      }
    } catch (error) {
      console.error('Failed to update year statistics on Bidang 2 dashboard:', error);
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

  const refetch = useCallback(() => {
    void fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    ringkasan,
    riwayatTerbaru,
    riwayatPengadaanTerbaru,
    chartData,
    totalDisetujui,
    totalDitolak,
    tahunAktif,
    viewMode,
    setViewMode,
    gantiTahun,
    selectedPermohonan,
    setSelectedPermohonan,
    isLoading,
    isError,
    isLoadingYear,
    refetch,
  };
}

export default useBidang2Dashboard;
