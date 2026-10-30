<?php

namespace Tests\Unit\Services;

use App\Services\AuthService;
use Database\Seeders\RoleSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class AuthServiceTest extends TestCase
{
    use RefreshDatabase;

    protected AuthService $authService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([RoleSeeder::class, UserSeeder::class]);
        $this->authService = app(AuthService::class);
    }

    public function test_login_berhasil_mengembalikan_user(): void
    {
        $user = $this->authService->attemptLogin('admin@pnj.ac.id', 'password123', '127.0.0.1');

        $this->assertSame('admin@pnj.ac.id', $user->email);
        $this->assertAuthenticatedAs($user);
    }

    public function test_login_gagal_pada_kredensial_salah(): void
    {
        $this->expectException(ValidationException::class);

        $this->authService->attemptLogin('admin@pnj.ac.id', 'salahpassword', '127.0.0.1');
    }

    public function test_login_dibatasi_setelah_lima_kali_gagal(): void
    {
        for ($i = 0; $i < 5; $i++) {
            try {
                $this->authService->attemptLogin('admin@pnj.ac.id', 'salahpassword', '127.0.0.1');
            } catch (ValidationException) {
            }
        }

        try {
            $this->authService->attemptLogin('admin@pnj.ac.id', 'password123', '127.0.0.1');
            $this->fail('Seharusnya kena throttle.');
        } catch (ValidationException $e) {
            $this->assertStringContainsString('Terlalu banyak', $e->errors()['login'][0]);
        }
    }
}
