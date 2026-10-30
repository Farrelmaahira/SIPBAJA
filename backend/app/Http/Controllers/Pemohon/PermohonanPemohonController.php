<?php

namespace App\Http\Controllers\Pemohon;

use App\Http\Controllers\Controller;

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
        $status = $request->query('status');
        $search = $request->query('search');

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
     * Mengunduh berkas surat permohonan.
     */
    public function downloadDokumen(Request $request, Permohonan $permohonan): StreamedResponse
    {
        $user = $request->user();
        $info = $this->permohonanService->ambilDokumen($user, $permohonan);

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
}
