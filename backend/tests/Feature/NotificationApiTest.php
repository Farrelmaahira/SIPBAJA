<?php

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([RoleSeeder::class, UserSeeder::class]);
    }

    public function test_centralized_notifications_endpoints(): void
    {
        $user = User::where('email', 'perencanaan@pnj.ac.id')->firstOrFail();
        $otherUser = User::where('email', 'pp@pnj.ac.id')->firstOrFail();

        $notif1 = Notification::create([
            'user_id' => $user->id,
            'channel' => 'in_app',
            'judul' => 'Pengingat Dokumen',
            'pesan' => 'Ada dokumen permohonan baru.',
        ]);

        $notif2 = Notification::create([
            'user_id' => $user->id,
            'channel' => 'in_app',
            'judul' => 'Status Berubah',
            'pesan' => 'Status permohonan disetujui.',
        ]);

        // 1. Centralized list
        $listRes = $this->actingAs($user, 'sanctum')->getJson('/api/v1/notifications');
        $listRes->assertStatus(200)
            ->assertJsonStructure(['notifications', 'unreadCount', 'unreadNotificationsCount', 'activeTab'])
            ->assertJson(['unreadCount' => 2]);

        // 2. Centralized summary
        $summaryRes = $this->actingAs($user, 'sanctum')->getJson('/api/v1/notifications/summary');
        $summaryRes->assertStatus(200)
            ->assertJsonStructure(['recentNotifications', 'unreadNotificationsCount', 'unreadCount'])
            ->assertJson(['unreadCount' => 2]);

        // 3. Centralized unread-count
        $unreadRes = $this->actingAs($user, 'sanctum')->getJson('/api/v1/notifications/unread-count');
        $unreadRes->assertStatus(200)
            ->assertJson(['unreadCount' => 2]);

        // 4. Mark one read - Forbidden for other user
        $forbiddenRes = $this->actingAs($otherUser, 'sanctum')->postJson("/api/v1/notifications/{$notif1->id}/read");
        $forbiddenRes->assertStatus(403);

        // 5. Mark one read - Success for owner
        $readOneRes = $this->actingAs($user, 'sanctum')->postJson("/api/v1/notifications/{$notif1->id}/read");
        $readOneRes->assertStatus(200)->assertJson(['message' => 'Notifikasi ditandai dibaca.']);
        $this->assertNotNull($notif1->fresh()->read_at);

        // 6. Mark all read
        $readAllRes = $this->actingAs($user, 'sanctum')->postJson('/api/v1/notifications/read-all');
        $readAllRes->assertStatus(200)->assertJson(['message' => 'Semua notifikasi telah ditandai dibaca.']);
        $this->assertNotNull($notif2->fresh()->read_at);

        // 7. Store / create notification via API
        $createRes = $this->actingAs($user, 'sanctum')->postJson('/api/v1/notifications', [
            'user_id' => $user->id,
            'judul' => 'Notifikasi Baru API',
            'pesan' => 'Isi pesan testing.',
        ]);
        $createRes->assertStatus(201)
            ->assertJsonStructure(['message', 'notification']);

        $createdId = $createRes->json('notification.id');

        // 8. Delete notification - Forbidden for other user
        $forbiddenDel = $this->actingAs($otherUser, 'sanctum')->deleteJson("/api/v1/notifications/{$createdId}");
        $forbiddenDel->assertStatus(403);

        // 9. Delete notification - Success for owner
        $delRes = $this->actingAs($user, 'sanctum')->deleteJson("/api/v1/notifications/{$createdId}");
        $delRes->assertStatus(200)->assertJson(['message' => 'Notifikasi berhasil dihapus.']);
        $this->assertDatabaseMissing('notifications', ['id' => $createdId]);
    }

    public function test_centralized_notifikasi_alias_endpoints(): void
    {
        $user = User::where('email', 'admin@pnj.ac.id')->firstOrFail();

        Notification::create([
            'user_id' => $user->id,
            'channel' => 'in_app',
            'judul' => 'Info Sistem',
            'pesan' => 'Pemeliharaan server berkala.',
        ]);

        $resList = $this->actingAs($user, 'sanctum')->getJson('/api/v1/notifikasi');
        $resList->assertStatus(200)->assertJsonStructure(['notifications', 'unreadCount']);

        $resSummary = $this->actingAs($user, 'sanctum')->getJson('/api/v1/notifikasi/summary');
        $resSummary->assertStatus(200)->assertJsonStructure(['recentNotifications', 'unreadNotificationsCount']);
    }

    public function test_perencanaan_can_read_and_manage_notifications(): void
    {
        $user = User::where('email', 'perencanaan@pnj.ac.id')->firstOrFail();

        $notif1 = Notification::create([
            'user_id' => $user->id,
            'channel' => 'in_app',
            'judul' => 'Pengingat Dokumen',
            'pesan' => 'Ada dokumen permohonan baru.',
        ]);

        $notif2 = Notification::create([
            'user_id' => $user->id,
            'channel' => 'in_app',
            'judul' => 'Status Berubah',
            'pesan' => 'Status permohonan disetujui.',
        ]);

        // List Notifikasi via role route
        $listRes = $this->actingAs($user, 'sanctum')->getJson('/api/v1/perencanaan/notifikasi');
        $listRes->assertStatus(200)
            ->assertJsonStructure(['notifications', 'unreadCount', 'activeTab'])
            ->assertJson(['unreadCount' => 2]);

        // Mark one as read via role route
        $readOneRes = $this->actingAs($user, 'sanctum')->postJson("/api/v1/perencanaan/notifikasi/{$notif1->id}/read");
        $readOneRes->assertStatus(200)->assertJson(['message' => 'Notifikasi ditandai dibaca.']);
        $this->assertNotNull($notif1->fresh()->read_at);
        $this->assertNull($notif2->fresh()->read_at);

        // Mark all as read via role route
        $readAllRes = $this->actingAs($user, 'sanctum')->postJson('/api/v1/perencanaan/notifikasi/read-all');
        $readAllRes->assertStatus(200)->assertJson(['message' => 'Semua notifikasi telah ditandai dibaca.']);
        $this->assertNotNull($notif2->fresh()->read_at);
    }

    public function test_pp_can_read_and_manage_notifications(): void
    {
        $user = User::where('email', 'pp@pnj.ac.id')->firstOrFail();

        $notif = Notification::create([
            'user_id' => $user->id,
            'channel' => 'in_app',
            'judul' => 'Pengadaan Masuk',
            'pesan' => 'Pengadaan perlu direview.',
        ]);

        $readRes = $this->actingAs($user, 'sanctum')->postJson("/api/v1/pp/notifikasi/{$notif->id}/read");
        $readRes->assertStatus(200);
        $this->assertNotNull($notif->fresh()->read_at);
    }

    public function test_ppk_can_read_and_manage_notifications(): void
    {
        $user = User::where('email', 'ppk@pnj.ac.id')->firstOrFail();

        $notif = Notification::create([
            'user_id' => $user->id,
            'channel' => 'in_app',
            'judul' => 'Pengadaan Siap TTD',
            'pesan' => 'Pengadaan butuh persetujuan PPK.',
        ]);

        $readRes = $this->actingAs($user, 'sanctum')->postJson("/api/v1/ppk/notifikasi/{$notif->id}/read");
        $readRes->assertStatus(200);
        $this->assertNotNull($notif->fresh()->read_at);
    }
}
