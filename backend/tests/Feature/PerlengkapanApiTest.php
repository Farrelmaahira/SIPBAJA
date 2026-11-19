<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\MasterReferenceSeeder;
use Database\Seeders\RbacSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PerlengkapanApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([RoleSeeder::class, UserSeeder::class, RbacSeeder::class, MasterReferenceSeeder::class]);
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
}
