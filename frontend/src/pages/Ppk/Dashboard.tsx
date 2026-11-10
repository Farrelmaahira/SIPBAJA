import { useState, useEffect, type FC } from 'react';
import { LayoutGrid, FileText } from 'lucide-react';
import ppkService from '../../services/ppkService';
import PpkDashboardTemplate from '../../components/templates/PpkDashboardTemplate';
import DocumentPreviewModal from '../../components/organisms/DocumentPreviewModal';
import type { PpNavItem } from '../../components/templates/PpLayout';
import type { NotificationItem } from '../../types/notification';
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
    badge: 4,
  },
];

const FALLBACK_ROWS: PpkTableRow[] = [
  {
    id: 1,
    nomor_surat: '009/PNJ/2026',
    judul: 'Pengadaan Kursi Kuliah',
    unit: 'Jurusan Teknik Sipil',
    tanggal: '2026-04-02',
    nominal: 45000000,
    status: 'menunggu_persetujuan',
    sourceType: 'pengadaan',
  },
  {
    id: 2,
    nomor_surat: '008/PNJ/2026',
    judul: 'Pengadaan Alat Ukur Tanah',
    unit: 'Jurusan Teknik Sipil',
    tanggal: '2026-03-30',
    nominal: 62000000,
    status: 'menunggu_persetujuan',
    sourceType: 'pengadaan',
  },
  {
    id: 3,
    nomor_surat: '007/PNJ/2026',
    judul: 'Pengadaan Kamera Dokumentasi',
    unit: 'Humas PNJ',
    tanggal: '2026-03-28',
    nominal: 28000000,
    status: 'disetujui',
    sourceType: 'pengadaan',
  },
  {
    id: 4,
    nomor_surat: '006/PNJ/2026',
    judul: 'Pengadaan Lisensi Software',
    unit: 'UPT Komputer',
    tanggal: '2026-03-26',
    nominal: 19500000,
    status: 'ditolak',
    sourceType: 'pengadaan',
  },
];

export const PpkDashboard: FC = () => {
  const [hoveredBar, setHoveredBar] = useState<number>(7);
  const [stats, setStats] = useState<PpkDashboardStats>({});
  const [pengajuanTerbaru, setPengajuanTerbaru] = useState<PpPengadaanItem[]>([]);
  const [activeRkakl, setActiveRkakl] = useState<PpkRkaklDoc | null>(null);
  const [previewRkakl, setPreviewRkakl] = useState<PpkRkaklDoc | null>(null);
  const [recentNotifications, setRecentNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.allSettled([ppkService.getDashboard(), ppkService.getRkakl()])
      .then(([dashResult, rkaklResult]) => {
        if (!isMounted) return;

        if (dashResult.status === 'fulfilled') {
          const data = dashResult.value;
          if (data.stats) setStats(data.stats);
          if (data.pengajuanTerbaru) setPengajuanTerbaru(data.pengajuanTerbaru);
          if (data.recentNotifications) setRecentNotifications(data.recentNotifications);
          if (data.unreadNotificationsCount !== undefined) {
            setUnreadNotificationsCount(data.unreadNotificationsCount);
          }
        }

        if (rkaklResult.status === 'fulfilled') {
          const rkakl = rkaklResult.value;
          setActiveRkakl(rkakl.activeDoc ?? rkakl.data?.active_doc ?? null);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const dbRows: PpkTableRow[] = (pengajuanTerbaru || []).map((item, idx) => {
    const fb = FALLBACK_ROWS[idx % FALLBACK_ROWS.length];
    const permohonan = item.permohonan || item.Permohonan;
    const unitObj = permohonan?.unit || permohonan?.Unit;

    return {
      id: item.id,
      nomor_surat: permohonan?.nomor_surat || fb.nomor_surat,
      judul: permohonan?.judul || fb.judul,
      unit: unitObj?.nama || fb.unit,
      tanggal: item.created_at || fb.tanggal,
      nominal:
        item.nilai_kontrak ??
        item.nominal ??
        permohonan?.nominal ??
        permohonan?.estimasi_anggaran ??
        fb.nominal,
      status: idx === 0 || idx === 1 ? 'menunggu_persetujuan' : item.status || fb.status,
      sourceType: 'pengadaan',
    };
  });

  const rows = dbRows.length > 0 ? dbRows : FALLBACK_ROWS;

  return (
    <>
      <PpkDashboardTemplate
        navItems={PPK_NAV_ITEMS}
        stats={stats}
        rows={rows}
        activeRkakl={activeRkakl}
        isLoading={isLoading}
        hoveredBar={hoveredBar}
        onHoverBar={setHoveredBar}
        onPreviewRkakl={setPreviewRkakl}
        recentNotifications={recentNotifications}
        unreadNotificationsCount={unreadNotificationsCount}
      />
      <DocumentPreviewModal
        isOpen={Boolean(previewRkakl)}
        onClose={() => setPreviewRkakl(null)}
        category="Dokumen RKAKL Aktif (Read-Only)"
        filename={previewRkakl?.nama_asli}
        size={`Versi ${previewRkakl?.versi ?? 1} • PDF`}
      />
    </>
  );
};

export default PpkDashboard;
