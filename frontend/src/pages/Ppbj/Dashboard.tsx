import { useEffect, useState, type FC } from 'react';
import ppbjService from '../../services/ppbjService';
import { useAuth } from '../../hooks/useAuth';
import usePpbjDashboard from '../../hooks/usePpbjDashboard';
import PpbjDashboardTemplate from '../../components/templates/PpbjDashboardTemplate';
import type {
  PpbjStatItem,
  PpbjPermohonanItem,
  PpbjPengadaanItem,
  PpbjTerminItem,
} from '../../types/ppbj';
import type { AppTopbarUser } from '../../components/organisms/AppTopbar';

export const PpbjDashboard: FC = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState<PpbjStatItem[]>([]);
  const [permohonanMasuk, setPermohonanMasuk] = useState<PpbjPermohonanItem[]>([]);
  const [pengadaanBerjalan, setPengadaanBerjalan] = useState<PpbjPengadaanItem[]>([]);
  const [terminKontrak, setTerminKontrak] = useState<PpbjTerminItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    setIsLoading(true);

    ppbjService
      .getDashboard(controller.signal)
      .then((data) => {
        if (!isMounted) return;
        if (data.stats) setStats(data.stats);
        if (data.permohonanMasuk) setPermohonanMasuk(data.permohonanMasuk);
        if (data.pengadaanBerjalan) setPengadaanBerjalan(data.pengadaanBerjalan);
        if (data.terminKontrak) setTerminKontrak(data.terminKontrak);
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          console.error('Failed to fetch PPBJ dashboard:', err);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    filteredItems,
  } = usePpbjDashboard({
    permohonanMasuk,
    pengadaanBerjalan,
    terminKontrak,
    stats,
  });

  const counts = {
    permohonan: permohonanMasuk.length,
    pengadaan: pengadaanBerjalan.length,
    termin: terminKontrak.length,
  };

  return (
    <PpbjDashboardTemplate
      user={user as AppTopbarUser | null}
      stats={stats}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      items={filteredItems}
      counts={counts}
      isLoading={isLoading}
    />
  );
};

export default PpbjDashboard;
