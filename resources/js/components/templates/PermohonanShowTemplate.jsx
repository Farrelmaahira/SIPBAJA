import React from 'react';
import { Link } from '@inertiajs/react';
import { LayoutDashboard, ClipboardList, ChevronLeft } from 'lucide-react';
import DashboardShellTemplate from './DashboardShellTemplate';
import StatusPill from '../atoms/StatusPill';
import PermohonanShowMakList from '../molecules/PermohonanShowMakList';
import PermohonanShowPaketList from '../molecules/PermohonanShowPaketList';
import { formatRupiah, formatTanggalIndo } from '../../utils/formatters';

export default function PermohonanShowTemplate({ user = {}, permohonan = {} }) {
    const navItems = [
        {
            key: 'dashboard',
            label: 'Dashboard',
            href: '/ppbj/dashboard',
            icon: LayoutDashboard,
        },
        {
            key: 'pengajuan',
            label: 'Pengajuan',
            href: '/ppbj/permohonan',
            icon: ClipboardList,
        },
    ];

    const isRevised = (permohonan.revisiKe ?? 0) > 0;

    return (
        <DashboardShellTemplate
            sidebarProps={{
                navItems,
                activeRoute: 'pengajuan',
                brandSubtitle: 'Pengadaan Barang & Jasa',
                sectionTitle: 'MENU UTAMA',
            }}
            topbarProps={{
                user,
                showSearch: false,
            }}
        >
            <div className="flex flex-col gap-6 max-w-6xl">
                {/* Back Link & Header */}
                <div className="flex flex-col gap-3">
                    <div>
                        <Link
                            href="/ppbj/permohonan"
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5F6F6A] hover:text-[#0E7C5A] transition-colors group"
                        >
                            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                            <span>Kembali ke Daftar Permohonan</span>
                        </Link>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl font-bold tracking-tight text-[#14201C]">
                                    {permohonan.nomorSurat || '-'}
                                </h1>
                                <StatusPill status={permohonan.status} />
                                {isRevised && (
                                    <span className="inline-flex items-center text-xs font-semibold text-[#B54708] bg-[#FEF6EE] border border-[#FECDCA] px-2 py-0.5 rounded-full">
                                        Revisi ke-{permohonan.revisiKe}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-[#5F6F6A] mt-1">
                                Diajukan pada {formatTanggalIndo(permohonan.tanggalPengajuan, true)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Card 1: Informasi Permohonan */}
                <section
                    className="bg-white rounded-[20px] border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.05)] p-6"
                    aria-labelledby="heading-info"
                >
                    <h2 id="heading-info" className="text-base font-bold text-[#14201C] mb-5">
                        Informasi Permohonan
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8">
                        <div>
                            <span className="block text-xs font-semibold text-[#5F6F6A] uppercase tracking-wider mb-1">
                                Nomor Surat
                            </span>
                            <p className="text-sm font-semibold text-[#14201C]">
                                {permohonan.nomorSurat || '-'}
                            </p>
                        </div>

                        <div>
                            <span className="block text-xs font-semibold text-[#5F6F6A] uppercase tracking-wider mb-1">
                                Unit Kerja Pengaju
                            </span>
                            <p className="text-sm font-semibold text-[#14201C]">
                                {permohonan.unitNama || '-'}
                            </p>
                        </div>

                        <div>
                            <span className="block text-xs font-semibold text-[#5F6F6A] uppercase tracking-wider mb-1">
                                Tanggal Pengajuan
                            </span>
                            <p className="text-sm text-[#14201C]">
                                {formatTanggalIndo(permohonan.tanggalPengajuan, true)}
                            </p>
                        </div>

                        <div>
                            <span className="block text-xs font-semibold text-[#5F6F6A] uppercase tracking-wider mb-1">
                                Pemohon / Pengaju
                            </span>
                            <p className="text-sm text-[#14201C]">
                                {permohonan.pembuatNama || '-'}
                            </p>
                        </div>

                        <div className="md:col-span-2">
                            <span className="block text-xs font-semibold text-[#5F6F6A] uppercase tracking-wider mb-1">
                                Judul Pengadaan
                            </span>
                            <p className="text-sm font-semibold text-[#14201C]">
                                {permohonan.judul || '-'}
                            </p>
                        </div>

                        <div className="md:col-span-2">
                            <span className="block text-xs font-semibold text-[#5F6F6A] uppercase tracking-wider mb-1">
                                Estimasi Anggaran
                            </span>
                            <p className="text-xl font-bold text-[#0E7C5A] tabular-nums">
                                {formatRupiah(permohonan.estimasiAnggaran)}
                            </p>
                        </div>

                        <div className="md:col-span-2 pt-2 border-t border-[#F0F4F2]">
                            <span className="block text-xs font-semibold text-[#5F6F6A] uppercase tracking-wider mb-1.5">
                                Ringkasan Tujuan
                            </span>
                            <p className="text-sm text-[#14201C] leading-relaxed whitespace-pre-line">
                                {permohonan.ringkasanTujuan || '-'}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Card 2: Sumber Dana (MAK) */}
                <section
                    className="bg-white rounded-[20px] border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.05)] p-6"
                    aria-labelledby="heading-mak"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 id="heading-mak" className="text-base font-bold text-[#14201C]">
                            Sumber Dana (MAK)
                        </h2>
                        {permohonan.makList && permohonan.makList.length > 0 && (
                            <span className="text-xs font-semibold text-[#5F6F6A] bg-[#F1F7F4] px-2.5 py-1 rounded-full">
                                {permohonan.makList.length} Mata Anggaran
                            </span>
                        )}
                    </div>
                    <PermohonanShowMakList makList={permohonan.makList} />
                </section>

                {/* Card 3: Daftar Paket Pengadaan */}
                <section
                    className="bg-white rounded-[20px] border border-[#E4EBE8] shadow-[0_4px_16px_rgba(13,51,38,0.05)] p-6"
                    aria-labelledby="heading-paket"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 id="heading-paket" className="text-base font-bold text-[#14201C]">
                            Daftar Paket Pengadaan
                        </h2>
                        {permohonan.paketList && permohonan.paketList.length > 0 && (
                            <span className="text-xs font-semibold text-[#5F6F6A] bg-[#F1F7F4] px-2.5 py-1 rounded-full">
                                {permohonan.paketList.length} Paket
                            </span>
                        )}
                    </div>
                    <PermohonanShowPaketList paketList={permohonan.paketList} />
                </section>
            </div>
        </DashboardShellTemplate>
    );
}
