import { useEffect, useState, type FC } from 'react';
import perlengkapanService from '../../services/perlengkapanService';
import AppLayout from '../../components/templates/General/AppLayout';
import HeroBanner from '../../components/organisms/HeroBanner';
import PerlengkapanPengadaanMasukTable from '../../components/organisms/Perlengkapan/PerlengkapanPengadaanMasukTable';
import { PERLENGKAPAN_NAV_ITEMS } from '../../constants/perlengkapanNav';
import type { PerlengkapanDashboardData } from '../../types/perlengkapan';

export const PerlengkapanDashboard: FC = () => {
  const [data, setData] = useState<PerlengkapanDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    setIsLoading(true);

    perlengkapanService
      .getDashboard(controller.signal)
      .then((res) => {
        if (!isMounted) return;
        setData(res);
      })
      .catch((err: unknown) => {
        if (!isMounted || controller.signal.aborted) return;
        console.error('Failed to fetch Perlengkapan dashboard:', err);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  return (
    <AppLayout
      activeRoute="dashboard"
      navItems={PERLENGKAPAN_NAV_ITEMS}
      roleInitials="PL"
      roleTitle="Perlengkapan"
      roleSubtitle="Unit Perlengkapan"
      profileHref="/perlengkapan/profil"
      notifikasiHref="/perlengkapan/dashboard"
    >
      <div className="space-y-7">
        <HeroBanner
          eyebrow="DASHBOARD"
          title="Selamat datang, Perlengkapan"
          description="Pantau pengadaan yang masuk dan tindak lanjuti dari satu tempat."
        />

        <PerlengkapanPengadaanMasukTable
          items={data?.pengadaan_masuk || []}
          isLoading={isLoading}
        />
      </div>
    </AppLayout>
  );
};

export default PerlengkapanDashboard;
