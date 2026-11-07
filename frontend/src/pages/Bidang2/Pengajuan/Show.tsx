import { useState, useEffect, useCallback, type FC } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  ArrowLeft,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  X,
} from 'lucide-react';
import api from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import DashboardShellTemplate from '../../../components/templates/DashboardShellTemplate';
import StatusPill from '../../../components/atoms/StatusPill';
import SuratPermohonanCard from '../../../components/organisms/SuratPermohonanCard';
import InformasiPermohonanCard from '../../../components/organisms/Bidang2/InformasiPermohonanCard';
import CatatanPerencanaanCard from '../../../components/organisms/Bidang2/CatatanPerencanaanCard';
import KeputusanBidang2Card from '../../../components/organisms/Bidang2/KeputusanBidang2Card';
import SetujuPermohonanModal from '../../../components/organisms/Bidang2/SetujuPermohonanModal';
import TolakPermohonanModal from '../../../components/organisms/Bidang2/TolakPermohonanModal';
import type { Bidang2DetailPengajuan } from '../../../types/bidang2';

const NAV_ITEMS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/bidang-2/dashboard',
  },
  {
    key: 'pengajuan',
    label: 'List Pengajuan',
    icon: ClipboardList,
    href: '/bidang-2/pengajuan',
    badge: 4,
  },
  {
    key: 'rkakl',
    label: 'Dokumen RKAKL',
    icon: FileText,
    href: '/bidang-2/rkakl',
  },
];

