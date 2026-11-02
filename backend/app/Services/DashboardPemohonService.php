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
     * Daftar permohonan aktif (belum selesai / bukan ditolak final) milik unit pemohon.
     * Scoped ke unit_id user. Eager load: tidak ada relasi yang dibutuhkan tabel selain kolom native.
     * Limit 10, terbaru lebih dulu.
     */
    public function permohonanAktif(User $user): Collection
    {
        return Permohonan::where('unit_id', $user->unit_id)
            ->whereNotIn('status', ['ditolak'])
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
            ->whereYear(DB::raw('created_at'), $tahun)
            ->whereIn('status', ['disetujui', 'ditolak'])
            ->select(
                DB::raw('CAST(strftime(\'%m\', created_at) AS INTEGER) as bulan'),
                DB::raw('SUM(CASE WHEN status = \'disetujui\' THEN 1 ELSE 0 END) as disetujui'),
                DB::raw('SUM(CASE WHEN status = \'ditolak\' THEN 1 ELSE 0 END) as ditolak'),
            )
            ->groupBy('bulan')
            ->get()
            ->keyBy('bulan');

        // Lengkapi semua 12 bulan agar frontend tidak perlu handle gap
        return collect(range(1, 12))->map(function (int $bulan) use ($rows) {
            $row = $rows->get($bulan);

            return [
                'bulan' => $bulan,
                'disetujui' => $row ? (int) $row->disetujui : 0,
                'ditolak' => $row ? (int) $row->ditolak : 0,
            ];
        })->values()->all();
    }
}
