import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    FileText,
    Download,
    Eye,
    CheckCircle2,
    XCircle,
    Building2,
    Calendar,
    Banknote,
    Activity,
    Hash,
    Tag,
    Plus,
    Send,
    User,
    Check,
    Clock,
    Hourglass,
    ChevronDown,
    X,
} from 'lucide-react';
import PpLayout from '../../../components/templates/PpLayout';
import DocumentPreviewModal from '../../../components/organisms/DocumentPreviewModal';
import { PERENCANAAN_NAV_ITEMS } from '../Dashboard';

const DEFAULT_MAKS = [
    { id: 1, label: '521211 - Belanja Bahan' },
    { id: 2, label: '522141 - Belanja Sewa' },
    { id: 3, label: '523111 - Belanja Pemeliharaan Gedung dan Bangunan' },
    { id: 4, label: '524111 - Belanja Perjalanan Dinas Biasa' },
    { id: 5, label: '532111 - Belanja Modal Peralatan dan Mesin' },
    { id: 6, label: '533111 - Belanja Modal Gedung dan Bangunan' },
];

export default function Show({ detail = {}, recentNotifications = [], unreadNotificationsCount = 0 }) {
    const permohonan = detail.permohonan || {};
    const rawStatus = permohonan.status || 'diajukan';

    const mode =
        rawStatus === 'diajukan' || rawStatus === 'menunggu_verifikasi'
            ? 'verifikasi'
            : rawStatus === 'pengadaan' || rawStatus === 'disetujui'
              ? 'pengadaan'
              : 'diteruskan';

    const maksList =
        detail.maks && detail.maks.length >= 4
            ? detail.maks.map((m, idx) => ({
                  id: m.id,
                  label: m.nama.includes('-') ? m.nama : `${521211 + idx * 1000} - ${m.nama}`,
              }))
            : DEFAULT_MAKS;

    const initialMakIds =
        detail.selected_mak_ids && detail.selected_mak_ids.length > 0
            ? detail.selected_mak_ids
            : [maksList[0]?.id || 1];

    // Dynamic dropdown rows for Verifikasi Anggaran
    const [makSelects, setMakSelects] = useState([maksList[4]?.id || maksList[0]?.id || 1]);
    const [singleMakId, setSingleMakId] = useState(initialMakIds[0] || maksList[0]?.id || 1);

    const [previewDoc, setPreviewDoc] = useState(null);
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [alasanPenolakan, setAlasanPenolakan] = useState('');
    const [alasanError, setAlasanError] = useState('');
    const [processing, setProcessing] = useState(false);
    const [showAllLogs, setShowAllLogs] = useState(false);

    const nomorSurat = permohonan.nomor_surat || '111-FFF-111';
    const judul = permohonan.judul || 'Pengadaan Komputer';
    const unitNama = permohonan.unit?.nama || 'Jurusan Teknik Informatika & Komputer';
    const nominal = permohonan.estimasi_anggaran || permohonan.nominal || 100000000;

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        })
            .format(val || 0)
            .replace(/\s+/g, '');
    };

    const formatDate = (dateString) => {
        if (!dateString) return '04 Maret 2027';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    const handleAddMakDropdown = () => {
        const nextUnused = maksList.find((m) => !makSelects.includes(m.id))?.id || maksList[0]?.id || 1;
        setMakSelects((prev) => [...prev, nextUnused]);
    };

    const handleMakDropdownChange = (idx, val) => {
        const numVal = Number(val);
        setMakSelects((prev) => prev.map((item, i) => (i === idx ? numVal : item)));
    };

    const handleApproveSubmit = () => {
        const validIds = makSelects.filter(Boolean);
        if (validIds.length === 0) return;
        setProcessing(true);
        router.post(
            `/perencanaan/pengajuan/${permohonan.id}/approve`,
            { mak_ids: validIds },
            {
                preserveScroll: true,
                onFinish: () => {
                    setProcessing(false);
                    setApproveModalOpen(false);
                },
            }
        );
    };

    const handleRejectSubmit = (e) => {
        e.preventDefault();
        if (!alasanPenolakan || alasanPenolakan.trim().length < 5) {
            setAlasanError('Catatan penolakan wajib diisi minimal 5 karakter.');
            return;
        }
        setAlasanError('');
        setProcessing(true);
        router.post(
            `/perencanaan/pengajuan/${permohonan.id}/reject`,
            { alasan: alasanPenolakan },
            {
                preserveScroll: true,
                onFinish: () => {
                    setProcessing(false);
                    setRejectModalOpen(false);
                },
            }
        );
    };

    const handleKirimPengadaan = () => {
        setProcessing(true);
        router.post(
            `/perencanaan/pengajuan/${permohonan.id}/kirim-pengadaan`,
            { mak_id: singleMakId },
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
            }
        );
    };

    const selectedMakObjects = maksList.filter((m) => makSelects.includes(m.id));

    const renderStatusPill = () => {
        if (mode === 'verifikasi') {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F0FF] text-[#2F68D6]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2F68D6]" />
                    Diajukan
                </span>
            );
        }
        if (mode === 'pengadaan') {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F3E8FF] text-[#7E22CE]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7E22CE]" />
                    Pengadaan
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

    return (
        <PpLayout
            activeRoute="pengajuan"
            notifications={recentNotifications}
            unreadCount={unreadNotificationsCount}
            navItems={PERENCANAAN_NAV_ITEMS}
            roleInitials="PR"
            roleTitle="Perencanaan"
            roleSubtitle="Unit Perencanaan"
            profileHref="/perencanaan/profil"
            notifikasiHref="/perencanaan/notifikasi"
            readAllHref="/perencanaan/notifikasi/read-all"
            breadcrumb={[
                { label: 'DASHBOARD', href: '/perencanaan/dashboard' },
                { label: mode === 'pengadaan' ? 'DETAIL PENGADAAN' : 'DETAIL PERMOHONAN' },
            ]}
        >
            <Head title={`Detail Permohonan - ${nomorSurat}`} />

            {/* Hero Top Banner */}
            <div className="relative overflow-hidden rounded-[24px] bg-[#0E7C5A] p-6 sm:px-9 sm:py-7 text-white shadow-[0_10px_24px_rgba(13,51,38,0.14)] mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                    <div>
                        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/75 block mb-1">
                            {mode === 'pengadaan' ? 'PENGADAAN MASUK' : 'PERMOHONAN MASUK'}
                        </span>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight">
                                {mode === 'pengadaan' ? 'Detail Pengadaan' : 'Detail Permohonan'}
                            </h1>
                            {renderStatusPill()}
                        </div>
                        <p className="text-xs text-white/85 mt-1.5">
                            Nomor {nomorSurat} &middot; Diajukan {formatDate(permohonan.created_at)}
                        </p>
                    </div>

                    <Link
                        href="/perencanaan/pengajuan"
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

            {/* Card 1: Informasi Permohonan / Pengadaan */}
            <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)] mb-6">
                <div className="pb-4 mb-5 border-b border-[#F0F4F2]">
                    <h3 className="text-base font-bold text-[#14201C]">
                        {mode === 'pengadaan' ? 'Informasi Pengadaan' : 'Informasi Permohonan'}
                    </h3>
                    <p className="text-xs text-[#8A9A95] mt-0.5">
                        {mode === 'pengadaan' ? 'Ringkasan data pengadaan' : 'Ringkasan data yang diajukan'}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 text-xs">
                    <div className="flex items-center gap-3.5 pb-4 border-b border-[#F4F7F5]">
                        <div className="w-10 h-10 rounded-xl bg-[#E8F5EF] flex items-center justify-center text-[#0E7C5A] shrink-0">
                            <Hash className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[#8A9A95] text-[11px]">Nomor Permohonan</p>
                            <p className="font-bold text-[#0E7C5A] text-[13px] mt-0.5">{nomorSurat}</p>
                        </div>
                    </div>

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

                    <div className="flex items-center gap-3.5 pb-4 border-b border-[#F4F7F5]">
                        <div className="w-10 h-10 rounded-xl bg-[#E8F5EF] flex items-center justify-center text-[#0E7C5A] shrink-0">
                            <FileText className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[#8A9A95] text-[11px]">Judul Permohonan</p>
                            <p className="font-bold text-[#14201C] text-[13px] mt-0.5">{judul}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3.5 pb-4 border-b border-[#F4F7F5]">
                        <div className="w-10 h-10 rounded-xl bg-[#E8F5EF] flex items-center justify-center text-[#0E7C5A] shrink-0">
                            <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[#8A9A95] text-[11px]">Diajukan Oleh</p>
                            <p className="font-bold text-[#14201C] text-[13px] mt-0.5">{unitNama}</p>
                        </div>
                    </div>

                    <div
                        className={`flex items-center gap-3.5 ${
                            mode === 'pengadaan' ? 'pb-4 border-b border-[#F4F7F5]' : ''
                        }`}
                    >
                        <div className="w-10 h-10 rounded-xl bg-[#E8F5EF] flex items-center justify-center text-[#0E7C5A] shrink-0">
                            <Banknote className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[#8A9A95] text-[11px]">Nominal/Estimasi</p>
                            <p className="font-bold text-[#14201C] text-[13px] mt-0.5">{formatCurrency(nominal)}</p>
                        </div>
                    </div>

                    <div
                        className={`flex items-center gap-3.5 ${
                            mode === 'pengadaan' ? 'pb-4 border-b border-[#F4F7F5]' : ''
                        }`}
                    >
                        <div className="w-10 h-10 rounded-xl bg-[#E8F5EF] flex items-center justify-center text-[#0E7C5A] shrink-0">
                            <Activity className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[#8A9A95] text-[11px]">Status</p>
                            <div className="mt-0.5">{renderStatusPill()}</div>
                        </div>
                    </div>

                    {mode === 'pengadaan' && (
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-[#E8F5EF] flex items-center justify-center text-[#0E7C5A] shrink-0">
                                <User className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[#8A9A95] text-[11px]">Penanggung Jawab</p>
                                <p className="font-bold text-[#14201C] text-[13px] mt-0.5">Nama PJ</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Content: Mode-specific */}
            {mode !== 'diteruskan' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* Left Column (2 cols): Live Preview Document */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F0F4F2]">
                                <div>
                                    <h3 className="text-base font-bold text-[#14201C]">
                                        {mode === 'pengadaan' ? 'Dokumen Pengadaan' : 'Surat Permohonan'}
                                    </h3>
                                    <p className="text-xs text-[#8A9A95] mt-0.5">
                                        {mode === 'pengadaan'
                                            ? 'Pratinjau dokumen pengadaan'
                                            : 'Pratinjau dokumen yang diajukan pemohon'}
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
                                            {mode === 'pengadaan'
                                                ? 'Dokumen_Pengadaan_Komputer_TIK.pdf'
                                                : 'Surat_Permohonan_Pengadaan_Komputer_TIK.pdf'}
                                        </p>
                                        <p className="text-[11px] text-[#8A9A95]">
                                            PDF &bull; {mode === 'pengadaan' ? '5 MB' : '8 MB'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setPreviewDoc({
                                                label:
                                                    mode === 'pengadaan' ? 'Dokumen Pengadaan' : 'Surat Permohonan',
                                                filename:
                                                    mode === 'pengadaan'
                                                        ? 'Dokumen_Pengadaan_Komputer_TIK.pdf'
                                                        : 'Surat_Permohonan_Pengadaan_Komputer_TIK.pdf',
                                                size: mode === 'pengadaan' ? 'PDF ΓÇó 5 MB' : 'PDF ΓÇó 8 MB',
                                            })
                                        }
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

                            {/* Simulated Document Sheet */}
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
                                                <strong className="text-[#14201C]">
                                                    {mode === 'pengadaan'
                                                        ? `Dokumen ${judul}`
                                                        : `Permohonan ${judul}`}
                                                </strong>
                                            </p>
                                            <p>
                                                <span className="inline-block w-16 text-[#8A9A95]">Tanggal</span>:{' '}
                                                <strong className="text-[#14201C]">
                                                    {formatDate(permohonan.created_at)}
                                                </strong>
                                            </p>
                                        </div>

                                        <div className="text-center py-3">
                                            <h4 className="text-xs font-extrabold text-[#14201C] uppercase tracking-wider">
                                                {mode === 'pengadaan'
                                                    ? 'DOKUMEN PENGADAAN'
                                                    : 'SURAT PERMOHONAN PENGADAAN'}
                                            </h4>
                                        </div>

                                        <p className="text-xs text-[#5F6F6A] leading-relaxed mb-4">
                                            {mode === 'pengadaan'
                                                ? `Dokumen ini memuat rincian kebutuhan, spesifikasi teknis, dan estimasi anggaran ${judul.toLowerCase()} sebesar ${formatCurrency(nominal)} untuk menunjang kegiatan akademik.`
                                                : `Dengan hormat, bersama surat ini kami mengajukan permohonan ${judul.toLowerCase()} dengan estimasi anggaran sebesar ${formatCurrency(nominal)} untuk menunjang kegiatan akademik.`}
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

                    {/* Right Column (1 col): Verifikasi Anggaran / Jenis MAK */}
                    <div className="lg:col-span-1">
                        {mode === 'verifikasi' ? (
                            <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
                                <div className="pb-4 mb-4 border-b border-[#F0F4F2]">
                                    <h3 className="text-base font-bold text-[#14201C]">Verifikasi Anggaran</h3>
                                    <p className="text-xs text-[#8A9A95] mt-0.5">
                                        Tentukan Jenis MAK sebelum menyetujui permohonan
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-xs font-bold text-[#14201C]">
                                        Jenis MAK <span className="text-red-500">*</span>
                                    </label>

                                    {makSelects.map((selectedId, idx) => (
                                        <div key={idx} className="relative">
                                            <select
                                                value={selectedId}
                                                onChange={(e) => handleMakDropdownChange(idx, e.target.value)}
                                                className="w-full appearance-none px-4 py-3 pr-9 rounded-xl border border-[#E4EBE8] bg-white text-xs font-medium text-[#14201C] focus:outline-none focus:border-[#0E7C5A] transition cursor-pointer"
                                            >
                                                {maksList.map((m) => (
                                                    <option key={m.id} value={m.id}>
                                                        {m.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="w-4 h-4 text-[#8A9A95] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                    ))}

                                    <p className="text-[11px] text-[#8A9A95]">
                                        Pilih Jenis MAK sesuai kebutuhan pengadaan.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={handleAddMakDropdown}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E4EBE8] bg-white hover:bg-[#F4F7F5] text-xs font-bold text-[#14201C] transition cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5 text-[#0E7C5A]" />
                                        <span>Tambah Jenis MAK</span>
                                    </button>
                                </div>

                                <div className="pt-5 mt-5 border-t border-[#F0F4F2] grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setRejectModalOpen(true)}
                                        className="py-3 px-3 rounded-xl border border-[#FECDCA] bg-[#FEE4E2]/70 hover:bg-[#FEE4E2] text-xs font-bold text-[#D92D20] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <XCircle className="w-4 h-4 shrink-0" />
                                        <span>Tolak Permohonan</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setApproveModalOpen(true)}
                                        className="py-3 px-3 rounded-xl bg-[#0E7C5A] hover:bg-[#0A5C43] text-xs font-bold text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                                    >
                                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                                        <span>Setujui Permohonan</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
                                <div className="pb-4 mb-4 border-b border-[#F0F4F2]">
                                    <h3 className="text-base font-bold text-[#14201C]">Jenis MAK</h3>
                                    <p className="text-xs text-[#8A9A95] mt-0.5">
                                        Tentukan atau ubah Jenis MAK sebelum mengirim pengadaan
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#14201C] mb-2">
                                        Jenis MAK <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Tag className="w-4 h-4 text-[#0E7C5A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        <select
                                            value={singleMakId}
                                            onChange={(e) => setSingleMakId(Number(e.target.value))}
                                            className="w-full appearance-none pl-10 pr-9 py-3 rounded-xl border border-[#E4EBE8] bg-white text-xs font-bold text-[#14201C] focus:outline-none focus:border-[#0E7C5A] transition cursor-pointer"
                                        >
                                            {maksList.map((m) => (
                                                <option key={m.id} value={m.id}>
                                                    {m.label}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="w-4 h-4 text-[#8A9A95] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                    <p className="text-[11px] text-[#8A9A95] mt-2">
                                        Pilih kode MAK sesuai kebutuhan pengadaan.
                                    </p>
                                </div>

                                <div className="pt-5 mt-5 border-t border-[#F0F4F2]">
                                    <button
                                        type="button"
                                        disabled={processing}
                                        onClick={handleKirimPengadaan}
                                        className="w-full py-3 px-4 rounded-xl bg-[#0E7C5A] hover:bg-[#0A5C43] disabled:opacity-50 text-xs font-bold text-white transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                                    >
                                        <Send className="w-4 h-4" />
                                        <span>{processing ? 'Mengirim...' : 'Kirim Pengadaan'}</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Mode Diteruskan (matches Detail Permohonan Diteruskan.png) */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Column (7 cols): Dokumen Permohonan */}
                    <div className="lg:col-span-7 bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
                        <div className="pb-4 mb-5 border-b border-[#F0F4F2]">
                            <h3 className="text-base font-bold text-[#14201C]">Dokumen Permohonan</h3>
                            <p className="text-xs text-[#8A9A95] mt-0.5">Dokumen telah diajukan</p>
                        </div>

                        <div className="space-y-4">
                            {/* Box 1: Surat Permohonan */}
                            <div className="p-4 rounded-2xl border border-[#E4EBE8] bg-white">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center shrink-0">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-bold text-[#0E7C5A]">Surat Permohonan</p>
                                            <p className="text-xs font-bold text-[#14201C] truncate mt-0.5">
                                                Surat_Permohonan_Pengadaan_Komputer_TIK.pdf
                                            </p>
                                            <p className="text-[11px] text-[#8A9A95]">PDF &bull; 8 MB</p>
                                        </div>
                                    </div>
                                    <a
                                        href="/pp/dokumen/1/download"
                                        className="w-9 h-9 rounded-xl border border-[#E4EBE8] bg-white hover:bg-[#F4F7F5] text-[#5F6F6A] flex items-center justify-center shrink-0"
                                    >
                                        <Download className="w-4 h-4" />
                                    </a>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setPreviewDoc({
                                            label: 'Surat Permohonan',
                                            filename: 'Surat_Permohonan_Pengadaan_Komputer_TIK.pdf',
                                            size: 'PDF ΓÇó 8 MB',
                                        })
                                    }
                                    className="w-full mt-3.5 py-2.5 rounded-xl border border-[#E4EBE8] bg-white hover:bg-[#F4F9F6] text-xs font-bold text-[#0E7C5A] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Lihat Dokumen</span>
                                </button>
                            </div>

                            {/* Box 2: Dokumen Pengadaan + Jenis MAK */}
                            <div className="p-4 rounded-2xl border border-[#E4EBE8] bg-white">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center shrink-0">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-bold text-[#0E7C5A]">Dokumen Pengadaan</p>
                                            <p className="text-xs font-bold text-[#14201C] truncate mt-0.5">
                                                Dokumen_Pengadaan_Komputer_TIK.pdf
                                            </p>
                                            <p className="text-[11px] text-[#8A9A95]">PDF &bull; 5 MB</p>
                                        </div>
                                    </div>
                                    <a
                                        href="/pp/dokumen/1/download"
                                        className="w-9 h-9 rounded-xl border border-[#E4EBE8] bg-white hover:bg-[#F4F7F5] text-[#5F6F6A] flex items-center justify-center shrink-0"
                                    >
                                        <Download className="w-4 h-4" />
                                    </a>
                                </div>

                                {/* Green Jenis MAK box inside card */}
                                <div className="mt-3.5 p-3.5 rounded-xl bg-[#EAF6F1] flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white text-[#0E7C5A] flex items-center justify-center shrink-0">
                                        <Tag className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="text-xs">
                                        <p className="text-[11px] font-semibold text-[#0E7C5A]">Jenis MAK</p>
                                        <p className="font-bold text-[#14201C] mt-0.5">
                                            Belanja Modal Peralatan dan Mesin
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setPreviewDoc({
                                            label: 'Dokumen Pengadaan',
                                            filename: 'Dokumen_Pengadaan_Komputer_TIK.pdf',
                                            size: 'PDF ΓÇó 5 MB',
                                        })
                                    }
                                    className="w-full mt-3.5 py-2.5 rounded-xl border border-[#E4EBE8] bg-white hover:bg-[#F4F9F6] text-xs font-bold text-[#0E7C5A] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Lihat Dokumen</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (5 cols): Horizontal Timeline Proses */}
                    <div className="lg:col-span-5 bg-white rounded-[22px] p-6 border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.04)]">
                        <div className="pb-4 mb-5 border-b border-[#F0F4F2]">
                            <h3 className="text-base font-bold text-[#14201C]">Timeline Proses</h3>
                            <p className="text-xs text-[#8A9A95] mt-0.5">Tahapan alur permohonan</p>
                        </div>

                        {/* Horizontal 5-step Stepper */}
                        <div className="relative flex items-start justify-between gap-1 pb-6 border-b border-[#F0F4F2]">
                            {/* Connector Lines */}
                            <div className="absolute top-3.5 left-6 right-6 h-0.5 bg-[#E4EBE8] z-0" />
                            <div className="absolute top-3.5 left-6 w-1/4 h-0.5 bg-[#0E7C5A] z-0" />

                            {[
                                {
                                    title: 'Permohonan',
                                    time: '01 Okt, 10:30',
                                    state: 'done',
                                },
                                {
                                    title: 'Pengadaan',
                                    time: '05 Okt, 14:20',
                                    extra: 'Dipilih: 532111',
                                    state: 'active',
                                },
                                {
                                    title: 'Pembelian Barang',
                                    time: '08 Okt, 11:00',
                                    extra: 'Estimasi',
                                    state: 'pending',
                                },
                                {
                                    title: 'Penerimaan Barang',
                                    time: '12 Okt, 09:00',
                                    extra: 'Estimasi',
                                    state: 'pending',
                                },
                                {
                                    title: 'Selesai',
                                    time: '15 Okt, 16:00',
                                    extra: 'Estimasi',
                                    state: 'pending',
                                },
                            ].map((step) => (
                                <div
                                    key={step.title}
                                    className="relative z-10 flex flex-col items-center text-center flex-1"
                                >
                                    {step.state === 'done' || step.state === 'active' ? (
                                        <div className="w-7 h-7 rounded-full bg-[#0E7C5A] text-white flex items-center justify-center shadow-2xs">
                                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                        </div>
                                    ) : (
                                        <div className="w-7 h-7 rounded-full bg-[#F4F7F5] border border-[#E4EBE8] text-[#8A9A95] flex items-center justify-center">
                                            <Hourglass className="w-3 h-3" />
                                        </div>
                                    )}
                                    <p
                                        className={`text-[11px] font-bold mt-2 leading-tight ${
                                            step.state === 'active'
                                                ? 'text-[#0E7C5A]'
                                                : step.state === 'done'
                                                  ? 'text-[#14201C]'
                                                  : 'text-[#5F6F6A]'
                                        }`}
                                    >
                                        {step.title}
                                    </p>
                                    <p
                                        className={`text-[10px] mt-0.5 ${
                                            step.state === 'done' || step.state === 'active'
                                                ? 'text-[#0E7C5A] font-medium'
                                                : 'text-[#8A9A95]'
                                        }`}
                                    >
                                        {step.time}
                                    </p>
                                    {step.extra && (
                                        <p
                                            className={`text-[9.5px] leading-tight mt-0.5 ${
                                                step.state === 'active'
                                                    ? 'text-[#0E7C5A] font-semibold'
                                                    : 'text-[#9AA8A3]'
                                            }`}
                                        >
                                            {step.extra}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Log Activity List */}
                        <div className="py-4 space-y-3 text-xs">
                            <div className="flex items-center gap-3">
                                <span className="text-[#8A9A95] w-28 shrink-0">05 Okt 2027, 14:20</span>
                                <span className="w-2 h-2 rounded-full bg-[#0E7C5A] shrink-0" />
                                <span className="font-semibold text-[#14201C]">
                                    Permohonan disetujui oleh Perencanaan
                                </span>
                            </div>
                            {showAllLogs && (
                                <div className="flex items-center gap-3">
                                    <span className="text-[#8A9A95] w-28 shrink-0">01 Okt 2027, 10:30</span>
                                    <span className="w-2 h-2 rounded-full bg-[#0E7C5A] shrink-0" />
                                    <span className="font-semibold text-[#14201C]">
                                        Permohonan diajukan oleh {unitNama}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="text-center pt-1">
                            <button
                                type="button"
                                onClick={() => setShowAllLogs((v) => !v)}
                                className="inline-flex items-center gap-1 text-xs font-bold text-[#0E7C5A] hover:underline cursor-pointer"
                            >
                                <span>{showAllLogs ? 'Sembunyikan' : 'Tampilkan Lebih Banyak'}</span>
                                <ChevronDown
                                    className={`w-3.5 h-3.5 transition-transform ${showAllLogs ? 'rotate-180' : ''}`}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi Setuju (matches Modal Konfirmasi Setuju.png) */}
            {approveModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4">
                    <div className="bg-white rounded-[24px] shadow-xl w-full max-w-[440px] p-6 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-14 h-14 rounded-full bg-[#EAF6F1] text-[#0E7C5A] flex items-center justify-center mb-4">
                                <CheckCircle2 className="w-7 h-7" />
                            </div>
                            <h3 className="text-lg font-bold text-[#14201C]">Setujui Permohonan?</h3>
                            <p className="text-xs text-[#5F6F6A] mt-1.5 leading-relaxed max-w-xs">
                                Pastikan Jenis MAK dan data permohonan sudah benar. Setelah disetujui, permohonan
                                diteruskan ke tahap pengadaan.
                            </p>
                        </div>

                        <div className="mt-5 rounded-2xl bg-[#F4F7F5] p-4 space-y-2.5 text-xs">
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-[#8A9A95]">Nomor</span>
                                <span className="col-span-2 font-bold text-[#0E7C5A]">{nomorSurat}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-[#8A9A95]">Judul</span>
                                <span className="col-span-2 font-bold text-[#14201C]">{judul}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-[#8A9A95]">Nominal</span>
                                <span className="col-span-2 font-bold text-[#14201C]">{formatCurrency(nominal)}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-[#8A9A95]">Jenis MAK</span>
                                <div className="col-span-2 font-bold text-[#14201C] space-y-1">
                                    {(selectedMakObjects.length > 0 ? selectedMakObjects : [maksList[4]]).map((m) => (
                                        <p key={m.id}>{m.label}</p>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setApproveModalOpen(false)}
                                className="py-3 px-4 rounded-xl border border-[#E4EBE8] bg-white hover:bg-gray-50 text-xs font-bold text-[#14201C] transition cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={processing}
                                onClick={handleApproveSubmit}
                                className="inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-[#0E7C5A] hover:bg-[#0A5C43] disabled:opacity-50 text-xs font-bold text-white transition cursor-pointer"
                            >
                                <Check className="w-4 h-4" />
                                <span>{processing ? 'Memproses...' : 'Ya, Setujui'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Tolak Permohonan (matches Modal Tolak Permohonan.png) */}
            {rejectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4">
                    <form
                        onSubmit={handleRejectSubmit}
                        className="bg-white rounded-[24px] shadow-xl w-full max-w-[460px] p-6 relative animate-in fade-in zoom-in-95 duration-150"
                    >
                        <button
                            type="button"
                            onClick={() => setRejectModalOpen(false)}
                            className="absolute top-5 right-5 w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center transition cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-3.5 mb-5">
                            <div className="w-11 h-11 rounded-2xl bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center shrink-0">
                                <XCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-[#14201C]">Tolak Permohonan</h3>
                                <p className="text-xs text-[#8A9A95] mt-0.5">
                                    Nomor {nomorSurat} &bull; {judul}
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#14201C] mb-2">
                                Catatan Penolakan <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                rows={4}
                                maxLength={500}
                                value={alasanPenolakan}
                                onChange={(e) => setAlasanPenolakan(e.target.value)}
                                placeholder="Tuliskan alasan penolakan agar pemohon dapat memperbaiki permohonan..."
                                className="w-full rounded-xl border border-[#E4EBE8] bg-white p-3.5 text-xs text-[#14201C] placeholder:text-[#8A9A95] focus:outline-none focus:border-[#D92D20] transition"
                            />
                            <div className="flex items-center justify-between text-[11px] text-[#8A9A95] mt-1.5">
                                <span>Catatan dikirim ke pemohon sebagai dasar revisi permohonan.</span>
                                <span>{alasanPenolakan.length}/500</span>
                            </div>
                            {alasanError && <p className="text-xs text-red-600 mt-1">{alasanError}</p>}
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setRejectModalOpen(false)}
                                className="py-2.5 px-5 rounded-xl border border-[#E4EBE8] bg-white hover:bg-gray-50 text-xs font-bold text-[#14201C] transition cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-5 rounded-xl bg-[#E5484D] hover:bg-[#D92D20] disabled:opacity-50 text-xs font-bold text-white transition cursor-pointer"
                            >
                                <XCircle className="w-4 h-4" />
                                <span>{processing ? 'Memproses...' : 'Tolak Permohonan'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <DocumentPreviewModal
                open={Boolean(previewDoc)}
                onClose={() => setPreviewDoc(null)}
                document={previewDoc}
            />
        </PpLayout>
    );
}
