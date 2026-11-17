import { useEffect, useState, useMemo, type FC, FormEvent } from 'react';
import ppbjService from '../../../services/ppbjService';
import { useAuth } from '../../../hooks/useAuth';
import PermohonanIndexTemplate from '../../../components/templates/PermohonanIndexTemplate';
import type { PpbjPermohonanItem } from '../../../types/ppbj';
import type { AppTopbarUser } from '../../../components/organisms/AppTopbar';

export const PpbjPermohonanIndex: FC = () => {
  const { user } = useAuth();
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [items, setItems] = useState<PpbjPermohonanItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedBulan, setSelectedBulan] = useState<string>('');
  const [selectedTahun, setSelectedTahun] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    setIsLoading(true);

    ppbjService
      .getPermohonanList(controller.signal)
      .then((data) => {
        if (!isMounted) return;
        setItems(data);
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          console.error('Failed to fetch PPBJ permohonan:', err);
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

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const nomor = (item.nomorSurat || '').toLowerCase();
      const judul = (item.judul || '').toLowerCase();
      const unit = (item.unitNama || '').toLowerCase();
      return nomor.includes(q) || judul.includes(q) || unit.includes(q);
    });
  }, [items, searchQuery]);

  return (
    <PermohonanIndexTemplate
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
      onSearchChange={setSearchQuery}
      onSearchSubmit={() => { }}
      onBulanChange={handleBulanChange}
      onTahunChange={handleTahunChange}
      onPageChange={setCurrentPage}
      onOpenFilterModal={() => setFilterModalOpen(true)}
      onCloseFilterModal={() => setFilterModalOpen(false)}
      onApplyFilter={handleApplyFilter}
    />
  );
};

export default PpbjPermohonanIndex;
