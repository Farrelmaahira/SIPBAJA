import type { FC } from 'react';
import SharedNotifikasiPage, { type SharedNotifikasiPageProps } from '../../Shared/SharedNotifikasiPage';
import { PEMOHON_NAV_ITEMS } from '../../../constants/pemohonNav';

export type PemohonNotifikasiProps = SharedNotifikasiPageProps;

export const PemohonNotifikasiIndex: FC<PemohonNotifikasiProps> = (props) => {
  return (
    <SharedNotifikasiPage
      basePath="/pemohon"
      roleInitials="PM"
      roleTitle="Pemohon"
      roleSubtitle="Unit Pemohon"
      navItems={PEMOHON_NAV_ITEMS}
      {...props}
    />
  );
};

export default PemohonNotifikasiIndex;
