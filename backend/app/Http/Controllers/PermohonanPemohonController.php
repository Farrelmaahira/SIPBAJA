<?php

namespace App\Http\Controllers;

use App\Http\Requests\SimpanPermohonanRequest;
use App\Models\Permohonan;
use App\Services\PermohonanService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PermohonanPemohonController extends Controller
{
    public function __construct(
        private PermohonanService $permohonanService,
    ) {}

    /**
     * Menampilkan formulir pembuatan permohonan baru untuk Pemohon.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('Pemohon/Permohonan/Create');
    }

    /**
     * Menampilkan daftar seluruh permohonan pengadaan untuk Pemohon.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $status = $request->query('status');
        $search = $request->query('search');

        $permohonanList = $this->permohonanService->daftarPermohonan($user, $status, $search);

        return Inertia::render('Pemohon/Permohonan/Index', [
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
    public function downloadDokumen(Request $request, Permohonan $permohonan)
    {
        $user = $request->user();
        $info = $this->permohonanService->ambilDokumen($user, $permohonan);

        return Storage::disk('local')->download($info['path'], $info['nama_asli']);
    }

    /**
     * Menyimpan permohonan baru melalui PermohonanService.
     */
    public function store(SimpanPermohonanRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();
        $file = $request->file('file_dokumen');

        $this->permohonanService->simpanPermohonan($user, $validated, $file);

        return redirect()
            ->route('pemohon.dashboard')
            ->with('success', 'Permohonan pengadaan berhasil dikirim dan masuk antrean verifikasi.');
    }
}
