<?php

namespace App\Http\Controllers\Keuangan;

use App\Http\Controllers\Controller;
use App\Models\Dokumen;
use App\Services\KeuanganService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PengadaanKeuanganController extends Controller
{
    public function __construct(
        private readonly KeuanganService $keuanganService,
    ) {}

    /**
     * Menampilkan daftar paket pengadaan yang ditangani Keuangan dengan paginasi, pencarian, dan filter.
     */
    public function index(Request $request): JsonResponse
    {
        $page = max(1, (int) $request->query('page', 1));
        $perPage = max(1, min(50, (int) $request->query('per_page', 10)));

        $filters = [
            'search' => $request->query('search', $request->query('q', '')),
            'status' => $request->query('status', []),
        ];

        $data = $this->keuanganService->getPengadaanList($filters, $page, $perPage);

        return response()->json($data);
    }

    /**
     * Menampilkan detail pengadaan untuk role Keuangan.
     */
    public function show(Request $request, int|string $pengadaan): JsonResponse
    {
        $data = $this->keuanganService->getPengadaanDetail($pengadaan);

        return response()->json($data);
    }

    /**
     * Menyimpan tanggal pembayaran dan bukti pembayaran untuk paket pengadaan.
     */
    public function storeBuktiBayar(Request $request, int|string $pengadaan): JsonResponse
    {
        $tanggalInput = $request->input('tanggal_pembayaran');
        if (is_array($tanggalInput)) {
            $tanggal = end($tanggalInput) ?: reset($tanggalInput);
            $request->merge(['tanggal_pembayaran' => $tanggal]);
        }

        $isEdit = $request->boolean('is_edit');
        $hasExisting = $request->has('existing_items') && ! empty($request->input('existing_items'));

        $rules = [
            'tanggal_pembayaran' => ['required'],
        ];

        if ($isEdit && $hasExisting) {
            $rules['bukti_bayar'] = ['nullable', 'array'];
            $rules['bukti_bayar.*'] = ['file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'];
        } else {
            $rules['bukti_bayar'] = ['required', 'array', 'min:1'];
            $rules['bukti_bayar.*'] = ['file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'];
        }

        $request->validate($rules);

        $buktiFiles = $request->file('bukti_bayar') ?: [];
        if (! is_array($buktiFiles)) {
            $buktiFiles = [$buktiFiles];
        }

        $tanggalList = $request->input('tanggal_pembayaran_list');
        if (! is_array($tanggalList)) {
            $tanggalList = $tanggalList ? [$tanggalList] : [];
        }

        $existingItems = $request->input('existing_items', []);

        $result = $this->keuanganService->simpanBuktiPembayaran(
            $pengadaan,
            [
                'tanggal_pembayaran' => $request->input('tanggal_pembayaran'),
                'tanggal_pembayaran_list' => $tanggalList,
                'is_edit' => $isEdit,
                'existing_items' => $existingItems,
            ],
            $buktiFiles,
            $request->user()
        );

        return response()->json($result, 201);
    }

    /**
     * Mengunduh atau menampilkan pratinjau dokumen pengadaan/bukti bayar.
     */
    public function downloadDokumen(Request $request, int|string $pengadaan, int|string $dokumenId): StreamedResponse|BinaryFileResponse|JsonResponse
    {
        $disposition = $request->query('disposition') === 'inline' ? 'inline' : 'attachment';
        $dokumen = null;

        if (is_numeric($dokumenId)) {
            $dokumen = Dokumen::find((int) $dokumenId);
            if ($dokumen) {
                $possiblePaths = [
                    $dokumen->nama_hash,
                    "docs/{$dokumen->nama_hash}",
                    "dokumen/pembayaran/{$dokumen->nama_hash}",
                    "dokumen/kontrak/{$dokumen->nama_hash}",
                    "dokumen/pengadaan/{$dokumen->nama_hash}",
                    "dokumen/permohonan/{$dokumen->nama_hash}",
                    "dokumen/memo/{$dokumen->nama_hash}",
                ];

                foreach ($possiblePaths as $path) {
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
        }

        // Fallback untuk mock sample document atau berkas demo yang belum tersimpan di disk
        $namaFile = $dokumen?->nama_asli ?: $request->query('nama', 'dokumen_pembayaran.pdf');
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
