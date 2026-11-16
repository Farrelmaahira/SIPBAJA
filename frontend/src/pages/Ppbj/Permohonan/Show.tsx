import { useCallback, useEffect, useMemo, useState, type FC } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ppbjService from '../../../services/ppbjService';
import { useAuth } from '../../../hooks/useAuth';
import PermohonanShowTemplate from '../../../components/templates/PermohonanShowTemplate';
import type { PpbjPermohonanDetail } from '../../../types/ppbj';
import type { DokumenItem } from '../../../types/dokumen';
import type { AppTopbarUser } from '../../../components/organisms/AppTopbar';

export const PpbjPermohonanShow: FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [permohonan, setPermohonan] = useState<PpbjPermohonanDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [flash, setFlash] = useState<{ success?: string; error?: string }>({});

  // Dokumen Preview State
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewDocId, setPreviewDocId] = useState<number | string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);
  const [isViewingDocId, setIsViewingDocId] = useState<number | string | null>(null);
  const [isDownloadingDocId, setIsDownloadingDocId] = useState<number | string | null>(null);

  const dokumenList: DokumenItem[] = useMemo(() => {
    return (permohonan?.dokumenList || []).map((d) => ({
      id: d.id,
      nama_asli: d.nama_asli || 'Surat_Permohonan.pdf',
      tipe_dokumen: d.tipe_dokumen || 'surat_permohonan',
      ukuran_bytes: d.ukuran_bytes || 0,
      mime_type: d.mime_type || 'application/pdf',
      download_url: d.download_url,
    }));
  }, [permohonan?.dokumenList]);

  // Preload preview blob for the surat_permohonan document so iframe previews it directly
  useEffect(() => {
    const targetDoc =
      dokumenList.find(
        (d) => d.tipe_dokumen === 'surat_permohonan' || d.tipe_dokumen === 'permohonan'
      ) || dokumenList[0];

    if (!targetDoc?.download_url) return;

    let isMounted = true;
    let localBlobUrl: string | null = null;
    setIsLoadingPreview(true);
    setPreviewDocId(targetDoc.id);

    ppbjService
      .fetchDokumenBlob(targetDoc.download_url, 'inline')
      .then(({ blob }) => {
        if (!isMounted) return;
        localBlobUrl = URL.createObjectURL(blob);
        setPreviewBlobUrl(localBlobUrl);
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
      if (localBlobUrl) {
        URL.revokeObjectURL(localBlobUrl);
      }
    };
  }, [dokumenList]);

  const fetchDetail = useCallback(async (signal?: AbortSignal) => {
    if (!id) return;
    try {
      const data = await ppbjService.getPermohonanDetail(id, signal);
      setPermohonan(data);
    } catch (err: unknown) {
      if (
        axios.isCancel(err) ||
        (err as { name?: string })?.name === 'CanceledError' ||
        (err instanceof DOMException && err.name === 'AbortError')
      ) {
        return;
      }
      console.error('Failed to fetch PPBJ permohonan detail:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    fetchDetail(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchDetail]);

  const handleSaveDraft = async (payload: { items: any[] }) => {
    if (!id) return;
    try {
      setFlash({});
      let requestData: FormData | object = payload;
      const hasFiles =
        Array.isArray(payload?.items) &&
        payload.items.some((it: any) => it?.dokumen instanceof File);

      if (hasFiles) {
        const formData = new FormData();
        payload.items.forEach((item: any, i: number) => {
          formData.append(`items[${i}][permohonan_mak_id]`, String(item.permohonan_mak_id ?? ''));
          formData.append(`items[${i}][jenis_id]`, String(item.jenis_id ?? ''));
          formData.append(`items[${i}][metode_id]`, String(item.metode_id ?? ''));
          formData.append(`items[${i}][nominal]`, String(item.nominal ?? ''));
          if (item.level_id) {
            formData.append(`items[${i}][level_id]`, String(item.level_id));
          }
          if (item.dokumen instanceof File) {
            formData.append(`items[${i}][dokumen]`, item.dokumen);
          }
        });
        requestData = formData;
      }

      await ppbjService.storeDraftPengadaan(id, requestData);
      setFlash({ success: 'Paket pengadaan berhasil disimpan sebagai draft.' });
      await fetchDetail();
    } catch (err: any) {
      console.error('Failed to save draft pengadaan:', err);
      const message = err.response?.data?.message || 'Gagal menyimpan draft paket pengadaan.';
      setFlash({ error: message });
      throw err;
    }
  };

  const handleDeleteDraft = async (paketId: number | string) => {
    try {
      setFlash({});
      await ppbjService.destroyDraftPengadaan(paketId);
      setFlash({ success: 'Paket pengadaan draft berhasil dihapus.' });
      await fetchDetail();
    } catch (err: any) {
      console.error('Failed to delete draft pengadaan:', err);
      const message = err.response?.data?.message || 'Gagal menghapus draft paket pengadaan.';
      setFlash({ error: message });
    }
  };

  const handleSubmitToReviewer = async () => {
    if (!id) return;
    try {
      setFlash({});
      const res = await ppbjService.submitReviewer(id);
      setFlash({ success: res.message || 'Seluruh paket pengadaan berhasil dikirim ke reviewer.' });
      await fetchDetail();
    } catch (err: any) {
      console.error('Failed to submit pengadaan to reviewer:', err);
      const message = err.response?.data?.message || 'Gagal mengirim paket pengadaan ke reviewer.';
      setFlash({ error: message });
    }
  };

  const handleViewDokumen = async (doc: DokumenItem) => {
    if (!doc.download_url) return;

    setIsViewingDocId(doc.id);
    try {
      const { blob } = await ppbjService.fetchDokumenBlob(doc.download_url, 'inline');
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (err) {
      console.error('Gagal membuka dokumen di tab baru:', err);
    } finally {
      setIsViewingDocId(null);
    }
  };

  const handleDownloadDokumen = async (doc: DokumenItem) => {
    if (!doc.download_url) return;

    setIsDownloadingDocId(doc.id);
    try {
      const { blob } = await ppbjService.fetchDokumenBlob(doc.download_url, 'attachment');
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download =
        doc.nama_asli ||
        `Dokumen_Permohonan_${permohonan?.nomorSurat || 'SIPBAJA'}.pdf`;
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
    <PermohonanShowTemplate
      user={user as AppTopbarUser | null}
      permohonan={permohonan}
      dokumenList={dokumenList}
      isLoading={isLoading}
      flash={flash}
      onSaveDraft={handleSaveDraft}
      onDeleteDraft={handleDeleteDraft}
      onSubmitToReviewer={handleSubmitToReviewer}
      onViewDokumen={handleViewDokumen}
      onDownloadDokumen={handleDownloadDokumen}
      isViewingId={isViewingDocId}
      isDownloadingId={isDownloadingDocId}
      previewBlobUrl={previewBlobUrl}
      previewDocId={previewDocId}
      isLoadingPreview={isLoadingPreview}
    />
  );
};

export default PpbjPermohonanShow;
