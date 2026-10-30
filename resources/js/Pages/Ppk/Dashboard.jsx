import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    LayoutGrid,
    FileText,
    Clock,
    CheckCircle2,
    XCircle,
    ArrowRight,
} from 'lucide-react';
import PpLayout from '../../components/templates/PpLayout';
import RowActionMenu from '../../components/organisms/RowActionMenu';
import { formatRupiah, formatTanggal } from '../../utils/formatters';

export const PPK_NAV_ITEMS = [
    {
        key: 'dashboard',
        label: 'Dashboard',
        href: '/ppk/dashboard',
        icon: LayoutGrid,
    },
    {
        key: 'pengajuan',
        label: 'List Pengajuan',
        href: '/ppk/pengajuan',
        icon: FileText,
        badge: 4,
    },
];

const MONTHLY_CHART_DATA = [
    { month: 'Jan', count: 310 },
    { month: 'Feb', count: 165 },
    { month: 'Mar', count: 255 },
    { month: 'Apr', count: 130 },
    { month: 'Mei', count: 205 },
    { month: 'Jun', count: 390 },
    { month: 'Jul', count: 295 },
    { month: 'Agu', count: 470, highlight: true },
    { month: 'Sep', count: 180 },
    { month: 'Okt', count: 250 },
    { month: 'Nov', count: 345 },
    { month: 'Des', count: 95 },
];

const FALLBACK_ROWS = [
    {
        id: 1,
        nomor_surat: '009/PNJ/2026',
        judul: 'Pengadaan Kursi Kuliah',
        unit: 'Jurusan Teknik Sipil',
        tanggal: '2026-04-02',
        nominal: 45000000,
        status: 'menunggu_persetujuan',
    },
    {
        id: 2,
        nomor_surat: '008/PNJ/2026',
        judul: 'Pengadaan Alat Ukur Tanah',
        unit: 'Jurusan Teknik Sipil',
        tanggal: '2026-03-30',
        nominal: 62000000,
        status: 'menunggu_persetujuan',
    },
    {
        id: 3,
        nomor_surat: '007/PNJ/2026',
        judul: 'Pengadaan Kamera Dokumentasi',
        unit: 'Humas PNJ',
        tanggal: '2026-03-28',
        nominal: 28000000,
        status: 'disetujui',
    },
    {
        id: 4,
        nomor_surat: '006/PNJ/2026',
        judul: 'Pengadaan Lisensi Software',
        unit: 'UPT Komputer',
        tanggal: '2026-03-26',
        nominal: 19500000,
        status: 'ditolak',
    },
];

