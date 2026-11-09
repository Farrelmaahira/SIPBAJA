<?php

namespace Tests\Feature;

use App\Models\Mak;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\MasterReferenceSeeder;
use Database\Seeders\RbacSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCrudApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([RoleSeeder::class, UserSeeder::class, RbacSeeder::class, MasterReferenceSeeder::class]);
    }

    private function admin(): User
    {
        return User::where('email', 'admin@pnj.ac.id')->firstOrFail();
    }

    private function nonAdmin(): User
    {
        return User::where('email', 'jurusan@pnj.ac.id')->firstOrFail();
    }

    public function test_unauthenticated_cannot_access_admin_endpoints(): void
    {
        $this->getJson('/api/v1/admin/pengguna')->assertStatus(401);
        $this->getJson('/api/v1/admin/mak')->assertStatus(401);
        $this->getJson('/api/v1/admin/role-permission')->assertStatus(401);
        $this->getJson('/api/v1/admin/unit-kerja')->assertStatus(401);
    }

    public function test_non_admin_cannot_access_admin_endpoints(): void
    {
        $this->actingAs($this->nonAdmin(), 'sanctum')->getJson('/api/v1/admin/pengguna')->assertStatus(403);
        $this->actingAs($this->nonAdmin(), 'sanctum')->getJson('/api/v1/admin/mak')->assertStatus(403);
        $this->actingAs($this->nonAdmin(), 'sanctum')->getJson('/api/v1/admin/role-permission')->assertStatus(403);
        $this->actingAs($this->nonAdmin(), 'sanctum')->getJson('/api/v1/admin/unit-kerja')->assertStatus(403);
    }

    public function test_admin_can_list_pengguna(): void
    {
        $response = $this->actingAs($this->admin(), 'sanctum')->getJson('/api/v1/admin/pengguna');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'users',
                'roles',
                'units',
                'filters',
            ]);
    }

    public function test_admin_can_create_pengguna(): void
    {
        $role = Role::where('nama', 'PPBJ')->firstOrFail();

        $response = $this->actingAs($this->admin(), 'sanctum')->postJson('/api/v1/admin/pengguna', [
            'nama' => 'Budi Santoso',
            'email' => 'budi.santoso@pnj.ac.id',
            'password' => 'rahasia123',
            'role_id' => $role->id,
            'unit_id' => null,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['message', 'user']);

        $this->assertDatabaseHas('users', ['email' => 'budi.santoso@pnj.ac.id']);
    }

    public function test_admin_can_update_pengguna(): void
    {
        $user = User::where('email', 'ppbj@pnj.ac.id')->firstOrFail();

        $response = $this->actingAs($this->admin(), 'sanctum')->putJson("/api/v1/admin/pengguna/{$user->id}", [
            'nama' => 'PPBJ Updated',
            'email' => 'ppbj@pnj.ac.id',
            'password' => null,
            'role_id' => $user->role_id,
            'unit_id' => null,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['message', 'user']);

        $this->assertSame('PPBJ Updated', $user->fresh()->nama);
    }

    public function test_admin_can_delete_pengguna(): void
    {
        $user = User::where('email', 'ppbj@pnj.ac.id')->firstOrFail();

        $response = $this->actingAs($this->admin(), 'sanctum')->deleteJson("/api/v1/admin/pengguna/{$user->id}");

        $response->assertStatus(204);
        $this->assertSoftDeleted('users', ['id' => $user->id]);
    }

    public function test_admin_can_list_mak(): void
    {
        $response = $this->actingAs($this->admin(), 'sanctum')->getJson('/api/v1/admin/mak');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'maks',
                'ppkOptions',
                'filters',
            ]);
    }

    public function test_admin_can_create_mak(): void
    {
        $ppk = User::where('email', 'ppk@pnj.ac.id')->firstOrFail();

        $response = $this->actingAs($this->admin(), 'sanctum')->postJson('/api/v1/admin/mak', [
            'nama' => 'MAK Baru 2026',
            'ppk_user_id' => $ppk->id,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['message', 'mak']);

        $this->assertDatabaseHas('maks', ['nama' => 'MAK Baru 2026']);
    }

    public function test_admin_can_delete_mak(): void
    {
        $ppk = User::where('email', 'ppk@pnj.ac.id')->firstOrFail();
        $mak = Mak::create([
            'nama' => 'MAK Unused Test',
            'ppk_user_id' => $ppk->id,
        ]);

        $response = $this->actingAs($this->admin(), 'sanctum')->deleteJson("/api/v1/admin/mak/{$mak->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('maks', ['id' => $mak->id]);
    }

    public function test_admin_can_get_role_permissions(): void
    {
        $response = $this->actingAs($this->admin(), 'sanctum')->getJson('/api/v1/admin/role-permission');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'roles',
                'groupedPermissions',
                'assignments',
                'selectedRoleId',
            ]);
    }

    public function test_admin_can_update_role_permissions(): void
    {
        $role = Role::where('nama', 'Pemohon')->firstOrFail();

        $response = $this->actingAs($this->admin(), 'sanctum')->putJson("/api/v1/admin/role-permission/{$role->id}", [
            'permission_ids' => [],
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Hak akses berhasil disimpan.');
    }

    public function test_admin_can_list_and_manage_unit_kerja(): void
    {
        $response = $this->actingAs($this->admin(), 'sanctum')->getJson('/api/v1/admin/unit-kerja');
        $response->assertStatus(200)->assertJsonStructure(['units', 'filters']);

        $createRes = $this->actingAs($this->admin(), 'sanctum')->postJson('/api/v1/admin/unit-kerja', [
            'nama' => 'Unit Testing Khusus',
        ]);
        $createRes->assertStatus(201)->assertJsonStructure(['message', 'unit']);
        $unitId = $createRes->json('unit.id');

        $updateRes = $this->actingAs($this->admin(), 'sanctum')->putJson("/api/v1/admin/unit-kerja/{$unitId}", [
            'nama' => 'Unit Testing Diubah',
        ]);
        $updateRes->assertStatus(200);

        $deleteRes = $this->actingAs($this->admin(), 'sanctum')->deleteJson("/api/v1/admin/unit-kerja/{$unitId}");
        $deleteRes->assertStatus(204);
    }
}
