import { useState } from 'react';
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
    Layers,
    Info,
    UserCheck,
    Hash,
} from 'lucide-react';
import PpLayout from '../../../components/templates/PpLayout';
import KonfirmasiApproveModal from '../../../components/organisms/KonfirmasiApproveModal';
import TolakPengadaanModal from '../../../components/organisms/TolakPengadaanModal';
import DocumentPreviewModal from '../../../components/organisms/DocumentPreviewModal';

export default function Review({
    detail,
    recentNotifications = [],
    unreadNotificationsCount = 0,
    basePath = '/pp',
    roleInitials = 'PP',
    roleTitle = null,
    roleSubtitle = null,
    navItems = null,
    keputusanTitle = 'Keputusan PP',
    keputusanNote = 'Khusus pengadaan Rp50 - 200 juta. Pastikan dokumen telah sesuai sebelum direview.',
}) {
    const { pengadaan, mak_list = [] } = detail;
    const permohonan = pengadaan?.permohonan || {};

    const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);
    const [rejectOpen, setRejectOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [rejectError, setRejectError] = useState('');
    const [previewDoc, setPreviewDoc] = useState(null);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '04 Maret 2027';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    const handleApprove = () => {
        setSubmitting(true);
        router.post(
            `${basePath}/pengajuan/${pengadaan.id}/approve`,
            {},
            {
                onFinish: () => {
                    setSubmitting(false);
                    setConfirmApproveOpen(false);
                },
            }
        );
    };

    const handleReject = (alasan) => {
        setSubmitting(true);
        setRejectError('');
        router.post(
            `${basePath}/pengajuan/${pengadaan.id}/reject`,
            { alasan },
            {
                onError: (errors) => {
                    setRejectError(
                        errors.alasan || 'Terjadi kesalahan saat memproses penolakan.'
                    );
                    setSubmitting(false);
                },
                onSuccess: () => {
                    setSubmitting(false);
                    setRejectOpen(false);
                },
            }
        );
    };

    const nomorSurat = permohonan.nomor_surat || '111-FFF-111';
    const judulPermohonan = permohonan.judul || 'Pengadaan Komputer';
    const unitNama = permohonan.unit?.nama || 'Jurusan Teknik Informatika & Komputer';

    return (
        <PpLayout
            activeRoute="pengajuan"
            notifications={recentNotifications}
            unreadCount={unreadNotificationsCount}
            roleInitials={roleInitials}
            roleTitle={roleTitle}
            roleSubtitle={roleSubtitle}
            navItems={navItems}
            profileHref={`${basePath}/profil`}
            notifikasiHref={`${basePath}/notifikasi`}
            readAllHref={`${basePath}/notifikasi/read-all`}
            breadcrumb={[
                { label: 'LIST PENGAJUAN', href: `${basePath}/pengajuan` },
                { label: 'DETAIL PENGADAAN' },
            ]}
        >
            <Head title={`Review Pengadaan - ${nomorSurat}`} />

            {/* Hero Top Banner */}
            <div className="relative overflow-hidden rounded-[24px] bg-[#0E7C5A] p-6 sm:px-9 sm:py-7 text-white shadow-[0_10px_24px_rgba(13,51,38,0.14)] mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                    <div>
                        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/75 block mb-1">
                            PENGADAAN
                        </span>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight">
                                Review Pengadaan
                            </h1>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F0FF] text-[#2F68D6]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#2F68D6]" />
                                Menunggu Persetujuan
                            </span>
                        </div>
                        <p className="text-xs text-white/85 mt-1.5">
                            Nomor {nomorSurat} &middot; Diajukan {formatDate(permohonan.created_at)}
                        </p>
                    </div>

                    <Link
                        href={`${basePath}/pengajuan`}
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
                    <h3 className="text-base font-bold text-[#14201C]">Informasi Permohonan</h3>
                    <p className="text-xs text-[#8A9A95] mt-0.5">Ringkasan data yang diajukan</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 text-xs">
                    {/* Row 1 Left */}
                    <div className="flex items-center gap-3.5 pb-4 border-b border-[#F4F7F5]">
                        <div className="w-10 h-10 rounded-xl bg-[#E8F5EF] flex items-center justify-center text-[#0E7C5A] shrink-0">
                            <Hash className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[#8A9A95] text-[11px]">Nomor Permohonan</p>
                            <p className="font-bold text-[#0E7C5A] text-[13px] mt-0.5">
                                {nomorSurat}
                            </p>
                        </div>
                    </div>

                    {/* Row 1 Right */}
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

                    {/* Row 2 Left */}
                    <div className="flex items-center gap-3.5 pb-4 border-b border-[#F4F7F5]">
                        <div className="w-10 h-10 rounded-xl bg-[#E8F5EF] flex items-center justify-center text-[#0E7C5A] shrink-0">
                            <FileText className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[#8A9A95] text-[11px]">Judul Permohonan</p>
                            <p className="font-bold text-[#14201C] text-[13px] mt-0.5">
                                {judulPermohonan}
                            </p>
                        </div>
                    </div>

                    {/* Row 2 Right */}
                    <div className="flex items-center gap-3.5 pb-4 border-b border-[#F4F7F5]">
                        <div className="w-10 h-10 rounded-xl bg-[#E8F5EF] flex items-center justify-center text-[#0E7C5A] shrink-0">
                            <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[#8A9A95] text-[11px]">Diajukan Oleh</p>
                            <p className="font-bold text-[#14201C] text-[13px] mt-0.5">
                                {unitNama}
                            </p>
                        </div>
                    </div>

                    {/* Row 3 Left */}
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-[#E8F5EF] flex items-center justify-center text-[#0E7C5A] shrink-0">
                            <Banknote className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[#8A9A95] text-[11px]">Nominal/Estimasi</p>
                            <p className="font-bold text-[#14201C] text-[13px] mt-0.5">
                                {formatCurrency(pengadaan.nominal)}
                            </p>
                        </div>
                    </div>

                    {/* Row 3 Right */}
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-[#E8F5EF] flex items-center justify-center text-[#0E7C5A] shrink-0">
                            <Activity className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[#8A9A95] text-[11px]">Status</p>
                            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-[#E8F0FF] text-[#2F68D6] mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#2F68D6]" />
                                Menunggu Persetujuan
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Card 2: Dokumen Proses Sebelumnya */}
            <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] mb-6">
                <div className="pb-4 mb-5 border-b border-[#F0F4F2]">
                    <h3 className="text-base font-bold text-[#14201C]">Dokumen Proses Sebelumnya</h3>
                    <p className="text-xs text-[#8A9A95] mt-0.5">
                        Surat permohonan, memo persetujuan, dan jenis MAK dari Perencanaan
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Doc 1: Surat Permohonan */}
                    <div className="p-4 rounded-2xl border border-[#E4EBE8] bg-white">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center shrink-0">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-bold text-[#0E7C5A]">
                                        Surat Permohonan
                                    </p>
                                    <p className="text-xs font-bold text-[#14201C] truncate mt-0.5">
                                        Surat_Permohonan_Pengadaan_Komputer_TIK.pdf
                                    </p>
                                    <p className="text-[11px] text-[#8A9A95]">PDF &bull; 8 MB</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="w-9 h-9 rounded-xl border border-[#E4EBE8] bg-white hover:bg-[#F4F7F5] text-[#5F6F6A] flex items-center justify-center shrink-0 cursor-pointer"
                                title="Unduh Surat Permohonan"
                            >
                                <Download className="w-4 h-4" />
                            </button>
                        </div>

                        <button
                            type="button"
                            className="w-full mt-3.5 py-2.5 rounded-xl border border-[#E4EBE8] bg-white hover:bg-[#F4F9F6] text-xs font-bold text-[#0E7C5A] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Lihat Dokumen</span>
                        </button>
                    </div>

                    {/* Doc 2: Memo Persetujuan */}
                    <div className="p-4 rounded-2xl border border-[#E4EBE8] bg-white">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center shrink-0">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-bold text-[#0E7C5A]">
                                        Memo Persetujuan
                                    </p>
                                    <p className="text-xs font-bold text-[#14201C] truncate mt-0.5">
                                        Memo_Persetujuan_{nomorSurat}.pdf
                                    </p>
                                    <p className="text-[11px] text-[#8A9A95]">PDF &bull; 1 MB</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="w-9 h-9 rounded-xl border border-[#E4EBE8] bg-white hover:bg-[#F4F7F5] text-[#5F6F6A] flex items-center justify-center shrink-0 cursor-pointer"
                                title="Unduh Memo Persetujuan"
                            >
                                <Download className="w-4 h-4" />
                            </button>
                        </div>

                        <button
                            type="button"
                            className="w-full mt-3.5 py-2.5 rounded-xl border border-[#E4EBE8] bg-white hover:bg-[#F4F9F6] text-xs font-bold text-[#0E7C5A] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Lihat Dokumen</span>
                        </button>
                    </div>
                </div>

                {/* Info MAK Box */}
                <div className="p-4 rounded-2xl bg-[#EAF6F1] flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-full bg-white text-[#0E7C5A] flex items-center justify-center shrink-0 shadow-2xs">
                        <Tag className="w-4 h-4" />
                    </div>
                    <div className="text-xs">
                        <p className="text-[11px] font-semibold text-[#0E7C5A]">
                            Jenis MAK dari Perencanaan
                        </p>
                        <div className="font-bold text-[#14201C] mt-0.5 space-y-0.5">
                            {mak_list.length > 0 ? (
                                mak_list.map((m) => (
                                    <p key={m.id}>53211{m.id} &ndash; {m.nama}</p>
                                ))
                            ) : (
                                <>
                                    <p>532111 &ndash; Belanja Modal Peralatan dan Mesin</p>
                                    <p>521211 &ndash; Belanja Bahan</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom 2-Column Section: Dokumen Pengadaan & Keputusan PP */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Dokumen Pengadaan & Live Preview (2 cols) */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
                        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F0F4F2]">
                            <div>
                                <h3 className="text-base font-bold text-[#14201C]">Dokumen Pengadaan</h3>
                                <p className="text-xs text-[#8A9A95] mt-0.5">
                                    Pratinjau dokumen pengadaan yang diunggah PPBJ
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
                                    <p className="text-xs font-bold text-[#14201C] truncate">
                                        Dokumen_Pengadaan_Komputer_TIK.pdf
                                    </p>
                                    <p className="text-[11px] text-[#8A9A95]">PDF &bull; 5 MB</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E4EBE8] text-xs font-bold text-[#14201C] hover:bg-[#F8FAF9] transition-colors cursor-pointer"
                                >
                                    <Eye className="w-3.5 h-3.5 text-[#5F6F6A]" />
                                    <span>Lihat</span>
                                </button>
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0E7C5A] hover:bg-[#0A5C43] text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Unduh</span>
                                </button>
                            </div>
                        </div>

                        {/* Outer Gray Frame + Inner White Sheet */}
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
                                                {unitNama}
                                            </p>
                                            <p className="text-[11px] text-[#8A9A95]">
                                                Pengadaan Barang &amp; Jasa
                                            </p>
                                        </div>
                                    </div>

                                    <div className="py-4 space-y-1 text-xs text-[#5F6F6A]">
                                        <p>
                                            <span className="inline-block w-16 text-[#8A9A95]">Nomor</span>:{' '}
                                            <strong className="text-[#14201C]">{nomorSurat}</strong>
                                        </p>
                                        <p>
                                            <span className="inline-block w-16 text-[#8A9A95]">Perihal</span>:{' '}
                                            <strong className="text-[#14201C]">{judulPermohonan}</strong>
                                        </p>
                                        <p>
                                            <span className="inline-block w-16 text-[#8A9A95]">Tanggal</span>:{' '}
                                            <strong className="text-[#14201C]">{formatDate(pengadaan.created_at)}</strong>
                                        </p>
                                    </div>

                                    <div className="text-center py-3">
                                        <h4 className="text-xs font-extrabold text-[#14201C] uppercase tracking-wider">
                                            DOKUMEN PENGADAAN
                                        </h4>
                                    </div>

                                    <p className="text-xs text-[#5F6F6A] leading-relaxed mb-4">
                                        Dokumen ini memuat rincian kebutuhan, spesifikasi, dan estimasi anggaran pengadaan komputer yang telah disusun oleh PPBJ untuk ditinjau.
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
                                        Halaman 1 dari 2
                                    </span>
                                    <div className="text-right">
                                        <p className="text-[11px]">Hormat kami,</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Info Pengadaan & Keputusan PP (1 col) */}
                <div className="space-y-6">
                    {/* Card: Informasi Pengadaan */}
                    <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
                        <div className="pb-3.5 mb-4 border-b border-[#F0F4F2]">
                            <h3 className="text-base font-bold text-[#14201C]">Informasi Pengadaan</h3>
                            <p className="text-xs text-[#8A9A95] mt-0.5">
                                Data yang dipilih PPBJ saat mengunggah dokumen
                            </p>
                        </div>

                        <div className="divide-y divide-[#F4F7F5] text-xs">
                            <div className="flex items-center gap-3.5 pb-3.5">
                                <div className="w-9 h-9 rounded-xl bg-[#E8F5EF] text-[#0E7C5A] flex items-center justify-center shrink-0">
                                    <Tag className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="text-[#8A9A95] block text-[11px]">MAK</span>
                                    <span className="font-bold text-[#14201C] block mt-0.5">
                                        532111 - Belanja Modal Peralatan dan Mesin
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3.5 py-3.5">
                                <div className="w-9 h-9 rounded-xl bg-[#E8F5EF] text-[#0E7C5A] flex items-center justify-center shrink-0">
                                    <UserCheck className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="text-[#8A9A95] block text-[11px]">Penanggung Jawab</span>
                                    <span className="font-bold text-[#14201C] block mt-0.5">
                                        {pengadaan.ppk?.nama || 'Budi Santoso'} - Penanggung Jawab MAK 532111
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3.5 py-3.5">
                                <div className="w-9 h-9 rounded-xl bg-[#E8F5EF] text-[#0E7C5A] flex items-center justify-center shrink-0">
                                    <Layers className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="text-[#8A9A95] block text-[11px]">Jenis Pengadaan</span>
                                    <span className="font-bold text-[#14201C] block mt-0.5">
                                        {pengadaan.jenis?.nama || 'Barang'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3.5 py-3.5">
                                <div className="w-9 h-9 rounded-xl bg-[#E8F5EF] text-[#0E7C5A] flex items-center justify-center shrink-0">
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="text-[#8A9A95] block text-[11px]">Diunggah Oleh</span>
                                    <span className="font-bold text-[#14201C] block mt-0.5">
                                        PPBJ
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3.5 pt-3.5">
                                <div className="w-9 h-9 rounded-xl bg-[#E8F5EF] text-[#0E7C5A] flex items-center justify-center shrink-0">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="text-[#8A9A95] block text-[11px]">Tanggal Unggah</span>
                                    <span className="font-bold text-[#14201C] block mt-0.5">
                                        {formatDate(pengadaan.created_at)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card: Keputusan */}
                    <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
                        <div className="pb-3.5 mb-4 border-b border-[#F0F4F2]">
                            <h3 className="text-base font-bold text-[#14201C]">{keputusanTitle}</h3>
                            <p className="text-xs text-[#8A9A95] mt-0.5">
                                Tinjau dokumen pengadaan, lalu setujui atau tolak
                            </p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-[#F4F7F5] border border-[#E4EBE8] flex items-start gap-2.5 mb-5 text-xs text-[#5F6F6A]">
                            <Info className="w-4 h-4 text-[#5F6F6A] shrink-0 mt-0.5" />
                            <p className="leading-relaxed">
                                {keputusanNote}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setRejectOpen(true)}
                                className="py-3 px-3 rounded-xl border border-[#FECDCA] bg-[#FEE4E2]/70 hover:bg-[#FEE4E2] text-xs font-bold text-[#D92D20] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <XCircle className="w-4 h-4 shrink-0" />
                                <span>Revisi Dokumen</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setConfirmApproveOpen(true)}
                                className="py-3 px-3 rounded-xl bg-[#0E7C5A] hover:bg-[#0A5C43] text-xs font-bold text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                            >
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                <span>Setujui Dokumen</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Konfirmasi Setuju */}
            <KonfirmasiApproveModal
                isOpen={confirmApproveOpen}
                onClose={() => setConfirmApproveOpen(false)}
                onConfirm={handleApprove}
                pengadaan={pengadaan}
                isSubmitting={submitting}
            />

            {/* Modal Tolak / Revisi */}
            <TolakPengadaanModal
                isOpen={rejectOpen}
                onClose={() => setRejectOpen(false)}
                onConfirm={handleReject}
                pengadaan={pengadaan}
                isSubmitting={submitting}
                errorMessage={rejectError}
            />

            <DocumentPreviewModal
                open={Boolean(previewDoc)}
                onClose={() => setPreviewDoc(null)}
                document={previewDoc}
            />
        </PpLayout>
    );
}
