<?php

namespace App\Http\Controllers\Ppk;

use App\Http\Controllers\Controller;
use App\Services\NotificationService;
use App\Services\PengadaanService;
use App\Services\PermohonanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardPpkController extends Controller
{
    public function __construct(
        private PengadaanService $pengadaanService,
        private PermohonanService $permohonanService,
        private NotificationService $notificationService
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $user = auth()->user();
        $data = $this->pengadaanService->getDashboardPpk($user);
        $permohonanPaginator = $this->permohonanService->paginatePermohonanUntukPpk($user, [], 5);
        $notifData = $this->notificationService->getRecentAndUnreadCount((int) auth()->id());

        return response()->json([
            'stats' => $data['stats'],
            'pengajuanTerbaru' => $data['pengajuan_terbaru'],
            'permohonanTerbaru' => $permohonanPaginator->items(),
            'recentNotifications' => $notifData['recentNotifications'],
            'unreadNotificationsCount' => $notifData['unreadNotificationsCount'],
        ]);
    }
}
