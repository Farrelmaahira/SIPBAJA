<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Database\Seeders\RbacSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class InertiaSharedDataTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([RoleSeeder::class, UserSeeder::class, RbacSeeder::class]);
    }

    public function test_guest_memiliki_auth_user_bernilai_null(): void
    {
        $response = $this->get(route('login'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->where('auth.user', null)
        );
    }

    public function test_user_terautentikasi_menerima_data_permissions_di_props_inertia(): void
    {
        $pemohon = User::where('email', 'jurusan@pnj.ac.id')->firstOrFail();

        $response = $this->actingAs($pemohon)->get(route('pemohon.dashboard'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->has('auth.user', fn (Assert $user) => $user
                ->where('email', 'jurusan@pnj.ac.id')
                ->where('role', 'Pemohon')
                ->has('permissions')
                ->where('permissions', $pemohon->getPermissionCodes())
                ->etc()
            )
        );
    }
}
