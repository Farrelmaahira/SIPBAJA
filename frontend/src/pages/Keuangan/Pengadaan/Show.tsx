import { useEffect, useState, type FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import keuanganService from '../../../services/keuanganService';
import KeuanganPengadaanShowTemplate from '../../../components/templates/Keuangan/KeuanganPengadaanShowTemplate';
import api from '../../../services/api';
import type {
  KeuanganPengadaanDetail,
  KeuanganDokumenItem,
} from '../../../types/keuangan';

export const KeuanganPengadaanShow: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [detail, setDetail] = useState<KeuanganPengadaanDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [tanggalPembayaran, setTanggalPembayaran] = useState('');
  const [buktiBayarFiles, setBuktiBayarFiles] = useState<File[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Preview Document Modal State
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewDocName, setPreviewDocName] = useState<string | null>(null);

  const fetchDetail = async (signal?: AbortSignal) => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await keuanganService.getPengadaanDetail(id, signal);
      setDetail(data);
      if (data.pembayaran?.tanggal_pembayaran) {
        setTanggalPembayaran(data.pembayaran.tanggal_pembayaran);
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

  const handleAddBuktiBayar = (newFiles: File[]) => {
    setBuktiBayarFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveBuktiBayar = (index: number) => {
    setBuktiBayarFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleViewDokumen = async (doc: KeuanganDokumenItem) => {
    setPreviewDocName(doc.nama);

    try {
      const res = await api.get(doc.url, { responseType: 'blob' });
      const blobUrl = URL.createObjectURL(res.data);
      setPreviewBlobUrl(blobUrl);
    } catch (err) {
      console.error('Failed to preview document:', err);
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
    try {
      const res = await api.get(doc.url, { responseType: 'blob' });
      const blobUrl = URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = doc.nama;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Failed to download document:', err);
    }
  };

  const handleSubmitBuktiBayar = async () => {
    if (!id || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('tanggal_pembayaran', tanggalPembayaran);

      buktiBayarFiles.forEach((file) => {
        formData.append('bukti_bayar[]', file);
      });

      await keuanganService.storeBuktiBayar(id, formData);

      // Bersihkan antrean berkas dan refresh data detail dari database
      setBuktiBayarFiles([]);
      await fetchDetail();
      alert('Bukti pembayaran berhasil diunggah! Status pengadaan kini telah selesai.');
    } catch (err: unknown) {
      console.error('Failed to submit bukti pembayaran:', err);
      const errorMsg =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : 'Gagal mengunggah bukti pembayaran. Silakan periksa berkas dan coba lagi.';
      alert(errorMsg);
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
      tanggalPembayaran={tanggalPembayaran}
      onTanggalPembayaranChange={setTanggalPembayaran}
      buktiBayarFiles={buktiBayarFiles}
      onAddBuktiBayar={handleAddBuktiBayar}
      onRemoveBuktiBayar={handleRemoveBuktiBayar}
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
    />
  );
};

export default KeuanganPengadaanShow;
