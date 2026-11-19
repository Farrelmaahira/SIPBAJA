<?php

namespace App\Http\Controllers\PPBJ;

use App\Http\Controllers\Controller;
use App\Http\Requests\PPBJ\SimpanKontrakPengadaanRequest;
use App\Http\Requests\PPBJ\UpdateKlasifikasiPengadaanRequest;
use App\Models\Dokumen;
use App\Models\Pengadaan;
use App\Services\PengadaanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PengadaanController extends Controller
{
    public function __construct(
        protected PengadaanService $pengadaanService
    ) {}

    /**
     * Menampilkan daftar pengadaan untuk peran PPBJ dengan fitur pencarian & filter.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = [
            'q' => $request->query('q', $request->query('search', '')),
            'status' => $request->query('status'),
            'statuses' => $request->query('statuses', []),
            'bulan' => $request->query('bulan'),
            'tahun' => $request->query('tahun'),
        ];

        $perPage = (int) $request->query('per_page', 10);
        $paginated = $this->pengadaanService->paginatePengadaanPpbj($filters, $perPage);

        return response()->json([
            'message' => 'Daftar pengadaan berhasil diambil.',
            'pengadaan' => $paginated,
            'filters' => $filters,
        ]);
    }

    /**
     * Menampilkan detail terpadu pengadaan untuk PPBJ.
     */
    public function show(string $id): JsonResponse
    {
        $detail = $this->pengadaanService->getDetailPengadaanPpbj((int) $id);

        return response()->json([
            'message' => 'Detail pengadaan berhasil diambil.',
            'pengadaan' => $detail,
        ]);
    }

    /**
     * Memperbarui klasifikasi pengadaan & re-upload dokumen pengadaan (status draft/ditolak).
     */
    public function update(UpdateKlasifikasiPengadaanRequest $request, string $id): JsonResponse
    {
        $pengadaan = Pengadaan::findOrFail((int) $id);
        $fileDokumen = $request->file('dokumen');

        $updated = $this->pengadaanService->updateKlasifikasiPengadaan(
            $pengadaan,
            $request->validated(),
            $fileDokumen,
            $request->user()
        );

        return response()->json([
            'message' => 'Klasifikasi pengadaan berhasil diperbarui.',
            'pengadaan' => $updated,
        ]);
    }

    /**
     * Menyimpan data vendor, biaya riil, jadwal reminder, dan dokumen pembelian awal.
     */
    public function storeKontrak(SimpanKontrakPengadaanRequest $request, string $id): JsonResponse
    {
        $pengadaan = Pengadaan::findOrFail((int) $id);
        $fileDokumen = $request->file('dokumen');

        $kontrak = $this->pengadaanService->simpanAtauPerbaruiKontrak(
            $pengadaan,
            $request->validated(),
            $fileDokumen,
            $request->user()
        );

        return response()->json([
            'message' => 'Data kontrak dan vendor berhasil disimpan.',
            'kontrak' => $kontrak,
        ]);
    }

    /**
     * Memperbarui data vendor, jadwal reminder, atau dokumen pembelian selama belum diterima Perlengkapan.
     */
    public function updateKontrak(SimpanKontrakPengadaanRequest $request, string $id): JsonResponse
    {
        $pengadaan = Pengadaan::findOrFail((int) $id);
        $fileDokumen = $request->file('dokumen');

        $kontrak = $this->pengadaanService->simpanAtauPerbaruiKontrak(
            $pengadaan,
            $request->validated(),
            $fileDokumen,
            $request->user()
        );

        return response()->json([
            'message' => 'Data kontrak dan vendor berhasil diperbarui.',
            'kontrak' => $kontrak,
        ]);
    }

    /**
     * Mengunduh berkas dokumen pengadaan / dokumen pembelian.
     */
    public function downloadDokumen(Request $request, string $pengadaanId, string $dokumenId): StreamedResponse|JsonResponse
    {
        $dokumen = Dokumen::where('id', (int) $dokumenId)
            ->where(function ($q) use ($pengadaanId) {
                $q->where(fn ($sub) => $sub->where('ref_type', 'pengadaan')->where('ref_id', (int) $pengadaanId))
                    ->orWhere(fn ($sub) => $sub->where('ref_type', 'kontrak')->whereHas('Kontrak', fn ($k) => $k->where('pengadaan_id', (int) $pengadaanId)));
            })
            ->firstOrFail();

        if (! Storage::disk('private')->exists($dokumen->path)) {
            return response()->json(['message' => 'Berkas fisik dokumen tidak ditemukan di server.'], 404);
        }

        $disposition = $request->query('disposition') === 'inline' ? 'inline' : 'attachment';

        return Storage::disk('private')->download(
            $dokumen->path,
            $dokumen->nama_asli ?: 'dokumen.pdf',
            [
                'Content-Type' => $dokumen->mime_type ?: 'application/pdf',
                'Content-Disposition' => "{$disposition}; filename=\"".($dokumen->nama_asli ?: 'dokumen.pdf').'"',
            ]
        );
    }
}
