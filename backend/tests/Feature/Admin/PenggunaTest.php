<?php

namespace Tests\Feature\Admin;

use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PenggunaTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([RoleSeeder::class, UserSeeder::class]);
    }

    private function admin(): User
    {
        return User::where('email', 'admin@pnj.ac.id')->firstOrFail();
    }

    public function test_admin_dapat_membuka_halaman_pengguna(): void
    {
        $response = $this->actingAs($this->admin())->get(route('admin.pengguna.index'));

        $response->assertOk();
    }

    public function test_admin_dapat_membuat_pengguna(): void
    {
        $response = $this->actingAs($this->admin())->post(route('admin.pengguna.store'), [
            'nama' => 'Budi Santoso',
            'email' => 'budi@pnj.ac.id',
            'password' => 'rahasia123',
            'role_id' => Role::where('nama', 'PPBJ')->firstOrFail()->id,
            'unit_id' => null,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', ['email' => 'budi@pnj.ac.id']);
    }

    public function test_email_duplikat_ditolak_dengan_pesan_bahasa_indonesia(): void
    {
        $response = $this->actingAs($this->admin())->post(route('admin.pengguna.store'), [
            'nama' => 'Kembar',
            'email' => 'ppbj@pnj.ac.id',
            'password' => 'rahasia123',
            'role_id' => Role::where('nama', 'PPBJ')->firstOrFail()->id,
            'unit_id' => null,
        ]);

        $response->assertSessionHasErrors('email');
    }

    public function test_admin_dapat_mengubah_pengguna_tanpa_ganti_password(): void
    {
        $user = User::where('email', 'ppbj@pnj.ac.id')->firstOrFail();
        $hashLama = $user->password;

        $response = $this->actingAs($this->admin())->put(route('admin.pengguna.update', $user), [
            'nama' => 'PPBJ Baru',
            'email' => 'ppbj@pnj.ac.id',
            'password' => null,
            'role_id' => $user->role_id,
            'unit_id' => Unit::create(['nama' => 'Unit Baru'])->id,
        ]);

        $response->assertRedirect();
        $this->assertSame($hashLama, $user->fresh()->password);
        $this->assertSame('PPBJ Baru', $user->fresh()->nama);
    }

    public function test_admin_dapat_menghapus_pengguna_dengan_soft_delete(): void
    {
        $user = User::where('email', 'ppbj@pnj.ac.id')->firstOrFail();

        $response = $this->actingAs($this->admin())->delete(route('admin.pengguna.destroy', $user));

        $response->assertRedirect();
        $this->assertSoftDeleted('users', ['id' => $user->id]);
    }

    public function test_bukan_admin_ditolak_dengan_403(): void
    {
        $nonAdmin = User::where('email', 'ppbj@pnj.ac.id')->firstOrFail();

        $this->actingAs($nonAdmin)->get(route('admin.pengguna.index'))->assertForbidden();
        $this->actingAs($nonAdmin)->post(route('admin.pengguna.store'), [])->assertForbidden();
    }
}
