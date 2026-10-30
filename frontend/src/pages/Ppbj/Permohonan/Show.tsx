import { useCallback, useEffect, useState, type FC } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import PermohonanShowTemplate from '../../../components/templates/PermohonanShowTemplate';

export const PpbjPermohonanShow: FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [permohonan, setPermohonan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [flash, setFlash] = useState<{ success?: string; error?: string }>({});

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    try {
      const res = await api.get<{
        permohonan?: any;
        data?: any;
      }>(`/v1/ppbj/permohonan/${id}`);
      const data = res.data;
      setPermohonan(data.permohonan || data.data || data);
    } catch (err) {
      console.error('Failed to fetch PPBJ permohonan detail:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setIsLoading(true);
    fetchDetail();
  }, [fetchDetail]);

  const handleSaveDraft = async (payload: any) => {
    if (!id) return;
    try {
      setFlash({});
      let requestData: any = payload;
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

      await api.post(`/v1/ppbj/permohonan/${id}/pengadaan/draft`, requestData);
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
      await api.delete(`/v1/ppbj/pengadaan/${paketId}`);
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
      await api.post(`/v1/ppbj/permohonan/${id}/pengadaan/submit`);
      setFlash({ success: 'Seluruh paket pengadaan berhasil dikirim ke reviewer.' });
      await fetchDetail();
    } catch (err: any) {
      console.error('Failed to submit pengadaan to reviewer:', err);
      const message = err.response?.data?.message || 'Gagal mengirim paket pengadaan ke reviewer.';
      setFlash({ error: message });
    }
  };

  return (
    <PermohonanShowTemplate
      user={user}
      permohonan={permohonan}
      isLoading={isLoading}
      flash={flash}
      onSaveDraft={handleSaveDraft}
      onDeleteDraft={handleDeleteDraft}
      onSubmitToReviewer={handleSubmitToReviewer}
    />
  );
};

export default PpbjPermohonanShow;
