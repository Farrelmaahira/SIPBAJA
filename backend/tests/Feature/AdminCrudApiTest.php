<?php

namespace Tests\Feature;

use App\Models\Mak;
use App\Models\MetodePengadaan;
use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use App\Services\MakService;
use App\Services\RolePermissionService;
use App\Services\RoleService;
use App\Services\UnitService;
use App\Services\UserService;
use Database\Seeders\MasterDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCrudApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(MasterDataSeeder::class);
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

    public function test_admin_can_search_pengguna_by_name_case_insensitively(): void
    {
        $response = $this->actingAs($this->admin(), 'sanctum')->getJson('/api/v1/admin/pengguna?q=jurusan');

        $response->assertStatus(200);

        $names = collect($response->json('users.data'))->pluck('nama');

        $this->assertTrue($names->contains('Jurusan Unit Bidang'));
    }

    public function test_admin_can_filter_pengguna_by_status(): void
    {
        $inactive = User::where('email', 'perencanaan@pnj.ac.id')->firstOrFail();
        $inactive->update(['isActive' => false]);

        $inactiveResponse = $this->actingAs($this->admin(), 'sanctum')
            ->getJson('/api/v1/admin/pengguna?statuses[]=nonaktif');
        $inactiveResponse->assertStatus(200);

        $inactiveIds = collect($inactiveResponse->json('users.data'))->pluck('id');
        $this->assertTrue($inactiveIds->contains($inactive->id));
        $this->assertFalse($inactiveIds->contains($this->admin()->id));

        $activeResponse = $this->actingAs($this->admin(), 'sanctum')
            ->getJson('/api/v1/admin/pengguna?statuses[]=aktif');
        $activeResponse->assertStatus(200);

        $activeIds = collect($activeResponse->json('users.data'))->pluck('id');
        $this->assertTrue($activeIds->contains($this->admin()->id));
        $this->assertFalse($activeIds->contains($inactive->id));
    }

    public function test_admin_master_data_search_is_case_insensitive(): void
    {
        $this->actingAs($this->admin(), 'sanctum');

        $this->assertTrue(collect($this->getJson('/api/v1/admin/unit-kerja?q=jurusan')->json('units.data'))
            ->pluck('nama')->contains('Jurusan Teknik Informatika'));

        $this->assertTrue(collect($this->getJson('/api/v1/admin/mak?q=blu fisik')->json('maks.data'))
            ->pluck('nama')->contains('BLU Fisik'));

        $this->assertTrue(collect($this->getJson('/api/v1/admin/metode-pengadaan?q=inaproc')->json('metode_pengadaan.data'))
            ->pluck('nama')->contains('Inaproc'));

        $this->assertTrue(collect($this->getJson('/api/v1/admin/role?q=pemohon')->json('roles.data'))
            ->pluck('nama')->contains('Pemohon'));
    }

    public function test_admin_master_data_can_filter_by_status(): void
    {
        $this->actingAs($this->admin(), 'sanctum');

        $targets = [
            ['/api/v1/admin/unit-kerja', 'units', Unit::where('nama', 'Jurusan Teknik Informatika')->firstOrFail()],
            ['/api/v1/admin/mak', 'maks', Mak::where('nama', 'BLU Fisik')->firstOrFail()],
            ['/api/v1/admin/metode-pengadaan', 'metode_pengadaan', MetodePengadaan::where('nama', 'Inaproc')->firstOrFail()],
            ['/api/v1/admin/role', 'roles', Role::where('nama', 'Pemohon')->firstOrFail()],
        ];

        foreach ($targets as [$endpoint, $key, $model]) {
            $model->update(['isActive' => false]);

            $inactiveIds = collect($this->getJson("{$endpoint}?statuses[]=nonaktif")->json("{$key}.data"))->pluck('id');
            $this->assertTrue($inactiveIds->contains($model->id), "{$endpoint} tidak memuat data nonaktif.");

            $activeIds = collect($this->getJson("{$endpoint}?statuses[]=aktif")->json("{$key}.data"))->pluck('id');
            $this->assertFalse($activeIds->contains($model->id), "{$endpoint} masih memuat data nonaktif.");
        }
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
        $ppk = User::where('email', 'ppk.blufisik@pnj.ac.id')->firstOrFail();

        $response = $this->actingAs($this->admin(), 'sanctum')->postJson('/api/v1/admin/mak', [
            'kode' => 'MAK-BARU-2026',
            'nama' => 'MAK Baru 2026',
            'ppk_user_id' => $ppk->id,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['message', 'mak']);

        $this->assertDatabaseHas('maks', ['nama' => 'MAK Baru 2026']);
    }

    public function test_admin_can_delete_mak(): void
    {
        $ppk = User::where('email', 'ppk.blufisik@pnj.ac.id')->firstOrFail();
        $mak = Mak::create([
            'kode' => 'MAK-DEL-TEST',
            'nama' => 'MAK Unused Test',
            'ppk_user_id' => $ppk->id,
        ]);

        $response = $this->actingAs($this->admin(), 'sanctum')->deleteJson("/api/v1/admin/mak/{$mak->id}");

        $response->assertStatus(204);
        $this->assertSoftDeleted('maks', ['id' => $mak->id]);
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

    public function test_domain_services_provide_accurate_admin_metrics_and_options(): void
    {
        $userService = app(UserService::class);
        $unitService = app(UnitService::class);
        $makService = app(MakService::class);
        $roleService = app(RoleService::class);
        $rolePermissionService = app(RolePermissionService::class);

        $this->assertGreaterThan(0, $userService->count());
        $this->assertGreaterThan(0, $unitService->count());
        $this->assertGreaterThanOrEqual(0, $makService->count());

        $recentUsers = $userService->getRecentUsers(3);
        $this->assertIsArray($recentUsers);
        $this->assertNotEmpty($recentUsers);
        $this->assertArrayHasKey('nama', $recentUsers[0]);
        $this->assertArrayHasKey('role', $recentUsers[0]);

        $ppkOptions = $userService->getPpkOptions();
        $this->assertIsArray($ppkOptions);

        $unitOptions = $unitService->getUnitOptions();
        $this->assertIsArray($unitOptions);
        $this->assertNotEmpty($unitOptions);

        $roleOptions = $roleService->getRoleOptions();
        $this->assertIsArray($roleOptions);
        $this->assertNotEmpty($roleOptions);

        $matrix = $rolePermissionService->getMatrixData();
        $this->assertArrayHasKey('roles', $matrix);
        $this->assertArrayHasKey('groupedPermissions', $matrix);
        $this->assertArrayHasKey('assignments', $matrix);
    }

    public function test_admin_can_manage_metode_pengadaan_without_delete(): void
    {
        $listRes = $this->actingAs($this->admin(), 'sanctum')->getJson('/api/v1/admin/metode-pengadaan');
        $listRes->assertStatus(200)->assertJsonStructure([
            'metode_pengadaan' => ['data', 'total', 'current_page'],
            'filters',
        ]);

        $createRes = $this->actingAs($this->admin(), 'sanctum')->postJson('/api/v1/admin/metode-pengadaan', [
            'nama' => 'Metode Uji Coba Baru',
        ]);
        $createRes->assertStatus(201)
            ->assertJsonPath('metode_pengadaan.nama', 'Metode Uji Coba Baru')
            ->assertJsonPath('metode_pengadaan.isActive', true);

        $metodeId = $createRes->json('metode_pengadaan.id');

        $updateRes = $this->actingAs($this->admin(), 'sanctum')->putJson("/api/v1/admin/metode-pengadaan/{$metodeId}", [
            'nama' => 'Metode Uji Coba Diperbarui',
        ]);
        $updateRes->assertStatus(200)
            ->assertJsonPath('metode_pengadaan.nama', 'Metode Uji Coba Diperbarui');

        $deactivateRes = $this->actingAs($this->admin(), 'sanctum')->postJson("/api/v1/admin/metode-pengadaan/{$metodeId}/deactivate");
        $deactivateRes->assertStatus(200)
            ->assertJsonPath('metode_pengadaan.isActive', false);

        $activateRes = $this->actingAs($this->admin(), 'sanctum')->postJson("/api/v1/admin/metode-pengadaan/{$metodeId}/activate");
        $activateRes->assertStatus(200)
            ->assertJsonPath('metode_pengadaan.isActive', true);

        $toggleRes = $this->actingAs($this->admin(), 'sanctum')->postJson("/api/v1/admin/metode-pengadaan/{$metodeId}/toggle-status");
        $toggleRes->assertStatus(200)
            ->assertJsonPath('metode_pengadaan.isActive', false);

        $deleteRes = $this->actingAs($this->admin(), 'sanctum')->deleteJson("/api/v1/admin/metode-pengadaan/{$metodeId}");
        $deleteRes->assertStatus(405);
    }

    public function test_admin_can_toggle_unit_kerja_status(): void
    {
        $createRes = $this->actingAs($this->admin(), 'sanctum')->postJson('/api/v1/admin/unit-kerja', [
            'nama' => 'Unit Uji Coba',
        ]);
        $createRes->assertStatus(201);
        $unitId = $createRes->json('unit.id');

        $deactivateRes = $this->actingAs($this->admin(), 'sanctum')->postJson("/api/v1/admin/unit-kerja/{$unitId}/deactivate");
        $deactivateRes->assertStatus(200)->assertJsonPath('unit.isActive', false);

        $activateRes = $this->actingAs($this->admin(), 'sanctum')->postJson("/api/v1/admin/unit-kerja/{$unitId}/activate");
        $activateRes->assertStatus(200)->assertJsonPath('unit.isActive', true);

        $toggleRes = $this->actingAs($this->admin(), 'sanctum')->postJson("/api/v1/admin/unit-kerja/{$unitId}/toggle-status");
        $toggleRes->assertStatus(200)->assertJsonPath('unit.isActive', false);
    }

    public function test_admin_can_toggle_mak_status(): void
    {
        $ppk = User::where('email', 'ppk.blufisik@pnj.ac.id')->firstOrFail();
        $mak = Mak::create([
            'kode' => 'MAK-TOGGLE-TEST',
            'nama' => 'MAK Toggle Test',
            'ppk_user_id' => $ppk->id,
            'isActive' => true,
        ]);

        $deactivateRes = $this->actingAs($this->admin(), 'sanctum')->postJson("/api/v1/admin/mak/{$mak->id}/deactivate");
        $deactivateRes->assertStatus(200)->assertJsonPath('mak.isActive', false);

        $activateRes = $this->actingAs($this->admin(), 'sanctum')->postJson("/api/v1/admin/mak/{$mak->id}/activate");
        $activateRes->assertStatus(200)->assertJsonPath('mak.isActive', true);

        $toggleRes = $this->actingAs($this->admin(), 'sanctum')->postJson("/api/v1/admin/mak/{$mak->id}/toggle-status");
        $toggleRes->assertStatus(200)->assertJsonPath('mak.isActive', false);
    }

    public function test_admin_can_toggle_role_status(): void
    {
        $createRes = $this->actingAs($this->admin(), 'sanctum')->postJson('/api/v1/admin/role', [
            'nama' => 'Peran Uji Coba',
        ]);
        $createRes->assertStatus(201);
        $roleId = $createRes->json('role.id');

        $deactivateRes = $this->actingAs($this->admin(), 'sanctum')->postJson("/api/v1/admin/role/{$roleId}/deactivate");
        $deactivateRes->assertStatus(200)->assertJsonPath('role.isActive', false);

        $activateRes = $this->actingAs($this->admin(), 'sanctum')->postJson("/api/v1/admin/role/{$roleId}/activate");
        $activateRes->assertStatus(200)->assertJsonPath('role.isActive', true);

        $toggleRes = $this->actingAs($this->admin(), 'sanctum')->postJson("/api/v1/admin/role/{$roleId}/toggle-status");
        $toggleRes->assertStatus(200)->assertJsonPath('role.isActive', false);
    }
}
