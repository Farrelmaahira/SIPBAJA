import type { FC } from 'react';
import usePpPengajuan from '../../../hooks/usePpPengajuan';
import PpPengajuanIndexTemplate from '../../../components/templates/PpPengajuanIndexTemplate';

export const PpPengajuanIndex: FC = () => {
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
  } = usePpPengajuan();

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
      errorMessage={error || ''}
      filterModalOpen={filterModalOpen}
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

export default PpPengajuanIndex;
