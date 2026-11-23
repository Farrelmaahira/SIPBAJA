import { FC, useEffect, useState, FormEvent } from "react";
import { PpbjPengadaanIndexTemplate } from "@/components/templates/PPBJ/PpbjPengadaanIndexTemplate";
import type { PpbjPengadaanItem } from "@/types/ppbj";
import ppbjService from "@/services/ppbjService";

export const PpbjPengadaanIndex: FC = () => {
    const [items, setItems] = useState<PpbjPengadaanItem[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [lastPage, setLastPage] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [submittedSearch, setSubmittedSearch] = useState<string>('');
    const [selectedBulan, setSelectedBulan] = useState<string>('');
    const [selectedTahun, setSelectedTahun] = useState<string>('');

    const fetchData = (page = 1, signal?: AbortSignal) => {
        setIsLoading(true);
        ppbjService.fetchPengadaaan(
            {
                page,
                q: submittedSearch,
                bulan: selectedBulan,
                tahun: selectedTahun,
            },
            signal
        )
            .then(res => {
                setItems(res.pengadaan.data || []);
                setCurrentPage(res.pengadaan.current_page || 1);
                setLastPage(res.pengadaan.last_page || 1);
                setTotalCount(res.pengadaan.total || 0);
            })
            .catch(err => {
                if (err instanceof Error && err.name !== 'CanceledError') {
                    console.error('Failed to fetch pengadaan:', err);
                }
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    useEffect(() => {
        const controller = new AbortController();
        fetchData(currentPage, controller.signal);
        return () => controller.abort();
    }, [currentPage, submittedSearch, selectedBulan, selectedTahun]);

    const handleSearchSubmit = (e: FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        setSubmittedSearch(searchQuery);
    };

    return (
        <PpbjPengadaanIndexTemplate
            items={items}
            totalCount={totalCount}
            currentPage={currentPage}
            lastPage={lastPage}
            isLoading={isLoading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchSubmit={handleSearchSubmit}
            selectedBulan={selectedBulan}
            onBulanChange={(b) => {
                setSelectedBulan(b);
                setCurrentPage(1);
            }}
            selectedTahun={selectedTahun}
            onTahunChange={(t) => {
                setSelectedTahun(t);
                setCurrentPage(1);
            }}
            onPageChange={(page) => setCurrentPage(page)}
        />
    );
};

export default PpbjPengadaanIndex;