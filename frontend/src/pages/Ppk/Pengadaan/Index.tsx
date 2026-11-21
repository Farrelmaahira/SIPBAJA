import type { FC } from 'react';
import usePpPengajuan from '../../../hooks/usePpPengajuan';
import PpkPengadaanIndexTemplate from '../../../components/templates/PPK/PpkPengadaanIndexTemplate';
import { PPK_NAV_ITEMS } from '@/constants/ppkNav';

export const PpkPengadaanIndex: FC = () => {
  const {
    items,
    totalCount,
    currentPage,
    lastPage,
    searchQuery,
    selectedStatuses,
    selectedBulan,
    selectedTahun,
    filterModalOpen,
    isLoading,
    error,
    setSearchQuery,
    setSelectedBulan,
    setSelectedTahun,
    setCurrentPage,
    setFilterModalOpen,
    handleSearchSubmit,
    handleApplyFilter,
  } = usePpPengajuan('/ppk');

  return (
    <PpkPengadaanIndexTemplate
      items={items}
      totalCount={totalCount}
      searchQuery={searchQuery}
      selectedStatuses={selectedStatuses}
      selectedBulan={selectedBulan}
      selectedTahun={selectedTahun}
      currentPage={currentPage}
      lastPage={lastPage}
      isLoading={isLoading}
      errorMessage={error || ''}
      filterModalOpen={filterModalOpen}
      navItems={PPK_NAV_ITEMS}
      onSearchChange={setSearchQuery}
      onSearchSubmit={handleSearchSubmit}
      onBulanChange={setSelectedBulan}
      onTahunChange={setSelectedTahun}
      onPageChange={setCurrentPage}
      onOpenFilterModal={() => setFilterModalOpen(true)}
      onCloseFilterModal={() => setFilterModalOpen(false)}
      onApplyFilter={handleApplyFilter}
    />
  );
};

export default PpkPengadaanIndex;
