<?php

namespace Tests\Feature\Admin;

use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleTest extends TestCase
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

    public function test_admin_dapat_membuat_peran(): void
    {
        $response = $this->actingAs($this->admin())->post(route('admin.role.store'), [
            'nama' => 'Auditor',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('roles', ['nama' => 'Auditor']);
    }

    public function test_nama_duplikat_ditolak(): void
    {
        $response = $this->actingAs($this->admin())->post(route('admin.role.store'), [
            'nama' => 'PPBJ',
        ]);

        $response->assertSessionHasErrors('nama');
    }

    public function test_peran_yang_dipakai_pengguna_tidak_bisa_dihapus(): void
    {
        $role = Role::where('nama', 'PPBJ')->firstOrFail();

        $response = $this->actingAs($this->admin())->delete(route('admin.role.destroy', $role));

        $response->assertRedirect();
        $this->assertDatabaseHas('roles', ['id' => $role->id]);
    }

    public function test_peran_tanpa_pengguna_bisa_dihapus(): void
    {
        $role = Role::create(['nama' => 'Sementara']);

        $response = $this->actingAs($this->admin())->delete(route('admin.role.destroy', $role));

        $response->assertRedirect();
        $this->assertDatabaseMissing('roles', ['id' => $role->id]);
    }

    public function test_bukan_admin_ditolak_dengan_403(): void
    {
        $nonAdmin = User::where('email', 'ppbj@pnj.ac.id')->firstOrFail();

        $this->actingAs($nonAdmin)->get(route('admin.role.index'))->assertForbidden();
    }
}
