import { useEffect, useState, type FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import perlengkapanService from '../../../services/perlengkapanService';
import PerlengkapanPengadaanShowTemplate from '../../../components/templates/Perlengkapan/PerlengkapanPengadaanShowTemplate';
import api from '../../../services/api';
import type {
  PerlengkapanPengadaanDetail,
  PerlengkapanDokumenItem,
} from '../../../types/perlengkapan';

export const PerlengkapanPengadaanShow: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [detail, setDetail] = useState<PerlengkapanPengadaanDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [dokumenBarangFiles, setDokumenBarangFiles] = useState<File[]>([]);
  const [dokumentasiFotoFiles, setDokumentasiFotoFiles] = useState<File[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Preview Document Modal State
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewDocName, setPreviewDocName] = useState<string | null>(null);

  const fetchDetail = async (signal?: AbortSignal) => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await perlengkapanService.getPengadaanDetail(id, signal);
      setDetail(data);
    } catch (err: unknown) {
      if (axios.isCancel(err) || signal?.aborted) return;
      console.error('Failed to fetch Perlengkapan pengadaan detail:', err);
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

  const handleAddDokumenBarang = (newFiles: File[]) => {
    setDokumenBarangFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveDokumenBarang = (index: number) => {
    setDokumenBarangFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddDokumentasiFoto = (newFiles: File[]) => {
    setDokumentasiFotoFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveDokumentasiFoto = (index: number) => {
    setDokumentasiFotoFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleViewDokumen = async (doc: PerlengkapanDokumenItem) => {
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

  const handleDownloadDokumen = async (doc: PerlengkapanDokumenItem) => {
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

  const handleSubmitPenerimaan = async () => {
    if (!id || dokumenBarangFiles.length === 0) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      dokumenBarangFiles.forEach((file) => {
        formData.append('dokumen_barang[]', file);
      });
      dokumentasiFotoFiles.forEach((file) => {
        formData.append('dokumentasi_foto[]', file);
      });

      await perlengkapanService.simpanPenerimaan(id, formData);
      setDokumenBarangFiles([]);
      setDokumentasiFotoFiles([]);
      setIsConfirmModalOpen(false);
      await fetchDetail();
    } catch (err: unknown) {
      console.error('Failed to submit penerimaan barang:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PerlengkapanPengadaanShowTemplate
      user={user}
      detail={detail}
      isLoading={isLoading}
      isSubmitting={isSubmitting}
      dokumenBarangFiles={dokumenBarangFiles}
      onAddDokumenBarang={handleAddDokumenBarang}
      onRemoveDokumenBarang={handleRemoveDokumenBarang}
      dokumentasiFotoFiles={dokumentasiFotoFiles}
      onAddDokumentasiFoto={handleAddDokumentasiFoto}
      onRemoveDokumentasiFoto={handleRemoveDokumentasiFoto}
      onSubmitPenerimaan={handleSubmitPenerimaan}
      onBack={() => navigate('/perlengkapan/pengadaan')}
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

export default PerlengkapanPengadaanShow;
