<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class NotificationService
{
    /**
     * Mengambil daftar notifikasi terbaru untuk pengguna.
     *
     * @return Collection<int, Notification>
     */
    public function getRecent(User|int $user, int $limit = 5): Collection
    {
        return Notification::where('user_id', $this->resolveUserId($user))
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }

    /**
     * Menghitung jumlah notifikasi yang belum dibaca oleh pengguna.
     */
    public function getUnreadCount(User|int $user): int
    {
        return Notification::where('user_id', $this->resolveUserId($user))
            ->whereNull('read_at')
            ->count();
    }

    /**
     * Mengambil daftar notifikasi terbaru beserta jumlah notifikasi yang belum dibaca.
     *
     * @return array{recentNotifications: Collection<int, Notification>, unreadNotificationsCount: int}
     */
    public function getRecentAndUnreadCount(User|int $user, int $limit = 5): array
    {
        return [
            'recentNotifications' => $this->getRecent($user, $limit),
            'unreadNotificationsCount' => $this->getUnreadCount($user),
        ];
    }

    /**
     * Mengambil daftar notifikasi terpaginasi berdasarkan filter tab.
     *
     * @return array{notifications: LengthAwarePaginator, unread_count: int, active_tab: string}
     */
    public function getNotifications(User|int $user, ?string $tab = 'semua', int $perPage = 10): array
    {
        $userId = $this->resolveUserId($user);
        $query = Notification::where('user_id', $userId);

        if ($tab === 'pengingat') {
            $query->where('judul', 'like', '%pengingat%');
        } elseif ($tab === 'status') {
            $query->where(function (Builder $q) {
                $q->where('judul', 'like', '%status%')
                    ->orWhere('judul', 'like', '%disetujui%')
                    ->orWhere('judul', 'like', '%ditolak%')
                    ->orWhere('judul', 'like', '%verifikasi%')
                    ->orWhere('judul', 'like', '%penandatanganan%');
            });
        }

        $notifications = $query->orderByDesc('created_at')->paginate($perPage)->withQueryString();
        $unreadCount = $this->getUnreadCount($userId);

        return [
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
            'active_tab' => $tab ?? 'semua',
        ];
    }

    /**
     * Menandai satu notifikasi sebagai telah dibaca jika milik pengguna yang bersangkutan.
     */
    public function markAsRead(Notification $notification, User|int $user): bool
    {
        $userId = $this->resolveUserId($user);

        if ($notification->user_id === $userId && is_null($notification->read_at)) {
            return (bool) $notification->update(['read_at' => Carbon::now()]);
        }

        return false;
    }

    /**
     * Menandai semua notifikasi pengguna yang belum dibaca menjadi telah dibaca.
     */
    public function markAllAsRead(User|int $user): int
    {
        $userId = $this->resolveUserId($user);

        return Notification::where('user_id', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => Carbon::now()]);
    }

    /**
     * Alias kompatibilitas untuk menandai semua notifikasi telah dibaca.
     */
    public function markAllNotificationsRead(User|int $user): void
    {
        $this->markAllAsRead($user);
    }

    /**
     * Mengirim / membuat notifikasi baru untuk pengguna.
     */
    public function send(
        User|int $user,
        string $judul,
        string $pesan,
        ?string $refType = null,
        ?int $refId = null,
        string $channel = 'in_app'
    ): Notification {
        return Notification::create([
            'user_id' => $this->resolveUserId($user),
            'channel' => $channel,
            'judul' => $judul,
            'pesan' => $pesan,
            'ref_type' => $refType,
            'ref_id' => $refId,
        ]);
    }

    /**
     * Menghapus notifikasi jika milik pengguna yang bersangkutan.
     */
    public function delete(Notification $notification, User|int $user): bool
    {
        $userId = $this->resolveUserId($user);

        if ($notification->user_id === $userId) {
            return (bool) $notification->delete();
        }

        return false;
    }

    /**
     * Helper untuk mengekstrak ID pengguna dari instance User atau integer.
     */
    private function resolveUserId(User|int $user): int
    {
        return $user instanceof User ? $user->id : $user;
    }
}