export default function Dashboard({
    stats = {},
    pengajuanTerbaru = [],
    recentNotifications = [],
    unreadNotificationsCount = 0,
}) {
    const [hoveredBar, setHoveredBar] = useState(7);

    const total = stats.total || 18;
    const menunggu = stats.menunggu || 2;
    const disetujui = stats.disetujui || 12;
    const ditolak = stats.ditolak || 2;

    const dbRows = (pengajuanTerbaru || []).map((item, idx) => {
        const fb = FALLBACK_ROWS[idx % FALLBACK_ROWS.length];
        return {
            id: item.id,
            nomor_surat: item.permohonan?.nomor_surat || fb.nomor_surat,
            judul: item.permohonan?.judul || fb.judul,
            unit: item.permohonan?.unit?.nama || fb.unit,
            tanggal: item.created_at || fb.tanggal,
            nominal: item.nilai_kontrak || item.permohonan?.nominal || fb.nominal,
            status: idx === 0 || idx === 1 ? 'menunggu_persetujuan' : item.status || fb.status,
        };
    });

    const rows = dbRows.length > 0 ? dbRows : FALLBACK_ROWS;

    const getDetailHref = (row) => {
        if (row.status === 'menunggu_persetujuan') {
            return `/ppk/pengajuan/${row.id}/review`;
        }
        if (row.status === 'review_pembayaran' || row.status === 'diteruskan') {
            return `/ppk/pengajuan/${row.id}/pembayaran`;
        }
        return `/ppk/pengajuan/${row.id}`;
    };

    const renderStatusBadge = (status) => {
        if (status === 'menunggu_persetujuan') {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF3DC] text-[#9A5B00]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                    Menunggu Persetujuan
                </span>
            );
        }
        if (status === 'review_pembayaran' || status === 'diteruskan') {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EFF6FF] text-[#1D4ED8]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
                    Review Pembayaran
                </span>
            );
        }
        if (status === 'ditolak') {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FDECEC] text-[#D92D20]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E5484D]" />
                    Ditolak
                </span>
            );
        }
        if (status === 'selesai') {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E4F6EC] text-[#0B7A4E]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#12A06B]" />
                    Selesai
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E4F6EC] text-[#0B7A4E]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#12A06B]" />
                Disetujui
            </span>
        );
    };

    return (
        <PpLayout
            activeRoute="dashboard"
            navItems={PPK_NAV_ITEMS}
            roleInitials="PPK"
            roleTitle="PPK"
            roleSubtitle="Pejabat Pembuat Komitmen"
            profileHref="/ppk/profil"
            notifikasiHref="/ppk/notifikasi"
            readAllHref="/ppk/notifikasi/read-all"
            notifications={recentNotifications}
            unreadCount={unreadNotificationsCount}
        >
            <Head title="Dashboard PPK - SIPBAJA" />

            {/* Hero Welcome Banner */}
            <div className="relative overflow-hidden rounded-[24px] bg-[#0E7C5A] p-6 sm:px-9 sm:py-8 text-white shadow-[0_10px_24px_rgba(13,51,38,0.14)] mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                    <div className="max-w-xl">
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/75 mb-1.5">
                            DASHBOARD
                        </p>
                        <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight leading-tight">
                            Selamat datang, PPK
                        </h1>
                        <p className="text-xs sm:text-sm text-white/85 mt-1.5 leading-relaxed">
                            Tinjau dan berikan keputusan atas permohonan pengadaan yang masuk.
                        </p>
                    </div>

                    <Link
                        href="/ppk/pengajuan"
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-[#F1F7F4] text-[#0E7C5A] text-xs font-bold shadow-sm transition-colors shrink-0 self-start sm:self-auto"
                    >
                        <FileText className="w-4 h-4" />
                        <span>Lihat Pengajuan</span>
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
                    <p className="text-xs text-[#5F6F6A] font-medium mt-4">Total Pengajuan</p>
                    <p className="text-3xl font-extrabold text-[#14201C] mt-1">{total}</p>
                    <p className="text-[11px] text-[#8A9A95] mt-1">Seluruh permohonan masuk</p>
                </div>

                <div className="bg-white rounded-[20px] p-5 border border-[#E4EBE8] shadow-[0_4px_14px_rgba(13,51,38,0.04)]">
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-[#FEF3DC] flex items-center justify-center text-[#9A5B00]">
                            <Clock className="w-5 h-5" />
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FEF3DC] text-[#9A5B00]">
                            Perlu ditindak
                        </span>
                    </div>
                    <p className="text-xs text-[#5F6F6A] font-medium mt-4">Menunggu Review</p>
                    <p className="text-3xl font-extrabold text-[#14201C] mt-1">{menunggu}</p>
                    <p className="text-[11px] text-[#8A9A95] mt-1">Menunggu keputusan PPK</p>
                </div>

                <div className="bg-white rounded-[20px] p-5 border border-[#E4EBE8] shadow-[0_4px_14px_rgba(13,51,38,0.04)]">
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-[#E4F6EC] flex items-center justify-center text-[#0E7C5A]">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#E4F6EC] text-[#0B7A4E]">
                            78% selesai
                        </span>
                    </div>
                    <p className="text-xs text-[#5F6F6A] font-medium mt-4">Disetujui</p>
                    <p className="text-3xl font-extrabold text-[#14201C] mt-1">{disetujui}</p>
                    <p className="text-[11px] text-[#8A9A95] mt-1">Telah ditandatangani PPK</p>
                </div>

                <div className="bg-white rounded-[20px] p-5 border border-[#E4EBE8] shadow-[0_4px_14px_rgba(13,51,38,0.04)]">
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-[#FDECEC] flex items-center justify-center text-[#D92D20]">
                            <XCircle className="w-5 h-5" />
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FDECEC] text-[#D92D20]">
                            Dikembalikan
                        </span>
                    </div>
                    <p className="text-xs text-[#5F6F6A] font-medium mt-4">Ditolak</p>
                    <p className="text-3xl font-extrabold text-[#14201C] mt-1">{ditolak}</p>
                    <p className="text-[11px] text-[#8A9A95] mt-1">Dikembalikan ke PPBJ</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Bar Chart */}
                <div className="lg:col-span-2 bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-[15px] font-bold text-[#14201C]">Total Pengajuan per Bulan</h2>
                            <p className="text-xs text-[#8A9A95] mt-0.5">Periode Januari - Desember 2026</p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E4F6EC] text-[#0B7A4E]">
                            180 Pengajuan
                        </span>
                    </div>

                    <div className="relative h-56 flex">
                        <div className="flex flex-col justify-between text-[11px] text-[#9AA8A3] pr-3 pb-6 select-none">
                            <span>480</span>
                            <span>360</span>
                            <span>240</span>
                            <span>120</span>
                            <span>0</span>
                        </div>

                        <div className="flex-1 relative flex items-end justify-between gap-2 pb-6 pt-2 border-b border-[#EEF3F0]">
                            <div className="absolute inset-0 bottom-6 flex flex-col justify-between pointer-events-none">
                                {[0, 1, 2, 3, 4].map((line) => (
                                    <div key={line} className="w-full border-t border-dashed border-[#EEF3F0]" />
                                ))}
                            </div>

                            {MONTHLY_CHART_DATA.map((item, idx) => {
                                const heightPct = Math.round((item.count / 480) * 100);
                                const isActive = hoveredBar === idx;
                                return (
                                    <div
                                        key={item.month}
                                        onMouseEnter={() => setHoveredBar(idx)}
                                        className="relative flex-1 flex flex-col items-center h-full justify-end group cursor-pointer z-10"
                                    >
                                        {isActive && (
                                            <div className="absolute -top-6 px-2 py-0.5 rounded-md bg-[#0E7C5A] text-white text-[10px] font-bold shadow-xs">
                                                {item.count}
                                            </div>
                                        )}
                                        <div
                                            style={{ height: `${heightPct}%` }}
                                            className={`w-full max-w-[34px] rounded-t-lg transition-all duration-200 ${
                                                isActive ? 'bg-[#0E7C5A]' : 'bg-[#CBE7DC] group-hover:bg-[#8FD1B6]'
                                            }`}
                                        />
                                        <span
                                            className={`absolute -bottom-5 text-[11px] ${
                                                isActive ? 'font-bold text-[#0E7C5A]' : 'text-[#8A9A95]'
                                            }`}
                                        >
                                            {item.month}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Donut Chart */}
                <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] flex flex-col justify-between">
                    <div>
                        <h2 className="text-[15px] font-bold text-[#14201C]">Status Permohonan</h2>
                        <p className="text-xs text-[#8A9A95] mt-0.5">Distribusi saat ini</p>
                    </div>

                    <div className="my-5 flex items-center justify-center">
                        <div
                            className="w-36 h-36 rounded-full flex items-center justify-center relative"
                            style={{
                                background:
                                    'conic-gradient(#0E7C5A 0% 67%, #F59E0B 67% 89%, #EF4444 89% 100%)',
                            }}
                        >
                            <div className="w-24 h-24 rounded-full bg-white flex flex-col items-center justify-center">
                                <span className="text-2xl font-extrabold text-[#14201C] leading-none">{total}</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A9A95] mt-1">
                                    TOTAL
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2.5 text-xs">
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-[#5F6F6A]">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#0E7C5A]" />
                                Disetujui
                            </span>
                            <span className="font-bold text-[#14201C]">{disetujui}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-[#5F6F6A]">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                                Menunggu Review
                            </span>
                            <span className="font-bold text-[#14201C]">4</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-[#5F6F6A]">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                                Ditolak
                            </span>
                            <span className="font-bold text-[#14201C]">{ditolak}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pengajuan Masuk Terbaru */}
            <div className="bg-white rounded-[22px] border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] overflow-hidden">
                <div className="px-6 py-5 border-b border-[#F0F4F2] flex items-center justify-between">
                    <div>
                        <h2 className="text-[15px] font-bold text-[#14201C]">Pengajuan Masuk Terbaru</h2>
                        <p className="text-xs text-[#8A9A95] mt-0.5">Permohonan yang membutuhkan tindakan PPK</p>
                    </div>
                    <Link
                        href="/ppk/pengajuan"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E4EBE8] hover:bg-[#F4F7F5] text-xs font-bold text-[#0E7C5A] transition"
                    >
                        <span>Lihat Semua</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#EEF3F0] border-b border-[#E2EAE6] text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                                <th className="py-3.5 px-6">NOMOR SURAT</th>
                                <th className="py-3.5 px-4">JUDUL PENGADAAN</th>
                                <th className="py-3.5 px-4">UNIT PEMOHON</th>
                                <th className="py-3.5 px-4">TANGGAL</th>
                                <th className="py-3.5 px-4">NOMINAL</th>
                                <th className="py-3.5 px-4">STATUS</th>
                                <th className="py-3.5 px-6 text-center">AKSI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0F4F2] text-xs">
                            {rows.map((row) => (
                                <tr key={row.id} className="hover:bg-[#FAFDFB] transition">
                                    <td className="py-4 px-6 font-bold text-[#0E7C5A]">{row.nomor_surat}</td>
                                    <td className="py-4 px-4 font-bold text-[#14201C]">{row.judul}</td>
                                    <td className="py-4 px-4 text-[#5F6F6A]">{row.unit}</td>
                                    <td className="py-4 px-4 text-[#5F6F6A]">{formatTanggal(row.tanggal)}</td>
                                    <td className="py-4 px-4 font-bold text-[#14201C]">{formatRupiah(row.nominal)}</td>
                                    <td className="py-4 px-4">{renderStatusBadge(row.status)}</td>
                                    <td className="py-4 px-6 text-center">
                                        <RowActionMenu detailHref={getDetailHref(row)} />
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
