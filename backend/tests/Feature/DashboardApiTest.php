<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([RoleSeeder::class, UserSeeder::class]);
    }

    public function test_unauthenticated_user_cannot_access_dashboard_endpoints(): void
    {
        $endpoints = [
            '/api/v1/admin/dashboard',
            '/api/v1/pemohon/dashboard',
            '/api/v1/bidang-2/dashboard',
            '/api/v1/ppbj/dashboard',
            '/api/v1/perencanaan/dashboard',
            '/api/v1/pp/dashboard',
            '/api/v1/ppk/dashboard',
            '/api/v1/keuangan/dashboard',
            '/api/v1/perlengkapan/dashboard',
        ];

        foreach ($endpoints as $endpoint) {
            $response = $this->getJson($endpoint);
            $response->assertStatus(401);
        }
    }

    public function test_admin_can_access_admin_dashboard(): void
    {
        $admin = User::where('email', 'admin@pnj.ac.id')->firstOrFail();

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/v1/admin/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'stats',
                'recentUsers',
            ]);
    }

    public function test_pemohon_can_access_pemohon_dashboard(): void
    {
        $pemohon = User::where('email', 'jurusan@pnj.ac.id')->firstOrFail();

        $response = $this->actingAs($pemohon, 'sanctum')->getJson('/api/v1/pemohon/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'ringkasan',
                'permohonanAktif',
                'statistikBulanan',
                'tahunAktif',
            ]);
    }

    public function test_bidang_2_can_access_bidang_2_dashboard(): void
    {
        $bidang2 = User::where('email', 'bidang2@pnj.ac.id')->firstOrFail();

        $response = $this->actingAs($bidang2, 'sanctum')->getJson('/api/v1/bidang-2/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'ringkasan',
                'riwayatTerbaru',
                'statistikBulanan',
                'totalDisetujui',
                'totalDitolak',
                'tahunAktif',
            ]);
    }

    public function test_ppbj_can_access_ppbj_dashboard(): void
    {
        $ppbj = User::where('email', 'ppbj@pnj.ac.id')->firstOrFail();

        $response = $this->actingAs($ppbj, 'sanctum')->getJson('/api/v1/ppbj/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'stats',
                'permohonanMasuk',
                'pengadaanBerjalan',
                'terminKontrak',
            ]);
    }

    public function test_perencanaan_can_access_perencanaan_dashboard(): void
    {
        $perencanaan = User::where('email', 'perencanaan@pnj.ac.id')->firstOrFail();

        $response = $this->actingAs($perencanaan, 'sanctum')->getJson('/api/v1/perencanaan/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'stats',
                'permohonanTerbaru',
                'recentNotifications',
                'unreadNotificationsCount',
            ]);
    }

    public function test_pp_can_access_pp_dashboard(): void
    {
        $pp = User::where('email', 'pp@pnj.ac.id')->firstOrFail();

        $response = $this->actingAs($pp, 'sanctum')->getJson('/api/v1/pp/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'stats',
                'chart',
                'pengadaanPerluReview',
                'recentNotifications',
                'unreadNotificationsCount',
            ]);
    }

    public function test_ppk_can_access_ppk_dashboard(): void
    {
        $ppk = User::where('email', 'ppk@pnj.ac.id')->firstOrFail();

        $response = $this->actingAs($ppk, 'sanctum')->getJson('/api/v1/ppk/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'stats',
                'pengajuanTerbaru',
                'recentNotifications',
                'unreadNotificationsCount',
            ]);
    }

    public function test_keuangan_can_access_keuangan_dashboard(): void
    {
        $keuangan = User::where('email', 'keuangan@pnj.ac.id')->firstOrFail();

        $response = $this->actingAs($keuangan, 'sanctum')->getJson('/api/v1/keuangan/dashboard');

        $response->assertStatus(200);
    }

    public function test_perlengkapan_can_access_perlengkapan_dashboard(): void
    {
        $perlengkapan = User::where('email', 'perlengkapan@pnj.ac.id')->firstOrFail();

        $response = $this->actingAs($perlengkapan, 'sanctum')->getJson('/api/v1/perlengkapan/dashboard');

        $response->assertStatus(200);
    }

    public function test_pemohon_forbidden_from_admin_dashboard(): void
    {
        $pemohon = User::where('email', 'jurusan@pnj.ac.id')->firstOrFail();

        $response = $this->actingAs($pemohon, 'sanctum')->getJson('/api/v1/admin/dashboard');

        $response->assertStatus(403);
    }

    public function test_role_isolation_across_dashboards(): void
    {
        $pemohon = User::where('email', 'jurusan@pnj.ac.id')->firstOrFail();

        $otherEndpoints = [
            '/api/v1/admin/dashboard',
            '/api/v1/bidang-2/dashboard',
            '/api/v1/ppbj/dashboard',
            '/api/v1/perencanaan/dashboard',
            '/api/v1/pp/dashboard',
            '/api/v1/ppk/dashboard',
            '/api/v1/keuangan/dashboard',
            '/api/v1/perlengkapan/dashboard',
        ];

        foreach ($otherEndpoints as $endpoint) {
            $response = $this->actingAs($pemohon, 'sanctum')->getJson($endpoint);
            $response->assertStatus(403);
        }
    }
}
