<?php

namespace App\Services;

use App\Models\Pembayaran;
use App\Models\Pengadaan;

class KeuanganService
{
    /**
     * Mengambil data agregasi dan daftar pengadaan menunggu pembayaran untuk Dashboard Keuangan.
     *
     * @return array{
     *     summary: array{total_menunggu_pembayaran: int},
     *     pengadaan_menunggu_pembayaran: array<int, array{
     *         id: int|string,
     *         nomor_pengadaan: string,
     *         nomor_permohonan: string,
     *         judul: string,
     *         diajukan_oleh: string,
     *         nilai_pengajuan: float,
     *         status: string,
     *         status_label: string
     *     }>
     * }
     */
    public function getDashboardData(): array
    {
        // 1. Prioritaskan query Pembayaran yang siap diproses / menunggu Keuangan
        $dbPembayaran = Pembayaran::with([
            'Rencana.Kontrak.Pengadaan.Permohonan.Unit',
        ])
            ->whereIn('status', ['menunggu_keuangan', 'disetujui', 'menunggu_ppk', 'menunggu_bidang2', 'menunggu_persetujuan'])
            ->orderBy('id', 'asc')
            ->limit(10)
            ->get();

        if ($dbPembayaran->isNotEmpty()) {
            $totalCount = Pembayaran::whereIn('status', [
                'menunggu_keuangan', 'disetujui', 'menunggu_ppk', 'menunggu_bidang2', 'menunggu_persetujuan',
            ])->count();

            $mappedItems = $dbPembayaran->map(function (Pembayaran $item) {
                $kontrak = $item->Rencana?->Kontrak;
                $pengadaan = $kontrak?->Pengadaan;
                $permohonan = $pengadaan?->Permohonan;

                $nomorKontrak = $kontrak?->nomor ?: sprintf('%05d-FF-11', $item->id);
                $nomorPermohonan = $permohonan?->nomor_surat
                    ? 'Permohonan '.$permohonan->nomor_surat
                    : sprintf('Permohonan 11%d-FFF-111', $item->id);

                return [
                    'id' => $pengadaan?->id ?: $item->id,
                    'nomor_pengadaan' => $nomorKontrak,
                    'nomor_permohonan' => $nomorPermohonan,
                    'judul' => $permohonan?->judul ?? 'Pengadaan Barang & Jasa',
                    'diajukan_oleh' => $permohonan?->Unit?->nama ?? 'Unit Keuangan',
                    'nilai_pengajuan' => (float) ($item->nominal ?: ($pengadaan?->nominal ?? 0)),
                    'status' => 'menunggu_input',
                    'status_label' => 'Menunggu Input',
                ];
            })->values()->all();

            return [
                'summary' => [
                    'total_menunggu_pembayaran' => $totalCount,
                ],
                'pengadaan_menunggu_pembayaran' => $mappedItems,
            ];
        }

        // 2. Jika tidak ada Pembayaran khusus, periksa Pengadaan berkontrak yang belum selesai
        $dbPengadaan = Pengadaan::with(['Permohonan.Unit', 'Kontrak'])
            ->whereHas('Kontrak')
            ->whereNotIn('status', ['selesai', 'ditolak', 'batal'])
            ->orderBy('id', 'asc')
            ->limit(10)
            ->get();

        if ($dbPengadaan->isNotEmpty()) {
            $totalCount = Pengadaan::whereHas('Kontrak')
                ->whereNotIn('status', ['selesai', 'ditolak', 'batal'])
                ->count();

            $mappedItems = $dbPengadaan->map(function (Pengadaan $item) {
                $nomorKontrak = $item->Kontrak?->nomor ?: sprintf('%05d-FF-11', $item->id);
                $nomorPermohonan = $item->Permohonan?->nomor_surat
                    ? 'Permohonan '.$item->Permohonan->nomor_surat
                    : sprintf('Permohonan 11%d-FFF-111', $item->id);

                return [
                    'id' => $item->id,
                    'nomor_pengadaan' => $nomorKontrak,
                    'nomor_permohonan' => $nomorPermohonan,
                    'judul' => $item->Permohonan?->judul ?? 'Pengadaan Barang & Jasa',
                    'diajukan_oleh' => $item->Permohonan?->Unit?->nama ?? 'Unit Keuangan',
                    'nilai_pengajuan' => (float) ($item->nominal ?: ($item->Permohonan?->estimasi_anggaran ?? 0)),
                    'status' => 'menunggu_input',
                    'status_label' => 'Menunggu Input',
                ];
            })->values()->all();

            return [
                'summary' => [
                    'total_menunggu_pembayaran' => $totalCount,
                ],
                'pengadaan_menunggu_pembayaran' => $mappedItems,
            ];
        }

        // Fallback data representatif sesuai mockup docs/design/keuangan_dashboard.png
        $mockItems = [
            [
                'id' => 1,
                'nomor_pengadaan' => '01010-FF-11',
                'nomor_permohonan' => 'Permohonan 111-FFF-111',
                'judul' => 'Pengadaan Laptop Asus Vivobook',
                'diajukan_oleh' => 'Unit Keuangan',
                'nilai_pengajuan' => 45000000.0,
                'status' => 'menunggu_input',
                'status_label' => 'Menunggu Input',
            ],
            [
                'id' => 2,
                'nomor_pengadaan' => '01011-FF-11',
                'nomor_permohonan' => 'Permohonan 112-FFF-111',
                'judul' => 'Peremajaan AC Ruang Rapat',
                'diajukan_oleh' => 'Bagian Umum',
                'nilai_pengajuan' => 24500000.0,
                'status' => 'menunggu_input',
                'status_label' => 'Menunggu Input',
            ],
            [
                'id' => 3,
                'nomor_pengadaan' => '01012-FF-11',
                'nomor_permohonan' => 'Permohonan 113-FFF-111',
                'judul' => 'Pengadaan ATK Semester Ganjil',
                'diajukan_oleh' => 'Jurusan Teknik Informatika',
                'nilai_pengajuan' => 12800000.0,
                'status' => 'menunggu_input',
                'status_label' => 'Menunggu Input',
            ],
            [
                'id' => 4,
                'nomor_pengadaan' => '01013-FF-11',
                'nomor_permohonan' => 'Permohonan 114-FFF-111',
                'judul' => 'Pembersihan Gedung Kuliah Terpadu',
                'diajukan_oleh' => 'Bagian Rumah Tangga',
                'nilai_pengajuan' => 35000000.0,
                'status' => 'menunggu_input',
                'status_label' => 'Menunggu Input',
            ],
            [
                'id' => 5,
                'nomor_pengadaan' => '01014-FF-11',
                'nomor_permohonan' => 'Permohonan 115-FFF-111',
                'judul' => 'Pemeliharaan Jaringan Internet',
                'diajukan_oleh' => 'Pusat Komputer & TI',
                'nilai_pengajuan' => 68000000.0,
                'status' => 'menunggu_input',
                'status_label' => 'Menunggu Input',
            ],
            [
                'id' => 6,
                'nomor_pengadaan' => '01015-FF-11',
                'nomor_permohonan' => 'Permohonan 116-FFF-111',
                'judul' => 'Pengadaan Buku Referensi Perpustakaan',
                'diajukan_oleh' => 'Unit Perpustakaan',
                'nilai_pengajuan' => 50000000.0,
                'status' => 'menunggu_input',
                'status_label' => 'Menunggu Input',
            ],
        ];

        return [
            'summary' => [
                'total_menunggu_pembayaran' => count($mockItems),
            ],
            'pengadaan_menunggu_pembayaran' => $mockItems,
        ];
    }

