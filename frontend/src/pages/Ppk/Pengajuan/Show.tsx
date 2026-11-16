import { useState, useEffect, type FC } from 'react';
import { useParams } from 'react-router-dom';
import ppkService from '../../../services/ppkService';
import PpPengajuanShowTemplate from '../../../components/templates/PpPengajuanShowTemplate';
import { PPK_NAV_ITEMS } from '../Dashboard';
import type { NotificationItem } from '../../../types/notification';
import type { PpPengadaanDetailPayload } from '../../../types/ppk';

export interface PpkShowProps {
  detail?: PpPengadaanDetailPayload;
  recentNotifications?: NotificationItem[];
  unreadNotificationsCount?: number;
}

export const PpkPengajuanShow: FC<PpkShowProps> = ({
  detail: initialDetail,
  recentNotifications: initialNotifs = [],
  unreadNotificationsCount: initialUnreadCount = 0,
}) => {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<PpPengadaanDetailPayload>(initialDetail || {});
  const [recentNotifications, setRecentNotifications] = useState<NotificationItem[]>(initialNotifs);
  const [unreadNotificationsCount, setUnreadNotificationsCount] =
    useState<number>(initialUnreadCount);
  const [galleryOpen, setGalleryOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!initialDetail && id) {
      let isMounted = true;
      ppkService
        .getPengajuanShow(id)
        .then((res) => {
          if (!isMounted) return;
          setDetail(res.detail ?? res.data ?? {});
          if (res.recentNotifications) setRecentNotifications(res.recentNotifications);
          if (res.unreadNotificationsCount !== undefined) {
            setUnreadNotificationsCount(res.unreadNotificationsCount);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch PPK pengajuan show:', err);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [id, initialDetail]);

  return (
    <PpPengajuanShowTemplate
      detail={detail}
      recentNotifications={recentNotifications}
      unreadNotificationsCount={unreadNotificationsCount}
      basePath="/ppk"
      roleInitials="PPK"
      roleTitle="PPK"
      roleSubtitle="Pejabat Pembuat Komitmen"
      navItems={PPK_NAV_ITEMS}
      galleryOpen={galleryOpen}
      onOpenGallery={() => setGalleryOpen(true)}
      onCloseGallery={() => setGalleryOpen(false)}
    />
  );
};

export default PpkPengajuanShow;
