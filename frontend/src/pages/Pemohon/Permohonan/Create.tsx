import { useState, type FC, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import PermohonanCreateTemplate from '../../../components/templates/PermohonanCreateTemplate';
import type {
  PermohonanFormData,
  PermohonanFormErrors,
} from '../../../components/organisms/PermohonanFormCard';

export const PermohonanCreate: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setDataState] = useState<PermohonanFormData>({
    judul: '',
    estimasi_anggaran: '',
    file_dokumen: null,
  });

  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<PermohonanFormErrors>({});

  const setData = (field: keyof PermohonanFormData, value: any) => {
    setDataState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});

    const formData = new FormData();
    formData.append('judul', data.judul);
    formData.append('estimasi_anggaran', String(data.estimasi_anggaran || ''));
    if (data.file_dokumen) {
      formData.append('file_dokumen', data.file_dokumen);
    }

    try {
      await api.post('/v1/pemohon/permohonan', formData);
      navigate('/pemohon/permohonan');
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.errors) {
        const valErrors: PermohonanFormErrors = {};
        Object.entries(err.response.data.errors).forEach(([field, msg]) => {
          (valErrors as any)[field] = Array.isArray(msg) ? msg[0] : String(msg);
        });
        setErrors(valErrors);
      } else {
        setErrors({ judul: 'Gagal mengirim permohonan. Periksa kembali form isian.' });
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleKembali = () => {
    navigate('/pemohon/dashboard');
  };

  return (
    <PermohonanCreateTemplate
      user={user}
      data={data}
      setData={setData}
      errors={errors}
      processing={processing}
      onSubmit={handleSubmit}
      onKembali={handleKembali}
    />
  );
};

export default PermohonanCreate;
