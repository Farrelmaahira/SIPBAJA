import type { FC } from 'react';
import SharedProfilPage, { type SharedProfilPageProps } from '../../Shared/SharedProfilPage';
import { PPK_NAV_ITEMS } from '../Dashboard';

export type PpkProfilProps = SharedProfilPageProps;

export const PpkProfilIndex: FC<PpkProfilProps> = (props) => {
  return (
    <SharedProfilPage
      basePath="/ppk"
      roleInitials="PPK"
      roleTitle="PPK"
      roleSubtitle="Pejabat Pembuat Komitmen"
      badgeLabel="Pejabat Pembuat Komitmen"
      navItems={PPK_NAV_ITEMS}
      {...props}
    />
  );
};

export default PpkProfilIndex;
