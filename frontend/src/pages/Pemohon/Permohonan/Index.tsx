import { useState, type FC, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import usePemohonPermohonan from '../../../hooks/usePemohonPermohonan';
import PemohonPermohonanIndexTemplate from '../../../components/templates/PemohonPermohonanIndexTemplate';
import type { PermohonanRowData } from '../../../components/molecules/PermohonanRow';
import type { PermohonanDetailData } from '../../../components/organisms/DetailPermohonanModal';

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

  const [selectedPermohonan, setSelectedPermohonan] =
    useState<PermohonanDetailData | null>(null);

  const handleOpenDetailModal = (item: PermohonanRowData) => {
    const detailData: PermohonanDetailData = {
      id: item.id ?? '',
      nomor_surat: item.nomor_surat ?? '-',
      judul: item.judul ?? 'Tanpa Judul',
      status: (item.status as any) ?? 'diajukan',
      tanggal: item.created_at ?? null,
      nilai_pengajuan: Number(item.estimasi_anggaran ?? 0),
      deskripsi: (item.ringkasan_tujuan as string) ?? '',
      dokumen: Array.isArray(item.dokumen) ? (item.dokumen as any) : [],
    };
    setSelectedPermohonan(detailData);
  };

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
      onViewDetailModal={handleOpenDetailModal}
      selectedDetailModalItem={selectedPermohonan}
      onCloseDetailModal={() => setSelectedPermohonan(null)}
    />
  );
};

export default PermohonanIndex;
