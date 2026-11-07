<?php

namespace App\Http\Controllers\Perencanaan;

use App\Http\Controllers\Controller;
use App\Http\Requests\TolakPermohonanRequest;
use App\Http\Requests\VerifikasiPermohonanRequest;
use App\Models\Permohonan;
use App\Services\PerencanaanService;
use App\Services\PermohonanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PengajuanPerencanaanController extends Controller
{
    public function __construct(
        private PerencanaanService $perencanaanService,
        private PermohonanService $permohonanService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = [
            'q' => $request->query('q', ''),
            'statuses' => $request->query('statuses', []),
        ];

        $permohonan = $this->perencanaanService->paginatePermohonan($filters, 10);

        return response()->json([
            'permohonan' => $permohonan,
            'filters' => $filters,
        ]);
    }

    public function show(Permohonan $permohonan): JsonResponse
    {
        $detail = $this->perencanaanService->getDetailPermohonan($permohonan);

        return response()->json([
            'detail' => $detail,
        ]);
    }

    public function downloadDokumen(Request $request, Permohonan $permohonan): StreamedResponse
    {
        $user = $request->user();
        $dokumenId = $request->filled('dokumen_id') ? $request->integer('dokumen_id') : null;
        $info = $this->permohonanService->ambilDokumen($user, $permohonan, $dokumenId);

        $disposition = $request->query('disposition', 'attachment');
        if ($disposition === 'inline') {
            return Storage::disk('local')->response($info['path'], $info['nama_asli']);
        }

        return Storage::disk('local')->download($info['path'], $info['nama_asli']);
    }

    public function approve(VerifikasiPermohonanRequest $request, Permohonan $permohonan): JsonResponse
    {
        $this->perencanaanService->approvePermohonan(
            $permohonan,
            auth()->user(),
            $request->validated('mak_ids')
        );

        return response()->json([
            'message' => 'Permohonan berhasil diverifikasi dan diteruskan ke tahap berikutnya.',
        ]);
    }

    public function reject(TolakPermohonanRequest $request, Permohonan $permohonan): JsonResponse
    {
        $this->perencanaanService->rejectPermohonan(
            $permohonan,
            auth()->user(),
            $request->validated('alasan')
        );

        return response()->json([
            'message' => 'Permohonan telah ditolak dan dikembalikan ke pemohon.',
        ]);
    }

    public function kirimPengadaan(Request $request, Permohonan $permohonan): JsonResponse
    {
        $makId = (int) $request->input('mak_id', 1);
        $this->perencanaanService->kirimPengadaan($permohonan, auth()->user(), $makId);

        return response()->json([
            'message' => 'Jenis MAK pengadaan berhasil ditetapkan dan dikirim.',
        ]);
    }
}
