import { useState, useEffect, useCallback, useMemo, type FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import bidang2Service from '../../../services/bidang2Service';
import Bidang2PengajuanShowTemplate from '../../../components/templates/Bidang2PengajuanShowTemplate';
import type { Bidang2DetailPengajuan } from '../../../types/bidang2';
import type { DokumenItem } from '../../../types/dokumen';

export const Bidang2PengajuanShow: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [permohonan, setPermohonan] = useState<Bidang2DetailPengajuan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [flashMessage, setFlashMessage] = useState<string | null>(null);

  // Document action & live preview states (identical to Perencanaan Pengajuan Show)
  const [isViewingDocId, setIsViewingDocId] = useState<number | string | null>(null);
  const [isDownloadingDocId, setIsDownloadingDocId] = useState<number | string | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewDocId, setPreviewDocId] = useState<number | string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);

  const [isSetujuModalOpen, setIsSetujuModalOpen] = useState<boolean>(false);
  const [isTolakModalOpen, setIsTolakModalOpen] = useState<boolean>(false);

  const fetchDetail = useCallback(async (signal?: AbortSignal) => {
    if (!id) return;

    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');

    try {
      const res = await bidang2Service.getPengajuanDetail(id, signal);
      setPermohonan(res.permohonan);
    } catch (err: unknown) {
      if (signal?.aborted) return;
      setHasError(true);
      const msg =
        err instanceof Error
          ? err.message
          : 'Gagal memuat detail pengajuan. Pastikan data ada dan Anda memiliki hak akses.';
      setErrorMessage(msg);
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {
    const controller = new AbortController();
    void fetchDetail(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchDetail]);

  const dokumenList: DokumenItem[] = useMemo(() => {
    if (!permohonan) return [];
    if (permohonan.dokumen) {
      return [
        {
          id: permohonan.dokumen.id || permohonan.id,
          nama_asli:
            permohonan.dokumen.nama_asli ||
            `Surat_Permohonan_${(permohonan.judul || 'Pengadaan').replace(/\s+/g, '_')}.pdf`,
          tipe_dokumen: 'surat_permohonan',
          ukuran_bytes: permohonan.dokumen.ukuran_bytes,
          mime_type: permohonan.dokumen.mime_type || 'application/pdf',
          download_url:
            permohonan.dokumen.download_url ||
            `/api/v1/bidang-2/permohonan/${permohonan.id}/dokumen`,
        },
      ];
    }
    return [
      {
        id: permohonan.id,
        nama_asli: `Surat_Permohonan_${(permohonan.judul || 'Pengadaan').replace(/\s+/g, '_')}.pdf`,
        tipe_dokumen: 'surat_permohonan',
        download_url: `/api/v1/bidang-2/permohonan/${permohonan.id}/dokumen`,
      },
    ];
  }, [permohonan]);

  // Preload preview blob for the surat_permohonan document (matching Perencanaan)
  useEffect(() => {
    const targetDoc =
      dokumenList.find(
        (d) => d.tipe_dokumen === 'surat_permohonan' || d.tipe_dokumen === 'permohonan'
      ) || dokumenList[0];

    if (!targetDoc?.download_url) {
      setPreviewBlobUrl(null);
      setPreviewDocId(null);
      setIsLoadingPreview(false);
      return;
    }

    let isMounted = true;
    let currentBlobUrl: string | null = null;
    const controller = new AbortController();

    setIsLoadingPreview(true);
    setPreviewDocId(targetDoc.id);

    bidang2Service
      .fetchDokumenBlob(targetDoc.download_url, 'inline', controller.signal)
      .then(({ blob }) => {
        if (!isMounted) return;
        currentBlobUrl = URL.createObjectURL(blob);
        setPreviewBlobUrl(currentBlobUrl);
      })
      .catch((err) => {
        if (!isMounted || controller.signal.aborted) return;
        console.error('Gagal memuat pratinjau inline dokumen:', err);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingPreview(false);
        }
      });

    return () => {
      isMounted = false;
      controller.abort();
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
      }
    };
  }, [dokumenList]);

  const handleViewDokumen = async (doc: DokumenItem) => {
    const targetUrl =
      doc.download_url ||
      (permohonan?.id ? `/api/v1/bidang-2/permohonan/${permohonan.id}/dokumen` : null);
    if (!targetUrl) return;

    setIsViewingDocId(doc.id);
    try {
      const { blob } = await bidang2Service.fetchDokumenBlob(targetUrl, 'inline');
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
      (permohonan?.id ? `/api/v1/bidang-2/permohonan/${permohonan.id}/dokumen` : null);
    if (!targetUrl) return;

    setIsDownloadingDocId(doc.id);
    try {
      const { blob } = await bidang2Service.fetchDokumenBlob(targetUrl, 'attachment');
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

  const handleOpenRkakl = () => {
    navigate('/bidang-2/rkakl');
  };

  const handleSetujuSubmit = async (fileMemo: File) => {
    if (!id) return;

    const payload = new FormData();
    payload.append('file_memo', fileMemo);

    await bidang2Service.approvePengajuan(id, payload);
    setFlashMessage('Permohonan berhasil disetujui dan memo persetujuan telah tersimpan.');
    await fetchDetail();
  };

  const handleTolakSubmit = async (alasan: string) => {
    if (!id) return;

    await bidang2Service.rejectPengajuan(id, alasan);
    setFlashMessage('Permohonan berhasil ditolak dan catatan telah diteruskan ke pemohon serta Perencanaan.');
    await fetchDetail();
  };

  return (
    <Bidang2PengajuanShowTemplate
      user={user}
      permohonan={permohonan}
      dokumenList={dokumenList}
      isLoading={isLoading}
      hasError={hasError}
      errorMessage={errorMessage}
      flashMessage={flashMessage}
      onCloseFlash={() => setFlashMessage(null)}
      previewBlobUrl={previewBlobUrl}
      previewDocId={previewDocId}
      isLoadingPreview={isLoadingPreview}
      isViewingDocId={isViewingDocId}
      isDownloadingDocId={isDownloadingDocId}
      onViewDokumen={handleViewDokumen}
      onDownloadDokumen={handleDownloadDokumen}
      isSetujuModalOpen={isSetujuModalOpen}
      onToggleSetujuModal={setIsSetujuModalOpen}
      isTolakModalOpen={isTolakModalOpen}
      onToggleTolakModal={setIsTolakModalOpen}
      onSetujuSubmit={handleSetujuSubmit}
      onTolakSubmit={handleTolakSubmit}
      onOpenRkakl={handleOpenRkakl}
      onBack={() => navigate('/bidang-2/pengajuan')}
      onRetry={() => void fetchDetail()}
    />
  );
};

export default Bidang2PengajuanShow;
