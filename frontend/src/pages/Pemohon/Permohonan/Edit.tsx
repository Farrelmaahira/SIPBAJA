import { useState, useEffect, useCallback, type FC, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import pemohonService from '../../../services/pemohonService';
import PemohonPermohonanEditTemplate from '../../../components/templates/PemohonPermohonanEditTemplate';
import type {
  PermohonanDetailInfo,
  PermohonanRevisiFormData,
  PermohonanRevisiFormErrors,
} from '../../../types/permohonan';

export const PermohonPermohonanEdit: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [permohonan, setPermohonan] = useState<PermohonanDetailInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState<PermohonanRevisiFormData>({
    judul: '',
    estimasi_anggaran: '',
    ringkasan_tujuan: '',
    file_dokumen: null,
  });

  const [formErrors, setFormErrors] = useState<PermohonanRevisiFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDetail = useCallback(async (signal?: AbortSignal) => {
    if (!id) return;

    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');

    try {
      const res = await pemohonService.getPermohonanDetail(id, signal);
      const data = res.permohonan;
      setPermohonan(data);

      setFormData({
        judul: data.judul || '',
        estimasi_anggaran: data.estimasi_anggaran ? String(data.estimasi_anggaran) : '',
        ringkasan_tujuan: data.ringkasan_tujuan || '',
        file_dokumen: null,
      });
    } catch (err: unknown) {
      if (signal?.aborted) return;
      setHasError(true);
      const msg =
        err instanceof Error
          ? err.message
          : 'Gagal memuat data permohonan. Pastikan data tersedia dan Anda berwenang.';
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

  const handleFieldChange = (field: keyof PermohonanRevisiFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof PermohonanRevisiFormErrors]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field as keyof PermohonanRevisiFormErrors];
        return next;
      });
    }
  };

  const handleViewCurrentDokumen = () => {
    if (!id) return;
    const url = pemohonService.getDokumenDownloadUrl(id);
    window.open(`${url}?disposition=inline`, '_blank');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const errors: PermohonanRevisiFormErrors = {};
    if (!formData.judul || !formData.judul.trim()) {
      errors.judul = 'Judul pengadaan wajib diisi.';
    }

    const anggaranNum = Number(formData.estimasi_anggaran);
    if (!formData.estimasi_anggaran || isNaN(anggaranNum) || anggaranNum < 1) {
      errors.estimasi_anggaran = 'Estimasi anggaran minimal Rp 1.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      const payload = new FormData();
      payload.append('judul', formData.judul.trim());
      payload.append('estimasi_anggaran', String(formData.estimasi_anggaran));
      if (formData.ringkasan_tujuan && formData.ringkasan_tujuan.trim()) {
        payload.append('ringkasan_tujuan', formData.ringkasan_tujuan.trim());
      }
      if (formData.file_dokumen) {
        payload.append('file_dokumen', formData.file_dokumen);
      }

      await pemohonService.revisiPermohonan(id, payload);

      navigate(`/pemohon/permohonan/${id}`, {
        state: { flashMessage: 'Permohonan berhasil diperbaiki dan diajukan ulang.' },
      });
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 422 && err.response?.data?.errors) {
        const backendErrors: PermohonanRevisiFormErrors = {};
        Object.entries(err.response.data.errors).forEach(([k, v]) => {
          if (Array.isArray(v) && v.length > 0) {
            backendErrors[k as keyof PermohonanRevisiFormErrors] = String(v[0]);
          }
        });
        setFormErrors(backendErrors);
      } else {
        const msg =
          axios.isAxiosError(err) && err.response?.data?.message
            ? String(err.response.data.message)
            : 'Terjadi kendala saat mengajukan ulang permohonan. Coba beberapa saat lagi.';
        setFormErrors({ general: msg });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PemohonPermohonanEditTemplate
      user={user}
      permohonan={permohonan}
      formData={formData}
      formErrors={formErrors}
      isSubmitting={isSubmitting}
      isLoading={isLoading}
      hasError={hasError}
      errorMessage={errorMessage}
      onFieldChange={handleFieldChange}
      onSubmit={handleSubmit}
      onBack={() => navigate(`/pemohon/permohonan/${id}`)}
      onRetry={() => void fetchDetail()}
      onViewCurrentDokumen={handleViewCurrentDokumen}
    />
  );
};

export default PermohonPermohonanEdit;
