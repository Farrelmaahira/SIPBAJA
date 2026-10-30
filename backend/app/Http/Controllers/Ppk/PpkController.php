<?php

namespace App\Http\Controllers\Ppk;

use App\Http\Controllers\Controller;

use App\Http\Requests\ReviewPengadaanRequest;
use App\Http\Requests\TolakPermohonanRequest;
use App\Models\Notification;
use App\Models\Pengadaan;
use App\Services\PpkService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PpkController extends Controller
{
    public function __construct(private PpkService $ppkService) {}

    public function dashboard(): JsonResponse
    {
        $data = $this->ppkService->getDashboardData();
        $recentNotifications = Notification::where('user_id', auth()->id())
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();
        $unreadCount = Notification::where('user_id', auth()->id())
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'stats' => $data['stats'],
            'pengajuanTerbaru' => $data['pengajuan_terbaru'],
            'recentNotifications' => $recentNotifications,
            'unreadNotificationsCount' => $unreadCount,
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $filters = [
            'q' => $request->query('q', ''),
            'statuses' => $request->query('statuses', []),
        ];

        $pengajuan = $this->ppkService->paginatePengadaan($filters, 10);
        $recentNotifications = Notification::where('user_id', auth()->id())
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();
        $unreadCount = Notification::where('user_id', auth()->id())
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'pengajuan' => $pengajuan,
            'filters' => $filters,
            'recentNotifications' => $recentNotifications,
            'unreadNotificationsCount' => $unreadCount,
        ]);
    }

    public function review(Pengadaan $pengadaan): JsonResponse
    {
        $detail = $this->ppkService->getDetailPengadaan($pengadaan);
        $recentNotifications = Notification::where('user_id', auth()->id())
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();
        $unreadCount = Notification::where('user_id', auth()->id())
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'detail' => $detail,
            'recentNotifications' => $recentNotifications,
            'unreadNotificationsCount' => $unreadCount,
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
        $recentNotifications = Notification::where('user_id', auth()->id())
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();
        $unreadCount = Notification::where('user_id', auth()->id())
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'detail' => $detail,
            'recentNotifications' => $recentNotifications,
            'unreadNotificationsCount' => $unreadCount,
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
        $recentNotifications = Notification::where('user_id', auth()->id())
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();
        $unreadCount = Notification::where('user_id', auth()->id())
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'detail' => $detail,
            'recentNotifications' => $recentNotifications,
            'unreadNotificationsCount' => $unreadCount,
        ]);
    }

    public function notifikasi(Request $request): JsonResponse
    {
        $tab = $request->query('tab', 'semua');
        $notifData = $this->ppkService->getNotifications(auth()->user(), $tab);

        return response()->json([
            'notifications' => $notifData['notifications'],
            'unreadCount' => $notifData['unread_count'],
            'activeTab' => $notifData['active_tab'],
        ]);
    }

    public function markAllRead(): JsonResponse
    {
        $this->ppkService->markAllNotificationsRead(auth()->user());

        return response()->json([
            'message' => 'Semua notifikasi telah ditandai dibaca.',
        ]);
    }

    public function markOneRead(Notification $notification): JsonResponse
    {
        if ($notification->user_id === auth()->id() && is_null($notification->read_at)) {
            $notification->update(['read_at' => now()]);
        }

        return response()->json([
            'message' => 'Notifikasi ditandai dibaca.',
        ]);
    }

    public function profil(): JsonResponse
    {
        $user = auth()->user()->load(['Role', 'Unit']);
        $recentNotifications = Notification::where('user_id', auth()->id())
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();
        $unreadCount = Notification::where('user_id', auth()->id())
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'user' => $user,
            'recentNotifications' => $recentNotifications,
            'unreadNotificationsCount' => $unreadCount,
        ]);
    }
}
