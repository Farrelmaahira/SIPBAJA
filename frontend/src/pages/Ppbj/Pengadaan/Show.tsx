import { type FC, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PpbjPengadaanShowTemplate from '@/components/templates/PPBJ/PpbjPengadaanShowTemplate';
import ppbjService from '@/services/ppbjService';
import type {
  PpbjPengadaanDetail,
  PpbjSimpanKontrakPayload,
  PpbjUpdateKlasifikasiPayload,
  PpbjPembayaranContext,
} from '@/types/ppbj';
import type { DokumenItem } from '@/types/dokumen';

export const PpbjPengadaanShow: FC = () => {
  const { id } = useParams<{ id: string }>();
  const [pengadaan, setPengadaan] = useState<PpbjPengadaanDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [flash, setFlash] = useState<{ success?: string; error?: string }>({});
  const [isEditKlasifikasiOpen, setIsEditKlasifikasiOpen] = useState<boolean>(false);
  const [isSubmittingKlasifikasi, setIsSubmittingKlasifikasi] = useState<boolean>(false);
  const [isSubmittingKontrak, setIsSubmittingKontrak] = useState<boolean>(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewDocId, setPreviewDocId] = useState<number | string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);
  const [pembayaranContext, setPembayaranContext] = useState<PpbjPembayaranContext | null>(null);
  const [isLoadingPembayaran, setIsLoadingPembayaran] = useState<boolean>(false);

  const fetchPembayaranContext = (signal?: AbortSignal) => {
    if (!id) return;
    setIsLoadingPembayaran(true);
    ppbjService
      .getPembayaranContext(id, signal)
      .then((data) => setPembayaranContext(data))
      .catch((err) => {
        if (err instanceof Error && err.name !== 'CanceledError') {
          // ignore background fetch error
        }
      })
      .finally(() => setIsLoadingPembayaran(false));
  };

  const fetchDetail = (signal?: AbortSignal) => {
    if (!id) return;
    setIsLoading(true);
    ppbjService
      .getPengadaanDetail(id, signal)
      .then((data) => {
        setPengadaan(data);
      })
      .catch((err) => {
        if (err instanceof Error && err.name !== 'CanceledError') {
          setFlash({ error: 'Gagal memuat detail pengadaan.' });
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchDetail(controller.signal);
    fetchPembayaranContext(controller.signal);
    return () => controller.abort();
  }, [id]);

  const handleSubmitEditKlasifikasi = async (payload: PpbjUpdateKlasifikasiPayload) => {
    if (!id) return;
    setIsSubmittingKlasifikasi(true);
    try {
      const res = await ppbjService.updateKlasifikasiPengadaan(id, payload);
      setFlash({ success: res.message || 'Klasifikasi dan dokumen pengadaan berhasil diperbarui.' });
      setIsEditKlasifikasiOpen(false);
      fetchDetail();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Gagal memperbarui klasifikasi pengadaan.';
      setFlash({ error: msg });
      throw err;
    } finally {
      setIsSubmittingKlasifikasi(false);
    }
  };

  const handleSubmitKontrak = async (payload: PpbjSimpanKontrakPayload) => {
    if (!id) return;
    setIsSubmittingKontrak(true);
    try {
      const isUpdate = Boolean(pengadaan?.kontrak);
      const res = await ppbjService.saveKontrakPengadaan(id, payload, isUpdate);
      setFlash({ success: res.message || 'Data kontrak dan vendor berhasil disimpan.' });
      fetchDetail();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Gagal menyimpan data kontrak dan vendor.';
      setFlash({ error: msg });
    } finally {
      setIsSubmittingKontrak(false);
    }
  };

  const handleViewDokumen = async (doc: DokumenItem) => {
    if (!doc.download_url) return;
    setIsLoadingPreview(true);
    setPreviewDocId(doc.id);
    try {
      const { blob } = await ppbjService.fetchDokumenBlob(doc.download_url, 'inline');
      const url = URL.createObjectURL(blob);
      setPreviewBlobUrl(url);
    } catch {
      setFlash({ error: 'Gagal membuka pratinjau berkas dokumen.' });
      setPreviewDocId(null);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleDownloadDokumen = async (doc: DokumenItem) => {
    if (!doc.download_url) return;
    try {
      const { blob } = await ppbjService.fetchDokumenBlob(doc.download_url, 'attachment');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.nama_asli || 'dokumen.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      setFlash({ error: 'Gagal mengunduh berkas dokumen.' });
    }
  };

  const handleUploadTagihan = async (file: File, nominal?: number, catatan?: string) => {
    if (!id) return;
    try {
      const res = await ppbjService.uploadDokumenTagihan(id, file, nominal, catatan);
      setFlash({ success: res.message || 'Dokumen tagihan berhasil diunggah.' });
      fetchPembayaranContext();
      fetchDetail();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Gagal mengunggah dokumen tagihan.';
      setFlash({ error: msg });
      throw err;
    }
  };

  const handleUploadLegalitas = async (file: File) => {
    if (!id) return;
    try {
      const res = await ppbjService.uploadLegalitasVendor(id, file);
      setFlash({ success: res.message || 'Dokumen legalitas vendor berhasil diunggah.' });
      fetchPembayaranContext();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Gagal mengunggah dokumen legalitas vendor.';
      setFlash({ error: msg });
      throw err;
    }
  };

  const dokumenList: DokumenItem[] = (pengadaan?.dokumen_list || []).map((d) => ({
    id: d.id,
    nama_asli: d.nama_asli,
    tipe_dokumen: d.tipe_dokumen,
    ukuran_bytes: d.ukuran_bytes,
    mime_type: d.mime_type,
    download_url: d.download_url,
  }));

  return (
    <PpbjPengadaanShowTemplate
      pengadaan={pengadaan}
      dokumenList={dokumenList}
      isLoading={isLoading}
      flash={flash}
      isEditKlasifikasiOpen={isEditKlasifikasiOpen}
      isSubmittingKlasifikasi={isSubmittingKlasifikasi}
      isSubmittingKontrak={isSubmittingKontrak}
      onOpenEditKlasifikasi={() => setIsEditKlasifikasiOpen(true)}
      onCloseEditKlasifikasi={() => setIsEditKlasifikasiOpen(false)}
      onSubmitEditKlasifikasi={handleSubmitEditKlasifikasi}
      onSubmitKontrak={handleSubmitKontrak}
      onViewDokumen={handleViewDokumen}
      onDownloadDokumen={handleDownloadDokumen}
      previewBlobUrl={previewBlobUrl}
      previewDocId={previewDocId}
      isLoadingPreview={isLoadingPreview}
      onClosePreview={() => {
        if (previewBlobUrl) {
          URL.revokeObjectURL(previewBlobUrl);
        }
        setPreviewBlobUrl(null);
        setPreviewDocId(null);
      }}
      pembayaranContext={pembayaranContext}
      isLoadingPembayaran={isLoadingPembayaran}
      onUploadTagihan={handleUploadTagihan}
      onUploadLegalitas={handleUploadLegalitas}
    />
  );
};

export default PpbjPengadaanShow;
