import { useState, useEffect, type FC } from 'react';
import { LayoutGrid, FileText } from 'lucide-react';
import usePpkDashboard from '../../hooks/usePpkDashboard';
import ppkService from '../../services/ppkService';
import PpkDashboardTemplate from '../../components/templates/PpkDashboardTemplate';
import DocumentPreviewModal from '../../components/organisms/DocumentPreviewModal';
import type { PpNavItem } from '../../components/templates/PpLayout';
import type {
  PpPengadaanItem,
  PpkDashboardStats,
  PpkRkaklDoc,
  PpkTableRow,
} from '../../types/ppk';

export const PPK_NAV_ITEMS: PpNavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    href: '/ppk/dashboard',
    icon: LayoutGrid,
  },
  {
    key: 'pengajuan',
    label: 'List Pengajuan',
    href: '/ppk/pengajuan',
    icon: FileText,
  },
];

export const PpkDashboard: FC = () => {
  const { data, isLoading } = usePpkDashboard();
  const [activeRkakl, setActiveRkakl] = useState<PpkRkaklDoc | null>(null);
  const [previewDoc, setPreviewDoc] = useState<PpkRkaklDoc | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    ppkService
      .getRkakl(undefined, controller.signal)
      .then((res) => {
        const doc = res.activeDoc || res.data?.active_doc || null;
        if (doc) setActiveRkakl(doc);
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          console.error('Failed to fetch PPK RKAKL data:', err);
        }
      });

    return () => {
      controller.abort();
    };
  }, []);

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
        activeRkakl={activeRkakl}
        isLoading={isLoading}
        hoveredBar={-1}
        onHoverBar={() => {}}
        onPreviewRkakl={setPreviewDoc}
        recentNotifications={data?.recentNotifications || []}
        unreadNotificationsCount={data?.unreadNotificationsCount || 0}
      />

      <DocumentPreviewModal
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        category="Dokumen RKAKL Aktif (Read-Only)"
        filename={previewDoc?.nama_asli}
        size={`Versi ${previewDoc?.versi ?? 1} • PDF`}
      />
    </>
  );
};

export default PpkDashboard;
