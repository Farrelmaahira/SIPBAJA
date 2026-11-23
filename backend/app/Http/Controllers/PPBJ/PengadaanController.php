<?php

namespace App\Http\Controllers\PPBJ;

use App\Http\Controllers\Controller;
use App\Http\Requests\PPBJ\HapusDraftPengadaanRequest;
use App\Http\Requests\PPBJ\SimpanKontrakPengadaanRequest;
use App\Http\Requests\PPBJ\UpdateKlasifikasiPengadaanRequest;
use App\Models\Dokumen;
use App\Models\Pengadaan;
use App\Services\PengadaanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
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

        $statusLama = $pengadaan->status;
        $updated = $this->pengadaanService->updateKlasifikasiPengadaan(
            $pengadaan,
            $request->validated(),
            $fileDokumen,
            $request->user()
        );

        $message = ($statusLama === 'ditolak' && $updated->status === 'menunggu_review')
            ? 'Dokumen pengadaan revisi berhasil diperbarui dan dikirim kembali ke reviewer.'
            : 'Klasifikasi pengadaan berhasil diperbarui.';

        return response()->json([
            'message' => $message,
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
        $multiDokumen = [
            'dokumen_surat_kontrak' => $request->file('dokumen_surat_kontrak'),
            'dokumen_spk' => $request->file('dokumen_spk'),
            'dokumen_surat_pemesanan' => $request->file('dokumen_surat_pemesanan'),
            'dokumen_kwitansi' => $request->file('dokumen_kwitansi'),
            'dokumen_invoice' => $request->file('dokumen_invoice'),
        ];

        $kontrak = $this->pengadaanService->simpanAtauPerbaruiKontrak(
            $pengadaan,
            $request->validated(),
            $fileDokumen,
            $request->user(),
            $multiDokumen
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
        $multiDokumen = [
            'dokumen_surat_kontrak' => $request->file('dokumen_surat_kontrak'),
            'dokumen_spk' => $request->file('dokumen_spk'),
            'dokumen_surat_pemesanan' => $request->file('dokumen_surat_pemesanan'),
            'dokumen_kwitansi' => $request->file('dokumen_kwitansi'),
            'dokumen_invoice' => $request->file('dokumen_invoice'),
        ];

        $kontrak = $this->pengadaanService->simpanAtauPerbaruiKontrak(
            $pengadaan,
            $request->validated(),
            $fileDokumen,
            $request->user(),
            $multiDokumen
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
        $pengadaan = Pengadaan::with('Kontrak')->findOrFail((int) $pengadaanId);
        $dokumen = Dokumen::findOrFail((int) $dokumenId);

        $isPengadaanDoc = ($dokumen->ref_type === 'pengadaan' && (int) $dokumen->ref_id === (int) $pengadaan->id);
        $isPermohonanDoc = ($dokumen->ref_type === 'permohonan' && (int) $dokumen->ref_id === (int) $pengadaan->permohonan_id);
        $isPermohonanMemo = ($dokumen->ref_type === 'approval_permohonan' && (int) $dokumen->ref_id === (int) $pengadaan->permohonan_id);
        $isKontrakDoc = ($dokumen->ref_type === 'kontrak' && (int) $dokumen->ref_id === (int) ($pengadaan->Kontrak?->id ?? 0));

        if (! $isPengadaanDoc && ! $isPermohonanDoc && ! $isPermohonanMemo && ! $isKontrakDoc) {
            abort(404, 'Dokumen tidak berkaitan dengan pengadaan ini.');
        }

        $namaHash = basename($dokumen->nama_hash);
        $candidates = array_unique(array_filter([
            $dokumen->nama_hash,
            'dokumen/pengadaan/'.$namaHash,
            'dokumen_pengadaan/'.$namaHash,
            'dokumen/kontrak/'.$namaHash,
            'dokumen/permohonan/'.$namaHash,
            'dokumen/memo/'.$namaHash,
            'dokumen/permohonan/memo/'.$namaHash,
        ]));

        $disk = 'local';
        $path = null;

        foreach ($candidates as $candidate) {
            if (Storage::disk('local')->exists($candidate)) {
                $path = $candidate;
                $disk = 'local';
                break;
            }
            if (Storage::disk('public')->exists($candidate)) {
                $path = $candidate;
                $disk = 'public';
                break;
            }
        }

        if (! $path) {
            return response()->json(['message' => 'Berkas fisik dokumen tidak ditemukan di server.'], 404);
        }

        $disposition = $request->query('disposition') === 'inline' ? 'inline' : 'attachment';

        return Storage::disk($disk)->download(
            $path,
            $dokumen->nama_asli ?: 'dokumen.pdf',
            [
                'Content-Type' => $dokumen->mime_type ?: 'application/pdf',
                'Content-Disposition' => "{$disposition}; filename=\"".($dokumen->nama_asli ?: 'dokumen.pdf').'"',
            ]
        );
    }

    /**
     * Menghapus paket pengadaan berstatus draft.
     */
    public function destroy(HapusDraftPengadaanRequest $request, string $id): Response
    {
        $this->pengadaanService->hapusDraftPengadaan((int) $id, $request->user());

        return response()->noContent();
    }

    /**
     * Mengambil konteks pembayaran, BAST, foto fisik, serta status dual approval (FR-40).
     */
    public function pembayaranContext(string $id): JsonResponse
    {
        $pengadaan = Pengadaan::findOrFail((int) $id);
        $context = $this->pengadaanService->getPembayaranContext($pengadaan);

        return response()->json([
            'success' => true,
            'message' => 'Konteks pembayaran berhasil diambil.',
            'data' => $context,
        ]);
    }
}
