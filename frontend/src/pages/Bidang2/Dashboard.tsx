import { useEffect, useState, type FC } from 'react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import useBidang2Dashboard, {
  type RingkasanBidang2,
  type RiwayatTerbaruBidang2Item,
  type StatistikBulananBidang2Item,
} from '../../hooks/useBidang2Dashboard';
import Bidang2DashboardTemplate from '../../components/templates/Bidang2DashboardTemplate';

export const Bidang2Dashboard: FC = () => {
  const { user } = useAuth();

  const [initialData, setInitialData] = useState<{
    ringkasan?: RingkasanBidang2;
    riwayatTerbaru?: RiwayatTerbaruBidang2Item[];
    statistikBulanan?: StatistikBulananBidang2Item[];
    totalDisetujui?: number;
    totalDitolak?: number;
    tahunAktif?: number;
  }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    api
      .get<{
        ringkasan?: RingkasanBidang2;
        riwayatTerbaru?: RiwayatTerbaruBidang2Item[];
        statistikBulanan?: StatistikBulananBidang2Item[];
        totalDisetujui?: number;
        totalDitolak?: number;
        tahunAktif?: number;
      }>('/v1/bidang-2/dashboard')
      .then((res) => {
        if (!isMounted) return;
        setInitialData(res.data);
      })
      .catch((err) => {
        console.error('Failed to fetch Bidang 2 dashboard data:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const {
    ringkasan: ringkasanData,
    riwayatTerbaru: riwayatData,
    chartData,
    totalDisetujui: statDisetujui,
    totalDitolak: statDitolak,
    tahunAktif: activeYear,
    viewMode,
    setViewMode,
    gantiTahun,
    selectedPermohonan,
    setSelectedPermohonan,
  } = useBidang2Dashboard(initialData);

  return (
    <Bidang2DashboardTemplate
      user={user}
      ringkasan={ringkasanData}
      riwayatTerbaru={riwayatData}
      chartData={chartData ?? undefined}
      totalDisetujui={statDisetujui}
      totalDitolak={statDitolak}
      tahunAktif={activeYear}
      viewMode={viewMode as 'bulan' | 'tahun'}
      onViewModeChange={(m) => setViewMode(m)}
      gantiTahun={gantiTahun}
      selectedPermohonan={selectedPermohonan}
      onSelectPermohonan={(p) => setSelectedPermohonan(p as any)}
      onCloseDetail={() => setSelectedPermohonan(null)}
      isLoading={isLoading}
    />
  );
};

export default Bidang2Dashboard;
