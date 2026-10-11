<?php

namespace Tests\Feature\Auth;

use App\Livewire\Auth\Login;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
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
        Livewire::test(Login::class)
            ->set('login', 'admin@pnj.ac.id')
            ->set('password', 'password123')
            ->call('authenticate')
            ->assertRedirect(route('dashboard'));

        $this->assertAuthenticated();
    }

    public function test_login_dengan_nama_berhasil(): void
    {
        Livewire::test(Login::class)
            ->set('login', 'PPK')
            ->set('password', 'password123')
            ->call('authenticate')
            ->assertRedirect(route('dashboard'));

        $this->assertAuthenticated();
    }

    public function test_login_dengan_password_salah_gagal(): void
    {
        Livewire::test(Login::class)
            ->set('login', 'admin@pnj.ac.id')
            ->set('password', 'salahpassword')
            ->call('authenticate')
            ->assertHasErrors('login');

        $this->assertGuest();
    }

    public function test_login_membutuhkan_validasi(): void
    {
        Livewire::test(Login::class)
            ->set('login', '')
            ->set('password', 'pendek')
            ->call('authenticate')
            ->assertHasErrors(['login', 'password']);

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
