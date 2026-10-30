import { useEffect, useState, type FC } from 'react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import usePpbjDashboard, {
  type PpbjPermohonanItem,
  type PpbjPengadaanItem,
  type PpbjTerminItem,
  type PpbjStatItem,
} from '../../hooks/usePpbjDashboard';
import PpbjDashboardTemplate from '../../components/templates/PpbjDashboardTemplate';

export const PpbjDashboard: FC = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState<PpbjStatItem[]>([]);
  const [permohonanMasuk, setPermohonanMasuk] = useState<PpbjPermohonanItem[]>([]);
  const [pengadaanBerjalan, setPengadaanBerjalan] = useState<PpbjPengadaanItem[]>([]);
  const [terminKontrak, setTerminKontrak] = useState<PpbjTerminItem[]>([]);
  const [, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    api
      .get<{
        stats?: PpbjStatItem[];
        permohonanMasuk?: PpbjPermohonanItem[];
        pengadaanBerjalan?: PpbjPengadaanItem[];
        terminKontrak?: PpbjTerminItem[];
      }>('/v1/ppbj/dashboard')
      .then((res) => {
        if (!isMounted) return;
        if (res.data.stats) setStats(res.data.stats);
        if (res.data.permohonanMasuk) setPermohonanMasuk(res.data.permohonanMasuk);
        if (res.data.pengadaanBerjalan) setPengadaanBerjalan(res.data.pengadaanBerjalan);
        if (res.data.terminKontrak) setTerminKontrak(res.data.terminKontrak);
      })
      .catch((err) => {
        console.error('Failed to fetch PPBJ dashboard:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
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
      user={user}
      stats={stats}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      items={filteredItems}
      counts={counts}
    />
  );
};

export default PpbjDashboard;
