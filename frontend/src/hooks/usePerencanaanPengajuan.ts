import { useState, useEffect, useMemo, useCallback, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import perencanaanService from '../services/perencanaanService';
import { extractServerErrors } from '../utils/fileValidation';
import type { PerencanaanPengajuanDetail, PerencanaanMakItem } from '../types/perencanaan';
import type { DokumenItem } from '../types/dokumen';

export interface UsePerencanaanPengajuanOptions {
  id?: string;
  initialDetail?: PerencanaanPengajuanDetail | null;
}

export interface UsePerencanaanPengajuanResult {
  detail: PerencanaanPengajuanDetail | null;
  isLoading: boolean;
  mode: 'verifikasi' | 'pengadaan' | 'diteruskan';
  maksList: PerencanaanMakItem[];
  selectedMakIds: number[];
  catatanVerifikasi: string;
  makError: string;
  catatanError: string;
  flashSuccess: string;
  flashError: string;
  handleAddMakDropdown: () => void;
  handleRemoveMakDropdown: (idx: number) => void;
  handleMakDropdownChange: (idx: number, val: number) => void;
  setCatatanVerifikasi: (catatan: string) => void;
  approveModalOpen: boolean;
  setApproveModalOpen: (open: boolean) => void;
  rejectModalOpen: boolean;
  setRejectModalOpen: (open: boolean) => void;
  alasanPenolakan: string;
  setAlasanPenolakan: (alasan: string) => void;
  alasanError: string;
  setAlasanError: (err: string) => void;
  catatanApprove: string;
  setCatatanApprove: (catatan: string) => void;
  processing: boolean;
  handleApproveSubmit: () => Promise<void>;
  handleRejectSubmit: (e: FormEvent) => Promise<void>;
  pengadaanMakDrafts: Record<number, number>;
  updatingPengadaanId: number | null;
  pengadaanMakErrors: Record<number, string>;
  handlePengadaanMakDraftChange: (pengadaanId: number, makId: number) => void;
  handleSavePengadaanMak: (pengadaanId: number) => Promise<void>;
  allDocuments: DokumenItem[];
  previewBlobUrl: string | null;
  previewDocId: number | string | null;
  isLoadingPreview: boolean;
  rkaklPreviewBlobUrl: string | null;
  isLoadingRkaklPreview: boolean;
  isViewingDocId: number | string | null;
  isDownloadingDocId: number | string | null;
  handleViewDokumen: (doc: DokumenItem) => Promise<void>;
  handleDownloadDokumen: (doc: DokumenItem) => Promise<void>;
  reloadDetail: () => void;
}

export function usePerencanaanPengajuan({
  id,
  initialDetail = null,
}: UsePerencanaanPengajuanOptions = {}): UsePerencanaanPengajuanResult {
  const navigate = useNavigate();

  const [detail, setDetail] = useState<PerencanaanPengajuanDetail | null>(initialDetail);
  const [isLoading, setIsLoading] = useState<boolean>(!initialDetail);
  const [selectedMakIds, setSelectedMakIds] = useState<number[]>([]);
  const [catatanVerifikasi, setCatatanVerifikasi] = useState<string>('');
  const [makError, setMakError] = useState<string>('');
  const [catatanError, setCatatanError] = useState<string>('');
  const [flashSuccess, setFlashSuccess] = useState<string>('');
  const [flashError, setFlashError] = useState<string>('');

  const [isViewingDocId, setIsViewingDocId] = useState<number | string | null>(null);
  const [isDownloadingDocId, setIsDownloadingDocId] = useState<number | string | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewDocId, setPreviewDocId] = useState<number | string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);

  const [rkaklPreviewBlobUrl, setRkaklPreviewBlobUrl] = useState<string | null>(null);
  const [isLoadingRkaklPreview, setIsLoadingRkaklPreview] = useState<boolean>(false);

  const [pengadaanMakDrafts, setPengadaanMakDrafts] = useState<Record<number, number>>({});
  const [updatingPengadaanId, setUpdatingPengadaanId] = useState<number | null>(null);
  const [pengadaanMakErrors, setPengadaanMakErrors] = useState<Record<number, string>>({});

  const [approveModalOpen, setApproveModalOpen] = useState<boolean>(false);
  const [rejectModalOpen, setRejectModalOpen] = useState<boolean>(false);
  const [alasanPenolakan, setAlasanPenolakan] = useState<string>('');
  const [alasanError, setAlasanError] = useState<string>('');
  const [catatanApprove, setCatatanApprove] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);
  const [reloadToken, setReloadToken] = useState<number>(0);

  const reloadDetail = useCallback(() => {
    setReloadToken((prev) => prev + 1);
  }, []);

  const loadDetail = useCallback(
    (targetId: string, signal?: AbortSignal) => {
      setIsLoading(true);
      perencanaanService
        .getPengajuanDetail(targetId, signal)
        .then((res) => {
          setDetail(res.detail);
          if (res.detail.selected_mak_ids?.length) {
            setSelectedMakIds(res.detail.selected_mak_ids);
          } else if (res.detail.maks?.length) {
            setSelectedMakIds([res.detail.maks[0].id]);
          }
          const drafts: Record<number, number> = {};
          for (const child of res.detail.permohonan?.pengadaan || []) {
            drafts[child.id] = child.mak_id ?? child.mak?.id ?? 0;
          }
          setPengadaanMakDrafts(drafts);
        })
        .catch((err: unknown) => {
          if (!signal?.aborted) {
            console.error('Gagal mengambil data pengajuan perencanaan:', err);
            setFlashError('Gagal memuat detail permohonan pengadaan.');
          }
        })
        .finally(() => {
          if (!signal?.aborted) {
            setIsLoading(false);
          }
        });
    },
    []
  );

  useEffect(() => {
    if (initialDetail) {
      setDetail(initialDetail);
      if (initialDetail.selected_mak_ids?.length) {
        setSelectedMakIds(initialDetail.selected_mak_ids);
      } else if (initialDetail.maks?.length) {
        setSelectedMakIds([initialDetail.maks[0].id]);
      }
      setIsLoading(false);
      return;
    }

    if (!id) return;

    const controller = new AbortController();
    loadDetail(id, controller.signal);

    return () => {
      controller.abort();
    };
  }, [id, initialDetail, reloadToken, loadDetail]);

  const permohonan = detail?.permohonan;
  const rawStatus = permohonan?.status || 'diajukan';

  const mode: 'verifikasi' | 'pengadaan' | 'diteruskan' =
    rawStatus === 'diajukan' || rawStatus === 'menunggu_verifikasi'
      ? 'verifikasi'
      : rawStatus === 'pengadaan' || rawStatus === 'disetujui'
        ? 'pengadaan'
        : 'diteruskan';

  const maksList = useMemo(() => {
    return (detail?.maks || []).filter(
      (m) => (m.isActive ?? true) || selectedMakIds.includes(m.id)
    );
  }, [detail?.maks, selectedMakIds]);

  const handleAddMakDropdown = useCallback(() => {
    if (maksList.length === 0) return;
    const nextUnused =
      maksList.find((m) => !selectedMakIds.includes(m.id))?.id || maksList[0].id;
    setSelectedMakIds((prev) => [...prev, nextUnused]);
    setMakError('');
  }, [maksList, selectedMakIds]);

  const handleRemoveMakDropdown = useCallback(
    (idx: number) => {
      if (selectedMakIds.length > 1) {
        setSelectedMakIds((prev) => prev.filter((_, i) => i !== idx));
      }
    },
    [selectedMakIds.length]
  );

  const handleMakDropdownChange = useCallback((idx: number, val: number) => {
    setSelectedMakIds((prev) => prev.map((item, i) => (i === idx ? val : item)));
    setMakError('');
  }, []);

  const handleApproveSubmit = useCallback(async () => {
    const validIds = selectedMakIds.filter(Boolean);
    if (validIds.length === 0 || !id) {
      setMakError('Minimal satu Jenis MAK wajib dipilih untuk menyetujui permohonan.');
      return;
    }
    setProcessing(true);
    setMakError('');
    setCatatanError('');
    setFlashError('');
    try {
      await perencanaanService.approvePengajuan(
        id,
        validIds,
        catatanVerifikasi.trim() || undefined
      );
      setApproveModalOpen(false);
      navigate('/perencanaan/pengajuan');
    } catch (err: unknown) {
      const serverErr = extractServerErrors(err);
      if (serverErr.fieldErrors.mak_ids) {
        setMakError(serverErr.fieldErrors.mak_ids);
      }
      if (serverErr.fieldErrors.catatan) {
        setCatatanError(serverErr.fieldErrors.catatan);
      }
      setFlashError(serverErr.message || 'Gagal menyetujui permohonan.');
      setApproveModalOpen(false);
    } finally {
      setProcessing(false);
    }
  }, [id, selectedMakIds, catatanVerifikasi, navigate]);

  const handleRejectSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!alasanPenolakan || alasanPenolakan.trim().length < 5) {
        setAlasanError('Catatan penolakan wajib diisi minimal 5 karakter.');
        return;
      }
      setAlasanError('');
      if (!id) return;

      setProcessing(true);
      try {
        await perencanaanService.rejectPengajuan(id, alasanPenolakan.trim());
        setRejectModalOpen(false);
        navigate('/perencanaan/pengajuan');
      } catch (err: unknown) {
        const serverErr = extractServerErrors(err);
        setAlasanError(
          serverErr.fieldErrors.alasan ||
            serverErr.fieldErrors.catatan ||
            serverErr.message ||
            'Gagal menolak permohonan.'
        );
      } finally {
        setProcessing(false);
      }
    },
    [id, alasanPenolakan, navigate]
  );

  const handlePengadaanMakDraftChange = useCallback((pengadaanId: number, makId: number) => {
    setPengadaanMakDrafts((prev) => ({ ...prev, [pengadaanId]: makId }));
    setPengadaanMakErrors((prev) => {
      const next = { ...prev };
      delete next[pengadaanId];
      return next;
    });
  }, []);

  const handleSavePengadaanMak = useCallback(
    async (pengadaanId: number) => {
      const newMakId = pengadaanMakDrafts[pengadaanId];
      if (!newMakId || !id) return;

      setUpdatingPengadaanId(pengadaanId);
      setFlashError('');
      setFlashSuccess('');
      try {
        const res = await perencanaanService.updateJenisMakPengadaan(pengadaanId, {
          mak_id: newMakId,
        });
        setFlashSuccess(res.message || 'Jenis MAK pada dokumen pengadaan berhasil diperbaiki.');
        reloadDetail();
      } catch (err: unknown) {
        const serverErr = extractServerErrors(err);
        setPengadaanMakErrors((prev) => ({
          ...prev,
          [pengadaanId]:
            serverErr.fieldErrors.mak_id ||
            serverErr.message ||
            'Gagal memperbarui Jenis MAK pengadaan.',
        }));
      } finally {
        setUpdatingPengadaanId(null);
      }
    },
    [id, pengadaanMakDrafts, reloadDetail]
  );

  const allDocuments: DokumenItem[] = useMemo(() => {
    const list: DokumenItem[] = [];
    if (Array.isArray(detail?.dokumen_permohonan) && detail.dokumen_permohonan.length > 0) {
      list.push(...detail.dokumen_permohonan);
    } else if (detail?.dokumen) {
      list.push(detail.dokumen);
    }
    return list;
  }, [detail]);

  // Preload preview blob for surat_permohonan document
  useEffect(() => {
    const targetDoc =
      allDocuments.find(
        (d) => d.tipe_dokumen === 'surat_permohonan' || d.tipe_dokumen === 'permohonan'
      ) || allDocuments[0];

    if (!targetDoc?.download_url) return;

    let isMounted = true;
    setIsLoadingPreview(true);
    setPreviewDocId(targetDoc.id);

    perencanaanService
      .fetchDokumenBlob(targetDoc.download_url, 'inline')
      .then(({ blob }) => {
        if (!isMounted) return;
        const blobUrl = URL.createObjectURL(blob);
        setPreviewBlobUrl(blobUrl);
      })
      .catch((err) => {
        console.error('Gagal memuat pratinjau inline dokumen:', err);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingPreview(false);
        }
      });

    return () => {
      isMounted = false;
      if (previewBlobUrl) {
        URL.revokeObjectURL(previewBlobUrl);
      }
    };
  }, [allDocuments]);

  // Preload preview blob for active RKAKL document
  useEffect(() => {
    const rkaklDoc = detail?.rkakl_active;
    const rkaklUrl =
      rkaklDoc?.download_url ||
      (rkaklDoc?.id ? `/api/v1/perencanaan/rkakl/dokumen/${rkaklDoc.id}` : null);

    if (!rkaklUrl) {
      setRkaklPreviewBlobUrl(null);
      setIsLoadingRkaklPreview(false);
      return;
    }

    let isMounted = true;
    setIsLoadingRkaklPreview(true);

    perencanaanService
      .fetchDokumenBlob(rkaklUrl, 'inline')
      .then(({ blob }) => {
        if (!isMounted) return;
        const blobUrl = URL.createObjectURL(blob);
        setRkaklPreviewBlobUrl(blobUrl);
      })
      .catch((err) => {
        console.error('Gagal memuat pratinjau RKAKL inline:', err);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingRkaklPreview(false);
        }
      });

    return () => {
      isMounted = false;
      if (rkaklPreviewBlobUrl) {
        URL.revokeObjectURL(rkaklPreviewBlobUrl);
      }
    };
  }, [detail?.rkakl_active]);

  const handleViewDokumen = useCallback(
    async (doc: DokumenItem) => {
      const targetUrl =
        doc.download_url ||
        (permohonan?.id ? `/v1/perencanaan/pengajuan/${permohonan.id}/dokumen` : null);
      if (!targetUrl) return;

      setIsViewingDocId(doc.id);
      try {
        const { blob } = await perencanaanService.fetchDokumenBlob(targetUrl, 'inline');
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
      } catch (err) {
        console.error('Gagal membuka dokumen:', err);
      } finally {
        setIsViewingDocId(null);
      }
    },
    [permohonan?.id]
  );

  const handleDownloadDokumen = useCallback(
    async (doc: DokumenItem) => {
      const targetUrl =
        doc.download_url ||
        (permohonan?.id ? `/v1/perencanaan/pengajuan/${permohonan.id}/dokumen` : null);
      if (!targetUrl) return;

      setIsDownloadingDocId(doc.id);
      try {
        const { blob } = await perencanaanService.fetchDokumenBlob(targetUrl, 'attachment');
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download =
          doc.nama_asli ||
          `Dokumen_Permohonan_${permohonan?.nomor_surat || 'SIPBAJA'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      } catch (err) {
        console.error('Gagal mengunduh dokumen:', err);
      } finally {
        setIsDownloadingDocId(null);
      }
    },
    [permohonan?.id, permohonan?.nomor_surat]
  );

  return {
    detail,
    isLoading,
    mode,
    maksList,
    selectedMakIds,
    catatanVerifikasi,
    makError,
    catatanError,
    flashSuccess,
    flashError,
    handleAddMakDropdown,
    handleRemoveMakDropdown,
    handleMakDropdownChange,
    setCatatanVerifikasi,
    approveModalOpen,
    setApproveModalOpen,
    rejectModalOpen,
    setRejectModalOpen,
    alasanPenolakan,
    setAlasanPenolakan,
    alasanError,
    setAlasanError,
    catatanApprove,
    setCatatanApprove,
    processing,
    handleApproveSubmit,
    handleRejectSubmit,
    pengadaanMakDrafts,
    updatingPengadaanId,
    pengadaanMakErrors,
    handlePengadaanMakDraftChange,
    handleSavePengadaanMak,
    allDocuments,
    previewBlobUrl,
    previewDocId,
    isLoadingPreview,
    rkaklPreviewBlobUrl,
    isLoadingRkaklPreview,
    isViewingDocId,
    isDownloadingDocId,
    handleViewDokumen,
    handleDownloadDokumen,
    reloadDetail,
  };
}

export default usePerencanaanPengajuan;
