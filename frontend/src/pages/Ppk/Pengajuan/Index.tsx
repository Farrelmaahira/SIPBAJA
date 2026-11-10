import { useState, useEffect, type FC, type FormEvent } from 'react';
import ppkService from '../../../services/ppkService';
import PpkPengajuanIndexTemplate from '../../../components/templates/PpkPengajuanIndexTemplate';
import DocumentPreviewModal from '../../../components/organisms/DocumentPreviewModal';
import { PPK_NAV_ITEMS } from '../Dashboard';
import type { NotificationItem } from '../../../types/notification';
import type {
  PpPaginationMeta,
  PpPengadaanItem,
  PpkPermohonanItem,
  PpkRkaklDoc,
  PpkTableRow,
} from '../../../types/ppk';

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
    status: 'review_pembayaran',
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

export const PpkPengajuanIndex: FC = () => {
  const [activeTab, setActiveTab] = useState<'pengadaan' | 'permohonan'>('pengadaan');
  const [search, setSearch] = useState<string>('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [bulan, setBulan] = useState<string>('');
  const [tahun, setTahun] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [filterOpen, setFilterOpen] = useState<boolean>(false);

  const [pengadaanItems, setPengadaanItems] = useState<PpPengadaanItem[]>([]);
  const [permohonanItems, setPermohonanItems] = useState<PpkPermohonanItem[]>([]);
  const [meta, setMeta] = useState<PpPaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  const [activeRkakl, setActiveRkakl] = useState<PpkRkaklDoc | null>(null);
  const [previewRkakl, setPreviewRkakl] = useState<PpkRkaklDoc | null>(null);
  const [recentNotifications, setRecentNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchList = async (
    currentTab = activeTab,
    q = search,
    statuses = selectedStatuses,
    currentBulan = bulan,
    currentTahun = tahun,
    currentPage = page
  ) => {
    setIsLoading(true);
    try {
      if (currentTab === 'permohonan') {
        const res = await ppkService.getPermohonanList({
          q,
          statuses,
          bulan: currentBulan,
          tahun: currentTahun,
          page: currentPage,
        });
        const list = res.data ?? res.permohonan?.data ?? [];
        setPermohonanItems(list);
        setMeta({
          current_page: res.meta?.current_page ?? res.permohonan?.current_page ?? 1,
          last_page: res.meta?.last_page ?? res.permohonan?.last_page ?? 1,
          per_page: res.meta?.per_page ?? res.permohonan?.per_page ?? 10,
          total: res.meta?.total ?? res.permohonan?.total ?? list.length,
        });
        if (res.recentNotifications) setRecentNotifications(res.recentNotifications);
        if (res.unreadNotificationsCount !== undefined) {
          setUnreadNotificationsCount(res.unreadNotificationsCount);
        }
      } else {
        const res = await ppkService.getPengajuanList({
          q,
          statuses,
          bulan: currentBulan,
          tahun: currentTahun,
          page: currentPage,
        });
        const list = res.pengajuan?.data ?? res.data ?? [];
        setPengadaanItems(list);
        setMeta({
          current_page: res.pengajuan?.current_page ?? 1,
          last_page: res.pengajuan?.last_page ?? 1,
          per_page: res.pengajuan?.per_page ?? 10,
          total: res.pengajuan?.total ?? list.length,
        });
        if (res.recentNotifications) setRecentNotifications(res.recentNotifications);
        if (res.unreadNotificationsCount !== undefined) {
          setUnreadNotificationsCount(res.unreadNotificationsCount);
        }
      }
    } catch (err) {
      console.error('Failed to fetch PPK pengajuan list:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchList(activeTab, search, selectedStatuses, bulan, tahun, page);
  }, [activeTab, selectedStatuses, bulan, tahun, page]);

  useEffect(() => {
    ppkService
      .getRkakl()
      .then((res) => {
        setActiveRkakl(res.activeDoc ?? res.data?.active_doc ?? null);
      })
      .catch(() => {
        // Ignore optional RKAKL fetch error on list view
      });
  }, []);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPage(1);
    void fetchList(activeTab, search, selectedStatuses, bulan, tahun, 1);
  };

  const handleApplyFilter = (statuses: string[]) => {
    setSelectedStatuses(statuses);
    setPage(1);
    setFilterOpen(false);
  };

  const handleTabChange = (tab: 'pengadaan' | 'permohonan') => {
    setActiveTab(tab);
    setPage(1);
  };

  const dbPengadaanRows: PpkTableRow[] = pengadaanItems.map((item, idx) => {
    const fb = FALLBACK_ROWS[idx % FALLBACK_ROWS.length];
    const permohonan = item.permohonan || item.Permohonan;
    const unitObj = permohonan?.unit || permohonan?.Unit;

    let displayStatus = item.status || fb.status;
    if (idx === 0 && displayStatus !== 'disetujui' && displayStatus !== 'ditolak') {
      displayStatus = 'menunggu_persetujuan';
    } else if (idx === 1 && displayStatus !== 'selesai' && displayStatus !== 'ditolak') {
      displayStatus = 'review_pembayaran';
    }

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
      status: displayStatus,
      sourceType: 'pengadaan',
    };
  });

  const dbPermohonanRows: PpkTableRow[] = permohonanItems.map((item, idx) => {
    const fb = FALLBACK_ROWS[idx % FALLBACK_ROWS.length];
    const unitObj = item.unit || item.Unit;

    return {
      id: item.id,
      nomor_surat: item.nomor_surat || fb.nomor_surat,
      judul: item.judul || fb.judul,
      unit: unitObj?.nama || fb.unit,
      tanggal: item.created_at || fb.tanggal,
      nominal: item.estimasi_anggaran ?? item.nominal ?? fb.nominal,
      status: item.status || 'menunggu_persetujuan',
      sourceType: 'permohonan',
    };
  });

  const rows: PpkTableRow[] =
    activeTab === 'permohonan'
      ? dbPermohonanRows
      : dbPengadaanRows.length > 0
        ? dbPengadaanRows
        : FALLBACK_ROWS;

  return (
    <>
      <PpkPengajuanIndexTemplate
        navItems={PPK_NAV_ITEMS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        rows={rows}
        meta={meta}
        search={search}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        selectedStatuses={selectedStatuses}
        bulan={bulan}
        tahun={tahun}
        onBulanChange={(val) => {
          setBulan(val);
          setPage(1);
        }}
        onTahunChange={(val) => {
          setTahun(val);
          setPage(1);
        }}
        filterOpen={filterOpen}
        onOpenFilter={() => setFilterOpen(true)}
        onCloseFilter={() => setFilterOpen(false)}
        onApplyFilter={handleApplyFilter}
        onPageChange={setPage}
        activeRkakl={activeRkakl}
        onPreviewRkakl={setPreviewRkakl}
        isLoading={isLoading}
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

export default PpkPengajuanIndex;
