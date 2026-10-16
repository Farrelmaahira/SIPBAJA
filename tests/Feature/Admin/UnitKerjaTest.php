<?php

namespace Tests\Feature\Admin;

use App\Models\Unit;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UnitKerjaTest extends TestCase
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

    public function test_admin_dapat_membuat_unit_kerja(): void
    {
        $response = $this->actingAs($this->admin())->post(route('admin.unit-kerja.store'), [
            'nama' => 'Teknik Informatika',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('units', ['nama' => 'Teknik Informatika']);
    }

    public function test_nama_duplikat_ditolak(): void
    {
        Unit::create(['nama' => 'Teknik Elektro']);

        $response = $this->actingAs($this->admin())->post(route('admin.unit-kerja.store'), [
            'nama' => 'Teknik Elektro',
        ]);

        $response->assertSessionHasErrors('nama');
    }

    public function test_unit_yang_dipakai_pengguna_tidak_bisa_dihapus(): void
    {
        $unit = Unit::create(['nama' => 'Unit Terpakai']);
        $user = User::where('email', 'ppbj@pnj.ac.id')->firstOrFail();
        $user->update(['unit_id' => $unit->id]);

        $response = $this->actingAs($this->admin())->delete(route('admin.unit-kerja.destroy', $unit));

        $response->assertRedirect();
        $this->assertDatabaseHas('units', ['id' => $unit->id]);
    }

    public function test_unit_tanpa_pengguna_bisa_dihapus(): void
    {
        $unit = Unit::create(['nama' => 'Unit Kosong']);

        $response = $this->actingAs($this->admin())->delete(route('admin.unit-kerja.destroy', $unit));

        $response->assertRedirect();
        $this->assertDatabaseMissing('units', ['id' => $unit->id]);
    }

    public function test_nama_duplikat_level_database_ditolak(): void
    {
        Unit::create(['nama' => 'Unit Kembar']);

        $this->expectException(QueryException::class);

        Unit::create(['nama' => 'Unit Kembar']);
    }

    public function test_bukan_admin_ditolak_dengan_403(): void
    {
        $nonAdmin = User::where('email', 'ppbj@pnj.ac.id')->firstOrFail();

        $this->actingAs($nonAdmin)->get(route('admin.unit-kerja.index'))->assertForbidden();
        $this->actingAs($nonAdmin)->post(route('admin.unit-kerja.store'), ['nama' => 'X'])->assertForbidden();
    }
}
