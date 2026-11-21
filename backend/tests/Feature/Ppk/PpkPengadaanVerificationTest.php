<?php

namespace Tests\Feature\Ppk;

use App\Models\JenisPengadaan;
use App\Models\LevelPengadaan;
use App\Models\Mak;
use App\Models\MetodePengadaan;
use App\Models\Pengadaan;
use App\Models\Permohonan;
use App\Models\PermohonanMak;
use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use Database\Seeders\MasterReferenceSeeder;
use Database\Seeders\RbacSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PpkPengadaanVerificationTest extends TestCase
{
    use RefreshDatabase;

    protected User $ppkUser;

    protected User $otherPpkUser;

    protected LevelPengadaan $level50to200;

    protected LevelPengadaan $levelAbove200;

    protected Mak $mak;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([
            RoleSeeder::class,
            RbacSeeder::class,
            MasterReferenceSeeder::class,
        ]);

        $ppkRole = Role::where('nama', 'PPK')->firstOrFail();
        $unit = Unit::first() ?? Unit::create(['nama' => 'Unit Umum', 'kode' => 'UU']);

        $this->ppkUser = User::create([
            'nama' => 'PPK User 1',
            'email' => 'ppk1@test.com',
            'username' => 'ppk1',
            'password' => bcrypt('password'),
            'role_id' => $ppkRole->id,
            'unit_id' => $unit->id,
            'nip' => '198001012005011001',
            'is_active' => true,
        ]);

        $this->otherPpkUser = User::create([
            'nama' => 'PPK User 2',
            'email' => 'ppk2@test.com',
            'username' => 'ppk2',
            'password' => bcrypt('password'),
            'role_id' => $ppkRole->id,
            'unit_id' => $unit->id,
            'nip' => '198001012005011002',
            'is_active' => true,
        ]);

        $this->mak = Mak::create([
            'kode' => '521211',
            'nama' => 'Belanja Bahan PPK 1',
            'ppk_user_id' => $this->ppkUser->id,
            'tahun_anggaran' => (int) date('Y'),
        ]);

        $this->level50to200 = LevelPengadaan::where('perlu_review_pp', true)->firstOrFail();
        $this->levelAbove200 = LevelPengadaan::where('perlu_review_pp', false)->where('min_nominal', '>=', 200000000)->first()
            ?? LevelPengadaan::where('perlu_review_pp', false)->orderByDesc('id')->firstOrFail();
    }

    protected function createPengadaanForPpk(LevelPengadaan $level, string $status = 'menunggu_persetujuan'): Pengadaan
    {
        $pemohonRole = Role::where('nama', 'Pemohon')->firstOrFail();
        $creator = User::create([
            'nama' => 'Pemohon Test',
            'email' => 'pemohon'.uniqid().'@test.com',
            'username' => 'pemohon'.uniqid(),
            'password' => bcrypt('password'),
            'role_id' => $pemohonRole->id,
            'unit_id' => $this->ppkUser->unit_id,
            'is_active' => true,
        ]);

        $permohonan = Permohonan::create([
            'nomor_surat' => 'SURAT-'.uniqid(),
            'judul' => 'Pengadaan Laptop Kantor',
            'ringkasan_tujuan' => 'Pengadaan laptop operasional kantor',
            'created_by' => $creator->id,
            'user_id' => $creator->id,
            'unit_id' => $this->ppkUser->unit_id,
            'status' => 'disetujui',
            'estimasi_anggaran' => 100000000,
        ]);

        $permohonanMak = PermohonanMak::create([
            'permohonan_id' => $permohonan->id,
            'mak_id' => $this->mak->id,
            'ditentukan_oleh' => $this->ppkUser->id,
        ]);

        $jenis = JenisPengadaan::firstOrFail();
        $metode = MetodePengadaan::firstOrFail();

        return Pengadaan::create([
            'permohonan_id' => $permohonan->id,
            'permohonan_mak_id' => $permohonanMak->id,
            'ppk_id' => $this->ppkUser->id,
            'jenis_id' => $jenis->id,
            'metode_id' => $metode->id,
            'level_id' => $level->id,
            'status' => $status,
            'revisi_ke' => 0,
        ]);
    }

    public function test_ppk_can_approve_pengadaan_level_50_to_200_if_already_verified_by_pp(): void
    {
        $pengadaan = $this->createPengadaanForPpk($this->level50to200, 'diteruskan');

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

    public function test_ppk_cannot_approve_pengadaan_level_50_to_200_if_not_yet_verified_by_pp(): void
    {
        $pengadaan = $this->createPengadaanForPpk($this->level50to200, 'menunggu_persetujuan');

        $response = $this->actingAs($this->ppkUser, 'sanctum')
            ->postJson("/api/v1/ppk/pengajuan/{$pengadaan->id}/approve");

        $response->assertStatus(422);

        $pengadaan->refresh();
        $this->assertEquals('menunggu_persetujuan', $pengadaan->status);
    }

    public function test_ppk_can_approve_pengadaan_above_200_directly(): void
    {
        $pengadaan = $this->createPengadaanForPpk($this->levelAbove200, 'menunggu_persetujuan');

        $response = $this->actingAs($this->ppkUser, 'sanctum')
            ->postJson("/api/v1/ppk/pengajuan/{$pengadaan->id}/approve");

        $response->assertStatus(200);

        $pengadaan->refresh();
        $this->assertEquals('disetujui', $pengadaan->status);
    }

    public function test_ppk_can_reject_pengadaan_with_mandatory_reason(): void
    {
        $pengadaan = $this->createPengadaanForPpk($this->levelAbove200, 'menunggu_persetujuan');

        $response = $this->actingAs($this->ppkUser, 'sanctum')
            ->postJson("/api/v1/ppk/pengajuan/{$pengadaan->id}/reject", [
                'alasan' => 'Rincian anggaran biaya perlu diperjelas detailnya.',
            ]);

        $response->assertStatus(200);

        $pengadaan->refresh();
        $this->assertEquals('ditolak', $pengadaan->status);
        $this->assertEquals(1, $pengadaan->revisi_ke);

        $this->assertDatabaseHas('approval_pengadaan', [
            'pengadaan_id' => $pengadaan->id,
            'tahap' => 'PPK',
            'keputusan' => 'ditolak',
            'alasan' => 'Rincian anggaran biaya perlu diperjelas detailnya.',
        ]);
    }

    public function test_ppk_cannot_reject_pengadaan_without_reason(): void
    {
        $pengadaan = $this->createPengadaanForPpk($this->levelAbove200, 'menunggu_persetujuan');

        $response = $this->actingAs($this->ppkUser, 'sanctum')
            ->postJson("/api/v1/ppk/pengajuan/{$pengadaan->id}/reject", [
                'alasan' => 'abc',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['alasan']);
    }

    public function test_ppk_cannot_access_other_ppk_pengadaan(): void
    {
        $pengadaan = $this->createPengadaanForPpk($this->levelAbove200, 'menunggu_persetujuan');

        $response = $this->actingAs($this->otherPpkUser, 'sanctum')
            ->postJson("/api/v1/ppk/pengajuan/{$pengadaan->id}/approve");

        $response->assertStatus(403);
    }
}
