import { useState, useEffect, useCallback, type FC, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  ArrowLeft,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import api from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import DashboardShellTemplate from '../../../components/templates/DashboardShellTemplate';
import HeroBanner from '../../../components/organisms/HeroBanner';
import StatusPill from '../../../components/atoms/StatusPill';
import CatatanPenolakanCard from '../../../components/molecules/CatatanPenolakanCard';
import PermohonanEditFormCard from '../../../components/organisms/PermohonanEditFormCard';
import AlurPermohonanCard from '../../../components/organisms/AlurPermohonanCard';
import PanduanPengajuanCard from '../../../components/organisms/PanduanPengajuanCard';
import type {
  PermohonanDetailInfo,
  PermohonanRevisiFormData,
  PermohonanRevisiFormErrors,
  PermohonanDokumenDetail,
} from '../../../types/permohonan';

const NAV_ITEMS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/pemohon/dashboard',
  },
  {
    key: 'permohonan',
    label: 'List Permohonan',
    icon: ClipboardList,
    href: '/pemohon/permohonan',
    badge: 4,
  },
];

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

  const fetchDetail = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');

    try {
      const res = await api.get<{ permohonan: PermohonanDetailInfo }>(
        `/v1/pemohon/permohonan/${id}`
      );
      const data = res.data.permohonan;
      setPermohonan(data);

      setFormData({
        judul: data.judul || '',
        estimasi_anggaran: data.estimasi_anggaran ? String(data.estimasi_anggaran) : '',
        ringkasan_tujuan: data.ringkasan_tujuan || '',
        file_dokumen: null,
      });
    } catch (err: any) {
      setHasError(true);
      const msg =
        err?.response?.data?.message ||
        'Gagal memuat data permohonan. Pastikan data tersedia dan Anda berwenang.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const sidebarProps = {
    navItems: NAV_ITEMS,
    activeRoute: 'permohonan',
    brandSubtitle: 'Pengadaan Barang & Jasa',
    sectionTitle: 'MENU',
  };

  const topbarProps = {
    user,
  };

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
    window.open(`/api/v1/pemohon/permohonan/${id}/dokumen?disposition=inline`, '_blank');
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

      await api.post(`/v1/pemohon/permohonan/${id}/revisi`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      navigate(`/pemohon/permohonan/${id}`, {
        state: { flashMessage: 'Permohonan berhasil diperbaiki dan diajukan ulang.' },
      });
    } catch (err: any) {
      if (err?.response?.status === 422 && err.response?.data?.errors) {
        const backendErrors: PermohonanRevisiFormErrors = {};
        Object.entries(err.response.data.errors).forEach(([k, v]) => {
          if (Array.isArray(v) && v.length > 0) {
            backendErrors[k as keyof PermohonanRevisiFormErrors] = v[0];
          }
        });
        setFormErrors(backendErrors);
      } else {
        const msg =
          err?.response?.data?.message ||
          'Terjadi kendala saat mengajukan ulang permohonan. Coba beberapa saat lagi.';
        setFormErrors({ general: msg });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentDokumen: PermohonanDokumenDetail | null = permohonan?.dokumen
    ? (permohonan.dokumen as unknown as PermohonanDokumenDetail)
    : null;

  return (
    <DashboardShellTemplate sidebarProps={sidebarProps} topbarProps={topbarProps}>
      {/* Breadcrumb Navigasi */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs font-bold text-[#8A9A95] tracking-wider uppercase mb-1"
      >
        <Link
          to="/pemohon/permohonan"
          className="hover:text-[#0E7C5A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] rounded px-1"
        >
          LIST PERMOHONAN
        </Link>
        <span aria-hidden="true">&gt;</span>
        <Link
          to={id ? `/pemohon/permohonan/${id}` : '/pemohon/permohonan'}
          className="hover:text-[#0E7C5A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] rounded px-1"
        >
          DETAIL PERMOHONAN
        </Link>
      </nav>

      {/* Loading Skeleton State */}
      {isLoading && (
        <div className="space-y-6 animate-pulse">
          <div className="h-40 bg-[#EEF5F2] rounded-[24px]" />
          <div className="h-28 bg-white rounded-[24px] border border-[#E4EBE8]" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-white rounded-[24px] border border-[#E4EBE8]" />
            <div className="h-96 bg-white rounded-[24px] border border-[#E4EBE8]" />
          </div>
        </div>
      )}

      {/* Error State */}
      {!isLoading && (hasError || !permohonan) && (
        <div className="bg-white rounded-[24px] border border-[#E4EBE8] shadow-sm p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FDECEC] text-[#B42318] flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-[#14201C]">
            Gagal Memuat Data Permohonan
          </h2>
          <p className="text-xs md:text-sm text-[#5F6F6A] max-w-md mx-auto">
            {errorMessage || 'Permohonan tidak ditemukan atau Anda tidak berwenang mengakses data ini.'}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => fetchDetail()}
              className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-xl bg-[#0E7C5A] text-white text-xs font-semibold hover:bg-[#0A5C43] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Coba Lagi</span>
            </button>
            <Link
              to="/pemohon/permohonan"
              className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-xl border border-[#E4EBE8] bg-white text-xs font-semibold text-[#14201C] hover:bg-[#F3F6F5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A]"
            >
              Kembali ke Daftar
            </Link>
          </div>
        </div>
      )}

      {/* Content State */}
      {!isLoading && permohonan && (
        <div className="space-y-6">
          {/* Hero Banner */}
          <HeroBanner
            eyebrow="EDIT PERMOHONAN"
            title={
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  Edit Permohonan Pengadaan
                </span>
                <StatusPill status={permohonan.status || 'ditolak'} />
              </div>
            }
            description={`Nomor ${permohonan.nomor_surat ?? '-'} · Perbaiki data sesuai catatan revisi pemeriksa.`}
            ctaLabel="Kembali"
            ctaIcon={ArrowLeft}
            ctaVariant="translucent"
            onCta={() => navigate(`/pemohon/permohonan/${id}`)}
          />

          {/* Alert General Error jika ada */}
          {formErrors.general && (
            <div className="p-4 rounded-2xl bg-[#FDECEC] border border-[#FDA29B] text-[#B42318] text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{formErrors.general}</p>
            </div>
          )}

          {/* Card Catatan dari Pemeriksa */}
          {permohonan.catatan_penolakan && (
            <CatatanPenolakanCard catatan={permohonan.catatan_penolakan} />
          )}

          {/* Tata Letak 2 Kolom */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Kolom Kiri: Formulir Edit */}
            <div className="lg:col-span-2">
              <PermohonanEditFormCard
                currentDokumen={currentDokumen}
                onViewDokumen={handleViewCurrentDokumen}
                data={formData}
                setData={handleFieldChange}
                errors={formErrors}
                processing={isSubmitting}
                onSubmit={handleSubmit}
              />
            </div>

            {/* Kolom Kanan: Panduan & Alur */}
            <div className="space-y-6">
              <AlurPermohonanCard mode="revisi" />
              <PanduanPengajuanCard mode="revisi" />
            </div>
          </div>
        </div>
      )}
    </DashboardShellTemplate>
  );
};

export default PermohonPermohonanEdit;

