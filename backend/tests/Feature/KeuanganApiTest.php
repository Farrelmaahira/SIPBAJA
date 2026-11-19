<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\KeuanganSeeder;
use Database\Seeders\MasterReferenceSeeder;
use Database\Seeders\RbacSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KeuanganApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([
            RoleSeeder::class,
            UserSeeder::class,
            RbacSeeder::class,
            MasterReferenceSeeder::class,
            KeuanganSeeder::class,
        ]);
    }

    private function keuanganUser(): User
    {
        return User::where('email', 'keuangan@pnj.ac.id')->firstOrFail();
    }

    private function pemohonUser(): User
    {
        return User::where('email', 'jurusan@pnj.ac.id')->firstOrFail();
    }

    public function test_unauthenticated_cannot_access_keuangan_endpoints(): void
    {
        $this->getJson('/api/v1/keuangan/dashboard')->assertStatus(401);
        $this->getJson('/api/v1/keuangan/pengadaan')->assertStatus(401);
        $this->getJson('/api/v1/keuangan/profil')->assertStatus(401);
    }

    public function test_non_keuangan_cannot_access_keuangan_dashboard(): void
    {
        $response = $this->actingAs($this->pemohonUser(), 'sanctum')
            ->getJson('/api/v1/keuangan/dashboard');

        $response->assertStatus(403);
    }

    public function test_keuangan_can_access_dashboard_and_reads_from_database(): void
    {
        $response = $this->actingAs($this->keuanganUser(), 'sanctum')
            ->getJson('/api/v1/keuangan/dashboard');

        $response->assertStatus(200);

        $json = $response->json();
        $this->assertArrayHasKey('summary', $json);
        $this->assertArrayHasKey('total_menunggu_pembayaran', $json['summary']);
        $this->assertGreaterThanOrEqual(6, $json['summary']['total_menunggu_pembayaran']);

        $this->assertArrayHasKey('pengadaan_menunggu_pembayaran', $json);
        $this->assertIsArray($json['pengadaan_menunggu_pembayaran']);
        $this->assertNotEmpty($json['pengadaan_menunggu_pembayaran']);

        $firstItem = $json['pengadaan_menunggu_pembayaran'][0];
        $this->assertArrayHasKey('id', $firstItem);
        $this->assertArrayHasKey('nomor_pengadaan', $firstItem);
        $this->assertArrayHasKey('nomor_permohonan', $firstItem);
        $this->assertArrayHasKey('judul', $firstItem);
        $this->assertArrayHasKey('diajukan_oleh', $firstItem);
        $this->assertArrayHasKey('nilai_pengajuan', $firstItem);
        $this->assertArrayHasKey('status', $firstItem);
        $this->assertArrayHasKey('status_label', $firstItem);
    }

    public function test_keuangan_can_access_profil(): void
    {
        $response = $this->actingAs($this->keuanganUser(), 'sanctum')
            ->getJson('/api/v1/keuangan/profil');

        $response->assertStatus(200);
        $this->assertEquals('keuangan@pnj.ac.id', $response->json('user.email'));
    }

    public function test_keuangan_can_access_pengadaan_list_with_pagination(): void
    {
        $response = $this->actingAs($this->keuanganUser(), 'sanctum')
            ->getJson('/api/v1/keuangan/pengadaan?page=1&per_page=10');

        $response->assertStatus(200);

        $json = $response->json();
        $this->assertArrayHasKey('data', $json);
        $this->assertArrayHasKey('total', $json);
        $this->assertArrayHasKey('current_page', $json);
        $this->assertArrayHasKey('last_page', $json);
        $this->assertGreaterThanOrEqual(10, $json['total']);
        $this->assertCount(10, $json['data']);
    }

    public function test_keuangan_can_search_pengadaan_list(): void
    {
        $response = $this->actingAs($this->keuanganUser(), 'sanctum')
            ->getJson('/api/v1/keuangan/pengadaan?search=Komputer');

        $response->assertStatus(200);
        $json = $response->json();
        $this->assertGreaterThanOrEqual(1, $json['total']);
        $this->assertStringContainsString('Komputer', $json['data'][0]['judul']);
    }

    public function test_keuangan_can_filter_pengadaan_list_by_status(): void
    {
        // Filter status Selesai
        $responseSelesai = $this->actingAs($this->keuanganUser(), 'sanctum')
            ->getJson('/api/v1/keuangan/pengadaan?status=selesai');

        $responseSelesai->assertStatus(200);
        $jsonSelesai = $responseSelesai->json();
        $this->assertGreaterThanOrEqual(1, $jsonSelesai['total']);
        foreach ($jsonSelesai['data'] as $item) {
            $this->assertEquals('selesai', $item['status']);
        }

        // Filter status Menunggu Input
        $responseMenunggu = $this->actingAs($this->keuanganUser(), 'sanctum')
            ->getJson('/api/v1/keuangan/pengadaan?status=menunggu_input');

        $responseMenunggu->assertStatus(200);
        $jsonMenunggu = $responseMenunggu->json();
        $this->assertGreaterThanOrEqual(1, $jsonMenunggu['total']);
        foreach ($jsonMenunggu['data'] as $item) {
            $this->assertEquals('menunggu_input', $item['status']);
        }
    }
}
