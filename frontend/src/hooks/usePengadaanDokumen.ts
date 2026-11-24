import { useEffect, useMemo, useState } from 'react';
import { ppkService } from '../services/ppkService';
import type { DokumenItem } from '../types/dokumen';
import type { PpPengadaanDetailPayload } from '../types/pp';

export const usePengadaanDokumen = (detail: PpPengadaanDetailPayload) => {
  const primaryDokumenPengadaan = useMemo<DokumenItem | null>(() => {
    const dokumen = Array.isArray(detail.dokumen_pengadaan)
      ? detail.dokumen_pengadaan
      : detail.dokumen_pengadaan
        ? [detail.dokumen_pengadaan]
        : [];

    return (
      dokumen.find((d) => d.tipe_dokumen === 'dokumen_pengadaan') || dokumen[0] || null
    );
  }, [detail.dokumen_pengadaan]);

  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);
  const [downloadingDocId, setDownloadingDocId] = useState<number | string | null>(null);

  const downloadUrl = primaryDokumenPengadaan?.download_url;

  useEffect(() => {
    if (!downloadUrl) {
      setPreviewBlobUrl(null);
      return;
    }

    const controller = new AbortController();
    let objectUrl: string | null = null;
    setIsLoadingPreview(true);

    ppkService
      .fetchDokumenBlob(downloadUrl, 'inline', controller.signal)
      .then(({ blob }) => {
        objectUrl = URL.createObjectURL(blob);
        setPreviewBlobUrl(objectUrl);
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          console.warn('Gagal memuat blob dokumen pengadaan untuk live preview:', err);
          setPreviewBlobUrl(null);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingPreview(false);
        }
      });

    return () => {
      controller.abort();
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [downloadUrl]);

  const handleDownload = async (doc: DokumenItem) => {
    if (!doc.download_url) return;
    setDownloadingDocId(doc.id);
    try {
      const { blob } = await ppkService.fetchDokumenBlob(doc.download_url, 'attachment');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.nama_asli || 'dokumen.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Gagal mengunduh dokumen:', err);
    } finally {
      setDownloadingDocId(null);
    }
  };

  const handleViewNewTab = async (doc: DokumenItem) => {
    if (!doc.download_url) return;
    try {
      const { blob } = await ppkService.fetchDokumenBlob(doc.download_url, 'inline');
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (err) {
      console.error('Gagal membuka dokumen:', err);
    }
  };

  return {
    primaryDokumenPengadaan,
    previewBlobUrl,
    isLoadingPreview,
    downloadingDocId,
    handleDownload,
    handleViewNewTab,
  };
};

export default usePengadaanDokumen;
