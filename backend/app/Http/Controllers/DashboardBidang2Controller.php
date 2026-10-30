<?php

namespace App\Http\Controllers;

use App\Services\DashboardBidang2Service;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardBidang2Controller extends Controller
{
    public function __construct(
        protected DashboardBidang2Service $dashboardService
    ) {}

    public function __invoke(Request $request): Response
    {
        $tahun = (int) $request->input('tahun', Carbon::now()->year);

        $ringkasan = $this->dashboardService->ringkasan();
        $riwayatTerbaru = $this->dashboardService->riwayatTerbaru(5);
        $statistik = $this->dashboardService->statistikBulanan($tahun);

        return Inertia::render('Bidang2/Dashboard', [
            'ringkasan' => $ringkasan,
            'riwayatTerbaru' => $riwayatTerbaru,
            'statistikBulanan' => $statistik['bulanan'],
            'totalDisetujui' => $statistik['total_disetujui'],
            'totalDitolak' => $statistik['total_ditolak'],
            'tahunAktif' => $tahun,
        ]);
    }
}
