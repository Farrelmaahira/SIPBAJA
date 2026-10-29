import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Clock,
    CheckCircle2,
    XCircle,
} from 'lucide-react';
import PpLayout from '../../../components/templates/PpLayout';

export default function Index({
    notifications,
    unreadCount = 0,
    activeTab = 'semua',
    basePath = '/pp',
    roleInitials = 'PP',
    roleTitle = null,
    roleSubtitle = null,
    navItems = null,
}) {
    const items = notifications?.data || [];

    const handleTabChange = (tab) => {
        router.get(`${basePath}/notifikasi`, { tab }, { preserveState: true });
    };

    const handleMarkAllRead = () => {
        router.post(`${basePath}/notifikasi/read-all`, {}, { preserveScroll: true });
    };

    const getIcon = (item) => {
        const j = item.judul?.toLowerCase() || '';
        if (j.includes('pengingat')) {
            return (
                <div className="w-10 h-10 rounded-xl bg-[#FEF3DC] flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-[#9A5B00]" />
                </div>
            );
        }
        if (j.includes('ditolak') || j.includes('dikembalikan')) {
            return (
                <div className="w-10 h-10 rounded-xl bg-[#FEE4E2] flex items-center justify-center shrink-0">
                    <XCircle className="w-5 h-5 text-[#D92D20]" />
                </div>
            );
        }
        return (
            <div className="w-10 h-10 rounded-xl bg-[#DDF3E8] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-[#0E7C5A]" />
            </div>
        );
    };

    // Kelompokkan notifikasi menjadi HARI INI, KEMARIN, SEBELUMNYA seperti referensi UI/UX
    const hariIni = items.slice(0, 2);
    const kemarin = items.slice(2, 5);
    const sebelumnya = items.slice(5);

    const renderItem = (item) => {
        const isUnread = !item.read_at;
        return (
            <div
                key={item.id}
                className={`flex items-start gap-3.5 p-4 rounded-2xl transition-colors ${
                    isUnread ? 'bg-[#EAF6F1]' : 'bg-white hover:bg-[#F8FAF9]'
                }`}
            >
                {getIcon(item)}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-[#14201C] leading-snug">
                            {item.judul}
                        </p>
                        {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-[#0E7C5A] mt-1 shrink-0" />
                        )}
                    </div>
                    <p className="text-xs text-[#5F6F6A] mt-0.5 leading-relaxed">
                        {item.pesan}
                    </p>
                    <span className="text-[11px] text-[#8A9A95] mt-1 inline-block">
                        {item.created_at
                            ? new Date(item.created_at).toLocaleDateString('id-ID', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                              })
                            : '2 jam lalu'}
                    </span>
                </div>
            </div>
        );
    };

    return (
        <PpLayout
            activeRoute="dashboard"
            unreadCount={unreadCount}
            roleInitials={roleInitials}
            roleTitle={roleTitle}
            roleSubtitle={roleSubtitle}
            navItems={navItems}
            profileHref={`${basePath}/profil`}
            notifikasiHref={`${basePath}/notifikasi`}
            readAllHref={`${basePath}/notifikasi/read-all`}
        >
            <Head title="Semua Notifikasi - SIPBAJA" />

            {/* Hero Top Banner */}
            <div className="relative overflow-hidden rounded-[24px] bg-[#0E7C5A] p-6 sm:px-9 sm:py-7 text-white shadow-[0_10px_24px_rgba(13,51,38,0.14)] mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                    <div>
                        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/75 block mb-1">
                            NOTIFIKASI
                        </span>
                        <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight">
                            Semua Notifikasi
                        </h1>
                        <p className="text-xs text-white/85 mt-1.5">
                            Pengingat waktu dan pembaruan status pengadaan Anda dalam satu tempat.
                        </p>
                    </div>

                    <Link
                        href={`${basePath}/dashboard`}
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

            {/* Main Notification Card */}
            <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
                {/* Filter Tabs & Mark All Read inside card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#F0F4F2]">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => handleTabChange('semua')}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                                activeTab === 'semua'
                                    ? 'bg-[#EAF6F1] text-[#0E7C5A] border-[#0E7C5A]'
                                    : 'bg-white border-[#E4EBE8] text-[#5F6F6A] hover:bg-[#F4F7F5]'
                            }`}
                        >
                            Semua &middot; {notifications?.total || items.length || 8}
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTabChange('pengingat')}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                                activeTab === 'pengingat'
                                    ? 'bg-[#EAF6F1] text-[#0E7C5A] border-[#0E7C5A]'
                                    : 'bg-white border-[#E4EBE8] text-[#5F6F6A] hover:bg-[#F4F7F5]'
                            }`}
                        >
                            Pengingat &middot; 3
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTabChange('status')}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                                activeTab === 'status'
                                    ? 'bg-[#EAF6F1] text-[#0E7C5A] border-[#0E7C5A]'
                                    : 'bg-white border-[#E4EBE8] text-[#5F6F6A] hover:bg-[#F4F7F5]'
                            }`}
                        >
                            Status &middot; 5
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="px-4 py-2 rounded-xl bg-white border border-[#E4EBE8] text-xs font-bold text-[#14201C] hover:bg-[#F4F7F5] transition-colors cursor-pointer self-start sm:self-auto"
                    >
                        Tandai semua dibaca
                    </button>
                </div>

                {/* Grouped List */}
                {items.length === 0 ? (
                    <div className="py-12 text-center text-xs text-[#8A9A95]">
                        Tidak ada notifikasi pada kategori ini.
                    </div>
                ) : (
                    <div className="pt-5 space-y-6">
                        {hariIni.length > 0 && (
                            <div>
                                <p className="text-[11px] font-bold text-[#8A9A95] uppercase tracking-wider mb-3">
                                    HARI INI
                                </p>
                                <div className="space-y-2.5">{hariIni.map(renderItem)}</div>
                            </div>
                        )}

                        {kemarin.length > 0 && (
                            <div>
                                <p className="text-[11px] font-bold text-[#8A9A95] uppercase tracking-wider mb-3">
                                    KEMARIN
                                </p>
                                <div className="space-y-2.5">{kemarin.map(renderItem)}</div>
                            </div>
                        )}

                        {sebelumnya.length > 0 && (
                            <div>
                                <p className="text-[11px] font-bold text-[#8A9A95] uppercase tracking-wider mb-3">
                                    SEBELUMNYA
                                </p>
                                <div className="space-y-2.5">{sebelumnya.map(renderItem)}</div>
                            </div>
                        )}
                    </div>
                )}

                {/* Pagination Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 mt-6 border-t border-[#F0F4F2] text-xs text-[#8A9A95]">
                    <p>
                        Menampilkan {notifications?.from || 1}-{notifications?.to || items.length} dari{' '}
                        {notifications?.total || items.length} permohonan
                    </p>
                    <div className="flex items-center gap-1">
                        <span className="w-8 h-8 rounded-lg flex items-center justify-center text-[#CFDBD5]">
                            ‹
                        </span>
                        <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#0E7C5A] text-white font-bold">
                            1
                        </span>
                        <span className="w-8 h-8 rounded-lg flex items-center justify-center text-[#CFDBD5]">
                            ›
                        </span>
                    </div>
                </div>
            </div>
        </PpLayout>
    );
}
