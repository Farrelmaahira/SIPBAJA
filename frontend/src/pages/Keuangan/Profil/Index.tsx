import type { FC } from 'react';
import SharedProfilPage, { type SharedProfilPageProps } from '../../Shared/SharedProfilPage';
import { KEUANGAN_NAV_ITEMS } from '../../../constants/keuanganNav';

export type KeuanganProfilProps = SharedProfilPageProps;

export const KeuanganProfilIndex: FC<KeuanganProfilProps> = (props) => {
  return (
    <SharedProfilPage
      basePath="/keuangan"
      roleInitials="KE"
      roleTitle="Keuangan"
      roleSubtitle="Unit Keuangan"
      badgeLabel="Unit Keuangan"
      navItems={KEUANGAN_NAV_ITEMS}
      {...props}
    />
  );
};

export default KeuanganProfilIndex;
