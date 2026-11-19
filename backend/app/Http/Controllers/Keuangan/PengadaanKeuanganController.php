<?php

namespace App\Http\Controllers\Keuangan;

use App\Http\Controllers\Controller;
use App\Services\KeuanganService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PengadaanKeuanganController extends Controller
{
    public function __construct(
        private readonly KeuanganService $keuanganService,
    ) {}

    /**
     * Menampilkan daftar paket pengadaan yang ditangani Keuangan dengan paginasi, pencarian, dan filter.
     */
    public function index(Request $request): JsonResponse
    {
        $page = max(1, (int) $request->query('page', 1));
        $perPage = max(1, min(50, (int) $request->query('per_page', 10)));

        $filters = [
            'search' => $request->query('search', $request->query('q', '')),
            'status' => $request->query('status', []),
        ];

        $data = $this->keuanganService->getPengadaanList($filters, $page, $perPage);

        return response()->json($data);
    }
}
