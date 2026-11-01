<?php

namespace Tests\Unit\Services;

use App\Models\Notification;
use App\Models\User;
use App\Services\NotificationService;
use Database\Seeders\RoleSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationServiceTest extends TestCase
{
    use RefreshDatabase;

    protected NotificationService $notificationService;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([RoleSeeder::class, UserSeeder::class]);
        $this->notificationService = app(NotificationService::class);
        $this->user = User::where('email', 'perencanaan@pnj.ac.id')->firstOrFail();
    }

    public function test_send_creates_notification_record(): void
    {
        $notif = $this->notificationService->send(
            user: $this->user,
            judul: 'Pengingat Dokumen',
            pesan: 'Mohon periksa dokumen masuk.',
            refType: 'permohonan',
            refId: 10
        );

        $this->assertInstanceOf(Notification::class, $notif);
        $this->assertEquals($this->user->id, $notif->user_id);
        $this->assertEquals('Pengingat Dokumen', $notif->judul);
        $this->assertEquals('Mohon periksa dokumen masuk.', $notif->pesan);
        $this->assertEquals('permohonan', $notif->ref_type);
        $this->assertEquals(10, $notif->ref_id);
        $this->assertNull($notif->read_at);
    }

    public function test_get_recent_and_unread_count(): void
    {
        for ($i = 1; $i <= 7; $i++) {
            $this->notificationService->send(
                user: $this->user,
                judul: "Notifikasi {$i}",
                pesan: "Pesan {$i}"
            );
        }

        $recent = $this->notificationService->getRecent($this->user, 5);
        $this->assertCount(5, $recent);

        $unreadCount = $this->notificationService->getUnreadCount($this->user);
        $this->assertEquals(7, $unreadCount);

        $summary = $this->notificationService->getRecentAndUnreadCount($this->user, 5);
        $this->assertCount(5, $summary['recentNotifications']);
        $this->assertEquals(7, $summary['unreadNotificationsCount']);
    }

    public function test_get_notifications_with_tab_filtering(): void
    {
        $this->notificationService->send(
            user: $this->user,
            judul: 'Pengingat Deadline',
            pesan: 'Batas waktu hari ini.'
        );

        $this->notificationService->send(
            user: $this->user,
            judul: 'Permohonan Disetujui',
            pesan: 'Permohonan telah disetujui.'
        );

        $this->notificationService->send(
            user: $this->user,
            judul: 'Informasi Umum',
            pesan: 'Informasi sistem.'
        );

        $allNotifs = $this->notificationService->getNotifications($this->user, 'semua');
        $this->assertEquals(3, $allNotifs['notifications']->total());
        $this->assertEquals('semua', $allNotifs['active_tab']);

        $pengingatNotifs = $this->notificationService->getNotifications($this->user, 'pengingat');
        $this->assertEquals(1, $pengingatNotifs['notifications']->total());
        $this->assertEquals('pengingat', $pengingatNotifs['active_tab']);

        $statusNotifs = $this->notificationService->getNotifications($this->user, 'status');
        $this->assertEquals(1, $statusNotifs['notifications']->total());
        $this->assertEquals('status', $statusNotifs['active_tab']);
    }

    public function test_mark_as_read_for_single_notification(): void
    {
        $notif = $this->notificationService->send(
            user: $this->user,
            judul: 'Test Notif',
            pesan: 'Test isi'
        );

        $otherUser = User::where('email', 'pp@pnj.ac.id')->firstOrFail();

        // Tidak bisa dibaca oleh user lain
        $resOther = $this->notificationService->markAsRead($notif, $otherUser);
        $this->assertFalse($resOther);
        $this->assertNull($notif->fresh()->read_at);

        // Berhasil dibaca oleh pemilik
        $resOwner = $this->notificationService->markAsRead($notif, $this->user);
        $this->assertTrue($resOwner);
        $this->assertNotNull($notif->fresh()->read_at);

        // Membaca ulang notifikasi yang sudah dibaca mengembalikan false
        $resAlreadyRead = $this->notificationService->markAsRead($notif->fresh(), $this->user);
        $this->assertFalse($resAlreadyRead);
    }

    public function test_mark_all_as_read(): void
    {
        for ($i = 1; $i <= 3; $i++) {
            $this->notificationService->send(
                user: $this->user,
                judul: "Notif {$i}",
                pesan: "Pesan {$i}"
            );
        }

        $this->assertEquals(3, $this->notificationService->getUnreadCount($this->user));

        $updatedCount = $this->notificationService->markAllAsRead($this->user);
        $this->assertEquals(3, $updatedCount);
        $this->assertEquals(0, $this->notificationService->getUnreadCount($this->user));
    }
}

