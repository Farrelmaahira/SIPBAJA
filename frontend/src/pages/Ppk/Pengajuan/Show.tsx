import type { FC } from 'react';
import PpPengajuanShow, { type PpShowProps } from '../../Pp/Pengajuan/Show';
import { PPK_NAV_ITEMS } from '../Dashboard';

export const PpkPengajuanShow: FC<PpShowProps> = (props) => {
  return (
    <PpPengajuanShow
      {...props}
      basePath="/ppk"
      roleInitials="PPK"
      roleTitle="PPK"
      roleSubtitle="Pejabat Pembuat Komitmen"
      navItems={PPK_NAV_ITEMS}
    />
  );
};

export default PpkPengajuanShow;
