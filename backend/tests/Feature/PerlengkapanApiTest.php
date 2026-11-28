<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\MasterDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PerlengkapanApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(MasterDataSeeder::class);
    }

    private function perlengkapanUser(): User
    {
        return User::where('email', 'perlengkapan@pnj.ac.id')->firstOrFail();
    }

    public function test_unauthenticated_cannot_access_perlengkapan_endpoints(): void
    {
        $this->getJson('/api/v1/perlengkapan/dashboard')->assertStatus(401);
        $this->getJson('/api/v1/perlengkapan/pengadaan')->assertStatus(401);
    }

    public function test_perlengkapan_can_access_dashboard(): void
    {
        $response = $this->actingAs($this->perlengkapanUser(), 'sanctum')
            ->getJson('/api/v1/perlengkapan/dashboard');

        $response->assertStatus(200);
    }

    public function test_perlengkapan_can_access_pengadaan_list(): void
    {
        $response = $this->actingAs($this->perlengkapanUser(), 'sanctum')
            ->getJson('/api/v1/perlengkapan/pengadaan');

        $response->assertStatus(200);
        $this->assertArrayHasKey('data', $response->json());
        $this->assertArrayHasKey('total', $response->json());
    }

    public function test_perlengkapan_can_view_pengadaan_detail(): void
    {
        $response = $this->actingAs($this->perlengkapanUser(), 'sanctum')
            ->getJson('/api/v1/perlengkapan/pengadaan/1');

        $response->assertStatus(200);
        $this->assertArrayHasKey('nomor_pengadaan', $response->json());
        $this->assertArrayHasKey('tracking', $response->json());
        $this->assertArrayHasKey('vendor', $response->json());
    }

    public function test_perlengkapan_can_store_penerimaan_barang(): void
    {
        Storage::fake('local');

        $bastFile = UploadedFile::fake()->create('Berita_Acara_Serah_Terima.pdf', 500, 'application/pdf');
        $fotoFile = UploadedFile::fake()->image('dokumentasi_barang.jpg', 640, 480);

        $response = $this->actingAs($this->perlengkapanUser(), 'sanctum')
            ->postJson('/api/v1/perlengkapan/pengadaan/1/penerimaan', [
                'tanggal_terima' => '2027-03-12',
                'dokumen_barang' => [$bastFile],
                'dokumentasi_foto' => [$fotoFile],
            ]);

        $response->assertStatus(201);
        $this->assertArrayHasKey('dokumen_barang', $response->json());
        $this->assertArrayHasKey('dokumentasi_foto', $response->json());

        // Verifikasi detail berubah menjadi status selesai & penerimaan terisi
        $detailRes = $this->actingAs($this->perlengkapanUser(), 'sanctum')
            ->getJson('/api/v1/perlengkapan/pengadaan/1');

        $detailRes->assertStatus(200);
        $this->assertEquals('selesai', $detailRes->json('status'));
        $this->assertEquals('Selesai', $detailRes->json('status_label'));
        $this->assertNotNull($detailRes->json('penerimaan'));
        $this->assertNotEmpty($detailRes->json('penerimaan.dokumen_barang'));
        $this->assertNotEmpty($detailRes->json('penerimaan.dokumentasi_foto'));

        // Verifikasi pada list pengadaan statusnya juga selesai
        $listRes = $this->actingAs($this->perlengkapanUser(), 'sanctum')
            ->getJson('/api/v1/perlengkapan/pengadaan');

        $listRes->assertStatus(200);
        $item1 = collect($listRes->json('data'))->firstWhere('id', 1);
        if ($item1) {
            $this->assertEquals('selesai', $item1['status']);
        }
    }

    public function test_completed_pengadaan_returns_selesai_status_and_penerimaan_data(): void
    {
        // Item 3 atau 9 yang sudah berstatus selesai
        $response = $this->actingAs($this->perlengkapanUser(), 'sanctum')
            ->getJson('/api/v1/perlengkapan/pengadaan/3');

        $response->assertStatus(200);
        $this->assertEquals('selesai', $response->json('status'));
        $this->assertEquals('Selesai', $response->json('status_label'));
        $this->assertNotNull($response->json('penerimaan'));
        $this->assertNotEmpty($response->json('penerimaan.dokumen_barang'));
    }

    public function test_perlengkapan_can_view_profile(): void
    {
        $response = $this->actingAs($this->perlengkapanUser(), 'sanctum')
            ->getJson('/api/v1/perlengkapan/profil');

        $response->assertStatus(200);
        $this->assertArrayHasKey('user', $response->json());
        $this->assertEquals('Perlengkapan', $response->json('user.role.nama'));
    }

    public function test_perlengkapan_can_access_notifications(): void
    {
        $response = $this->actingAs($this->perlengkapanUser(), 'sanctum')
            ->getJson('/api/v1/notifications');

        $response->assertStatus(200);
        $this->assertArrayHasKey('notifications', $response->json());
        $this->assertArrayHasKey('unreadCount', $response->json());
    }
}
