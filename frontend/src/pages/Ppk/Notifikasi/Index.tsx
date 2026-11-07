import type { FC } from 'react';
import SharedNotifikasiPage, { type SharedNotifikasiPageProps } from '../../Shared/SharedNotifikasiPage';
import { PPK_NAV_ITEMS } from '../Dashboard';

export type PpkNotifikasiProps = SharedNotifikasiPageProps;

export const PpkNotifikasiIndex: FC<PpkNotifikasiProps> = (props) => {
  return (
    <SharedNotifikasiPage
      basePath="/ppk"
      roleInitials="PPK"
      roleTitle="PPK"
      roleSubtitle="Pejabat Pembuat Komitmen"
      navItems={PPK_NAV_ITEMS}
      {...props}
    />
  );
};

export default PpkNotifikasiIndex;