export const Bidang2PengajuanShow: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [permohonan, setPermohonan] = useState<Bidang2DetailPengajuan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [flashMessage, setFlashMessage] = useState<string | null>(null);

  const [isSetujuModalOpen, setIsSetujuModalOpen] = useState<boolean>(false);
  const [isTolakModalOpen, setIsTolakModalOpen] = useState<boolean>(false);

  const fetchDetail = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');

    try {
      const res = await api.get<{ permohonan: Bidang2DetailPengajuan }>(
        `/v1/bidang-2/pengajuan/${id}`
      );
      setPermohonan(res.data.permohonan);
    } catch (err: any) {
      setHasError(true);
      const msg =
        err?.response?.data?.message ||
        'Gagal memuat detail pengajuan. Pastikan data ada dan Anda memiliki hak akses.';
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
    activeRoute: 'pengajuan',
    brandSubtitle: 'Pengadaan Barang & Jasa',
    sectionTitle: 'Menu',
  };

  const topbarProps = {
    user,
  };

  const handleOpenRkakl = () => {
    navigate('/bidang-2/rkakl');
  };

  const handleSetujuSubmit = async (fileMemo: File) => {
    if (!id) return;

    const payload = new FormData();
    payload.append('file_memo', fileMemo);

    await api.post(`/v1/bidang-2/pengajuan/${id}/approve`, payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    setFlashMessage('Permohonan berhasil disetujui dan memo persetujuan telah tersimpan.');
    await fetchDetail();
  };

  const handleTolakSubmit = async (alasan: string) => {
    if (!id) return;

    await api.post(`/v1/bidang-2/pengajuan/${id}/reject`, {
      alasan,
    });

    setFlashMessage('Permohonan berhasil ditolak dan catatan telah diteruskan ke pemohon serta Perencanaan.');
    await fetchDetail();
  };

  return (
    <DashboardShellTemplate sidebarProps={sidebarProps} topbarProps={topbarProps}>
      {/* Breadcrumb Nav */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs font-bold text-[#8A9A95] tracking-wider uppercase mb-1"
      >
        <Link
          to="/bidang-2/pengajuan"
          className="hover:text-[#0E7C5A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] rounded px-1"
        >
          LIST PENGAJUAN
        </Link>
        <span aria-hidden="true">&gt;</span>
        <span className="text-[#14201C] px-1">DETAIL PERMOHONAN</span>
      </nav>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-6 animate-pulse">
          <div className="h-40 bg-[#EEF5F2] rounded-[24px]" />
          <div className="h-64 bg-white rounded-[24px] border border-[#E4EBE8] p-6 space-y-4">
            <div className="h-6 w-48 bg-[#EEF5F2] rounded" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-12 bg-[#EEF5F2] rounded-xl" />
              ))}
            </div>
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
            Gagal Memuat Detail Pengajuan
          </h2>
          <p className="text-xs md:text-sm text-[#5F6F6A] max-w-md mx-auto">
            {errorMessage || 'Permohonan tidak ditemukan atau terjadi kendala saat memuat data.'}
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
              to="/bidang-2/pengajuan"
              className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-xl border border-[#E4EBE8] bg-white text-xs font-semibold text-[#14201C] hover:bg-[#F3F6F5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A]"
            >
              Kembali ke Daftar
            </Link>
          </div>
        </div>
      )}

      {/* Success Content */}
      {!isLoading && permohonan && (
        <div className="space-y-6">
          {/* Flash Message Banner */}
          {flashMessage && (
            <div className="p-4 rounded-2xl bg-[#EEF5F2] border border-[#7FE0B8] text-[#0E7C5A] text-sm font-medium flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{flashMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setFlashMessage(null)}
                className="text-[#0E7C5A] hover:opacity-70 p-1 rounded transition-opacity"
                aria-label="Tutup pemberitahuan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Hero Banner with Custom Header Actions */}
          <div className="relative overflow-hidden bg-[#0E7C5A] text-white rounded-[24px] p-6 md:p-8 min-h-[148px] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_4px_20px_rgba(14,124,90,0.15)]">
            {/* Decorative circles */}
            <div
              className="absolute -right-16 -top-16 w-[260px] h-[260px] rounded-full border border-white/10 pointer-events-none hidden sm:block"
              aria-hidden="true"
            />
            <div
              className="absolute -right-6 -bottom-12 w-[170px] h-[170px] rounded-full border border-white/15 pointer-events-none hidden sm:block"
              aria-hidden="true"
            />

            <div className="relative z-10 max-w-xl">
              <p className="text-[11px] font-bold tracking-[1.4px] text-white/75 uppercase mb-1">
                PERMOHONAN PENGADAAN
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  Detail Permohonan
                </h1>
                <StatusPill
                  status={permohonan.status}
                  label={permohonan.status === 'menunggu_bidang2' ? 'Review Permohonan' : undefined}
                />
              </div>
              <p className="text-xs md:text-sm text-white/85 mt-2 leading-relaxed">
                Nomor {permohonan.nomor_surat || '-'} · Diajukan {permohonan.tanggal_pengajuan || '-'}
              </p>
            </div>

            {/* Aksi Kanan: Tombol Dokumen RKAKL dan Kembali */}
            <div className="relative z-10 flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleOpenRkakl}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#0E7C5A] text-xs md:text-sm font-semibold hover:bg-[#F3F6F5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white shadow-2xs cursor-pointer min-h-[44px]"
              >
                <FileText className="w-4 h-4 stroke-[2.2]" />
                <span>Dokumen RKAKL</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/bidang-2/pengajuan')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 text-white text-xs md:text-sm font-semibold hover:bg-white/25 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer min-h-[44px]"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
                <span>Kembali</span>
              </button>
            </div>
          </div>

          {/* Card 1: Informasi Permohonan (Full Width) */}
          <InformasiPermohonanCard data={permohonan} />

          {/* Tata Letak 2 Kolom: Kiri (Surat Permohonan) & Kanan (Catatan & Keputusan) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Kolom Kiri: Surat Permohonan dengan Live Preview */}
            <div className="lg:col-span-7">
              <SuratPermohonanCard
                dokumen={permohonan.dokumen}
                nomorSurat={permohonan.nomor_surat}
                judul={permohonan.judul}
                unitNama={permohonan.unit_nama}
                tanggal={permohonan.tanggal_pengajuan}
                nominal={permohonan.estimasi_anggaran}
                showLivePreviewInitially={true}
              />
            </div>

            {/* Kolom Kanan: Catatan Perencanaan & Keputusan Bidang 2 */}
            <div className="lg:col-span-5 space-y-6">
              <CatatanPerencanaanCard catatan={permohonan.catatan_perencanaan} />
              <KeputusanBidang2Card
                rkakl={permohonan.rkakl_aktif}
                onOpenRkakl={handleOpenRkakl}
                onOpenTolakModal={() => setIsTolakModalOpen(true)}
                onOpenSetujuModal={() => setIsSetujuModalOpen(true)}
                status={permohonan.status}
                keputusan={permohonan.keputusan_bidang2}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal Unggah Memo Persetujuan */}
      <SetujuPermohonanModal
        isOpen={isSetujuModalOpen}
        onClose={() => setIsSetujuModalOpen(false)}
        onConfirm={handleSetujuSubmit}
        nomorSurat={permohonan?.nomor_surat}
      />

      {/* Modal Tolak Permohonan */}
      <TolakPermohonanModal
        isOpen={isTolakModalOpen}
        onClose={() => setIsTolakModalOpen(false)}
        onConfirm={handleTolakSubmit}
        nomorSurat={permohonan?.nomor_surat}
        judul={permohonan?.judul}
      />
    </DashboardShellTemplate>
  );
};

export default Bidang2PengajuanShow;
