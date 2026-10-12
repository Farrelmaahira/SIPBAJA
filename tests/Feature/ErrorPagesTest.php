<?php

namespace Tests\Feature;

use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Session\TokenMismatchException;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ErrorPagesTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Route::middleware('web')->group(function () {
            Route::get('/uji-error-403', fn () => abort(403));
            Route::get('/uji-error-419', function () {
                throw new TokenMismatchException('Sesi kedaluwarsa.');
            });
            Route::get('/uji-error-500', fn () => abort(500));
        });
    }

    public function test_halaman_tidak_ditemukan_menampilkan_error_404(): void
    {
        $response = $this->get('/rute-yang-tidak-ada');

        $response->assertStatus(404);
        $response->assertInertia(fn (Assert $page) => $page->component('Errors/404'));
    }

    public function test_akses_ditolak_menampilkan_error_403(): void
    {
        $response = $this->get('/uji-error-403');

        $response->assertStatus(403);
        $response->assertInertia(fn (Assert $page) => $page->component('Errors/403'));
    }

    public function test_sesi_kedaluwarsa_menampilkan_error_419(): void
    {
        $response = $this->get('/uji-error-419');

        $response->assertStatus(419);
        $response->assertInertia(fn (Assert $page) => $page->component('Errors/419'));
    }

    public function test_gangguan_server_menampilkan_error_500(): void
    {
        $response = $this->get('/uji-error-500');

        $response->assertStatus(500);
        $response->assertInertia(fn (Assert $page) => $page->component('Errors/500'));
    }

    public function test_gangguan_tak_terduga_menampilkan_error_500(): void
    {
        config(['app.debug' => false]);

        Route::middleware('web')->get('/uji-error-tak-terduga', function () {
            throw new \RuntimeException('Gangguan tak terduga.');
        });

        $response = $this->get('/uji-error-tak-terduga');

        $response->assertStatus(500);
        $response->assertInertia(fn (Assert $page) => $page->component('Errors/500'));
    }

    public function test_batas_laju_meneruskan_header_retry_after(): void
    {
        Route::middleware('web')->get('/uji-error-429', function () {
            throw new ThrottleRequestsException('Terlalu sering.', null, ['Retry-After' => 60]);
        });

        $response = $this->get('/uji-error-429');

        $response->assertStatus(429);
        $response->assertHeader('Retry-After', '60');
        $response->assertInertia(fn (Assert $page) => $page->component('Errors/429'));
    }

    public function test_validasi_gagal_tetap_kembali_tanpa_error_page(): void
    {
        $response = $this->post(route('login.store'), [
            'login' => '',
            'password' => 'pendek',
        ]);

        $response->assertRedirect();
        $response->assertSessionHasErrors(['login', 'password']);
    }
}
