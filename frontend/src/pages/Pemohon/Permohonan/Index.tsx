import type { FC, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import usePemohonPermohonan from '../../../hooks/usePemohonPermohonan';
import PemohonPermohonanIndexTemplate from '../../../components/templates/PemohonPermohonanIndexTemplate';
import type { PermohonanItem } from '../../../types/permohonan';

export const PermohonanIndex: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    items,
    pagination,
    isLoading,
    hasError,
    errorMessage,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    filterModalOpen,
    setFilterModalOpen,
    handlePageChange,
    handleSearchSubmit,
    handleApplyFilter,
    handleResetFilter,
    refetch,
  } = usePemohonPermohonan();

  const selectedStatuses =
    selectedStatus && selectedStatus !== 'semua'
      ? selectedStatus.split(',')
      : [];

  const handleApplyFilterStatuses = (statuses: string[]) => {
    handleApplyFilter(statuses.length > 0 ? statuses.join(',') : 'semua');
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    handleSearchSubmit();
  };

  const handleView = (item: PermohonanItem) => {
    navigate(`/pemohon/permohonan/${item.id}`);
  };

  return (
    <PemohonPermohonanIndexTemplate
      user={user}
      items={items}
      isLoading={isLoading}
      hasError={hasError}
      errorMessage={errorMessage}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onSearchSubmit={(e: FormEvent) => handleSearchSubmit(e)}
      onClearSearch={handleClearSearch}
      filterModalOpen={filterModalOpen}
      onToggleFilterModal={setFilterModalOpen}
      selectedStatuses={selectedStatuses}
      onApplyFilters={handleApplyFilterStatuses}
      onResetFilters={handleResetFilter}
      pagination={pagination}
      onPageChange={handlePageChange}
      onRetry={refetch}
      onCreatePermohonan={() => navigate('/pemohon/permohonan/create')}
      onView={handleView}
    />
  );
};

export default PermohonanIndex;
