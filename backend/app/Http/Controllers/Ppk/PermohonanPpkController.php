<?php

namespace App\Http\Controllers\Ppk;

use App\Http\Controllers\Controller;
use App\Http\Requests\FilterPermohonanPpkRequest;
use App\Http\Requests\SetujuiPermohonanPpkRequest;
use App\Http\Requests\TolakPermohonanPpkRequest;
use App\Models\Permohonan;
use App\Services\ApprovalService;
use App\Services\PermohonanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PermohonanPpkController extends Controller
{
    public function __construct(
        private PermohonanService $permohonanService,
        private ApprovalService $approvalService
    ) {}

    public function index(FilterPermohonanPpkRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $filters = [
            'q' => $validated['q'] ?? $validated['search'] ?? '',
            'search' => $validated['search'] ?? $validated['q'] ?? '',
            'status' => $validated['status'] ?? 'semua',
            'statuses' => $validated['statuses'] ?? [],
            'bulan' => $validated['bulan'] ?? null,
            'tahun' => $validated['tahun'] ?? null,
        ];

        $permohonan = $this->permohonanService->paginatePermohonanUntukPpk(
            $request->user(),
            $filters,
            (int) ($validated['per_page'] ?? 10)
        );

        return response()->json([
            'message' => 'Daftar permohonan yang terikat Jenis MAK PPK berhasil diambil.',
            'data' => $permohonan->items(),
            'meta' => [
                'current_page' => $permohonan->currentPage(),
                'last_page' => $permohonan->lastPage(),
                'per_page' => $permohonan->perPage(),
                'total' => $permohonan->total(),
            ],
            'filters' => $filters,
        ]);
    }

    public function show(Request $request, Permohonan $permohonan): JsonResponse
    {
        $detail = $this->permohonanService->getDetailPermohonanUntukPpk($permohonan, $request->user());

        return response()->json([
            'message' => 'Detail permohonan untuk PPK berhasil diambil.',
            'data' => $detail,
        ]);
    }

    public function downloadDokumen(Request $request, Permohonan $permohonan): StreamedResponse
    {
        $this->approvalService->pastikanPpkBerhakAtasPermohonan($permohonan, $request->user());

        $dokumenId = $request->filled('dokumen_id') ? $request->integer('dokumen_id') : null;
        $info = $this->permohonanService->ambilDokumen($request->user(), $permohonan, $dokumenId);

        if ($request->query('disposition', 'attachment') === 'inline') {
            return Storage::disk('local')->response($info['path'], $info['nama_asli']);
        }

        return Storage::disk('local')->download($info['path'], $info['nama_asli']);
    }

    public function approvePermohonan(SetujuiPermohonanPpkRequest $request, Permohonan $permohonan): JsonResponse
    {
        $updated = $this->approvalService->approvePermohonanPpk(
            $permohonan,
            $request->user(),
            $request->file('memo'),
            $request->validated('catatan')
        );

        return response()->json([
            'message' => 'Permohonan beserta Memo Persetujuan Surat Permohonan berhasil disetujui oleh PPK.',
            'data' => $updated,
        ]);
    }

    public function rejectPermohonan(TolakPermohonanPpkRequest $request, Permohonan $permohonan): JsonResponse
    {
        $updated = $this->approvalService->rejectPermohonanPpk(
            $permohonan,
            $request->user(),
            (string) $request->validated('alasan')
        );

        return response()->json([
            'message' => 'Permohonan telah ditolak oleh PPK beserta catatan alasan.',
            'data' => $updated,
        ]);
    }
}
