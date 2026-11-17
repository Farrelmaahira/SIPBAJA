<?php

namespace App\Http\Controllers\Perencanaan;

use App\Http\Controllers\Controller;
use App\Services\PermohonanService;
use Illuminate\Http\JsonResponse;

class DashboardPerencanaanController extends Controller
{
    public function __construct(
        private PermohonanService $permohonanService
    ) {}

    public function __invoke(): JsonResponse
    {
        $data = $this->permohonanService->getDashboardPerencanaan();

        return response()->json([
            'stats' => $data['stats'],
            'permohonanTerbaru' => $data['permohonan_terbaru'],
        ]);
    }
}
