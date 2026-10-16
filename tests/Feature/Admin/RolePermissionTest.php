<?php

namespace Tests\Feature\Admin;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RbacSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RolePermissionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([RoleSeeder::class, UserSeeder::class, RbacSeeder::class]);
    }

    private function admin(): User
    {
        return User::where('email', 'admin@pnj.ac.id')->firstOrFail();
    }

    public function test_admin_dapat_menetapkan_izin_ke_peran(): void
    {
        $role = Role::where('nama', 'PPBJ')->firstOrFail();
        $ids = Permission::whereIn('kode', ['pengadaan.create', 'pengadaan.update'])->pluck('id')->all();

        $response = $this->actingAs($this->admin())->put(route('admin.role-permission.update', $role), [
            'permission_ids' => $ids,
        ]);

        $response->assertRedirect();
        $this->assertEqualsCanonicalizing($ids, $role->fresh()->Permissions()->pluck('permissions.id')->all());
    }

    public function test_id_izin_tidak_valid_ditolak(): void
    {
        $role = Role::where('nama', 'PPBJ')->firstOrFail();

        $response = $this->actingAs($this->admin())->put(route('admin.role-permission.update', $role), [
            'permission_ids' => [999999],
        ]);

        $response->assertSessionHasErrors('permission_ids.0');
    }

    public function test_bukan_admin_ditolak_dengan_403(): void
    {
        $nonAdmin = User::where('email', 'ppbj@pnj.ac.id')->firstOrFail();
        $role = Role::where('nama', 'PPBJ')->firstOrFail();

        $this->actingAs($nonAdmin)->get(route('admin.role-permission.index'))->assertForbidden();
        $this->actingAs($nonAdmin)->put(route('admin.role-permission.update', $role), [
            'permission_ids' => [],
        ])->assertForbidden();
    }
}
