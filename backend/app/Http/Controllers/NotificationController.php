<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(private NotificationService $notificationService) {}

    /**
     * Tampilan daftar notifikasi pengguna terpusat dengan filter tab & pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $tab = $request->query('tab', 'semua');
        $perPage = (int) $request->query('per_page', 10);

        $notifData = $this->notificationService->getNotifications(
            $request->user(),
            $tab,
            $perPage
        );

        return response()->json([
            'notifications' => $notifData['notifications'],
            'unreadCount' => $notifData['unread_count'],
            'unreadNotificationsCount' => $notifData['unread_count'],
            'activeTab' => $notifData['active_tab'],
        ]);
    }

    /**
     * Mengambil ringkasan notifikasi terbaru dan counter unread (untuk topbar / layout).
     */
    public function summary(Request $request): JsonResponse
    {
        $limit = (int) $request->query('limit', 5);
        $summary = $this->notificationService->getRecentAndUnreadCount($request->user(), $limit);

        return response()->json([
            'recentNotifications' => $summary['recentNotifications'],
            'unreadNotificationsCount' => $summary['unreadNotificationsCount'],
            'unreadCount' => $summary['unreadNotificationsCount'],
        ]);
    }

    /**
     * Mengambil jumlah notifikasi yang belum dibaca pengguna.
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $count = $this->notificationService->getUnreadCount($request->user());

        return response()->json([
            'unreadCount' => $count,
        ]);
    }

    /**
     * Menandai semua notifikasi pengguna sebagai telah dibaca.
     */
    public function markAllRead(Request $request): JsonResponse
    {
        $affected = $this->notificationService->markAllAsRead($request->user());

        return response()->json([
            'message' => 'Semua notifikasi telah ditandai dibaca.',
            'affected' => $affected,
        ]);
    }

    /**
     * Menandai satu notifikasi sebagai telah dibaca.
     */
    public function markOneRead(Request $request, Notification $notification): JsonResponse
    {
        if ($notification->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses ke notifikasi ini.',
            ], 403);
        }

        $this->notificationService->markAsRead($notification, $request->user());

        return response()->json([
            'message' => 'Notifikasi ditandai dibaca.',
        ]);
    }

    /**
     * Mengirim / membuat notifikasi baru (opsional untuk kebutuhan API).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'judul' => 'required|string|max:255',
            'pesan' => 'required|string',
            'channel' => 'nullable|string|max:50',
            'ref_type' => 'nullable|string|max:100',
            'ref_id' => 'nullable|integer',
        ]);

        $notification = $this->notificationService->send(
            user: $validated['user_id'],
            judul: $validated['judul'],
            pesan: $validated['pesan'],
            refType: $validated['ref_type'] ?? null,
            refId: $validated['ref_id'] ?? null,
            channel: $validated['channel'] ?? 'in_app'
        );

        return response()->json([
            'message' => 'Notifikasi berhasil dikirim.',
            'notification' => $notification,
        ], 201);
    }

    /**
     * Menghapus notifikasi milik pengguna.
     */
    public function destroy(Request $request, Notification $notification): JsonResponse
    {
        if ($notification->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses ke notifikasi ini.',
            ], 403);
        }

        $this->notificationService->delete($notification, $request->user());

        return response()->json([
            'message' => 'Notifikasi berhasil dihapus.',
        ]);
    }
}

