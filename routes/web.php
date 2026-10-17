<?php

use App\Http\Controllers\Admin\MakController;
use App\Http\Controllers\Admin\PenggunaController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\RolePermissionController;
use App\Http\Controllers\Admin\UnitKerjaController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardAdminController;
use App\Http\Controllers\DashboardBidang2Controller;
use App\Http\Controllers\DashboardKeuanganController;
use App\Http\Controllers\DashboardPemohonController;
use App\Http\Controllers\DashboardPerencanaanController;
use App\Http\Controllers\DashboardPerlengkapanController;
use App\Http\Controllers\DashboardPpbjController;
use App\Http\Controllers\DashboardPpController;
use App\Http\Controllers\DashboardPpkController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('/', [AuthController::class, 'show'])->name('login');
    Route::post('/login', [AuthController::class, 'store'])->name('login.store');
});

Route::middleware('auth')->group(function () {
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('dashboard', DashboardAdminController::class)->name('dashboard');
        Route::resource('pengguna', PenggunaController::class)->except(['show', 'create', 'edit']);
        Route::resource('unit-kerja', UnitKerjaController::class)->parameters(['unit-kerja' => 'unit'])->except(['show', 'create', 'edit']);
        Route::resource('mak', MakController::class)->except(['show', 'create', 'edit']);
        Route::resource('role', RoleController::class)->except(['show', 'create', 'edit']);
        Route::get('role-permission', [RolePermissionController::class, 'index'])->name('role-permission.index');
        Route::put('role-permission/{role}', [RolePermissionController::class, 'update'])->name('role-permission.update');
    });

    Route::get('/pemohon/dashboard', DashboardPemohonController::class)->name('pemohon.dashboard');
    Route::get('/perencanaan/dashboard', DashboardPerencanaanController::class)->name('perencanaan.dashboard');
    Route::get('/bidang-2/dashboard', DashboardBidang2Controller::class)->name('bidang2.dashboard');
    Route::get('/ppbj/dashboard', DashboardPpbjController::class)->name('ppbj.dashboard');
    Route::get('/pp/dashboard', DashboardPpController::class)->name('pp.dashboard');
    Route::get('/ppk/dashboard', DashboardPpkController::class)->name('ppk.dashboard');
    Route::get('/perlengkapan/dashboard', DashboardPerlengkapanController::class)->name('perlengkapan.dashboard');
    Route::get('/keuangan/dashboard', DashboardKeuanganController::class)->name('keuangan.dashboard');

    Route::post('/logout', [AuthController::class, 'destroy'])->name('logout');
});
