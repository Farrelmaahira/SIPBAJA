<?php

namespace App\Http\Controllers\Pp;

use App\Http\Controllers\Controller;
use App\Services\NotificationService;
use App\Services\PengadaanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardPpController extends Controller
{
    public function __construct(
        private PengadaanService $pengadaanService,
        private NotificationService $notificationService
    ) {}

    public function __invoke(Request $request): JsonResponse
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
}
