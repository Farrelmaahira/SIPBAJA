<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SanctumAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_api_returns_401(): void
    {
        $response = $this->getJson('/api/user');
        $response->assertStatus(401);
    }

    public function test_authenticated_api_returns_user(): void
    {
        $user = User::factory()->create();
        $response = $this->actingAs($user, 'sanctum')->getJson('/api/user');
        $response->assertStatus(200)->assertJsonPath('id', $user->id);
    }

    public function test_authenticated_api_returns_user_with_role(): void
    {
        $role = Role::factory()->create(['nama' => 'Admin']);
        $user = User::factory()->create(['role_id' => $role->id]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/user');

        $response->assertStatus(200)
            ->assertJsonPath('id', $user->id);
        $this->assertTrue(isset($response->json()['role']) || isset($response->json()['Role']));
    }

    public function test_cors_headers_are_returned_for_allowed_origin(): void
    {
        $response = $this->withHeaders([
            'Origin' => 'http://localhost:5173',
        ])->getJson('/api/user');

        $response->assertHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
        $response->assertHeader('Access-Control-Allow-Credentials', 'true');
    }
}
