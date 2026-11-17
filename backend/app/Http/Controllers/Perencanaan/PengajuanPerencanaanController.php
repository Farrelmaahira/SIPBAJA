<?php

namespace App\Http\Controllers\Perencanaan;

use App\Http\Controllers\Controller;
use App\Http\Requests\PerbaikiJenisMakPengadaanRequest;
use App\Http\Requests\TolakPermohonanRequest;
use App\Http\Requests\VerifikasiPermohonanRequest;
use App\Models\Pengadaan;
use App\Models\Permohonan;
use App\Services\ApprovalService;
use App\Services\PengadaanService;
use App\Services\PermohonanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PengajuanPerencanaanController extends Controller
{
    public function __construct(
        private PermohonanService $permohonanService,
        private PengadaanService $pengadaanService,
        private ApprovalService $approvalService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = [
            'q' => $request->query('q', $request->query('search', '')),
            'search' => $request->query('search', $request->query('q', '')),
            'status' => $request->query('status'),
            'statuses' => $request->query('statuses', []),
            'bulan' => $request->query('bulan'),
            'tahun' => $request->query('tahun'),
            'unit_id' => $request->query('unit_id'),
        ];

        $permohonan = $this->permohonanService->paginatePermohonanPerencanaan($filters, 10);

        return response()->json([
            'permohonan' => $permohonan,
            'filters' => $filters,
        ]);
    }

    public function show(Permohonan $permohonan): JsonResponse
    {
        $detail = $this->permohonanService->getDetailPermohonanPerencanaan($permohonan);

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
        $updated = $this->approvalService->approvePermohonanPerencanaan(
            $permohonan,
            $request->user(),
            $request->validated('mak_ids'),
            $request->validated('catatan')
        );

        return response()->json([
            'message' => 'Permohonan berhasil diverifikasi dan diteruskan ke tahap berikutnya.',
            'data' => $updated,
        ]);
    }

    public function reject(TolakPermohonanRequest $request, Permohonan $permohonan): JsonResponse
    {
        $updated = $this->approvalService->rejectPermohonanPerencanaan(
            $permohonan,
            $request->user(),
            $request->validated('alasan')
        );

        return response()->json([
            'message' => 'Permohonan telah ditolak dan dikembalikan ke pemohon.',
            'data' => $updated,
        ]);
    }

    /**
     * @deprecated Endpoint ini tidak lagi digunakan karena setelah Jenis MAK ditetapkan oleh Perencanaan,
     * Bidang 2 dan PPK menyetujui secara paralel dan sistem meneruskan ke PPBJ secara otomatis setelah keduanya setuju.
     */
    public function kirimPengadaan(Request $request, Permohonan $permohonan): JsonResponse
    {
        $makId = (int) $request->input('mak_id', 1);
        $this->permohonanService->kirimPengadaanDeprecated($permohonan, $request->user(), $makId);

        return response()->json([
            'message' => 'Jenis MAK pengadaan berhasil ditetapkan dan dikirim.',
        ]);
    }

    /**
     * Melihat detail Dokumen Pengadaan oleh Perencanaan (read-only + konteks perbaikan Jenis MAK).
     */
    public function showPengadaan(Pengadaan $pengadaan): JsonResponse
    {
        $detail = $this->pengadaanService->getDetailPengadaanPerencanaan($pengadaan);

        return response()->json([
            'data' => $detail,
            'detail' => $detail,
        ]);
    }

    /**
     * Memperbaiki Jenis MAK pada Dokumen Pengadaan sebelum disetujui oleh PPK.
     */
    public function updateJenisMakPengadaan(
        PerbaikiJenisMakPengadaanRequest $request,
        Pengadaan $pengadaan
    ): JsonResponse {
        $updated = $this->pengadaanService->perbaikiJenisMakPengadaan(
            $pengadaan,
            $request->user(),
            (int) $request->validated('permohonan_mak_id')
        );

        return response()->json([
            'message' => 'Jenis MAK pada dokumen pengadaan berhasil diperbaiki.',
            'data' => $updated,
        ]);
    }
}
