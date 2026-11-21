<?php

namespace App\Http\Controllers\Perlengkapan;

use App\Http\Controllers\Controller;
use App\Services\PerlengkapanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardPerlengkapanController extends Controller
{
    public function __construct(
        private readonly PerlengkapanService $perlengkapanService,
    ) {}

    /**
     * Menampilkan data dashboard dan ringkasan pengadaan masuk untuk Perlengkapan.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $data = $this->perlengkapanService->getDashboardData();

        return response()->json($data);
    }
}
