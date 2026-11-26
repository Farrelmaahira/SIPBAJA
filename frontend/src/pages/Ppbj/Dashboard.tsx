import { useEffect, useMemo, useState, type FC } from 'react';
import ppbjService from '../../services/ppbjService';
import { useAuth } from '../../hooks/useAuth';
import PpbjDashboardTemplate from '../../components/templates/PPBJ/PpbjDashboardTemplate';
import type {
  PpbjStatItem,
  PpbjPermohonanItem,
  PpbjPengadaanItem,
} from '../../types/ppbj';
import type { ChartDatum } from '../../components/organisms/StatistikChart';
import type { PpbjDashboardTableRow } from '../../components/organisms/PpbjDashboardTableCard';
import type { AppTopbarUser } from '../../components/organisms/AppTopbar';
import { namaBulan } from '../../utils/formatPermohonan';

export const PpbjDashboard: FC = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState<PpbjStatItem[]>([]);
  const [permohonanMasuk, setPermohonanMasuk] = useState<PpbjPermohonanItem[]>([]);
  const [pengadaanBerjalan, setPengadaanBerjalan] = useState<PpbjPengadaanItem[]>([]);
  const [statistikBulanan, setStatistikBulanan] = useState<{ bulan: number; disetujui: number; ditolak: number }[]>([]);
  const [statistikTahunan, setStatistikTahunan] = useState<{ tahun: number; disetujui: number; ditolak: number }[]>([]);
  const [viewMode, setViewMode] = useState<'bulan' | 'tahun'>('tahun');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    setIsLoading(true);
    setErrorMessage('');

    ppbjService
      .getDashboard(controller.signal)
      .then((data) => {
        if (!isMounted) return;
        if (data.stats) setStats(data.stats);
        if (data.permohonanMasuk) setPermohonanMasuk(data.permohonanMasuk);
        if (data.pengadaanBerjalan) setPengadaanBerjalan(data.pengadaanBerjalan);
        if (data.statistikBulanan) setStatistikBulanan(data.statistikBulanan);
        if (data.statistikTahunan) setStatistikTahunan(data.statistikTahunan);
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          console.error('Failed to fetch PPBJ dashboard:', err);
          setErrorMessage('Gagal memuat data dashboard PPBJ.');
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

  const permohonanRows = useMemo<PpbjDashboardTableRow[]>(() => {
    return permohonanMasuk.slice(0, 4).map((item) => ({
      id: item.id,
      primaryNumber: item.nomorSurat || item.nomor_surat || '-',
      judul: item.judul || '-',
      unitNama: item.unitNama || item.unit_nama || '-',
      nominal: item.estimasiAnggaran ?? item.estimasi_anggaran ?? item.nominal ?? null,
      status: item.status || 'disetujui',
      detailHref: `/ppbj/permohonan/${item.id}`,
    }));
  }, [permohonanMasuk]);

  const pengadaanRows = useMemo<PpbjDashboardTableRow[]>(() => {
    return pengadaanBerjalan.slice(0, 4).map((item) => ({
      id: item.id,
      primaryNumber: `Paket #${item.id}`,
      secondaryNumber: item.nomorSurat ? `Permohonan ${item.nomorSurat}` : undefined,
      judul: item.judul || '-',
      unitNama: item.unitNama || '-',
      nominal: item.nominal ?? null,
      status: item.status || 'menunggu_review',
      detailHref: `/ppbj/pengadaan/${item.id}`,
    }));
  }, [pengadaanBerjalan]);

  const chartData = useMemo<ChartDatum[] | undefined>(() => {
    if (viewMode === 'tahun') {
      if (statistikTahunan.length === 0) return undefined;
      return statistikTahunan.map((item) => ({
        bulan: item.tahun,
        label: String(item.tahun),
        disetujui: item.disetujui,
        ditolak: item.ditolak,
      }));
    }
    if (statistikBulanan.length === 0) return undefined;
    return statistikBulanan.map((item) => ({
      bulan: item.bulan,
      label: namaBulan(item.bulan),
      disetujui: item.disetujui,
      ditolak: item.ditolak,
    }));
  }, [viewMode, statistikBulanan, statistikTahunan]);

  return (
    <PpbjDashboardTemplate
      user={user as AppTopbarUser | null}
      stats={stats}
      permohonanRows={permohonanRows}
      pengadaanRows={pengadaanRows}
      chartData={chartData}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      isLoading={isLoading}
      errorMessage={errorMessage}
    />
  );
};

export default PpbjDashboard;
