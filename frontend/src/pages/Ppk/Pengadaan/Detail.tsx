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
  const [flashSuccess, setFlashSuccess] = useState<string | null>(null);

  const [pembayaranContext, setPembayaranContext] = useState<any>(null);
  const [isLoadingPembayaran, setIsLoadingPembayaran] = useState<boolean>(false);

  const fetchPembayaran = (signal?: AbortSignal) => {
    if (!id) return;
    setIsLoadingPembayaran(true);
    ppkService
      .getPembayaranReview(id, signal)
      .then((data) => setPembayaranContext(data))
      .catch((err) => {
        if (err?.name !== 'CanceledError') {
          // ignore
        }
      })
      .finally(() => setIsLoadingPembayaran(false));
  };

  useEffect(() => {
    if (!id || initialDetail) {
      return;
    }

    const controller = new AbortController();

    ppkService
      .getPengajuanShow(id, controller.signal)
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
          console.error('Gagal memuat detail pengadaan PPK:', err);
          setFlashError('Gagal memuat data pengadaan.');
        }
      });

    fetchPembayaran(controller.signal);

    return () => controller.abort();
  }, [id, initialDetail]);

  const targetId = detail.pengadaan?.id || id;

  const handleApprovePembayaran = async (memo: File, catatan?: string) => {
    if (!targetId) return;
    const res = await ppkService.approvePembayaran(targetId, memo, catatan);
    setFlashSuccess(res.message || 'Persetujuan pembayaran berhasil dikirim.');
    fetchPembayaran();
  };

  const handleRejectPembayaran = async (alasan: string) => {
    if (!targetId) return;
    const res = await ppkService.rejectPembayaran(targetId, alasan);
    setFlashSuccess(res.message || 'Penolakan pembayaran berhasil dikirim.');
    fetchPembayaran();
  };

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
      pembayaranContext={pembayaranContext}
      isLoadingPembayaran={isLoadingPembayaran}
      onApprovePembayaran={handleApprovePembayaran}
      onRejectPembayaran={handleRejectPembayaran}
      flashSuccess={flashSuccess}
    />
  );
};

export default PpkPengadaanDetail;
