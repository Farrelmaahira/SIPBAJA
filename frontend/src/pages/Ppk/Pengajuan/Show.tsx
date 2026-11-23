import { useState, useEffect, type FC } from 'react';
import { useParams } from 'react-router-dom';
import ppkService from '../../../services/ppkService';
import type { NotificationItem } from '../../../types/notification';
import type { PpPengadaanDetailPayload } from '../../../types/pp';
import type { PpbjPembayaranContext } from '../../../types/ppbj';
import type { DokumenItem } from '../../../types/dokumen';
import PpPengajuanShowTemplate from '../../../components/templates/PP/PpPengajuanShowTemplate';
import { PPK_NAV_ITEMS } from '@/constants/ppkNav';

export interface PpkShowProps {
  detail?: PpPengadaanDetailPayload;
  recentNotifications?: NotificationItem[];
  unreadNotificationsCount?: number;
}

export const PpkPengajuanShow: FC<PpkShowProps> = ({
  detail: initialDetail,
  recentNotifications: initialNotifs = [],
  unreadNotificationsCount: initialUnreadCount = 0,
}) => {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<PpPengadaanDetailPayload>(initialDetail || {});
  const [recentNotifications, setRecentNotifications] = useState<NotificationItem[]>(initialNotifs);
  const [unreadNotificationsCount, setUnreadNotificationsCount] =
    useState<number>(initialUnreadCount);
  const [galleryOpen, setGalleryOpen] = useState<boolean>(false);

  const [pembayaranContext, setPembayaranContext] = useState<PpbjPembayaranContext | null>(null);
  const [isLoadingPembayaran, setIsLoadingPembayaran] = useState<boolean>(false);
  const [flashSuccess, setFlashSuccess] = useState<string | null>(null);

  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewDocId, setPreviewDocId] = useState<number | string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);

  const fetchPembayaranContext = (signal?: AbortSignal) => {
    if (!id) return;
    setIsLoadingPembayaran(true);
    ppkService
      .getPembayaranReview(id, signal)
      .then((data) => setPembayaranContext(data))
      .catch((err) => {
        if (err?.name !== 'CanceledError') {
          // ignore background error
        }
      })
      .finally(() => setIsLoadingPembayaran(false));
  };

  const fetchDetail = (signal?: AbortSignal) => {
    if (!id) return;
    ppkService
      .getPengajuanShow(id, signal)
      .then((res) => {
        const payload = res.detail || res.data || {};
        setDetail(payload);
        if (res.recentNotifications) setRecentNotifications(res.recentNotifications);
        if (res.unreadNotificationsCount !== undefined) {
          setUnreadNotificationsCount(res.unreadNotificationsCount);
        }
      })
      .catch((err: unknown) => {
        console.error('Failed to fetch PPK pengajuan show:', err);
      });
  };

  useEffect(() => {
    if (initialDetail) {
      setDetail(initialDetail);
      return;
    }
    if (!id) return;

    const controller = new AbortController();
    fetchDetail(controller.signal);
    fetchPembayaranContext(controller.signal);

    return () => {
      controller.abort();
    };
  }, [id, initialDetail]);

  const handleApprove = async (memo: File, catatan?: string) => {
    if (!id) return;
    const res = await ppkService.approvePembayaran(id, memo, catatan);
    setFlashSuccess(res.message || 'Persetujuan pembayaran berhasil dikirim.');
    fetchPembayaranContext();
    fetchDetail();
  };

  const handleReject = async (alasan: string) => {
    if (!id) return;
    const res = await ppkService.rejectPembayaran(id, alasan);
    setFlashSuccess(res.message || 'Penolakan pembayaran berhasil dikirim.');
    fetchPembayaranContext();
    fetchDetail();
  };

  const handleViewDokumen = async (doc: DokumenItem) => {
    if (!doc.download_url) return;
    setIsLoadingPreview(true);
    setPreviewDocId(doc.id);
    try {
      const { blob } = await ppkService.fetchDokumenBlob(doc.download_url, 'inline');
      const url = URL.createObjectURL(blob);
      setPreviewBlobUrl(url);
    } catch {
      setPreviewDocId(null);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleDownloadDokumen = async (doc: DokumenItem) => {
    if (!doc.download_url) return;
    try {
      const { blob } = await ppkService.fetchDokumenBlob(doc.download_url, 'attachment');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.nama_asli || 'dokumen.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <PpPengajuanShowTemplate
      detail={detail}
      recentNotifications={recentNotifications}
      unreadNotificationsCount={unreadNotificationsCount}
      basePath="/ppk"
      roleInitials="PPK"
      roleTitle="PPK"
      roleSubtitle="Pejabat Pembuat Komitmen"
      navItems={PPK_NAV_ITEMS}
      galleryOpen={galleryOpen}
      onOpenGallery={() => setGalleryOpen(true)}
      onCloseGallery={() => setGalleryOpen(false)}
      pembayaranContext={pembayaranContext}
      isLoadingPembayaran={isLoadingPembayaran}
      onApprovePembayaran={handleApprove}
      onRejectPembayaran={handleReject}
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
      flashSuccess={flashSuccess}
    />
  );
};

export default PpkPengajuanShow;
