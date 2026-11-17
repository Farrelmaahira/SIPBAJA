<?php

namespace Tests\Feature\Perencanaan;

use App\Models\ApprovalPermohonan;
use App\Models\Mak;
use App\Models\Permohonan;
use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PengajuanApproveCatatanTest extends TestCase
{
    use RefreshDatabase;

    public function test_perencanaan_can_approve_permohonan_with_notes(): void
    {
        $role = Role::create(['nama' => 'Perencanaan']);
        $user = User::factory()->create(['role_id' => $role->id]);
        $unit = Unit::create(['nama' => 'Teknik Informatika']);
        $mak = Mak::create(['nama' => 'MAK 01', 'ppk_user_id' => $user->id]);

        $permohonan = Permohonan::create([
            'unit_id' => $unit->id,
            'created_by' => $user->id,
            'nomor_surat' => '001/TI/2026',
            'judul' => 'Pengadaan Komputer',
            'ringkasan_tujuan' => 'Lab Komputer',
            'estimasi_anggaran' => 50000000,
            'status' => 'diajukan',
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson("/api/v1/perencanaan/pengajuan/{$permohonan->id}/approve", [
            'mak_ids' => [$mak->id],
            'catatan' => 'Gunakan MAK 01 untuk belanja modal komputer lab.',
        ]);

        $response->assertStatus(200);

        $approval = ApprovalPermohonan::where('permohonan_id', $permohonan->id)
            ->where('tahap', 'PERENCANAAN')
            ->first();

        $this->assertNotNull($approval);
        $this->assertEquals('disetujui', $approval->keputusan);
        $this->assertEquals('Gunakan MAK 01 untuk belanja modal komputer lab.', $approval->alasan);
    }

    public function test_perencanaan_can_approve_permohonan_without_notes(): void
    {
        $role = Role::create(['nama' => 'Perencanaan']);
        $user = User::factory()->create(['role_id' => $role->id]);
        $unit = Unit::create(['nama' => 'Teknik Informatika']);
        $mak = Mak::create(['nama' => 'MAK 01', 'ppk_user_id' => $user->id]);

        $permohonan = Permohonan::create([
            'unit_id' => $unit->id,
            'created_by' => $user->id,
            'nomor_surat' => '002/TI/2026',
            'judul' => 'Pengadaan Meja',
            'ringkasan_tujuan' => 'Meja Lab',
            'estimasi_anggaran' => 20000000,
            'status' => 'diajukan',
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson("/api/v1/perencanaan/pengajuan/{$permohonan->id}/approve", [
            'mak_ids' => [$mak->id],
        ]);

        $response->assertStatus(200);

        $approval = ApprovalPermohonan::where('permohonan_id', $permohonan->id)
            ->where('tahap', 'PERENCANAAN')
            ->first();

        $this->assertNotNull($approval);
        $this->assertNull($approval->alasan);
    }
}
