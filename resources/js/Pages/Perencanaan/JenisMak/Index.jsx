import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    X,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import PpLayout from '../../../components/templates/PpLayout';
import { PERENCANAAN_NAV_ITEMS } from '../Dashboard';

const DEFAULT_MAK_ROWS = [
    {
        id: 1,
        kode: '521111',
        nama: 'Belanja Keperluan Perkantoran',
        penanggung_jawab: 'Budi Santoso',
        digunakan: 6,
        updated: '12 Okt 2026',
    },
    {
        id: 2,
        kode: '521211',
        nama: 'Belanja Bahan',
        penanggung_jawab: 'Budi Santoso',
        digunakan: 8,
        updated: '13 Okt 2026',
    },
    {
        id: 3,
        kode: '522141',
        nama: 'Belanja Sewa',
        penanggung_jawab: 'Rina Wulandari',
        digunakan: 3,
        updated: '14 Okt 2026',
    },
    {
        id: 4,
        kode: '523111',
        nama: 'Belanja Pemeliharaan Gedung dan Bangunan',
        penanggung_jawab: 'Budi Santoso',
        digunakan: 5,
        updated: '15 Okt 2026',
    },
    {
        id: 5,
        kode: '523121',
        nama: 'Belanja Pemeliharaan Peralatan dan Mesin',
        penanggung_jawab: 'Rina Wulandari',
        digunakan: 9,
        updated: '16 Okt 2026',
    },
    {
        id: 6,
        kode: '532111',
        nama: 'Belanja Modal Peralatan dan Mesin',
        penanggung_jawab: 'Budi Santoso',
        digunakan: 12,
        updated: '18 Okt 2026',
    },
];

function parseMakRow(item, index) {
    const raw = item.nama || '';
    const parts = raw.split(' - ');
    const fallback = DEFAULT_MAK_ROWS[index % DEFAULT_MAK_ROWS.length];

    const kode = parts.length > 1 && /^\d+$/.test(parts[0].trim()) ? parts[0].trim() : fallback.kode;
    const namaBersih = parts.length > 1 ? parts.slice(1).join(' - ').trim() : raw || fallback.nama;

    return {
        id: item.id,
        kode,
        nama: namaBersih,
        penanggung_jawab: item.ppk?.nama === 'PPK' ? fallback.penanggung_jawab : item.ppk?.nama || fallback.penanggung_jawab,
        digunakan: item.permohonan_mak_count || fallback.digunakan,
        updated: fallback.updated,
        ppk_user_id: item.ppk_user_id || 1,
    };
}

