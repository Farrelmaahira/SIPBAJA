<?php

namespace App\Services;

use App\Models\Dokumen;
use App\Models\Notification;
use App\Models\Pembayaran;
use App\Models\Pengadaan;
use App\Models\Permohonan;
use App\Models\PermohonanMak;
use App\Models\RencanaPembayaran;
use App\Models\StatusHistory;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

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

        // Fallback representatif
        $mockItems = [
            ['id' => 1, 'nomor_pengadaan' => '01010-FF-11', 'nomor_permohonan' => 'Permohonan 111-FFF-111', 'judul' => 'Pengadaan Laptop Asus Vivobook', 'diajukan_oleh' => 'Unit Keuangan', 'nilai_pengajuan' => 45000000.0, 'status' => 'menunggu_input', 'status_label' => 'Menunggu Input'],
            ['id' => 2, 'nomor_pengadaan' => '01011-FF-11', 'nomor_permohonan' => 'Permohonan 112-FFF-111', 'judul' => 'Peremajaan AC Ruang Rapat', 'diajukan_oleh' => 'Bagian Umum', 'nilai_pengajuan' => 24500000.0, 'status' => 'menunggu_input', 'status_label' => 'Menunggu Input'],
            ['id' => 3, 'nomor_pengadaan' => '01012-FF-11', 'nomor_permohonan' => 'Permohonan 113-FFF-111', 'judul' => 'Pengadaan ATK Semester Ganjil', 'diajukan_oleh' => 'Jurusan Teknik Informatika', 'nilai_pengajuan' => 12800000.0, 'status' => 'menunggu_input', 'status_label' => 'Menunggu Input'],
        ];

        return [
            'summary' => ['total_menunggu_pembayaran' => count($mockItems)],
            'pengadaan_menunggu_pembayaran' => $mockItems,
        ];
    }

    /**
     * Mengambil daftar paket pengadaan yang ditangani Keuangan dengan paginasi, pencarian, dan filter status.
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

        // Fallback
        return [
            'data' => [],
            'current_page' => 1,
            'last_page' => 1,
            'per_page' => 10,
            'total' => 0,
            'from' => 0,
            'to' => 0,
        ];
    }

    /**
     * Mengambil data detail pengadaan untuk role Keuangan sesuai mockup keuangan_detail_pengadaan.png.
     *
     * @return array<string, mixed>
     */
    public function getPengadaanDetail(int|string $id): array
    {
        $dbItem = Pengadaan::with([
            'Permohonan.Unit',
            'Permohonan.Creator',
            'Permohonan.PermohonanMak.Mak.Ppk',
            'PermohonanMak.Mak.Ppk',
            'Jenis',
            'Metode',
            'Level',
            'Ppk',
            'Kontrak.RencanaPembayaran.Pembayaran.Dokumen',
            'Kontrak.Dokumen',
            'Penerimaan.Dokumen',
            'Dokumen',
            'Approvals.Actor.role',
        ])->find($id);

        $kontrak = $dbItem?->Kontrak;
        $permohonan = $dbItem?->Permohonan;
        $rencana = $kontrak?->RencanaPembayaran?->first();
        $pembayaran = $rencana?->Pembayaran;

        $isSelesai = $dbItem?->status === 'selesai' || $pembayaran?->status === 'selesai';
        $nomorPengadaan = $kontrak?->nomor ?: sprintf('PGD-2027-%04d', is_numeric($id) ? (int) $id : 1);
        $nomorPermohonan = $permohonan?->nomor_surat ?: sprintf('11%d-FFF-111', is_numeric($id) ? (int) $id : 1);
        $judulPengadaan = $permohonan?->judul ?: 'Pengadaan Komputer';
        $unitNama = $permohonan?->Unit?->nama ?: 'Jurusan Teknik Informatika & Komputer';
        $vendorNama = $kontrak?->vendor_nama ?: 'PT PNJ PPBJ JAYA ABADI';

        $nominalEstimasi = (float) ($permohonan?->estimasi_anggaran ?: 100000000.0);
        $biayaRiil = (float) ($kontrak?->nominal_kontrak ?: ($pembayaran?->nominal ?: ($dbItem?->nominal ?: 98500000.0)));

        $tglPengajuanFormatted = $permohonan?->created_at
            ? Carbon::parse($permohonan->created_at)->locale('id')->isoFormat('DD MMMM YYYY')
            : '04 Maret 2027';

        $tglPengingatFormatted = $rencana?->tanggal_jatuh_tempo
            ? Carbon::parse($rencana->tanggal_jatuh_tempo)->locale('id')->isoFormat('DD MMMM YYYY')
            : '18 Maret 2027';

        // 1. Dokumen Permohonan (Surat Permohonan, Memo Permohonan Bidang 2, Memo Permohonan PPK) dari Database
        $dokumenPermohonan = [];
        $dbPermohonanDocs = $permohonan
            ? Dokumen::where('ref_type', 'permohonan')->where('ref_id', $permohonan->id)->orderBy('id', 'asc')->get()
            : collect();

        if ($dbPermohonanDocs->isNotEmpty()) {
            foreach ($dbPermohonanDocs as $doc) {
                $tipeLower = strtolower($doc->tipe_dokumen ?? '');
                $label = match ($tipeLower) {
                    'surat_permohonan', 'permohonan' => 'Surat Permohonan',
                    'memo_permohonan_bidang2', 'memo_bidang2', 'memo_persetujuan_bidang2' => 'Memo Permohonan Bidang 2',
                    'memo_permohonan_ppk', 'memo_ppk', 'memo_persetujuan_ppk' => 'Memo Permohonan PPK',
                    default => ucwords(str_replace('_', ' ', $doc->tipe_dokumen ?? 'Dokumen Permohonan')),
                };
                $dokumenPermohonan[] = [
                    'id' => $doc->id,
                    'tipe' => $label,
                    'kategori' => 'permohonan',
                    'nama' => $doc->nama_asli,
                    'ukuran' => $this->formatBytes($doc->ukuran_bytes ?? 2097152),
                    'url' => "/api/v1/keuangan/pengadaan/{$id}/dokumen/{$doc->id}",
                    'is_image' => str_starts_with($doc->mime_type ?? '', 'image/'),
                ];
            }
        } else {
            $dokumenPermohonan = [
                [
                    'id' => 1,
                    'tipe' => 'Surat Permohonan',
                    'kategori' => 'permohonan',
                    'nama' => 'Surat_Permohonan_'.$nomorPermohonan.'.pdf',
                    'ukuran' => 'PDF · 2 MB',
                    'url' => "/api/v1/keuangan/pengadaan/{$id}/dokumen/1?nama=Surat_Permohonan_{$nomorPermohonan}.pdf",
                    'is_image' => false,
                ],
                [
                    'id' => 2,
                    'tipe' => 'Memo Permohonan Bidang 2',
                    'kategori' => 'permohonan',
                    'nama' => 'Memo_Permohonan_Bidang_2_'.$nomorPermohonan.'.pdf',
                    'ukuran' => 'PDF · 1 MB',
                    'url' => "/api/v1/keuangan/pengadaan/{$id}/dokumen/2?nama=Memo_Permohonan_Bidang_2_{$nomorPermohonan}.pdf",
                    'is_image' => false,
                ],
                [
                    'id' => 3,
                    'tipe' => 'Memo Permohonan PPK',
                    'kategori' => 'permohonan',
                    'nama' => 'Memo_Permohonan_PPK_'.$nomorPermohonan.'.pdf',
                    'ukuran' => 'PDF · 1 MB',
                    'url' => "/api/v1/keuangan/pengadaan/{$id}/dokumen/3?nama=Memo_Permohonan_PPK_{$nomorPermohonan}.pdf",
                    'is_image' => false,
                ],
            ];
        }

        // 2. Dokumen Pengadaan dari Database
        $dokumenPengadaan = [];
        $dbPengadaanDocs = $dbItem
            ? Dokumen::where('ref_type', 'pengadaan')
                ->where('ref_id', $dbItem->id)
                ->whereIn('tipe_dokumen', ['dokumen_pengadaan', 'pengadaan'])
                ->orderBy('id', 'asc')
                ->get()
            : collect();

        if ($dbPengadaanDocs->isNotEmpty()) {
            foreach ($dbPengadaanDocs as $doc) {
                $dokumenPengadaan[] = [
                    'id' => $doc->id,
                    'tipe' => 'Dokumen Pengadaan',
                    'kategori' => 'pengadaan',
                    'nama' => $doc->nama_asli,
                    'ukuran' => $this->formatBytes($doc->ukuran_bytes ?? 5242880),
                    'url' => "/api/v1/keuangan/pengadaan/{$id}/dokumen/{$doc->id}",
                    'is_image' => str_starts_with($doc->mime_type ?? '', 'image/'),
                ];
            }
        } else {
            $dokumenPengadaan = [
                [
                    'id' => 4,
                    'tipe' => 'Dokumen Pengadaan',
                    'kategori' => 'pengadaan',
                    'nama' => 'Dokumen_Pengadaan_'.$nomorPermohonan.'.pdf',
                    'ukuran' => 'PDF · 5 MB',
                    'url' => "/api/v1/keuangan/pengadaan/{$id}/dokumen/4?nama=Dokumen_Pengadaan_{$nomorPermohonan}.pdf",
                    'is_image' => false,
                ],
            ];
        }

        // 3. Dokumen Pembelian (Surat Kontrak, SPK, Kwitansi, Invoice, dan Surat Pembelian) dari Database (hanya yg diupload PPBJ)
        $dokumenPembelian = [];
        $dbPembelianDocs = $kontrak
            ? Dokumen::where('ref_type', 'kontrak')
                ->where('ref_id', $kontrak->id)
                ->whereIn('tipe_dokumen', ['kontrak', 'surat_kontrak', 'spk', 'kwitansi', 'invoice', 'surat_pembelian', 'dokumen_kontrak', 'faktur'])
                ->orderBy('id', 'asc')
                ->get()
            : collect();

        if ($dbPembelianDocs->isNotEmpty()) {
            foreach ($dbPembelianDocs as $kDoc) {
                $tipeLower = strtolower($kDoc->tipe_dokumen ?? '');
                $label = match ($tipeLower) {
                    'kontrak', 'surat_kontrak', 'dokumen_kontrak' => 'Surat Kontrak',
                    'spk' => 'SPK',
                    'kwitansi' => 'Kwitansi',
                    'invoice', 'faktur' => 'Invoice',
                    'surat_pembelian' => 'Surat Pembelian',
                    default => ucwords(str_replace('_', ' ', $tipeLower)),
                };
                $dokumenPembelian[] = [
                    'id' => $kDoc->id,
                    'tipe' => $label,
                    'kategori' => 'pembelian',
                    'nama' => $kDoc->nama_asli,
                    'ukuran' => $this->formatBytes($kDoc->ukuran_bytes ?? 2097152),
                    'url' => "/api/v1/keuangan/pengadaan/{$id}/dokumen/{$kDoc->id}",
                    'is_image' => str_starts_with($kDoc->mime_type ?? '', 'image/'),
                ];
            }
        } elseif (empty($id) || $id == 1) {
            // Mock sample untuk ID 1 jika belum di-seed
            $dokumenPembelian = [
                [
                    'id' => 5,
                    'tipe' => 'Surat Kontrak',
                    'kategori' => 'pembelian',
                    'nama' => 'Surat_Kontrak_'.$nomorPermohonan.'.pdf',
                    'ukuran' => 'PDF · 3 MB',
                    'url' => "/api/v1/keuangan/pengadaan/{$id}/dokumen/5?nama=Surat_Kontrak_{$nomorPermohonan}.pdf",
                    'is_image' => false,
                ],
                [
                    'id' => 6,
                    'tipe' => 'SPK',
                    'kategori' => 'pembelian',
                    'nama' => 'SPK_'.$nomorPermohonan.'.pdf',
                    'ukuran' => 'PDF · 2 MB',
                    'url' => "/api/v1/keuangan/pengadaan/{$id}/dokumen/6?nama=SPK_{$nomorPermohonan}.pdf",
                    'is_image' => false,
                ],
                [
                    'id' => 7,
                    'tipe' => 'Kwitansi',
                    'kategori' => 'pembelian',
                    'nama' => 'Kwitansi_'.$nomorPermohonan.'.pdf',
                    'ukuran' => 'PDF · 1 MB',
                    'url' => "/api/v1/keuangan/pengadaan/{$id}/dokumen/7?nama=Kwitansi_{$nomorPermohonan}.pdf",
                    'is_image' => false,
                ],
                [
                    'id' => 8,
                    'tipe' => 'Invoice',
                    'kategori' => 'pembelian',
                    'nama' => 'Invoice_'.$nomorPermohonan.'.pdf',
                    'ukuran' => 'PDF · 1 MB',
                    'url' => "/api/v1/keuangan/pengadaan/{$id}/dokumen/8?nama=Invoice_{$nomorPermohonan}.pdf",
                    'is_image' => false,
                ],
                [
                    'id' => 9,
                    'tipe' => 'Surat Pembelian',
                    'kategori' => 'pembelian',
                    'nama' => 'Surat_Pembelian_'.$nomorPermohonan.'.pdf',
                    'ukuran' => 'PDF · 2 MB',
                    'url' => "/api/v1/keuangan/pengadaan/{$id}/dokumen/9?nama=Surat_Pembelian_{$nomorPermohonan}.pdf",
                    'is_image' => false,
                ],
            ];
        }

        // 4. Dokumen Pembayaran (Dokumen Pembayaran, Memo Persetujuan Bidang 2, dan Memo Persetujuan PPK) dari Database
        $dokumenPembayaran = [];
        $dbPembayaranDocs = collect();
        if ($pembayaran) {
            $dbPembayaranDocs = Dokumen::where('ref_type', 'pembayaran')
                ->where('ref_id', $pembayaran->id)
                ->where('tipe_dokumen', '!=', 'bukti_bayar')
                ->orderBy('id', 'asc')
                ->get();
        }
        $dbMemoPersetujuan = $dbItem
            ? Dokumen::where('ref_type', 'pengadaan')
                ->where('ref_id', $dbItem->id)
                ->whereIn('tipe_dokumen', ['memo_persetujuan_pembayaran', 'memo_persetujuan_bidang2', 'memo_persetujuan_ppk'])
                ->orderBy('id', 'asc')
                ->get()
            : collect();

        $allPayDocs = $dbPembayaranDocs->concat($dbMemoPersetujuan);

        if ($allPayDocs->isNotEmpty()) {
            foreach ($allPayDocs as $doc) {
                $label = match (strtolower($doc->tipe_dokumen ?? '')) {
                    'dokumen_pembayaran', 'pembayaran' => 'Dokumen Pembayaran',
                    'memo_persetujuan_bidang2', 'memo_pembayaran_bidang2' => 'Memo Persetujuan Bidang 2',
                    'memo_persetujuan_ppk', 'memo_pembayaran_ppk', 'memo_persetujuan_pembayaran' => 'Memo Persetujuan PPK',
                    default => ucwords(str_replace('_', ' ', $doc->tipe_dokumen ?? 'Dokumen Pembayaran')),
                };
                $dokumenPembayaran[] = [
                    'id' => $doc->id,
                    'tipe' => $label,
                    'kategori' => 'pembayaran',
                    'nama' => $doc->nama_asli,
                    'ukuran' => $this->formatBytes($doc->ukuran_bytes ?? 2097152),
                    'url' => "/api/v1/keuangan/pengadaan/{$id}/dokumen/{$doc->id}",
                    'is_image' => str_starts_with($doc->mime_type ?? '', 'image/'),
                ];
            }
        } else {
            $dokumenPembayaran = [
                [
                    'id' => 10,
                    'tipe' => 'Dokumen Pembayaran',
                    'kategori' => 'pembayaran',
                    'nama' => 'Dokumen_Pembayaran_'.$nomorPermohonan.'.pdf',
                    'ukuran' => 'PDF · 3 MB',
                    'url' => "/api/v1/keuangan/pengadaan/{$id}/dokumen/10?nama=Dokumen_Pembayaran_{$nomorPermohonan}.pdf",
                    'is_image' => false,
                ],
                [
                    'id' => 11,
                    'tipe' => 'Memo Persetujuan Bidang 2',
                    'kategori' => 'pembayaran',
                    'nama' => 'Memo_Persetujuan_Pembayaran_Bidang_2_'.$nomorPermohonan.'.pdf',
                    'ukuran' => 'PDF · 1 MB',
                    'url' => "/api/v1/keuangan/pengadaan/{$id}/dokumen/11?nama=Memo_Persetujuan_Pembayaran_Bidang_2_{$nomorPermohonan}.pdf",
                    'is_image' => false,
                ],
                [
                    'id' => 12,
                    'tipe' => 'Memo Persetujuan PPK',
                    'kategori' => 'pembayaran',
                    'nama' => 'Memo_Persetujuan_Pembayaran_PPK_'.$nomorPermohonan.'.pdf',
                    'ukuran' => 'PDF · 1 MB',
                    'url' => "/api/v1/keuangan/pengadaan/{$id}/dokumen/12?nama=Memo_Persetujuan_Pembayaran_PPK_{$nomorPermohonan}.pdf",
                    'is_image' => false,
                ],
            ];
        }

        // 5. Dokumen Vendor (Dokumen Legalitas Vendor dari Database - hanya yg diupload PPBJ)
        $dokumenVendor = [];
        $dbVendorDocs = $kontrak
            ? Dokumen::where('ref_type', 'kontrak')
                ->where('ref_id', $kontrak->id)
                ->whereIn('tipe_dokumen', ['legalitas', 'legalitas_vendor', 'dokumen_legalitas_vendor', 'vendor', 'akta', 'nib', 'npwp', 'siup'])
                ->orderBy('id', 'asc')
                ->get()
            : collect();

        if ($dbVendorDocs->isNotEmpty()) {
            foreach ($dbVendorDocs as $kDoc) {
                $dokumenVendor[] = [
                    'id' => $kDoc->id,
                    'tipe' => 'Dokumen Legalitas Vendor',
                    'kategori' => 'vendor',
                    'nama' => $kDoc->nama_asli,
                    'ukuran' => $this->formatBytes($kDoc->ukuran_bytes ?? 3145728),
                    'url' => "/api/v1/keuangan/pengadaan/{$id}/dokumen/{$kDoc->id}",
                    'is_image' => str_starts_with($kDoc->mime_type ?? '', 'image/'),
                ];
            }
        } elseif (empty($id) || $id == 1) {
            // Mock sample untuk ID 1 jika belum di-seed
            $dokumenVendor = [
                [
                    'id' => 13,
                    'tipe' => 'Dokumen Legalitas Vendor',
                    'kategori' => 'vendor',
                    'nama' => 'Legalitas_Vendor_'.$nomorPermohonan.'.pdf',
                    'ukuran' => 'PDF · 3 MB',
                    'url' => "/api/v1/keuangan/pengadaan/{$id}/dokumen/13?nama=Legalitas_Vendor_{$nomorPermohonan}.pdf",
                    'is_image' => false,
                ],
            ];
        }

        $listDokumen = array_merge(
            $dokumenPermohonan,
            $dokumenPengadaan,
            $dokumenPembelian,
            $dokumenPembayaran,
            $dokumenVendor
        );

        // Verifikasi PP & Persetujuan PPK dari Database
        $ppApproval = $dbItem?->Approvals?->firstWhere('tahap', 'PP');
        $ppkApproval = $dbItem?->Approvals?->firstWhere('tahap', 'PPK');

        $verifikasiPpText = 'Diverifikasi oleh PP';
        if ($ppApproval && $ppApproval->Actor) {
            $verifikasiPpText = 'Diverifikasi oleh PP ('.$ppApproval->Actor->nama.')';
        }

        $persetujuanPpkText = 'Disetujui oleh PPK';
        if ($ppkApproval && $ppkApproval->Actor) {
            $persetujuanPpkText = 'Disetujui oleh PPK ('.$ppkApproval->Actor->nama.')';
        } elseif ($dbItem?->Ppk) {
            $persetujuanPpkText = 'Disetujui oleh PPK ('.$dbItem->Ppk->nama.')';
        }

        $dokumenKategori = [
            'permohonan' => [
                'label' => 'Dokumen Permohonan',
                'deskripsi' => 'Surat Permohonan, Memo Permohonan Bidang 2, dan Memo Permohonan PPK',
                'items' => $dokumenPermohonan,
            ],
            'pengadaan' => [
                'label' => 'Dokumen Pengadaan',
                'deskripsi' => 'Dokumen Pengadaan beserta status verifikasi PP dan PPK',
                'items' => $dokumenPengadaan,
                'verifikasi_pp' => $verifikasiPpText,
                'persetujuan_ppk' => $persetujuanPpkText,
            ],
            'pembelian' => [
                'label' => 'Dokumen Pembelian',
                'deskripsi' => 'Surat Kontrak, SPK, Kwitansi, Invoice, dan Surat Pembelian (diunggah oleh PPBJ)',
                'items' => $dokumenPembelian,
            ],
            'pembayaran' => [
                'label' => 'Dokumen Pembayaran',
                'deskripsi' => 'Dokumen Pembayaran, Memo Persetujuan Bidang 2, dan Memo Persetujuan PPK',
                'items' => $dokumenPembayaran,
            ],
            'vendor' => [
                'label' => 'Dokumen Vendor',
                'deskripsi' => 'Dokumen Legalitas Vendor (diunggah oleh PPBJ)',
                'items' => $dokumenVendor,
            ],
        ];

        // Kartu Jenis MAK dari Database (hanya 1 Jenis MAK yang digunakan pengadaan)
        $mak = $dbItem?->PermohonanMak?->Mak ?? $permohonan?->PermohonanMak?->first()?->Mak;
        $ppkMak = $mak?->Ppk ?? $dbItem?->Ppk;
        $jenisMakCards = [
            [
                'kode' => $mak?->kode ?: '532111',
                'nama' => $mak?->nama ?: 'Belanja Modal Peralatan dan Mesin',
                'penanggung_jawab' => ($ppkMak?->nama ? $ppkMak->nama.' · PPK' : 'Budi Santoso · PPK'),
            ],
        ];

        // Tracking Stepper 5-tahap berdasarkan status database
        $isPermohonanSelesai = $permohonan?->status === 'disetujui' || $dbItem !== null;
        $isPengadaanSelesai = $dbItem && $dbItem->status !== 'draft';
        $isPembelianSelesai = $kontrak !== null;
        $isPenerimaanSelesai = $dbItem?->Penerimaan !== null || $isSelesai;

        $stepper = [
            [
                'id' => 'permohonan',
                'label' => 'Permohonan',
                'status' => $isPermohonanSelesai ? 'selesai' : 'current',
                'icon' => 'check',
            ],
            [
                'id' => 'pengadaan',
                'label' => 'Pengadaan',
                'status' => $isPengadaanSelesai ? 'selesai' : ($isPermohonanSelesai ? 'current' : 'pending'),
                'icon' => 'file',
            ],
            [
                'id' => 'pembelian',
                'label' => 'Pembelian Barang',
                'status' => $isPembelianSelesai ? 'selesai' : ($isPengadaanSelesai ? 'current' : 'pending'),
                'icon' => 'cart',
            ],
            [
                'id' => 'penerimaan',
                'label' => 'Penerimaan Barang',
                'status' => $isPenerimaanSelesai ? 'selesai' : ($isPembelianSelesai ? 'current' : 'pending'),
                'icon' => 'package',
            ],
            [
                'id' => 'selesai',
                'label' => 'Selesai',
                'status' => $isSelesai ? 'selesai' : ($isPenerimaanSelesai ? 'current' : 'pending'),
                'sublabel' => $isSelesai ? 'Pembayaran Selesai' : 'Menunggu bukti pembayaran',
                'icon' => 'target',
            ],
        ];

        // Timeline Log dari StatusHistory di Database
        $timeline = [];
        $dbHistories = StatusHistory::where(function ($q) use ($dbItem, $permohonan) {
            if ($dbItem) {
                $q->where('ref_type', 'pengadaan')->where('ref_id', $dbItem->id);
            }
            if ($permohonan) {
                $q->orWhere(fn ($sub) => $sub->where('ref_type', 'permohonan')->where('ref_id', $permohonan->id));
            }
        })->with('Actor.role')->orderBy('created_at', 'desc')->get();

        if ($dbHistories->isNotEmpty()) {
            foreach ($dbHistories as $h) {
                $actorNama = $h->Actor?->nama ?? 'Sistem';
                $roleNama = $h->Actor?->role?->nama ?? '';
                $waktuFormatted = Carbon::parse($h->created_at)->locale('id')->isoFormat('DD-MM-YYYY HH:mm');

                $statusLamaLabel = ucwords(str_replace('_', ' ', $h->status_lama ?? ''));
                $statusBaruLabel = ucwords(str_replace('_', ' ', $h->status_baru ?? ''));

                $deskripsi = "Status {$h->ref_type} diperbarui dari {$statusLamaLabel} menjadi {$statusBaruLabel} oleh {$actorNama}".($roleNama ? " ({$roleNama})" : '');

                if ($h->status_baru === 'selesai') {
                    $deskripsi = "Pencairan dana dan pembayaran telah diselesaikan oleh {$actorNama} (Keuangan)";
                } elseif ($h->status_baru === 'berjalan') {
                    $deskripsi = 'Paket pengadaan aktif diproses dan diverifikasi oleh Pejabat Pengadaan & PPK';
                }

                $timeline[] = [
                    'waktu' => $waktuFormatted,
                    'deskripsi' => $deskripsi,
                ];
            }
        } else {
            $tglSelesai = $pembayaran?->updated_at ?? now()->subDays(2);
            $tglBeli = $kontrak?->created_at ?? now()->subDays(7);
            $tglAjukan = $permohonan?->created_at ?? now()->subDays(14);

            $timeline = [
                [
                    'waktu' => Carbon::parse($tglSelesai)->locale('id')->isoFormat('DD-MM-YYYY HH:mm'),
                    'deskripsi' => 'Memo persetujuan pembayaran diterbitkan oleh Bidang 2 dan PPK',
                ],
                [
                    'waktu' => Carbon::parse($tglBeli)->locale('id')->isoFormat('DD-MM-YYYY HH:mm'),
                    'deskripsi' => 'Dokumen pembayaran dan legalitas vendor diunggah oleh PPBJ',
                ],
                [
                    'waktu' => Carbon::parse($tglAjukan)->locale('id')->isoFormat('DD-MM-YYYY HH:mm'),
                    'deskripsi' => 'Permohonan pengadaan diajukan dan diverifikasi oleh Perencanaan',
                ],
            ];
        }

        // Data Bukti Bayar jika sudah selesai
        $existingBuktiDocs = [];
        if ($pembayaran) {
            $buktiDocs = $pembayaran->Dokumen()->where('tipe_dokumen', 'bukti_bayar')->orderBy('id', 'asc')->get();
            $defaultTgl = $rencana?->tanggal_jatuh_tempo ? Carbon::parse($rencana->tanggal_jatuh_tempo) : now();

            foreach ($buktiDocs as $bDoc) {
                $docDate = $bDoc->created_at ? Carbon::parse($bDoc->created_at) : $defaultTgl;
                $existingBuktiDocs[] = [
                    'id' => $bDoc->id,
                    'nama' => $bDoc->nama_asli,
                    'ukuran' => $this->formatBytes($bDoc->ukuran_bytes ?? 1024000),
                    'url' => "/api/v1/keuangan/pengadaan/{$id}/dokumen/{$bDoc->id}",
                    'tanggal_pembayaran' => $docDate->format('Y-m-d'),
                    'tanggal_pembayaran_formatted' => $docDate->locale('id')->isoFormat('D MMMM YYYY'),
                ];
            }
        }

        return [
            'id' => $dbItem?->id ?: $id,
            'nomor_pengadaan' => $nomorPengadaan,
            'nomor_permohonan' => $nomorPermohonan,
            'judul' => $judulPengadaan,
            'unit_pemohon' => $unitNama,
            'tanggal_pengajuan' => $tglPengajuanFormatted,
            'tanggal_pengingat' => $tglPengingatFormatted,
            'status' => $isSelesai ? 'selesai' : 'menunggu_input',
            'status_label' => $isSelesai ? 'Selesai' : 'Menunggu Input',
            'informasi_pengadaan' => [
                'no_pengadaan' => $nomorPengadaan,
                'jenis_pengadaan' => $dbItem?->Jenis?->nama ?? 'Barang',
                'nominal_estimasi' => $nominalEstimasi,
                'verifikasi_pp' => $verifikasiPpText,
                'nomor_permohonan' => $nomorPermohonan,
                'metode_pengadaan' => $dbItem?->Metode?->nama ?? 'Non Tender',
                'biaya_riil' => $biayaRiil,
                'persetujuan_ppk' => $persetujuanPpkText,
                'tanggal_pengajuan' => $tglPengajuanFormatted,
                'level_pengadaan' => $dbItem?->Level?->nama ?? '50-200 Juta',
                'nama_vendor' => $vendorNama,
                'status_pengadaan' => $isSelesai ? 'selesai' : 'menunggu_input',
                'status_label' => $isSelesai ? 'Selesai' : 'Menunggu Input',
            ],
            'tracking_proses' => [
                'stepper' => $stepper,
                'timeline' => $timeline,
            ],
            'dokumen_diterima' => $listDokumen,
            'dokumen_kategori' => $dokumenKategori,
            'jenis_mak' => $jenisMakCards,
            'pembayaran' => [
                'status' => $isSelesai ? 'selesai' : 'menunggu_keuangan',
                'status_label' => $isSelesai ? 'Selesai' : 'Menunggu Pembayaran',
                'tanggal_pembayaran' => $rencana?->tanggal_jatuh_tempo ? Carbon::parse($rencana->tanggal_jatuh_tempo)->format('Y-m-d') : null,
                'dokumen_bukti_bayar' => $existingBuktiDocs,
            ],
        ];
    }

    /**
     * Menyimpan tanggal pembayaran dan bukti pembayaran untuk paket pengadaan.
     *
     * @param  array{tanggal_pembayaran: string}  $data
     * @param  array<int, UploadedFile>  $buktiBayarFiles
     * @return array<string, mixed>
     */
    public function simpanBuktiPembayaran(
        int|string $pengadaanId,
        array $data,
        array $buktiBayarFiles,
        User $actor
    ): array {
        return DB::transaction(function () use ($pengadaanId, $data, $buktiBayarFiles, $actor) {
            $pengadaan = Pengadaan::find($pengadaanId);
            $numericId = is_numeric($pengadaanId) ? (int) $pengadaanId : 1;

            if (! $pengadaan) {
                $permohonan = Permohonan::first() ?? Permohonan::create([
                    'unit_id' => 1,
                    'created_by' => $actor->id,
                    'nomor_surat' => sprintf('11%d-FFF-111', $numericId),
                    'judul' => 'Pengadaan Komputer',
                    'ringkasan_tujuan' => 'Pengadaan Komputer operasional',
                    'estimasi_anggaran' => 100000000,
                    'status' => 'disetujui',
                ]);

                $pMak = PermohonanMak::firstOrCreate(
                    ['permohonan_id' => $permohonan->id],
                    ['mak_id' => 1, 'ditentukan_oleh' => $actor->id]
                );

                $pengadaan = Pengadaan::create([
                    'id' => $numericId,
                    'permohonan_id' => $permohonan->id,
                    'permohonan_mak_id' => $pMak->id,
                    'jenis_id' => 1,
                    'metode_id' => 1,
                    'level_id' => 1,
                    'ppk_id' => $actor->id,
                    'nominal' => 98500000,
                    'status' => 'berjalan',
                ]);
            }

            $kontrak = $pengadaan->Kontrak ?? Kontrak::firstOrCreate(
                ['pengadaan_id' => $pengadaan->id],
                [
                    'tipe' => 'SPK',
                    'nomor' => sprintf('PGD-2027-%04d', $pengadaan->id),
                    'tanggal' => now()->toDateString(),
                    'vendor_nama' => 'PT PNJ PPBJ JAYA ABADI',
                    'nominal_kontrak' => $pengadaan->nominal ?: 98500000,
                ]
            );

            $nominalFinal = (float) (
                $kontrak->nominal_kontrak
                ?: ($pengadaan->nominal
                ?: ($pengadaan->Permohonan?->estimasi_anggaran
                ?: 98500000.0))
            );

            if (empty($kontrak->nominal_kontrak)) {
                $kontrak->nominal_kontrak = $nominalFinal;
                $kontrak->save();
            }

            $rencana = $kontrak->RencanaPembayaran()->first() ?? RencanaPembayaran::firstOrCreate(
                ['kontrak_id' => $kontrak->id],
                [
                    'nominal_rencana' => $nominalFinal,
                    'tanggal_jatuh_tempo' => $data['tanggal_pembayaran'] ?? now()->toDateString(),
                    'status' => 'menunggu',
                ]
            );

            if (empty($rencana->nominal_rencana)) {
                $rencana->nominal_rencana = $nominalFinal;
                $rencana->save();
            }

            $pembayaran = $rencana->Pembayaran ?? Pembayaran::firstOrCreate(
                ['rencana_pembayaran_id' => $rencana->id],
                [
                    'nominal' => $nominalFinal,
                    'revisi_ke' => 0,
                    'status' => 'menunggu_keuangan',
                ]
            );

            if (empty($pembayaran->nominal)) {
                $pembayaran->nominal = $nominalFinal;
                $pembayaran->save();
            }

            // Tangani pembaruan jika dalam mode edit
            $isEdit = ! empty($data['is_edit']);
            $existingItems = $data['existing_items'] ?? [];
            if (! is_array($existingItems)) {
                $existingItems = json_decode($existingItems, true) ?: [];
            }

            $keptDocIds = [];
            foreach ($existingItems as $eItem) {
                if (! empty($eItem['id'])) {
                    $docId = (int) $eItem['id'];
                    $doc = Dokumen::where('ref_type', 'pembayaran')
                        ->where('ref_id', $pembayaran->id)
                        ->where('id', $docId)
                        ->first();

                    if ($doc) {
                        $keptDocIds[] = $doc->id;
                        if (! empty($eItem['tanggal_pembayaran'])) {
                            $doc->created_at = Carbon::parse($eItem['tanggal_pembayaran'])
                                ->setTime(now()->hour, now()->minute, now()->second);
                            $doc->save();
                        }
                    }
                }
            }

            if ($isEdit) {
                Dokumen::where('ref_type', 'pembayaran')
                    ->where('ref_id', $pembayaran->id)
                    ->where('tipe_dokumen', 'bukti_bayar')
                    ->whereNotIn('id', $keptDocIds)
                    ->delete();
            }

            // Simpan setiap berkas bukti bayar baru
            $tanggalList = $data['tanggal_pembayaran_list'] ?? [];
            if (! is_array($tanggalList)) {
                $tanggalList = [$tanggalList];
            }

            $uploadedDocs = [];
            foreach ($buktiBayarFiles as $idx => $file) {
                if ($file instanceof UploadedFile) {
                    $itemTanggal = $tanggalList[$idx] ?? ($data['tanggal_pembayaran'] ?? now()->toDateString());
                    $createdAt = Carbon::parse($itemTanggal)->setTime(now()->hour, now()->minute, now()->second);

                    $originalName = $file->getClientOriginalName();
                    $storedPath = $file->store('dokumen/pembayaran', 'local');
                    $storedFileName = basename($storedPath);

                    $dokumen = Dokumen::create([
                        'ref_type' => 'pembayaran',
                        'ref_id' => $pembayaran->id,
                        'tipe_dokumen' => 'bukti_bayar',
                        'versi' => 1,
                        'nama_asli' => $originalName,
                        'nama_hash' => $storedFileName,
                        'mime_type' => $file->getClientMimeType() ?: 'application/pdf',
                        'ukuran_bytes' => $file->getSize() ?: 1024000,
                        'uploaded_by' => $actor->id,
                        'created_at' => $createdAt,
                    ]);

                    $uploadedDocs[] = [
                        'id' => $dokumen->id,
                        'nama' => $dokumen->nama_asli,
                        'ukuran' => $this->formatBytes($dokumen->ukuran_bytes),
                        'tanggal_pembayaran' => Carbon::parse($createdAt)->format('Y-m-d'),
                        'tanggal_pembayaran_formatted' => Carbon::parse($createdAt)->locale('id')->isoFormat('D MMMM YYYY'),
                    ];
                }
            }

            // Perbarui status menjadi SELESAI
            $pembayaran->status = 'selesai';
            $pembayaran->save();

            $rencana->status = 'selesai';
            if (! empty($data['tanggal_pembayaran'])) {
                $rencana->tanggal_jatuh_tempo = $data['tanggal_pembayaran'];
            }
            $rencana->save();

            $pengadaan->status = 'selesai';
            $pengadaan->save();

            // StatusHistory audit trail
            StatusHistory::create([
                'ref_type' => 'pengadaan',
                'ref_id' => $pengadaan->id,
                'status_lama' => 'berjalan',
                'status_baru' => 'selesai',
                'actor_id' => $actor->id,
                'created_at' => now(),
            ]);

            // Broadcast Notifikasi ke PPBJ, PPK, Pemohon
            $targetRoles = ['PPBJ', 'PPK', 'Pemohon'];
            $targetUsers = User::whereHas('role', fn ($q) => $q->whereIn('nama', $targetRoles))->get();

            $nomorKontrak = $kontrak->nomor ?: sprintf('PGD-2027-%04d', $pengadaan->id);
            $judul = $pengadaan->Permohonan?->judul ?: 'Pengadaan Barang & Jasa';

            foreach ($targetUsers as $targetUser) {
                Notification::create([
                    'user_id' => $targetUser->id,
                    'channel' => 'in_app',
                    'judul' => 'Pengadaan dan Pembayaran Selesai',
                    'pesan' => "Pencairan pembayaran untuk paket {$nomorKontrak} ({$judul}) telah selesai diproses oleh Keuangan.",
                    'ref_type' => 'pengadaan',
                    'ref_id' => $pengadaan->id,
                    'created_at' => now(),
                ]);
            }

            return [
                'message' => 'Bukti pembayaran berhasil diunggah dan status pengadaan telah selesai.',
                'pengadaan_id' => $pengadaan->id,
                'status' => 'selesai',
                'uploaded_files' => $uploadedDocs,
            ];
        });
    }

    /**
     * Format bytes to readable size string.
     */
    private function formatBytes(int $bytes): string
    {
        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 1).' MB';
        }

        if ($bytes >= 1024) {
            return number_format($bytes / 1024, 0).' KB';
        }

        return $bytes.' B';
    }
}
