<?php

namespace Tests\Feature\PPBJ;

use App\Models\ApprovalPermohonan;
use App\Models\Permohonan;
use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PermohonanCatatanPpbjTest extends TestCase
{
    use RefreshDatabase;

    public function test_ppbj_detail_shows_perencanaan_notes(): void
    {
        $rolePpbj = Role::create(['nama' => 'PPBJ']);
        $userPpbj = User::factory()->create(['role_id' => $rolePpbj->id]);
        $rolePerencanaan = Role::create(['nama' => 'Perencanaan']);
        $userPerencanaan = User::factory()->create(['role_id' => $rolePerencanaan->id]);
        $unit = Unit::create(['nama' => 'Teknik Elektro']);

        $permohonan = Permohonan::create([
            'unit_id' => $unit->id,
            'created_by' => $userPpbj->id,
            'nomor_surat' => '003/TE/2026',
            'judul' => 'Pengadaan Alat Praktikum',
            'ringkasan_tujuan' => 'Praktikum Elektro',
            'estimasi_anggaran' => 30000000,
            'status' => 'diteruskan',
            'revisi_ke' => 0,
        ]);

        ApprovalPermohonan::create([
            'permohonan_id' => $permohonan->id,
            'tahap' => 'PERENCANAAN',
            'revisi_ke' => 0,
            'keputusan' => 'disetujui',
            'alasan' => 'Gunakan MAK Elektro untuk alat ukur osiloskop.',
            'actor_id' => $userPerencanaan->id,
        ]);

        $response = $this->actingAs($userPpbj, 'sanctum')->getJson("/api/v1/ppbj/permohonan/{$permohonan->id}");

        $response->assertStatus(200);
        $response->assertJsonPath('permohonan.catatanPerencanaan', 'Gunakan MAK Elektro untuk alat ukur osiloskop.');
    }

    public function test_ppbj_detail_shows_fallback_when_perencanaan_notes_is_null(): void
    {
        $rolePpbj = Role::create(['nama' => 'PPBJ']);
        $userPpbj = User::factory()->create(['role_id' => $rolePpbj->id]);
        $unit = Unit::create(['nama' => 'Teknik Elektro']);

        $permohonan = Permohonan::create([
            'unit_id' => $unit->id,
            'created_by' => $userPpbj->id,
            'nomor_surat' => '004/TE/2026',
            'judul' => 'Pengadaan Kabel Jaringan',
            'ringkasan_tujuan' => 'Kabel Lab',
            'estimasi_anggaran' => 5000000,
            'status' => 'diteruskan',
            'revisi_ke' => 0,
        ]);

        $response = $this->actingAs($userPpbj, 'sanctum')->getJson("/api/v1/ppbj/permohonan/{$permohonan->id}");

        $response->assertStatus(200);
        $response->assertJsonPath('permohonan.catatanPerencanaan', 'Tidak ada catatan dari pihak perencanaan');
    }
}
