import { useState, useEffect, type FC } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Calendar,
  Tag,
  Building2,
  Banknote,
  Eye,
  Download,
  XCircle,
  CheckCircle2,
  Layers,
  Info,
  UserCheck,
  Hash,
} from 'lucide-react';
import axios from 'axios';
import api from '../../../services/api';
import PpLayout, { type PpNavItem } from '../../../components/templates/PpLayout';
import KonfirmasiApproveModal from '../../../components/organisms/KonfirmasiApproveModal';
import TolakPengadaanModal from '../../../components/organisms/TolakPengadaanModal';
import DocumentPreviewModal from '../../../components/organisms/DocumentPreviewModal';

export interface PpReviewProps {
  detail?: any;
  recentNotifications?: any[];
  unreadNotificationsCount?: number;
  basePath?: string;
  roleInitials?: string;
  roleTitle?: string | null;
  roleSubtitle?: string | null;
  navItems?: PpNavItem[] | null;
  keputusanTitle?: string;
  keputusanNote?: string;
}

export const PpPengajuanReview: FC<PpReviewProps> = ({
  detail: initialDetail,
  recentNotifications = [],
  unreadNotificationsCount = 0,
  basePath = '/pp',
  roleInitials = 'PP',
  roleTitle = null,
  roleSubtitle = null,
  navItems = null,
  keputusanTitle = 'Keputusan PP',
  keputusanNote = 'Khusus pengadaan Rp50 - 200 juta. Pastikan dokumen telah sesuai sebelum direview.',
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [detail, setDetail] = useState<any>(initialDetail || {});
  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rejectError, setRejectError] = useState('');
  const [previewDoc, setPreviewDoc] = useState<any>(null);

  useEffect(() => {
    if (!initialDetail && id) {
      api
        .get<{ detail?: any; data?: any }>(`/v1${basePath}/pengajuan/${id}/review`)
        .then((res) => {
          setDetail(res.data.detail || res.data.data || res.data);
        })
        .catch((err) => {
          console.error('Failed to fetch pengajuan review:', err);
        });
    }
  }, [id, initialDetail, basePath]);

  const { pengadaan = {}, mak_list = [] } = detail;
  const permohonan = pengadaan?.permohonan || {};

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '04 Maret 2027';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await api.post(`/v1${basePath}/pengajuan/${pengadaan.id || id}/approve`);
      setConfirmApproveOpen(false);
      navigate(`${basePath}/pengajuan`);
    } catch (err) {
      console.error('Failed to approve pengadaan:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (alasan: string) => {
    setSubmitting(true);
    setRejectError('');
    try {
      await api.post(`/v1${basePath}/pengajuan/${pengadaan.id || id}/reject`, { alasan });
      setRejectOpen(false);
      navigate(`${basePath}/pengajuan`);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.errors) {
        setRejectError(
          err.response.data.errors.alasan || 'Terjadi kesalahan saat memproses penolakan.'
        );
      } else {
        setRejectError('Terjadi kesalahan saat memproses penolakan.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const nomorSurat = permohonan.nomor_surat || '111-FFF-111';
  const judulPermohonan = permohonan.judul || 'Pengadaan Komputer';
  const unitNama = permohonan.unit?.nama || 'Jurusan Teknik Informatika & Komputer';

  return (
    <PpLayout
      activeRoute="pengajuan"
      notifications={recentNotifications}
      unreadCount={unreadNotificationsCount}
      roleInitials={roleInitials}
      roleTitle={roleTitle}
      roleSubtitle={roleSubtitle}
      navItems={navItems}
      profileHref={`${basePath}/profil`}
      notifikasiHref={`${basePath}/notifikasi`}
      readAllHref={`${basePath}/notifikasi/read-all`}
      breadcrumb={[
        { label: 'LIST PENGAJUAN', href: `${basePath}/pengajuan` },
        { label: 'DETAIL PENGADAAN' },
      ]}
    >
      {/* Hero Top Banner */}
      <div className="relative overflow-hidden rounded-[24px] bg-[#0E7C5A] p-6 sm:px-9 sm:py-7 text-white shadow-[0_10px_24px_rgba(13,51,38,0.14)] mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/75 block mb-1">
              PENGADAAN
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight">
                Review Pengadaan
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F0FF] text-[#2F68D6]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2F68D6]" />
                Menunggu Persetujuan
              </span>
            </div>
            <p className="text-xs text-white/85 mt-1.5">
              Nomor {nomorSurat} · Diajukan {formatDate(permohonan.created_at)}
            </p>
          </div>

          <Link
            to={`${basePath}/pengajuan`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-bold transition-colors shrink-0 self-start sm:self-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </Link>
        </div>
        <div
          className="absolute -right-10 -top-20 w-[260px] h-[260px] rounded-full bg-white/8 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute right-28 -bottom-20 w-[180px] h-[180px] rounded-full bg-white/8 pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* Card 1: Informasi Permohonan */}
      <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] mb-6">
        <div className="pb-4 mb-5 border-b border-[#F0F4F2]">
          <h3 className="text-base font-bold text-[#14201C]">Informasi Permohonan</h3>
          <p className="text-xs text-[#8A9A95] mt-0.5">Ringkasan data yang diajukan</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 text-xs">
          <div className="flex items-center gap-3.5 pb-4 border-b border-[#F4F7F5]">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5EF] flex items-center justify-center text-[#0E7C5A] shrink-0">
              <Hash className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[#8A9A95] text-[11px]">Nomor Permohonan</p>
              <p className="font-bold text-[#0E7C5A] text-[13px] mt-0.5">{nomorSurat}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 pb-4 border-b border-[#F4F7F5]">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5EF] flex items-center justify-center text-[#0E7C5A] shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[#8A9A95] text-[11px]">Tanggal Pengajuan</p>
              <p className="font-bold text-[#14201C] text-[13px] mt-0.5">
                {formatDate(permohonan.created_at)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 pb-4 border-b border-[#F4F7F5]">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5EF] flex items-center justify-center text-[#0E7C5A] shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[#8A9A95] text-[11px]">Judul Permohonan</p>
              <p className="font-bold text-[#14201C] text-[13px] mt-0.5">{judulPermohonan}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 pb-4 border-b border-[#F4F7F5]">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5EF] flex items-center justify-center text-[#0E7C5A] shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[#8A9A95] text-[11px]">Diajukan Oleh</p>
              <p className="font-bold text-[#14201C] text-[13px] mt-0.5">{unitNama}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5EF] flex items-center justify-center text-[#0E7C5A] shrink-0">
              <Banknote className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[#8A9A95] text-[11px]">Nominal Pengadaan</p>
              <p className="font-bold text-[#14201C] text-[13px] mt-0.5">
                {formatCurrency(pengadaan.nominal)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5EF] flex items-center justify-center text-[#0E7C5A] shrink-0">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[#8A9A95] text-[11px]">Status</p>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-[#E8F0FF] text-[#2F68D6] mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2F68D6]" />
                Menunggu Persetujuan
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Dokumen Proses Sebelumnya */}
      <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] mb-6">
        <div className="pb-4 mb-5 border-b border-[#F0F4F2]">
          <h3 className="text-base font-bold text-[#14201C]">Dokumen Proses Sebelumnya</h3>
          <p className="text-xs text-[#8A9A95] mt-0.5">
            Surat permohonan, memo persetujuan, dan jenis MAK dari Perencanaan
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="p-4 rounded-2xl border border-[#E4EBE8] bg-white">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-[#0E7C5A]">Surat Permohonan</p>
                  <p className="text-xs font-bold text-[#14201C] truncate mt-0.5">
                    Surat_Permohonan_{nomorSurat}.pdf
                  </p>
                  <p className="text-[11px] text-[#8A9A95]">PDF • 8 MB</p>
                </div>
              </div>
              <button
                type="button"
                className="w-9 h-9 rounded-xl border border-[#E4EBE8] bg-white hover:bg-[#F4F7F5] text-[#5F6F6A] flex items-center justify-center shrink-0 cursor-pointer"
                title="Unduh Surat Permohonan"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() =>
                setPreviewDoc({
                  category: 'Surat Permohonan',
                  filename: `Surat_Permohonan_${nomorSurat}.pdf`,
                  size: 'PDF • 8 MB',
                })
              }
              className="w-full mt-3.5 py-2.5 rounded-xl border border-[#E4EBE8] bg-white hover:bg-[#F4F9F6] text-xs font-bold text-[#0E7C5A] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Lihat Dokumen</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl border border-[#E4EBE8] bg-white">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-[#0E7C5A]">Memo Persetujuan</p>
                  <p className="text-xs font-bold text-[#14201C] truncate mt-0.5">
                    Memo_Persetujuan_{nomorSurat}.pdf
                  </p>
                  <p className="text-[11px] text-[#8A9A95]">PDF • 1 MB</p>
                </div>
              </div>
              <button
                type="button"
                className="w-9 h-9 rounded-xl border border-[#E4EBE8] bg-white hover:bg-[#F4F7F5] text-[#5F6F6A] flex items-center justify-center shrink-0 cursor-pointer"
                title="Unduh Memo Persetujuan"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() =>
                setPreviewDoc({
                  category: 'Memo Persetujuan',
                  filename: `Memo_Persetujuan_${nomorSurat}.pdf`,
                  size: 'PDF • 1 MB',
                })
              }
              className="w-full mt-3.5 py-2.5 rounded-xl border border-[#E4EBE8] bg-white hover:bg-[#F4F9F6] text-xs font-bold text-[#0E7C5A] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Lihat Dokumen</span>
            </button>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#EAF6F1] flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-full bg-white text-[#0E7C5A] flex items-center justify-center shrink-0 shadow-2xs">
            <Tag className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <p className="text-[11px] font-semibold text-[#0E7C5A]">Jenis MAK dari Perencanaan</p>
            <div className="font-bold text-[#14201C] mt-0.5 space-y-0.5">
              {mak_list.length > 0 ? (
                mak_list.map((m: any) => (
                  <p key={m.id}>
                    {m.kode || m.id} – {m.nama}
                  </p>
                ))
              ) : (
                <p>532111 – Belanja Modal Peralatan dan Mesin</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Preview Dokumen Pengadaan & Keputusan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
          <div className="pb-4 mb-4 border-b border-[#F0F4F2] flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#14201C]">Dokumen Pengadaan</h3>
              <p className="text-xs text-[#8A9A95] mt-0.5">Ditinjau sebelum diberikan keputusan</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-3.5 rounded-xl border border-[#E4EBE8] bg-[#FAFCFB] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-5 h-5 text-[#0E7C5A] shrink-0" />
                <div className="min-w-0 text-xs">
                  <p className="font-bold text-[#14201C] truncate">Dokumen_Pengadaan.pdf</p>
                  <p className="text-[11px] text-[#8A9A95]">PDF • 5 MB</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    setPreviewDoc({
                      category: 'Dokumen Pengadaan',
                      filename: 'Dokumen_Pengadaan.pdf',
                      size: 'PDF • 5 MB',
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E4EBE8] text-xs font-bold text-[#14201C] hover:bg-[#F8FAF9] transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-[#5F6F6A]" />
                  <span>Lihat</span>
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-[#EFF3F1] p-5 sm:p-7">
              <div className="bg-white rounded-xl p-6 sm:p-8 shadow-xs min-h-[300px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 pb-4 border-b-2 border-[#0E7C5A]">
                    <div>
                      <p className="text-xs font-extrabold text-[#14201C] uppercase tracking-wide">
                        {unitNama}
                      </p>
                      <p className="text-[11px] text-[#8A9A95]">Pengadaan Barang &amp; Jasa</p>
                    </div>
                  </div>

                  <div className="py-4 space-y-1 text-xs text-[#5F6F6A]">
                    <p>
                      <span className="inline-block w-16 text-[#8A9A95]">Nomor</span>:{' '}
                      <strong className="text-[#14201C]">{nomorSurat}</strong>
                    </p>
                    <p>
                      <span className="inline-block w-16 text-[#8A9A95]">Perihal</span>:{' '}
                      <strong className="text-[#14201C]">{judulPermohonan}</strong>
                    </p>
                    <p>
                      <span className="inline-block w-16 text-[#8A9A95]">Tanggal</span>:{' '}
                      <strong className="text-[#14201C]">{formatDate(pengadaan.created_at)}</strong>
                    </p>
                  </div>

                  <p className="text-xs text-[#5F6F6A] leading-relaxed mb-4">
                    Dokumen ini memuat rincian kebutuhan, spesifikasi, dan estimasi anggaran
                    pengadaan yang telah disusun oleh PPBJ untuk ditinjau.
                  </p>
                </div>

                <div className="pt-6 flex justify-between items-end text-xs text-[#8A9A95]">
                  <span className="px-3.5 py-1 rounded-full bg-[#14201C] text-white text-[11px] font-bold">
                    Halaman 1 dari 1
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
            <div className="pb-3.5 mb-4 border-b border-[#F0F4F2]">
              <h3 className="text-base font-bold text-[#14201C]">Informasi Pengadaan</h3>
            </div>

            <div className="divide-y divide-[#F0F4F2] text-xs">
              <div className="flex items-center gap-3.5 pb-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#E8F5EF] text-[#0E7C5A] flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[#8A9A95] block text-[11px]">Penanggung Jawab</span>
                  <span className="font-bold text-[#14201C] block mt-0.5">
                    {pengadaan.ppk?.nama || 'Pejabat Terkait'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 py-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#E8F5EF] text-[#0E7C5A] flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[#8A9A95] block text-[11px]">Jenis Pengadaan</span>
                  <span className="font-bold text-[#14201C] block mt-0.5">
                    {pengadaan.jenis?.nama || 'Barang'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 py-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#E8F5EF] text-[#0E7C5A] flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[#8A9A95] block text-[11px]">Diunggah Oleh</span>
                  <span className="font-bold text-[#14201C] block mt-0.5">PPBJ</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 pt-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#E8F5EF] text-[#0E7C5A] flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[#8A9A95] block text-[11px]">Tanggal Unggah</span>
                  <span className="font-bold text-[#14201C] block mt-0.5">
                    {formatDate(pengadaan.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
            <div className="pb-3.5 mb-4 border-b border-[#F0F4F2]">
              <h3 className="text-base font-bold text-[#14201C]">{keputusanTitle}</h3>
              <p className="text-xs text-[#8A9A95] mt-0.5">
                Tinjau dokumen pengadaan, lalu setujui atau tolak
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F4F7F5] border border-[#E4EBE8] flex items-start gap-2.5 mb-5 text-xs text-[#5F6F6A]">
              <Info className="w-4 h-4 text-[#5F6F6A] shrink-0 mt-0.5" />
              <p className="leading-relaxed">{keputusanNote}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRejectOpen(true)}
                className="py-3 px-3 rounded-xl border border-[#FECDCA] bg-[#FEE4E2]/70 hover:bg-[#FEE4E2] text-xs font-bold text-[#D92D20] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-4 h-4 shrink-0" />
                <span>Revisi Dokumen</span>
              </button>
              <button
                type="button"
                onClick={() => setConfirmApproveOpen(true)}
                className="py-3 px-3 rounded-xl bg-[#0E7C5A] hover:bg-[#0A5C43] text-xs font-bold text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Setujui Dokumen</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <KonfirmasiApproveModal
        isOpen={confirmApproveOpen}
        onClose={() => setConfirmApproveOpen(false)}
        onConfirm={handleApprove}
        pengadaan={pengadaan}
        isSubmitting={submitting}
      />

      <TolakPengadaanModal
        isOpen={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onConfirm={handleReject}
        pengadaan={pengadaan}
        isSubmitting={submitting}
        error={rejectError}
      />

      <DocumentPreviewModal
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        category={previewDoc?.category}
        filename={previewDoc?.filename}
        size={previewDoc?.size}
      />
    </PpLayout>
  );
};

export default PpPengajuanReview;
