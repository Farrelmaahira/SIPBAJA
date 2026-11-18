import { useState, useEffect, useCallback, useRef, type FC, type FormEvent } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import ppkService from '../../../services/ppkService';
import PpkPengadaanReviewTemplate from '../../../components/templates/PPK/PpkPengadaanReviewTemplate';
import PpkPermohonanReviewTemplate from '../../../components/templates/PPK/PpkPermohonanReviewTemplate';
import { extractServerErrors, validateUploadFile } from '../../../utils/fileValidation';
import type { NotificationItem } from '../../../types/notification';
import type { DokumenItem } from '../../../types/dokumen';
import type { PpDocumentPreviewInfo } from '../../../types/pp';
import type { PpPengadaanDetailPayload, PpkPermohonanDetailPayload } from '../../../types/ppk';
import { PPK_NAV_ITEMS } from '@/constants/ppkNav';

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
  const [approvePermohonanOpen, setApprovePermohonanOpen] = useState<boolean>(false);
  const [rejectPermohonanOpen, setRejectPermohonanOpen] = useState<boolean>(false);
  const [selectedMemoFile, setSelectedMemoFile] = useState<File | null>(null);
  const [memoFileError, setMemoFileError] = useState<string>('');
  const [catatanApprove, setCatatanApprove] = useState<string>('');
  const [alasanTolakPermohonan, setAlasanTolakPermohonan] = useState<string>('');
  const [alasanPermohonanError, setAlasanPermohonanError] = useState<string>('');
  // DokumenListCard state: view/download/preview blob
  const [viewingDocId, setViewingDocId] = useState<number | string | null>(null);
  const [downloadingDocId, setDownloadingDocId] = useState<number | string | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewDocId, setPreviewDocId] = useState<number | string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);
  const previewBlobRef = useRef<string | null>(null);

  const replacePreviewBlob = useCallback((url: string | null) => {
    if (previewBlobRef.current && previewBlobRef.current !== url) {
      URL.revokeObjectURL(previewBlobRef.current);
    }
    previewBlobRef.current = url;
    setPreviewBlobUrl(url);
  }, []);

  useEffect(
    () => () => {
      if (previewBlobRef.current) {
        URL.revokeObjectURL(previewBlobRef.current);
      }
    },
    []
  );

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    setIsLoading(true);

    if (isPermohonanMode) {
      ppkService
        .getPermohonanDetail(id, controller.signal)
        .then((res) => {
          setPermohonanDetail(res.data ?? res.detail ?? null);
          if (res.recentNotifications) setRecentNotifications(res.recentNotifications);
          if (res.unreadNotificationsCount !== undefined) {
            setUnreadNotificationsCount(res.unreadNotificationsCount);
          }
        })
        .catch((err: unknown) => {
          if (!controller.signal.aborted) {
            console.error('Failed to fetch PPK permohonan detail:', err);
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setIsLoading(false);
        });
    } else if (!initialDetail) {
      ppkService
        .getPengajuanReview(id, controller.signal)
        .then((res) => {
          setPengadaanDetail(res.detail ?? res.data ?? {});
          if (res.recentNotifications) setRecentNotifications(res.recentNotifications);
          if (res.unreadNotificationsCount !== undefined) {
            setUnreadNotificationsCount(res.unreadNotificationsCount);
          }
        })
        .catch((err: unknown) => {
          if (!controller.signal.aborted) {
            console.error('Failed to fetch PPK pengajuan review:', err);
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }

    return () => {
      controller.abort();
    };
  }, [id, isPermohonanMode, initialDetail]);

  // Preload the surat permohonan preview so DokumenListCard renders a real iframe
  useEffect(() => {
    const dokumenPermohonan = permohonanDetail?.dokumen_permohonan;
    if (!isPermohonanMode || !dokumenPermohonan || dokumenPermohonan.length === 0) return;

    const targetDoc =
      dokumenPermohonan.find(
        (doc) => doc.tipe_dokumen === 'surat_permohonan' || doc.tipe_dokumen === 'permohonan'
      ) ?? dokumenPermohonan[0];

    if (!targetDoc.download_url) return;

    const controller = new AbortController();
    setIsLoadingPreview(true);
    setPreviewDocId(targetDoc.id);

    ppkService
      .fetchDokumenBlob(targetDoc.download_url, 'inline', controller.signal)
      .then(({ blob }) => {
        if (controller.signal.aborted) return;
        replacePreviewBlob(URL.createObjectURL(blob));
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) {
          console.error('Gagal memuat pratinjau dokumen permohonan:', err);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingPreview(false);
      });

    return () => controller.abort();
  }, [isPermohonanMode, permohonanDetail?.dokumen_permohonan, replacePreviewBlob]);

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

  // Handlers view/download dokumen untuk DokumenListCard (mode permohonan)
  const handleViewDokumen = async (dokumen: DokumenItem) => {
    if (!dokumen.download_url) return;
    setViewingDocId(dokumen.id);
    setIsLoadingPreview(true);
    setPreviewDocId(dokumen.id);
    try {
      const { blob } = await ppkService.fetchDokumenBlob(dokumen.download_url, 'inline');
      replacePreviewBlob(URL.createObjectURL(blob));
    } catch (err) {
      console.error('Gagal memuat pratinjau dokumen:', err);
      replacePreviewBlob(null);
    } finally {
      setViewingDocId(null);
      setIsLoadingPreview(false);
    }
  };

  const handleDownloadDokumen = async (dokumen: DokumenItem) => {
    if (!dokumen.download_url) return;
    setDownloadingDocId(dokumen.id);
    try {
      const { blob } = await ppkService.fetchDokumenBlob(dokumen.download_url, 'attachment');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = dokumen.nama_asli || 'Dokumen.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      console.error('Gagal mengunduh dokumen:', err);
    } finally {
      setDownloadingDocId(null);
    }
  };

  if (isPermohonanMode) {
    return (
      <PpkPermohonanReviewTemplate
        navItems={PPK_NAV_ITEMS}
        detail={permohonanDetail}
        isLoading={isLoading}
        onViewDokumen={handleViewDokumen}
        onDownloadDokumen={handleDownloadDokumen}
        isViewingDocId={viewingDocId}
        isDownloadingDocId={downloadingDocId}
        previewBlobUrl={previewBlobUrl}
        previewDocId={previewDocId}
        isLoadingPreview={isLoadingPreview}
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
    <PpkPengadaanReviewTemplate
      detail={pengadaanDetail}
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

export default PpkPengajuanReview;
