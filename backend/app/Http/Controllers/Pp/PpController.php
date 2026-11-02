<?php

namespace App\Http\Controllers\Pp;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReviewPengadaanRequest;
use App\Models\Pengadaan;
use App\Services\NotificationService;
use App\Services\PpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PpController extends Controller
{
    public function __construct(
        private PpService $ppService,
        private NotificationService $notificationService
    ) {}

    /**
     * Tampilan Halaman Dashboard PP.
     */
    public function dashboard(): JsonResponse
    {
        $dashboardData = $this->ppService->getDashboardData();
        $notifData = $this->notificationService->getRecentAndUnreadCount(auth()->id());

        return response()->json([
            'stats' => $dashboardData['stats'],
            'chart' => $dashboardData['chart'],
            'pengadaanPerluReview' => $dashboardData['pengadaan_perlu_review'],
            'recentNotifications' => $notifData['recentNotifications'],
            'unreadNotificationsCount' => $notifData['unreadNotificationsCount'],
        ]);
    }

    /**
     * Tampilan Halaman List Pengajuan dengan pencarian & filter status.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = [
            'q' => $request->query('q', ''),
            'statuses' => $request->query('statuses', []),
        ];

        $pengajuan = $this->ppService->paginatePengadaan($filters, 10);
        $notifData = $this->notificationService->getRecentAndUnreadCount(auth()->id());

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
    public function review(Pengadaan $pengadaan): JsonResponse
    {
        $detail = $this->ppService->getDetailPengadaan($pengadaan);
        $notifData = $this->notificationService->getRecentAndUnreadCount(auth()->id());

        return response()->json([
            'detail' => $detail,
            'recentNotifications' => $notifData['recentNotifications'],
            'unreadNotificationsCount' => $notifData['unreadNotificationsCount'],
        ]);
    }

    /**
     * Aksi Persetujuan Dokumen Pengadaan oleh PP.
     */
    public function approve(Pengadaan $pengadaan): JsonResponse
    {
        $this->ppService->approve($pengadaan, auth()->user());

        return response()->json([
            'message' => 'Dokumen pengadaan berhasil disetujui dan diteruskan ke PPK.',
        ]);
    }

    /**
     * Aksi Penolakan / Permintaan Revisi Dokumen Pengadaan oleh PP.
     */
    public function reject(ReviewPengadaanRequest $request, Pengadaan $pengadaan): JsonResponse
    {
        $this->ppService->reject($pengadaan, auth()->user(), $request->validated('alasan'));

        return response()->json([
            'message' => 'Dokumen pengadaan berhasil ditolak dan dikembalikan ke PPBJ untuk direvisi.',
        ]);
    }

    /**
     * Tampilan Halaman Rekap Pengajuan (Detail Siklus 5 Tahap).
     */
    public function show(Pengadaan $pengadaan): JsonResponse
    {
        $detail = $this->ppService->getDetailPengadaan($pengadaan);
        $notifData = $this->notificationService->getRecentAndUnreadCount(auth()->id());

        return response()->json([
            'detail' => $detail,
            'recentNotifications' => $notifData['recentNotifications'],
            'unreadNotificationsCount' => $notifData['unreadNotificationsCount'],
        ]);
    }

    /**
     * Tampilan Halaman Profil Pengguna PP.
     */
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
