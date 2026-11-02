import type { FC } from 'react';
import PpProfilIndex, { type PpProfilProps } from '../../Pp/Profil/Index';
import { PPK_NAV_ITEMS } from '../Dashboard';

export const PpkProfilIndex: FC<PpProfilProps> = (props) => {
  return (
    <PpProfilIndex
      {...props}
      basePath="/ppk"
      roleInitials="PPK"
      roleTitle="PPK"
      roleSubtitle="Pejabat Pembuat Komitmen"
      navItems={PPK_NAV_ITEMS}
    />
  );
};

export default PpkProfilIndex;
