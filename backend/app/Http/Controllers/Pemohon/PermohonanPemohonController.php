<?php

namespace App\Http\Controllers\Pemohon;

use App\Http\Controllers\Controller;
use App\Http\Requests\RevisiPermohonanRequest;
use App\Http\Requests\SimpanPermohonanRequest;
use App\Models\Permohonan;
use App\Services\PermohonanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PermohonanPemohonController extends Controller
{
    public function __construct(
        private PermohonanService $permohonanService,
    ) {}

    /**
     * Menampilkan formulir pembuatan permohonan baru untuk Pemohon.
     */
    public function create(Request $request): JsonResponse
    {
        return response()->json(['message' => 'Formulir permohonan baru.']);
    }

    /**
     * Menampilkan daftar seluruh permohonan pengadaan untuk Pemohon.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $status = $request->input('status');
        $search = $request->input('search');

        $permohonanList = $this->permohonanService->daftarPermohonan($user, $status, $search);

        return response()->json([
            'permohonanList' => $permohonanList,
            'filters' => [
                'status' => $status ?? 'semua',
                'search' => $search ?? '',
            ],
        ]);
    }

    /**
     * Menampilkan detail lengkap permohonan pengadaan untuk Pemohon.
     */
    public function show(Request $request, Permohonan $permohonan): JsonResponse
    {
        $user = $request->user();
        $detail = $this->permohonanService->detailPermohonan($user, $permohonan);

        return response()->json([
            'permohonan' => $detail,
        ]);
    }

    /**
     * Mengunduh atau menampilkan pratinjau berkas surat permohonan.
     */
    public function downloadDokumen(Request $request, Permohonan $permohonan): StreamedResponse
    {
        $user = $request->user();
        $info = $this->permohonanService->ambilDokumen($user, $permohonan);

        $disposition = $request->query('disposition', 'attachment');
        if ($disposition === 'inline') {
            return Storage::disk('local')->response($info['path'], $info['nama_asli']);
        }

        return Storage::disk('local')->download($info['path'], $info['nama_asli']);
    }

    /**
     * Menyimpan permohonan baru melalui PermohonanService.
     */
    public function store(SimpanPermohonanRequest $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();
        $file = $request->file('file_dokumen');

        $permohonan = $this->permohonanService->simpanPermohonan($user, $validated, $file);

        return response()->json([
            'message' => 'Permohonan pengadaan berhasil dikirim dan masuk antrean verifikasi.',
            'permohonan' => $permohonan,
        ], 201);
    }

    /**
     * Memperbarui permohonan yang ditolak dan mengajukan ulang melalui PermohonanService.
     */
    public function update(RevisiPermohonanRequest $request, Permohonan $permohonan): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();
        $file = $request->file('file_dokumen');

        $updatedPermohonan = $this->permohonanService->revisiPermohonan($user, $permohonan, $validated, $file);

        return response()->json([
            'message' => 'Permohonan pengadaan berhasil diperbaiki dan diajukan ulang.',
            'permohonan' => $updatedPermohonan,
        ], 200);
    }

    /**
     * Menghapus permohonan pengadaan untuk Pemohon.
     */
    public function destroy(Request $request, Permohonan $permohonan): JsonResponse
    {
        $user = $request->user();
        $this->permohonanService->hapusPermohonan($user, $permohonan);

        return response()->json([
            'message' => 'Permohonan pengadaan berhasil dihapus.',
        ], 200);
    }
}
