<?php

namespace App\Http\Controllers\Perencanaan;

use App\Http\Controllers\Controller;
use App\Services\PerencanaanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PerencanaanRkaklController extends Controller
{
    public function __construct(
        private PerencanaanService $perencanaanService
    ) {}

    public function index(): JsonResponse
    {
        $rkaklData = $this->perencanaanService->getRkaklData();

        return response()->json([
            'rkakl' => $rkaklData,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $filename = $request->input('filename', 'RKAKL_TA_2026_Satker_Politeknik_v4.pdf');
        $this->perencanaanService->replaceRkakl(auth()->user(), $filename);

        return response()->json([
            'message' => 'Dokumen RKAKL berhasil diperbarui dengan versi terbaru.',
        ]);
    }
}
