import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { LayoutDashboard, ClipboardList, Plus, Search, Filter } from 'lucide-react';
import DashboardShellTemplate from '../../../components/templates/DashboardShellTemplate';
import HeroBanner from '../../../components/organisms/HeroBanner';
import PermohonanRow from '../../../components/molecules/PermohonanRow';
import DetailPermohonanModal from '../../../components/organisms/DetailPermohonanModal';

const NAV_ITEMS = [
    {
        key: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/pemohon/dashboard',
    },
    {
        key: 'permohonan',
        label: 'List Permohonan',
        icon: ClipboardList,
        href: '/pemohon/permohonan',
    },
];

const COLS = ['No Permohonan', 'Judul Pengadaan', 'Tanggal', 'Nilai Pengajuan', 'Status', 'Aksi'];

const STATUS_FILTERS = [
    { key: 'semua', label: 'Semua Status' },
    { key: 'diajukan', label: 'Diajukan' },
    { key: 'menunggu_bidang2', label: 'Menunggu Persetujuan' },
    { key: 'disetujui', label: 'Disetujui' },
    { key: 'ditolak', label: 'Ditolak' },
];

export default function Index({ auth, permohonanList, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'semua');
    const [selectedPermohonan, setSelectedPermohonan] = useState(null);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get(
            '/pemohon/permohonan',
            { search, status: statusFilter },
            { preserveState: true }
        );
    };

    const handleFilterChange = (newStatus) => {
        setStatusFilter(newStatus);
        router.get(
            '/pemohon/permohonan',
            { search, status: newStatus },
            { preserveState: true }
        );
    };

    const sidebarProps = {
        navItems: NAV_ITEMS,
        activeRoute: 'permohonan',
        brandSubtitle: 'Pengadaan Barang & Jasa',
        sectionTitle: 'Menu',
    };

    const topbarProps = {
        user: auth?.user,
    };

    const rows = permohonanList?.data || [];

    return (
        <>
            <Head title="Daftar Permohonan - SIPBAJA" />
            <DashboardShellTemplate sidebarProps={sidebarProps} topbarProps={topbarProps}>
                <HeroBanner
                    eyebrow="DAFTAR PERMOHONAN"
                    title="Riwayat Permohonan Pengadaan"
                    description="Pantau seluruh status dan dokumen permohonan pengadaan barang & jasa unit Anda."
                    ctaLabel="Buat Permohonan"
                    ctaIcon={Plus}
                    onCta={() => router.visit('/pemohon/permohonan/create')}
                />

                {/* Filter and Search Bar */}
                <div className="bg-white rounded-2xl border border-[#E4EBE8] p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                        {STATUS_FILTERS.map((f) => (
                            <button
                                key={f.key}
                                type="button"
                                onClick={() => handleFilterChange(f.key)}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                                    statusFilter === f.key
                                        ? 'bg-[#0E7C5A] text-white shadow-xs'
                                        : 'bg-[#F2F4F7] text-[#667085] hover:bg-[#E4EBE8] hover:text-[#1D2939]'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nomor atau judul..."
                            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#D0D5DD] bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7C5A] focus:border-[#0E7C5A]"
                        />
                        <Search className="w-4 h-4 text-[#98A2B3] absolute left-3 top-1/2 -translate-y-1/2" />
                    </form>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-2xl border border-[#E4EBE8] shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px] border-collapse">
                            <thead>
                                <tr className="border-b border-[#E4EBE8] bg-[#F8FAFA]">
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
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={COLS.length} className="py-12 px-4 text-center">
                                            <p className="text-sm font-semibold text-[#14201C]">
                                                Tidak ada permohonan yang sesuai filter.
                                            </p>
                                            <p className="text-xs text-[#667085] mt-1">
                                                Coba ubah kata kunci pencarian atau status filter.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((row) => (
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
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Links */}
                    {permohonanList?.links && permohonanList.links.length > 3 && (
                        <div className="flex items-center justify-between px-6 py-3.5 border-t border-[#E4EBE8] bg-[#F8FAFA]">
                            <span className="text-xs text-[#667085]">
                                Menampilkan {permohonanList.from || 0} - {permohonanList.to || 0} dari {permohonanList.total} permohonan
                            </span>
                            <div className="flex items-center gap-1">
                                {permohonanList.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        preserveState
                                        className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                                            link.active
                                                ? 'bg-[#0E7C5A] text-white'
                                                : link.url
                                                ? 'bg-white text-[#344054] hover:bg-[#F2F4F7] border border-[#E4EBE8]'
                                                : 'text-[#98A2B3] cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Detail Modal */}
                <DetailPermohonanModal
                    isOpen={Boolean(selectedPermohonan)}
                    onClose={() => setSelectedPermohonan(null)}
                    permohonan={selectedPermohonan}
                />
            </DashboardShellTemplate>
        </>
    );
}
