<?php

namespace App\Http\Controllers\Perencanaan;

use App\Http\Controllers\Controller;
use App\Http\Requests\GantiRkaklRequest;
use App\Http\Requests\UnggahRkaklRequest;
use App\Models\Dokumen;
use App\Services\DokumenService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PerencanaanRkaklController extends Controller
{
    public function __construct(
        private DokumenService $dokumenService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $tahun = $request->query('tahun');
        $rkaklData = $this->dokumenService->getRkaklData(
            is_string($tahun) ? $tahun : null
        );

        return response()->json([
            'rkakl' => $rkaklData,
            'data' => $rkaklData,
        ]);
    }

    public function downloadDokumen(Request $request, ?Dokumen $dokumen = null): StreamedResponse
    {
        $tahun = $request->query('tahun');
        $info = $this->dokumenService->ambilDokumenRkakl(
            $dokumen,
            is_string($tahun) ? $tahun : null
        );

        $disposition = $request->query('disposition', 'attachment');
        if ($disposition === 'inline') {
            return Storage::disk('local')->response($info['path'], $info['nama_asli']);
        }

        return Storage::disk('local')->download($info['path'], $info['nama_asli']);
    }

    public function store(UnggahRkaklRequest $request): JsonResponse
    {
        $fileToUpload = $request->file('berkas')
            ?: $request->file('file')
            ?: $request->validated('filename', 'RKAKL_TA_2026_Satker_Politeknik_v4.pdf');

        $tahunAnggaran = $request->validated('tahun_anggaran') ?? '2026';

        $dokumen = $this->dokumenService->unggahRkakl(
            $request->user(),
            $fileToUpload,
            $tahunAnggaran,
            $request->hasFile('berkas') ? 'berkas' : 'file'
        );

        return response()->json([
            'message' => 'Dokumen RKAKL berhasil diperbarui dengan versi terbaru.',
            'data' => $dokumen,
        ]);
    }

    public function ganti(GantiRkaklRequest $request, Dokumen $dokumen): JsonResponse
    {
        $berkas = $request->file('berkas') ?: $request->file('file');
        $updated = $this->dokumenService->gantiRkakl(
            $dokumen,
            $request->user(),
            $berkas,
            $request->hasFile('berkas') ? 'berkas' : 'file'
        );

        return response()->json([
            'message' => 'Dokumen RKAKL berhasil diganti dengan versi terbaru.',
            'data' => $updated,
        ]);
    }

    public function destroy(Dokumen $dokumen): Response
    {
        $this->dokumenService->hapusRkakl($dokumen);

        return response()->noContent();
    }
}
