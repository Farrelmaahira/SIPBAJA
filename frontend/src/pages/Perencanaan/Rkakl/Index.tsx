import { useState, useEffect, useCallback, useMemo, type FC, type FormEvent } from 'react';
import { perencanaanService } from '../../../services/perencanaanService';
import PerencanaanRkaklTemplate from '../../../components/templates/PerencanaanRkaklTemplate';
import type { DokumenItem } from '../../../types/dokumen';
import type { RkaklActiveDoc, RkaklHistoryItem } from '../../../types/perencanaan';

export const PerencanaanRkaklIndex: FC = () => {
  const [activeDoc, setActiveDoc] = useState<RkaklActiveDoc | null>(null);
  const [historyList, setHistoryList] = useState<RkaklHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [replaceModalOpen, setReplaceModalOpen] = useState(false);
  const [selectedFileObj, setSelectedFileObj] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [processing, setProcessing] = useState(false);

  // Document action & preview states
  const [isViewingDocId, setIsViewingDocId] = useState<number | string | null>(null);
  const [isDownloadingDocId, setIsDownloadingDocId] = useState<number | string | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewDocId, setPreviewDocId] = useState<number | string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);

  const fetchRkakl = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await perencanaanService.getRkaklData();
      const rkaklData = (res.rkakl || res.data || res) as {
        active_doc?: RkaklActiveDoc | null;
        history?: RkaklHistoryItem[];
      };
      setActiveDoc(rkaklData.active_doc || null);
      setHistoryList(rkaklData.history || []);
    } catch (err) {
      console.error('Failed to fetch RKAKL data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRkakl();
  }, [fetchRkakl]);

  const activeFilename =
    activeDoc?.nama_asli ||
    (activeDoc?.path ? activeDoc.path.split('/').pop() : '') ||
    'RKAKL_TA_2026_Satker_Politeknik_v3.pdf';

  const activeVersion = activeDoc?.versi ?? 3;

  const activeDokumenList: DokumenItem[] = useMemo(() => {
    if (!activeDoc) {
      return [
        {
          id: 'rkakl-active',
          nama_asli: activeFilename,
          tipe_dokumen: 'rkakl',
          versi: Number(activeVersion),
          download_url: '/api/v1/perencanaan/rkakl/dokumen',
        },
      ];
    }
    return [
      {
        id: (activeDoc.id as number | string) || 'rkakl-active',
        nama_asli: activeFilename,
        tipe_dokumen: 'rkakl',
        versi: activeDoc.versi ?? Number(activeVersion),
        ukuran_bytes: (activeDoc.ukuran_bytes as number) || 4800000,
        download_url:
          (activeDoc.download_url as string) ||
          (activeDoc.id
            ? `/api/v1/perencanaan/rkakl/dokumen/${activeDoc.id}`
            : '/api/v1/perencanaan/rkakl/dokumen'),
      },
    ];
  }, [activeDoc, activeFilename, activeVersion]);

  // Preload preview blob for the active RKAKL document
  useEffect(() => {
    const doc = activeDokumenList[0];
    if (!doc?.download_url) return;

    let isMounted = true;
    setIsLoadingPreview(true);
    setPreviewDocId(doc.id);

    perencanaanService
      .fetchDokumenBlob(doc.download_url, 'inline')
      .then(({ blob }) => {
        if (!isMounted) return;
        const blobUrl = URL.createObjectURL(blob);
        setPreviewBlobUrl(blobUrl);
      })
      .catch((err) => {
        console.error('Gagal memuat pratinjau inline RKAKL:', err);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingPreview(false);
        }
      });

    return () => {
      isMounted = false;
      if (previewBlobUrl) {
        URL.revokeObjectURL(previewBlobUrl);
      }
    };
  }, [activeDokumenList]);

  const handleViewDokumen = async (doc: DokumenItem) => {
    if (!doc.download_url) return;
    setIsViewingDocId(doc.id);
    try {
      const { blob } = await perencanaanService.fetchDokumenBlob(doc.download_url, 'inline');
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (err) {
      console.error('Gagal membuka dokumen RKAKL:', err);
    } finally {
      setIsViewingDocId(null);
    }
  };

  const handleDownloadDokumen = async (doc: DokumenItem) => {
    if (!doc.download_url) return;
    setIsDownloadingDocId(doc.id);
    try {
      const { blob } = await perencanaanService.fetchDokumenBlob(doc.download_url, 'attachment');
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = doc.nama_asli || 'Dokumen_RKAKL.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (err) {
      console.error('Gagal mengunduh dokumen RKAKL:', err);
    } finally {
      setIsDownloadingDocId(null);
    }
  };

  const handleSelectHistoryDoc = async (doc: RkaklHistoryItem) => {
    const docUrl =
      (doc.download_url as string) || (doc.id ? `/api/v1/perencanaan/rkakl/dokumen/${doc.id}` : null);
    if (!docUrl) return;

    try {
      const { blob } = await perencanaanService.fetchDokumenBlob(docUrl, 'inline');
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (err) {
      console.error('Gagal membuka arsip dokumen RKAKL:', err);
    }
  };

  const handleReplaceSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const fileToUpload = selectedFileObj || selectedFileName;
    if (!fileToUpload) return;

    setProcessing(true);
    try {
      await perencanaanService.replaceRkakl(fileToUpload);
      setReplaceModalOpen(false);
      setSelectedFileObj(null);
      setSelectedFileName('');
      await fetchRkakl();
    } catch (err) {
      console.error('Failed to update RKAKL:', err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <PerencanaanRkaklTemplate
      activeFilename={activeFilename}
      activeVersion={activeVersion}
      activeDokumenList={activeDokumenList}
      historyList={historyList}
      isLoading={isLoading}
      replaceModalOpen={replaceModalOpen}
      selectedFile={selectedFileName}
      processing={processing}
      onOpenReplaceModal={() => {
        setSelectedFileObj(null);
        setSelectedFileName('');
        setReplaceModalOpen(true);
      }}
      onCloseReplaceModal={() => setReplaceModalOpen(false)}
      onFileChange={(file) => {
        setSelectedFileObj(file);
        setSelectedFileName(file.name);
      }}
      onReplaceSubmit={handleReplaceSubmit}
      onSelectHistoryDoc={handleSelectHistoryDoc}
      onViewDokumen={handleViewDokumen}
      onDownloadDokumen={handleDownloadDokumen}
      isViewingDocId={isViewingDocId}
      isDownloadingDocId={isDownloadingDocId}
      previewBlobUrl={previewBlobUrl}
      previewDocId={previewDocId}
      isLoadingPreview={isLoadingPreview}
    />
  );
};

export default PerencanaanRkaklIndex;
