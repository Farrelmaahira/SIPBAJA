import { useState, useEffect, type FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ppkService from '../../../services/ppkService';
import PpkPengadaanReviewTemplate from '../../../components/templates/PPK/PpkPengadaanReviewTemplate';
import { extractServerErrors } from '../../../utils/fileValidation';
import type { NotificationItem } from '../../../types/notification';
import type { PpDocumentPreviewInfo, PpPengadaanDetailPayload } from '../../../types/pp';
import { PPK_NAV_ITEMS } from '@/constants/ppkNav';

export interface PpkPengadaanReviewProps {
  detail?: PpPengadaanDetailPayload;
  recentNotifications?: NotificationItem[];
  unreadNotificationsCount?: number;
}

export const PpkPengadaanReview: FC<PpkPengadaanReviewProps> = ({
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
  const [previewDoc, setPreviewDoc] = useState<PpDocumentPreviewInfo | null>(null);

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
        }
      });

    return () => controller.abort();
  }, [id, initialDetail]);

  const handleConfirmApprovePengadaan = async () => {
    const targetId = detail.pengadaan?.id || id;
    if (!targetId) {
      return;
    }

    setSubmitting(true);
    setFlashError('');

    try {
      await ppkService.approvePengadaan(targetId);
      setConfirmApproveOpen(false);
      navigate('/ppk/pengajuan');
    } catch (err) {
      const { message } = extractServerErrors(err);
      setFlashError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmRejectPengadaan = async (alasan: string) => {
    if (!alasan || alasan.trim().length < 5) {
      setRejectError('Alasan penolakan wajib diisi minimal 5 karakter.');
      return;
    }

    const targetId = detail.pengadaan?.id || id;
    if (!targetId) {
      return;
    }

    setRejectError('');
    setSubmitting(true);

    try {
      await ppkService.rejectPengadaan(targetId, alasan.trim());
      setRejectOpen(false);
      navigate('/ppk/pengajuan');
    } catch (err) {
      const { fieldErrors, message } = extractServerErrors(err);
      setRejectError(fieldErrors.alasan || fieldErrors.catatan || message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PpkPengadaanReviewTemplate
      detail={detail}
      recentNotifications={recentNotifications}
      unreadNotificationsCount={unreadNotificationsCount}
      navItems={PPK_NAV_ITEMS}
      confirmApproveOpen={confirmApproveOpen}
      rejectOpen={rejectOpen}
      submitting={submitting}
      rejectError={rejectError}
      flashError={flashError}
      previewDoc={previewDoc}
      onOpenConfirmApprove={() => setConfirmApproveOpen(true)}
      onCloseConfirmApprove={() => setConfirmApproveOpen(false)}
      onConfirmApprove={handleConfirmApprovePengadaan}
      onOpenReject={() => setRejectOpen(true)}
      onCloseReject={() => setRejectOpen(false)}
      onConfirmReject={handleConfirmRejectPengadaan}
      onSelectPreviewDoc={setPreviewDoc}
    />
  );
};

export default PpkPengadaanReview;
