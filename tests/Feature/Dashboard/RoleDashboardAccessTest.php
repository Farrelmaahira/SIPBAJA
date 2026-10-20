<?php

namespace Tests\Feature\Dashboard;

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleDashboardAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([RoleSeeder::class, UserSeeder::class]);
    }

    public function test_semua_peran_diredirect_ke_dashboard_yang_benar_setelah_login(): void
    {
        $roleRedirects = [
            'jurusan@pnj.ac.id' => 'pemohon.dashboard',
            'perencanaan@pnj.ac.id' => 'perencanaan.dashboard',
            'bidang2@pnj.ac.id' => 'bidang2.dashboard',
            'ppbj@pnj.ac.id' => 'ppbj.dashboard',
            'pp@pnj.ac.id' => 'pp.dashboard',
            'ppk@pnj.ac.id' => 'ppk.dashboard',
            'perlengkapan@pnj.ac.id' => 'perlengkapan.dashboard',
            'keuangan@pnj.ac.id' => 'keuangan.dashboard',
            'admin@pnj.ac.id' => 'admin.dashboard',
        ];

        foreach ($roleRedirects as $email => $routeName) {
            $response = $this->post(route('login.store'), [
                'login' => $email,
                'password' => 'password123',
            ]);

            $response->assertRedirect(route($routeName));
            $this->assertAuthenticated();

            $this->post(route('logout'));
            $this->assertGuest();
        }
    }

    public function test_pengguna_hanya_dapat_mengakses_dashboard_perannya_sendiri(): void
    {
        $roleRoutes = [
            'jurusan@pnj.ac.id' => 'pemohon.dashboard',
            'perencanaan@pnj.ac.id' => 'perencanaan.dashboard',
            'bidang2@pnj.ac.id' => 'bidang2.dashboard',
            'ppbj@pnj.ac.id' => 'ppbj.dashboard',
            'pp@pnj.ac.id' => 'pp.dashboard',
            'ppk@pnj.ac.id' => 'ppk.dashboard',
            'perlengkapan@pnj.ac.id' => 'perlengkapan.dashboard',
            'keuangan@pnj.ac.id' => 'keuangan.dashboard',
            'admin@pnj.ac.id' => 'admin.dashboard',
        ];

        foreach ($roleRoutes as $email => $routeName) {
            $user = User::where('email', $email)->firstOrFail();
            $response = $this->actingAs($user)->get(route($routeName));
            $response->assertOk();
        }
    }

    public function test_pengguna_dilarang_mengakses_dashboard_peran_lain(): void
    {
        $pemohon = User::where('email', 'jurusan@pnj.ac.id')->firstOrFail();

        $otherRoutes = [
            'perencanaan.dashboard',
            'bidang2.dashboard',
            'ppbj.dashboard',
            'pp.dashboard',
            'ppk.dashboard',
            'perlengkapan.dashboard',
            'keuangan.dashboard',
            'admin.dashboard',
        ];

        foreach ($otherRoutes as $routeName) {
            $response = $this->actingAs($pemohon)->get(route($routeName));
            $response->assertForbidden();
        }
    }

    public function test_bukan_admin_dilarang_mengakses_admin_dashboard(): void
    {
        $nonAdmin = User::where('email', 'ppbj@pnj.ac.id')->firstOrFail();

        $response = $this->actingAs($nonAdmin)->get(route('admin.dashboard'));

        $response->assertForbidden();
    }

    public function test_guest_diredirect_ke_login_saat_mengakses_dashboard(): void
    {
        $routes = [
            'pemohon.dashboard',
            'perencanaan.dashboard',
            'bidang2.dashboard',
            'ppbj.dashboard',
            'pp.dashboard',
            'ppk.dashboard',
            'perlengkapan.dashboard',
            'keuangan.dashboard',
        ];

        foreach ($routes as $route) {
            $response = $this->get(route($route));
            $response->assertRedirect(route('login'));
        }
    }
}
