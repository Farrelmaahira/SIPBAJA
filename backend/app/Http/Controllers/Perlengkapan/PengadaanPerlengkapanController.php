<?php

namespace App\Http\Controllers\Perlengkapan;

use App\Http\Controllers\Controller;
use App\Services\PerlengkapanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PengadaanPerlengkapanController extends Controller
{
    public function __construct(
        private readonly PerlengkapanService $perlengkapanService,
    ) {}

    /**
     * Menampilkan daftar pengadaan untuk Unit Perlengkapan.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = [
            'search' => $request->query('search', $request->query('q', '')),
            'status' => $request->query('status', $request->query('statuses', [])),
        ];

        $page = max($request->integer('page', 1), 1);
        $perPage = max($request->integer('per_page', 10), 1);

        $result = $this->perlengkapanService->getPengadaanList($filters, $page, $perPage);

        return response()->json($result);
    }
}
