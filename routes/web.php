<?php

use App\Http\Controllers\Admin\MakController;
use App\Http\Controllers\Admin\PenggunaController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\RolePermissionController;
use App\Http\Controllers\Admin\UnitKerjaController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardAdminController;
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

    Route::get('/admin/dashboard', DashboardAdminController::class)->name('admin.dashboard');

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::resource('pengguna', PenggunaController::class)->except(['show', 'create', 'edit']);
        Route::resource('unit-kerja', UnitKerjaController::class)->parameters(['unit-kerja' => 'unit'])->except(['show', 'create', 'edit']);
        Route::resource('mak', MakController::class)->except(['show', 'create', 'edit']);
        Route::resource('role', RoleController::class)->except(['show', 'create', 'edit']);
        Route::get('role-permission', [RolePermissionController::class, 'index'])->name('role-permission.index');
        Route::put('role-permission/{role}', [RolePermissionController::class, 'update'])->name('role-permission.update');
    });

    Route::post('/logout', [AuthController::class, 'destroy'])->name('logout');
});
