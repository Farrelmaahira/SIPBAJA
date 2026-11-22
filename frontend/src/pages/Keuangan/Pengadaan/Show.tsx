import { useEffect, useState, type FC } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import keuanganService from '../../../services/keuanganService';
import KeuanganPengadaanShowTemplate from '../../../components/templates/Keuangan/KeuanganPengadaanShowTemplate';
import api from '../../../services/api';
import type {
  KeuanganPengadaanDetail,
  KeuanganDokumenItem,
  BuktiBayarFormItem,
  KeuanganBuktiBayarItem,
} from '../../../types/keuangan';

export const KeuanganPengadaanShow: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [detail, setDetail] = useState<KeuanganPengadaanDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [buktiBayarItems, setBuktiBayarItems] = useState<BuktiBayarFormItem[]>([
    { id: 'item-1', tanggal_pembayaran: '', file: null },
  ]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Preview Document Modal State
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewDocName, setPreviewDocName] = useState<string | null>(null);

  const handleStartEdit = () => {
    if (detail?.pembayaran?.dokumen_bukti_bayar && detail.pembayaran.dokumen_bukti_bayar.length > 0) {
      setBuktiBayarItems(
        detail.pembayaran.dokumen_bukti_bayar.map((doc, idx) => ({
          id: `existing-${doc.id || idx}`,
          tanggal_pembayaran: doc.tanggal_pembayaran || detail.pembayaran?.tanggal_pembayaran || '',
          file: null,
          existing_file: doc,
        }))
      );
    } else {
      setBuktiBayarItems([
        {
          id: 'item-1',
          tanggal_pembayaran: detail?.pembayaran?.tanggal_pembayaran || '',
          file: null,
        },
      ]);
    }
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    searchParams.delete('edit');
    setSearchParams(searchParams, { replace: true });
    setBuktiBayarItems([{ id: 'item-1', tanggal_pembayaran: detail?.pembayaran?.tanggal_pembayaran || '', file: null }]);
  };

  const fetchDetail = async (signal?: AbortSignal) => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await keuanganService.getPengadaanDetail(id, signal);
      setDetail(data);

      if (searchParams.get('edit') === 'true') {
        if (data.pembayaran?.dokumen_bukti_bayar && data.pembayaran.dokumen_bukti_bayar.length > 0) {
          setBuktiBayarItems(
            data.pembayaran.dokumen_bukti_bayar.map((doc, idx) => ({
              id: `existing-${doc.id || idx}`,
              tanggal_pembayaran: doc.tanggal_pembayaran || data.pembayaran?.tanggal_pembayaran || '',
              file: null,
              existing_file: doc,
            }))
          );
        }
        setIsEditing(true);
      } else if (data.pembayaran?.tanggal_pembayaran) {
        setBuktiBayarItems((prev) => {
          if (prev.length === 1 && !prev[0].tanggal_pembayaran && !prev[0].file) {
            return [{ ...prev[0], tanggal_pembayaran: data.pembayaran?.tanggal_pembayaran || '' }];
          }
          return prev;
        });
      }
    } catch (err: unknown) {
      if (axios.isCancel(err) || signal?.aborted) return;
      console.error('Failed to fetch Keuangan pengadaan detail:', err);
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    void fetchDetail(controller.signal);
    return () => controller.abort();
  }, [id]);

  const handleAddBuktiBayarItem = () => {
    setBuktiBayarItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        tanggal_pembayaran: prev[prev.length - 1]?.tanggal_pembayaran || '',
        file: null,
      },
    ]);
  };

  const handleRemoveBuktiBayarItem = (index: number) => {
    if (buktiBayarItems.length <= 1) return;
    setBuktiBayarItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateBuktiBayarItem = (
    index: number,
    field: 'tanggal_pembayaran' | 'file' | 'existing_file',
    value: string | File | KeuanganBuktiBayarItem | null
  ) => {
    setBuktiBayarItems((prev) => {
      const next = [...prev];
      if (next[index]) {
        next[index] = { ...next[index], [field]: value };
      }
      return next;
    });
  };

  const handleViewDokumen = async (doc: KeuanganDokumenItem) => {
    if (!doc.url) return;
    try {
      const res = await api.get(doc.url, {
        params: { disposition: 'inline' },
        responseType: 'blob',
      });
      const contentType = typeof res.headers['content-type'] === 'string'
        ? res.headers['content-type']
        : (doc.is_image ? 'image/jpeg' : 'application/pdf');
      const blob = new Blob([res.data], { type: contentType });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch {
      window.open(`${doc.url}?disposition=inline`, '_blank');
    }
  };

  const handleClosePreview = () => {
    if (previewBlobUrl) {
      URL.revokeObjectURL(previewBlobUrl);
    }
    setPreviewBlobUrl(null);
    setPreviewDocName(null);
  };

  const handleDownloadDokumen = async (doc: KeuanganDokumenItem) => {
    if (!doc.url) return;
    try {
      const res = await api.get(doc.url, {
        params: { disposition: 'attachment' },
        responseType: 'blob',
      });
      const contentType = typeof res.headers['content-type'] === 'string'
        ? res.headers['content-type']
        : 'application/octet-stream';
      const blob = new Blob([res.data], { type: contentType });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = doc.nama || 'dokumen.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch {
      const link = document.createElement('a');
      link.href = doc.url;
      link.download = doc.nama || 'dokumen.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleSubmitBuktiBayar = async () => {
    if (!id || isSubmitting) return;

    const validItems = buktiBayarItems.filter((item) => item.file !== null || item.existing_file);
    if (validItems.length === 0) {
      setToast({
        type: 'error',
        message: 'Silakan unggah atau sertakan minimal satu berkas bukti pembayaran.',
      });
      return;
    }

    const missingDate = validItems.some((item) => !item.tanggal_pembayaran);
    if (missingDate) {
      setToast({
        type: 'error',
        message: 'Silakan isi tanggal pembayaran untuk seluruh bukti pembayaran.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      const primaryDate =
        validItems[validItems.length - 1].tanggal_pembayaran || validItems[0].tanggal_pembayaran;
      formData.append('tanggal_pembayaran', primaryDate);

      if (isEditing) {
        formData.append('is_edit', '1');
      }

      let existingIdx = 0;
      validItems.forEach((item, index) => {
        if (item.existing_file && !item.file) {
          formData.append(`existing_items[${existingIdx}][id]`, String(item.existing_file.id));
          formData.append(`existing_items[${existingIdx}][tanggal_pembayaran]`, item.tanggal_pembayaran);
          existingIdx++;
        } else if (item.file) {
          formData.append('bukti_bayar[]', item.file);
          formData.append('tanggal_pembayaran_list[]', item.tanggal_pembayaran);
          formData.append(`items[${index}][tanggal_pembayaran]`, item.tanggal_pembayaran);
        }
      });

      await keuanganService.storeBuktiBayar(id, formData);

      setIsEditing(false);
      searchParams.delete('edit');
      setSearchParams(searchParams, { replace: true });

      setBuktiBayarItems([{ id: 'item-1', tanggal_pembayaran: '', file: null }]);
      await fetchDetail();
      setToast({
        type: 'success',
        message: isEditing
          ? 'Bukti pembayaran berhasil diperbarui!'
          : 'Bukti pembayaran berhasil diunggah! Status pengadaan kini telah selesai.',
      });
    } catch (err: unknown) {
      console.error('Failed to submit bukti pembayaran:', err);
      const errorMsg =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : 'Gagal mengunggah bukti pembayaran. Silakan periksa berkas dan coba lagi.';
      setToast({
        type: 'error',
        message: errorMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeuanganPengadaanShowTemplate
      user={user}
      detail={detail}
      isLoading={isLoading}
      isSubmitting={isSubmitting}
      isEditing={isEditing}
      onStartEdit={handleStartEdit}
      onCancelEdit={handleCancelEdit}
      buktiBayarItems={buktiBayarItems}
      onAddBuktiBayarItem={handleAddBuktiBayarItem}
      onRemoveBuktiBayarItem={handleRemoveBuktiBayarItem}
      onUpdateBuktiBayarItem={handleUpdateBuktiBayarItem}
      onSubmitBuktiBayar={handleSubmitBuktiBayar}
      onBack={() => navigate('/keuangan/pengadaan')}
      onViewDokumen={handleViewDokumen}
      onDownloadDokumen={handleDownloadDokumen}
      previewBlobUrl={previewBlobUrl}
      previewDocName={previewDocName}
      onClosePreview={handleClosePreview}
      isConfirmOpen={isConfirmModalOpen}
      onOpenConfirm={() => setIsConfirmModalOpen(true)}
      onCloseConfirm={() => setIsConfirmModalOpen(false)}
      toast={toast}
      onDismissToast={() => setToast(null)}
    />
  );
};

export default KeuanganPengadaanShow;
