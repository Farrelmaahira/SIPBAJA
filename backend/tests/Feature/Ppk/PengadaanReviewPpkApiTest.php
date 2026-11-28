<?php

namespace Tests\Feature\Ppk;

use App\Models\Dokumen;
use App\Models\JenisPengadaan;
use App\Models\LevelPengadaan;
use App\Models\Mak;
use App\Models\MetodePengadaan;
use App\Models\Pengadaan;
use App\Models\Permohonan;
use App\Models\PermohonanMak;
use App\Models\User;
use Database\Seeders\MasterDataSeeder;
use Database\Seeders\PermohonanPengadaanSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PengadaanReviewPpkApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $ppkUser;

    protected User $otherPpkUser;

    protected User $ppbjUser;

    protected LevelPengadaan $level50to200;

    protected LevelPengadaan $levelAbove200;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');

        $this->seed([
            MasterDataSeeder::class,
            PermohonanPengadaanSeeder::class,
        ]);

        $ppkRoleUsers = User::whereHas('role', fn ($q) => $q->where('nama', 'PPK'))->get();
        $this->ppkUser = $ppkRoleUsers->first();
        $this->otherPpkUser = $ppkRoleUsers->count() > 1
            ? $ppkRoleUsers->get(1)
            : User::factory()->create(['role_id' => $this->ppkUser->role_id]);

        $this->ppbjUser = User::whereHas('role', fn ($q) => $q->where('nama', 'PPBJ'))->firstOrFail();

        // Level 50-200 Juta (perlu_review_pp = true)
        $this->level50to200 = LevelPengadaan::firstOrCreate(
            ['nama' => '50 - 200 Juta'],
            ['min_nominal' => 50000000, 'max_nominal' => 200000000, 'perlu_review_pp' => true]
        );
        $this->level50to200->update(['perlu_review_pp' => true]);

        // Level > 200 Juta (perlu_review_pp = false)
        $this->levelAbove200 = LevelPengadaan::firstOrCreate(
            ['nama' => '> 200 Juta'],
            ['min_nominal' => 200000001, 'max_nominal' => 9999999999, 'perlu_review_pp' => false]
        );
        $this->levelAbove200->update(['perlu_review_pp' => false]);
    }

    private function createPengadaanForPpk(
        User $ppk,
        LevelPengadaan $level,
        float $nominal,
        string $status = 'diteruskan'
    ): Pengadaan {
        $permohonan = Permohonan::first() ?? Permohonan::factory()->create();

        $mak = Mak::create([
            'nama' => 'MAK Khusus PPK '.$ppk->id,
            'kode' => 'MAK-'.uniqid(),
            'ppk_user_id' => $ppk->id,
        ]);

        $pm = PermohonanMak::create([
            'permohonan_id' => $permohonan->id,
            'mak_id' => $mak->id,
            'ditentukan_oleh' => $ppk->id,
        ]);

        $jenis = JenisPengadaan::first() ?? JenisPengadaan::create(['nama' => 'Barang']);
        $metode = MetodePengadaan::first() ?? MetodePengadaan::create(['nama' => 'Pengadaan Langsung']);

        $pengadaan = Pengadaan::create([
            'permohonan_id' => $permohonan->id,
            'permohonan_mak_id' => $pm->id,
            'level_id' => $level->id,
            'jenis_id' => $jenis->id,
            'metode_id' => $metode->id,
            'ppk_id' => $ppk->id,
            'nominal' => $nominal,
            'status' => $status,
        ]);

        Dokumen::create([
            'ref_type' => 'pengadaan',
            'ref_id' => $pengadaan->id,
            'nama_asli' => 'spk_sample.pdf',
            'nama_hash' => 'hash_spk_sample.pdf',
            'mime_type' => 'application/pdf',
            'ukuran_bytes' => 1024,
            'tipe_dokumen' => 'surat_spk',
            'versi' => 1,
            'uploaded_by' => $this->ppbjUser->id,
        ]);

        return $pengadaan;
    }

    public function test_fr49_ppk_cannot_review_pengadaan_assigned_to_other_ppk(): void
    {
        $pengadaan = $this->createPengadaanForPpk($this->otherPpkUser, $this->level50to200, 75000000, 'diteruskan');

        $response = $this->actingAs($this->ppkUser, 'sanctum')
            ->getJson("/api/v1/ppk/pengajuan/{$pengadaan->id}/review");

        $response->assertStatus(403);
    }

    public function test_fr49_ppk_cannot_review_50_to_200_jt_if_not_yet_verified_by_pp(): void
    {
        // Status masih menunggu_review / menunggu_persetujuan oleh PP, belum 'diteruskan'
        $pengadaan = $this->createPengadaanForPpk($this->ppkUser, $this->level50to200, 100000000, 'menunggu_persetujuan');

        $response = $this->actingAs($this->ppkUser, 'sanctum')
            ->getJson("/api/v1/ppk/pengajuan/{$pengadaan->id}/review");

        $response->assertStatus(403)
            ->assertJsonPath('message', 'Dokumen pengadaan ini belum diverifikasi oleh Pejabat Pengadaan (PP).');
    }

    public function test_fr49_ppk_can_review_50_to_200_jt_when_status_is_diteruskan(): void
    {
        $pengadaan = $this->createPengadaanForPpk($this->ppkUser, $this->level50to200, 100000000, 'diteruskan');

        $response = $this->actingAs($this->ppkUser, 'sanctum')
            ->getJson("/api/v1/ppk/pengajuan/{$pengadaan->id}/review");

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

    public function test_fr49_ppk_can_review_above_200_jt_directly_from_ppbj(): void
    {
        // Paket > 200 juta langsung dari PPBJ berstatus menunggu_persetujuan / menunggu_review
        $pengadaan = $this->createPengadaanForPpk($this->ppkUser, $this->levelAbove200, 350000000, 'menunggu_persetujuan');

        $response = $this->actingAs($this->ppkUser, 'sanctum')
            ->getJson("/api/v1/ppk/pengajuan/{$pengadaan->id}/review");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'detail' => [
                    'pengadaan',
                    'dokumen_permohonan',
                    'dokumen_pengadaan',
                ],
            ]);
    }

    public function test_fr50_ppk_can_approve_document_and_notify_ppbj(): void
    {
        $pengadaan = $this->createPengadaanForPpk($this->ppkUser, $this->level50to200, 120000000, 'diteruskan');

        $response = $this->actingAs($this->ppkUser, 'sanctum')
            ->postJson("/api/v1/ppk/pengajuan/{$pengadaan->id}/approve");

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'disetujui');

        $this->assertDatabaseHas('pengadaan', [
            'id' => $pengadaan->id,
            'status' => 'disetujui',
        ]);

        $this->assertDatabaseHas('approval_pengadaan', [
            'pengadaan_id' => $pengadaan->id,
            'tahap' => 'PPK',
            'keputusan' => 'disetujui',
            'actor_id' => $this->ppkUser->id,
        ]);
    }

    public function test_fr51_ppk_reject_requires_reason(): void
    {
        $pengadaan = $this->createPengadaanForPpk($this->ppkUser, $this->level50to200, 120000000, 'diteruskan');

        $response = $this->actingAs($this->ppkUser, 'sanctum')
            ->postJson("/api/v1/ppk/pengajuan/{$pengadaan->id}/reject", [
                'alasan' => '',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['alasan']);
    }

    public function test_fr51_ppk_can_reject_document_with_specific_reason(): void
    {
        $pengadaan = $this->createPengadaanForPpk($this->ppkUser, $this->level50to200, 120000000, 'diteruskan');

        $alasan = 'Spesifikasi teknis pada draft kontrak belum sesuai standar K3.';
        $response = $this->actingAs($this->ppkUser, 'sanctum')
            ->postJson("/api/v1/ppk/pengajuan/{$pengadaan->id}/reject", [
                'alasan' => $alasan,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'ditolak');

        $this->assertDatabaseHas('pengadaan', [
            'id' => $pengadaan->id,
            'status' => 'ditolak',
        ]);

        $this->assertDatabaseHas('approval_pengadaan', [
            'pengadaan_id' => $pengadaan->id,
            'tahap' => 'PPK',
            'keputusan' => 'ditolak',
            'alasan' => $alasan,
            'actor_id' => $this->ppkUser->id,
        ]);
    }
}
