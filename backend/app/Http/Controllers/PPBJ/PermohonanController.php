<?php

namespace App\Http\Controllers\PPBJ;

use App\Http\Controllers\Controller;
use App\Http\Requests\PPBJ\StoreDraftPengadaanRequest;
use App\Services\PengadaanService;
use App\Services\PermohonanService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PermohonanController extends Controller
{
    public function __construct(
        protected PermohonanService $permohonanService,
        protected PengadaanService $pengadaanService
    ) {}

    /**
     * Menampilkan daftar permohonan pengadaan untuk peran PPBJ.
     */
    public function index(): Response
    {
        return Inertia::render('Ppbj/Permohonan/Index', [
            'permohonanList' => $this->permohonanService->getPermohonanPpbjList(),
        ]);
    }

    /**
     * Menampilkan detail permohonan pengadaan untuk peran PPBJ.
     */
    public function show(string $id): Response
    {
        return Inertia::render('Ppbj/Permohonan/Show', [
            'permohonan' => $this->permohonanService->getPermohonanDetail((int) $id),
        ]);
    }

    /**
     * Menyimpan paket pengadaan draft baru.
     */
    public function storeDraft(StoreDraftPengadaanRequest $request, string $id): RedirectResponse
    {
        $this->pengadaanService->simpanDraftPengadaan(
            (int) $id,
            $request->validated('items'),
            $request->user()
        );

        return back()->with('success', 'Paket pengadaan berhasil disimpan sebagai draft.');
    }

    /**
     * Menghapus paket pengadaan berstatus draft.
     */
    public function destroyDraft(Request $request, string $id): RedirectResponse
    {
        $this->pengadaanService->hapusDraftPengadaan((int) $id, $request->user());

        return back()->with('success', 'Draft paket pengadaan berhasil dihapus.');
    }

    /**
     * Submit seluruh paket pengadaan ke reviewer dan kunci permohonan.
     */
    public function submitReviewer(Request $request, string $id): RedirectResponse
    {
        $this->pengadaanService->submitKeReviewer((int) $id, $request->user());

        return back()->with('success', 'Seluruh paket pengadaan berhasil dikirim ke reviewer dan permohonan telah dikunci.');
    }
}
