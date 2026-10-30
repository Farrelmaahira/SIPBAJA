import React, { useState, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    FileText,
    Upload,
    Download,
    Eye,
    Calendar,
    Building2,
    Activity,
    Hash,
    Pencil,
    X,
} from 'lucide-react';
import PpLayout from '../../../components/templates/PpLayout';
import DocumentPreviewModal from '../../../components/organisms/DocumentPreviewModal';
import { PERENCANAAN_NAV_ITEMS } from '../Dashboard';

export default function Index({ rkakl = {}, recentNotifications = [], unreadNotificationsCount = 0 }) {
    const [replaceModalOpen, setReplaceModalOpen] = useState(false);
    const [fullPreviewOpen, setFullPreviewOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState('RKAKL_TA_2026_Satker_Politeknik_v4.pdf');
    const [processing, setProcessing] = useState(false);
    const fileInputRef = useRef(null);

    const activeFilename =
        rkakl.active_doc?.nama_asli ||
        (rkakl.active_doc?.path ? rkakl.active_doc.path.split('/').pop() : 'RKAKL_TA_2026_Satker_Politeknik_v3.pdf');

    const activeVersion = rkakl.active_doc?.versi || 3;

    const historyList =
        rkakl.history && rkakl.history.length > 0
            ? rkakl.history.map((h, i) => ({
                  id: h.id || i,
                  filename:
                      h.nama_asli ||
                      (h.path ? h.path.split('/').pop() : `RKAKL_TA_2026_Satker_Politeknik_v${2 - i}.pdf`),
                  meta: i === 0 ? 'PDF ΓÇó 5 MB ΓÇó Diganti 02 Sep 2026' : 'PDF ΓÇó 5 MB ΓÇó Diganti 14 Agu 2026',
              }))
            : [
                  {
                      id: 'h-1',
                      filename: 'RKAKL_TA_2026_Satker_Politeknik_v2.pdf',
                      meta: 'PDF ΓÇó 5 MB ΓÇó Diganti 02 Sep 2026',
                  },
                  {
                      id: 'h-2',
                      filename: 'RKAKL_TA_2026_Satker_Politeknik_v1.pdf',
                      meta: 'PDF ΓÇó 5 MB ΓÇó Diganti 14 Agu 2026',
                  },
              ];

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file.name);
        }
    };

    const handleReplaceSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.post(
            '/perencanaan/rkakl',
            {
                filename: selectedFile || 'RKAKL_TA_2026_Satker_Politeknik_v4.pdf',
            },
            {
                preserveScroll: true,
                onFinish: () => {
                    setProcessing(false);
                    setReplaceModalOpen(false);
                },
            }
        );
    };

    return (
        <PpLayout
            activeRoute="rkakl"
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
            <Head title="Dokumen RKAKL - Perencanaan" />

            {/* Hero Top Banner */}
            <div className="relative overflow-hidden rounded-[24px] bg-[#0E7C5A] p-6 sm:px-9 sm:py-8 text-white shadow-[0_10px_24px_rgba(13,51,38,0.14)] mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                    <div>
                        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/75 block mb-1">
                            DATA MASTER
                        </span>
                        <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight leading-tight">
                            Dokumen RKAKL
                        </h1>
                        <p className="text-xs sm:text-sm text-white/85 mt-1.5">
                            Kelola dokumen RKAKL yang dipakai sebagai acuan verifikasi anggaran.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setReplaceModalOpen(true)}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-[#F1F7F4] text-[#0E7C5A] text-xs font-bold shadow-sm transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Ganti Dokumen</span>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left Column (2 cols): Dokumen RKAKL Aktif Live Preview */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
                        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F0F4F2]">
                            <div>
                                <h2 className="text-base font-bold text-[#14201C]">Dokumen RKAKL Aktif</h2>
                                <p className="text-xs text-[#8A9A95] mt-0.5">
                                    Pratinjau dokumen RKAKL yang dipakai sebagai acuan verifikasi
                                </p>
                            </div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#EAF6F1] text-[#0E7C5A]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#0E7C5A]" />
                                Live Preview
                            </span>
                        </div>

                        {/* File Action Bar */}
                        <div className="p-3.5 rounded-2xl bg-[#F4F7F5] border border-[#E4EBE8] flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center shrink-0">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-[#14201C] truncate">{activeFilename}</p>
                                    <p className="text-[11px] text-[#8A9A95]">PDF &bull; 5 MB</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setFullPreviewOpen(true)}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E4EBE8] text-xs font-bold text-[#14201C] hover:bg-[#F8FAF9] transition-colors cursor-pointer"
                                >
                                    <Eye className="w-3.5 h-3.5 text-[#5F6F6A]" />
                                    <span>Lihat</span>
                                </button>
                                <a
                                    href="/pp/dokumen/1/download"
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0E7C5A] hover:bg-[#0A5C43] text-xs font-bold text-white transition-colors shadow-xs"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Unduh</span>
                                </a>
                            </div>
                        </div>

                        {/* Simulated Paper Sheet */}
                        <div className="rounded-2xl bg-[#EFF3F1] p-5 sm:p-7">
                            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-xs min-h-[380px] flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-3 pb-4 border-b-2 border-[#0E7C5A]">
                                        <div className="w-9 h-9 rounded-lg bg-[#0E7C5A] text-white flex items-center justify-center font-bold text-xs shrink-0">
                                            <svg
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs font-extrabold text-[#14201C] uppercase tracking-wide">
                                                RKA-K/L TAHUN ANGGARAN 2026
                                            </p>
                                            <p className="text-[11px] text-[#8A9A95]">Pengadaan Barang &amp; Jasa</p>
                                        </div>
                                    </div>

                                    <div className="py-4 space-y-1 text-xs text-[#5F6F6A]">
                                        <p>
                                            <span className="inline-block w-16 text-[#8A9A95]">Nomor</span>:{' '}
                                            <strong className="text-[#14201C]">RKAKL/2026/003</strong>
                                        </p>
                                        <p>
                                            <span className="inline-block w-16 text-[#8A9A95]">Perihal</span>:{' '}
                                            <strong className="text-[#14201C]">Rencana Kerja dan Anggaran</strong>
                                        </p>
                                        <p>
                                            <span className="inline-block w-16 text-[#8A9A95]">Tanggal</span>:{' '}
                                            <strong className="text-[#14201C]">12 Oktober 2026</strong>
                                        </p>
                                    </div>

                                    <div className="text-center py-3">
                                        <h4 className="text-xs font-extrabold text-[#14201C] uppercase tracking-wider">
                                            RENCANA KERJA DAN ANGGARAN K/L
                                        </h4>
                                    </div>

                                    <p className="text-xs text-[#5F6F6A] leading-relaxed mb-4">
                                        Dokumen ini memuat rincian alokasi rencana kerja dan anggaran satuan kerja
                                        tahun anggaran 2026 yang menjadi acuan verifikasi anggaran pengadaan.
                                    </p>

                                    <div className="space-y-2.5 py-2">
                                        <div className="w-full h-2.5 bg-[#E4EBE8] rounded-full" />
                                        <div className="w-full h-2.5 bg-[#E4EBE8] rounded-full" />
                                        <div className="w-4/5 h-2.5 bg-[#E4EBE8] rounded-full" />
                                        <div className="w-full h-2.5 bg-[#E4EBE8] rounded-full mt-4" />
                                        <div className="w-3/4 h-2.5 bg-[#E4EBE8] rounded-full" />
                                    </div>
                                </div>

                                <div className="pt-8 flex justify-between items-end text-xs text-[#8A9A95]">
                                    <div />
                                    <span className="px-3.5 py-1 rounded-full bg-[#14201C] text-white text-[11px] font-bold">
                                        Halaman 1 dari 120
                                    </span>
                                    <div className="text-right">
                                        <p className="text-[11px]">Disahkan oleh,</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (1 col): Informasi Dokumen & Riwayat Pergantian */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Informasi Dokumen */}
                    <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
                        <div className="pb-4 mb-4 border-b border-[#F0F4F2]">
                            <h2 className="text-base font-bold text-[#14201C]">Informasi Dokumen</h2>
                            <p className="text-xs text-[#8A9A95] mt-0.5">Detail berkas RKAKL yang sedang aktif</p>
                        </div>

                        <div className="space-y-4 text-xs">
                            <div className="flex items-center gap-3.5">
                                <div className="w-9 h-9 rounded-xl bg-[#E8F5EF] text-[#0E7C5A] flex items-center justify-center shrink-0">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[#8A9A95] text-[11px]">Tahun Anggaran</p>
                                    <p className="font-bold text-[#14201C] mt-0.5">2026</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3.5">
                                <div className="w-9 h-9 rounded-xl bg-[#E8F5EF] text-[#0E7C5A] flex items-center justify-center shrink-0">
                                    <Hash className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[#8A9A95] text-[11px]">Versi Dokumen</p>
                                    <p className="font-bold text-[#0E7C5A] mt-0.5">Versi {activeVersion}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3.5">
                                <div className="w-9 h-9 rounded-xl bg-[#E8F5EF] text-[#0E7C5A] flex items-center justify-center shrink-0">
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[#8A9A95] text-[11px]">Diunggah Oleh</p>
                                    <p className="font-bold text-[#14201C] mt-0.5">Unit Perencanaan</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3.5">
                                <div className="w-9 h-9 rounded-xl bg-[#E8F5EF] text-[#0E7C5A] flex items-center justify-center shrink-0">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[#8A9A95] text-[11px]">Terakhir Diperbarui</p>
                                    <p className="font-bold text-[#14201C] mt-0.5">12 Okt 2026</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3.5">
                                <div className="w-9 h-9 rounded-xl bg-[#E8F5EF] text-[#0E7C5A] flex items-center justify-center shrink-0">
                                    <Activity className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[#8A9A95] text-[11px]">Status</p>
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EAF6F1] text-[#0E7C5A] mt-0.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                                        Aktif
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Riwayat Pergantian */}
                    <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
                        <div className="pb-4 mb-4 border-b border-[#F0F4F2]">
                            <h2 className="text-base font-bold text-[#14201C]">Riwayat Pergantian</h2>
                            <p className="text-xs text-[#8A9A95] mt-0.5">Versi dokumen RKAKL sebelumnya</p>
                        </div>

                        <div className="space-y-3">
                            {historyList.map((item) => (
                                <div
                                    key={item.id}
                                    className="p-3.5 rounded-2xl bg-[#F4F7F5] border border-[#E4EBE8] flex items-center gap-3"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center shrink-0">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-[#14201C] truncate">{item.filename}</p>
                                        <p className="text-[11px] text-[#8A9A95] mt-0.5">{item.meta}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Ganti Dokumen RKAKL (matches Modal Ganti Dokumen RKAKL.png) */}
            {replaceModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4">
                    <form
                        onSubmit={handleReplaceSubmit}
                        className="bg-white rounded-[24px] shadow-xl w-full max-w-[460px] p-6 relative animate-in fade-in zoom-in-95 duration-150"
                    >
                        <button
                            type="button"
                            onClick={() => setReplaceModalOpen(false)}
                            className="absolute top-5 right-5 w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center transition cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-3.5 mb-5">
                            <div className="w-11 h-11 rounded-2xl bg-[#EAF6F1] text-[#0E7C5A] flex items-center justify-center shrink-0">
                                <Pencil className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-[#14201C]">Ganti Dokumen RKAKL</h3>
                                <p className="text-xs text-[#8A9A95] mt-0.5">
                                    Unggah berkas baru untuk menggantikan dokumen aktif
                                </p>
                            </div>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="rounded-2xl border-2 border-dashed border-[#D5E2DC] hover:border-[#0E7C5A] bg-[#F8FAF9] p-6 text-center cursor-pointer transition"
                        >
                            <div className="w-10 h-10 rounded-xl bg-[#EAF6F1] text-[#0E7C5A] flex items-center justify-center mx-auto mb-3">
                                <Upload className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-bold text-[#14201C]">Seret &amp; lepas file RKAKL di sini</p>
                            <p className="text-[11px] text-[#8A9A95] mt-1">Format PDF, maksimal 25 MB</p>
                            <button
                                type="button"
                                className="mt-3.5 px-4 py-2 rounded-xl border border-[#E4EBE8] bg-white hover:bg-gray-50 text-xs font-bold text-[#14201C] shadow-2xs cursor-pointer"
                            >
                                Pilih File
                            </button>
                        </div>

                        {selectedFile && (
                            <div className="mt-4 p-3.5 rounded-2xl bg-[#F4F7F5] border border-[#E4EBE8] flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center shrink-0">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-[#14201C] truncate">{selectedFile}</p>
                                        <p className="text-[11px] text-[#8A9A95] mt-0.5">
                                            PDF &bull; 5 MB &bull; Siap diunggah
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedFile(null)}
                                    className="w-7 h-7 rounded-lg text-gray-400 hover:text-gray-600 flex items-center justify-center cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setReplaceModalOpen(false)}
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

            <DocumentPreviewModal
                open={fullPreviewOpen}
                onClose={() => setFullPreviewOpen(false)}
                document={{
                    label: 'Dokumen RKAKL Aktif',
                    filename: activeFilename,
                    size: '5 MB',
                }}
            />
        </PpLayout>
    );
}
