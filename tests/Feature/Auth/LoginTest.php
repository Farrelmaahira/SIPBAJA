<?php

namespace Tests\Feature\Auth;

use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([RoleSeeder::class, UserSeeder::class]);
    }

    public function test_halaman_login_dapat_dibuka(): void
    {
        $this->get(route('login'))->assertOk();
    }

    public function test_login_dengan_email_berhasil(): void
    {
        $response = $this->post(route('login.store'), [
            'login' => 'admin@pnj.ac.id',
            'password' => 'password123',
        ]);

        $response->assertRedirect(route('dashboard'));
        $this->assertAuthenticated();
    }

    public function test_login_dengan_nama_berhasil(): void
    {
        $response = $this->post(route('login.store'), [
            'login' => 'PPK',
            'password' => 'password123',
        ]);

        $response->assertRedirect(route('dashboard'));
        $this->assertAuthenticated();
    }

    public function test_login_dengan_password_salah_gagal(): void
    {
        $response = $this->post(route('login.store'), [
            'login' => 'admin@pnj.ac.id',
            'password' => 'salahpassword',
        ]);

        $response->assertSessionHasErrors('login');
        $this->assertGuest();
    }

    public function test_login_membutuhkan_validasi(): void
    {
        $response = $this->post(route('login.store'), [
            'login' => '',
            'password' => 'pendek',
        ]);

        $response->assertSessionHasErrors(['login', 'password']);
        $this->assertGuest();
    }

    public function test_guest_tidak_bisa_membuka_dashboard(): void
    {
        $this->get(route('dashboard'))->assertRedirect(route('login'));
    }

    public function test_seeder_membuat_satu_akun_per_role(): void
    {
        $this->assertSame(Role::count(), 9);
        $this->assertSame(User::count(), 9);

        foreach (Role::all() as $role) {
            $this->assertTrue(
                User::where('role_id', $role->id)->exists(),
                "Role {$role->nama} tidak memiliki akun."
            );
        }
    }
}
