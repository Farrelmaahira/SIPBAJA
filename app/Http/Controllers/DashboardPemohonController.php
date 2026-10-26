<?php

namespace App\Http\Controllers;

use App\Http\Requests\FilterStatistikRequest;
use App\Services\DashboardPemohonService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardPemohonController extends Controller
{
    public function __construct(
        private DashboardPemohonService $dashboardService,
    ) {}

    public function __invoke(FilterStatistikRequest $request): Response
    {
        $user = $request->user();
        $tahun = $request->tahun();

        return Inertia::render('Pemohon/Dashboard', [
            'ringkasan' => $this->dashboardService->ringkasan($user),
            'permohonanAktif' => $this->dashboardService->permohonanAktif($user),
            'statistikBulanan' => $this->dashboardService->statistikPerBulan($user, $tahun),
            'tahunAktif' => $tahun,
        ]);
    }
}
