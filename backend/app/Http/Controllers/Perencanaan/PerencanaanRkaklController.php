<?php

namespace App\Http\Controllers\Perencanaan;

use App\Http\Controllers\Controller;
use App\Models\Dokumen;
use App\Services\PerencanaanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

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

    public function downloadDokumen(Request $request, ?Dokumen $dokumen = null): StreamedResponse
    {
        $info = $this->perencanaanService->ambilDokumenRkakl($dokumen);

        $disposition = $request->query('disposition', 'attachment');
        if ($disposition === 'inline') {
            return Storage::disk('local')->response($info['path'], $info['nama_asli']);
        }

        return Storage::disk('local')->download($info['path'], $info['nama_asli']);
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
