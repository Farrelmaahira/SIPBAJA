<?php

namespace App\Http\Controllers\Ppk;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReviewPengadaanRequest;
use App\Http\Requests\TolakPermohonanRequest;
use App\Models\Pengadaan;
use App\Services\NotificationService;
use App\Services\PpkService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PpkController extends Controller
{
    public function __construct(
        private PpkService $ppkService,
        private NotificationService $notificationService
    ) {}

    public function dashboard(): JsonResponse
    {
        $data = $this->ppkService->getDashboardData();
        $notifData = $this->notificationService->getRecentAndUnreadCount(auth()->id());

        return response()->json([
            'stats' => $data['stats'],
            'pengajuanTerbaru' => $data['pengajuan_terbaru'],
            'recentNotifications' => $notifData['recentNotifications'],
            'unreadNotificationsCount' => $notifData['unreadNotificationsCount'],
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $filters = [
            'q' => $request->query('q', ''),
            'statuses' => $request->query('statuses', []),
        ];

        $pengajuan = $this->ppkService->paginatePengadaan($filters, 10);
        $notifData = $this->notificationService->getRecentAndUnreadCount(auth()->id());

        return response()->json([
            'pengajuan' => $pengajuan,
            'filters' => $filters,
            'recentNotifications' => $notifData['recentNotifications'],
            'unreadNotificationsCount' => $notifData['unreadNotificationsCount'],
        ]);
    }

    public function review(Pengadaan $pengadaan): JsonResponse
    {
        $detail = $this->ppkService->getDetailPengadaan($pengadaan);
        $notifData = $this->notificationService->getRecentAndUnreadCount(auth()->id());

        return response()->json([
            'detail' => $detail,
            'recentNotifications' => $notifData['recentNotifications'],
            'unreadNotificationsCount' => $notifData['unreadNotificationsCount'],
        ]);
    }

    public function approve(Pengadaan $pengadaan): JsonResponse
    {
        $this->ppkService->approvePengadaan($pengadaan, auth()->user());

        return response()->json([
            'message' => 'Dokumen pengadaan berhasil disetujui oleh PPK.',
        ]);
    }

    public function reject(ReviewPengadaanRequest $request, Pengadaan $pengadaan): JsonResponse
    {
        $this->ppkService->rejectPengadaan($pengadaan, auth()->user(), $request->validated('alasan'));

        return response()->json([
            'message' => 'Dokumen pengadaan ditolak dan dikembalikan ke PPBJ.',
        ]);
    }

    public function pembayaran(Pengadaan $pengadaan): JsonResponse
    {
        $detail = $this->ppkService->getDetailPengadaan($pengadaan);
        $notifData = $this->notificationService->getRecentAndUnreadCount(auth()->id());

        return response()->json([
            'detail' => $detail,
            'recentNotifications' => $notifData['recentNotifications'],
            'unreadNotificationsCount' => $notifData['unreadNotificationsCount'],
        ]);
    }

    public function approvePembayaran(Request $request, Pengadaan $pengadaan): JsonResponse
    {
        $filename = $request->input('filename', "Memo_Persetujuan_{$pengadaan->Permohonan?->nomor_surat}.pdf");
        $catatan = $request->input('catatan');

        $this->ppkService->approvePembayaran($pengadaan, auth()->user(), $filename, $catatan);

        return response()->json([
            'message' => 'Dokumen pembayaran beserta Memo Persetujuan berhasil disetujui.',
        ]);
    }

    public function rejectPembayaran(TolakPermohonanRequest $request, Pengadaan $pengadaan): JsonResponse
    {
        $this->ppkService->rejectPembayaran($pengadaan, auth()->user(), $request->validated('alasan'));

        return response()->json([
            'message' => 'Dokumen pembayaran telah ditolak beserta catatan revisi.',
        ]);
    }

    public function show(Pengadaan $pengadaan): JsonResponse
    {
        $detail = $this->ppkService->getDetailPengadaan($pengadaan);
        $notifData = $this->notificationService->getRecentAndUnreadCount(auth()->id());

        return response()->json([
            'detail' => $detail,
            'recentNotifications' => $notifData['recentNotifications'],
            'unreadNotificationsCount' => $notifData['unreadNotificationsCount'],
        ]);
    }

    public function profil(): JsonResponse
    {
        $user = auth()->user()->load(['Role', 'Unit']);
        $notifData = $this->notificationService->getRecentAndUnreadCount(auth()->id());

        return response()->json([
            'user' => $user,
            'recentNotifications' => $notifData['recentNotifications'],
            'unreadNotificationsCount' => $notifData['unreadNotificationsCount'],
        ]);
    }
}
