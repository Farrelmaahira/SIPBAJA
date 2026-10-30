import { useEffect, useState, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import usePemohonDashboard, {
  type RingkasanPemohon,
  type PermohonanAktifItem,
  type StatistikBulananItem,
} from '../../hooks/usePemohonDashboard';
import PemohonDashboardTemplate from '../../components/templates/PemohonDashboardTemplate';

export const PemohonDashboard: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [initialData, setInitialData] = useState<{
    ringkasan?: RingkasanPemohon;
    permohonanAktif?: PermohonanAktifItem[];
    statistikBulanan?: StatistikBulananItem[];
    tahunAktif?: number;
  }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    api
      .get<{
        ringkasan?: RingkasanPemohon;
        permohonanAktif?: PermohonanAktifItem[];
        statistikBulanan?: StatistikBulananItem[];
        tahunAktif?: number;
      }>('/v1/pemohon/dashboard')
      .then((res) => {
        if (!isMounted) return;
        setInitialData(res.data);
      })
      .catch((err) => {
        console.error('Failed to fetch Pemohon dashboard data:', err);
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
    permohonanAktif: listPermohonan,
    chartData,
    tahunAktif: activeYear,
    gantiTahun,
  } = usePemohonDashboard(initialData);

  const handleBuatPermohonan = () => {
    navigate('/pemohon/permohonan/create');
  };

  return (
    <PemohonDashboardTemplate
      user={user}
      ringkasan={ringkasanData}
      permohonanAktif={listPermohonan}
      chartData={chartData ?? undefined}
      tahunAktif={activeYear}
      gantiTahun={gantiTahun}
      isLoading={isLoading}
      onBuatPermohonan={handleBuatPermohonan}
    />
  );
};

export default PemohonDashboard;
