<?php

namespace App\Services;

use App\Models\Permohonan;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class DashboardBidang2Service
{
    /**
     * Ringkasan statistik permohonan kampus untuk Bidang 2.
     */
    public function ringkasan(): array
    {
        $bulanIni = Carbon::now()->month;
        $tahunIni = Carbon::now()->year;

        $total = Permohonan::count();
        $menungguVerifikasi = Permohonan::whereIn('status', ['diajukan', 'menunggu_bidang2'])->count();
        $disetujui = Permohonan::where('status', 'disetujui')->count();
        $ditolak = Permohonan::where('status', 'ditolak')->count();

        $tambahanBulanIni = Permohonan::whereYear('created_at', $tahunIni)
            ->whereMonth('created_at', $bulanIni)
            ->count();

        $disetujuiBulanIni = Permohonan::where('status', 'disetujui')
            ->whereYear('updated_at', $tahunIni)
            ->whereMonth('updated_at', $bulanIni)
            ->count();

        return [
            'total' => $total,
            'menunggu_verifikasi' => $menungguVerifikasi,
            'disetujui' => $disetujui,
            'ditolak' => $ditolak,
            'tambahan_bulan_ini' => $tambahanBulanIni,
            'disetujui_bulan_ini' => $disetujuiBulanIni,
        ];
    }

    /**
     * Riwayat permohonan terbaru di sistem untuk pengawasan Bidang 2.
     */
    public function riwayatTerbaru(int $limit = 5): Collection
    {
        return Permohonan::with(['unit', 'dokumen'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get(['id', 'unit_id', 'nomor_surat', 'judul', 'estimasi_anggaran', 'status', 'created_at', 'ringkasan_tujuan']);
    }

    /**
     * Data grafik batang: disetujui vs ditolak per bulan untuk tahun tertentu.
     */
    public function statistikBulanan(int $tahun): array
    {
        $records = Permohonan::whereYear('created_at', $tahun)
            ->whereIn('status', ['disetujui', 'ditolak'])
            ->get(['id', 'status', 'created_at']);

        $grouped = $records->groupBy(function ($item) {
            return Carbon::parse($item->created_at)->month;
        });

        $bulanan = collect(range(1, 12))->map(function (int $bulan) use ($grouped) {
            $items = $grouped->get($bulan, collect());
            $disetujui = $items->where('status', 'disetujui')->count();
            $ditolak = $items->where('status', 'ditolak')->count();

            return [
                'bulan' => $bulan,
                'disetujui' => $disetujui,
                'ditolak' => $ditolak,
            ];
        })->values()->all();

        $totalDisetujui = $records->where('status', 'disetujui')->count();
        $totalDitolak = $records->where('status', 'ditolak')->count();

        return [
            'bulanan' => $bulanan,
            'total_disetujui' => $totalDisetujui,
            'total_ditolak' => $totalDitolak,
        ];
    }
}
