import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import useBidang2Pengajuan from '../../../hooks/useBidang2Pengajuan';
import bidang2Service from '../../../services/bidang2Service';
import Bidang2PengajuanIndexTemplate from '../../../components/templates/Bidang2PengajuanIndexTemplate';

export const PengajuanIndex: FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    items,
    pagination,
    isLoading,
    hasError,
    errorMessage,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    selectedStatuses,
    filterModalOpen,
    setFilterModalOpen,
    handleSearchSubmit,
    handleStatusChange,
    handleApplyFilter,
    handlePageChange,
    refetch,
  } = useBidang2Pengajuan();

  const handleDownloadDokumen = (id: number | string) => {
    const url = bidang2Service.downloadDokumenUrl(id);
    window.open(`${url}?disposition=inline`, '_blank');
  };

  return (
    <Bidang2PengajuanIndexTemplate
      user={user}
      items={items}
      isLoading={isLoading}
      hasError={hasError}
      errorMessage={errorMessage}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onSearchSubmit={handleSearchSubmit}
      selectedStatus={selectedStatus}
      selectedStatuses={selectedStatuses}
      filterModalOpen={filterModalOpen}
      onOpenFilterModal={() => setFilterModalOpen(true)}
      onCloseFilterModal={() => setFilterModalOpen(false)}
      onApplyFilter={handleApplyFilter}
      onStatusChange={handleStatusChange}
      pagination={pagination}
      onPageChange={handlePageChange}
      onViewDetail={(id) => navigate(`/bidang-2/pengajuan/${id}`)}
      onDownloadDokumen={handleDownloadDokumen}
      onRetry={refetch}
    />
  );
};

export default PengajuanIndex;
