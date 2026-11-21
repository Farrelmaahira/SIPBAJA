<?php

namespace App\Http\Controllers\Ppk;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReviewPengadaanRequest;
use App\Http\Requests\SetujuiPembayaranPpkRequest;
use App\Http\Requests\TolakPermohonanRequest;
use App\Models\Dokumen;
use App\Models\Pengadaan;
use App\Services\ApprovalService;
use App\Services\NotificationService;
use App\Services\PengadaanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PpkController extends Controller
{
    public function __construct(
        private PengadaanService $pengadaanService,
        private ApprovalService $approvalService,
        private NotificationService $notificationService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = [
            'q' => $request->query('q', $request->query('search', '')),
            'search' => $request->query('search', $request->query('q', '')),
            'statuses' => $request->query('statuses', []),
            'status' => $request->query('status'),
            'bulan' => $request->query('bulan'),
            'tahun' => $request->query('tahun'),
            'unit_id' => $request->query('unit_id'),
        ];

        $perPage = (int) $request->query('per_page', 10);
        $pengajuan = $this->pengadaanService->paginatePengadaanPpk(auth()->user(), $filters, $perPage);
        $notifData = $this->notificationService->getRecentAndUnreadCount((int) auth()->id());

        return response()->json([
            'pengajuan' => $pengajuan,
            'filters' => $filters,
            'recentNotifications' => $notifData['recentNotifications'],
            'unreadNotificationsCount' => $notifData['unreadNotificationsCount'],
        ]);
    }

    public function review(Pengadaan $pengadaan): JsonResponse
    {
        $detail = $this->pengadaanService->getDetailPengadaanLengkap($pengadaan, auth()->user());
        $notifData = $this->notificationService->getRecentAndUnreadCount((int) auth()->id());

        return response()->json([
            'detail' => $detail,
            'recentNotifications' => $notifData['recentNotifications'],
            'unreadNotificationsCount' => $notifData['unreadNotificationsCount'],
        ]);
    }

    public function approve(Pengadaan $pengadaan): JsonResponse
    {
        $updated = $this->approvalService->approvePengadaanPpk($pengadaan, auth()->user());

        return response()->json([
            'message' => 'Dokumen pengadaan berhasil disetujui oleh PPK dan diteruskan ke PPBJ.',
            'data' => $updated,
        ]);
    }

    public function reject(ReviewPengadaanRequest $request, Pengadaan $pengadaan): JsonResponse
    {
        $updated = $this->approvalService->rejectPengadaanPpk(
            $pengadaan,
            auth()->user(),
            $request->alasanPenolakan()
        );

        return response()->json([
            'message' => 'Dokumen pengadaan ditolak dan dikembalikan ke PPBJ.',
            'data' => $updated,
        ]);
    }

    public function pembayaran(Pengadaan $pengadaan): JsonResponse
    {
        $detail = $this->pengadaanService->getDetailPengadaanLengkap($pengadaan, auth()->user());
        $notifData = $this->notificationService->getRecentAndUnreadCount((int) auth()->id());

        return response()->json([
            'detail' => $detail,
            'recentNotifications' => $notifData['recentNotifications'],
            'unreadNotificationsCount' => $notifData['unreadNotificationsCount'],
        ]);
    }

    public function approvePembayaran(SetujuiPembayaranPpkRequest $request, Pengadaan $pengadaan): JsonResponse
    {
        $updated = $this->approvalService->approvePembayaranPpk(
            $pengadaan,
            auth()->user(),
            $request->file('memo'),
            $request->validated('catatan')
        );

        return response()->json([
            'message' => 'Dokumen pembayaran beserta Memo Persetujuan berhasil disetujui.',
            'data' => $updated,
        ]);
    }

    public function rejectPembayaran(TolakPermohonanRequest $request, Pengadaan $pengadaan): JsonResponse
    {
        $updated = $this->approvalService->rejectPembayaranPpk(
            $pengadaan,
            auth()->user(),
            (string) $request->validated('alasan')
        );

        return response()->json([
            'message' => 'Dokumen pembayaran telah ditolak beserta catatan revisi.',
            'data' => $updated,
        ]);
    }

    public function show(Pengadaan $pengadaan): JsonResponse
    {
        $detail = $this->pengadaanService->getDetailPengadaanLengkap($pengadaan, auth()->user());
        $notifData = $this->notificationService->getRecentAndUnreadCount((int) auth()->id());

        return response()->json([
            'detail' => $detail,
            'recentNotifications' => $notifData['recentNotifications'],
            'unreadNotificationsCount' => $notifData['unreadNotificationsCount'],
        ]);
    }

    public function profil(): JsonResponse
    {
        $user = $this->pengadaanService->getProfilPengguna(auth()->user());
        $notifData = $this->notificationService->getRecentAndUnreadCount((int) auth()->id());

        return response()->json([
            'user' => $user,
            'recentNotifications' => $notifData['recentNotifications'],
            'unreadNotificationsCount' => $notifData['unreadNotificationsCount'],
        ]);
    }

    /**
     * Mengunduh atau melihat dokumen pengadaan/permohonan oleh PPK.
     */
    public function downloadDokumen(Request $request, Pengadaan $pengadaan, Dokumen $dokumen): StreamedResponse|JsonResponse
    {
        // Validasi kepemilikan MAK oleh PPK
        $makPpkId = $pengadaan->PermohonanMak?->Mak?->ppk_user_id;
        if ($pengadaan->ppk_id !== null || $makPpkId !== null) {
            $cocok = ((int) $pengadaan->ppk_id === (int) auth()->id())
                || ((int) $makPpkId === (int) auth()->id());
            if (! $cocok) {
                abort(403, 'Anda tidak memiliki akses pada dokumen pengadaan milik PPK lain.');
            }
        }

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
            if ($dokumen->ref_type === 'permohonan') {
                $path = 'dokumen/permohonan/'.$dokumen->nama_hash;
            } elseif ($dokumen->ref_type === 'pengadaan') {
                $path = 'dokumen/pengadaan/'.$dokumen->nama_hash;
            } elseif ($dokumen->ref_type === 'approval_permohonan') {
                $path = $this->memoPath($dokumen);
            }
        }

        if (! $path || ! Storage::disk('local')->exists($path)) {
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
