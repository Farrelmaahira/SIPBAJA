<?php

namespace Tests\Feature\Ppk;

use App\Models\Mak;
use App\Models\Pengadaan;
use App\Models\Permohonan;
use App\Models\PermohonanMak;
use App\Models\User;
use Database\Seeders\MasterReferenceSeeder;
use Database\Seeders\PengadaanPpSeeder;
use Database\Seeders\RbacSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PpkFeatureTest extends TestCase
{
    use RefreshDatabase;

    protected User $ppkUser;

    protected User $nonPpkUser;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');

        $this->seed([
            RoleSeeder::class,
            RbacSeeder::class,
            UserSeeder::class,
            MasterReferenceSeeder::class,
            PengadaanPpSeeder::class,
        ]);

        $this->ppkUser = User::whereHas('role', fn ($q) => $q->where('nama', 'PPK'))->firstOrFail();
        $this->nonPpkUser = User::whereHas('role', fn ($q) => $q->where('nama', 'Pemohon'))->firstOrFail();
    }

    public function test_guest_cannot_access_ppk_routes(): void
    {
        $this->getJson('/api/v1/ppk/dashboard')->assertStatus(401);
        $this->getJson('/api/v1/ppk/pengajuan')->assertStatus(401);
    }

    public function test_non_ppk_user_is_forbidden(): void
    {
        $this->actingAs($this->nonPpkUser, 'sanctum')
            ->getJson('/api/v1/ppk/dashboard')
            ->assertStatus(403);
    }

    public function test_ppk_can_access_dashboard_with_invokable_controller(): void
    {
        $response = $this->actingAs($this->ppkUser, 'sanctum')
            ->getJson('/api/v1/ppk/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'stats' => ['total', 'menunggu', 'disetujui', 'ditolak'],
                'pengajuanTerbaru',
                'permohonanTerbaru',
                'recentNotifications',
                'unreadNotificationsCount',
            ]);
    }

    public function test_ppk_can_view_permohonan_list_and_detail(): void
    {
        $permohonan = Permohonan::firstOrFail();
        $mak = Mak::where('ppk_user_id', $this->ppkUser->id)->first()
            ?? Mak::create([
                'nama' => 'MAK Test PPK',
                'ppk_user_id' => $this->ppkUser->id,
            ]);

        PermohonanMak::firstOrCreate([
            'permohonan_id' => $permohonan->id,
            'mak_id' => $mak->id,
            'ditentukan_oleh' => $this->ppkUser->id,
        ]);

        $listResponse = $this->actingAs($this->ppkUser, 'sanctum')
            ->getJson('/api/v1/ppk/permohonan');

        $listResponse->assertStatus(200)
            ->assertJsonStructure(['data', 'meta', 'permohonan']);

        $detailResponse = $this->actingAs($this->ppkUser, 'sanctum')
            ->getJson("/api/v1/ppk/permohonan/{$permohonan->id}");

        $detailResponse->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'permohonan',
                    'dokumen_permohonan',
                ],
            ]);
    }

    public function test_ppk_can_approve_permohonan_with_memo(): void
    {
        $permohonan = Permohonan::firstOrFail();
        $mak = Mak::where('ppk_user_id', $this->ppkUser->id)->first()
            ?? Mak::create([
                'nama' => 'MAK Test PPK',
                'ppk_user_id' => $this->ppkUser->id,
            ]);

        PermohonanMak::firstOrCreate([
            'permohonan_id' => $permohonan->id,
            'mak_id' => $mak->id,
            'ditentukan_oleh' => $this->ppkUser->id,
        ]);

        $memo = UploadedFile::fake()->create('memo_persetujuan_ppk.pdf', 100, 'application/pdf');

        $response = $this->actingAs($this->ppkUser, 'sanctum')
            ->postJson("/api/v1/ppk/permohonan/{$permohonan->id}/approve", [
                'memo' => $memo,
                'catatan' => 'Permohonan disetujui sesuai ketersediaan MAK.',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Permohonan beserta Memo Persetujuan Surat Permohonan berhasil disetujui oleh PPK.',
            ]);

        $this->assertDatabaseHas('approval_permohonan', [
            'permohonan_id' => $permohonan->id,
            'tahap' => 'PPK',
            'keputusan' => 'disetujui',
            'actor_id' => $this->ppkUser->id,
        ]);
    }

    public function test_ppk_can_reject_permohonan_with_alasan(): void
    {
        $permohonan = Permohonan::firstOrFail();
        $mak = Mak::where('ppk_user_id', $this->ppkUser->id)->first()
            ?? Mak::create([
                'nama' => 'MAK Test PPK',
                'ppk_user_id' => $this->ppkUser->id,
            ]);

        PermohonanMak::firstOrCreate([
            'permohonan_id' => $permohonan->id,
            'mak_id' => $mak->id,
            'ditentukan_oleh' => $this->ppkUser->id,
        ]);

        $response = $this->actingAs($this->ppkUser, 'sanctum')
            ->postJson("/api/v1/ppk/permohonan/{$permohonan->id}/reject", [
                'alasan' => 'Anggaran tidak mencukupi untuk rincian kebutuhan yang diajukan.',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Permohonan telah ditolak oleh PPK beserta catatan alasan.',
            ]);

        $this->assertDatabaseHas('approval_permohonan', [
            'permohonan_id' => $permohonan->id,
            'tahap' => 'PPK',
            'keputusan' => 'ditolak',
            'actor_id' => $this->ppkUser->id,
        ]);
    }

    public function test_ppk_can_view_pengadaan_list_and_review(): void
    {
        $pengadaan = Pengadaan::firstOrFail();
        $pengadaan->update(['ppk_id' => $this->ppkUser->id]);

        $listResponse = $this->actingAs($this->ppkUser, 'sanctum')
            ->getJson('/api/v1/ppk/pengajuan');

        $listResponse->assertStatus(200)
            ->assertJsonStructure(['pengajuan', 'filters']);

        $reviewResponse = $this->actingAs($this->ppkUser, 'sanctum')
            ->getJson("/api/v1/ppk/pengajuan/{$pengadaan->id}/review");

        $reviewResponse->assertStatus(200)
            ->assertJsonStructure([
                'detail' => [
                    'pengadaan',
                    'dokumen_permohonan',
                    'dokumen_pengadaan',
                    'mak_list',
                ],
            ]);
    }

    public function test_ppk_can_approve_pengadaan(): void
    {
        $pengadaan = Pengadaan::firstOrFail();
        $pengadaan->update([
            'ppk_id' => $this->ppkUser->id,
            'status' => 'menunggu_persetujuan',
        ]);

        $response = $this->actingAs($this->ppkUser, 'sanctum')
            ->postJson("/api/v1/ppk/pengajuan/{$pengadaan->id}/approve");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Dokumen pengadaan berhasil disetujui oleh PPK dan diteruskan ke PPBJ.',
            ]);

        $pengadaan->refresh();
        $this->assertEquals('disetujui', $pengadaan->status);

        $this->assertDatabaseHas('approval_pengadaan', [
            'pengadaan_id' => $pengadaan->id,
            'tahap' => 'PPK',
            'keputusan' => 'disetujui',
            'actor_id' => $this->ppkUser->id,
        ]);
    }

    public function test_ppk_can_reject_pengadaan_without_403_or_500(): void
    {
        $pengadaan = Pengadaan::firstOrFail();
        $pengadaan->update([
            'ppk_id' => $this->ppkUser->id,
            'status' => 'menunggu_persetujuan',
        ]);

        $response = $this->actingAs($this->ppkUser, 'sanctum')
            ->postJson("/api/v1/ppk/pengajuan/{$pengadaan->id}/reject", [
                'alasan' => 'RAB pengadaan perlu disesuaikan dengan standar biaya masukan terbaru.',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Dokumen pengadaan ditolak dan dikembalikan ke PPBJ.',
            ]);

        $pengadaan->refresh();
        $this->assertEquals('ditolak', $pengadaan->status);

        $this->assertDatabaseHas('approval_pengadaan', [
            'pengadaan_id' => $pengadaan->id,
            'tahap' => 'PPK',
            'keputusan' => 'ditolak',
            'alasan' => 'RAB pengadaan perlu disesuaikan dengan standar biaya masukan terbaru.',
            'actor_id' => $this->ppkUser->id,
        ]);
    }
}
