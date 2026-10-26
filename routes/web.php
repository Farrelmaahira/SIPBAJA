<?php

use App\Http\Controllers\Admin\DashboardAdminController;
use App\Http\Controllers\Admin\MakController;
use App\Http\Controllers\Admin\PenggunaController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\RolePermissionController;
use App\Http\Controllers\Admin\UnitKerjaController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardBidang2Controller;
use App\Http\Controllers\DashboardKeuanganController;
use App\Http\Controllers\DashboardPemohonController;
use App\Http\Controllers\DashboardPerencanaanController;
use App\Http\Controllers\DashboardPerlengkapanController;
use App\Http\Controllers\DashboardPpController;
use App\Http\Controllers\DashboardPpkController;
use App\Http\Controllers\PPBJ\DashboardPpbjController;
use App\Http\Controllers\PPBJ\PermohonanController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('/', [AuthController::class, 'show'])->name('login');
    Route::post('/login', [AuthController::class, 'store'])->name('login.store');
});

Route::middleware('auth')->group(function () {
    Route::prefix('admin')->name('admin.')->middleware('role:Admin')->group(function () {
        Route::get('dashboard', DashboardAdminController::class)->name('dashboard');
        Route::resource('pengguna', PenggunaController::class)->except(['show', 'create', 'edit']);
        Route::resource('unit-kerja', UnitKerjaController::class)->parameters(['unit-kerja' => 'unit'])->except(['show', 'create', 'edit']);
        Route::resource('mak', MakController::class)->except(['show', 'create', 'edit']);
        Route::resource('role', RoleController::class)->except(['show', 'create', 'edit']);
        Route::get('role-permission', [RolePermissionController::class, 'index'])->name('role-permission.index');
        Route::put('role-permission/{role}', [RolePermissionController::class, 'update'])->name('role-permission.update');
    });

    Route::prefix('pemohon')->name('pemohon.')->middleware('role:Pemohon')->group(function () {
        Route::get('dashboard', DashboardPemohonController::class)->name('dashboard');
    });

    Route::prefix('perencanaan')->name('perencanaan.')->middleware('role:Perencanaan')->group(function () {
        Route::get('dashboard', DashboardPerencanaanController::class)->name('dashboard');
    });

    Route::prefix('bidang-2')->name('bidang2.')->middleware('role:Bidang 2')->group(function () {
        Route::get('dashboard', DashboardBidang2Controller::class)->name('dashboard');
    });

    Route::prefix('ppbj')->name('ppbj.')->middleware('role:PPBJ')->group(function () {
        Route::get('dashboard', DashboardPpbjController::class)->name('dashboard');
        Route::resource('permohonan', PermohonanController::class);
    });

    Route::prefix('pp')->name('pp.')->middleware('role:PP')->group(function () {
        Route::get('dashboard', DashboardPpController::class)->name('dashboard');
    });

    Route::prefix('ppk')->name('ppk.')->middleware('role:PPK')->group(function () {
        Route::get('dashboard', DashboardPpkController::class)->name('dashboard');
    });

    Route::prefix('perlengkapan')->name('perlengkapan.')->middleware('role:Perlengkapan')->group(function () {
        Route::get('dashboard', DashboardPerlengkapanController::class)->name('dashboard');
    });

    Route::prefix('keuangan')->name('keuangan.')->middleware('role:Keuangan')->group(function () {
        Route::get('dashboard', DashboardKeuanganController::class)->name('dashboard');
    });

    Route::match(['get', 'post'], '/logout', [AuthController::class, 'destroy'])->name('logout');
});
