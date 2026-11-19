<?php

namespace Tests\Feature\Ppk;

use App\Models\Dokumen;
use App\Models\Mak;
use App\Models\Pengadaan;
use App\Models\Permohonan;
use App\Models\PermohonanMak;
use App\Models\Unit;
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
                'kode' => 'MAK-TEST-'.uniqid(),
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
            ->assertJsonStructure(['data', 'meta']);

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

    public function test_ppk_can_preview_permohonan_dokumen_inline(): void
    {
        $permohonan = Permohonan::firstOrFail();
        $this->attachMakToPermohonan($permohonan, $this->ppkUser);

        $dokumen = Dokumen::where('ref_type', 'permohonan')
            ->where('ref_id', $permohonan->id)
            ->where('tipe_dokumen', 'surat_permohonan')
            ->firstOrFail();

        Storage::disk('local')->put('dokumen/permohonan/'.$dokumen->nama_hash, '%PDF-1.4 dummy');

        $detail = $this->actingAs($this->ppkUser, 'sanctum')
            ->getJson("/api/v1/ppk/permohonan/{$permohonan->id}");

        $detail->assertStatus(200);

        $dokumenPayload = collect($detail->json('data.dokumen_permohonan'))->firstWhere('id', $dokumen->id);
        $this->assertSame(
            "/api/v1/ppk/permohonan/{$permohonan->id}/dokumen?dokumen_id={$dokumen->id}",
            $dokumenPayload['download_url'] ?? null
        );

        $this->actingAs($this->ppkUser, 'sanctum')
            ->get("/api/v1/ppk/permohonan/{$permohonan->id}/dokumen?dokumen_id={$dokumen->id}&disposition=inline")
            ->assertStatus(200)
            ->assertHeader('content-type', 'application/pdf');
    }

    public function test_ppk_can_approve_permohonan_with_memo(): void
    {
        $permohonan = Permohonan::firstOrFail();
        $mak = Mak::where('ppk_user_id', $this->ppkUser->id)->first()
            ?? Mak::create([
                'nama' => 'MAK Test PPK',
                'kode' => 'MAK-TEST-'.uniqid(),
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
                'kode' => 'MAK-TEST-'.uniqid(),
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

    public function test_ppk_only_sees_permohonan_linked_to_own_mak(): void
    {
        $ownPermohonan = $this->createPermohonan('PPK-OWN-'.uniqid());
        $this->attachMakToPermohonan($ownPermohonan, $this->ppkUser);

        $otherPpk = $this->createPpkUser('PPK Lain');
        $otherPermohonan = $this->createPermohonan('PPK-OTHER-'.uniqid());
        $this->attachMakToPermohonan($otherPermohonan, $otherPpk);

        $response = $this->actingAs($this->ppkUser, 'sanctum')
            ->getJson('/api/v1/ppk/permohonan');

        $response->assertOk();
        $ids = collect($response->json('data'))->pluck('id');

        $this->assertTrue($ids->contains($ownPermohonan->id));
        $this->assertFalse($ids->contains($otherPermohonan->id));
    }

    public function test_ppk_cannot_view_or_decide_permohonan_of_other_ppk(): void
    {
        $otherPpk = $this->createPpkUser('PPK Lain');
        $otherPermohonan = $this->createPermohonan('PPK-FORBIDDEN-'.uniqid());
        $this->attachMakToPermohonan($otherPermohonan, $otherPpk);

        $this->actingAs($this->ppkUser, 'sanctum')
            ->getJson("/api/v1/ppk/permohonan/{$otherPermohonan->id}")
            ->assertStatus(403);

        $this->actingAs($this->ppkUser, 'sanctum')
            ->postJson("/api/v1/ppk/permohonan/{$otherPermohonan->id}/approve", [
                'memo' => UploadedFile::fake()->create('memo.pdf', 100, 'application/pdf'),
            ])
            ->assertStatus(403);

        $this->actingAs($this->ppkUser, 'sanctum')
            ->postJson("/api/v1/ppk/permohonan/{$otherPermohonan->id}/reject", [
                'alasan' => 'Permohonan bukan kewenangan PPK ini.',
            ])
            ->assertStatus(403);

        $this->actingAs($this->ppkUser, 'sanctum')
            ->get("/api/v1/ppk/permohonan/{$otherPermohonan->id}/dokumen?disposition=inline")
            ->assertStatus(403);
    }

    public function test_ppk_permohonan_detail_excludes_pengadaan_and_rkakl(): void
    {
        $permohonan = Permohonan::firstOrFail();
        $this->attachMakToPermohonan($permohonan, $this->ppkUser);

        $response = $this->actingAs($this->ppkUser, 'sanctum')
            ->getJson("/api/v1/ppk/permohonan/{$permohonan->id}");

        $response->assertOk();
        $data = $response->json('data');

        $this->assertArrayNotHasKey('rkakl_active', $data);
        $this->assertArrayNotHasKey('pengadaan', $data['permohonan']);
    }

    public function test_ppk_permohonan_list_supports_statuses_filter(): void
    {
        $permohonan = $this->createPermohonan('PPK-STATUS-'.uniqid(), 'diteruskan');
        $this->attachMakToPermohonan($permohonan, $this->ppkUser);

        $matching = $this->actingAs($this->ppkUser, 'sanctum')
            ->getJson('/api/v1/ppk/permohonan?statuses[]=diteruskan');
        $matching->assertOk();
        $this->assertTrue(collect($matching->json('data'))->pluck('id')->contains($permohonan->id));

        $nonMatching = $this->actingAs($this->ppkUser, 'sanctum')
            ->getJson('/api/v1/ppk/permohonan?statuses[]=ditolak');
        $nonMatching->assertOk();
        $this->assertFalse(collect($nonMatching->json('data'))->pluck('id')->contains($permohonan->id));
    }

    public function test_ppk_can_view_pengadaan_list_and_review(): void
    {
        $pengadaan = Pengadaan::firstOrFail();
        $pengadaan->update([
            'ppk_id' => $this->ppkUser->id,
            'status' => 'diteruskan',
        ]);

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

    private function createPpkUser(string $nama): User
    {
        return User::factory()->create([
            'role_id' => $this->ppkUser->role_id,
            'nama' => $nama,
        ]);
    }

    private function createPermohonan(string $nomorSurat, string $status = 'diteruskan'): Permohonan
    {
        return Permohonan::create([
            'unit_id' => Unit::firstOrFail()->id,
            'created_by' => $this->ppkUser->id,
            'nomor_surat' => $nomorSurat,
            'judul' => 'Permohonan '.$nomorSurat,
            'ringkasan_tujuan' => 'Pengujian filter permohonan PPK.',
            'estimasi_anggaran' => 1000000,
            'revisi_ke' => 0,
            'status' => $status,
            'created_at' => now(),
        ]);
    }

    private function attachMakToPermohonan(Permohonan $permohonan, User $ppk): Mak
    {
        $mak = Mak::create([
            'kode' => 'MAK-'.uniqid(),
            'nama' => 'MAK '.$ppk->nama,
            'ppk_user_id' => $ppk->id,
        ]);

        PermohonanMak::firstOrCreate([
            'permohonan_id' => $permohonan->id,
            'mak_id' => $mak->id,
            'ditentukan_oleh' => $ppk->id,
        ]);

        return $mak;
    }
}
