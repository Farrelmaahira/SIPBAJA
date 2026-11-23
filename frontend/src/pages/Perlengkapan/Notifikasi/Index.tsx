import type { FC } from 'react';
import SharedNotifikasiPage, { type SharedNotifikasiPageProps } from '../../Shared/SharedNotifikasiPage';
import { PERLENGKAPAN_NAV_ITEMS } from '../../../constants/perlengkapanNav';

export type PerlengkapanNotifikasiProps = SharedNotifikasiPageProps;

export const PerlengkapanNotifikasiIndex: FC<PerlengkapanNotifikasiProps> = (props) => {
  return (
    <SharedNotifikasiPage
      basePath="/perlengkapan"
      roleInitials="PL"
      roleTitle="Perlengkapan"
      roleSubtitle="Unit Perlengkapan"
      navItems={PERLENGKAPAN_NAV_ITEMS}
      {...props}
    />
  );
};

export default PerlengkapanNotifikasiIndex;
