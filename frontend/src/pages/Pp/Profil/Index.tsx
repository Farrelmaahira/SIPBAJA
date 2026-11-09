import type { FC } from 'react';
import SharedProfilPage, { type SharedProfilPageProps } from '../../Shared/SharedProfilPage';

export type PpProfilProps = SharedProfilPageProps;

export const PpProfilIndex: FC<PpProfilProps> = (props) => {
  return (
    <SharedProfilPage
      basePath="/pp"
      roleInitials="PP"
      roleTitle="PP"
      roleSubtitle="Pejabat Pengadaan"
      badgeLabel="Pejabat Pengadaan"
      {...props}
    />
  );
};

export default PpProfilIndex;
