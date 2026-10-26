<?php

namespace Tests\Feature\PPBJ;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\PpbjDummySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PermohonanControllerTest extends TestCase
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
        $response = $this->get(route('ppbj.permohonan.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_user_non_ppbj_dilarang_mengakses_halaman_permohonan(): void
    {
        $pemohon = User::where('email', 'jurusan@pnj.ac.id')->firstOrFail();
        $response = $this->actingAs($pemohon)->get(route('ppbj.permohonan.index'));
        $response->assertForbidden();
    }

    public function test_user_ppbj_dapat_mengakses_halaman_permohonan_dan_menerima_props_permohonan_list(): void
    {
        $ppbj = User::where('email', 'ppbj@pnj.ac.id')->firstOrFail();

        $response = $this->actingAs($ppbj)->get(route('ppbj.permohonan.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Ppbj/Permohonan/Index')
            ->has('permohonanList')
        );
    }
}
