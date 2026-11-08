import type { FC } from 'react';
import SharedNotifikasiPage, { type SharedNotifikasiPageProps } from '../../Shared/SharedNotifikasiPage';
import { PERENCANAAN_NAV_ITEMS } from '../Dashboard';

export type PerencanaanNotifikasiProps = SharedNotifikasiPageProps;

export const PerencanaanNotifikasiIndex: FC<PerencanaanNotifikasiProps> = (props) => {
  return (
    <SharedNotifikasiPage
      basePath="/perencanaan"
      roleInitials="PR"
      roleTitle="Perencanaan"
      roleSubtitle="Unit Perencanaan"
      navItems={PERENCANAAN_NAV_ITEMS}
      {...props}
    />
  );
};

export default PerencanaanNotifikasiIndex;
