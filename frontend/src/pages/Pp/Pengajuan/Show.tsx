import { useState, useEffect, type FC } from 'react';
import { useParams } from 'react-router-dom';
import ppService from '../../../services/ppService';
import PpPengajuanShowTemplate from '../../../components/templates/PpPengajuanShowTemplate';
import type { PpNavItem } from '../../../components/templates/PpLayout';
import type { PpPengadaanDetailPayload } from '../../../types/pp';
import type { NotificationItem } from '../../../types/notification';

export interface PpShowProps {
  detail?: PpPengadaanDetailPayload;
  recentNotifications?: NotificationItem[];
  unreadNotificationsCount?: number;
  basePath?: string;
  roleInitials?: string;
  roleTitle?: string | null;
  roleSubtitle?: string | null;
  navItems?: PpNavItem[] | null;
}

export const PpPengajuanShow: FC<PpShowProps> = ({
  detail: initialDetail,
  recentNotifications = [],
  unreadNotificationsCount = 0,
  basePath = '/pp',
  roleInitials = 'PP',
  roleTitle = null,
  roleSubtitle = null,
  navItems = null,
}) => {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<PpPengadaanDetailPayload>(initialDetail || {});
  const [notifications, setNotifications] = useState<NotificationItem[]>(recentNotifications);
  const [unreadCount, setUnreadCount] = useState<number>(unreadNotificationsCount);
  const [galleryOpen, setGalleryOpen] = useState(false);

  useEffect(() => {
    if (initialDetail) {
      setDetail(initialDetail);
      return;
    }
    if (!id) return;

    const controller = new AbortController();
    ppService
      .getPengajuanDetail(id, basePath, controller.signal)
      .then((res) => {
        const payload = res.detail || res.data || {};
        setDetail(payload);
        if (res.recentNotifications) setNotifications(res.recentNotifications);
        if (res.unreadNotificationsCount !== undefined) {
          setUnreadCount(res.unreadNotificationsCount);
        }
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) {
          console.error('Failed to fetch pengajuan detail:', err);
        }
      });

    return () => controller.abort();
  }, [id, initialDetail, basePath]);

  return (
    <PpPengajuanShowTemplate
      detail={detail}
      recentNotifications={notifications}
      unreadNotificationsCount={unreadCount}
      basePath={basePath}
      roleInitials={roleInitials}
      roleTitle={roleTitle}
      roleSubtitle={roleSubtitle}
      navItems={navItems}
      galleryOpen={galleryOpen}
      onOpenGallery={() => setGalleryOpen(true)}
      onCloseGallery={() => setGalleryOpen(false)}
    />
  );
};

export default PpPengajuanShow;
