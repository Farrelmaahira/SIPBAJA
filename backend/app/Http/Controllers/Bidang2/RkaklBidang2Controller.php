<?php

namespace App\Http\Controllers\Bidang2;

use App\Http\Controllers\Controller;
use App\Models\Dokumen;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RkaklBidang2Controller extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $docs = Dokumen::where('ref_type', 'rkakl')
            ->orderByDesc('versi')
            ->get();

        $activeDoc = $docs->first();
        $history = $docs->slice(1)->values()->map(function ($doc) {
            $doc->download_url = "/api/v1/bidang-2/rkakl/dokumen/{$doc->id}";
            $doc->view_url = "/api/v1/bidang-2/rkakl/dokumen/{$doc->id}?disposition=inline";

            return $doc;
        });

        $docPayload = null;
        if ($activeDoc) {
            $docPayload = [
                'id' => $activeDoc->id,
                'nama_asli' => $activeDoc->nama_asli,
                'ukuran_bytes' => (int) ($activeDoc->ukuran_bytes ?? 0),
                'versi' => (int) ($activeDoc->versi ?? 1),
                'tahun_anggaran' => (int) ($activeDoc->tahun_anggaran ?? Carbon::now()->year),
                'nomor_dokumen' => $activeDoc->nomor_dokumen ?? 'RKAKL-'.Carbon::now()->year,
                'perihal' => 'Rencana Kerja dan Anggaran',
                'tanggal' => $activeDoc->created_at
                    ? Carbon::parse($activeDoc->created_at)->translatedFormat('d M Y')
                    : '-',
                'diperbarui_oleh' => 'Unit Perencanaan',
                'status' => 'Aktif',
                'total_halaman' => 24,
                'download_url' => '/api/v1/bidang-2/rkakl/dokumen?disposition=attachment',
                'view_url' => '/api/v1/bidang-2/rkakl/dokumen?disposition=inline',
            ];
        }

        return response()->json([
            'rkakl' => [
                'active_doc' => $docPayload,
                'history' => $history,
            ],
        ]);
    }

    public function downloadDokumen(Request $request, ?Dokumen $dokumen = null): StreamedResponse
    {
        if (! $dokumen || ! $dokumen->exists) {
            $dokumen = Dokumen::where('ref_type', 'rkakl')->orderByDesc('versi')->first();
        }

        if (! $dokumen) {
            abort(404, 'Dokumen RKAKL belum tersedia.');
        }

        $namaHash = basename($dokumen->nama_hash);
        $path = 'dokumen/rkakl/'.$namaHash;

        if (! Storage::disk('local')->exists($path)) {
            abort(404, 'Berkas fisik dokumen RKAKL tidak ditemukan di server.');
        }

        $namaAsli = $dokumen->nama_asli ?: 'RKAKL_TA.pdf';
        $disposition = $request->query('disposition', 'attachment');

        if ($disposition === 'inline') {
            return Storage::disk('local')->response($path, $namaAsli);
        }

        return Storage::disk('local')->download($path, $namaAsli);
    }
}
