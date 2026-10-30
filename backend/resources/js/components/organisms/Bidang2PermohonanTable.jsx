import { Link } from '@inertiajs/react';
import { ArrowRight, ClipboardList } from 'lucide-react';
import Bidang2PermohonanRow from '../molecules/Bidang2PermohonanRow';

const COLS = ['NO PERMOHONAN', 'JUDUL PENGADAAN', 'TANGGAL', 'NILAI PENGAJUAN', 'STATUS', 'AKSI'];

function SkeletonRow() {
    return (
        <tr className="border-b border-[#E4EBE8] animate-pulse" aria-hidden="true">
            <td className="py-4 px-4"><div className="h-4 w-24 bg-[#EEF5F2] rounded" /></td>
            <td className="py-4 px-4">
                <div className="h-4 w-44 bg-[#EEF5F2] rounded mb-1" />
                <div className="h-3 w-28 bg-[#EEF5F2] rounded" />
            </td>
            <td className="py-4 px-4"><div className="h-4 w-20 bg-[#EEF5F2] rounded" /></td>
            <td className="py-4 px-4"><div className="h-4 w-28 bg-[#EEF5F2] rounded" /></td>
            <td className="py-4 px-4"><div className="h-6 w-20 bg-[#EEF5F2] rounded-full" /></td>
            <td className="py-4 px-4 text-center"><div className="h-8 w-8 bg-[#EEF5F2] rounded-lg mx-auto" /></td>
        </tr>
    );
}

function EmptyState() {
    return (
        <tr>
            <td colSpan={COLS.length} className="py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#EEF5F2] text-[#0E7C5A] flex items-center justify-center mx-auto mb-3">
                    <ClipboardList className="w-6 h-6" aria-hidden="true" />
                </div>
                <p className="text-sm font-semibold text-[#14201C]">Belum ada riwayat permohonan</p>
                <p className="text-xs text-[#5F6F6A] mt-1">
                    Permohonan pengadaan yang diproses akan tercatat otomatis pada riwayat ini.
                </p>
            </td>
        </tr>
    );
}

function ErrorState() {
    return (
        <tr>
            <td colSpan={COLS.length} className="py-12 px-4 text-center">
                <p className="text-sm font-medium text-[#B42318]">Gagal memuat data riwayat permohonan.</p>
                <p className="text-xs text-[#8A9A95] mt-1">Silakan muat ulang halaman untuk mencoba kembali.</p>
            </td>
        </tr>
    );
}

export default function Bidang2PermohonanTable({
    rows = [],
    isLoading = false,
    isError = false,
    onDetail,
}) {
    return (
        <section
            className="bg-white border border-[#E4EBE8] rounded-[18px] shadow-[0_1px_3px_rgba(20,32,28,0.04)] overflow-hidden"
            aria-labelledby="bidang2-permohonan-table-title"
            aria-busy={isLoading || undefined}
        >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4EBE8]">
                <div>
                    <h2
                        id="bidang2-permohonan-table-title"
                        className="text-[15px] font-bold text-[#14201C] tracking-tight"
                    >
                        Riwayat Permohonan Terbaru
                    </h2>
                    <p className="text-[12px] text-[#5F6F6A] mt-0.5">
                        {isLoading ? 'Memuat...' : `${rows.length} permohonan terakhir yang telah diproses`}
                    </p>
                </div>

                <Link
                    href="/bidang-2/pengajuan"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E7C5A] hover:text-[#0B6B4D] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] rounded px-2 py-1"
                >
                    <span>Lihat Semua</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] border-collapse">
                    <thead>
                        <tr className="border-b border-[#E4EBE8] bg-[#FAFCFB]">
                            {COLS.map((col, idx) => (
                                <th
                                    key={col}
                                    className={`py-3 px-4 text-[11px] font-bold text-[#8A9A95] uppercase tracking-wider whitespace-nowrap ${
                                        idx === COLS.length - 1 ? 'text-center' : 'text-left'
                                    }`}
                                    scope="col"
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                        ) : isError ? (
                            <ErrorState />
                        ) : rows.length === 0 ? (
                            <EmptyState />
                        ) : (
                            rows.map((row) => (
                                <Bidang2PermohonanRow
                                    key={row.id}
                                    permohonan={row}
                                    onDetail={onDetail}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
