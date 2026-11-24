<?php

namespace App\Services;

use App\Models\Permohonan;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class DashboardPemohonService
{
    /**
     * Ringkasan statistik permohonan untuk unit pemohon.
     * Scoped ke unit_id user, sesuai business rule PRD 5.6.
     */
    public function ringkasan(User $user): array
    {
        $unitId = $user->unit_id;
        $bulanIni = Carbon::now()->month;
        $tahunIni = Carbon::now()->year;

        $base = Permohonan::where('unit_id', $unitId);

        $total = (clone $base)->count();
        $menungguVerifikasi = (clone $base)->whereIn('status', ['diajukan', 'menunggu_bidang2'])->count();
        $disetujui = (clone $base)->where('status', 'disetujui')->count();
        $ditolak = (clone $base)->where('status', 'ditolak')->count();

        // Permohonan baru di bulan berjalan, untuk badge "+N bulan ini"
        $tambahanBulanIni = (clone $base)
            ->whereYear(DB::raw('created_at'), $tahunIni)
            ->whereMonth(DB::raw('created_at'), $bulanIni)
            ->count();

        return [
            'total' => $total,
            'menunggu_verifikasi' => $menungguVerifikasi,
            'disetujui' => $disetujui,
            'ditolak' => $ditolak,
            'tambahan_bulan_ini' => $tambahanBulanIni,
        ];
    }

    /**
     * Daftar permohonan aktif / sedang berlangsung milik unit pemohon.
     * Opsi A: Berlangsung = semua tahapan aktif sebelum selesai atau ditolak.
     * Scoped ke unit_id user.
     * Limit 10, terbaru lebih dulu.
     */
    public function permohonanAktif(User $user): Collection
    {
        return Permohonan::where('unit_id', $user->unit_id)
            ->whereNotIn('status', ['ditolak', 'selesai'])
            ->with('Dokumen')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get(['id', 'nomor_surat', 'judul', 'estimasi_anggaran', 'status', 'created_at', 'ringkasan_tujuan']);
    }

    /**
     * Data statistik grafik batang: disetujui vs ditolak per bulan untuk tahun yang diminta.
     * Return array 12 elemen (Jan-Des), masing-masing: bulan (1-12), disetujui, ditolak.
     * Scoped ke unit_id user.
     */
    public function statistikPerBulan(User $user, int $tahun): array
    {
        $rows = Permohonan::where('unit_id', $user->unit_id)
            ->whereYear('created_at', $tahun)
            ->whereIn('status', ['disetujui', 'ditolak'])
            ->get(['id', 'status', 'created_at']);

        $grouped = $rows->groupBy(function ($item) {
            return Carbon::parse($item->created_at)->month;
        });

        // Lengkapi semua 12 bulan agar frontend tidak perlu handle gap
        return collect(range(1, 12))->map(function (int $bulan) use ($grouped) {
            $items = $grouped->get($bulan, collect());

            return [
                'bulan' => $bulan,
                'disetujui' => $items->where('status', 'disetujui')->count(),
                'ditolak' => $items->where('status', 'ditolak')->count(),
            ];
        })->values()->all();
    }

    /**
     * Data statistik tahunan: disetujui vs ditolak per tahun untuk 5 tahun terakhir.
     */
    public function statistikPerTahun(User $user, int $tahunAkhir, int $rentang = 5): array
    {
        $tahunAwal = $tahunAkhir - ($rentang - 1);

        $records = Permohonan::where('unit_id', $user->unit_id)
            ->whereBetween('created_at', [
                Carbon::create($tahunAwal, 1, 1)->startOfDay(),
                Carbon::create($tahunAkhir, 12, 31)->endOfDay(),
            ])
            ->whereIn('status', ['disetujui', 'ditolak'])
            ->get(['id', 'status', 'created_at']);

        $grouped = $records->groupBy(function ($item) {
            return Carbon::parse($item->created_at)->year;
        });

        return collect(range($tahunAwal, $tahunAkhir))->map(function (int $th) use ($grouped) {
            $items = $grouped->get($th, collect());

            return [
                'tahun' => $th,
                'disetujui' => $items->where('status', 'disetujui')->count(),
                'ditolak' => $items->where('status', 'ditolak')->count(),
            ];
        })->values()->all();
    }
}
