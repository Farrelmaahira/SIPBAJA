import { useState, useEffect, type FC, type FormEvent } from 'react';
import PerencanaanPengajuanIndexTemplate from '../../../components/templates/PerencanaanPengajuanIndexTemplate';
import perencanaanService from '../../../services/perencanaanService';

export const PerencanaanPengajuanIndex: FC = () => {
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPengajuan = async (
    q = searchQuery,
    statuses = selectedStatuses,
    signal?: AbortSignal
  ) => {
    setIsLoading(true);
    try {
      const res = await perencanaanService.getPengajuanList(
        { q, statuses },
        signal
      );

      if (res.permohonan?.data) {
        setItems(res.permohonan.data);
        setTotalCount(res.permohonan.total || res.permohonan.data.length);
      } else if (Array.isArray(res.data)) {
        setItems(res.data);
        setTotalCount(res.data.length);
      } else {
        setItems([]);
        setTotalCount(0);
      }
    } catch (err: any) {
      if (!signal?.aborted) {
        console.error('Failed to fetch Perencanaan pengajuan:', err);
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    void fetchPengajuan(searchQuery, selectedStatuses, controller.signal);
    return () => controller.abort();
  }, [selectedStatuses]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    void fetchPengajuan(searchQuery, selectedStatuses);
  };

  const handleApplyFilter = (statuses: string[]) => {
    setSelectedStatuses(statuses);
  };

  return (
    <PerencanaanPengajuanIndexTemplate
      items={items}
      totalCount={totalCount}
      searchQuery={searchQuery}
      selectedStatuses={selectedStatuses}
      isLoading={isLoading}
      filterModalOpen={filterModalOpen}
      onSearchChange={setSearchQuery}
      onSearchSubmit={handleSearchSubmit}
      onOpenFilterModal={() => setFilterModalOpen(true)}
      onCloseFilterModal={() => setFilterModalOpen(false)}
      onApplyFilter={handleApplyFilter}
    />
  );
};

export default PerencanaanPengajuanIndex;
