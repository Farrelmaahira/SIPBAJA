import { useCallback, useEffect, useState, type FC } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../services/api';
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

  const fetchDetail = useCallback(async (signal?: AbortSignal) => {
    if (!id) return;
    try {
      const data = await ppbjService.getPermohonanDetail(id, signal);
      setPermohonan(data);
    } catch (err: unknown) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        console.error('Failed to fetch PPBJ permohonan detail:', err);
      }
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
    if (previewDocId === doc.id) {
      setPreviewDocId(null);
      setPreviewBlobUrl(null);
      return;
    }

    setIsLoadingPreview(true);
    setPreviewDocId(doc.id);

    try {
      const endpoint = `${doc.download_url}${doc.download_url.includes('?') ? '&' : '?'}disposition=inline`;
      const res = await api.get<Blob>(endpoint, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: doc.mime_type || 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      setPreviewBlobUrl(blobUrl);
    } catch (err) {
      console.error('Failed to preview document:', err);
      setPreviewBlobUrl(null);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleDownloadDokumen = (doc: DokumenItem) => {
    if (doc.download_url) {
      window.open(doc.download_url, '_blank');
    }
  };

  const dokumenList: DokumenItem[] = (permohonan?.dokumenList || []).map((d) => ({
    id: d.id,
    nama_asli: d.nama_asli || 'Surat_Permohonan.pdf',
    tipe_dokumen: d.tipe_dokumen || 'surat_permohonan',
    ukuran_bytes: d.ukuran_bytes || 0,
    mime_type: d.mime_type || 'application/pdf',
    download_url: d.download_url,
  }));

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
      previewBlobUrl={previewBlobUrl}
      previewDocId={previewDocId}
      isLoadingPreview={isLoadingPreview}
    />
  );
};

export default PpbjPermohonanShow;
