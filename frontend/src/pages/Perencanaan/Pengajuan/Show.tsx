import { useState, useEffect, useMemo, type FC, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import perencanaanService from '../../../services/perencanaanService';
import PerencanaanPengajuanShowTemplate from '../../../components/templates/PerencanaanPengajuanShowTemplate';
import { extractServerErrors } from '../../../utils/fileValidation';
import type { PerencanaanPengajuanDetail } from '../../../types/perencanaan';
import type { DokumenItem } from '../../../types/dokumen';
import type { NotificationItem } from '../../../types/notification';

export interface PerencanaanShowProps {
  initialDetail?: PerencanaanPengajuanDetail | null;
  recentNotifications?: NotificationItem[];
  unreadNotificationsCount?: number;
}

export const PerencanaanPengajuanShow: FC<PerencanaanShowProps> = ({
  initialDetail = null,
  recentNotifications = [],
  unreadNotificationsCount = 0,
}) => {
  const { id } = useParams<{ id: string }>();
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

  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [alasanPenolakan, setAlasanPenolakan] = useState('');
  const [alasanError, setAlasanError] = useState('');
  const [processing, setProcessing] = useState(false);

  const loadDetail = (targetId: string, signal?: AbortSignal) => {
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
  };

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

    return () => controller.abort();
  }, [id, initialDetail]);

  const permohonan = detail?.permohonan;
  const rawStatus = permohonan?.status || 'diajukan';

  const mode =
    rawStatus === 'diajukan' || rawStatus === 'menunggu_verifikasi'
      ? 'verifikasi'
      : rawStatus === 'pengadaan' || rawStatus === 'disetujui'
        ? 'pengadaan'
        : 'diteruskan';

  const maksList = detail?.maks || [];

  const handleAddMakDropdown = () => {
    if (maksList.length === 0) return;
    const nextUnused =
      maksList.find((m) => !selectedMakIds.includes(m.id))?.id || maksList[0].id;
    setSelectedMakIds((prev) => [...prev, nextUnused]);
    setMakError('');
  };

  const handleRemoveMakDropdown = (idx: number) => {
    if (selectedMakIds.length > 1) {
      setSelectedMakIds((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const handleMakDropdownChange = (idx: number, val: number) => {
    setSelectedMakIds((prev) => prev.map((item, i) => (i === idx ? val : item)));
    setMakError('');
  };

  const handleApproveSubmit = async () => {
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
  };

  const handleRejectSubmit = async (e: FormEvent) => {
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
  };

  const handlePengadaanMakDraftChange = (pengadaanId: number, makId: number) => {
    setPengadaanMakDrafts((prev) => ({ ...prev, [pengadaanId]: makId }));
    setPengadaanMakErrors((prev) => {
      const next = { ...prev };
      delete next[pengadaanId];
      return next;
    });
  };

  const handleSavePengadaanMak = async (pengadaanId: number) => {
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
      loadDetail(id);
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
  };

  const allDocuments: DokumenItem[] = useMemo(() => {
    const list: DokumenItem[] = [];
    if (Array.isArray(detail?.dokumen_permohonan) && detail.dokumen_permohonan.length > 0) {
      list.push(...detail.dokumen_permohonan);
    } else if (detail?.dokumen) {
      list.push(detail.dokumen);
    } else if (permohonan?.id) {
      list.push({
        id: permohonan.id,
        nama_asli: `Surat_Permohonan_${permohonan.nomor_surat || 'SIPBAJA'}.pdf`,
        tipe_dokumen: 'surat_permohonan',
        download_url: `/api/v1/perencanaan/pengajuan/${permohonan.id}/dokumen`,
      });
    }
    return list;
  }, [detail, permohonan]);

  // Preload preview blob for the surat_permohonan document
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

  // Preload preview blob for the active RKAKL document
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

  const handleViewDokumen = async (doc: DokumenItem) => {
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
  };

  const handleDownloadDokumen = async (doc: DokumenItem) => {
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
  };

  return (
    <PerencanaanPengajuanShowTemplate
      detail={detail}
      dokumenList={allDocuments}
      isLoading={isLoading}
      mode={mode}
      maksList={maksList}
      selectedMakIds={selectedMakIds}
      catatanVerifikasi={catatanVerifikasi}
      makError={makError}
      catatanError={catatanError}
      flashSuccess={flashSuccess}
      flashError={flashError}
      onAddMak={handleAddMakDropdown}
      onRemoveMak={handleRemoveMakDropdown}
      onChangeMak={handleMakDropdownChange}
      onCatatanChange={setCatatanVerifikasi}
      onApproveClick={() => setApproveModalOpen(true)}
      onRejectClick={() => setRejectModalOpen(true)}
      onViewDokumen={handleViewDokumen}
      onDownloadDokumen={handleDownloadDokumen}
      isViewingDocId={isViewingDocId}
      isDownloadingDocId={isDownloadingDocId}
      previewBlobUrl={previewBlobUrl}
      previewDocId={previewDocId}
      isLoadingPreview={isLoadingPreview}
      rkaklPreviewBlobUrl={rkaklPreviewBlobUrl}
      isLoadingRkaklPreview={isLoadingRkaklPreview}
      processing={processing}
      pengadaanMakDrafts={pengadaanMakDrafts}
      updatingPengadaanId={updatingPengadaanId}
      pengadaanMakErrors={pengadaanMakErrors}
      onPengadaanMakDraftChange={handlePengadaanMakDraftChange}
      onSavePengadaanMak={handleSavePengadaanMak}
      approveModalOpen={approveModalOpen}
      rejectModalOpen={rejectModalOpen}
      alasanPenolakan={alasanPenolakan}
      alasanError={alasanError}
      onCloseApproveModal={() => setApproveModalOpen(false)}
      onCloseRejectModal={() => setRejectModalOpen(false)}
      onConfirmApprove={handleApproveSubmit}
      onConfirmReject={handleRejectSubmit}
      onAlasanChange={(val) => {
        setAlasanPenolakan(val);
        if (alasanError) setAlasanError('');
      }}
      recentNotifications={recentNotifications}
      unreadNotificationsCount={unreadNotificationsCount}
    />
  );
};

export default PerencanaanPengajuanShow;
