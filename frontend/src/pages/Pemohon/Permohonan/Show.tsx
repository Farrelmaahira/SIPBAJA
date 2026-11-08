import { useState, useEffect, useCallback, type FC } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import pemohonService from '../../../services/pemohonService';
import PemohonPermohonanShowTemplate from '../../../components/templates/PemohonPermohonanShowTemplate';
import type { PermohonanDetailInfo } from '../../../types/permohonan';

export const PermohonanShow: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [permohonan, setPermohonan] = useState<PermohonanDetailInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [flashMessage, setFlashMessage] = useState<string | null>(
    (location.state as any)?.flashMessage || null
  );

  const fetchDetail = useCallback(async (signal?: AbortSignal) => {
    if (!id) return;

    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');

    try {
      const res = await pemohonService.getPermohonanDetail(id, signal);
      setPermohonan(res.permohonan);
    } catch (err: unknown) {
      if (signal?.aborted) return;
      setHasError(true);
      const msg =
        err instanceof Error
          ? err.message
          : 'Gagal memuat detail permohonan. Pastikan data ada dan Anda memiliki hak akses.';
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

  const handleRevisi = () => {
    if (!permohonan?.id) return;
    navigate(`/pemohon/permohonan/${permohonan.id}/edit`);
  };

  return (
    <PemohonPermohonanShowTemplate
      user={user}
      permohonan={permohonan}
      isLoading={isLoading}
      hasError={hasError}
      errorMessage={errorMessage}
      flashMessage={flashMessage}
      onCloseFlash={() => setFlashMessage(null)}
      onRetry={() => void fetchDetail()}
      onBack={() => navigate('/pemohon/permohonan')}
      onRevisi={handleRevisi}
    />
  );
};

export default PermohonanShow;
