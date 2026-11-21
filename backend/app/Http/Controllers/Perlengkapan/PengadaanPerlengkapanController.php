<?php

namespace App\Http\Controllers\Perlengkapan;

use App\Http\Controllers\Controller;
use App\Http\Requests\SimpanPenerimaanBarangRequest;
use App\Models\Dokumen;
use App\Services\PerlengkapanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PengadaanPerlengkapanController extends Controller
{
    public function __construct(
        private readonly PerlengkapanService $perlengkapanService,
    ) {}

    /**
     * Menampilkan daftar pengadaan untuk Unit Perlengkapan.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = [
            'search' => $request->query('search', $request->query('q', '')),
            'status' => $request->query('status', $request->query('statuses', [])),
        ];

        $page = max($request->integer('page', 1), 1);
        $perPage = max($request->integer('per_page', 10), 1);

        $result = $this->perlengkapanService->getPengadaanList($filters, $page, $perPage);

        return response()->json($result);
    }

    /**
     * Menampilkan detail pengadaan untuk Unit Perlengkapan.
     */
    public function show(int|string $pengadaan): JsonResponse
    {
        $data = $this->perlengkapanService->getPengadaanDetail($pengadaan);

        return response()->json($data);
    }

    /**
     * Menyimpan data penerimaan barang, dokumen BAST/pendukung, dan foto fisik dokumentasi.
     */
    public function storePenerimaan(SimpanPenerimaanBarangRequest $request, int|string $pengadaan): JsonResponse
    {
        $validated = $request->validated();
        $dokumenBarang = $request->file('dokumen_barang', []);
        $dokumentasiFoto = $request->file('dokumentasi_foto', []);

        $result = $this->perlengkapanService->simpanPenerimaanBarang(
            $pengadaan,
            $validated,
            is_array($dokumenBarang) ? $dokumenBarang : [$dokumenBarang],
            is_array($dokumentasiFoto) ? $dokumentasiFoto : ($dokumentasiFoto ? [$dokumentasiFoto] : []),
            $request->user()
        );

        return response()->json($result, 201);
    }

    /**
     * Mengunduh atau melihat dokumen terkait pengadaan atau serah terima barang.
     */
    public function downloadDokumen(Request $request, int|string $pengadaan, int|string $dokumenId): StreamedResponse|BinaryFileResponse|JsonResponse
    {
        $disposition = $request->query('disposition') === 'inline' ? 'inline' : 'attachment';

        if (is_numeric($dokumenId)) {
            $dokumen = Dokumen::find((int) $dokumenId);
            if ($dokumen) {
                $path = $dokumen->ref_type === 'penerimaan_barang'
                    ? "dokumen/penerimaan/{$dokumen->nama_hash}"
                    : ($dokumen->ref_type === 'kontrak' ? "dokumen/kontrak/{$dokumen->nama_hash}" : "dokumen/pengadaan/{$dokumen->nama_hash}");

                if (Storage::disk('local')->exists($path)) {
                    $fullPath = Storage::disk('local')->path($path);

                    if ($disposition === 'inline') {
                        return response()->file(
                            $fullPath,
                            [
                                'Content-Type' => $dokumen->mime_type ?: 'application/pdf',
                                'Content-Disposition' => 'inline; filename="'.($dokumen->nama_asli ?: 'dokumen.pdf').'"',
                            ]
                        );
                    }

                    return Storage::disk('local')->download(
                        $path,
                        $dokumen->nama_asli ?: 'dokumen.pdf',
                        [
                            'Content-Type' => $dokumen->mime_type ?: 'application/pdf',
                        ]
                    );
                }
            }
        }

        // Fallback untuk mock sample document atau dokumentasi foto
        $namaFile = $request->query('nama', 'dokumen_pengadaan.pdf');
        $ext = strtolower(pathinfo($namaFile, PATHINFO_EXTENSION));

        if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp'], true) || str_contains((string) $dokumenId, 'foto')) {
            $mimeType = match ($ext) {
                'png' => 'image/png',
                'webp' => 'image/webp',
                default => 'image/jpeg',
            };

            // Sample image 1x1 data URI decoded untuk mockup foto
            $imageContent = $mimeType === 'image/png'
                ? base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==')
                : base64_decode('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=');

            return response()->streamDownload(
                function () use ($imageContent) {
                    echo $imageContent;
                },
                $namaFile,
                [
                    'Content-Type' => $mimeType,
                ],
                $disposition
            );
        }

        $pdfContent = "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000102 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF\n";

        return response()->streamDownload(
            function () use ($pdfContent) {
                echo $pdfContent;
            },
            $namaFile,
            [
                'Content-Type' => 'application/pdf',
            ],
            $disposition
        );
    }
}
