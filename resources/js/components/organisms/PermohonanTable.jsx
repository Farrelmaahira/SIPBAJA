import { ClipboardList, Plus } from 'lucide-react';
import PermohonanRow from '../molecules/PermohonanRow';

const COLS = ['No Permohonan', 'Judul Pengadaan', 'Tanggal', 'Nilai Pengajuan', 'Status', 'Aksi'];

function SkeletonRow() {
    return (
        <tr className="border-b border-[#E4EBE8] animate-pulse">
            {COLS.map((col) => (
                <td key={col} className="py-3.5 px-4">
                    <div className="h-4 rounded bg-[#E4EBE8] w-full max-w-[120px]" />
                </td>
            ))}
        </tr>
    );
}

function EmptyState({ onBuatPermohonan }) {
    return (
        <tr>
            <td colSpan={COLS.length} className="py-12 px-4 text-center">
                <ClipboardList
                    className="w-10 h-10 text-[#C4D2CC] mx-auto mb-3"
                    aria-hidden="true"
                />
                <p className="text-sm font-medium text-[#5F6F6A]">
                    Tidak ada permohonan aktif saat ini.
                </p>
                <p className="text-xs text-[#8A9A95] mt-1 mb-4">
                    Buat permohonan pengadaan pertama unit Anda untuk memulai.
                </p>
                {onBuatPermohonan && (
                    <button
                        type="button"
                        onClick={onBuatPermohonan}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0E7C5A] text-white text-sm font-semibold hover:bg-[#0B6B4D] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] focus-visible:ring-offset-2"
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

                {/*
                 * TODO: Implement pemohon.permohonan.index route.
                 * Link sementara menggunakan href="#" sampai halaman List Permohonan dibuat.
                 */}
                <a
                    href="#"
                    className="text-sm font-semibold text-[#0E7C5A] hover:text-[#0B6B4D] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] rounded"
                    title="Halaman list permohonan belum tersedia"
                    aria-disabled="true"
                >
                    Lihat Semua
                </a>
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
                                nomorSurat={row.nomor_surat}
                                judul={row.judul}
                                tanggal={row.created_at}
                                nilaiPengajuan={row.estimasi_anggaran}
                                status={row.status}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
