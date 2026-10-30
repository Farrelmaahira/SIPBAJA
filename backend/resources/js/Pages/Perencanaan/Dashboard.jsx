import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    LayoutGrid,
    FileText,
    Tag,
    FileSpreadsheet,
    Hourglass,
    CheckCircle2,
    XCircle,
    ArrowRight,
} from 'lucide-react';
import PpLayout from '../../components/templates/PpLayout';
import RowActionMenu from '../../components/organisms/RowActionMenu';

export const PERENCANAAN_NAV_ITEMS = [
    {
        key: 'dashboard',
        label: 'Dashboard',
        icon: LayoutGrid,
        href: '/perencanaan/dashboard',
        badge: null,
    },
    {
        key: 'pengajuan',
        label: 'List Pengajuan',
        icon: FileText,
        href: '/perencanaan/pengajuan',
        badge: 4,
    },
    {
        key: 'mak',
        label: 'Jenis MAK',
        icon: Tag,
        href: '/perencanaan/jenis-mak',
        badge: null,
    },
    {
        key: 'rkakl',
        label: 'Dokumen RKAKL',
        icon: FileSpreadsheet,
        href: '/perencanaan/rkakl',
        badge: null,
    },
];

export default function Dashboard({
    stats,
    permohonanTerbaru = [],
    recentNotifications = [],
    unreadNotificationsCount = 0,
}) {
    const [viewMode, setViewMode] = useState('tahun');

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '12 Okt 2026';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const yearlyData = [
        { label: '2021', disetujui: 165, ditolak: 38 },
        { label: '2022', disetujui: 205, ditolak: 46 },
        { label: '2023', disetujui: 245, ditolak: 52 },
        { label: '2024', disetujui: 280, ditolak: 60 },
        { label: '2025', disetujui: 315, ditolak: 68 },
        { label: '2026', disetujui: 315, ditolak: 68 },
    ];

    const yTicks = [480, 360, 240, 120, 0];

    const getStatusBadge = (status, idx) => {
        if (idx % 2 === 0 || status === 'pengadaan') {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F3E8FF] text-[#7E22CE]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7E22CE]" />
                    Pengadaan
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F0FF] text-[#2F68D6]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2F68D6]" />
                Diajukan
            </span>
        );
    };

    return (
        <PpLayout
            activeRoute="dashboard"
            navItems={PERENCANAAN_NAV_ITEMS}
            roleInitials="PR"
            roleTitle="Perencanaan"
            roleSubtitle="Unit Perencanaan"
            profileHref="/perencanaan/profil"
            notifikasiHref="/perencanaan/notifikasi"
            readAllHref="/perencanaan/notifikasi/read-all"
            notifications={recentNotifications}
            unreadCount={unreadNotificationsCount}
        >
            <Head title="Dashboard Perencanaan - SIPBAJA" />

            {/* Hero Welcome Banner */}
            <div className="relative overflow-hidden rounded-[24px] bg-[#0E7C5A] p-6 sm:px-9 sm:py-8 text-white shadow-[0_10px_24px_rgba(13,51,38,0.14)] mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                    <div className="max-w-xl">
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/75 mb-1.5">
                            DASHBOARD
                        </p>
                        <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight leading-tight">
                            Selamat datang, Tim Perencanaan
                        </h1>
                        <p className="text-xs sm:text-sm text-white/85 mt-1.5 leading-relaxed">
                            Pantau permohonan pengadaan yang masuk, serta kelola Jenis MAK dan Dokumen RKAKL.
                        </p>
                    </div>

                    <Link
                        href="/perencanaan/pengajuan"
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-[#F1F7F4] text-[#0E7C5A] text-xs font-bold shadow-sm transition-colors shrink-0 self-start sm:self-auto"
                    >
                        <FileText className="w-4 h-4" />
                        <span>Lihat Permohonan</span>
                    </Link>
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
                            +3 bulan ini
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
                    <p className="text-xs text-[#5F6F6A] font-medium mt-4">Diajukan</p>
                    <p className="text-[28px] font-extrabold text-[#14201C] mt-0.5 leading-tight">
                        {stats?.diajukan || 2}
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
                    <p className="text-xs text-[#5F6F6A] font-medium mt-4">Selesai</p>
                    <p className="text-[28px] font-extrabold text-[#14201C] mt-0.5 leading-tight">
                        {stats?.selesai || 12}
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
                            Disetujui vs ditolak per tahun ┬╖ 2021ΓÇô2026
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-4 text-xs">
                            <span className="inline-flex items-center gap-1.5 text-[#5F6F6A]">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#0E7C5A]" />
                                Disetujui <strong className="font-bold text-[#14201C] ml-0.5">1529</strong>
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-[#5F6F6A]">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#E5484D]" />
                                Ditolak <strong className="font-bold text-[#14201C] ml-0.5">342</strong>
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

                            <div className="relative z-10 h-full flex items-end justify-around gap-4 pt-2">
                                {yearlyData.map((item, idx) => {
                                    const hApprove = Math.round((item.disetujui / 480) * 172);
                                    const hReject = Math.round((item.ditolak / 480) * 172);

                                    return (
                                        <div
                                            key={idx}
                                            className="flex-1 flex flex-col items-center gap-2 group"
                                        >
                                            <div className="w-full flex items-end justify-center gap-1.5 h-[176px]">
                                                <div
                                                    style={{ height: `${hApprove}px` }}
                                                    className="w-6 sm:w-9 bg-[#99DFC5] group-hover:bg-[#0E7C5A] rounded-t-md transition-all"
                                                />
                                                <div
                                                    style={{ height: `${hReject}px` }}
                                                    className="w-6 sm:w-9 bg-[#F7B2AD] group-hover:bg-[#E5484D] rounded-t-md transition-all"
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

            {/* Table Card: Permohonan Masuk Terbaru */}
            <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5">
                    <div>
                        <h3 className="text-base font-bold text-[#14201C]">Permohonan Masuk Terbaru</h3>
                        <p className="text-xs text-[#8A9A95] mt-0.5">
                            {permohonanTerbaru.length} permohonan aktif ┬╖ diperbarui hari ini
                        </p>
                    </div>

                    <Link
                        href="/perencanaan/pengajuan"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0E7C5A] hover:underline"
                    >
                        <span>Lihat Semua</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#EEF3F0] text-[11px] font-bold text-[#5F6F6A] uppercase tracking-wider">
                                <th className="py-3.5 px-4 rounded-l-xl">No Permohonan</th>
                                <th className="py-3.5 px-4">Judul Pengadaan</th>
                                <th className="py-3.5 px-4">Tanggal</th>
                                <th className="py-3.5 px-4">Nilai Pengajuan</th>
                                <th className="py-3.5 px-4">Status</th>
                                <th className="py-3.5 px-4 text-center rounded-r-xl">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0F4F2] text-xs">
                            {permohonanTerbaru.map((item, idx) => (
                                <tr key={item.id} className="hover:bg-[#F9FBFA] transition-colors">
                                    <td className="py-4 px-4 font-bold text-[#0E7C5A]">
                                        <Link
                                            href={`/perencanaan/pengajuan/${item.id}`}
                                            className="hover:underline"
                                        >
                                            {item.nomor_surat || '-'}
                                        </Link>
                                    </td>
                                    <td className="py-4 px-4 font-bold text-[#14201C]">
                                        {item.judul || '-'}
                                    </td>
                                    <td className="py-4 px-4 text-[#5F6F6A]">
                                        {formatDate(item.created_at)}
                                    </td>
                                    <td className="py-4 px-4 font-bold text-[#14201C]">
                                        {formatCurrency(item.estimasi_anggaran)}
                                    </td>
                                    <td className="py-4 px-4">
                                        {getStatusBadge(item.status, idx)}
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        <RowActionMenu
                                            item={item}
                                            viewHref={`/perencanaan/pengajuan/${item.id}`}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </PpLayout>
    );
}
