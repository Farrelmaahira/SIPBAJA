import { useEffect, useState, type FC } from 'react';
import keuanganService from '../../services/keuanganService';
import AppLayout from '../../components/templates/General/AppLayout';
import HeroBanner from '../../components/organisms/HeroBanner';
import KeuanganPengadaanMenungguTable from '../../components/organisms/Keuangan/KeuanganPengadaanMenungguTable';
import { KEUANGAN_NAV_ITEMS } from '../../constants/keuanganNav';
import type { KeuanganDashboardData } from '../../types/keuangan';

export const KeuanganDashboard: FC = () => {
  const [data, setData] = useState<KeuanganDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    setIsLoading(true);

    keuanganService
      .getDashboard(controller.signal)
      .then((res) => {
        if (!isMounted) return;
        setData(res);
      })
      .catch((err: unknown) => {
        if (!isMounted || controller.signal.aborted) return;
        console.error('Failed to fetch Keuangan dashboard:', err);
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
      navItems={KEUANGAN_NAV_ITEMS}
      roleInitials="KE"
      roleTitle="Keuangan"
      roleSubtitle="Unit Keuangan"
      basePath="/keuangan"
      profileHref="/keuangan/profil"
      notifikasiHref="/keuangan/notifikasi"
    >
      <div className="space-y-7">
        <HeroBanner
          eyebrow="DASHBOARD"
          title="Selamat datang, Keuangan"
          description="Pantau pengadaan yang perlu diproses pembayaran dari satu tempat."
        />

        <KeuanganPengadaanMenungguTable
          items={data?.pengadaan_menunggu_pembayaran || []}
          isLoading={isLoading}
        />
      </div>
    </AppLayout>
  );
};

export default KeuanganDashboard;
