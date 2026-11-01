<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Carbon\Carbon;
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

    public function test_login_returns_bearer_token_and_expires_at(): void
    {
        $role = Role::factory()->create(['nama' => 'Admin']);
        $user = User::factory()->create([
            'email' => 'admin@test.com',
            'password' => bcrypt('password123'),
            'role_id' => $role->id,
        ]);

        $response = $this->postJson('/api/v1/login', [
            'login' => 'admin@test.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'user',
                'role',
                'token',
                'token_type',
                'expires_at',
            ])
            ->assertJsonPath('token_type', 'Bearer');

        $this->assertNotEmpty($response->json('token'));
    }

    public function test_login_with_remember_me_sets_30_days_expiry(): void
    {
        $role = Role::factory()->create(['nama' => 'Admin']);
        $user = User::factory()->create([
            'email' => 'admin@test.com',
            'password' => bcrypt('password123'),
            'role_id' => $role->id,
        ]);

        $response = $this->postJson('/api/v1/login', [
            'login' => 'admin@test.com',
            'password' => 'password123',
            'remember' => true,
        ]);

        $response->assertStatus(200);
        $expiresAt = Carbon::parse($response->json('expires_at'));
        $daysDiff = (int) round(now()->diffInDays($expiresAt, false));

        $this->assertGreaterThanOrEqual(29, $daysDiff);
        $this->assertLessThanOrEqual(31, $daysDiff);
    }

    public function test_login_without_remember_me_sets_1_day_expiry(): void
    {
        $role = Role::factory()->create(['nama' => 'Admin']);
        $user = User::factory()->create([
            'email' => 'admin@test.com',
            'password' => bcrypt('password123'),
            'role_id' => $role->id,
        ]);

        $response = $this->postJson('/api/v1/login', [
            'login' => 'admin@test.com',
            'password' => 'password123',
            'remember' => false,
        ]);

        $response->assertStatus(200);
        $expiresAt = Carbon::parse($response->json('expires_at'));
        $hoursDiff = (int) round(now()->diffInHours($expiresAt, false));

        $this->assertGreaterThanOrEqual(23, $hoursDiff);
        $this->assertLessThanOrEqual(25, $hoursDiff);
    }

    public function test_bearer_token_authenticates_and_respects_rbac(): void
    {
        $adminRole = Role::factory()->create(['nama' => 'Admin']);
        $admin = User::factory()->create(['role_id' => $adminRole->id]);

        $pemohonRole = Role::factory()->create(['nama' => 'Pemohon']);
        $pemohon = User::factory()->create(['role_id' => $pemohonRole->id]);

        $adminToken = $admin->createToken('test_token')->plainTextToken;
        $pemohonToken = $pemohon->createToken('test_token')->plainTextToken;

        // Admin token can access Admin Dashboard
        $adminResponse = $this->withHeaders([
            'Authorization' => 'Bearer '.$adminToken,
        ])->getJson('/api/v1/admin/dashboard');
        $adminResponse->assertStatus(200);

        $this->flushSession();
        $this->app['auth']->forgetGuards();

        // Pemohon token CANNOT access Admin Dashboard (403 Forbidden by EnsureUserHasRole)
        $forbiddenResponse = $this->withHeaders([
            'Authorization' => 'Bearer '.$pemohonToken,
        ])->getJson('/api/v1/admin/dashboard');
        $forbiddenResponse->assertStatus(403);

        $this->flushSession();
        $this->app['auth']->forgetGuards();

        // Pemohon token CAN access Pemohon Dashboard
        $pemohonResponse = $this->withHeaders([
            'Authorization' => 'Bearer '.$pemohonToken,
        ])->getJson('/api/v1/pemohon/dashboard');
        $pemohonResponse->assertStatus(200);
    }

    public function test_logout_with_bearer_token_revokes_token(): void
    {
        $role = Role::factory()->create(['nama' => 'Admin']);
        $user = User::factory()->create([
            'email' => 'admin@test.com',
            'password' => bcrypt('password123'),
            'role_id' => $role->id,
        ]);

        $loginResponse = $this->postJson('/api/v1/login', [
            'login' => 'admin@test.com',
            'password' => 'password123',
        ]);
        $token = $loginResponse->json('token');

        $this->flushSession();
        $this->app['auth']->forgetGuards();

        // Can access with Bearer token
        $accessResponse = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
        ])->getJson('/api/user');
        $accessResponse->assertStatus(200);

        // Logout with Bearer token
        $logoutResponse = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
        ])->postJson('/api/v1/logout');
        $logoutResponse->assertStatus(204);

        $this->flushSession();
        $this->app['auth']->forgetGuards();

        // Token should now be revoked, returning 401
        $subsequentResponse = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
        ])->getJson('/api/user');
        $subsequentResponse->assertStatus(401);
    }
}
