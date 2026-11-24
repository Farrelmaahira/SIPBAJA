import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import usePemohonDashboard from '../../hooks/usePemohonDashboard';
import PemohonDashboardTemplate from '../../components/templates/Pemohon/PemohonDashboardTemplate';

export const PemohonDashboard: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    ringkasan,
    permohonanAktif,
    chartData,
    totalDisetujui,
    totalDitolak,
    tahunAktif,
    viewMode,
    setViewMode,
    gantiTahun,
    isLoading,
    isError,
  } = usePemohonDashboard();

  const handleBuatPermohonan = () => {
    navigate('/pemohon/permohonan/create');
  };

  const handleGantiTahun = (tahun: number) => {
    void gantiTahun(tahun);
  };

  return (
    <PemohonDashboardTemplate
      user={user}
      ringkasan={ringkasan}
      permohonanAktif={permohonanAktif}
      chartData={chartData ?? undefined}
      totalDisetujui={totalDisetujui}
      totalDitolak={totalDitolak}
      tahunAktif={tahunAktif}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      gantiTahun={handleGantiTahun}
      onBuatPermohonan={handleBuatPermohonan}
      isLoading={isLoading}
      isError={isError}
    />
  );
};

export default PemohonDashboard;
