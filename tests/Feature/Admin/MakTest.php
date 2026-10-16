<?php

namespace Tests\Feature\Admin;

use App\Models\Mak;
use App\Models\Permohonan;
use App\Models\PermohonanMak;
use App\Models\Unit;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MakTest extends TestCase
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

    public function test_admin_dapat_membuat_mak_dengan_ppk(): void
    {
        $ppk = User::where('email', 'ppk@pnj.ac.id')->firstOrFail();

        $response = $this->actingAs($this->admin())->post(route('admin.mak.store'), [
            'nama' => 'BLU Fisik',
            'ppk_user_id' => $ppk->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('maks', ['nama' => 'BLU Fisik', 'ppk_user_id' => $ppk->id]);
    }

    public function test_ppk_yang_tidak_valid_ditolak(): void
    {
        $response = $this->actingAs($this->admin())->post(route('admin.mak.store'), [
            'nama' => 'MAK Palsu',
            'ppk_user_id' => 999999,
        ]);

        $response->assertSessionHasErrors('ppk_user_id');
    }

    public function test_mak_yang_dipakai_permohonan_tidak_bisa_dihapus(): void
    {
        $ppk = User::where('email', 'ppk@pnj.ac.id')->firstOrFail();
        $mak = Mak::create(['nama' => 'RM Fisik', 'ppk_user_id' => $ppk->id]);

        PermohonanMak::create([
            'permohonan_id' => Permohonan::create([
                'unit_id' => Unit::create(['nama' => 'Unit Tes'])->id,
                'created_by' => $this->admin()->id,
                'nomor_surat' => '001/TEST/2026',
                'judul' => 'Pengadaan Tes',
                'ringkasan_tujuan' => 'Untuk tes hapus MAK.',
                'estimasi_anggaran' => 10000000,
                'status' => 'diajukan',
            ])->id,
            'mak_id' => $mak->id,
            'ditentukan_oleh' => $this->admin()->id,
        ]);

        $response = $this->actingAs($this->admin())->delete(route('admin.mak.destroy', $mak));

        $response->assertRedirect();
        $this->assertDatabaseHas('maks', ['id' => $mak->id]);
    }

    public function test_bukan_admin_ditolak_dengan_403(): void
    {
        $nonAdmin = User::where('email', 'ppbj@pnj.ac.id')->firstOrFail();

        $this->actingAs($nonAdmin)->get(route('admin.mak.index'))->assertForbidden();
    }
}
