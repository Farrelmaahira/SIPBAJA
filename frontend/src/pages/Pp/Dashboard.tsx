import { useState, useEffect, type FC } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Hourglass,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Tag,
} from 'lucide-react';
import api from '../../services/api';
import PpLayout from '../../components/templates/PpLayout';
import RowActionMenu from '../../components/organisms/RowActionMenu';

export interface PpDashboardStats {
  total?: number;
  menunggu?: number;
  disetujui?: number;
  ditolak?: number;
}

export interface PengadaanReviewItem {
  id: number;
  nominal?: number;
  created_at?: string;
  permohonan?: {
    nomor_surat?: string;
    judul?: string;
    unit?: { nama?: string };
  };
  [key: string]: unknown;
}

export const PpDashboard: FC = () => {
  const [stats, setStats] = useState<PpDashboardStats>({});
  const [pengadaanPerluReview, setPengadaanPerluReview] = useState<PengadaanReviewItem[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'bulan' | 'tahun'>('tahun');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    api
      .get<{
        stats?: PpDashboardStats;
        pengadaanPerluReview?: PengadaanReviewItem[];
        recentNotifications?: any[];
        unreadNotificationsCount?: number;
      }>('/v1/pp/dashboard')
      .then((res) => {
        if (!isMounted) return;
        if (res.data.stats) setStats(res.data.stats);
        if (res.data.pengadaanPerluReview) setPengadaanPerluReview(res.data.pengadaanPerluReview);
        if (res.data.recentNotifications) setRecentNotifications(res.data.recentNotifications);
        if (res.data.unreadNotificationsCount !== undefined) {
          setUnreadNotificationsCount(res.data.unreadNotificationsCount);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch PP dashboard data:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const defaultMonthly = [
    { label: 'Jan', disetujui: 145, ditolak: 32 },
    { label: 'Feb', disetujui: 180, ditolak: 44 },
    { label: 'Mar', disetujui: 215, ditolak: 38 },
    { label: 'Apr', disetujui: 165, ditolak: 58 },
    { label: 'Mei', disetujui: 240, ditolak: 52 },
    { label: 'Jun', disetujui: 275, ditolak: 66 },
    { label: 'Jul', disetujui: 225, ditolak: 46 },
    { label: 'Agu', disetujui: 290, ditolak: 74 },
    { label: 'Sep', disetujui: 255, ditolak: 56 },
    { label: 'Okt', disetujui: 305, ditolak: 48 },
    { label: 'Nov', disetujui: 195, ditolak: 36 },
    { label: 'Des', disetujui: 235, ditolak: 42 },
  ];

  const yTicks = [480, 360, 240, 120, 0];

  return (
    <PpLayout
      activeRoute="dashboard"
      notifications={recentNotifications}
      unreadCount={unreadNotificationsCount}
      pendingCount={stats?.menunggu || 4}
    >
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-[24px] bg-[#0E7C5A] p-6 sm:px-9 sm:py-8 text-white shadow-[0_10px_24px_rgba(13,51,38,0.14)] mb-6">
        <div className="relative z-10 max-w-xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/75 mb-1.5">
            DASHBOARD
          </p>
          <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight leading-tight">
            Selamat datang, PP
          </h1>
          <p className="text-xs sm:text-sm text-white/85 mt-1.5 leading-relaxed">
            Review pengadaan dengan nominal Rp50 - 200 jt dalam satu tempat.
          </p>
        </div>
        <div
          className="absolute -right-10 -top-20 w-[280px] h-[280px] rounded-full bg-white/8 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute right-28 -bottom-20 w-[190px] h-[190px] rounded-full bg-white/8 pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-[20px] p-5 border border-[#E4EBE8] shadow-[0_4px_14px_rgba(13,51,38,0.04)]">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#E4F6EC] flex items-center justify-center text-[#0E7C5A]">
              <FileText className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#E4F6EC] text-[#0B7A4E]">
              +2 bulan ini
            </span>
          </div>
          <p className="text-xs text-[#5F6F6A] font-medium mt-4">Total Permohonan</p>
          <p className="text-[28px] font-extrabold text-[#14201C] mt-0.5 leading-tight">
            {stats?.total || 18}
          </p>
        </div>

        <div className="bg-white rounded-[20px] p-5 border border-[#E4EBE8] shadow-[0_4px_14px_rgba(13,51,38,0.04)]">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#E8F0FF] flex items-center justify-center text-[#2F68D6]">
              <Hourglass className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#E8F0FF] text-[#2F68D6]">
              Dalam antrean
            </span>
          </div>
          <p className="text-xs text-[#5F6F6A] font-medium mt-4">Menunggu Persetujuan</p>
          <p className="text-[28px] font-extrabold text-[#14201C] mt-0.5 leading-tight">
            {stats?.menunggu ?? 4}
          </p>
        </div>

        <div className="bg-white rounded-[20px] p-5 border border-[#E4EBE8] shadow-[0_4px_14px_rgba(13,51,38,0.04)]">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#E4F6EC] flex items-center justify-center text-[#0E7C5A]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#E4F6EC] text-[#0B7A4E]">
              +2 bulan ini
            </span>
          </div>
          <p className="text-xs text-[#5F6F6A] font-medium mt-4">Disetujui</p>
          <p className="text-[28px] font-extrabold text-[#14201C] mt-0.5 leading-tight">
            {stats?.disetujui || 12}
          </p>
        </div>

        <div className="bg-white rounded-[20px] p-5 border border-[#E4EBE8] shadow-[0_4px_14px_rgba(13,51,38,0.04)]">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#FDECEC] flex items-center justify-center text-[#E5484D]">
              <XCircle className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FDECEC] text-[#D92D20]">
              Perlu revisi
            </span>
          </div>
          <p className="text-xs text-[#5F6F6A] font-medium mt-4">Ditolak</p>
          <p className="text-[28px] font-extrabold text-[#14201C] mt-0.5 leading-tight">
            {stats?.ditolak || 2}
          </p>
        </div>
      </div>

      {/* Statistik Chart Card */}
      <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5">
          <div>
            <h3 className="text-base font-bold text-[#14201C]">Statistik Permohonan</h3>
            <p className="text-xs text-[#8A9A95] mt-0.5">
              Disetujui vs ditolak per tahun • 2025 - 2026
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-4 text-xs">
              <span className="inline-flex items-center gap-1.5 text-[#5F6F6A]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0E7C5A]" />
                Disetujui <strong className="font-bold text-[#14201C] ml-0.5">327</strong>
              </span>
              <span className="inline-flex items-center gap-1.5 text-[#5F6F6A]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E5484D]" />
                Ditolak <strong className="font-bold text-[#14201C] ml-0.5">41</strong>
              </span>
            </div>

            <div className="inline-flex p-0.5 rounded-xl bg-[#F3F6F5] border border-[#E4EBE8] text-xs">
              <button
                type="button"
                onClick={() => setViewMode('bulan')}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  viewMode === 'bulan'
                    ? 'bg-white text-[#0E7C5A] border border-[#0E7C5A]/30 shadow-2xs'
                    : 'text-[#5F6F6A] hover:text-[#14201C]'
                }`}
              >
                Bulan
              </button>
              <button
                type="button"
                onClick={() => setViewMode('tahun')}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  viewMode === 'tahun'
                    ? 'bg-white text-[#0E7C5A] border border-[#0E7C5A]/30 shadow-2xs'
                    : 'text-[#5F6F6A] hover:text-[#14201C]'
                }`}
              >
                Tahun
              </button>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <div className="relative flex gap-3">
            <div className="flex flex-col justify-between h-52 text-[11px] text-[#8A9A95] font-medium pr-2 select-none pb-6">
              {yTicks.map((tick) => (
                <span key={tick} className="leading-none text-right w-7">
                  {tick}
                </span>
              ))}
            </div>

            <div className="flex-1 relative h-52">
              <div className="absolute inset-0 bottom-6 flex flex-col justify-between pointer-events-none">
                {yTicks.map((tick) => (
                  <div key={tick} className="w-full border-b border-[#F0F4F2]" />
                ))}
              </div>

              <div className="relative z-10 h-full flex items-end justify-between gap-2 sm:gap-4 pt-2">
                {defaultMonthly.map((item, idx) => {
                  const hApprove = Math.round((item.disetujui / 480) * 172);
                  const hReject = Math.round((item.ditolak / 480) * 172);

                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center gap-2 group"
                    >
                      <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-[176px]">
                        <div
                          style={{ height: `${hApprove}px` }}
                          className="w-2.5 sm:w-4 bg-[#99DFC5] group-hover:bg-[#0E7C5A] rounded-t-md transition-all"
                          title={`Disetujui: ${item.disetujui}`}
                        />
                        <div
                          style={{ height: `${hReject}px` }}
                          className="w-2.5 sm:w-4 bg-[#F7B2AD] group-hover:bg-[#E5484D] rounded-t-md transition-all"
                          title={`Ditolak: ${item.ditolak}`}
                        />
                      </div>
                      <span className="text-[11px] font-medium text-[#8A9A95] h-4 leading-none">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Card: Pengadaan Perlu Review */}
      <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5">
          <div>
            <h3 className="text-base font-bold text-[#14201C]">Pengadaan Perlu Review</h3>
            <p className="text-xs text-[#8A9A95] mt-0.5">
              {pengadaanPerluReview.length} pengadaan bernilai Rp50 - 200 juta • diperbarui hari ini
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E8F5EF] text-[#0E7C5A]">
              <Tag className="w-3.5 h-3.5" />
              <span>Rp50 - 200 juta</span>
            </span>
            <Link
              to="/pp/pengajuan"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0E7C5A] hover:underline"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#EEF3F0] text-[11px] font-bold text-[#5F6F6A] uppercase tracking-wider">
                <th className="py-3.5 px-4 rounded-l-xl">No Permohonan</th>
                <th className="py-3.5 px-4">Judul Pengadaan</th>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Nilai Pengadaan</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center rounded-r-xl">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F2] text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#8A9A95]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-[#0E7C5A] border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs text-[#5F6F6A]">Memuat daftar pengadaan...</p>
                    </div>
                  </td>
                </tr>
              ) : pengadaanPerluReview.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#8A9A95]">
                    Tidak ada pengadaan yang menunggu review saat ini.
                  </td>
                </tr>
              ) : (
                pengadaanPerluReview.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F9FBFA] transition-colors">
                    <td className="py-4 px-4 font-bold text-[#0E7C5A]">
                      <Link
                        to={`/pp/pengajuan/${item.id}/review`}
                        className="hover:underline"
                      >
                        {item.permohonan?.nomor_surat || '-'}
                      </Link>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-[#14201C]">
                        {item.permohonan?.judul || '-'}
                      </p>
                      <p className="text-[11px] text-[#8A9A95] mt-0.5">
                        {item.permohonan?.unit?.nama || 'Laboratorium Komputer'}
                      </p>
                    </td>
                    <td className="py-4 px-4 text-[#5F6F6A]">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="py-4 px-4 font-bold text-[#14201C]">
                      {formatCurrency(item.nominal)}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F0FF] text-[#2F68D6]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2F68D6]" />
                        Menunggu Persetujuan
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <RowActionMenu
                        item={item}
                        viewHref={`/pp/pengajuan/${item.id}/review`}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PpLayout>
  );
};

export default PpDashboard;
