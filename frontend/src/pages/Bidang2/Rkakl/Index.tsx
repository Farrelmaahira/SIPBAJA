import { useEffect, useState, type FC } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import bidang2Service from '../../../services/bidang2Service';
import Bidang2RkaklTemplate from '../../../components/templates/Bidang2RkaklTemplate';
import type { Bidang2RkaklActiveDoc } from '../../../types/bidang2';

export const RkaklIndex: FC = () => {
  const { user } = useAuth();
  const [activeDoc, setActiveDoc] = useState<Bidang2RkaklActiveDoc | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Document live preview states
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    setIsLoading(true);
    setHasError(false);

    bidang2Service
      .getRkakl(controller.signal)
      .then((res) => {
        if (!isMounted) return;
        if (res.rkakl?.active_doc) {
          setActiveDoc(res.rkakl.active_doc);
        }
      })
      .catch((err: unknown) => {
        if (!isMounted || controller.signal.aborted) return;
        setHasError(true);
        console.error('Failed to fetch Bidang 2 RKAKL:', err);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [refreshTrigger]);

  // Preload preview blob for the active RKAKL document
  useEffect(() => {
    if (!activeDoc) {
      setPreviewBlobUrl(null);
      setIsLoadingPreview(false);
      return;
    }

    const docUrl =
      activeDoc.view_url ||
      bidang2Service.downloadRkaklUrl('inline', activeDoc.id);

    let isMounted = true;
    let currentBlobUrl: string | null = null;
    const controller = new AbortController();

    setIsLoadingPreview(true);

    bidang2Service
      .fetchDokumenBlob(docUrl, 'inline', controller.signal)
      .then(({ blob }) => {
        if (!isMounted) return;
        currentBlobUrl = URL.createObjectURL(blob);
        setPreviewBlobUrl(currentBlobUrl);
      })
      .catch((err: unknown) => {
        if (!isMounted || controller.signal.aborted) return;
        console.error('Gagal memuat pratinjau inline RKAKL:', err);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingPreview(false);
        }
      });

    return () => {
      isMounted = false;
      controller.abort();
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
      }
    };
  }, [activeDoc?.id, activeDoc?.view_url]);

  const handleView = () => {
    if (previewBlobUrl) {
      window.open(previewBlobUrl, '_blank');
      return;
    }
    const url =
      activeDoc?.view_url ||
      bidang2Service.downloadRkaklUrl('inline', activeDoc?.id);
    window.open(url, '_blank');
  };

  const handleDownload = async () => {
    const downloadUrl =
      activeDoc?.download_url ||
      bidang2Service.downloadRkaklUrl('attachment', activeDoc?.id);

    try {
      const { blob } = await bidang2Service.fetchDokumenBlob(downloadUrl, 'attachment');
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = activeDoc?.nama_asli || 'Dokumen_RKAKL.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (err) {
      console.error('Gagal mengunduh dokumen RKAKL:', err);
      window.open(downloadUrl, '_blank');
    }
  };

  return (
    <Bidang2RkaklTemplate
      user={user}
      document={activeDoc}
      isLoading={isLoading}
      hasError={hasError}
      previewBlobUrl={previewBlobUrl}
      isLoadingPreview={isLoadingPreview}
      onView={handleView}
      onDownload={handleDownload}
      onRetry={() => setRefreshTrigger((prev) => prev + 1)}
    />
  );
};

export default RkaklIndex;
