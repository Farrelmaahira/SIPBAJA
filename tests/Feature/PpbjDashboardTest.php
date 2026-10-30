<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\PpbjDummySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PpbjDashboardTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(DatabaseSeeder::class);
        $this->seed(PpbjDummySeeder::class);
    }

    public function test_tamu_diredirect_ke_login(): void
    {
        $response = $this->get(route('ppbj.dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_user_non_ppbj_dilarang_mengakses_dashboard_ppbj(): void
    {
        $pemohon = User::where('email', 'jurusan@pnj.ac.id')->firstOrFail();
        $response = $this->actingAs($pemohon)->get(route('ppbj.dashboard'));
        $response->assertForbidden();
    }

    public function test_user_ppbj_dapat_mengakses_dashboard_dan_menerima_props_lengkap(): void
    {
        $ppbj = User::where('email', 'ppbj@pnj.ac.id')->firstOrFail();

        $response = $this->actingAs($ppbj)->get(route('ppbj.dashboard'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Ppbj/Dashboard')
            ->has('stats', 3)
            ->has('permohonanMasuk')
            ->has('pengadaanBerjalan')
            ->has('terminKontrak')
            ->where('stats.0.label', 'Permohonan Masuk')
            ->where('stats.1.label', 'Pengadaan Berjalan')
            ->where('stats.2.label', 'Termin Siap Bayar')
        );
    }
}
