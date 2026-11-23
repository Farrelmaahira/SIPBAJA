import type { FC } from 'react';
import SharedProfilPage, { type SharedProfilPageProps } from '../../Shared/SharedProfilPage';
import { PERLENGKAPAN_NAV_ITEMS } from '../../../constants/perlengkapanNav';

export type PerlengkapanProfilProps = SharedProfilPageProps;

export const PerlengkapanProfilIndex: FC<PerlengkapanProfilProps> = (props) => {
  return (
    <SharedProfilPage
      basePath="/perlengkapan"
      roleInitials="PL"
      roleTitle="Perlengkapan"
      roleSubtitle="Unit Perlengkapan"
      badgeLabel="Unit Perlengkapan"
      navItems={PERLENGKAPAN_NAV_ITEMS}
      {...props}
    />
  );
};

export default PerlengkapanProfilIndex;
