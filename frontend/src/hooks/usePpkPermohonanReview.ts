import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import ppkService from '../services/ppkService';
import { extractServerErrors, validateUploadFile } from '../utils/fileValidation';
import {
  normalizePpkPermohonanDetail,
  type PpkPermohonanViewModel,
} from '../utils/ppkPermohonan';
import type { DokumenItem } from '../types/dokumen';
import type { PpkPermohonanDetailPayload } from '../types/ppk';

export interface UsePpkPermohonanReviewResult {
  detail: PpkPermohonanDetailPayload | null;
  viewModel: PpkPermohonanViewModel | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  approveModalOpen: boolean;
  openApproveModal: () => void;
  closeApproveModal: () => void;
  selectedMemoFile: File | null;
  memoFileError: string;

  selectMemoFile: (file: File | null) => void;
  rejectModalOpen: boolean;
  openRejectModal: () => void;
  closeRejectModal: () => void;
  alasanTolak: string;
  setAlasanTolak: (value: string) => void;
  alasanError: string;
  isSubmitting: boolean;
  submitApprove: (e: FormEvent) => Promise<void>;
  submitReject: (e: FormEvent) => Promise<void>;
  previewBlobUrl: string | null;
  previewDocId: number | string | null;
  isLoadingPreview: boolean;
  viewingDocId: number | string | null;
  downloadingDocId: number | string | null;
  viewDokumen: (dokumen: DokumenItem) => Promise<void>;
  downloadDokumen: (dokumen: DokumenItem) => Promise<void>;
}

