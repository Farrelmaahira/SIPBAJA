import { useState, type FC } from 'react';
import PpkPengajuanIndexTemplate from '../../../components/templates/PPK/PpkPengajuanIndexTemplate';
import DocumentPreviewModal from '../../../components/organisms/DocumentPreviewModal';
import { usePpkPengajuan } from '../../../hooks/usePpkPengajuan';
import type { PpkRkaklDoc } from '../../../types/ppk';
import { PPK_NAV_ITEMS } from '@/constants/ppkNav';

export const PpkPengajuanIndex: FC = () => {
  const {
    rows,
    meta,
    search,
    setSearch,
    handleSearchSubmit,
    selectedStatuses,
    bulan,
    tahun,
    setBulan,
    setTahun,
    filterOpen,
    setFilterOpen,
    handleApplyFilter,
    setPage,
    activeRkakl,
    isLoading,
    recentNotifications,
    unreadNotificationsCount,
  } = usePpkPengajuan();

  const [previewRkakl, setPreviewRkakl] = useState<PpkRkaklDoc | null>(null);

  return (
    <>
      <PpkPengajuanIndexTemplate
        navItems={PPK_NAV_ITEMS}
        rows={rows}
        meta={meta}
        search={search}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        selectedStatuses={selectedStatuses}
        bulan={bulan}
        tahun={tahun}
        onBulanChange={setBulan}
        onTahunChange={setTahun}
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
