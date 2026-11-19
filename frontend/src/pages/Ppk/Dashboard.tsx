import { type FC } from 'react';
import usePpkDashboard from '../../hooks/usePpkDashboard';
import PpkDashboardTemplate from '../../components/templates/PPK/PpkDashboardTemplate';
import type {
  PpPengadaanItem,
  PpkDashboardStats,
  PpkTableRow,
} from '../../types/ppk';
import { PPK_NAV_ITEMS } from '@/constants/ppkNav';

export const PpkDashboard: FC = () => {
  const { data, isLoading } = usePpkDashboard();

  const stats: PpkDashboardStats = data?.stats || {};
  const rows: PpkTableRow[] = (data?.pengajuanTerbaru || []).map((item: PpPengadaanItem) => {
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

  return (
    <>
      <PpkDashboardTemplate
        navItems={PPK_NAV_ITEMS}
        stats={stats}
        rows={rows}
        isLoading={isLoading}
        hoveredBar={-1}
        onHoverBar={() => { }}
        recentNotifications={data?.recentNotifications || []}
        unreadNotificationsCount={data?.unreadNotificationsCount || 0}
      />
    </>
  );
};

export default PpkDashboard;
