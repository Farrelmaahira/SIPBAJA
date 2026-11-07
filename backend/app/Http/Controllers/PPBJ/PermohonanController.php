<?php

namespace App\Http\Controllers\PPBJ;

use App\Http\Controllers\Controller;
use App\Http\Requests\PPBJ\HapusDraftPengadaanRequest;
use App\Http\Requests\PPBJ\StoreDraftPengadaanRequest;
use App\Http\Requests\PPBJ\SubmitPengadaanReviewerRequest;
use App\Models\Permohonan;
use App\Services\PengadaanService;
use App\Services\PermohonanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PermohonanController extends Controller
{
    public function __construct(
        protected PermohonanService $permohonanService,
        protected PengadaanService $pengadaanService
    ) {}

    /**
     * Menampilkan daftar permohonan pengadaan untuk peran PPBJ.
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'permohonanList' => $this->permohonanService->getPermohonanPpbjList(),
        ]);
    }

    /**
     * Menampilkan detail permohonan pengadaan untuk peran PPBJ.
     */
    public function show(string $id): JsonResponse
    {
        $detail = $this->permohonanService->getPermohonanDetail((int) $id);
        $splitContext = $this->pengadaanService->getSplitContext((int) $id);

        return response()->json([
            'permohonan' => array_merge($detail, $splitContext),
        ]);
    }

    /**
     * Mengunduh atau menampilkan pratinjau berkas dokumen permohonan untuk PPBJ.
     */
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

    /**
     * Menyimpan paket pengadaan draft baru.
     */
    public function storeDraft(StoreDraftPengadaanRequest $request, string $id): JsonResponse
    {
        $this->pengadaanService->simpanDraftPengadaan(
            (int) $id,
            $request->validated('items'),
            $request->user()
        );

        return response()->json([
            'message' => 'Paket pengadaan berhasil disimpan sebagai draft.',
        ], 201);
    }

    /**
     * Menghapus paket pengadaan berstatus draft.
     */
    public function destroyDraft(HapusDraftPengadaanRequest $request, string $id): Response
    {
        $this->pengadaanService->hapusDraftPengadaan((int) $id, $request->user());

        return response()->noContent();
    }

    /**
     * Submit seluruh paket pengadaan ke reviewer dan kunci permohonan.
     */
    public function submitReviewer(SubmitPengadaanReviewerRequest $request, string $id): JsonResponse
    {
        $this->pengadaanService->submitKeReviewer((int) $id, $request->user());

        return response()->json([
            'message' => 'Seluruh paket pengadaan berhasil dikirim ke reviewer dan permohonan telah dikunci.',
        ]);
    }
}
