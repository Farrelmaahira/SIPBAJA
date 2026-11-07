import type { FC } from 'react';
import SharedProfilPage, { type SharedProfilPageProps } from '../../Shared/SharedProfilPage';
import { PERENCANAAN_NAV_ITEMS } from '../Dashboard';

export type PerencanaanProfilProps = SharedProfilPageProps;

export const PerencanaanProfilIndex: FC<PerencanaanProfilProps> = (props) => {
  return (
    <SharedProfilPage
      basePath="/perencanaan"
      roleInitials="PR"
      roleTitle="Perencanaan"
      roleSubtitle="Unit Perencanaan"
      badgeLabel="Unit Perencanaan"
      navItems={PERENCANAAN_NAV_ITEMS}
      {...props}
    />
  );
};

export default PerencanaanProfilIndex;
