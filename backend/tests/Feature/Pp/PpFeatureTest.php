<?php

namespace Tests\Feature\Pp;

use App\Models\ApprovalPermohonan;
use App\Models\Dokumen;
use App\Models\LevelPengadaan;
use App\Models\Pengadaan;
use App\Models\User;
use Database\Seeders\MasterReferenceSeeder;
use Database\Seeders\PengadaanPpSeeder;
use Database\Seeders\RbacSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PpFeatureTest extends TestCase
{
    use RefreshDatabase;

    protected User $ppUser;

    protected User $nonPpUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([
            RoleSeeder::class,
            RbacSeeder::class,
            UserSeeder::class,
            MasterReferenceSeeder::class,
            PengadaanPpSeeder::class,
        ]);

        $this->ppUser = User::whereHas('role', fn ($q) => $q->where('nama', 'PP'))->firstOrFail();
        $this->nonPpUser = User::whereHas('role', fn ($q) => $q->where('nama', 'Pemohon'))->firstOrFail();
    }

    public function test_guest_cannot_access_pp_routes(): void
    {
        $this->getJson('/api/v1/pp/dashboard')->assertStatus(401);
        $this->getJson('/api/v1/pp/pengajuan')->assertStatus(401);
    }

    public function test_non_pp_user_is_forbidden(): void
    {
        $this->actingAs($this->nonPpUser, 'sanctum')
            ->getJson('/api/v1/pp/dashboard')
            ->assertStatus(403);
    }

    public function test_pp_can_access_dashboard_with_invokable_controller(): void
    {
        $response = $this->actingAs($this->ppUser, 'sanctum')
            ->getJson('/api/v1/pp/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'stats' => ['total', 'menunggu', 'disetujui', 'ditolak'],
                'chart' => ['tahun', 'data'],
                'pengadaanPerluReview',
                'recentNotifications',
                'unreadNotificationsCount',
            ]);
    }

    public function test_pp_can_view_pengadaan_list(): void
    {
        $response = $this->actingAs($this->ppUser, 'sanctum')
            ->getJson('/api/v1/pp/pengajuan');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'pengajuan' => [
                    'data',
                    'current_page',
                    'total',
                ],
                'filters',
            ]);
    }

    public function test_pp_can_view_pengadaan_review_detail(): void
    {
        $pengadaan = Pengadaan::whereHas('Level', fn ($q) => $q->where('perlu_review_pp', true))->firstOrFail();

        $response = $this->actingAs($this->ppUser, 'sanctum')
            ->getJson("/api/v1/pp/pengajuan/{$pengadaan->id}/review");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'detail' => [
                    'pengadaan',
                    'dokumen_permohonan',
                    'dokumen_pengadaan',
                    'mak_list',
                ],
            ]);
    }

    public function test_pp_can_approve_pengadaan(): void
    {
        $pengadaan = Pengadaan::whereHas('Level', fn ($q) => $q->where('perlu_review_pp', true))->firstOrFail();
        $pengadaan->update(['status' => 'menunggu_persetujuan']);

        $response = $this->actingAs($this->ppUser, 'sanctum')
            ->postJson("/api/v1/pp/pengajuan/{$pengadaan->id}/approve");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Dokumen pengadaan berhasil diverifikasi dan diteruskan ke PPK.',
            ]);

        $pengadaan->refresh();
        $this->assertEquals('diteruskan', $pengadaan->status);

        $this->assertDatabaseHas('approval_pengadaan', [
            'pengadaan_id' => $pengadaan->id,
            'tahap' => 'PP',
            'keputusan' => 'disetujui',
            'actor_id' => $this->ppUser->id,
        ]);
    }

    public function test_pp_can_reject_pengadaan_with_alasan(): void
    {
        $pengadaan = Pengadaan::whereHas('Level', fn ($q) => $q->where('perlu_review_pp', true))->firstOrFail();
        $pengadaan->update(['status' => 'menunggu_persetujuan']);
        $revisiAwal = (int) $pengadaan->revisi_ke;

        $response = $this->actingAs($this->ppUser, 'sanctum')
            ->postJson("/api/v1/pp/pengajuan/{$pengadaan->id}/reject", [
                'alasan' => 'Spesifikasi teknis barang kurang lengkap dan jelas.',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Dokumen pengadaan berhasil ditolak dan dikembalikan ke PPBJ untuk direvisi.',
            ]);

        $pengadaan->refresh();
        $this->assertEquals('ditolak', $pengadaan->status);
        $this->assertEquals($revisiAwal + 1, $pengadaan->revisi_ke);

        $this->assertDatabaseHas('approval_pengadaan', [
            'pengadaan_id' => $pengadaan->id,
            'tahap' => 'PP',
            'keputusan' => 'ditolak',
            'alasan' => 'Spesifikasi teknis barang kurang lengkap dan jelas.',
            'actor_id' => $this->ppUser->id,
        ]);
    }

    public function test_pp_reject_requires_alasan_min_5_chars(): void
    {
        $pengadaan = Pengadaan::whereHas('Level', fn ($q) => $q->where('perlu_review_pp', true))->firstOrFail();

        $response = $this->actingAs($this->ppUser, 'sanctum')
            ->postJson("/api/v1/pp/pengajuan/{$pengadaan->id}/reject", [
                'alasan' => 'abc',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['alasan']);
    }

    public function test_pp_review_detail_includes_permohonan_approval_memos(): void
    {
        $pengadaan = Pengadaan::whereHas('Level', fn ($q) => $q->where('perlu_review_pp', true))->firstOrFail();
        $permohonan = $pengadaan->Permohonan;

        $bidang2Memo = $this->createMemoDokumen($permohonan->id, 'Memo_Bidang2.pdf', 'memo-bidang2.pdf');
        $ppkMemo = $this->createMemoDokumen($permohonan->id, 'Memo_PPK.pdf', 'memo-ppk.pdf');

        $this->createApprovalPermohonan($permohonan->id, 'BIDANG2', $bidang2Memo->id);
        $this->createApprovalPermohonan($permohonan->id, 'PPK', $ppkMemo->id);

        $response = $this->actingAs($this->ppUser, 'sanctum')
            ->getJson("/api/v1/pp/pengajuan/{$pengadaan->id}/review");

        $response->assertStatus(200);

        $memos = collect($response->json('detail.memo_permohonan'));

        $this->assertCount(2, $memos);
        $this->assertSame('BIDANG2', $memos->firstWhere('id', $bidang2Memo->id)['tahap']);
        $this->assertSame('memo_persetujuan_bidang2', $memos->firstWhere('id', $bidang2Memo->id)['tipe_dokumen']);
        $this->assertSame('PPK', $memos->firstWhere('id', $ppkMemo->id)['tahap']);
        $this->assertSame('memo_persetujuan_ppk', $memos->firstWhere('id', $ppkMemo->id)['tipe_dokumen']);
        $this->assertStringContainsString(
            "/api/v1/pp/pengajuan/{$pengadaan->id}/dokumen/{$bidang2Memo->id}",
            $memos->firstWhere('id', $bidang2Memo->id)['download_url']
        );
    }

    public function test_pp_can_preview_permohonan_approval_memo(): void
    {
        $pengadaan = Pengadaan::whereHas('Level', fn ($q) => $q->where('perlu_review_pp', true))->firstOrFail();
        $permohonan = $pengadaan->Permohonan;

        $bidang2Memo = $this->createMemoDokumen($permohonan->id, 'Memo_Bidang2.pdf', 'memo-bidang2.pdf');
        $ppkMemo = $this->createMemoDokumen($permohonan->id, 'Memo_PPK.pdf', 'memo-ppk.pdf');

        $this->createApprovalPermohonan($permohonan->id, 'BIDANG2', $bidang2Memo->id);
        $this->createApprovalPermohonan($permohonan->id, 'PPK', $ppkMemo->id);

        Storage::disk('local')->put('dokumen/memo/memo-bidang2.pdf', '%PDF-1.4 dummy');
        Storage::disk('local')->put('dokumen/permohonan/memo/memo-ppk.pdf', '%PDF-1.4 dummy');

        $this->actingAs($this->ppUser, 'sanctum')
            ->get("/api/v1/pp/pengajuan/{$pengadaan->id}/dokumen/{$bidang2Memo->id}?disposition=inline")
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');

        $this->actingAs($this->ppUser, 'sanctum')
            ->get("/api/v1/pp/pengajuan/{$pengadaan->id}/dokumen/{$ppkMemo->id}?disposition=inline")
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');
    }

    public function test_pp_can_preview_pengadaan_document_stored_on_public_disk(): void
    {
        $pengadaan = Pengadaan::whereHas('Level', fn ($q) => $q->where('perlu_review_pp', true))->firstOrFail();
        $dokumen = Dokumen::create([
            'ref_type' => 'pengadaan',
            'ref_id' => $pengadaan->id,
            'tipe_dokumen' => 'dokumen_pengadaan',
            'versi' => 1,
            'nama_asli' => 'Dokumen_Pengadaan.pdf',
            'nama_hash' => 'dokumen-pengadaan-public.pdf',
            'mime_type' => 'application/pdf',
            'ukuran_bytes' => 1024,
            'uploaded_by' => $this->ppUser->id,
        ]);

        Storage::disk('public')->put('dokumen_pengadaan/dokumen-pengadaan-public.pdf', '%PDF-1.4 dummy');

        $this->actingAs($this->ppUser, 'sanctum')
            ->get("/api/v1/pp/pengajuan/{$pengadaan->id}/dokumen/{$dokumen->id}?disposition=inline")
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');
    }

    private function createMemoDokumen(int $permohonanId, string $namaAsli, string $namaHash): Dokumen
    {
        return Dokumen::create([
            'ref_type' => 'approval_permohonan',
            'ref_id' => $permohonanId,
            'tipe_dokumen' => 'memo_persetujuan',
            'versi' => 1,
            'nama_asli' => $namaAsli,
            'nama_hash' => $namaHash,
            'mime_type' => 'application/pdf',
            'ukuran_bytes' => 1024,
            'uploaded_by' => $this->ppUser->id,
        ]);
    }

    private function createApprovalPermohonan(int $permohonanId, string $tahap, int $memoDokumenId): void
    {
        ApprovalPermohonan::create([
            'permohonan_id' => $permohonanId,
            'tahap' => $tahap,
            'revisi_ke' => 0,
            'keputusan' => 'disetujui',
            'memo_dokumen_id' => $memoDokumenId,
            'actor_id' => $this->ppUser->id,
        ]);
    }

    public function test_pp_cannot_review_pengadaan_outside_their_level(): void
    {
        $levelNonPp = LevelPengadaan::firstOrCreate([
            'nama' => 'dibawah-50jt',
            'min_nominal' => 0,
            'max_nominal' => 49999999,
            'perlu_review_pp' => false,
        ]);

        $pengadaan = Pengadaan::firstOrFail();
        $pengadaan->update(['level_id' => $levelNonPp->id]);

        $this->actingAs($this->ppUser, 'sanctum')
            ->getJson("/api/v1/pp/pengajuan/{$pengadaan->id}/review")
            ->assertStatus(403);
    }
}
