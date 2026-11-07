<?php

namespace Tests\Unit;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RbacSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserRbacTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([RoleSeeder::class, RbacSeeder::class]);
    }

    public function test_has_role_memeriksa_peran_tunggal_dan_banyak(): void
    {
        $adminRole = Role::where('nama', 'Admin')->firstOrFail();
        $pemohonRole = Role::where('nama', 'Pemohon')->firstOrFail();

        $admin = User::factory()->create(['role_id' => $adminRole->id]);
        $pemohon = User::factory()->create(['role_id' => $pemohonRole->id]);

        $this->assertTrue($admin->hasRole('Admin'));
        $this->assertFalse($admin->hasRole('Pemohon'));
        $this->assertTrue($admin->hasRole(['Pemohon', 'Admin']));

        $this->assertTrue($pemohon->hasRole('Pemohon'));
        $this->assertFalse($pemohon->hasRole('Admin'));
        $this->assertTrue($pemohon->hasRole(['Pemohon', 'Perencanaan']));
        $this->assertFalse($pemohon->hasRole(['Perencanaan', 'PPBJ']));
    }

    public function test_admin_memiliki_akses_semua_permission(): void
    {
        $adminRole = Role::where('nama', 'Admin')->firstOrFail();
        $admin = User::factory()->create(['role_id' => $adminRole->id]);

        $allPermissionCodes = Permission::pluck('kode')->all();

        $this->assertTrue($admin->hasPermission('MAK.view'));
        $this->assertTrue($admin->hasPermission('permohonan.create'));
        $this->assertTrue($admin->hasPermission('random.nonexistent.permission'));
        $this->assertEqualsCanonicalizing($allPermissionCodes, $admin->getPermissionCodes());
    }

    public function test_non_admin_hanya_memiliki_permission_sesuai_peran(): void
    {
        $pemohonRole = Role::where('nama', 'Pemohon')->firstOrFail();
        $pemohon = User::factory()->create(['role_id' => $pemohonRole->id]);

        $this->assertTrue($pemohon->hasPermission('permohonan.create'));
        $this->assertFalse($pemohon->hasPermission('MAK.delete'));
        $this->assertFalse($pemohon->hasPermission('role.create'));

        $expectedCodes = $pemohonRole->Permissions()->pluck('kode')->all();
        $this->assertEqualsCanonicalizing($expectedCodes, $pemohon->getPermissionCodes());
    }

    public function test_user_tanpa_role_mengembalikan_false_dan_array_kosong(): void
    {
        $user = new User;

        $this->assertFalse($user->hasRole('Admin'));
        $this->assertFalse($user->hasPermission('permohonan.create'));
        $this->assertSame([], $user->getPermissionCodes());
    }
}
