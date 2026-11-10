import { useState, useEffect, useCallback, useMemo, type FC, type FormEvent } from 'react';
import { perencanaanService } from '../../../services/perencanaanService';
import PerencanaanRkaklTemplate from '../../../components/templates/PerencanaanRkaklTemplate';
import { validateUploadFile, extractServerErrors } from '../../../utils/fileValidation';
import type { DokumenItem } from '../../../types/dokumen';
import type { RkaklActiveDoc, RkaklHistoryItem } from '../../../types/perencanaan';

export const PerencanaanRkaklIndex: FC = () => {
  const [activeDoc, setActiveDoc] = useState<RkaklActiveDoc | null>(null);
  const [historyList, setHistoryList] = useState<RkaklHistoryItem[]>([]);
  const [selectedTahun, setSelectedTahun] = useState<string>('');
  const [tahunAnggaran, setTahunAnggaran] = useState<number>(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  const [flashSuccess, setFlashSuccess] = useState('');
  const [flashError, setFlashError] = useState('');

  const [replaceModalOpen, setReplaceModalOpen] = useState(false);
  const [selectedFileObj, setSelectedFileObj] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [fileError, setFileError] = useState('');
  const [isFileValid, setIsFileValid] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState<number | string | null>(null);

  // Document action & preview states
  const [isViewingDocId, setIsViewingDocId] = useState<number | string | null>(null);
  const [isDownloadingDocId, setIsDownloadingDocId] = useState<number | string | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewDocId, setPreviewDocId] = useState<number | string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);

  const fetchRkakl = useCallback(async (tahunFilter = selectedTahun) => {
    setIsLoading(true);
    setFlashError('');
    try {
      const res = await perencanaanService.getRkaklData(undefined, tahunFilter || undefined);
      const rkaklData = (res.rkakl || res.data || res) as {
        active_doc?: RkaklActiveDoc | null;
        history?: RkaklHistoryItem[];
      };
      setActiveDoc(rkaklData.active_doc || null);
      setHistoryList(rkaklData.history || []);
    } catch (err) {
      console.error('Failed to fetch RKAKL data:', err);
      setFlashError('Gagal memuat data dokumen RKAKL.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedTahun]);

  useEffect(() => {
    void fetchRkakl(selectedTahun);
  }, [selectedTahun, fetchRkakl]);

  const activeFilename =
    activeDoc?.nama_asli ||
    (activeDoc?.path ? activeDoc.path.split('/').pop() : '') ||
    '';

  const activeVersion = activeDoc?.versi ?? '';

  const activeDokumenList: DokumenItem[] = useMemo(() => {
    if (!activeDoc) {
      return [];
    }
    return [
      {
        id: activeDoc.id || 'rkakl-active',
        nama_asli: activeFilename || 'Dokumen_RKAKL.pdf',
        tipe_dokumen: 'rkakl',
        versi: activeDoc.versi,
        ukuran_bytes: activeDoc.ukuran_bytes,
        download_url:
          activeDoc.download_url ||
          (activeDoc.id
            ? `/api/v1/perencanaan/rkakl/dokumen/${activeDoc.id}`
            : '/api/v1/perencanaan/rkakl/dokumen'),
      },
    ];
  }, [activeDoc, activeFilename]);

  // Preload preview blob for the active RKAKL document
  useEffect(() => {
    const doc = activeDokumenList[0];
    if (!doc?.download_url) {
      setPreviewBlobUrl(null);
      setPreviewDocId(null);
      setIsLoadingPreview(false);
      return;
    }

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
      doc.download_url || (doc.id ? `/api/v1/perencanaan/rkakl/dokumen/${doc.id}` : null);
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

  const handleFileChange = (file: File) => {
    setSelectedFileObj(file);
    setSelectedFileName(file.name);
    const validation = validateUploadFile(file);
    if (!validation.valid) {
      setFileError(validation.errorMessage || 'Berkas tidak valid.');
      setIsFileValid(false);
    } else {
      setFileError('');
      setIsFileValid(true);
    }
  };

  const handleReplaceSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFileObj) return;

    const validation = validateUploadFile(selectedFileObj);
    if (!validation.valid) {
      setFileError(validation.errorMessage || 'Berkas tidak valid.');
      setIsFileValid(false);
      return;
    }

    setProcessing(true);
    setFileError('');
    setFlashSuccess('');
    setFlashError('');
    try {
      if (activeDoc?.id) {
        const res = await perencanaanService.gantiRkaklById(activeDoc.id, selectedFileObj);
        setFlashSuccess(res.message || 'Dokumen RKAKL berhasil diganti.');
      } else {
        const res = await perencanaanService.replaceRkakl(selectedFileObj, tahunAnggaran);
        setFlashSuccess(res.message || 'Dokumen RKAKL berhasil diunggah.');
      }
      setReplaceModalOpen(false);
      setSelectedFileObj(null);
      setSelectedFileName('');
      setIsFileValid(false);
      await fetchRkakl(selectedTahun);
    } catch (err: unknown) {
      const serverErr = extractServerErrors(err);
      setFileError(serverErr.fieldErrors.berkas || serverErr.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteDoc = async (docId: number | string) => {
    setDeletingDocId(docId);
    setFlashSuccess('');
    setFlashError('');
    try {
      const res = await perencanaanService.deleteRkakl(docId);
      setFlashSuccess(res.message || 'Dokumen RKAKL berhasil dihapus.');
      await fetchRkakl(selectedTahun);
    } catch (err: unknown) {
      const serverErr = extractServerErrors(err);
      setFlashError(serverErr.message || 'Gagal menghapus dokumen RKAKL.');
    } finally {
      setDeletingDocId(null);
    }
  };

  return (
    <PerencanaanRkaklTemplate
      activeFilename={activeFilename}
      activeVersion={activeVersion}
      activeDocId={activeDoc?.id ?? null}
      activeDokumenList={activeDokumenList}
      historyList={historyList}
      selectedTahun={selectedTahun}
      tahunAnggaran={tahunAnggaran}
      isLoading={isLoading}
      replaceModalOpen={replaceModalOpen}
      selectedFile={selectedFileName}
      fileError={fileError}
      isFileValid={isFileValid}
      processing={processing}
      deletingDocId={deletingDocId}
      flashSuccess={flashSuccess}
      flashError={flashError}
      onTahunChange={setSelectedTahun}
      onTahunAnggaranChange={setTahunAnggaran}
      onOpenReplaceModal={() => {
        setSelectedFileObj(null);
        setSelectedFileName('');
        setFileError('');
        setIsFileValid(false);
        setReplaceModalOpen(true);
      }}
      onCloseReplaceModal={() => setReplaceModalOpen(false)}
      onFileChange={handleFileChange}
      onReplaceSubmit={handleReplaceSubmit}
      onSelectHistoryDoc={handleSelectHistoryDoc}
      onDeleteDoc={handleDeleteDoc}
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
