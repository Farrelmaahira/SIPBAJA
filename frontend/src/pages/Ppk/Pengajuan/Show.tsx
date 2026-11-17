import { useState, useEffect, type FC } from 'react';
import { useParams } from 'react-router-dom';
import ppkService from '../../../services/ppkService';
import { PPK_NAV_ITEMS } from '../Dashboard';
import type { NotificationItem } from '../../../types/notification';
import type { PpPengadaanDetailPayload } from '../../../types/pp';
import PpPengajuanShowTemplate from '../../../components/templates/PpPengajuanShowTemplate';

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
    if (initialDetail) {
      setDetail(initialDetail);
      return;
    }
    if (!id) return;

    const controller = new AbortController();
    ppkService
      .getPengajuanShow(id, controller.signal)
      .then((res) => {
        const payload = res.detail || res.data || {};
        setDetail(payload);
        if (res.recentNotifications) setRecentNotifications(res.recentNotifications);
        if (res.unreadNotificationsCount !== undefined) {
          setUnreadNotificationsCount(res.unreadNotificationsCount);
        }
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) {
          console.error('Failed to fetch PPK pengajuan show:', err);
        }
      });

    return () => {
      controller.abort();
    };
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
