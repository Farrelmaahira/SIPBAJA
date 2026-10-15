<?php

use App\Http\Controllers\Admin\PenggunaController;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('guest')->group(function () {
    Route::get('/', [AuthController::class, 'show'])->name('login');
    Route::post('/login', [AuthController::class, 'store'])->name('login.store');
});

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    Route::get('/admin/dashboard', function () {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                ['label' => 'Total Pengguna', 'value' => 24, 'unit' => 'Akun', 'variant' => 'primary'],
                ['label' => 'Unit Terdaftar', 'value' => 8, 'unit' => 'Unit', 'variant' => 'info'],
                ['label' => 'MAK Aktif', 'value' => 4, 'unit' => 'MAK', 'variant' => 'success'],
            ],
            'recentUsers' => [
                ['id' => 1, 'nama' => 'Dr. Ahmad Farhan', 'email' => 'farhan@pnj.ac.id', 'role' => 'Perencanaan', 'unit' => 'Pusat Perencanaan', 'status' => 'aktif', 'tanggal' => '14 Mei 2026'],
                ['id' => 2, 'nama' => 'Siti Nurhaliza, M.T.', 'email' => 'siti@pnj.ac.id', 'role' => 'Pemohon', 'unit' => 'Teknik Informatika', 'status' => 'aktif', 'tanggal' => '14 Mei 2026'],
                ['id' => 3, 'nama' => 'Bambang Sudarsono', 'email' => 'bambang@pnj.ac.id', 'role' => 'PPK', 'unit' => 'Pengadaan Kampus', 'status' => 'aktif', 'tanggal' => '13 Mei 2026'],
                ['id' => 4, 'nama' => 'Rina Marlina, S.E.', 'email' => 'rina@pnj.ac.id', 'role' => 'Keuangan', 'unit' => 'Bagian Keuangan', 'status' => 'nonaktif', 'tanggal' => '10 Mei 2026'],
            ],
        ]);
    })->name('admin.dashboard');

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::resource('pengguna', PenggunaController::class)->except(['show', 'create', 'edit']);
    });

    Route::post('/logout', [AuthController::class, 'destroy'])->name('logout');
});
