<?php

use App\Http\Controllers\Admin\DashboardAdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardBidang2Controller;
use App\Http\Controllers\DashboardKeuanganController;
use App\Http\Controllers\DashboardPemohonController;
use App\Http\Controllers\DashboardPerlengkapanController;
use App\Http\Controllers\PerencanaanController;
use App\Http\Controllers\PPBJ\DashboardPpbjController;
use App\Http\Controllers\PpController;
use App\Http\Controllers\PpkController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return response()->json($request->user()->load('Role'));
});

Route::prefix('v1')->group(function () {
    Route::middleware('guest')->group(function () {
        Route::post('login', [AuthController::class, 'store'])->name('api.login');
    });

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'destroy'])->name('api.logout');

        Route::prefix('admin')->middleware('role:Admin')->group(function () {
            Route::get('dashboard', DashboardAdminController::class)->name('api.admin.dashboard');
        });

        Route::prefix('pemohon')->middleware('role:Pemohon')->group(function () {
            Route::get('dashboard', DashboardPemohonController::class)->name('api.pemohon.dashboard');
        });

        Route::prefix('perencanaan')->middleware('role:Perencanaan')->group(function () {
            Route::get('dashboard', [PerencanaanController::class, 'dashboard'])->name('api.perencanaan.dashboard');
        });

        Route::prefix('bidang-2')->middleware('role:Bidang 2')->group(function () {
            Route::get('dashboard', DashboardBidang2Controller::class)->name('api.bidang2.dashboard');
        });

        Route::prefix('ppbj')->middleware('role:PPBJ')->group(function () {
            Route::get('dashboard', DashboardPpbjController::class)->name('api.ppbj.dashboard');
        });

        Route::prefix('pp')->middleware('role:PP')->group(function () {
            Route::get('dashboard', [PpController::class, 'dashboard'])->name('api.pp.dashboard');
        });

        Route::prefix('ppk')->middleware('role:PPK')->group(function () {
            Route::get('dashboard', [PpkController::class, 'dashboard'])->name('api.ppk.dashboard');
        });

        Route::prefix('perlengkapan')->middleware('role:Perlengkapan')->group(function () {
            Route::get('dashboard', DashboardPerlengkapanController::class)->name('api.perlengkapan.dashboard');
        });

        Route::prefix('keuangan')->middleware('role:Keuangan')->group(function () {
            Route::get('dashboard', DashboardKeuanganController::class)->name('api.keuangan.dashboard');
        });
    });
});
