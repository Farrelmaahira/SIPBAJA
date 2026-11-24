import type { FC } from 'react';
import SharedProfilPage, { type SharedProfilPageProps } from '../../Shared/SharedProfilPage';
import { PEMOHON_NAV_ITEMS } from '../../../constants/pemohonNav';

export type PemohonProfilProps = SharedProfilPageProps;

export const PemohonProfilIndex: FC<PemohonProfilProps> = (props) => {
  return (
    <SharedProfilPage
      basePath="/pemohon"
      roleInitials="PM"
      roleTitle="Pemohon"
      roleSubtitle="Unit Pemohon"
      badgeLabel="Unit Pemohon"
      navItems={PEMOHON_NAV_ITEMS}
      {...props}
    />
  );
};

export default PemohonProfilIndex;
