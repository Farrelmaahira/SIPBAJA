import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { CheckCheck, Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function NotificationDropdown({
    isOpen,
    onClose,
    notifications = [],
    unreadCount = 0,
    notifikasiHref = '/pp/notifikasi',
    readAllHref = '/pp/notifikasi/read-all',
}) {
    const [tab, setTab] = useState('semua');

    if (!isOpen) return null;

    const filtered = notifications.filter((item) => {
        if (tab === 'pengingat') return item.judul?.toLowerCase().includes('pengingat');
        if (tab === 'status') {
            const j = item.judul?.toLowerCase() || '';
            return j.includes('status') || j.includes('disetujui') || j.includes('ditolak') || j.includes('verifikasi') || j.includes('dikembalikan');
        }
        return true;
    });

    const handleMarkAllRead = () => {
        router.post(readAllHref, {}, {
            preserveScroll: true,
        });
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

    return (
        <div className="absolute right-0 top-12 w-96 rounded-[24px] bg-white border border-[#E4EBE8] shadow-[0_16px_40px_rgba(13,51,38,0.14)] z-50 overflow-hidden animate-scale-up">
            <div className="p-5 pb-3.5 border-b border-[#F0F4F2]">
                <div className="flex items-start justify-between">
                    <div>
                        <h4 className="text-[17px] font-bold text-[#14201C] leading-tight">
                            Notifikasi
                        </h4>
                        <p className="text-xs text-[#8A9A95] mt-0.5">
                            {unreadCount} belum dibaca
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E7C5A] hover:underline cursor-pointer mt-0.5"
                    >
                        <CheckCheck className="w-4 h-4" />
                        <span>Tandai semua dibaca</span>
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 mt-4">
                    <button
                        type="button"
                        onClick={() => setTab('semua')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                            tab === 'semua'
                                ? 'bg-[#EAF6F1] text-[#0E7C5A] border-[#0E7C5A]'
                                : 'bg-white text-[#5F6F6A] border-[#E4EBE8] hover:bg-[#F4F7F5]'
                        }`}
                    >
                        Semua
                    </button>
                    <button
                        type="button"
                        onClick={() => setTab('pengingat')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                            tab === 'pengingat'
                                ? 'bg-[#EAF6F1] text-[#0E7C5A] border-[#0E7C5A]'
                                : 'bg-white text-[#5F6F6A] border-[#E4EBE8] hover:bg-[#F4F7F5]'
                        }`}
                    >
                        Pengingat
                    </button>
                    <button
                        type="button"
                        onClick={() => setTab('status')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                            tab === 'status'
                                ? 'bg-[#EAF6F1] text-[#0E7C5A] border-[#0E7C5A]'
                                : 'bg-white text-[#5F6F6A] border-[#E4EBE8] hover:bg-[#F4F7F5]'
                        }`}
                    >
                        Status
                    </button>
                </div>
            </div>

            <div className="max-h-[380px] overflow-y-auto p-3 space-y-2">
                {filtered.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#8A9A95]">
                        Tidak ada notifikasi pada kategori ini.
                    </div>
                ) : (
                    filtered.map((item) => {
                        const isUnread = !item.read_at;
                        return (
                            <div
                                key={item.id}
                                className={`flex items-start gap-3.5 p-3.5 rounded-2xl transition-colors ${
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
                                    <p className="text-[11px] text-[#5F6F6A] mt-0.5 leading-relaxed">
                                        {item.pesan}
                                    </p>
                                    <span className="text-[11px] text-[#8A9A95] mt-1.5 inline-block">
                                        {item.waktu || (item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '2 jam lalu')}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="py-3 px-4 border-t border-[#F0F4F2] text-center bg-white">
                <Link
                    href={notifikasiHref}
                    onClick={onClose}
                    className="text-xs font-bold text-[#0E7C5A] hover:underline inline-block"
                >
                    Lihat semua notifikasi
                </Link>
            </div>
        </div>
    );
}
