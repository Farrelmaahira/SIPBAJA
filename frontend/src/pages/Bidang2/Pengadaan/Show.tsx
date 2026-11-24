import { useState, useEffect, useCallback, type FC } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { bidang2Service } from '../../../services/bidang2Service';
import Bidang2PengadaanShowTemplate from '../../../components/templates/Bidang2/Bidang2PengadaanShowTemplate';
import type { PpbjPembayaranContext } from '../../../types/ppbj';
import type { DokumenItem } from '../../../types/dokumen';

export const Bidang2PengadaanShow: FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [detailData, setDetailData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [pembayaranContext, setPembayaranContext] = useState<PpbjPembayaranContext | null>(null);
  const [isLoadingPembayaran, setIsLoadingPembayaran] = useState<boolean>(false);

  const [isViewingDocId, setIsViewingDocId] = useState<number | string | null>(null);
  const [isDownloadingDocId, setIsDownloadingDocId] = useState<number | string | null>(null);

  const fetchPembayaranContext = useCallback((signal?: AbortSignal) => {
    if (!id) return;
    setIsLoadingPembayaran(true);
    bidang2Service
      .getPembayaranReview(id, signal)
      .then((data) => setPembayaranContext(data))
      .catch((err) => {
        if (err?.name !== 'CanceledError') {
          // ignore context error if non-existent
        }
      })
      .finally(() => setIsLoadingPembayaran(false));
  }, [id]);

  const fetchDetail = useCallback((signal?: AbortSignal) => {
    if (!id) return;
    setIsLoading(true);

    bidang2Service
      .getPengadaanDetail(id, signal)
      .then((data) => {
        setDetailData(data);
      })
      .catch((err) => {
        if (err?.name !== 'CanceledError') {
          setErrorMessage('Gagal memuat detail pengadaan.');
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    fetchDetail(controller.signal);
    fetchPembayaranContext(controller.signal);
    return () => controller.abort();
  }, [id, fetchDetail, fetchPembayaranContext]);

  const handleApprove = async (memo: File, catatan?: string) => {
    if (!id) return;
    const res = await bidang2Service.approvePembayaran(id, memo, catatan);
    setSuccessMessage(res.message || 'Persetujuan pembayaran berhasil dikirim.');
    fetchPembayaranContext();
    fetchDetail();
  };

  const handleReject = async (alasan: string) => {
    if (!id) return;
    const res = await bidang2Service.rejectPembayaran(id, alasan);
    setSuccessMessage(res.message || 'Penolakan pembayaran berhasil dikirim.');
    fetchPembayaranContext();
    fetchDetail();
  };

  const handleViewDokumen = async (doc: DokumenItem) => {
    if (!doc.download_url) return;
    setIsViewingDocId(doc.id);
    try {
      const { blob } = await bidang2Service.fetchDokumenBlob(doc.download_url, 'inline');
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch {
      setErrorMessage('Gagal membuka dokumen di tab baru.');
    } finally {
      setIsViewingDocId(null);
    }
  };

  const handleDownloadDokumen = async (doc: DokumenItem) => {
    if (!doc.download_url) return;
    setIsDownloadingDocId(doc.id);
    try {
      const { blob } = await bidang2Service.fetchDokumenBlob(doc.download_url, 'attachment');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.nama_asli || 'dokumen.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setErrorMessage('Gagal mengunduh dokumen.');
    } finally {
      setIsDownloadingDocId(null);
    }
  };

  return (
    <Bidang2PengadaanShowTemplate
      user={user}
      pengadaanId={id}
      detailData={detailData}
      pembayaranContext={pembayaranContext}
      isLoading={isLoading}
      isLoadingPembayaran={isLoadingPembayaran}
      errorMessage={errorMessage}
      successMessage={successMessage}
      onCloseSuccess={() => setSuccessMessage(null)}
      onCloseError={() => setErrorMessage(null)}
      isViewingDocId={isViewingDocId}
      isDownloadingDocId={isDownloadingDocId}
      onApprovePembayaran={handleApprove}
      onRejectPembayaran={handleReject}
      onViewDokumen={handleViewDokumen}
      onDownloadDokumen={handleDownloadDokumen}
    />
  );
};

export default Bidang2PengadaanShow;
