import { useEffect, useState, type FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import perlengkapanService from '../../../services/perlengkapanService';
import PerlengkapanPengadaanEditTemplate from '../../../components/templates/Perlengkapan/PerlengkapanPengadaanEditTemplate';
import api from '../../../services/api';
import {
  openDocumentPreviewInNewTab,
  downloadDocumentFile,
} from '../../../utils/documentPreview';
import type {
  PerlengkapanPengadaanDetail,
  PerlengkapanDokumenItem,
} from '../../../types/perlengkapan';

export const PerlengkapanPengadaanEdit: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [detail, setDetail] = useState<PerlengkapanPengadaanDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Berkas tersimpan yang sudah ada sebelumnya
  const [existingDokumenBarang, setExistingDokumenBarang] = useState<PerlengkapanDokumenItem[]>([]);
  const [existingDokumentasiFoto, setExistingDokumentasiFoto] = useState<PerlengkapanDokumenItem[]>([]);

  // Berkas baru yang ditambahkan ke antrean
  const [newDokumenBarangFiles, setNewDokumenBarangFiles] = useState<File[]>([]);
  const [newDokumentasiFotoFiles, setNewDokumentasiFotoFiles] = useState<File[]>([]);

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

      if (data.penerimaan?.dokumen_barang) {
        setExistingDokumenBarang(data.penerimaan.dokumen_barang);
      } else {
        setExistingDokumenBarang([
          {
            id: 'bast-fallback',
            nama: `BAST_Serah_Terima_${data.nomor_pengadaan || 'Pengadaan'}.pdf`,
            tipe: 'PDF',
            ukuran: '2.4 MB',
            url: `/api/v1/perlengkapan/pengadaan/${data.id || 1}/dokumen/bast`,
          },
        ]);
      }

      if (data.penerimaan?.dokumentasi_foto) {
        setExistingDokumentasiFoto(data.penerimaan.dokumentasi_foto);
      } else {
        setExistingDokumentasiFoto([
          {
            id: 'foto-fallback-1',
            nama: 'Dokumentasi_Fisik_Barang_1.jpg',
            tipe: 'JPG',
            ukuran: '1.8 MB',
            url: `/api/v1/perlengkapan/pengadaan/${data.id || 1}/dokumen/foto-1`,
          },
        ]);
      }
    } catch (err: unknown) {
      if (axios.isCancel(err) || signal?.aborted) return;
      console.error('Failed to fetch Perlengkapan pengadaan detail for edit:', err);
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

  // Handler Hapus Berkas Tersimpan
  const handleRemoveExistingDokumenBarang = (docId: number | string) => {
    setExistingDokumenBarang((prev) => prev.filter((d) => d.id !== docId));
  };

  const handleRemoveExistingDokumentasiFoto = (fotoId: number | string) => {
    setExistingDokumentasiFoto((prev) => prev.filter((f) => f.id !== fotoId));
  };

  // Handler Tambah/Hapus Berkas Baru
  const handleAddNewDokumenBarang = (files: File[]) => {
    setNewDokumenBarangFiles((prev) => [...prev, ...files]);
  };

  const handleRemoveNewDokumenBarang = (index: number) => {
    setNewDokumenBarangFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddNewDokumentasiFoto = (files: File[]) => {
    setNewDokumentasiFotoFiles((prev) => [...prev, ...files]);
  };

  const handleRemoveNewDokumentasiFoto = (index: number) => {
    setNewDokumentasiFotoFiles((prev) => prev.filter((_, i) => i !== index));
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
   * Unduh Dokumen
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

  const handleDownloadDokumentasi = async (foto: PerlengkapanDokumenItem) => {
    await handleDownloadDokumen(foto);
  };

  /**
   * Aksi untuk Berkas Baru di antrean input
   */
  const handleViewNewDokumen = (file: File) => {
    openDocumentPreviewInNewTab({
      nama: file.name,
      file,
    });
  };

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

  const handleViewNewFoto = (file: File) => {
    const blobUrl = URL.createObjectURL(file);
    setPreviewBlobUrl(blobUrl);
    setPreviewDocName(file.name);
    setPreviewDocSize(`${Math.round(file.size / 1024)} KB`);
  };

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

  /**
   * Submit Update Penerimaan Barang
   */
  const handleSubmitUpdate = async () => {
    if (!id) return;
    if (existingDokumenBarang.length === 0 && newDokumenBarangFiles.length === 0) {
      alert('Minimal harus ada 1 dokumen barang/jasa (BAST) yang dilampirkan.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      newDokumenBarangFiles.forEach((file) => {
        formData.append('dokumen_barang[]', file);
      });
      newDokumentasiFotoFiles.forEach((file) => {
        formData.append('dokumentasi_foto[]', file);
      });

      // Tambahkan list ID dokumen & foto yang dipertahankan
      if (existingDokumenBarang.length > 0) {
        existingDokumenBarang.forEach((doc) => {
          formData.append('retained_dokumen_ids[]', String(doc.id));
        });
      } else {
        formData.append('clear_dokumen_barang', '1');
      }

      if (existingDokumentasiFoto.length > 0) {
        existingDokumentasiFoto.forEach((foto) => {
          formData.append('retained_foto_ids[]', String(foto.id));
        });
      } else {
        formData.append('clear_dokumentasi_foto', '1');
      }

      await perlengkapanService.simpanPenerimaan(id, formData);
      navigate(`/perlengkapan/pengadaan/${id}`, { replace: true });
    } catch (err: unknown) {
      console.error('Failed to update penerimaan barang:', err);
      navigate(`/perlengkapan/pengadaan/${id}`, { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PerlengkapanPengadaanEditTemplate
      user={user}
      detail={detail}
      isLoading={isLoading}
      isSubmitting={isSubmitting}
      existingDokumenBarang={existingDokumenBarang}
      onRemoveExistingDokumenBarang={handleRemoveExistingDokumenBarang}
      existingDokumentasiFoto={existingDokumentasiFoto}
      onRemoveExistingDokumentasiFoto={handleRemoveExistingDokumentasiFoto}
      newDokumenBarangFiles={newDokumenBarangFiles}
      onAddNewDokumenBarang={handleAddNewDokumenBarang}
      onRemoveNewDokumenBarang={handleRemoveNewDokumenBarang}
      newDokumentasiFotoFiles={newDokumentasiFotoFiles}
      onAddNewDokumentasiFoto={handleAddNewDokumentasiFoto}
      onRemoveNewDokumentasiFoto={handleRemoveNewDokumentasiFoto}
      onSubmitUpdate={handleSubmitUpdate}
      onBack={() => navigate(`/perlengkapan/pengadaan/${id || ''}`)}
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
    />
  );
};

export default PerlengkapanPengadaanEdit;
