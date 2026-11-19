import type { FC } from 'react';
import SharedNotifikasiPage, { type SharedNotifikasiPageProps } from '../../Shared/SharedNotifikasiPage';
import { KEUANGAN_NAV_ITEMS } from '../../../constants/keuanganNav';

export type KeuanganNotifikasiProps = SharedNotifikasiPageProps;

export const KeuanganNotifikasiIndex: FC<KeuanganNotifikasiProps> = (props) => {
  return (
    <SharedNotifikasiPage
      basePath="/keuangan"
      roleInitials="KE"
      roleTitle="Keuangan"
      roleSubtitle="Unit Keuangan"
      navItems={KEUANGAN_NAV_ITEMS}
      {...props}
    />
  );
};

export default KeuanganNotifikasiIndex;
