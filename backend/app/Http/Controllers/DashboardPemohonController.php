<?php

namespace App\Http\Controllers;

use App\Http\Requests\FilterStatistikRequest;
use App\Services\DashboardPemohonService;
use Illuminate\Http\JsonResponse;

class DashboardPemohonController extends Controller
{
    public function __construct(
        private DashboardPemohonService $dashboardService,
    ) {}

    public function __invoke(FilterStatistikRequest $request): JsonResponse
    {
        $user = $request->user();
        $tahun = $request->tahun();

        return response()->json([
            'ringkasan' => $this->dashboardService->ringkasan($user),
            'permohonanAktif' => $this->dashboardService->permohonanAktif($user),
            'statistikBulanan' => $this->dashboardService->statistikPerBulan($user, $tahun),
            'tahunAktif' => $tahun,
        ]);
    }
}