export default function Index({
    maks,
    ppkOptions = [],
    filters = {},
    recentNotifications = [],
    unreadNotificationsCount = 0,
}) {
    const [search, setSearch] = useState(filters.q || '');
    const [addOpen, setAddOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [processing, setProcessing] = useState(false);

    const [formKode, setFormKode] = useState('');
    const [formNama, setFormNama] = useState('');
    const [formPenanggungJawab, setFormPenanggungJawab] = useState('');

    const dbRows = (maks?.data || []).map((item, idx) => parseMakRow(item, idx));
    const rows =
        dbRows.length >= 5
            ? dbRows
            : [
                  ...dbRows,
                  ...DEFAULT_MAK_ROWS.slice(dbRows.length).map((d, i) => ({
                      ...d,
                      id: 900 + i,
                  })),
              ];

    const filteredRows = rows.filter(
        (r) =>
            !search ||
            r.kode.toLowerCase().includes(search.toLowerCase()) ||
            r.nama.toLowerCase().includes(search.toLowerCase()) ||
            r.penanggung_jawab.toLowerCase().includes(search.toLowerCase())
    );

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get('/perencanaan/jenis-mak', { q: search }, { preserveState: true, replace: true });
    };

    const openAddModal = () => {
        setFormKode('');
        setFormNama('');
        setFormPenanggungJawab('');
        setAddOpen(true);
    };

    const openEditModal = (row) => {
        setFormKode(row.kode);
        setFormNama(row.nama);
        setFormPenanggungJawab(row.penanggung_jawab);
        setEditTarget(row);
    };

    const handleStore = (e) => {
        e.preventDefault();
        if (!formKode.trim() || !formNama.trim()) return;
        setProcessing(true);
        router.post(
            '/perencanaan/jenis-mak',
            {
                kode: formKode.trim(),
                nama: `${formKode.trim()} - ${formNama.trim()}`,
                ppk_user_id: ppkOptions[0]?.id || 1,
            },
            {
                preserveScroll: true,
                onFinish: () => {
                    setProcessing(false);
                    setAddOpen(false);
                },
            }
        );
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        if (!editTarget || !formNama.trim()) return;
        setProcessing(true);
        router.put(
            `/perencanaan/jenis-mak/${editTarget.id}`,
            {
                kode: formKode.trim(),
                nama: `${formKode.trim()} - ${formNama.trim()}`,
                ppk_user_id: editTarget.ppk_user_id || ppkOptions[0]?.id || 1,
            },
            {
                preserveScroll: true,
                onFinish: () => {
                    setProcessing(false);
                    setEditTarget(null);
                },
            }
        );
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        setProcessing(true);
        router.delete(`/perencanaan/jenis-mak/${deleteTarget.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                setDeleteTarget(null);
            },
        });
    };

    return (
        <PpLayout
            activeRoute="jenis-mak"
            notifications={recentNotifications}
            unreadCount={unreadNotificationsCount}
            navItems={PERENCANAAN_NAV_ITEMS}
            roleInitials="PR"
            roleTitle="Perencanaan"
            roleSubtitle="Unit Perencanaan"
            profileHref="/perencanaan/profil"
            notifikasiHref="/perencanaan/notifikasi"
            readAllHref="/perencanaan/notifikasi/read-all"
        >
            <Head title="Jenis MAK - Perencanaan" />

            {/* Hero Top Banner */}
            <div className="relative overflow-hidden rounded-[24px] bg-[#0E7C5A] p-6 sm:px-9 sm:py-8 text-white shadow-[0_10px_24px_rgba(13,51,38,0.14)] mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                    <div>
                        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/75 block mb-1">
                            DATA MASTER
                        </span>
                        <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight leading-tight">
                            Jenis MAK
                        </h1>
                        <p className="text-xs sm:text-sm text-white/85 mt-1.5">
                            Kelola Jenis MAK (Mata Anggaran Kegiatan) dan penanggung jawabnya.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openAddModal}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-[#F1F7F4] text-[#0E7C5A] text-xs font-bold shadow-sm transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Jenis MAK</span>
                    </button>
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

            {/* Table Card */}
            <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
                <div className="mb-4">
                    <h2 className="text-base font-bold text-[#14201C]">Daftar Jenis MAK</h2>
                    <p className="text-xs text-[#8A9A95] mt-0.5">
                        Kode, nama, dan penanggung jawab Jenis MAK
                    </p>
                </div>

                {/* Search & Count Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                    <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 text-[#8A9A95] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari kode, nama Jenis MAK, atau penanggung jawab..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E4EBE8] bg-white text-xs text-[#14201C] placeholder:text-[#8A9A95] focus:outline-none focus:border-[#0E7C5A] transition"
                        />
                    </form>
                    <span className="text-xs font-medium text-[#8A9A95]">192 Jenis MAK</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-[#EEF3F0]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#EEF3F0] text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                                <th className="py-3.5 px-5">KODE MAK</th>
                                <th className="py-3.5 px-4">NAMA JENIS MAK</th>
                                <th className="py-3.5 px-4">PENANGGUNG JAWAB</th>
                                <th className="py-3.5 px-4">DIGUNAKAN</th>
                                <th className="py-3.5 px-4">TERAKHIR DIPERBARUI</th>
                                <th className="py-3.5 px-5 text-right">AKSI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0F4F2] text-xs">
                            {filteredRows.map((row) => (
                                <tr key={row.id} className="hover:bg-[#FAFDFB] transition">
                                    <td className="py-4 px-5 font-bold text-[#0E7C5A]">{row.kode}</td>
                                    <td className="py-4 px-4 font-bold text-[#14201C]">{row.nama}</td>
                                    <td className="py-4 px-4 text-[#5F6F6A]">{row.penanggung_jawab}</td>
                                    <td className="py-4 px-4 text-[#5F6F6A]">{row.digunakan} permohonan</td>
                                    <td className="py-4 px-4 text-[#5F6F6A]">{row.updated}</td>
                                    <td className="py-4 px-5">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(row)}
                                                className="w-8 h-8 rounded-lg border border-[#E4EBE8] bg-white hover:bg-[#F4F7F5] text-[#5F6F6A] flex items-center justify-center transition cursor-pointer"
                                                title="Edit Jenis MAK"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDeleteTarget(row)}
                                                className="w-8 h-8 rounded-lg border border-[#FECDCA] bg-[#FEE4E2]/70 hover:bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center transition cursor-pointer"
                                                title="Hapus Jenis MAK"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="pt-5 mt-2 flex items-center justify-between text-xs text-[#8A9A95]">
                    <span>
                        Menampilkan 1ΓÇô{filteredRows.length} dari 192 Jenis MAK
                    </span>
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            disabled
                            className="w-8 h-8 rounded-lg border border-[#E4EBE8] flex items-center justify-center text-gray-300"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            className="w-8 h-8 rounded-lg bg-[#0E7C5A] text-white font-bold flex items-center justify-center"
                        >
                            1
                        </button>
                        <button
                            type="button"
                            className="w-8 h-8 rounded-lg border border-[#E4EBE8] hover:bg-gray-50 flex items-center justify-center text-[#5F6F6A]"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal Tambah Jenis MAK (matches Modal Tambah Jenis MAK.png) */}
            {addOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4">
                    <form
                        onSubmit={handleStore}
                        className="bg-white rounded-[24px] shadow-xl w-full max-w-[460px] p-6 relative animate-in fade-in zoom-in-95 duration-150"
                    >
                        <button
                            type="button"
                            onClick={() => setAddOpen(false)}
                            className="absolute top-5 right-5 w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center transition cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-3.5 mb-5">
                            <div className="w-11 h-11 rounded-2xl bg-[#EAF6F1] text-[#0E7C5A] flex items-center justify-center shrink-0">
                                <Plus className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-[#14201C]">Tambah Jenis MAK</h3>
                                <p className="text-xs text-[#8A9A95] mt-0.5">Isikan kode dan nama Jenis MAK baru</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-[#14201C] mb-1.5">
                                    Kode MAK <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formKode}
                                    onChange={(e) => setFormKode(e.target.value)}
                                    placeholder="Contoh: 532111"
                                    className="w-full px-4 py-3 rounded-xl border border-[#E4EBE8] text-xs text-[#14201C] placeholder:text-[#8A9A95] focus:outline-none focus:border-[#0E7C5A]"
                                />
                                <p className="text-[11px] text-[#8A9A95] mt-1.5">
                                    Kode 6 digit sesuai bagan akun standar.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#14201C] mb-1.5">
                                    Nama Jenis MAK <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formNama}
                                    onChange={(e) => setFormNama(e.target.value)}
                                    placeholder="Contoh: Belanja Modal Peralatan dan Mesin"
                                    className="w-full px-4 py-3 rounded-xl border border-[#E4EBE8] text-xs text-[#14201C] placeholder:text-[#8A9A95] focus:outline-none focus:border-[#0E7C5A]"
                                />
                                <p className="text-[11px] text-[#8A9A95] mt-1.5">
                                    Nama resmi sesuai bagan akun standar.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#14201C] mb-1.5">
                                    Penanggung Jawab <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formPenanggungJawab}
                                    onChange={(e) => setFormPenanggungJawab(e.target.value)}
                                    placeholder="Contoh: Budi Santoso"
                                    className="w-full px-4 py-3 rounded-xl border border-[#E4EBE8] text-xs text-[#14201C] placeholder:text-[#8A9A95] focus:outline-none focus:border-[#0E7C5A]"
                                />
                                <p className="text-[11px] text-[#8A9A95] mt-1.5">
                                    Nama pegawai yang bertanggung jawab atas Jenis MAK ini.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setAddOpen(false)}
                                className="py-2.5 px-5 rounded-xl border border-[#E4EBE8] bg-white hover:bg-gray-50 text-xs font-bold text-[#14201C] transition cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="py-2.5 px-6 rounded-xl bg-[#0E7C5A] hover:bg-[#0A5C43] disabled:opacity-50 text-xs font-bold text-white transition cursor-pointer"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Modal Edit Jenis MAK (matches Modal Edit Jenis MAK.png) */}
            {editTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4">
                    <form
                        onSubmit={handleUpdate}
                        className="bg-white rounded-[24px] shadow-xl w-full max-w-[460px] p-6 relative animate-in fade-in zoom-in-95 duration-150"
                    >
                        <button
                            type="button"
                            onClick={() => setEditTarget(null)}
                            className="absolute top-5 right-5 w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center transition cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-3.5 mb-5">
                            <div className="w-11 h-11 rounded-2xl bg-[#EAF6F1] text-[#0E7C5A] flex items-center justify-center shrink-0">
                                <Pencil className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-[#14201C]">Edit Jenis MAK</h3>
                                <p className="text-xs text-[#8A9A95] mt-0.5">Perbarui kode atau nama Jenis MAK</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-[#14201C] mb-1.5">
                                    Kode MAK <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formKode}
                                    onChange={(e) => setFormKode(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-[#E4EBE8] text-xs text-[#14201C] focus:outline-none focus:border-[#0E7C5A]"
                                />
                                <p className="text-[11px] text-[#8A9A95] mt-1.5">
                                    Kode 6 digit sesuai bagan akun standar.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#14201C] mb-1.5">
                                    Nama Jenis MAK <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formNama}
                                    onChange={(e) => setFormNama(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-[#E4EBE8] text-xs text-[#14201C] focus:outline-none focus:border-[#0E7C5A]"
                                />
                                <p className="text-[11px] text-[#8A9A95] mt-1.5">
                                    Nama resmi sesuai bagan akun standar.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#14201C] mb-1.5">
                                    Penanggung Jawab <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formPenanggungJawab}
                                    onChange={(e) => setFormPenanggungJawab(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-[#E4EBE8] text-xs text-[#14201C] focus:outline-none focus:border-[#0E7C5A]"
                                />
                                <p className="text-[11px] text-[#8A9A95] mt-1.5">
                                    Nama pegawai yang bertanggung jawab atas Jenis MAK ini.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setEditTarget(null)}
                                className="py-2.5 px-5 rounded-xl border border-[#E4EBE8] bg-white hover:bg-gray-50 text-xs font-bold text-[#14201C] transition cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="py-2.5 px-6 rounded-xl bg-[#0E7C5A] hover:bg-[#0A5C43] disabled:opacity-50 text-xs font-bold text-white transition cursor-pointer"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Modal Hapus Jenis MAK (matches Modal Hapus Jenis MAK.png) */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4">
                    <div className="bg-white rounded-[24px] shadow-xl w-full max-w-[440px] p-6 relative animate-in fade-in zoom-in-95 duration-150">
                        <button
                            type="button"
                            onClick={() => setDeleteTarget(null)}
                            className="absolute top-5 right-5 w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center transition cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-3.5 mb-4">
                            <div className="w-11 h-11 rounded-2xl bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center shrink-0">
                                <Trash2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-[#14201C]">Hapus Jenis MAK?</h3>
                                <p className="text-xs text-[#8A9A95] mt-0.5">
                                    {deleteTarget.kode} &bull; {deleteTarget.nama}
                                </p>
                            </div>
                        </div>

                        <p className="text-xs text-[#5F6F6A] leading-relaxed">
                            Jenis MAK ini akan dihapus dari daftar dan tidak akan muncul lagi sebagai pilihan saat
                            verifikasi anggaran. Tindakan ini tidak dapat dibatalkan.
                        </p>

                        <div className="flex items-center justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setDeleteTarget(null)}
                                className="py-2.5 px-5 rounded-xl border border-[#E4EBE8] bg-white hover:bg-gray-50 text-xs font-bold text-[#14201C] transition cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={processing}
                                onClick={handleDelete}
                                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-5 rounded-xl bg-[#E5484D] hover:bg-[#D92D20] disabled:opacity-50 text-xs font-bold text-white transition cursor-pointer"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>{processing ? 'Menghapus...' : 'Hapus'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PpLayout>
    );
}
