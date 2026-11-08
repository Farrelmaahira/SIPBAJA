import type { FC } from 'react';
import SharedNotifikasiPage, { type SharedNotifikasiPageProps } from '../../Shared/SharedNotifikasiPage';
import type { NotificationItem } from '../../../types/notification';

export type { NotificationItem as PpNotificationItem };
export type PpNotifikasiProps = SharedNotifikasiPageProps;

export const PpNotifikasiIndex: FC<PpNotifikasiProps> = (props) => {
  return (
    <SharedNotifikasiPage
      basePath="/pp"
      roleInitials="PP"
      roleTitle="PP"
      roleSubtitle="Pejabat Pengadaan"
      {...props}
    />
  );
};

export default PpNotifikasiIndex;
