import type { FC } from 'react';
import PpProfilIndex, { type PpProfilProps } from '../../Pp/Profil/Index';
import { PERENCANAAN_NAV_ITEMS } from '../Dashboard';

export const PerencanaanProfilIndex: FC<PpProfilProps> = (props) => {
  return (
    <PpProfilIndex
      {...props}
      basePath="/perencanaan"
      roleInitials="PR"
      roleTitle="Perencanaan"
      roleSubtitle="Unit Perencanaan"
      navItems={PERENCANAAN_NAV_ITEMS}
    />
  );
};

export default PerencanaanProfilIndex;
