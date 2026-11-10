import { useState, useEffect, type FC, type FormEvent } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import ppkService from '../../../services/ppkService';
import PpPengajuanReviewTemplate from '../../../components/templates/PpPengajuanReviewTemplate';
import PpkPermohonanReviewTemplate, {
  type PreviewDocInfo,
} from '../../../components/templates/PpkPermohonanReviewTemplate';
import { PPK_NAV_ITEMS } from '../Dashboard';
import { extractServerErrors, validateUploadFile } from '../../../utils/fileValidation';
import type { NotificationItem } from '../../../types/notification';
import type { PpDocumentPreviewInfo } from '../../../types/pp';
import type { PpPengadaanDetailPayload, PpkPermohonanDetailPayload } from '../../../types/ppk';

export interface PpkReviewProps {
  detail?: PpPengadaanDetailPayload;
  recentNotifications?: NotificationItem[];
  unreadNotificationsCount?: number;
}

export const PpkPengajuanReview: FC<PpkReviewProps> = ({
  detail: initialDetail,
  recentNotifications: initialNotifs = [],
  unreadNotificationsCount: initialUnreadCount = 0,
}) => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isPermohonanMode = searchParams.get('type') === 'permohonan';

  const [pengadaanDetail, setPengadaanDetail] = useState<PpPengadaanDetailPayload>(
    initialDetail || {}
  );
  const [permohonanDetail, setPermohonanDetail] = useState<PpkPermohonanDetailPayload | null>(null);
  const [recentNotifications, setRecentNotifications] = useState<NotificationItem[]>(initialNotifs);
  const [unreadNotificationsCount, setUnreadNotificationsCount] =
    useState<number>(initialUnreadCount);
  const [isLoading, setIsLoading] = useState<boolean>(!initialDetail);

  // State untuk Review Dokumen Pengadaan
  const [confirmApproveOpen, setConfirmApproveOpen] = useState<boolean>(false);
  const [rejectOpen, setRejectOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [rejectError, setRejectError] = useState<string>('');
  const [flashError, setFlashError] = useState<string>('');
  const [previewDoc, setPreviewDoc] = useState<PpDocumentPreviewInfo | null>(null);

  // State untuk Review Persetujuan Awal Permohonan
  const [permohonanPreviewDoc, setPermohonanPreviewDoc] = useState<PreviewDocInfo | null>(null);
  const [approvePermohonanOpen, setApprovePermohonanOpen] = useState<boolean>(false);
  const [rejectPermohonanOpen, setRejectPermohonanOpen] = useState<boolean>(false);
  const [selectedMemoFile, setSelectedMemoFile] = useState<File | null>(null);
  const [memoFileError, setMemoFileError] = useState<string>('');
  const [catatanApprove, setCatatanApprove] = useState<string>('');
  const [alasanTolakPermohonan, setAlasanTolakPermohonan] = useState<string>('');
  const [alasanPermohonanError, setAlasanPermohonanError] = useState<string>('');

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setIsLoading(true);

    if (isPermohonanMode) {
      ppkService
        .getPermohonanDetail(id)
        .then((res) => {
          if (!isMounted) return;
          setPermohonanDetail(res.data ?? res.detail ?? null);
          if (res.recentNotifications) setRecentNotifications(res.recentNotifications);
          if (res.unreadNotificationsCount !== undefined) {
            setUnreadNotificationsCount(res.unreadNotificationsCount);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch PPK permohonan detail:', err);
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    } else if (!initialDetail) {
      ppkService
        .getPengajuanReview(id)
        .then((res) => {
          if (!isMounted) return;
          setPengadaanDetail(res.detail ?? res.data ?? {});
          if (res.recentNotifications) setRecentNotifications(res.recentNotifications);
          if (res.unreadNotificationsCount !== undefined) {
            setUnreadNotificationsCount(res.unreadNotificationsCount);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch PPK pengajuan review:', err);
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [id, isPermohonanMode, initialDetail]);

  // Handlers untuk Dokumen Pengadaan
  const handleConfirmApprovePengadaan = async () => {
    const targetId = pengadaanDetail.pengadaan?.id || id;
    if (!targetId) return;
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
    const targetId = pengadaanDetail.pengadaan?.id || id;
    if (!targetId) return;
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

  // Handlers untuk Persetujuan Awal Permohonan
  const handleSelectMemoFile = (file: File | null) => {
    setSelectedMemoFile(file);
    if (!file) {
      setMemoFileError('Berkas Memo Persetujuan Surat Permohonan wajib dipilih.');
      return;
    }
    const validationErr = validateUploadFile(file);
    setMemoFileError(validationErr || '');
  };

  const handleApprovePermohonanSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationErr = validateUploadFile(selectedMemoFile);
    if (validationErr || !selectedMemoFile) {
      setMemoFileError(validationErr || 'Berkas Memo Persetujuan Surat Permohonan wajib dipilih.');
      return;
    }

    const targetId = permohonanDetail?.permohonan?.id || id;
    if (!targetId) return;

    setSubmitting(true);
    setMemoFileError('');
    try {
      await ppkService.approvePermohonan(targetId, selectedMemoFile, catatanApprove);
      setApprovePermohonanOpen(false);
      navigate('/ppk/pengajuan');
    } catch (err) {
      const { fieldErrors, message } = extractServerErrors(err);
      setMemoFileError(fieldErrors.memo || message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectPermohonanSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!alasanTolakPermohonan || alasanTolakPermohonan.trim().length < 5) {
      setAlasanPermohonanError('Alasan penolakan wajib diisi minimal 5 karakter.');
      return;
    }

    const targetId = permohonanDetail?.permohonan?.id || id;
    if (!targetId) return;

    setSubmitting(true);
    setAlasanPermohonanError('');
    try {
      await ppkService.rejectPermohonan(targetId, alasanTolakPermohonan.trim());
      setRejectPermohonanOpen(false);
      navigate('/ppk/pengajuan');
    } catch (err) {
      const { fieldErrors, message } = extractServerErrors(err);
      setAlasanPermohonanError(fieldErrors.alasan || message);
    } finally {
      setSubmitting(false);
    }
  };

  if (isPermohonanMode) {
    return (
      <PpkPermohonanReviewTemplate
        navItems={PPK_NAV_ITEMS}
        detail={permohonanDetail}
        isLoading={isLoading}
        previewDoc={permohonanPreviewDoc}
        onOpenPreviewDoc={setPermohonanPreviewDoc}
        onClosePreviewDoc={() => setPermohonanPreviewDoc(null)}
        approveModalOpen={approvePermohonanOpen}
        onOpenApproveModal={() => setApprovePermohonanOpen(true)}
        onCloseApproveModal={() => setApprovePermohonanOpen(false)}
        selectedMemoFile={selectedMemoFile}
        memoFileError={memoFileError}
        catatanApprove={catatanApprove}
        onSelectMemoFile={handleSelectMemoFile}
        onCatatanApproveChange={setCatatanApprove}
        onApproveSubmit={handleApprovePermohonanSubmit}
        rejectModalOpen={rejectPermohonanOpen}
        onOpenRejectModal={() => setRejectPermohonanOpen(true)}
        onCloseRejectModal={() => setRejectPermohonanOpen(false)}
        alasanTolak={alasanTolakPermohonan}
        alasanError={alasanPermohonanError}
        onAlasanTolakChange={setAlasanTolakPermohonan}
        onRejectSubmit={handleRejectPermohonanSubmit}
        isSubmitting={submitting}
        recentNotifications={recentNotifications}
        unreadNotificationsCount={unreadNotificationsCount}
      />
    );
  }

  return (
    <PpPengajuanReviewTemplate
      detail={pengadaanDetail}
      recentNotifications={recentNotifications}
      unreadNotificationsCount={unreadNotificationsCount}
      basePath="/ppk"
      roleInitials="PPK"
      roleTitle="PPK"
      roleSubtitle="Pejabat Pembuat Komitmen"
      navItems={PPK_NAV_ITEMS}
      keputusanTitle="Keputusan PPK"
      keputusanNote="Khusus penandatanganan PPK. Pastikan seluruh dokumen pengadaan telah sesuai sebelum disetujui."
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

export default PpkPengajuanReview;