export function usePpkPermohonanReview(
  id: string | undefined,
  onDecisionSuccess: () => void
): UsePpkPermohonanReviewResult {
  const [detail, setDetail] = useState<PpkPermohonanDetailPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState<number>(0);

  const [approveModalOpen, setApproveModalOpen] = useState<boolean>(false);
  const [rejectModalOpen, setRejectModalOpen] = useState<boolean>(false);
  const [selectedMemoFile, setSelectedMemoFile] = useState<File | null>(null);
  const [memoFileError, setMemoFileError] = useState<string>('');
  const [alasanTolak, setAlasanTolak] = useState<string>('');
  const [alasanError, setAlasanError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewDocId, setPreviewDocId] = useState<number | string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);
  const [viewingDocId, setViewingDocId] = useState<number | string | null>(null);
  const [downloadingDocId, setDownloadingDocId] = useState<number | string | null>(null);
  const previewBlobRef = useRef<string | null>(null);

  const refetch = useCallback(() => {
    setReloadToken((prev) => prev + 1);
  }, []);

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
    if (!id) {
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    ppkService
      .getPermohonanDetail(id, controller.signal)
      .then((res) => {
        if (controller.signal.aborted) {
          return;
        }

        setDetail(res.data ?? null);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        console.error('Gagal memuat detail permohonan PPK:', err);
        setError('Gagal memuat detail permohonan PPK.');
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [id, reloadToken]);

  useEffect(() => {
    const dokumenPermohonan = detail?.dokumen_permohonan;

    if (!dokumenPermohonan || dokumenPermohonan.length === 0) {
      return;
    }

    const targetDoc =
      dokumenPermohonan.find(
        (doc) => doc.tipe_dokumen === 'surat_permohonan' || doc.tipe_dokumen === 'permohonan'
      ) ?? dokumenPermohonan[0];

    if (!targetDoc.download_url) {
      return;
    }

    const controller = new AbortController();
    setIsLoadingPreview(true);
    setPreviewDocId(targetDoc.id);

    ppkService
      .fetchDokumenBlob(targetDoc.download_url, 'inline', controller.signal)
      .then(({ blob }) => {
        if (controller.signal.aborted) {
          return;
        }

        replacePreviewBlob(URL.createObjectURL(blob));
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) {
          console.error('Gagal memuat pratinjau dokumen permohonan:', err);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingPreview(false);
        }
      });

    return () => controller.abort();
  }, [detail?.dokumen_permohonan, replacePreviewBlob]);

  const selectMemoFile = useCallback((file: File | null) => {
    setSelectedMemoFile(file);

    if (!file) {
      setMemoFileError('Berkas Memo Persetujuan Surat Permohonan wajib dipilih.');
      return;
    }

    const validationError = validateUploadFile(file);
    setMemoFileError(validationError || '');
  }, []);

  const submitApprove = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      const validationError = validateUploadFile(selectedMemoFile);
      if (validationError || !selectedMemoFile || !id) {
        setMemoFileError(
          validationError || 'Berkas Memo Persetujuan Surat Permohonan wajib dipilih.'
        );
        return;
      }

      setIsSubmitting(true);
      setMemoFileError('');

      try {
        await ppkService.approvePermohonan(id, selectedMemoFile);
        setApproveModalOpen(false);
        onDecisionSuccess();
      } catch (err: unknown) {
        const { fieldErrors, message } = extractServerErrors(err);
        setMemoFileError(fieldErrors.memo || message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [id, onDecisionSuccess, selectedMemoFile]
  );

  const submitReject = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (alasanTolak.trim().length < 5 || !id) {
        setAlasanError('Alasan penolakan wajib diisi minimal 5 karakter.');
        return;
      }

      setIsSubmitting(true);
      setAlasanError('');

      try {
        await ppkService.rejectPermohonan(id, alasanTolak.trim());
        setRejectModalOpen(false);
        onDecisionSuccess();
      } catch (err: unknown) {
        const { fieldErrors, message } = extractServerErrors(err);
        setAlasanError(fieldErrors.alasan || message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [alasanTolak, id, onDecisionSuccess]
  );

  const viewDokumen = useCallback(
    async (dokumen: DokumenItem) => {
      if (!dokumen.download_url) {
        return;
      }

      setViewingDocId(dokumen.id);
      setIsLoadingPreview(true);
      setPreviewDocId(dokumen.id);

      try {
        const { blob } = await ppkService.fetchDokumenBlob(dokumen.download_url, 'inline');
        replacePreviewBlob(URL.createObjectURL(blob));
      } catch (err: unknown) {
        console.error('Gagal memuat pratinjau dokumen:', err);
        replacePreviewBlob(null);
      } finally {
        setViewingDocId(null);
        setIsLoadingPreview(false);
      }
    },
    [replacePreviewBlob]
  );

  const downloadDokumen = useCallback(async (dokumen: DokumenItem) => {
    if (!dokumen.download_url) {
      return;
    }

    setDownloadingDocId(dokumen.id);

    try {
      const { blob } = await ppkService.fetchDokumenBlob(dokumen.download_url, 'attachment');
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = dokumen.nama_asli || 'Dokumen.pdf';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err: unknown) {
      console.error('Gagal mengunduh dokumen:', err);
    } finally {
      setDownloadingDocId(null);
    }
  }, []);

  const viewModel = useMemo(() => normalizePpkPermohonanDetail(detail), [detail]);

  return {
    detail,
    viewModel,
    isLoading,
    error,
    refetch,
    approveModalOpen,
    openApproveModal: () => setApproveModalOpen(true),
    closeApproveModal: () => setApproveModalOpen(false),
    selectedMemoFile,
    memoFileError,
    selectMemoFile,
    rejectModalOpen,
    openRejectModal: () => setRejectModalOpen(true),
    closeRejectModal: () => setRejectModalOpen(false),
    alasanTolak,
    setAlasanTolak,
    alasanError,
    isSubmitting,
    submitApprove,
    submitReject,
    previewBlobUrl,
    previewDocId,
    isLoadingPreview,
    viewingDocId,
    downloadingDocId,
    viewDokumen,
    downloadDokumen,
  };
}

export default usePpkPermohonanReview;
