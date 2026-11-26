import { useMemo, useState, type FC } from 'react';
import usePpkDashboard from '../../hooks/usePpkDashboard';
import PpkDashboardTemplate from '../../components/templates/PPK/PpkDashboardTemplate';
import type {
  PpPengadaanItem,
  PpkDashboardStats,
  PpkPermohonanItem,
  PpkTableRow,
} from '../../types/ppk';
import type { ChartDatum } from '../../components/organisms/StatistikChart';
import { namaBulan } from '../../utils/formatPermohonan';
import { PPK_NAV_ITEMS } from '@/constants/ppkNav';

export const PpkDashboard: FC = () => {
  const { data, isLoading, error } = usePpkDashboard();
  const [viewMode, setViewMode] = useState<'bulan' | 'tahun'>('tahun');

  const stats: PpkDashboardStats = data?.stats || {};

  const permohonanRows: PpkTableRow[] = (data?.permohonanTerbaru || []).map((item: PpkPermohonanItem) => {
    const unit = item.unit || item.Unit;
    return {
      id: item.id,
      nomor_surat: item.nomor_surat || '-',
      judul: item.judul || '-',
      unit: unit?.nama || '-',
      tanggal: item.created_at || '-',
      nominal: Number(item.estimasi_anggaran ?? item.nominal) || 0,
      status: item.status || 'menunggu_persetujuan',
      sourceType: 'permohonan',
    };
  });

  const pengadaanRows: PpkTableRow[] = (data?.pengajuanTerbaru || []).map((item: PpPengadaanItem) => {
    const permohonan = item.permohonan || item.Permohonan;
    const unit = permohonan?.unit || permohonan?.Unit;
    return {
      id: item.id,
      nomor_surat: permohonan?.nomor_surat || '-',
      judul: permohonan?.judul || '-',
      unit: unit?.nama || '-',
      tanggal: item.created_at || permohonan?.created_at || '-',
      nominal: Number(item.nominal) || 0,
      status: item.status || 'menunggu_persetujuan',
      sourceType: 'pengadaan',
    };
  });

  const chartData = useMemo<ChartDatum[] | undefined>(() => {
    if (viewMode === 'tahun') {
      const list = data?.statistikTahunan;
      if (!list || list.length === 0) return undefined;
      return list.map((item) => ({
        bulan: item.tahun,
        label: String(item.tahun),
        disetujui: item.disetujui,
        ditolak: item.ditolak,
      }));
    }
    const list = data?.statistikBulanan;
    if (!list || list.length === 0) return undefined;
    return list.map((item) => ({
      bulan: item.bulan,
      label: namaBulan(item.bulan),
      disetujui: item.disetujui,
      ditolak: item.ditolak,
    }));
  }, [viewMode, data?.statistikBulanan, data?.statistikTahunan]);

  return (
    <PpkDashboardTemplate
      navItems={PPK_NAV_ITEMS}
      stats={stats}
      permohonanRows={permohonanRows}
      pengadaanRows={pengadaanRows}
      chartData={chartData}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      isLoading={isLoading}
      errorMessage={error ?? undefined}
      recentNotifications={data?.recentNotifications || []}
      unreadNotificationsCount={data?.unreadNotificationsCount || 0}
    />
  );
};

export default PpkDashboard;
