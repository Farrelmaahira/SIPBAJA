<?php

namespace Tests\Feature\Bidang2;

use App\Models\Permohonan;
use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardBidang2Test extends TestCase
{
    use RefreshDatabase;

    public function test_bidang2_can_fetch_genuine_dashboard_statistics(): void
    {
        $role = Role::create(['nama' => 'Bidang 2']);
        $user = User::factory()->create(['role_id' => $role->id]);
        $unit = Unit::create(['nama' => 'Teknik Mesin']);

        Permohonan::create([
            'unit_id' => $unit->id,
            'created_by' => $user->id,
            'nomor_surat' => '001/TM/2026',
            'judul' => 'Pengadaan CNC Mesin',
            'ringkasan_tujuan' => 'Peralatan Bengkel',
            'estimasi_anggaran' => 150000000,
            'status' => 'disetujui',
        ]);

        Permohonan::create([
            'unit_id' => $unit->id,
            'created_by' => $user->id,
            'nomor_surat' => '002/TM/2026',
            'judul' => 'Pengadaan Las Listrik',
            'ringkasan_tujuan' => 'Peralatan Bengkel',
            'estimasi_anggaran' => 25000000,
            'status' => 'menunggu_bidang2',
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/bidang-2/dashboard');

        $response->assertStatus(200);
        $response->assertJson([
            'ringkasan' => [
                'total' => 2,
                'menunggu_verifikasi' => 1,
                'disetujui' => 1,
                'ditolak' => 0,
            ],
            'totalDisetujui' => 1,
            'totalDitolak' => 0,
        ]);
        $response->assertJsonStructure([
            'ringkasan',
            'riwayatTerbaru',
            'riwayatPengadaanTerbaru',
            'statistikBulanan',
            'totalDisetujui',
            'totalDitolak',
            'tahunAktif',
        ]);
    }

    public function test_bidang2_dashboard_returns_zeros_when_database_is_empty(): void
    {
        $role = Role::create(['nama' => 'Bidang 2']);
        $user = User::factory()->create(['role_id' => $role->id]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/bidang-2/dashboard');

        $response->assertStatus(200);
        $response->assertJson([
            'ringkasan' => [
                'total' => 0,
                'menunggu_verifikasi' => 0,
                'disetujui' => 0,
                'ditolak' => 0,
            ],
            'totalDisetujui' => 0,
            'totalDitolak' => 0,
            'riwayatTerbaru' => [],
            'riwayatPengadaanTerbaru' => [],
        ]);
    }
}
