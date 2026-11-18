import type { FC } from 'react';
import PpkPermohonanIndexTemplate from '../../../components/templates/PPK/PpkPermohonanIndexTemplate';
import { usePpkPermohonanList } from '../../../hooks/usePpkPermohonanList';
import { useNotifications } from '../../../hooks/useNotifications';
import { PPK_NAV_ITEMS } from '@/constants/ppkNav';

export const PpkPermohonanIndex: FC = () => {
  const list = usePpkPermohonanList();
  const { recentNotifications, unreadCount } = useNotifications();

  return (
    <PpkPermohonanIndexTemplate
      navItems={PPK_NAV_ITEMS}
      rows={list.data}
      meta={list.meta}
      search={list.search}
      onSearchChange={list.setSearch}
      onSearchSubmit={list.handleSearchSubmit}
      selectedStatuses={list.selectedStatuses}
      bulan={list.bulan}
      tahun={list.tahun}
      onBulanChange={list.setBulan}
      onTahunChange={list.setTahun}
      filterOpen={list.filterOpen}
      onOpenFilter={() => list.setFilterOpen(true)}
      onCloseFilter={() => list.setFilterOpen(false)}
      onApplyFilter={list.handleApplyFilter}
      onPageChange={list.setPage}
      isLoading={list.isLoading}
      error={list.error}
      recentNotifications={recentNotifications}
      unreadNotificationsCount={unreadCount}
    />
  );
};

export default PpkPermohonanIndex;
