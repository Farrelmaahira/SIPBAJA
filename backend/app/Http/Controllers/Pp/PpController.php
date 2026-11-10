<?php

namespace App\Http\Controllers\Pp;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReviewPengadaanRequest;
use App\Models\Pengadaan;
use App\Services\ApprovalService;
use App\Services\NotificationService;
use App\Services\PengadaanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PpController extends Controller
{
    public function __construct(
        private PengadaanService $pengadaanService,
        private ApprovalService $approvalService,
        private NotificationService $notificationService
    ) {}

    /**
     * Tampilan Halaman Dashboard PP.
     */
    public function dashboard(Request $request): JsonResponse
    {
        $dashboardData = $this->pengadaanService->getDashboardPp();
        $notifData = $this->notificationService->getRecentAndUnreadCount((int) $request->user()->id);

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
}
