import { useState, useEffect, type FC, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ppkService from '../../../services/ppkService';
import PpkPembayaranTemplate from '../../../components/templates/PpkPembayaranTemplate';
import type { PreviewDocInfo } from '../../../components/templates/PpkPermohonanReviewTemplate';
import { PPK_NAV_ITEMS } from '../Dashboard';
import { extractServerErrors, validateUploadFile } from '../../../utils/fileValidation';
import type { NotificationItem } from '../../../types/notification';
import type { PpPengadaanDetailPayload } from '../../../types/ppk';

export interface PpkPembayaranProps {
  detail?: PpPengadaanDetailPayload;
  recentNotifications?: NotificationItem[];
  unreadNotificationsCount?: number;
}

export const PpkPengajuanPembayaran: FC<PpkPembayaranProps> = ({
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

  const [galleryOpen, setGalleryOpen] = useState<boolean>(false);
  const [previewDoc, setPreviewDoc] = useState<PreviewDocInfo | null>(null);
  const [approveModalOpen, setApproveModalOpen] = useState<boolean>(false);
  const [rejectModalOpen, setRejectModalOpen] = useState<boolean>(false);

  const [selectedMemoFile, setSelectedMemoFile] = useState<File | null>(null);
  const [memoFileError, setMemoFileError] = useState<string>('');
  const [catatanApprove, setCatatanApprove] = useState<string>('');

  const [alasanTolak, setAlasanTolak] = useState<string>('');
  const [alasanError, setAlasanError] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!initialDetail && id) {
      let isMounted = true;
      ppkService
        .getPembayaranDetail(id)
        .then((res) => {
          if (!isMounted) return;
          setDetail(res.detail ?? res.data ?? {});
          if (res.recentNotifications) setRecentNotifications(res.recentNotifications);
          if (res.unreadNotificationsCount !== undefined) {
            setUnreadNotificationsCount(res.unreadNotificationsCount);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch PPK pembayaran:', err);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [id, initialDetail]);

  const handleSelectMemoFile = (file: File | null) => {
    setSelectedMemoFile(file);
    if (!file) {
      setMemoFileError('Berkas Memo Persetujuan Pembayaran wajib dipilih.');
      return;
    }
    const validationErr = validateUploadFile(file);
    setMemoFileError(validationErr || '');
  };

  const handleApproveSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationErr = validateUploadFile(selectedMemoFile);
    if (validationErr || !selectedMemoFile) {
      setMemoFileError(validationErr || 'Berkas Memo Persetujuan Pembayaran wajib dipilih.');
      return;
    }

    const targetId = detail.pengadaan?.id || id;
    if (!targetId) return;

    setSubmitting(true);
    setMemoFileError('');
    try {
      await ppkService.approvePembayaran(targetId, selectedMemoFile, catatanApprove);
      setApproveModalOpen(false);
      navigate('/ppk/pengajuan');
    } catch (err) {
      const { fieldErrors, message } = extractServerErrors(err);
      setMemoFileError(fieldErrors.memo || message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!alasanTolak || alasanTolak.trim().length < 5) {
      setAlasanError('Catatan penolakan wajib diisi minimal 5 karakter.');
      return;
    }

    const targetId = detail.pengadaan?.id || id;
    if (!targetId) return;

    setAlasanError('');
    setSubmitting(true);
    try {
      await ppkService.rejectPembayaran(targetId, alasanTolak.trim());
      setRejectModalOpen(false);
      navigate('/ppk/pengajuan');
    } catch (err) {
      const { fieldErrors, message } = extractServerErrors(err);
      setAlasanError(fieldErrors.alasan || message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PpkPembayaranTemplate
      navItems={PPK_NAV_ITEMS}
      detail={detail}
      galleryOpen={galleryOpen}
      onOpenGallery={() => setGalleryOpen(true)}
      onCloseGallery={() => setGalleryOpen(false)}
      previewDoc={previewDoc}
      onOpenPreviewDoc={setPreviewDoc}
      onClosePreviewDoc={() => setPreviewDoc(null)}
      approveModalOpen={approveModalOpen}
      onOpenApproveModal={() => setApproveModalOpen(true)}
      onCloseApproveModal={() => setApproveModalOpen(false)}
      selectedMemoFile={selectedMemoFile}
      memoFileError={memoFileError}
      catatanApprove={catatanApprove}
      onSelectMemoFile={handleSelectMemoFile}
      onCatatanApproveChange={setCatatanApprove}
      onApproveSubmit={handleApproveSubmit}
      rejectModalOpen={rejectModalOpen}
      onOpenRejectModal={() => setRejectModalOpen(true)}
      onCloseRejectModal={() => setRejectModalOpen(false)}
      alasanTolak={alasanTolak}
      alasanError={alasanError}
      onAlasanTolakChange={setAlasanTolak}
      onRejectSubmit={handleRejectSubmit}
      submitting={submitting}
      recentNotifications={recentNotifications}
      unreadNotificationsCount={unreadNotificationsCount}
    />
  );
};

export default PpkPengajuanPembayaran;
