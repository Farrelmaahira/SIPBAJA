<?php

namespace Tests\Feature\PPBJ;

use App\Models\Permohonan;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\PpbjDummySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PermohonanControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $ppbjUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->seed(PpbjDummySeeder::class);

        $this->ppbjUser = User::whereHas('Role', fn ($q) => $q->where('nama', 'PPBJ'))->firstOrFail();
    }

    public function test_index_mengembalikan_daftar_permohonan_untuk_ppbj(): void
    {
        $response = $this->actingAs($this->ppbjUser)->getJson('/api/v1/ppbj/permohonan');

        $response->assertOk()
            ->assertJsonStructure(['permohonanList']);
    }

    public function test_show_mengembalikan_detail_permohonan_beserta_split_context(): void
    {
        $permohonan = Permohonan::where('nomor_surat', 'PRM-PPBJ-001')->firstOrFail();

        $response = $this->actingAs($this->ppbjUser)->getJson("/api/v1/ppbj/permohonan/{$permohonan->id}");

        $response->assertOk()
            ->assertJsonStructure([
                'permohonan' => [
                    'id',
                    'nomorSurat',
                    'judul',
                    'bisaDipecah',
                    'sudahDikunci',
                    'sisaAnggaran',
                    'availableMak',
                    'referenceData' => ['jenis', 'metode', 'level'],
                    'dokumenList',
                ],
            ]);

        $data = $response->json('permohonan');
        $this->assertTrue($data['bisaDipecah']);
        $this->assertFalse($data['sudahDikunci']);
        $this->assertIsArray($data['availableMak']);
        $this->assertNotEmpty($data['availableMak']);
    }

    public function test_non_ppbj_user_dilarang_mengakses_detail_permohonan(): void
    {
        $nonPpbjUser = User::whereHas('Role', fn ($q) => $q->where('nama', 'Pemohon'))->firstOrFail();
        $permohonan = Permohonan::firstOrFail();

        $response = $this->actingAs($nonPpbjUser)->getJson("/api/v1/ppbj/permohonan/{$permohonan->id}");

        $response->assertForbidden();
    }
}
