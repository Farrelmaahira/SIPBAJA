import { useState, useEffect, useCallback, type FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import bidang2Service from '../../../services/bidang2Service';
import Bidang2PengajuanShowTemplate from '../../../components/templates/Bidang2PengajuanShowTemplate';
import type { Bidang2DetailPengajuan } from '../../../types/bidang2';

export const Bidang2PengajuanShow: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [permohonan, setPermohonan] = useState<Bidang2DetailPengajuan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [flashMessage, setFlashMessage] = useState<string | null>(null);

  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(false);
  const [pdfLoadFailed, setPdfLoadFailed] = useState<boolean>(false);

  const [isSetujuModalOpen, setIsSetujuModalOpen] = useState<boolean>(false);
  const [isTolakModalOpen, setIsTolakModalOpen] = useState<boolean>(false);

  const fetchDetail = useCallback(async (signal?: AbortSignal) => {
    if (!id) return;

    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');

    try {
      const res = await bidang2Service.getPengajuanDetail(id, signal);
      setPermohonan(res.permohonan);
    } catch (err: unknown) {
      if (signal?.aborted) return;
      setHasError(true);
      const msg =
        err instanceof Error
          ? err.message
          : 'Gagal memuat detail pengajuan. Pastikan data ada dan Anda memiliki hak akses.';
      setErrorMessage(msg);
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {
    const controller = new AbortController();
    void fetchDetail(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchDetail]);

  // Muat berkas fisik PDF dokumen yang diunggah oleh jurusan untuk live preview
  useEffect(() => {
    let localBlobUrl: string | null = null;
    const downloadUrl = permohonan?.dokumen?.download_url;

    if (!downloadUrl) {
      setPdfBlobUrl(null);
      setIsLoadingPdf(false);
      return;
    }

    const controller = new AbortController();
    setIsLoadingPdf(true);
    setPdfLoadFailed(false);

    bidang2Service
      .getDokumenBlob(downloadUrl, controller.signal)
      .then((blob) => {
        localBlobUrl = URL.createObjectURL(blob);
        setPdfBlobUrl(localBlobUrl);
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          console.warn('Gagal memuat pratinjau dokumen PDF:', err);
          setPdfLoadFailed(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingPdf(false);
        }
      });

    return () => {
      controller.abort();
      if (localBlobUrl) {
        URL.revokeObjectURL(localBlobUrl);
      }
    };
  }, [permohonan?.dokumen?.download_url]);

  const handleOpenRkakl = () => {
    navigate('/bidang-2/rkakl');
  };

  const handleSetujuSubmit = async (fileMemo: File) => {
    if (!id) return;

    const payload = new FormData();
    payload.append('file_memo', fileMemo);

    await bidang2Service.approvePengajuan(id, payload);
    setFlashMessage('Permohonan berhasil disetujui dan memo persetujuan telah tersimpan.');
    await fetchDetail();
  };

  const handleTolakSubmit = async (alasan: string) => {
    if (!id) return;

    await bidang2Service.rejectPengajuan(id, alasan);
    setFlashMessage('Permohonan berhasil ditolak dan catatan telah diteruskan ke pemohon serta Perencanaan.');
    await fetchDetail();
  };

  return (
    <Bidang2PengajuanShowTemplate
      user={user}
      permohonan={permohonan}
      isLoading={isLoading}
      hasError={hasError}
      errorMessage={errorMessage}
      flashMessage={flashMessage}
      onCloseFlash={() => setFlashMessage(null)}
      pdfBlobUrl={pdfBlobUrl}
      isLoadingPdf={isLoadingPdf}
      pdfLoadFailed={pdfLoadFailed}
      isSetujuModalOpen={isSetujuModalOpen}
      onToggleSetujuModal={setIsSetujuModalOpen}
      isTolakModalOpen={isTolakModalOpen}
      onToggleTolakModal={setIsTolakModalOpen}
      onSetujuSubmit={handleSetujuSubmit}
      onTolakSubmit={handleTolakSubmit}
      onOpenRkakl={handleOpenRkakl}
      onBack={() => navigate('/bidang-2/pengajuan')}
      onRetry={() => void fetchDetail()}
    />
  );
};

export default Bidang2PengajuanShow;
