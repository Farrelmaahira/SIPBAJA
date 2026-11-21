import { useState, useEffect, type FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ppkService from '../../../services/ppkService';
import PpkPengadaanDetailTemplate from '../../../components/templates/PPK/PpkPengadaanDetailTemplate';
import { extractServerErrors } from '../../../utils/fileValidation';
import { PPK_NAV_ITEMS } from '@/constants/ppkNav';
import type { NotificationItem } from '../../../types/notification';
import type { PpPengadaanDetailPayload } from '../../../types/pp';

export interface PpkPengadaanDetailProps {
  detail?: PpPengadaanDetailPayload;
  recentNotifications?: NotificationItem[];
  unreadNotificationsCount?: number;
}

export const PpkPengadaanDetail: FC<PpkPengadaanDetailProps> = ({
  detail: initialDetail,
  recentNotifications: initialNotifs = [],
  unreadNotificationsCount: initialUnreadCount = 0,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [detail, setDetail] = useState<PpPengadaanDetailPayload>(initialDetail || {});
  const [recentNotifications, setRecentNotifications] = useState<NotificationItem[]>(initialNotifs);
  const [unreadNotificationsCount, setUnreadNotificationsCount] =
    useState<number>(initialUnreadCount);

  const [confirmApproveOpen, setConfirmApproveOpen] = useState<boolean>(false);
  const [rejectOpen, setRejectOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [rejectError, setRejectError] = useState<string>('');
  const [flashError, setFlashError] = useState<string>('');

  useEffect(() => {
    if (!id || initialDetail) {
      return;
    }

    const controller = new AbortController();

    ppkService
      .getPengajuanReview(id, controller.signal)
      .then((res) => {
        if (controller.signal.aborted) {
          return;
        }

        setDetail(res.detail ?? res.data ?? {});
        if (res.recentNotifications) setRecentNotifications(res.recentNotifications);
        if (res.unreadNotificationsCount !== undefined) {
          setUnreadNotificationsCount(res.unreadNotificationsCount);
        }
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) {
          console.error('Gagal memuat review pengadaan PPK:', err);
          setFlashError('Gagal memuat data pengadaan.');
        }
      });

    return () => controller.abort();
  }, [id, initialDetail]);

  const targetId = detail.pengadaan?.id || id;

  const handleConfirmApprovePengadaan = async () => {
    if (!targetId) {
      return;
    }

    setSubmitting(true);
    setFlashError('');

    try {
      await ppkService.approvePengadaan(targetId);
      setConfirmApproveOpen(false);
      navigate('/ppk/pengadaan');
    } catch (err) {
      const { message } = extractServerErrors(err);
      setFlashError(message || 'Gagal menyetujui dokumen pengadaan.');
      setConfirmApproveOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmRejectPengadaan = async (alasan: string) => {
    if (!alasan || alasan.trim().length < 5) {
      setRejectError('Alasan penolakan wajib diisi minimal 5 karakter.');
      return;
    }

    if (!targetId) {
      return;
    }

    setRejectError('');
    setSubmitting(true);

    try {
      await ppkService.rejectPengadaan(targetId, alasan.trim());
      setRejectOpen(false);
      navigate('/ppk/pengadaan');
    } catch (err) {
      const { fieldErrors, message } = extractServerErrors(err);
      setRejectError(fieldErrors.alasan || fieldErrors.catatan || message || 'Gagal menolak dokumen pengadaan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PpkPengadaanDetailTemplate
      detail={detail}
      recentNotifications={recentNotifications}
      unreadNotificationsCount={unreadNotificationsCount}
      navItems={PPK_NAV_ITEMS}
      confirmApproveOpen={confirmApproveOpen}
      rejectOpen={rejectOpen}
      submitting={submitting}
      rejectError={rejectError}
      flashError={flashError}
      onOpenConfirmApprove={() => setConfirmApproveOpen(true)}
      onCloseConfirmApprove={() => setConfirmApproveOpen(false)}
      onConfirmApprove={handleConfirmApprovePengadaan}
      onOpenReject={() => {
        setRejectError('');
        setRejectOpen(true);
      }}
      onCloseReject={() => setRejectOpen(false)}
      onConfirmReject={handleConfirmRejectPengadaan}
    />
  );
};

export default PpkPengadaanDetail;
