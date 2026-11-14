<?php

namespace App\Http\Controllers\Bidang2;

use App\Http\Controllers\Controller;
use App\Models\Dokumen;
use App\Services\PerencanaanService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RkaklBidang2Controller extends Controller
{
    public function __construct(
        private PerencanaanService $perencanaanService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $rkaklData = $this->perencanaanService->getRkaklData();
        $activeDoc = $rkaklData['active_doc'] ?? null;

        $nomorDokumen = 'RKAKL-2026-003';
        $tahunAnggaran = 2026;
        $versi = $activeDoc ? (int) $activeDoc->versi : 3;
        $namaAsli = $activeDoc?->nama_asli ?? 'RKAKL_TA_2026_Satker_Politeknik_v3.pdf';
        $ukuranBytes = $activeDoc ? (int) ($activeDoc->ukuran_bytes ?? 0) : 12582912; // 12 MB
        $diperbaruiOleh = 'Unit Perencanaan';
        $terakhirDiperbarui = $activeDoc?->created_at
            ? Carbon::parse($activeDoc->created_at)->translatedFormat('d M Y')
            : '12 Okt 2026';
        $totalHalaman = 24;

        $docPayload = [
            'id' => $activeDoc?->id ?? 1,
            'nama_asli' => $namaAsli,
            'ukuran_bytes' => $ukuranBytes,
            'versi' => $versi,
            'tahun_anggaran' => $tahunAnggaran,
            'nomor_dokumen' => $nomorDokumen,
            'perihal' => 'Rencana Kerja dan Anggaran',
            'tanggal' => $terakhirDiperbarui,
            'diperbarui_oleh' => $diperbaruiOleh,
            'status' => 'Aktif',
            'total_halaman' => $totalHalaman,
            'download_url' => '/api/v1/bidang-2/rkakl/dokumen?disposition=attachment',
            'view_url' => '/api/v1/bidang-2/rkakl/dokumen?disposition=inline',
        ];

        return response()->json([
            'rkakl' => [
                'active_doc' => $docPayload,
                'history' => $rkaklData['history'] ?? [],
            ],
        ]);
    }

    public function downloadDokumen(Request $request, ?Dokumen $dokumen = null): StreamedResponse
    {
        $info = $this->perencanaanService->ambilDokumenRkakl($dokumen);

        $disposition = $request->query('disposition', 'attachment');
        if ($disposition === 'inline') {
            return Storage::disk('local')->response($info['path'], $info['nama_asli']);
        }

        return Storage::disk('local')->download($info['path'], $info['nama_asli']);
    }
}