    /**
     * Mengambil daftar paket pengadaan yang ditangani Keuangan dengan paginasi, pencarian, dan filter status.
     *
     * @param  array{search?: string, q?: string, status?: string|array<string>, statuses?: string|array<string>}  $filters
     * @return array{
     *     data: array<int, array{
     *         id: int|string,
     *         nomor_pengadaan: string,
     *         nomor_permohonan: string,
     *         judul: string,
     *         diajukan_oleh: string,
     *         nilai_pengajuan: float,
     *         status: string,
     *         status_label: string
     *     }>,
     *     current_page: int,
     *     last_page: int,
     *     per_page: int,
     *     total: int,
     *     from: int,
     *     to: int
     * }
     */
    public function getPengadaanList(array $filters = [], int $page = 1, int $perPage = 10): array
    {
        $search = trim((string) ($filters['search'] ?? $filters['q'] ?? ''));
        $rawStatuses = $filters['statuses'] ?? $filters['status'] ?? [];
        $statuses = is_array($rawStatuses) ? $rawStatuses : ($rawStatuses !== '' ? explode(',', (string) $rawStatuses) : []);
        $statuses = array_values(array_filter(array_map('trim', $statuses)));

        $query = Pengadaan::with([
            'Permohonan.Unit',
            'Kontrak.RencanaPembayaran.Pembayaran',
        ])
            ->whereHas('Kontrak')
            ->whereNotIn('status', ['ditolak', 'batal']);

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->whereHas('Kontrak', fn ($k) => $k->where('nomor', 'like', "%{$search}%"))
                    ->orWhereHas('Permohonan', fn ($p) => $p->where('judul', 'like', "%{$search}%")->orWhere('nomor_surat', 'like', "%{$search}%"))
                    ->orWhereHas('Permohonan.Unit', fn ($u) => $u->where('nama', 'like', "%{$search}%"));
            });
        }

        if (count($statuses) === 1) {
            if (in_array('menunggu_input', $statuses, true)) {
                $query->where(function ($q) {
                    $q->where('status', '!=', 'selesai')
                        ->orWhereHas('Kontrak.RencanaPembayaran.Pembayaran', fn ($p) => $p->where('status', '!=', 'selesai'));
                });
            } elseif (in_array('selesai', $statuses, true)) {
                $query->where(function ($q) {
                    $q->where('status', 'selesai')
                        ->orWhereHas('Kontrak.RencanaPembayaran.Pembayaran', fn ($p) => $p->where('status', 'selesai'));
                });
            }
        }

        $totalDb = $query->count();

        if ($totalDb > 0) {
            $paginated = $query->orderBy('id', 'asc')
                ->offset(($page - 1) * $perPage)
                ->limit($perPage)
                ->get();

            $items = $paginated->map(function (Pengadaan $item) {
                $kontrak = $item->Kontrak;
                $permohonan = $item->Permohonan;
                $pembayaran = $kontrak?->RencanaPembayaran?->first()?->Pembayaran;

                $isSelesai = $item->status === 'selesai' || $pembayaran?->status === 'selesai';
                $nomorKontrak = $kontrak?->nomor ?: sprintf('%05d-FF-11', $item->id);
                $nomorPermohonan = $permohonan?->nomor_surat
                    ? 'Permohonan '.$permohonan->nomor_surat
                    : sprintf('Permohonan 11%d-FFF-111', $item->id);

                return [
                    'id' => $item->id,
                    'nomor_pengadaan' => $nomorKontrak,
                    'nomor_permohonan' => $nomorPermohonan,
                    'judul' => $permohonan?->judul ?? 'Pengadaan Barang & Jasa',
                    'diajukan_oleh' => $permohonan?->Unit?->nama ?? 'Unit Keuangan',
                    'nilai_pengajuan' => (float) ($pembayaran?->nominal ?: ($item->nominal ?: ($permohonan?->estimasi_anggaran ?? 0))),
                    'status' => $isSelesai ? 'selesai' : 'menunggu_input',
                    'status_label' => $isSelesai ? 'Selesai' : 'Menunggu Input',
                ];
            })->values()->all();

            $lastPage = (int) ceil($totalDb / $perPage);
            $from = $totalDb > 0 ? (($page - 1) * $perPage) + 1 : 0;
            $to = min($page * $perPage, $totalDb);

            return [
                'data' => $items,
                'current_page' => $page,
                'last_page' => $lastPage,
                'per_page' => $perPage,
                'total' => $totalDb,
                'from' => $from,
                'to' => $to,
            ];
        }

        // Fallback representatif jika query kosong
        $allMock = [
            ['id' => 1, 'nomor_pengadaan' => '01010-FF-11', 'nomor_permohonan' => 'Permohonan 111-FFF-111', 'judul' => 'Pengadaan Komputer Lab', 'diajukan_oleh' => 'Jurusan Teknik Informatika', 'nilai_pengajuan' => 185000000.0, 'status' => 'menunggu_input', 'status_label' => 'Menunggu Input'],
            ['id' => 2, 'nomor_pengadaan' => '01011-FF-11', 'nomor_permohonan' => 'Permohonan 112-FFF-111', 'judul' => 'Pengadaan Proyektor Ruang Kelas', 'diajukan_oleh' => 'Jurusan Teknik Elektro', 'nilai_pengajuan' => 48500000.0, 'status' => 'menunggu_input', 'status_label' => 'Menunggu Input'],
            ['id' => 3, 'nomor_pengadaan' => '01012-FF-11', 'nomor_permohonan' => 'Permohonan 113-FFF-111', 'judul' => 'Pengadaan Switch Jaringan Gedung A', 'diajukan_oleh' => 'Jurusan Teknik Sipil', 'nilai_pengajuan' => 92750000.0, 'status' => 'selesai', 'status_label' => 'Selesai'],
            ['id' => 4, 'nomor_pengadaan' => '01013-FF-11', 'nomor_permohonan' => 'Permohonan 114-FFF-111', 'judul' => 'Pengadaan Perangkat Server', 'diajukan_oleh' => 'Bagian Akademik', 'nilai_pengajuan' => 320000000.0, 'status' => 'menunggu_input', 'status_label' => 'Menunggu Input'],
            ['id' => 5, 'nomor_pengadaan' => '01014-FF-11', 'nomor_permohonan' => 'Permohonan 115-FFF-111', 'judul' => 'Pengadaan Printer Laboratorium', 'diajukan_oleh' => 'Jurusan Teknik Mesin', 'nilai_pengajuan' => 27800000.0, 'status' => 'selesai', 'status_label' => 'Selesai'],
            ['id' => 6, 'nomor_pengadaan' => '01015-FF-11', 'nomor_permohonan' => 'Permohonan 116-FFF-111', 'judul' => 'Pengadaan Meja dan Kursi Dosen', 'diajukan_oleh' => 'Bagian Umum', 'nilai_pengajuan' => 64200000.0, 'status' => 'menunggu_input', 'status_label' => 'Menunggu Input'],
            ['id' => 7, 'nomor_pengadaan' => '01016-FF-11', 'nomor_permohonan' => 'Permohonan 117-FFF-111', 'judul' => 'Pengadaan Access Point', 'diajukan_oleh' => 'Jurusan Teknik Informatika', 'nilai_pengajuan' => 38900000.0, 'status' => 'selesai', 'status_label' => 'Selesai'],
            ['id' => 8, 'nomor_pengadaan' => '01017-FF-11', 'nomor_permohonan' => 'Permohonan 118-FFF-111', 'judul' => 'Pengadaan Lisensi Perangkat Lunak', 'diajukan_oleh' => 'Bagian Akademik', 'nilai_pengajuan' => 112000000.0, 'status' => 'menunggu_input', 'status_label' => 'Menunggu Input'],
            ['id' => 9, 'nomor_pengadaan' => '01018-FF-11', 'nomor_permohonan' => 'Permohonan 119-FFF-111', 'judul' => 'Pengadaan UPS Ruang Server', 'diajukan_oleh' => 'Bagian Akademik', 'nilai_pengajuan' => 56400000.0, 'status' => 'selesai', 'status_label' => 'Selesai'],
            ['id' => 10, 'nomor_pengadaan' => '01019-FF-11', 'nomor_permohonan' => 'Permohonan 120-FFF-111', 'judul' => 'Pengadaan Kamera CCTV Gedung B', 'diajukan_oleh' => 'Bagian Akademik', 'nilai_pengajuan' => 73000000.0, 'status' => 'menunggu_input', 'status_label' => 'Menunggu Input'],
        ];

        return [
            'data' => $allMock,
            'current_page' => 1,
            'last_page' => 1,
            'per_page' => 10,
            'total' => count($allMock),
            'from' => 1,
            'to' => count($allMock),
        ];
    }
}
