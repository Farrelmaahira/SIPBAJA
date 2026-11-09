<?php

namespace Tests\Feature\Auth;

use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class RoleMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);

        Route::middleware(['web', 'auth', 'role:Admin'])->get('/test-role-admin', function () {
            return response('admin ok', 200);
        });

        Route::middleware(['web', 'auth', 'role:Pemohon,Perencanaan'])->get('/test-role-multiple', function () {
            return response('multiple ok', 200);
        });
    }

    public function test_user_dengan_peran_yang_sesuai_dapat_mengakses_route(): void
    {
        $adminRole = Role::where('nama', 'Admin')->firstOrFail();
        $admin = User::factory()->create(['role_id' => $adminRole->id]);

        $response = $this->actingAs($admin)->get('/test-role-admin');

        $response->assertOk();
        $response->assertSee('admin ok');
    }

    public function test_user_dengan_salah_satu_peran_yang_diizinkan_dapat_mengakses_route(): void
    {
        $perencanaanRole = Role::where('nama', 'Perencanaan')->firstOrFail();
        $user = User::factory()->create(['role_id' => $perencanaanRole->id]);

        $response = $this->actingAs($user)->get('/test-role-multiple');

        $response->assertOk();
        $response->assertSee('multiple ok');
    }

    public function test_user_dengan_peran_berbeda_ditolak_dengan_status_403(): void
    {
        $pemohonRole = Role::where('nama', 'Pemohon')->firstOrFail();
        $user = User::factory()->create(['role_id' => $pemohonRole->id]);

        $response = $this->actingAs($user)->get('/test-role-admin');

        $response->assertForbidden();
    }

    public function test_tamu_belum_login_diredirect_ke_login(): void
    {
        $response = $this->get('/test-role-admin');

        $response->assertRedirect(route('login'));
    }
}
