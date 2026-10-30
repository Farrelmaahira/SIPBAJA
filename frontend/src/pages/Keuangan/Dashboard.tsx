import { useEffect, useState, type FC } from 'react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import RoleDashboardTemplate from '../../components/templates/RoleDashboardTemplate';

export const KeuanganDashboard: FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    api
      .get('/v1/keuangan/dashboard')
      .catch((err) => {
        console.error('Failed to fetch Keuangan dashboard:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <RoleDashboardTemplate
      roleTitle="Dashboard Keuangan"
      roleDescription="Pemrosesan pembayaran termin yang telah disetujui lengkap oleh PPK dan Bidang 2."
      user={user}
      isLoading={isLoading}
    />
  );
};

export default KeuanganDashboard;
