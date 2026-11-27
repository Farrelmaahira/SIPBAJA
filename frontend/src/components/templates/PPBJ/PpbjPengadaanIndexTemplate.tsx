import { FC, FormEvent } from "react";
import { PpbjPengadaanItem } from "@/types/ppbj";
import AppLayout, { AppTopbarUser } from "../General/AppLayout";
import CrudTable, { CrudColumn } from "@/components/organisms/CrudTable";
import StatusPill from "@/components/atoms/StatusPill";
import { formatRupiah } from "@/utils/formatPermohonan";
import { PPBJ_NAV_ITEMS } from "@/constants/ppbjNav";
import HeroBanner from "@/components/organisms/HeroBanner";
import TableToolbar from "@/components/molecules/TableToolbar";
import TableFooter from "@/components/molecules/TableFooter";


interface PpbjPengadaanIndexTemplateProps {
    user?: AppTopbarUser | null;
    items?: PpbjPengadaanItem[];
    totalCount?: number;
    searchQuery?: string;
    selectedStatuses?: string[];
    selectedBulan?: string;
    selectedTahun?: string;
    currentPage?: number;
    lastPage?: number;
    isLoading?: boolean;
    errorMessage?: string;
    filterModalOpen?: boolean;
    onSearchChange?: (val: string) => void;
    onSearchSubmit?: (e: FormEvent) => void;
    onBulanChange?: (bulan: string) => void;
    onTahunChange?: (tahun: string) => void;
    onPageChange?: (page: number) => void;
    onOpenFilterModal?: () => void;
    onCloseFilterModal?: () => void;
    onApplyFilter?: (statuses: string[]) => void;
}

export const PpbjPengadaanIndexTemplate: FC<PpbjPengadaanIndexTemplateProps> = ({
    user = null,
    items = [],
    totalCount = 0,
    searchQuery = '',
    selectedStatuses = [],
    selectedBulan = '',
    selectedTahun = '',
    currentPage = 1,
    lastPage = 1,
    isLoading = false,
    errorMessage: _errorMessage = '',
    onSearchChange,
    onSearchSubmit,
    onBulanChange,
    onTahunChange,
    onPageChange,
    onOpenFilterModal,

}) => {

    const columns: CrudColumn<PpbjPengadaanItem>[] = [
        {
            key: 'id',
            header: 'No Pengadaan',
            render: (item) => (
                <span className="font-semibold text-xs text-[#14201C]">
                    #{item.id}
                </span>
            )
        },
        {
            key: 'nomorSurat',
            header: 'No Permohonan',
            render: (item) => (
                <span className="font-semibold text-xs text-[#14201C]">
                    {item.permohonan?.nomorSurat || item.permohonan?.nomor_surat || '-'}
                </span>
            )
        },
        {
            key: 'asalPermohonan',
            header: 'Judul Permohonan',
            render: (item) => (
                <span className="font-medium text-xs text-[#14201C] line-clamp-1">
                    {item.permohonan?.judul || '-'}
                </span>
            )
        },
        {
            key: 'makNama',
            header: 'MAK',
            render: (item) => (
                <span className="text-xs text-[#5F6F6A]">
                    {item.makNama || item.permohonanMak?.mak?.nama || item.permohonan?.makList?.join(', ') || '-'}
                </span>
            )
        },
        {
            key: 'nilaiPengadaan',
            header: 'Nilai Pengadaan',
            render: (item) => {
                const nominal = item.nominal ?? (item as any)?.kontrak?.nominal_kontrak ?? null;
                return (
                    <span className="font-bold text-xs text-[#0E7C5A] tabular-nums">
                        {nominal !== null ? formatRupiah(Number(nominal)) : '-'}
                    </span>
                );
            }
        },
        {
            key: 'status',
            header: 'Status',
            render: (item) => (
                <StatusPill
                    status={item.status}
                    label={item.status === 'disetujui' ? 'Review PPBJ' : undefined}
                />
            ),
        },
    ]

    return (
        <>
            <AppLayout
                user={user}
                activeRoute="pengadaan"
                navItems={PPBJ_NAV_ITEMS}
                roleInitials="PB"
                roleTitle="PPBJ"
                roleSubtitle="Penyelenggara Pengadaan Barang & Jasa"
                breadcrumb={[
                    { label: 'DASHBOARD', href: '/ppbj/dashboard' },
                    { label: 'DAFTAR PENGADAAN' }
                ]}
            >
                <div className="space-y-6">
                    <HeroBanner
                        eyebrow="DAFTAR PENGADAAN"
                        title="List Pengadaan"
                        description="Kelola seluruh pengadaan yang ditangani PPBJ"
                    />
                    <CrudTable<PpbjPengadaanItem>
                        title="Daftar Pengadaan"
                        subtitle="Seluruh pengadaan yang dibuat"
                        columns={columns}
                        rows={items}
                        isLoading={isLoading}
                        emptyTitle="Tidak ada permohonan ditemukan"
                        emptyDescription="Belum ada permohonan pengadaan yang sesuai dengan pencarian Anda."
                        className="border-none shadow-none rounded-xl"
                        toolbar={
                            <TableToolbar
                                filterStatusCount={selectedStatuses.length}
                                onFilterStatusClick={onOpenFilterModal}
                                searchValue={searchQuery}
                                onSearchChange={onSearchChange}
                                onSearchSubmit={onSearchSubmit}
                                selectedBulan={selectedBulan}
                                onBulanChange={onBulanChange}
                                selectedTahun={selectedTahun}
                                onTahunChange={onTahunChange}
                                onResetFilters={() => {
                                    onSearchChange('');
                                    onBulanChange('');
                                    onTahunChange('');
                                }}
                                total={totalCount > 0 ? `${totalCount} permohonan` : undefined}
                            />
                        }
                        actions={[
                            {
                                key: 'view',
                                label: 'Detail',
                                href: row => `/ppbj/pengadaan/${row.id}`
                            }
                        ]}
                    />

                    {lastPage > 1 && (
                        <TableFooter
                            currentPage={currentPage}
                            lastPage={lastPage}
                            isLoading={isLoading}
                            onPageChange={onPageChange}
                        />
                    )}
                </div>

            </AppLayout>
        </>
    )
}