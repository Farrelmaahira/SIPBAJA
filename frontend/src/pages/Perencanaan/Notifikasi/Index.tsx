import type { FC } from 'react';
import PpNotifikasiIndex, { type PpNotifikasiProps } from '../../Pp/Notifikasi/Index';
import { PERENCANAAN_NAV_ITEMS } from '../Dashboard';

export const PerencanaanNotifikasiIndex: FC<PpNotifikasiProps> = (props) => {
  return (
    <PpNotifikasiIndex
      {...props}
      basePath="/perencanaan"
      roleInitials="PR"
      roleTitle="Perencanaan"
      roleSubtitle="Pejabat Perencanaan"
      navItems={PERENCANAAN_NAV_ITEMS}
    />
  );
};

export default PerencanaanNotifikasiIndex;
