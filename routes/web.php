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
use App\Http\Controllers\PerencanaanController;
use App\Http\Controllers\PpController;
use App\Http\Controllers\PpkController;
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
        Route::get('dashboard', [PerencanaanController::class, 'dashboard'])->name('dashboard');
        Route::get('pengajuan', [PerencanaanController::class, 'index'])->name('pengajuan.index');
        Route::get('pengajuan/{permohonan}', [PerencanaanController::class, 'show'])->name('pengajuan.show');
        Route::post('pengajuan/{permohonan}/approve', [PerencanaanController::class, 'approve'])->name('pengajuan.approve');
        Route::post('pengajuan/{permohonan}/reject', [PerencanaanController::class, 'reject'])->name('pengajuan.reject');
        Route::post('pengajuan/{permohonan}/kirim-pengadaan', [PerencanaanController::class, 'kirimPengadaan'])->name('pengajuan.kirimPengadaan');
        Route::get('jenis-mak', [PerencanaanController::class, 'jenisMak'])->name('mak.index');
        Route::post('jenis-mak', [PerencanaanController::class, 'storeMak'])->name('mak.store');
        Route::put('jenis-mak/{mak}', [PerencanaanController::class, 'updateMak'])->name('mak.update');
        Route::delete('jenis-mak/{mak}', [PerencanaanController::class, 'destroyMak'])->name('mak.destroy');
        Route::get('rkakl', [PerencanaanController::class, 'rkakl'])->name('rkakl.index');
        Route::post('rkakl', [PerencanaanController::class, 'storeRkakl'])->name('rkakl.store');
        Route::get('notifikasi', [PerencanaanController::class, 'notifikasi'])->name('notifikasi.index');
        Route::post('notifikasi/read-all', [PerencanaanController::class, 'markAllRead'])->name('notifikasi.readAll');
        Route::post('notifikasi/{notification}/read', [PerencanaanController::class, 'markOneRead'])->name('notifikasi.readOne');
        Route::get('profil', [PerencanaanController::class, 'profil'])->name('profil.index');
    });

    Route::prefix('bidang-2')->name('bidang2.')->middleware('role:Bidang 2')->group(function () {
        Route::get('dashboard', DashboardBidang2Controller::class)->name('dashboard');
    });

    Route::prefix('ppbj')->name('ppbj.')->middleware('role:PPBJ')->group(function () {
        Route::get('dashboard', DashboardPpbjController::class)->name('dashboard');
    });

    Route::prefix('pp')->name('pp.')->middleware('role:PP')->group(function () {
        Route::get('dashboard', [PpController::class, 'dashboard'])->name('dashboard');
        Route::get('pengajuan', [PpController::class, 'index'])->name('pengajuan.index');
        Route::get('pengajuan/{pengadaan}/review', [PpController::class, 'review'])->name('pengajuan.review');
        Route::post('pengajuan/{pengadaan}/approve', [PpController::class, 'approve'])->name('pengajuan.approve');
        Route::post('pengajuan/{pengadaan}/reject', [PpController::class, 'reject'])->name('pengajuan.reject');
        Route::get('pengajuan/{pengadaan}', [PpController::class, 'show'])->name('pengajuan.show');
        Route::get('notifikasi', [PpController::class, 'notifikasi'])->name('notifikasi.index');
        Route::post('notifikasi/read-all', [PpController::class, 'markAllRead'])->name('notifikasi.readAll');
        Route::post('notifikasi/{notification}/read', [PpController::class, 'markOneRead'])->name('notifikasi.readOne');
        Route::get('profil', [PpController::class, 'profil'])->name('profil.index');
    });

    Route::prefix('ppk')->name('ppk.')->middleware('role:PPK')->group(function () {
        Route::get('dashboard', [PpkController::class, 'dashboard'])->name('dashboard');
        Route::get('pengajuan', [PpkController::class, 'index'])->name('pengajuan.index');
        Route::get('pengajuan/{pengadaan}/review', [PpkController::class, 'review'])->name('pengajuan.review');
        Route::post('pengajuan/{pengadaan}/approve', [PpkController::class, 'approve'])->name('pengajuan.approve');
        Route::post('pengajuan/{pengadaan}/reject', [PpkController::class, 'reject'])->name('pengajuan.reject');
        Route::get('pengajuan/{pengadaan}/pembayaran', [PpkController::class, 'pembayaran'])->name('pengajuan.pembayaran');
        Route::post('pengajuan/{pengadaan}/pembayaran/approve', [PpkController::class, 'approvePembayaran'])->name('pengajuan.pembayaran.approve');
        Route::post('pengajuan/{pengadaan}/pembayaran/reject', [PpkController::class, 'rejectPembayaran'])->name('pengajuan.pembayaran.reject');
        Route::get('pengajuan/{pengadaan}', [PpkController::class, 'show'])->name('pengajuan.show');
        Route::get('notifikasi', [PpkController::class, 'notifikasi'])->name('notifikasi.index');
        Route::post('notifikasi/read-all', [PpkController::class, 'markAllRead'])->name('notifikasi.readAll');
        Route::post('notifikasi/{notification}/read', [PpkController::class, 'markOneRead'])->name('notifikasi.readOne');
        Route::get('profil', [PpkController::class, 'profil'])->name('profil.index');
    });

    Route::prefix('perlengkapan')->name('perlengkapan.')->middleware('role:Perlengkapan')->group(function () {
        Route::get('dashboard', DashboardPerlengkapanController::class)->name('dashboard');
    });

    Route::prefix('keuangan')->name('keuangan.')->middleware('role:Keuangan')->group(function () {
        Route::get('dashboard', DashboardKeuanganController::class)->name('dashboard');
    });

    Route::get('/pp/dokumen/{id}/download', function (string $id) {
        $content = "%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >> endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer << /Size 4 /Root 1 0 R >>\nstartxref\n190\n%%EOF";

        return response($content, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => "attachment; filename=\"Dokumen_SIPBAJA_{$id}.pdf\"",
        ]);
    })->name('dokumen.download');

    Route::post('/logout', [AuthController::class, 'destroy'])->name('logout');
});
