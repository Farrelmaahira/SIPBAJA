<?php

namespace Tests\Feature;

use App\Models\Permohonan;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\PpbjDummySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PermohonanShowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(DatabaseSeeder::class);
        $this->seed(PpbjDummySeeder::class);
    }

    public function test_tamu_diredirect_ke_login(): void
    {
        $permohonan = Permohonan::firstOrFail();

        $response = $this->get(route('ppbj.permohonan.show', $permohonan->id));

        $response->assertRedirect(route('login'));
    }

    public function test_user_non_ppbj_dilarang_mengakses_detail_permohonan(): void
    {
        $pemohon = User::where('email', 'jurusan@pnj.ac.id')->firstOrFail();
        $permohonan = Permohonan::firstOrFail();

        $response = $this->actingAs($pemohon)->get(route('ppbj.permohonan.show', $permohonan->id));

        $response->assertForbidden();
    }

    public function test_ppbj_dapat_melihat_detail_permohonan(): void
    {
        $ppbj = User::where('email', 'ppbj@pnj.ac.id')->firstOrFail();
        $permohonan = Permohonan::firstOrFail();

        $response = $this->actingAs($ppbj)->get(route('ppbj.permohonan.show', $permohonan->id));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Ppbj/Permohonan/Show')
            ->has('permohonan', fn (Assert $item) => $item
                ->where('id', (int) $permohonan->id)
                ->has('nomorSurat')
                ->has('judul')
                ->has('ringkasanTujuan')
                ->has('unitNama')
                ->has('estimasiAnggaran')
                ->has('revisiKe')
                ->has('status')
                ->has('tanggalPengajuan')
                ->has('pembuatNama')
                ->has('makList')
                ->has('paketList')
                ->has('bisaDipecah')
                ->has('sudahDikunci')
                ->has('sisaAnggaran')
                ->has('totalNominalPaket')
                ->has('availableMak')
                ->has('referenceData')
            )
        );
    }

    public function test_show_mengembalikan_404_jika_permohonan_tidak_ditemukan(): void
    {
        $ppbj = User::where('email', 'ppbj@pnj.ac.id')->firstOrFail();

        $response = $this->actingAs($ppbj)->get(route('ppbj.permohonan.show', 999999));

        $response->assertNotFound();
    }
}
