<?php

namespace App\Http\Controllers\Pp;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReviewPengadaanRequest;
use App\Models\Dokumen;
use App\Models\Pengadaan;
use App\Services\ApprovalService;
use App\Services\NotificationService;
use App\Services\PengadaanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PpController extends Controller
{
    public function __construct(
        private PengadaanService $pengadaanService,
        private ApprovalService $approvalService,
        private NotificationService $notificationService
    ) {}

    /**
     * Tampilan Halaman List Pengajuan dengan pencarian & filter status.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = [
            'q' => $request->query('q', $request->query('search', '')),
            'status' => $request->query('status'),
            'statuses' => $request->query('statuses', []),
            'bulan' => $request->query('bulan'),
            'tahun' => $request->query('tahun'),
            'unit_id' => $request->query('unit_id'),
        ];

        $pengajuan = $this->pengadaanService->paginatePengadaanPp($filters, 10);
        $notifData = $this->notificationService->getRecentAndUnreadCount((int) $request->user()->id);

        return response()->json([
            'pengajuan' => $pengajuan,
            'filters' => $filters,
            'recentNotifications' => $notifData['recentNotifications'],
            'unreadNotificationsCount' => $notifData['unreadNotificationsCount'],
        ]);
    }

    /**
     * Tampilan Halaman Review Dokumen Pengadaan.
     */
    public function review(Request $request, Pengadaan $pengadaan): JsonResponse
    {
        $detail = $this->pengadaanService->getDetailPengadaanLengkap($pengadaan, $request->user());
        $notifData = $this->notificationService->getRecentAndUnreadCount((int) $request->user()->id);

        return response()->json([
            'detail' => $detail,
            'recentNotifications' => $notifData['recentNotifications'],
            'unreadNotificationsCount' => $notifData['unreadNotificationsCount'],
        ]);
    }

    /**
     * Aksi Verifikasi Berhasil Dokumen Pengadaan oleh PP.
     */
    public function approve(Request $request, Pengadaan $pengadaan): JsonResponse
    {
        $this->approvalService->approvePengadaanPp($pengadaan, $request->user());

        return response()->json([
            'message' => 'Dokumen pengadaan berhasil diverifikasi dan diteruskan ke PPK.',
        ]);
    }

    /**
     * Aksi Verifikasi Gagal / Permintaan Revisi Dokumen Pengadaan oleh PP.
     */
    public function reject(ReviewPengadaanRequest $request, Pengadaan $pengadaan): JsonResponse
    {
        $catatan = (string) ($request->validated('catatan') ?? $request->validated('alasan'));
        $this->approvalService->rejectPengadaanPp($pengadaan, $request->user(), $catatan);

        return response()->json([
            'message' => 'Dokumen pengadaan berhasil ditolak dan dikembalikan ke PPBJ untuk direvisi.',
        ]);
    }

    /**
     * Mengunduh atau melihat dokumen pengadaan/permohonan oleh PP.
     */
    public function downloadDokumen(Request $request, Pengadaan $pengadaan, Dokumen $dokumen): StreamedResponse|JsonResponse
    {
        // Validasi keterkaitan dokumen dengan pengadaan / permohonan ini
        $isPengadaanDoc = ($dokumen->ref_type === 'pengadaan' && (int) $dokumen->ref_id === (int) $pengadaan->id);
        $isPermohonanDoc = ($dokumen->ref_type === 'permohonan' && (int) $dokumen->ref_id === (int) $pengadaan->permohonan_id);
        $isPermohonanMemo = ($dokumen->ref_type === 'approval_permohonan' && (int) $dokumen->ref_id === (int) $pengadaan->permohonan_id);

        if (! $isPengadaanDoc && ! $isPermohonanDoc && ! $isPermohonanMemo) {
            abort(404, 'Dokumen tidak berkaitan dengan pengadaan ini.');
        }

        $disk = 'local';
        $path = $dokumen->path;

        if (! $path) {
            $namaHash = basename($dokumen->nama_hash);
            $candidates = array_unique(array_filter([
                $dokumen->nama_hash,
                'dokumen/pengadaan/'.$namaHash,
                'dokumen_pengadaan/'.$namaHash,
                'dokumen/permohonan/'.$namaHash,
                'dokumen/permohonan/memo/'.$namaHash,
                'dokumen/memo/'.$namaHash,
                $this->memoPath($dokumen),
            ]));

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
        }

        if (! $path || ! Storage::disk($disk)->exists($path)) {
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
     * Tampilan Halaman Rekap Pengajuan (Detail Siklus 5 Tahap).
     */
    public function show(Request $request, Pengadaan $pengadaan): JsonResponse
    {
        $detail = $this->pengadaanService->getDetailPengadaanLengkap($pengadaan, $request->user());
        $notifData = $this->notificationService->getRecentAndUnreadCount((int) $request->user()->id);

        return response()->json([
            'detail' => $detail,
            'recentNotifications' => $notifData['recentNotifications'],
            'unreadNotificationsCount' => $notifData['unreadNotificationsCount'],
        ]);
    }

    /**
     * Tampilan Halaman Profil Pengguna PP.
     */
    public function profil(Request $request): JsonResponse
    {
        $user = $this->pengadaanService->getProfilPengguna($request->user());
        $notifData = $this->notificationService->getRecentAndUnreadCount((int) $user->id);

        return response()->json([
            'user' => $user,
            'recentNotifications' => $notifData['recentNotifications'],
            'unreadNotificationsCount' => $notifData['unreadNotificationsCount'],
        ]);
    }

    /**
     * Menentukan lokasi penyimpanan berkas memo persetujuan permohonan.
     */
    private function memoPath(Dokumen $dokumen): ?string
    {
        $candidates = [
            'dokumen/memo/'.$dokumen->nama_hash,
            'dokumen/permohonan/memo/'.$dokumen->nama_hash,
            'dokumen/permohonan/'.$dokumen->nama_hash,
        ];

        foreach ($candidates as $candidate) {
            if (Storage::disk('local')->exists($candidate)) {
                return $candidate;
            }
        }

        return null;
    }
}
