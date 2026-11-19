import { useEffect, useState, useMemo, type FC } from 'react';
import { LayoutDashboard, ClipboardList } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import perlengkapanService from '../../services/perlengkapanService';
import DashboardShellTemplate from '../../components/templates/DashboardShellTemplate';
import HeroBanner from '../../components/organisms/HeroBanner';
import PerlengkapanPengadaanMasukTable from '../../components/organisms/Perlengkapan/PerlengkapanPengadaanMasukTable';
import type { PerlengkapanDashboardData } from '../../types/perlengkapan';

export const PerlengkapanDashboard: FC = () => {
  const { user } = useAuth();
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

  const totalPengadaan = data?.summary?.total_pengadaan_masuk ?? data?.pengadaan_masuk?.length ?? 4;

  const sidebarProps = useMemo(
    () => ({
      navItems: [
        {
          key: 'dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
          href: '/perlengkapan/dashboard',
        },
        {
          key: 'pengadaan',
          label: 'List Pengadaan',
          icon: ClipboardList,
          href: '/perlengkapan/pengadaan',
          badge: totalPengadaan,
        },
      ],
      activeRoute: 'dashboard',
      brandSubtitle: 'Pengadaan Barang & Jasa',
      sectionTitle: 'Menu',
    }),
    [totalPengadaan]
  );

  const topbarProps = useMemo(
    () => ({
      user: user
        ? {
          ...user,
          initials: 'PL',
          unitSubtitle: 'Unit Perlengkapan',
        }
        : {
          nama: 'Perlengkapan',
          initials: 'PL',
          unitSubtitle: 'Unit Perlengkapan',
        },
    }),
    [user]
  );

  return (
    <DashboardShellTemplate sidebarProps={sidebarProps} topbarProps={topbarProps}>
      <div className="space-y-7">
        {/* Hero Banner sesuai mockup perlengkapan_dashboard.png */}
        <HeroBanner
          eyebrow="DASHBOARD"
          title="Selamat datang, Perlengkapan"
          description="Pantau pengadaan yang masuk dan tindak lanjuti dari satu tempat."
        />

        {/* Tabel Pengadaan Masuk Terbaru */}
        <PerlengkapanPengadaanMasukTable
          items={data?.pengadaan_masuk || []}
          isLoading={isLoading}
        />
      </div>
    </DashboardShellTemplate>
  );
};

export default PerlengkapanDashboard;
