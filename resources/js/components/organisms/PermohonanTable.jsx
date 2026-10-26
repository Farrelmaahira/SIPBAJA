import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { ClipboardList, Plus } from 'lucide-react';
import PermohonanRow from '../molecules/PermohonanRow';
import DetailPermohonanModal from './DetailPermohonanModal';

const COLS = ['No Permohonan', 'Judul Pengadaan', 'Tanggal', 'Nilai Pengajuan', 'Status', 'Aksi'];

function SkeletonRow() {
    return (
        <tr className="border-b border-[#E4EBE8] animate-pulse" aria-hidden="true">
            <td className="py-4 px-4"><div className="h-4 w-28 bg-[#EEF5F2] rounded" /></td>
            <td className="py-4 px-4"><div className="h-4 w-48 bg-[#EEF5F2] rounded" /></td>
            <td className="py-4 px-4"><div className="h-4 w-20 bg-[#EEF5F2] rounded" /></td>
            <td className="py-4 px-4"><div className="h-4 w-24 bg-[#EEF5F2] rounded" /></td>
            <td className="py-4 px-4"><div className="h-6 w-20 bg-[#EEF5F2] rounded-full" /></td>
            <td className="py-4 px-4 text-right"><div className="h-8 w-8 bg-[#EEF5F2] rounded-lg ml-auto" /></td>
        </tr>
    );
}

function EmptyState({ onBuatPermohonan }) {
    return (
        <tr>
            <td colSpan={COLS.length} className="py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center mx-auto mb-3">
                    <ClipboardList className="w-6 h-6" aria-hidden="true" />
                </div>
                <p className="text-sm font-semibold text-[#14201C]">Tidak ada permohonan aktif</p>
                <p className="text-xs text-[#5F6F6A] mt-1 mb-4">
                    Buat permohonan pengadaan pertama unit Anda untuk memulai.
                </p>
                {onBuatPermohonan && (
                    <button
                        type="button"
                        onClick={onBuatPermohonan}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0E7C5A] text-white text-sm font-semibold hover:bg-[#0B6B4D] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] focus-visible:ring-offset-2 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" aria-hidden="true" />
                        Buat Permohonan
                    </button>
                )}
            </td>
        </tr>
    );
}

function ErrorState() {
    return (
        <tr>
            <td colSpan={COLS.length} className="py-12 px-4 text-center">
                <p className="text-sm font-medium text-[#B42318]">Gagal memuat data permohonan.</p>
                <p className="text-xs text-[#8A9A95] mt-1">Coba muat ulang halaman untuk mencoba lagi.</p>
            </td>
        </tr>
    );
}

export default function PermohonanTable({ rows = [], isLoading = false, isError = false, onBuatPermohonan }) {
    const [selectedPermohonan, setSelectedPermohonan] = useState(null);

    return (
        <section
            className="bg-white border border-[#E4EBE8] rounded-[18px] shadow-[0_1px_3px_rgba(20,32,28,0.04)] overflow-hidden"
            aria-labelledby="permohonan-table-title"
            aria-busy={isLoading || undefined}
        >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4EBE8]">
                <div>
                    <h2
                        id="permohonan-table-title"
                        className="text-[15px] font-bold text-[#14201C] tracking-tight"
                    >
                        Permohonan Sedang Berlangsung
                    </h2>
                    <p className="text-[12px] text-[#5F6F6A] mt-0.5">
                        {isLoading ? 'Memuat...' : `${rows.length} permohonan aktif`}
                    </p>
                </div>

                <Link
                    href="/pemohon/permohonan"
                    className="text-sm font-semibold text-[#0E7C5A] hover:text-[#0B6B4D] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] rounded"
                >
                    Lihat Semua
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse">
                    <thead>
                        <tr className="border-b border-[#E4EBE8]">
                            {COLS.map((col) => (
                                <th
                                    key={col}
                                    className="py-3 px-4 text-left text-[11px] font-bold text-[#8A9A95] uppercase tracking-wider whitespace-nowrap"
                                    scope="col"
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && (
                            <>
                                <SkeletonRow />
                                <SkeletonRow />
                                <SkeletonRow />
                            </>
                        )}
                        {!isLoading && isError && <ErrorState />}
                        {!isLoading && !isError && rows.length === 0 && (
                            <EmptyState onBuatPermohonan={onBuatPermohonan} />
                        )}
                        {!isLoading && !isError && rows.map((row) => (
                            <PermohonanRow
                                key={row.id}
                                permohonan={row}
                                nomorSurat={row.nomor_surat}
                                judul={row.judul}
                                tanggal={row.created_at}
                                nilaiPengajuan={row.estimasi_anggaran}
                                status={row.status}
                                onDetail={(item) => setSelectedPermohonan(item)}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Detail Permohonan */}
            <DetailPermohonanModal
                isOpen={Boolean(selectedPermohonan)}
                onClose={() => setSelectedPermohonan(null)}
                permohonan={selectedPermohonan}
            />
        </section>
    );
}
