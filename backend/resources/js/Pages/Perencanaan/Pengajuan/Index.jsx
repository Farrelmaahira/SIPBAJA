import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Filter, Search } from 'lucide-react';
import PpLayout from '../../../components/templates/PpLayout';
import FilterPengajuanModal from '../../../components/organisms/FilterPengajuanModal';
import RowActionMenu from '../../../components/organisms/RowActionMenu';
import { PERENCANAAN_NAV_ITEMS } from '../Dashboard';

const PERENCANAAN_STATUS_OPTIONS = [
    {
        key: 'diajukan',
        label: 'Diajukan',
        pillClass: 'bg-[#E8F0FF] text-[#2F68D6]',
        dotClass: 'bg-[#2F68D6]',
    },
    {
        key: 'pengadaan',
        label: 'Pengadaan',
        pillClass: 'bg-[#F3E8FF] text-[#7E22CE]',
        dotClass: 'bg-[#7E22CE]',
    },
    {
        key: 'diteruskan',
        label: 'Diteruskan',
        pillClass: 'bg-[#FEF3DC] text-[#9A5B00]',
        dotClass: 'bg-[#9A5B00]',
    },
    {
        key: 'ditolak',
        label: 'Ditolak',
        pillClass: 'bg-[#FDECEC] text-[#D92D20]',
        dotClass: 'bg-[#E5484D]',
    },
    {
        key: 'selesai',
        label: 'Selesai',
        pillClass: 'bg-[#E4F6EC] text-[#0B7A4E]',
        dotClass: 'bg-[#12A06B]',
    },
];

export default function Index({
    permohonan,
    filters = {},
    recentNotifications = [],
    unreadNotificationsCount = 0,
}) {
    const [filterModalOpen, setFilterModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters.q || '');

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get(
            '/perencanaan/pengajuan',
            {
                q: searchQuery,
                statuses: filters.statuses || [],
            },
            { preserveState: true }
        );
    };

    const handleApplyFilter = (statuses) => {
        router.get(
            '/perencanaan/pengajuan',
            {
                q: searchQuery,
                statuses,
            },
            { preserveState: true }
        );
    };

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

    const getStatusBadge = (status, idx) => {
        if (status === 'diajukan' || status === 'menunggu_verifikasi' || idx === 0) {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F0FF] text-[#2F68D6]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2F68D6]" />
                    Diajukan
                </span>
            );
        }
        if (status === 'pengadaan' || idx === 1) {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F3E8FF] text-[#7E22CE]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7E22CE]" />
                    Pengadaan
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF3DC] text-[#9A5B00]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9A5B00]" />
                Diteruskan
            </span>
        );
    };

    const items = permohonan?.data || [];
    const totalCount = permohonan?.total || items.length;

    return (
        <PpLayout
            activeRoute="pengajuan"
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
            <Head title="List Pengajuan Perencanaan - SIPBAJA" />

            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-[24px] bg-[#0E7C5A] p-6 sm:px-9 sm:py-8 text-white shadow-[0_10px_24px_rgba(13,51,38,0.14)] mb-6">
                <div className="relative z-10 max-w-xl">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/75 mb-1.5">
                        DAFTAR PERMOHONAN
                    </p>
                    <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight leading-tight">
                        List Pengajuan
                    </h1>
                    <p className="text-xs sm:text-sm text-white/85 mt-1.5 leading-relaxed">
                        Pantau, cari, dan kelola seluruh permohonan pengadaan Anda.
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

            {/* Main Table Card */}
            <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
                <div className="mb-4">
                    <h3 className="text-base font-bold text-[#14201C]">Daftar Permohonan</h3>
                    <p className="text-xs text-[#8A9A95] mt-0.5">
                        Seluruh permohonan pengadaan yang Anda ajukan
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pb-5">
                    <div className="flex flex-wrap items-center gap-2.5">
                        <button
                            type="button"
                            onClick={() => setFilterModalOpen(true)}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                filters.statuses && filters.statuses.length > 0
                                    ? 'bg-[#E8F5EF] text-[#0E7C5A] border-[#0E7C5A]'
                                    : 'bg-white text-[#14201C] border-[#E4EBE8] hover:bg-[#F4F7F5]'
                            }`}
                        >
                            <Filter className="w-3.5 h-3.5" />
                            <span>Filter</span>
                        </button>

                        <form onSubmit={handleSearchSubmit} className="relative">
                            <Search className="w-4 h-4 text-[#8A9A95] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari nomor atau judul..."
                                className="w-64 sm:w-72 pl-10 pr-4 py-2.5 rounded-xl border border-[#E4EBE8] text-xs text-[#14201C] focus:ring-2 focus:ring-[#0E7C5A] focus:border-transparent outline-none bg-white placeholder-[#8A9A95]"
                            />
                        </form>
                    </div>

                    <span className="text-xs text-[#8A9A95] font-medium">
                        {totalCount} permohonan
                    </span>
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
                            {items.map((item, idx) => {
                                const modeParam =
                                    idx === 0
                                        ? '?mode=diajukan'
                                        : idx === 1
                                          ? '?mode=pengadaan'
                                          : '?mode=diteruskan';
                                return (
                                    <tr key={item.id} className="hover:bg-[#F9FBFA] transition-colors">
                                        <td className="py-4 px-4 font-bold text-[#0E7C5A]">
                                            <Link
                                                href={`/perencanaan/pengajuan/${item.id}${modeParam}`}
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
                                                viewHref={`/perencanaan/pengajuan/${item.id}${modeParam}`}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t border-[#F0F4F2] text-xs text-[#8A9A95]">
                    <p>
                        Menampilkan {permohonan?.from || 1}-{permohonan?.to || items.length} dari{' '}
                        {permohonan?.total || items.length} permohonan
                    </p>
                    <div className="flex items-center gap-1">
                        <span className="w-8 h-8 rounded-lg flex items-center justify-center text-[#CFDBD5]">
                            ΓÇ╣
                        </span>
                        <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#0E7C5A] text-white font-bold">
                            1
                        </span>
                        <span className="w-8 h-8 rounded-lg flex items-center justify-center text-[#CFDBD5]">
                            ΓÇ║
                        </span>
                    </div>
                </div>
            </div>

            <FilterPengajuanModal
                isOpen={filterModalOpen}
                onClose={() => setFilterModalOpen(false)}
                selectedStatuses={filters.statuses || []}
                onApply={handleApplyFilter}
                options={PERENCANAAN_STATUS_OPTIONS}
            />
        </PpLayout>
    );
}
