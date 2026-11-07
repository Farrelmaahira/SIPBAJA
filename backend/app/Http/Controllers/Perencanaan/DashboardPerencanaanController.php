<?php

namespace App\Http\Controllers\Perencanaan;

use App\Http\Controllers\Controller;
use App\Services\PerencanaanService;
use Illuminate\Http\JsonResponse;

class DashboardPerencanaanController extends Controller
{
    public function __construct(
        private PerencanaanService $perencanaanService
    ) {}

    public function __invoke(): JsonResponse
    {
        $data = $this->perencanaanService->getDashboardData();

        return response()->json([
            'stats' => $data['stats'],
            'permohonanTerbaru' => $data['permohonan_terbaru'],
        ]);
    }
}
