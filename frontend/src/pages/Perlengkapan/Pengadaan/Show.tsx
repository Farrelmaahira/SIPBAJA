import { useEffect, useState, type FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import perlengkapanService from '../../../services/perlengkapanService';
import PerlengkapanPengadaanShowTemplate from '../../../components/templates/Perlengkapan/PerlengkapanPengadaanShowTemplate';
import api from '../../../services/api';
import {
  openDocumentPreviewInNewTab,
  downloadDocumentFile,
} from '../../../utils/documentPreview';
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

  // Preview Dokumentasi (Foto) Modal State (Pop Up)
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewDocName, setPreviewDocName] = useState<string | null>(null);
  const [previewDocSize, setPreviewDocSize] = useState<string | null>(null);

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

  /**
   * Lihat Dokumen: Terbuka di halaman (tab) baru browser dengan pratinjau lengkap
   */
  const handleViewDokumen = (doc: PerlengkapanDokumenItem) => {
    openDocumentPreviewInNewTab({
      nama: doc.nama,
      url: doc.url,
      tipe: doc.tipe,
      ukuran: doc.ukuran,
    });
  };

  /**
   * Unduh Dokumen: Download file ke komputer pengguna
   */
  const handleDownloadDokumen = async (doc: PerlengkapanDokumenItem) => {
    await downloadDocumentFile(doc.url, doc.nama);
  };

  /**
   * Lihat Dokumentasi: Muncul pop up (modal) pratinjau gambar
   */
  const handleViewDokumentasi = async (foto: PerlengkapanDokumenItem) => {
    setPreviewDocName(foto.nama);
    setPreviewDocSize(foto.ukuran);

    try {
      const res = await api.get(foto.url, { responseType: 'blob' });
      const rawType = res.headers['content-type'];
      const contentType = typeof rawType === 'string' ? rawType : 'image/jpeg';
      const blob = new Blob([res.data], { type: contentType });
      const blobUrl = URL.createObjectURL(blob);
      setPreviewBlobUrl(blobUrl);
    } catch (err) {
      console.error('Failed to preview foto in modal:', err);
      setPreviewBlobUrl(foto.url);
    }
  };

  /**
   * Unduh Foto Dokumentasi
   */
  const handleDownloadDokumentasi = async (foto: PerlengkapanDokumenItem) => {
    await handleDownloadDokumen(foto);
  };

  /**
   * Lihat Berkas Dokumen Baru yang belum di-submit (Tab Baru dengan Pratinjau)
   */
  const handleViewNewDokumen = (file: File) => {
    openDocumentPreviewInNewTab({
      nama: file.name,
      file,
    });
  };

  /**
   * Unduh Berkas Dokumen Baru
   */
  const handleDownloadNewDokumen = (file: File) => {
    const blobUrl = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  };

  /**
   * Lihat Foto Baru yang belum di-submit (Pop Up)
   */
  const handleViewNewFoto = (file: File) => {
    const blobUrl = URL.createObjectURL(file);
    setPreviewBlobUrl(blobUrl);
    setPreviewDocName(file.name);
    setPreviewDocSize(`${Math.round(file.size / 1024)} KB`);
  };

  /**
   * Unduh Foto Baru
   */
  const handleDownloadNewFoto = (file: File) => {
    handleDownloadNewDokumen(file);
  };

  const handleClosePreview = () => {
    if (previewBlobUrl && previewBlobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewBlobUrl);
    }
    setPreviewBlobUrl(null);
    setPreviewDocName(null);
    setPreviewDocSize(null);
  };

  const handleDownloadPreview = () => {
    if (!previewBlobUrl) return;
    const link = document.createElement('a');
    link.href = previewBlobUrl;
    link.download = previewDocName || 'Dokumentasi_Foto.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      onEdit={() => navigate(`/perlengkapan/pengadaan/${id}/edit`)}
      onViewDokumen={handleViewDokumen}
      onDownloadDokumen={handleDownloadDokumen}
      onViewDokumentasi={handleViewDokumentasi}
      onDownloadDokumentasi={handleDownloadDokumentasi}
      onViewNewDokumen={handleViewNewDokumen}
      onDownloadNewDokumen={handleDownloadNewDokumen}
      onViewNewFoto={handleViewNewFoto}
      onDownloadNewFoto={handleDownloadNewFoto}
      previewBlobUrl={previewBlobUrl}
      previewDocName={previewDocName}
      previewDocSize={previewDocSize}
      onDownloadPreview={handleDownloadPreview}
      onClosePreview={handleClosePreview}
      isConfirmOpen={isConfirmModalOpen}
      onOpenConfirm={() => setIsConfirmModalOpen(true)}
      onCloseConfirm={() => setIsConfirmModalOpen(false)}
    />
  );
};

export default PerlengkapanPengadaanShow;
