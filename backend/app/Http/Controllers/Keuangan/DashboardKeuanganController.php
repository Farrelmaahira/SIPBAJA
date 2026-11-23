<?php

namespace App\Http\Controllers\Keuangan;

use App\Http\Controllers\Controller;
use App\Services\KeuanganService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardKeuanganController extends Controller
{
    public function __construct(
        private readonly KeuanganService $keuanganService,
    ) {}

    /**
     * Menampilkan data dashboard pengadaan menunggu pembayaran untuk role Keuangan.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $data = $this->keuanganService->getDashboardData();

        return response()->json($data);
    }
}
