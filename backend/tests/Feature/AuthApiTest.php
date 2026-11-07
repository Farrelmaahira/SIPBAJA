<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_successful_login_with_email_returns_user_and_role(): void
    {
        $role = Role::factory()->create(['nama' => 'Admin']);
        $user = User::factory()->create([
            'email' => 'admin@example.com',
            'password' => Hash::make('password123'),
            'role_id' => $role->id,
        ]);

        $response = $this->postJson('/api/v1/login', [
            'login' => 'admin@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'user',
                'role',
            ])
            ->assertJsonPath('role', 'admin')
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.email', 'admin@example.com');

        $this->assertAuthenticatedAs($user);
    }

    public function test_successful_login_with_username_returns_user_and_role(): void
    {
        $role = Role::factory()->create(['nama' => 'Pejabat Pengadaan']);
        $user = User::factory()->create([
            'nama' => 'pejabat1',
            'password' => Hash::make('password123'),
            'role_id' => $role->id,
        ]);

        $response = $this->postJson('/api/v1/login', [
            'login' => 'pejabat1',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'user',
                'role',
            ])
            ->assertJsonPath('role', 'pejabatpengadaan')
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.nama', 'pejabat1');

        $this->assertAuthenticatedAs($user);
    }

    public function test_login_with_invalid_password_returns_422(): void
    {
        $user = User::factory()->create([
            'email' => 'user@example.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/v1/login', [
            'login' => 'user@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['login']);

        $this->assertGuest();
    }

    public function test_login_validation_errors_for_empty_fields(): void
    {
        $response = $this->postJson('/api/v1/login', [
            'login' => '',
            'password' => 'short',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['login', 'password']);

        $this->assertGuest();
    }

    public function test_authenticated_user_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/logout');

        $response->assertStatus(204);
        $this->assertGuest('web');
    }

    public function test_login_then_logout_cycle(): void
    {
        $role = Role::factory()->create(['nama' => 'Admin']);
        $user = User::factory()->create([
            'email' => 'admin@example.com',
            'password' => Hash::make('password123'),
            'role_id' => $role->id,
        ]);

        $loginResponse = $this->postJson('/api/v1/login', [
            'login' => 'admin@example.com',
            'password' => 'password123',
        ]);
        $loginResponse->assertStatus(200);
        $this->assertAuthenticatedAs($user);

        $logoutResponse = $this->postJson('/api/v1/logout');
        $logoutResponse->assertStatus(204);
        $this->assertGuest('web');
    }

    public function test_stateful_spa_login_regenerates_session(): void
    {
        $role = Role::factory()->create(['nama' => 'Admin']);
        $user = User::factory()->create([
            'email' => 'admin@example.com',
            'password' => Hash::make('password123'),
            'role_id' => $role->id,
        ]);

        $response = $this->withHeaders([
            'Origin' => 'http://localhost:5173',
            'Referer' => 'http://localhost:5173/',
        ])->postJson('/api/v1/login', [
            'login' => 'admin@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('role', 'admin')
            ->assertJsonPath('user.id', $user->id);

        $this->assertAuthenticatedAs($user);
    }

    public function test_unauthenticated_logout_returns_401(): void
    {
        $response = $this->postJson('/api/v1/logout');

        $response->assertStatus(401);
    }
}
