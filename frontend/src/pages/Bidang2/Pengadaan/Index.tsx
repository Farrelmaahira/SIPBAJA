import { useState, useEffect, type FC, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import bidang2Service from '../../../services/bidang2Service';
import Bidang2PengadaanIndexTemplate from '../../../components/templates/Bidang2PengadaanIndexTemplate';
import type { Bidang2TableItem } from '../../../components/organisms/Bidang2PermohonanTable';

const FALLBACK_PENGADAAN_ITEMS: Bidang2TableItem[] = [
  {
    id: 1,
    nomor_pengadaan: '01010-FF-11',
    nomor_permohonan: 'Permohonan 111-FFF-111',
    judul: 'Pengadaan Komputer Lab Multimedia',
    unit_nama: 'Jurusan Teknik Informatika',
    nominal: 185000000,
    status: 'Review Pengajuan',
    created_at: '2026-10-12',
  },
  {
    id: 2,
    nomor_pengadaan: '01011-FF-11',
    nomor_permohonan: 'Permohonan 112-FFF-111',
    judul: 'Peremajaan Server Data Center',
    unit_nama: 'Unit Sistem Informasi',
    nominal: 420000000,
    status: 'Review Pengajuan',
    created_at: '2026-10-14',
  },
  {
    id: 3,
    nomor_pengadaan: '01012-FF-11',
    nomor_permohonan: 'Permohonan 113-FFF-111',
    judul: 'Pengadaan AC Ruang Kelas Gedung Q',
    unit_nama: 'Bagian Umum',
    nominal: 92000000,
    status: 'Review Pengajuan',
    created_at: '2026-10-18',
  },
  {
    id: 4,
    nomor_pengadaan: '01013-FF-11',
    nomor_permohonan: 'Permohonan 114-FFF-111',
    judul: 'Pembaruan Lisensi Software Kampus',
    unit_nama: 'Pusat Komputer',
    nominal: 145000000,
    status: 'Review Pengajuan',
    created_at: '2026-10-20',
  },
];

export const Bidang2PengadaanIndex: FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [allItems, setAllItems] = useState<Bidang2TableItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    setIsLoading(true);
    setHasError(false);

    bidang2Service
      .getDashboard(undefined, controller.signal)
      .then((res) => {
        if (!isMounted) return;
        const pengadaanData = res.riwayatPengadaanTerbaru;
        if (pengadaanData && pengadaanData.length > 0) {
          setAllItems(pengadaanData as Bidang2TableItem[]);
        } else {
          setAllItems(FALLBACK_PENGADAAN_ITEMS);
        }
      })
      .catch((_err: unknown) => {
        if (!isMounted || controller.signal.aborted) return;
        setAllItems(FALLBACK_PENGADAAN_ITEMS);
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
  }, [refreshTrigger]);

  // Client-side filtering & pagination
  const filteredItems = allItems.filter((item) => {
    if (appliedSearch) {
      const q = appliedSearch.toLowerCase();
      const matchNomor =
        String(item.nomor_pengadaan || '').toLowerCase().includes(q) ||
        String(item.nomor_permohonan || '').toLowerCase().includes(q);
      const matchJudul = String(item.judul || '').toLowerCase().includes(q);
      const matchUnit = String(item.unit_nama || '').toLowerCase().includes(q);
      if (!matchNomor && !matchJudul && !matchUnit) return false;
    }

    if (selectedStatuses.length > 0) {
      const statusKey = String(item.status || '').toLowerCase().replace(/\s+/g, '_');
      if (!selectedStatuses.includes(statusKey)) return false;
    }

    return true;
  });

  const total = filteredItems.length;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const from = total > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const to = Math.min(currentPage * pageSize, total);
  const displayedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSearchSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    setAppliedSearch(searchQuery.trim());
    setCurrentPage(1);
  };

  const handleApplyFilter = (statuses: string[]) => {
    setSelectedStatuses(statuses);
    setCurrentPage(1);
  };

  return (
    <Bidang2PengadaanIndexTemplate
      user={user}
      items={displayedItems}
      isLoading={isLoading}
      hasError={hasError}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onSearchSubmit={handleSearchSubmit}
      selectedStatuses={selectedStatuses}
      onApplyFilter={handleApplyFilter}
      pagination={{
        currentPage,
        lastPage,
        total,
        from,
        to,
      }}
      onPageChange={setCurrentPage}
      onViewDetail={(id) => navigate(`/bidang-2/pengadaan/${id}`)}
      onRetry={() => setRefreshTrigger((prev) => prev + 1)}
    />
  );
};

export default Bidang2PengadaanIndex;

