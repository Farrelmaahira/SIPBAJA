import { useState, useEffect, type FC, type FormEvent } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Eye,
  CheckCircle2,
  XCircle,
  Building2,
  Calendar,
  Banknote,
  Hash,
  Tag,
  Plus,
  Send,
  ChevronDown,
  X,
} from 'lucide-react';
import api from '../../../services/api';
import PpLayout from '../../../components/templates/PpLayout';
import DocumentPreviewModal from '../../../components/organisms/DocumentPreviewModal';
import { PERENCANAAN_NAV_ITEMS } from '../Dashboard';

const DEFAULT_MAKS = [
  { id: 1, label: '521211 - Belanja Bahan' },
  { id: 2, label: '522141 - Belanja Sewa' },
  { id: 3, label: '523111 - Belanja Pemeliharaan Gedung dan Bangunan' },
  { id: 4, label: '524111 - Belanja Perjalanan Dinas Biasa' },
  { id: 5, label: '532111 - Belanja Modal Peralatan dan Mesin' },
  { id: 6, label: '533111 - Belanja Modal Gedung dan Bangunan' },
];

export interface PerencanaanShowProps {
  detail?: any;
  recentNotifications?: any[];
  unreadNotificationsCount?: number;
}

export const PerencanaanPengajuanShow: FC<PerencanaanShowProps> = ({
  detail: initialDetail,
  recentNotifications = [],
  unreadNotificationsCount = 0,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [detail, setDetail] = useState<any>(initialDetail || {});
  const [makSelects, setMakSelects] = useState<number[]>([1]);
  const [singleMakId, setSingleMakId] = useState<number>(1);
  const [previewDoc, setPreviewDoc] = useState<any>(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [alasanPenolakan, setAlasanPenolakan] = useState('');
  const [alasanError, setAlasanError] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!initialDetail && id) {
      api
        .get<{ detail?: any; data?: any }>(`/v1/perencanaan/pengajuan/${id}`)
        .then((res) => {
          const fetchedDetail = res.data.detail || res.data.data || res.data;
          setDetail(fetchedDetail);
          if (fetchedDetail.selected_mak_ids?.length) {
            setMakSelects(fetchedDetail.selected_mak_ids);
            setSingleMakId(fetchedDetail.selected_mak_ids[0]);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch Perencanaan pengajuan detail:', err);
        });
    }
  }, [id, initialDetail]);

  const permohonan = detail.permohonan || {};
  const rawStatus = permohonan.status || 'diajukan';

  const mode =
    rawStatus === 'diajukan' || rawStatus === 'menunggu_verifikasi'
      ? 'verifikasi'
      : rawStatus === 'pengadaan' || rawStatus === 'disetujui'
      ? 'pengadaan'
      : 'diteruskan';

  const maksList =
    detail.maks && detail.maks.length >= 4
      ? detail.maks.map((m: any, idx: number) => ({
          id: m.id,
          label: m.nama.includes('-') ? m.nama : `${521211 + idx * 1000} - ${m.nama}`,
        }))
      : DEFAULT_MAKS;

  const nomorSurat = permohonan.nomor_surat || '111-FFF-111';
  const judul = permohonan.judul || 'Pengadaan Komputer';
  const unitNama = permohonan.unit?.nama || 'Jurusan Teknik Informatika & Komputer';
  const nominal = permohonan.estimasi_anggaran || permohonan.nominal || 100000000;

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    })
      .format(val || 0)
      .replace(/\s+/g, '');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '04 Maret 2027';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleAddMakDropdown = () => {
    const nextUnused =
      maksList.find((m: any) => !makSelects.includes(m.id))?.id || maksList[0]?.id || 1;
    setMakSelects((prev) => [...prev, nextUnused]);
  };

  const handleMakDropdownChange = (idx: number, val: string) => {
    const numVal = Number(val);
    setMakSelects((prev) => prev.map((item, i) => (i === idx ? numVal : item)));
  };

  const handleApproveSubmit = async () => {
    const validIds = makSelects.filter(Boolean);
    if (validIds.length === 0) return;
    setProcessing(true);
    try {
      await api.post(`/v1/perencanaan/pengajuan/${permohonan.id || id}/approve`, {
        mak_ids: validIds,
      });
      setApproveModalOpen(false);
      navigate('/perencanaan/pengajuan');
    } catch (err) {
      console.error('Failed to approve permohonan:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!alasanPenolakan || alasanPenolakan.trim().length < 5) {
      setAlasanError('Catatan penolakan wajib diisi minimal 5 karakter.');
      return;
    }
    setAlasanError('');
    setProcessing(true);
    try {
      await api.post(`/v1/perencanaan/pengajuan/${permohonan.id || id}/reject`, {
        alasan: alasanPenolakan,
      });
      setRejectModalOpen(false);
      navigate('/perencanaan/pengajuan');
    } catch (err) {
      console.error('Failed to reject permohonan:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleKirimPengadaan = async () => {
    setProcessing(true);
    try {
      await api.post(`/v1/perencanaan/pengajuan/${permohonan.id || id}/kirim-pengadaan`, {
        mak_id: singleMakId,
      });
      navigate('/perencanaan/pengajuan');
    } catch (err) {
      console.error('Failed to send to pengadaan:', err);
    } finally {
      setProcessing(false);
    }
  };

  const renderStatusPill = () => {
    if (mode === 'verifikasi') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F0FF] text-[#2F68D6]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2F68D6]" />
          Diajukan
        </span>
      );
    }
    if (mode === 'pengadaan') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F3E8FF] text-[#7E22CE]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7E22CE]" />
          Pengadaan
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF3DC] text-[#9A5B00]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#9A5B00]" />
        Diteruskan
      </span>
    );
  };

  return (
    <PpLayout
      activeRoute="pengajuan"
      notifications={recentNotifications}
      unreadCount={unreadNotificationsCount}
      navItems={PERENCANAAN_NAV_ITEMS}
      roleInitials="PR"
      roleTitle="Perencanaan"
      roleSubtitle="Unit Perencanaan"
      profileHref="/perencanaan/profil"
      notifikasiHref="/perencanaan/notifikasi"
      readAllHref="/perencanaan/notifikasi/read-all"
      breadcrumb={[
        { label: 'DASHBOARD', href: '/perencanaan/dashboard' },
        { label: mode === 'pengadaan' ? 'DETAIL PENGADAAN' : 'DETAIL PERMOHONAN' },
      ]}
    >
      {/* Hero Top Banner */}
      <div className="relative overflow-hidden rounded-[24px] bg-[#0E7C5A] p-6 sm:px-9 sm:py-7 text-white shadow-[0_10px_24px_rgba(13,51,38,0.14)] mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/75 block mb-1">
              {mode === 'pengadaan' ? 'PENGADAAN MASUK' : 'PERMOHONAN MASUK'}
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight">
                {mode === 'pengadaan' ? 'Detail Pengadaan' : 'Detail Permohonan'}
              </h1>
              {renderStatusPill()}
            </div>
            <p className="text-xs text-white/85 mt-1.5">
              Nomor {nomorSurat} · Diajukan {formatDate(permohonan.created_at)}
            </p>
          </div>

          <Link
            to="/perencanaan/pengajuan"
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
          <h3 className="text-base font-bold text-[#14201C]">
            {mode === 'pengadaan' ? 'Informasi Pengadaan' : 'Informasi Permohonan'}
          </h3>
          <p className="text-xs text-[#8A9A95] mt-0.5">
            {mode === 'pengadaan' ? 'Ringkasan data pengadaan' : 'Ringkasan data yang diajukan'}
          </p>
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
              <p className="font-bold text-[#14201C] text-[13px] mt-0.5">{judul}</p>
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
              <p className="text-[#8A9A95] text-[11px]">Estimasi Anggaran</p>
              <p className="font-bold text-[#14201C] text-[13px] mt-0.5">
                {formatCurrency(nominal)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Review Section: Live Preview & MAK Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
          <div className="pb-4 mb-4 border-b border-[#F0F4F2] flex items-center justify-between">
            <h3 className="text-base font-bold text-[#14201C]">Dokumen Permohonan</h3>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#EAF6F1] text-[#0E7C5A]">
              Live Preview
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F4F7F5] border border-[#E4EBE8] flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#14201C] truncate">
                  {mode === 'pengadaan'
                    ? 'Dokumen_Pengadaan_Komputer_TIK.pdf'
                    : 'Surat_Permohonan_Pengadaan.pdf'}
                </p>
                <p className="text-[11px] text-[#8A9A95]">PDF • 8 MB</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() =>
                  setPreviewDoc({
                    label: 'Surat Permohonan',
                    filename: 'Surat_Permohonan_Pengadaan.pdf',
                    size: 'PDF • 8 MB',
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
                    <strong className="text-[#14201C]">{judul}</strong>
                  </p>
                  <p>
                    <span className="inline-block w-16 text-[#8A9A95]">Tanggal</span>:{' '}
                    <strong className="text-[#14201C]">{formatDate(permohonan.created_at)}</strong>
                  </p>
                </div>

                <p className="text-xs text-[#5F6F6A] leading-relaxed mb-4">
                  Permohonan pengadaan barang dan jasa yang diajukan oleh unit untuk dilakukan
                  verifikasi anggaran serta penetapan MAK.
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

        {/* Right Column: Verifikasi MAK / Keputusan */}
        <div className="space-y-6">
          {mode === 'verifikasi' ? (
            <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
              <div className="pb-4 mb-4 border-b border-[#F0F4F2]">
                <h3 className="text-base font-bold text-[#14201C]">Verifikasi Anggaran</h3>
                <p className="text-xs text-[#8A9A95] mt-0.5">
                  Tentukan Jenis MAK sebelum menyetujui permohonan
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-[#14201C]">
                  Jenis MAK <span className="text-red-500">*</span>
                </label>

                {makSelects.map((selectedId, idx) => (
                  <div key={idx} className="relative">
                    <select
                      value={selectedId}
                      onChange={(e) => handleMakDropdownChange(idx, e.target.value)}
                      className="w-full appearance-none px-4 py-3 pr-9 rounded-xl border border-[#E4EBE8] bg-white text-xs font-medium text-[#14201C] focus:outline-none focus:border-[#0E7C5A] transition cursor-pointer"
                    >
                      {maksList.map((m: any) => (
                        <option key={m.id} value={m.id}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#8A9A95] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddMakDropdown}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E4EBE8] bg-white hover:bg-[#F4F7F5] text-xs font-bold text-[#14201C] transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#0E7C5A]" />
                  <span>Tambah Jenis MAK</span>
                </button>
              </div>

              <div className="pt-5 mt-5 border-t border-[#F0F4F2] grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(true)}
                  className="py-3 px-3 rounded-xl border border-[#FECDCA] bg-[#FEE4E2]/70 hover:bg-[#FEE4E2] text-xs font-bold text-[#D92D20] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>Tolak</span>
                </button>
                <button
                  type="button"
                  onClick={() => setApproveModalOpen(true)}
                  className="py-3 px-3 rounded-xl bg-[#0E7C5A] hover:bg-[#0A5C43] text-xs font-bold text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Setujui</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
              <div className="pb-4 mb-4 border-b border-[#F0F4F2]">
                <h3 className="text-base font-bold text-[#14201C]">Jenis MAK</h3>
                <p className="text-xs text-[#8A9A95] mt-0.5">
                  Tentukan atau ubah Jenis MAK sebelum mengirim pengadaan
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14201C] mb-2">
                  Jenis MAK <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-[#0E7C5A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={singleMakId}
                    onChange={(e) => setSingleMakId(Number(e.target.value))}
                    className="w-full appearance-none pl-10 pr-9 py-3 rounded-xl border border-[#E4EBE8] bg-white text-xs font-bold text-[#14201C] focus:outline-none focus:border-[#0E7C5A] transition cursor-pointer"
                  >
                    {maksList.map((m: any) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#8A9A95] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-[#F0F4F2]">
                <button
                  type="button"
                  disabled={processing}
                  onClick={handleKirimPengadaan}
                  className="w-full py-3 px-4 rounded-xl bg-[#0E7C5A] hover:bg-[#0A5C43] disabled:opacity-50 text-xs font-bold text-white transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>{processing ? 'Mengirim...' : 'Kirim Pengadaan'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Approve */}
      {approveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[24px] border border-[#E3EAE6] shadow-[0_8px_12px_rgba(13,26,20,0.06)] w-full max-w-[480px] p-6 flex flex-col gap-5">
            <h3 className="text-lg font-bold text-[#14201C]">Setujui Permohonan</h3>
            <p className="text-xs text-[#5F6F6A]">
              Permohonan akan diverifikasi anggarannya dan diteruskan ke PPBJ.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setApproveModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-[#E4EBE8] text-[#5F6F6A] hover:bg-[#F4F7F5]"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={handleApproveSubmit}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#0E7C5A] hover:bg-[#0A5C43] text-white disabled:opacity-50"
              >
                {processing ? 'Menyimpan...' : 'Ya, Setujui'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reject */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
          <form
            onSubmit={handleRejectSubmit}
            className="bg-white rounded-[24px] border border-[#E3EAE6] shadow-[0_8px_12px_rgba(13,26,20,0.06)] w-full max-w-[480px] p-6 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#14201C]">Tolak Permohonan</h3>
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="text-[#8A9A95] hover:text-[#14201C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#14201C] mb-1">
                Catatan Penolakan
              </label>
              <textarea
                rows={4}
                value={alasanPenolakan}
                onChange={(e) => setAlasanPenolakan(e.target.value)}
                placeholder="Tuliskan alasan penolakan..."
                className="w-full p-3 rounded-xl border border-[#E4EBE8] text-xs text-[#14201C] focus:outline-none focus:ring-1 focus:ring-[#0E7C5A]"
              />
              {alasanError && <p className="text-xs text-red-600 mt-1">{alasanError}</p>}
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-[#E4EBE8] text-[#5F6F6A] hover:bg-[#F4F7F5]"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={processing}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#D92D20] hover:bg-[#B42318] text-white disabled:opacity-50"
              >
                {processing ? 'Memproses...' : 'Tolak Permohonan'}
              </button>
            </div>
          </form>
        </div>
      )}

      <DocumentPreviewModal
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        category={previewDoc?.label}
        filename={previewDoc?.filename}
        size={previewDoc?.size}
      />
    </PpLayout>
  );
};

export default PerencanaanPengajuanShow;
