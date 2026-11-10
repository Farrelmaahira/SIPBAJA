import { useState, useEffect, type FC, type FormEvent } from 'react';
import ppService from '../../../services/ppService';
import PpPengajuanIndexTemplate from '../../../components/templates/PpPengajuanIndexTemplate';
import type { PpPengadaanItem } from '../../../types/pp';
import type { NotificationItem } from '../../../types/notification';

export type { PpPengadaanItem as PpPengajuanItem };

export const PpPengajuanIndex: FC = () => {
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedBulan, setSelectedBulan] = useState<string>('');
  const [selectedTahun, setSelectedTahun] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [items, setItems] = useState<PpPengadaanItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [recentNotifications, setRecentNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const fetchPengajuan = async (
    q = searchQuery,
    statuses = selectedStatuses,
    bulan = selectedBulan,
    tahun = selectedTahun,
    page = currentPage,
    signal?: AbortSignal
  ) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await ppService.getPengajuanList(
        {
          q,
          statuses,
          bulan: bulan || undefined,
          tahun: tahun || undefined,
          page,
        },
        signal
      );

      if (data.pengajuan?.data) {
        setItems(data.pengajuan.data);
        setTotalCount(data.pengajuan.total ?? data.pengajuan.data.length);
        setCurrentPage(data.pengajuan.current_page ?? page);
        setLastPage(data.pengajuan.last_page ?? 1);
      } else if (Array.isArray(data.data)) {
        setItems(data.data);
        setTotalCount(data.data.length);
        setCurrentPage(1);
        setLastPage(1);
      } else {
        setItems([]);
        setTotalCount(0);
      }

      if (data.recentNotifications) setRecentNotifications(data.recentNotifications);
      if (data.unreadNotificationsCount !== undefined) {
        setUnreadNotificationsCount(data.unreadNotificationsCount);
      }
    } catch (err: unknown) {
      if (!signal?.aborted) {
        console.error('Failed to fetch PP pengajuan:', err);
        setErrorMessage('Gagal memuat daftar pengajuan PP.');
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    void fetchPengajuan(
      searchQuery,
      selectedStatuses,
      selectedBulan,
      selectedTahun,
      currentPage,
      controller.signal
    );
    return () => controller.abort();
  }, [selectedStatuses, selectedBulan, selectedTahun, currentPage]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    void fetchPengajuan(searchQuery, selectedStatuses, selectedBulan, selectedTahun, 1);
  };

  const handleApplyFilter = (statuses: string[]) => {
    setCurrentPage(1);
    setSelectedStatuses(statuses);
  };

  const handleBulanChange = (bulan: string) => {
    setCurrentPage(1);
    setSelectedBulan(bulan);
  };

  const handleTahunChange = (tahun: string) => {
    setCurrentPage(1);
    setSelectedTahun(tahun);
  };

  return (
    <PpPengajuanIndexTemplate
      items={items}
      totalCount={totalCount}
      searchQuery={searchQuery}
      selectedStatuses={selectedStatuses}
      selectedBulan={selectedBulan}
      selectedTahun={selectedTahun}
      currentPage={currentPage}
      lastPage={lastPage}
      isLoading={isLoading}
      errorMessage={errorMessage}
      filterModalOpen={filterModalOpen}
      recentNotifications={recentNotifications}
      unreadNotificationsCount={unreadNotificationsCount}
      onSearchChange={setSearchQuery}
      onSearchSubmit={handleSearchSubmit}
      onBulanChange={handleBulanChange}
      onTahunChange={handleTahunChange}
      onPageChange={setCurrentPage}
      onOpenFilterModal={() => setFilterModalOpen(true)}
      onCloseFilterModal={() => setFilterModalOpen(false)}
      onApplyFilter={handleApplyFilter}
    />
  );
};

export default PpPengajuanIndex;
