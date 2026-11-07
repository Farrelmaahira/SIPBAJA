<?php

namespace App\Http\Controllers\PPBJ;

use App\Http\Controllers\Controller;
use App\Http\Requests\PPBJ\HapusDraftPengadaanRequest;
use App\Http\Requests\PPBJ\StoreDraftPengadaanRequest;
use App\Http\Requests\PPBJ\SubmitPengadaanReviewerRequest;
use App\Services\PengadaanService;
use App\Services\PermohonanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

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
