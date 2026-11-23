<?php

namespace App\Http\Controllers\Bidang2;

use App\Http\Controllers\Controller;
use App\Http\Requests\Bidang2\SetujuPermohonanBidang2Request;
use App\Http\Requests\Bidang2\SetujuiPembayaranBidang2Request;
use App\Http\Requests\Bidang2\TolakPermohonanBidang2Request;
use App\Models\Pengadaan;
use App\Models\Permohonan;
use App\Services\ApprovalService;
use App\Services\Bidang2Service;
use App\Services\PengadaanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PengajuanBidang2Controller extends Controller
{
    public function __construct(
        private Bidang2Service $bidang2Service,
        private PengadaanService $pengadaanService,
        private ApprovalService $approvalService,
    ) {}

    /**
     * Menampilkan daftar seluruh pengajuan permohonan untuk Bidang 2.
     */
    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status', 'semua');
        $search = $request->query('search', '');

        $permohonanList = $this->bidang2Service->getPengajuanList($status, $search);

        return response()->json([
            'permohonanList' => $permohonanList,
            'filters' => [
                'status' => $status,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Menampilkan detail lengkap permohonan pengadaan untuk Bidang 2.
     */
    public function show(Request $request, Permohonan $permohonan): JsonResponse
    {
        $detail = $this->bidang2Service->getDetailPengajuan($permohonan);

        return response()->json([
            'permohonan' => $detail,
        ]);
    }

    /**
     * Menyetujui permohonan pengadaan dengan mengunggah memo persetujuan.
     */
    public function approve(SetujuPermohonanBidang2Request $request, Permohonan $permohonan): JsonResponse
    {
        $user = $request->user();
        $fileMemo = $request->file('file_memo');

        $updatedPermohonan = $this->bidang2Service->setujuPengajuan($user, $permohonan, $fileMemo);

        return response()->json([
            'message' => 'Permohonan berhasil disetujui dan memo persetujuan telah tersimpan.',
            'permohonan' => $updatedPermohonan,
        ]);
    }

    /**
     * Menolak permohonan pengadaan dengan menyertakan catatan alasan penolakan.
     */
    public function reject(TolakPermohonanBidang2Request $request, Permohonan $permohonan): JsonResponse
    {
        $user = $request->user();
        $alasan = $request->validated('alasan');

        $updatedPermohonan = $this->bidang2Service->tolakPengajuan($user, $permohonan, $alasan);

        return response()->json([
            'message' => 'Permohonan berhasil ditolak dan catatan telah diteruskan ke pemohon serta Perencanaan.',
            'permohonan' => $updatedPermohonan,
        ]);
    }

    /**
     * Menampilkan detail lengkap pengadaan untuk Bidang 2 (termasuk status & tracking FR-05).
     */
    public function showPengadaan(Request $request, Pengadaan $pengadaan): JsonResponse
    {
        $detail = $this->pengadaanService->getDetailPengadaanLengkap($pengadaan, $request->user());

        return response()->json([
            'detail' => $detail,
        ]);
    }

    /**
     * Menyetujui dokumen pembayaran pengadaan oleh Bidang 2 dengan mengunggah memo (FR-56).
     */
    public function approvePembayaran(SetujuiPembayaranBidang2Request $request, Pengadaan $pengadaan): JsonResponse
    {
        $updated = $this->approvalService->approvePembayaranBidang2(
            $pengadaan,
            $request->user(),
            $request->file('memo'),
            $request->validated('catatan')
        );

        return response()->json([
            'message' => 'Dokumen pembayaran beserta Memo Persetujuan Bidang 2 berhasil disetujui.',
            'data' => $updated,
        ]);
    }

    /**
     * Menolak dokumen pembayaran pengadaan oleh Bidang 2 dengan alasan spesifik (FR-57).
     */
    public function rejectPembayaran(Request $request, Pengadaan $pengadaan): JsonResponse
    {
        $request->validate([
            'alasan' => 'required|string|min:5|max:1000',
        ], [
            'alasan.required' => 'Alasan penolakan dokumen pembayaran wajib diisi.',
            'alasan.min' => 'Alasan penolakan minimal 5 karakter.',
        ]);

        $updated = $this->approvalService->rejectPembayaranBidang2(
            $pengadaan,
            $request->user(),
            (string) $request->input('alasan')
        );

        return response()->json([
            'message' => 'Dokumen pembayaran telah ditolak oleh Bidang 2 beserta catatan revisi.',
            'data' => $updated,
        ]);
    }

    /**
     * Mengunduh atau menampilkan pratinjau dokumen memo persetujuan Bidang 2.
     */
    public function downloadMemo(Request $request, Permohonan $permohonan): StreamedResponse
    {
        $memo = $this->bidang2Service->ambilMemo($permohonan);
        $disposition = $request->query('disposition', 'attachment');

        if ($disposition === 'inline') {
            return Storage::disk('local')->response($memo['path'], $memo['nama_asli']);
        }

        return Storage::disk('local')->download($memo['path'], $memo['nama_asli']);
    }
}
