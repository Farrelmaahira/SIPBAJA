import type { FC } from 'react';
import PpNotifikasiIndex, { type PpNotifikasiProps } from '../../Pp/Notifikasi/Index';
import { PPK_NAV_ITEMS } from '../Dashboard';

export const PpkNotifikasiIndex: FC<PpNotifikasiProps> = (props) => {
  return (
    <PpNotifikasiIndex
      {...props}
      basePath="/ppk"
      roleInitials="PPK"
      roleTitle="PPK"
      roleSubtitle="Pejabat Pembuat Komitmen"
      navItems={PPK_NAV_ITEMS}
    />
  );
};

export default PpkNotifikasiIndex;
