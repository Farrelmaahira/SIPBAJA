import React, { useState, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    FileText,
    Calendar,
    Tag,
    Building2,
    Activity,
    Banknote,
    Eye,
    Download,
    XCircle,
    CheckCircle2,
    Info,
    UserCheck,
    Hash,
    Image as ImageIcon,
    Upload,
    X,
} from 'lucide-react';
import PpLayout from '../../../components/templates/PpLayout';
import DokumentasiGalleryModal from '../../../components/organisms/DokumentasiGalleryModal';
import DocumentPreviewModal from '../../../components/organisms/DocumentPreviewModal';
import { PPK_NAV_ITEMS } from '../Dashboard';

export default function Pembayaran({
    detail = {},
    recentNotifications = [],
    unreadNotificationsCount = 0,
}) {
    const { pengadaan = {}, mak_list = [] } = detail;
    const permohonan = pengadaan?.permohonan || {};

    const nomorSurat = permohonan.nomor_surat || '111-FFF-111';
    const judulPermohonan = permohonan.judul || 'Pengadaan Komputer';
    const unitNama = permohonan.unit?.nama || 'Jurusan Teknik Informatika & Komputer';
    const nominalNilai = pengadaan.nilai_kontrak || permohonan.nominal || 100000000;

    const [galleryOpen, setGalleryOpen] = useState(false);
    const [previewDoc, setPreviewDoc] = useState(null);
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);

    const [memoFile, setMemoFile] = useState(`Memo_Persetujuan_${nomorSurat.replace(/\//g, '-')}.pdf`);
    const [alasanTolak, setAlasanTolak] = useState('');
    const [alasanError, setAlasanError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fileInputRef = useRef(null);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 100000000);
    };

    const formatDate = (dateString, fallback = '04 Maret 2027') => {
        if (!dateString) return fallback;
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    const handleApproveSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);
        router.post(
            `/ppk/pengajuan/${pengadaan.id}/pembayaran/approve`,
            {
                filename: memoFile || `Memo_Persetujuan_${nomorSurat.replace(/\//g, '-')}.pdf`,
            },
            {
                preserveScroll: true,
                onFinish: () => {
                    setSubmitting(false);
                    setApproveModalOpen(false);
                },
            }
        );
    };

    const handleRejectSubmit = (e) => {
        e.preventDefault();
        if (!alasanTolak || alasanTolak.trim().length < 5) {
            setAlasanError('Catatan penolakan wajib diisi minimal 5 karakter.');
            return;
        }
        setAlasanError('');
        setSubmitting(true);
        router.post(
            `/ppk/pengajuan/${pengadaan.id}/pembayaran/reject`,
            { alasan: alasanTolak },
            {
                preserveScroll: true,
                onFinish: () => {
                    setSubmitting(false);
                    setRejectModalOpen(false);
                },
            }
        );
    };

    const renderDocBox = (doc) => (
        <div key={doc.id || doc.label} className="p-5 rounded-2xl border border-[#E3EAE6] bg-white shadow-2xs">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-[#FDE6E4] text-[#D92D20] flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#0F6A49]">{doc.label}</p>
                        <p className="text-sm font-semibold text-[#0E1B16] truncate mt-0.5">{doc.filename}</p>
                        <p className="text-xs text-[#6B7A73] mt-0.5">{doc.size}</p>
                    </div>
                </div>
                <a
                    href="/pp/dokumen/1/download"
                    className="w-10 h-10 rounded-xl border border-[#CBD6D0] bg-white hover:bg-[#F4F7F5] text-[#3F4E47] flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                    title={`Unduh ${doc.label}`}
                >
                    <Download className="w-4 h-4" />
                </a>
            </div>

            {doc.withGallery ? (
                <div className="grid grid-cols-2 gap-2 mt-4">
                    <button
                        type="button"
                        onClick={() => setPreviewDoc(doc)}
                        className="py-3 px-4 rounded-xl border border-[#CBD6D0] bg-white hover:bg-[#F4F9F6] text-xs font-semibold text-[#0F6A49] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                        <Eye className="w-4 h-4" />
                        <span>Lihat Dokumen</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setGalleryOpen(true)}
                        className="py-3 px-4 rounded-xl border border-[#CBD6D0] bg-white hover:bg-[#F4F9F6] text-xs font-semibold text-[#0F6A49] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                        <ImageIcon className="w-4 h-4" />
                        <span>Lihat Foto</span>
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setPreviewDoc(doc)}
                    className="w-full mt-4 py-3 px-4 rounded-xl border border-[#CBD6D0] bg-white hover:bg-[#F4F9F6] text-xs font-semibold text-[#0F6A49] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                    <Eye className="w-4 h-4" />
                    <span>Lihat Dokumen</span>
                </button>
            )}
        </div>
    );

    const paymentFiles = [
        {
            id: 'pay-1',
            label: 'Dokumen Pembayaran',
            filename: 'Dokumen_Pembayaran_Komputer_TIK.pdf',
            meta: 'Dokumen Pembayaran ΓÇó PDF ΓÇó 2 MB',
        },
        {
            id: 'pay-2',
            label: 'Dokumen Legalitas Vendor',
            filename: 'Legalitas_Vendor_Komputer_TIK.pdf',
            meta: 'Dokumen Legalitas Vendor ΓÇó PDF ΓÇó 3 MB',
        },
    ];

    return (
        <PpLayout
            activeRoute="pengajuan"
            notifications={recentNotifications}
            unreadCount={unreadNotificationsCount}
            roleInitials="PK"
            roleTitle="PPK"
            roleSubtitle="Unit PPK"
            navItems={PPK_NAV_ITEMS}
            profileHref="/ppk/profil"
            notifikasiHref="/ppk/notifikasi"
            readAllHref="/ppk/notifikasi/read-all"
            breadcrumb={[
                { label: 'LIST PENGAJUAN', href: '/ppk/pengajuan' },
                { label: 'REVIEW PEMBAYARAN' },
            ]}
        >
            <Head title={`Review Pembayaran - ${nomorSurat}`} />

            {/* Hero Banner (Figma node 612:27024) */}
            <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#0A5C42] to-[#17A373] p-6 sm:px-9 sm:py-8 text-white shadow-[0_10px_24px_rgba(13,51,38,0.14)] mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                    <div>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/75 block mb-2">
                            PEMBAYARAN
                        </span>
                        <div className="flex flex-wrap items-center gap-4">
                            <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight leading-9">
                                Review Pembayaran
                            </h1>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E7F0FF] text-[#1D4ED8]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8]" />
                                Menunggu Persetujuan
                            </span>
                        </div>
                        <p className="text-sm text-white/85 mt-2">
                            Nomor {nomorSurat} &nbsp;&middot;&nbsp; Diajukan {formatDate(permohonan.created_at)}
                        </p>
                    </div>

                    <Link
                        href="/ppk/pengajuan"
                        className="inline-flex items-center gap-2.5 px-5 py-3.5 rounded-[14px] bg-white/16 hover:bg-white/25 border border-white/35 text-white text-sm font-semibold transition-colors shrink-0 self-start sm:self-auto"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali</span>
                    </Link>
                </div>
                <div
                    className="absolute -right-10 -top-24 w-[260px] h-[260px] rounded-full bg-white/8 pointer-events-none"
                    aria-hidden="true"
                />
                <div
                    className="absolute right-24 -bottom-20 w-[170px] h-[170px] rounded-full bg-white/8 pointer-events-none"
                    aria-hidden="true"
                />
            </div>

            {/* Card 1: Informasi Permohonan (Figma node 612:27039) */}
            <div className="bg-white rounded-[20px] p-6 sm:p-8 border border-[#E3EAE6] shadow-[0_8px_12px_rgba(13,26,20,0.06)] mb-6">
                <div className="pb-6 mb-6 border-b border-[#E3EAE6]">
                    <h3 className="text-lg font-bold text-[#0E1B16]">Informasi Permohonan</h3>
                    <p className="text-xs text-[#6B7A73] mt-0.5">Ringkasan data yang diajukan</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-[#EBF7F1] flex items-center justify-center text-[#0F6A49] shrink-0">
                            <Hash className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[#6B7A73] text-xs font-medium">Nomor Permohonan</p>
                            <p className="font-semibold text-[#0F6A49] text-sm mt-1">{nomorSurat}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-[#EBF7F1] flex items-center justify-center text-[#0F6A49] shrink-0">
                            <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[#6B7A73] text-xs font-medium">Tanggal Pengajuan</p>
                            <p className="font-semibold text-[#0E1B16] text-sm mt-1">
                                {formatDate(permohonan.created_at)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-[#EBF7F1] flex items-center justify-center text-[#0F6A49] shrink-0">
                            <FileText className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[#6B7A73] text-xs font-medium">Judul Permohonan</p>
                            <p className="font-semibold text-[#0E1B16] text-sm mt-1">{judulPermohonan}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-[#EBF7F1] flex items-center justify-center text-[#0F6A49] shrink-0">
                            <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[#6B7A73] text-xs font-medium">Diajukan Oleh</p>
                            <p className="font-semibold text-[#0E1B16] text-sm mt-1">{unitNama}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-[#EBF7F1] flex items-center justify-center text-[#0F6A49] shrink-0">
                            <Banknote className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[#6B7A73] text-xs font-medium">Nominal/Estimasi</p>
                            <p className="font-semibold text-[#0E1B16] text-sm mt-1">
                                {formatCurrency(nominalNilai)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-[#EBF7F1] flex items-center justify-center text-[#0F6A49] shrink-0">
                            <Activity className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[#6B7A73] text-xs font-medium">Status</p>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E7F0FF] text-[#1D4ED8] mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8]" />
                                Menunggu Persetujuan
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Card 2: Dokumen Proses Sebelumnya (Figma node 612:27107) */}
            <div className="bg-white rounded-[20px] p-6 sm:p-8 border border-[#E3EAE6] shadow-[0_8px_12px_rgba(13,26,20,0.06)] mb-6">
                <div className="pb-6 mb-6 border-b border-[#E3EAE6]">
                    <h3 className="text-lg font-bold text-[#0E1B16]">Dokumen Proses Sebelumnya</h3>
                    <p className="text-xs text-[#6B7A73] mt-0.5">
                        Dokumen dari tahap sebelumnya dan jenis MAK dari Perencanaan
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {renderDocBox({
                        id: 'prev-1',
                        label: 'Surat Permohonan',
                        filename: 'Surat_Permohonan_Pengadaan_Komputer_TIK.pdf',
                        size: 'PDF ΓÇó 8 MB',
                    })}
                    {renderDocBox({
                        id: 'prev-2',
                        label: 'Memo Persetujuan',
                        filename: `Memo_Persetujuan_${nomorSurat}.pdf`,
                        size: 'PDF ΓÇó 1 MB',
                    })}
                    {renderDocBox({
                        id: 'prev-3',
                        label: 'Dokumen Pengadaan',
                        filename: 'Dokumen_Pengadaan_Komputer_TIK.pdf',
                        size: 'PDF ΓÇó 5 MB',
                    })}
                    {renderDocBox({
                        id: 'prev-4',
                        label: 'Surat Kontrak',
                        filename: 'Surat_Kontrak_Komputer_TIK.pdf',
                        size: 'PDF ΓÇó 3 MB',
                    })}
                    {renderDocBox({
                        id: 'prev-5',
                        label: 'SPK',
                        filename: 'SPK_Komputer_TIK.pdf',
                        size: 'PDF ΓÇó 2 MB',
                    })}
                    {renderDocBox({
                        id: 'prev-6',
                        label: 'Dokumen dan Dokumentasi Penerimaan Barang',
                        filename: 'Penerimaan_Barang_Komputer_TIK.pdf',
                        size: 'PDF ΓÇó 4 MB  ┬╖  6 Foto Dokumentasi',
                        withGallery: true,
                    })}
                </div>

                {/* Jenis MAK dari Perencanaan (Figma node 612:27122) */}
                <div className="px-4 py-3 rounded-xl bg-[#EBF7F1] border border-[#DDF3E6] flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white text-[#0F6A49] flex items-center justify-center shrink-0">
                        <Tag className="w-4 h-4" />
                    </div>
                    <div className="text-xs">
                        <p className="text-xs font-medium text-[#3F4E47]">Jenis MAK dari Perencanaan</p>
                        <div className="font-semibold text-sm text-[#0E1B16] mt-0.5 space-y-0.5">
                            {mak_list.length > 0 ? (
                                mak_list.map((m) => (
                                    <p key={m.id}>
                                        53211{m.id} &middot; {m.nama}
                                    </p>
                                ))
                            ) : (
                                <>
                                    <p>532111 &middot; Belanja Modal Peralatan dan Mesin</p>
                                    <p>521211 &middot; Belanja Bahan</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Review Body (Figma node 612:27131) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Dokumen Pembayaran + Keputusan PPK */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Card / Dokumen Pembayaran (Figma node 612:27133) */}
                    <div className="bg-white rounded-[20px] p-6 sm:p-8 border border-[#E3EAE6] shadow-[0_8px_12px_rgba(13,26,20,0.06)]">
                        <div className="mb-5">
                            <h3 className="text-lg font-bold text-[#0E1B16]">Dokumen Pembayaran</h3>
                            <p className="text-xs text-[#6B7A73] mt-0.5">
                                Pratinjau dokumen pembayaran yang diunggah PPBJ
                            </p>
                        </div>

                        <div className="space-y-4">
                            {paymentFiles.map((file) => (
                                <div
                                    key={file.id}
                                    className="p-4 rounded-[14px] bg-[#F5F8F6] border border-[#E3EAE6] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-12 h-12 rounded-xl bg-[#FDE6E4] text-[#D92D20] flex items-center justify-center shrink-0">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-[#0E1B16] truncate">
                                                {file.filename}
                                            </p>
                                            <p className="text-xs text-[#6B7A73] mt-1">{file.meta}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPreviewDoc({
                                                    label: file.label,
                                                    filename: file.filename,
                                                    size: file.meta,
                                                })
                                            }
                                            className="px-4 py-3 rounded-xl border border-[#CBD6D0] bg-white hover:bg-[#F4F7F5] text-sm font-semibold text-[#3F4E47] inline-flex items-center gap-2 transition-colors cursor-pointer"
                                        >
                                            <Eye className="w-4 h-4" />
                                            <span>Lihat</span>
                                        </button>
                                        <a
                                            href="/pp/dokumen/1/download"
                                            className="px-4 py-3 rounded-xl bg-[#16825C] hover:bg-[#0F6A49] text-sm font-semibold text-white inline-flex items-center gap-2 shadow-[0_8px_10px_rgba(13,51,38,0.2)] transition-colors cursor-pointer"
                                        >
                                            <Download className="w-4 h-4" />
                                            <span>Unduh</span>
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Card / Keputusan PPK (Figma node 612:27184) */}
                    <div className="bg-white rounded-[20px] p-6 border border-[#E3EAE6] shadow-[0_8px_12px_rgba(13,26,20,0.06)]">
                        <div>
                            <h3 className="text-lg font-bold text-[#0E1B16]">Keputusan PPK</h3>
                            <p className="text-xs text-[#6B7A73] mt-0.5">
                                Tinjau dokumen pembayaran, lalu setujui atau tolak
                            </p>
                        </div>

                        <div className="mt-5 px-4 py-3 rounded-xl bg-[#F5F8F6] border border-[#E3EAE6] flex items-start gap-2.5 text-xs text-[#6B7A73]">
                            <Info className="w-4 h-4 text-[#6B7A73] shrink-0 mt-0.5" />
                            <p className="leading-relaxed">
                                Pastikan dokumen pembayaran dan legalitas vendor sudah sesuai kontrak sebelum memberi
                                keputusan.
                            </p>
                        </div>

                        <div className="h-px bg-[#E3EAE6] my-5" />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setRejectModalOpen(true)}
                                className="py-3.5 px-5 rounded-[14px] border border-[#F6B8B5] bg-[#FDE6E4] hover:bg-[#FCD5D2] text-sm font-semibold text-[#B42318] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <XCircle className="w-4 h-4 shrink-0" />
                                <span>Tolak Dokumen</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setApproveModalOpen(true)}
                                className="py-3.5 px-5 rounded-[14px] bg-[#16825C] hover:bg-[#0F6A49] text-sm font-semibold text-white shadow-[0_8px_10px_rgba(13,51,38,0.2)] transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
                            >
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                <span>Setujui Dokumen</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Card / Informasi Pembayaran (Figma node 612:27208) */}
                <div className="lg:col-span-5">
                    <div className="bg-white rounded-[20px] p-6 border border-[#E3EAE6] shadow-[0_8px_12px_rgba(13,26,20,0.06)]">
                        <div className="pb-5 mb-5 border-b border-[#E3EAE6]">
                            <h3 className="text-lg font-bold text-[#0E1B16]">Informasi Pembayaran</h3>
                            <p className="text-xs text-[#6B7A73] mt-0.5">
                                Data yang diisi PPBJ saat mengunggah dokumen
                            </p>
                        </div>

                        <div className="space-y-5">
                            <div className="flex items-center gap-3.5">
                                <div className="w-10 h-10 rounded-xl bg-[#EBF7F1] text-[#0F6A49] flex items-center justify-center shrink-0">
                                    <Tag className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="text-[#6B7A73] block text-xs font-medium">MAK</span>
                                    <span className="font-semibold text-sm text-[#0E1B16] block mt-1">
                                        532111 &middot; Belanja Modal Peralatan dan Mesin
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3.5">
                                <div className="w-10 h-10 rounded-xl bg-[#EBF7F1] text-[#0F6A49] flex items-center justify-center shrink-0">
                                    <UserCheck className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="text-[#6B7A73] block text-xs font-medium">Penanggung Jawab</span>
                                    <span className="font-semibold text-sm text-[#0E1B16] block mt-1">
                                        Budi Santoso &middot; Penanggung Jawab MAK 532111
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3.5">
                                <div className="w-10 h-10 rounded-xl bg-[#EBF7F1] text-[#0F6A49] flex items-center justify-center shrink-0">
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="text-[#6B7A73] block text-xs font-medium">Vendor</span>
                                    <span className="font-semibold text-sm text-[#0E1B16] block mt-1">
                                        CV Maju Jaya Teknologi
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3.5">
                                <div className="w-10 h-10 rounded-xl bg-[#EBF7F1] text-[#0F6A49] flex items-center justify-center shrink-0">
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="text-[#6B7A73] block text-xs font-medium">Diunggah Oleh</span>
                                    <span className="font-semibold text-sm text-[#0E1B16] block mt-1">PPBJ</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3.5">
                                <div className="w-10 h-10 rounded-xl bg-[#EBF7F1] text-[#0F6A49] flex items-center justify-center shrink-0">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="text-[#6B7A73] block text-xs font-medium">Tanggal Unggah</span>
                                    <span className="font-semibold text-sm text-[#0E1B16] block mt-1">14 Mei 2027</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal / Unggah Memo Persetujuan (Figma node 612:27863) */}
            {approveModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
                    <form
                        onSubmit={handleApproveSubmit}
                        className="bg-white rounded-[24px] border border-[#E3EAE6] shadow-[0_8px_12px_rgba(13,26,20,0.06)] w-full max-w-[520px] p-8 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-150"
                    >
                        {/* Modal Header */}
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-[14px] bg-[#EBF7F1] text-[#0F6A49] flex items-center justify-center shrink-0">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-[#0E1B16]">Unggah Memo Persetujuan</h3>
                                <p className="text-xs text-[#6B7A73] mt-0.5">
                                    Lampirkan memo untuk menyetujui dokumen pembayaran
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setApproveModalOpen(false)}
                                className="text-[#6B7A73] hover:text-[#0E1B16] transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Dropzone / Unggah Dokumen */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setMemoFile(file.name);
                            }}
                            className="hidden"
                        />
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="rounded-[14px] bg-[#F5F8F6] border-[1.5px] border-dashed border-[#E3EAE6] hover:border-[#16825C] px-6 py-7 flex flex-col items-center justify-center gap-2.5 text-center cursor-pointer transition"
                        >
                            <div className="w-12 h-12 rounded-[14px] bg-[#EBF7F1] text-[#0F6A49] flex items-center justify-center">
                                <Upload className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-semibold text-[#0E1B16]">
                                Seret &amp; lepas memo persetujuan di sini
                            </p>
                            <p className="text-xs text-[#6B7A73]">Format PDF, maksimal 20 MB</p>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    fileInputRef.current?.click();
                                }}
                                className="mt-1 px-4 py-2.5 rounded-xl bg-white border border-[#CBD6D0] hover:bg-gray-50 text-sm font-semibold text-[#3F4E47] transition cursor-pointer"
                            >
                                Pilih File
                            </button>
                        </div>

                        {/* File Item / Terpilih */}
                        {memoFile && (
                            <div className="p-4 rounded-[14px] bg-[#F5F8F6] border border-[#E3EAE6] flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[#FDE6E4] text-[#D92D20] flex items-center justify-center shrink-0">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-[#0E1B16] truncate">{memoFile}</p>
                                    <p className="text-xs text-[#6B7A73] mt-1">PDF &bull; 1 MB &bull; Siap diunggah</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setMemoFile(null)}
                                    className="text-[#6B7A73] hover:text-[#0E1B16] transition cursor-pointer"
                                    title="Hapus file"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                        {/* Modal Actions */}
                        <div className="flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setApproveModalOpen(false)}
                                className="px-5 py-3 rounded-xl border border-[#E3EAE6] bg-white hover:bg-gray-50 text-sm font-semibold text-[#0E1B16] transition cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-5 py-3 rounded-xl bg-[#16825C] hover:bg-[#0F6A49] disabled:opacity-50 text-sm font-semibold text-white shadow-[0_8px_10px_rgba(13,51,38,0.2)] transition cursor-pointer"
                            >
                                {submitting ? 'Memproses...' : 'Setujui Pembayaran'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Modal / Tolak Permohonan (Figma node 612:27905) */}
            {rejectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
                    <form
                        onSubmit={handleRejectSubmit}
                        className="bg-white rounded-[24px] border border-[#E3EAE6] shadow-[0_8px_12px_rgba(13,26,20,0.06)] w-full max-w-[520px] p-8 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-150"
                    >
                        {/* Modal Header */}
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-[14px] bg-[#FDE6E4] text-[#E5484D] flex items-center justify-center shrink-0">
                                <XCircle className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-[#0E1B16]">Tolak Dokumen Pembayaran</h3>
                                <p className="text-xs text-[#6B7A73] mt-0.5">
                                    Nomor {nomorSurat} &middot; {judulPermohonan}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setRejectModalOpen(false)}
                                className="text-[#6B7A73] hover:text-[#0E1B16] transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Field / Catatan Penolakan */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-[#0E1B16]">
                                Catatan Penolakan <span className="text-[#E5484D]">*</span>
                            </label>
                            <textarea
                                rows={4}
                                maxLength={500}
                                value={alasanTolak}
                                onChange={(e) => setAlasanTolak(e.target.value)}
                                placeholder="Tuliskan alasan penolakan agar pemohon dapat memperbaiki permohonanΓÇª"
                                className="w-full px-4 py-3 rounded-xl border border-[#CBD6D0] text-sm text-[#0E1B16] placeholder:text-[#6B7A73] focus:outline-none focus:border-[#E5484D]"
                            />
                            <div className="flex items-start justify-between gap-3 text-xs text-[#6B7A73]">
                                <span>Catatan dikirim ke pemohon dan Tim Perencanaan sebagai dasar revisi.</span>
                                <span className="shrink-0">{alasanTolak.length}/500</span>
                            </div>
                            {alasanError && <p className="text-xs text-[#E5484D]">{alasanError}</p>}
                        </div>

                        {/* Modal Actions */}
                        <div className="flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setRejectModalOpen(false)}
                                className="px-5 py-3.5 rounded-[14px] border border-[#CBD6D0] bg-white hover:bg-gray-50 text-sm font-semibold text-[#3F4E47] transition cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-[14px] bg-[#E5484D] hover:bg-[#D92D20] disabled:opacity-50 text-sm font-semibold text-white transition cursor-pointer"
                            >
                                <XCircle className="w-4 h-4" />
                                <span>{submitting ? 'Memproses...' : 'Tolak Dokumen'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <DokumentasiGalleryModal
                isOpen={galleryOpen}
                onClose={() => setGalleryOpen(false)}
                judul={judulPermohonan}
            />

            <DocumentPreviewModal
                open={Boolean(previewDoc)}
                onClose={() => setPreviewDoc(null)}
                document={previewDoc}
            />
        </PpLayout>
    );
}
