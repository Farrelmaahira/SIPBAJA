import { useState, useEffect, type FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ppService from '../../../services/ppService';
import PpPengadaanDetailTemplate from '../../../components/templates/PP/PpPengadaanDetailTemplate';
import { extractServerErrors } from '../../../utils/fileValidation';
import type { AppNavItem as PpNavItem } from '../../../components/templates/General/AppLayout';
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
  keputusanTitle?: string;
  keputusanNote?: string;
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
  keputusanTitle = 'Keputusan PP',
  keputusanNote = 'Khusus pengadaan Rp50 – 200 juta. Pastikan dokumen dan data sudah sesuai.',
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [detail, setDetail] = useState<PpPengadaanDetailPayload>(initialDetail || {});
  const [notifications, setNotifications] = useState<NotificationItem[]>(recentNotifications);
  const [unreadCount, setUnreadCount] = useState<number>(unreadNotificationsCount);
  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rejectError, setRejectError] = useState('');
  const [flashError, setFlashError] = useState('');

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
          console.error('Failed to fetch pengadaan detail:', err);
          setFlashError('Gagal memuat detail pengadaan.');
        }
      });

    return () => controller.abort();
  }, [id, initialDetail, basePath]);

  const targetId = detail.pengadaan?.id || id;

  const handleApprove = async () => {
    if (!targetId) return;
    setSubmitting(true);
    setFlashError('');
    try {
      await ppService.approvePengadaan(targetId, basePath);
      setConfirmApproveOpen(false);
      navigate(`${basePath}/pengadaan`);
    } catch (err: unknown) {
      const serverErr = extractServerErrors(err);
      setFlashError(serverErr.message || 'Gagal menyetujui dokumen pengadaan.');
      setConfirmApproveOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (alasan: string) => {
    if (!alasan || !alasan.trim()) {
      setRejectError('Alasan penolakan / catatan revisi wajib diisi.');
      return;
    }
    if (!targetId) return;
    setSubmitting(true);
    setRejectError('');
    try {
      await ppService.rejectPengadaan(targetId, alasan, basePath);
      setRejectOpen(false);
      navigate(`${basePath}/pengadaan`);
    } catch (err: unknown) {
      const serverErr = extractServerErrors(err);
      setRejectError(
        serverErr.fieldErrors.alasan ||
        serverErr.fieldErrors.catatan ||
        serverErr.message ||
        'Terjadi kesalahan saat memproses penolakan.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PpPengadaanDetailTemplate
      detail={detail}
      recentNotifications={notifications}
      unreadNotificationsCount={unreadCount}
      basePath={basePath}
      roleInitials={roleInitials}
      roleTitle={roleTitle}
      roleSubtitle={roleSubtitle}
      navItems={navItems}
      keputusanTitle={keputusanTitle}
      keputusanNote={keputusanNote}
      confirmApproveOpen={confirmApproveOpen}
      rejectOpen={rejectOpen}
      submitting={submitting}
      rejectError={rejectError}
      flashError={flashError}
      onOpenConfirmApprove={() => setConfirmApproveOpen(true)}
      onCloseConfirmApprove={() => setConfirmApproveOpen(false)}
      onConfirmApprove={handleApprove}
      onOpenReject={() => {
        setRejectError('');
        setRejectOpen(true);
      }}
      onCloseReject={() => setRejectOpen(false)}
      onConfirmReject={handleReject}
    />
  );
};

export default PpPengajuanShow;
