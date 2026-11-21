<?php

use App\Http\Controllers\Admin\DashboardAdminController;
use App\Http\Controllers\Admin\MakController;
use App\Http\Controllers\Admin\MetodePengadaanController;
use App\Http\Controllers\Admin\PenggunaController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\RolePermissionController;
use App\Http\Controllers\Admin\UnitKerjaController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Bidang2\DashboardBidang2Controller;
use App\Http\Controllers\Bidang2\PengajuanBidang2Controller;
use App\Http\Controllers\Bidang2\RkaklBidang2Controller;
use App\Http\Controllers\Keuangan\DashboardKeuanganController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Pemohon\DashboardPemohonController;
use App\Http\Controllers\Pemohon\PermohonanPemohonController;
use App\Http\Controllers\Perencanaan\DashboardPerencanaanController;
use App\Http\Controllers\Perencanaan\PengajuanPerencanaanController;
use App\Http\Controllers\Perencanaan\PerencanaanMakController;
use App\Http\Controllers\Perencanaan\PerencanaanProfilController;
use App\Http\Controllers\Perencanaan\PerencanaanRkaklController;
use App\Http\Controllers\Perlengkapan\DashboardPerlengkapanController;
use App\Http\Controllers\Pp\DashboardPpController;
use App\Http\Controllers\Pp\PpController;
use App\Http\Controllers\PPBJ\DashboardPpbjController;
use App\Http\Controllers\PPBJ\PengadaanController;
use App\Http\Controllers\PPBJ\PermohonanController as PpbjPermohonanController;
use App\Http\Controllers\Ppk\DashboardPpkController;
use App\Http\Controllers\Ppk\PermohonanPpkController;
use App\Http\Controllers\Ppk\PpkController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    $user = $request->user();
    if (! ($user->isActive ?? true)) {
        abort(403, 'Akun Anda telah dinonaktifkan. Silakan hubungi administrator.');
    }

    return response()->json($user->load('Role'));
});

Route::prefix('v1')->group(function () {
    Route::middleware('guest')->group(function () {
        Route::post('login', [AuthController::class, 'store'])->name('api.login');
    });

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'destroy'])->name('api.logout');

        // Centralized Notification Routes
        Route::prefix('notifications')->group(function () {
            Route::get('/', [NotificationController::class, 'index'])->name('api.notifications.index');
            Route::post('/', [NotificationController::class, 'store'])->name('api.notifications.store');
            Route::get('summary', [NotificationController::class, 'summary'])->name('api.notifications.summary');
            Route::get('unread-count', [NotificationController::class, 'unreadCount'])->name('api.notifications.unreadCount');
            Route::post('read-all', [NotificationController::class, 'markAllRead'])->name('api.notifications.readAll');
            Route::post('{notification}/read', [NotificationController::class, 'markOneRead'])->name('api.notifications.readOne');
            Route::delete('{notification}', [NotificationController::class, 'destroy'])->name('api.notifications.destroy');
        });

        Route::prefix('notifikasi')->group(function () {
            Route::get('/', [NotificationController::class, 'index'])->name('api.notifikasi.index');
            Route::post('/', [NotificationController::class, 'store'])->name('api.notifikasi.store');
            Route::get('summary', [NotificationController::class, 'summary'])->name('api.notifikasi.summary');
            Route::get('unread-count', [NotificationController::class, 'unreadCount'])->name('api.notifikasi.unreadCount');
            Route::post('read-all', [NotificationController::class, 'markAllRead'])->name('api.notifikasi.readAll');
            Route::post('{notification}/read', [NotificationController::class, 'markOneRead'])->name('api.notifikasi.readOne');
            Route::delete('{notification}', [NotificationController::class, 'destroy'])->name('api.notifikasi.destroy');
        });

        // Admin Routes
        Route::prefix('admin')->middleware('role:Admin')->group(function () {
            Route::get('dashboard', DashboardAdminController::class)->name('api.admin.dashboard');
            Route::apiResource('pengguna', PenggunaController::class)->names('api.admin.pengguna');
            Route::post('pengguna/{pengguna}/deactivate', [PenggunaController::class, 'deactivate'])->name('api.admin.pengguna.deactivate');
            Route::post('pengguna/{pengguna}/activate', [PenggunaController::class, 'activate'])->name('api.admin.pengguna.activate');
            Route::post('pengguna/{pengguna}/toggle-status', [PenggunaController::class, 'toggleStatus'])->name('api.admin.pengguna.toggle-status');
            Route::apiResource('unit-kerja', UnitKerjaController::class)->parameters(['unit-kerja' => 'unit'])->names('api.admin.unit-kerja');
            Route::post('unit-kerja/{unit}/toggle-status', [UnitKerjaController::class, 'toggleStatus'])->name('api.admin.unit-kerja.toggle-status');
            Route::post('unit-kerja/{unit}/deactivate', [UnitKerjaController::class, 'deactivate'])->name('api.admin.unit-kerja.deactivate');
            Route::post('unit-kerja/{unit}/activate', [UnitKerjaController::class, 'activate'])->name('api.admin.unit-kerja.activate');
            Route::apiResource('mak', MakController::class)->names('api.admin.mak');
            Route::post('mak/{mak}/toggle-status', [MakController::class, 'toggleStatus'])->name('api.admin.mak.toggle-status');
            Route::post('mak/{mak}/deactivate', [MakController::class, 'deactivate'])->name('api.admin.mak.deactivate');
            Route::post('mak/{mak}/activate', [MakController::class, 'activate'])->name('api.admin.mak.activate');
            Route::apiResource('role', RoleController::class)->names('api.admin.role');
            Route::post('role/{role}/toggle-status', [RoleController::class, 'toggleStatus'])->name('api.admin.role.toggle-status');
            Route::post('role/{role}/deactivate', [RoleController::class, 'deactivate'])->name('api.admin.role.deactivate');
            Route::post('role/{role}/activate', [RoleController::class, 'activate'])->name('api.admin.role.activate');
            Route::apiResource('metode-pengadaan', MetodePengadaanController::class)->parameters(['metode-pengadaan' => 'metode_pengadaan'])->except(['destroy'])->names('api.admin.metode-pengadaan');
            Route::post('metode-pengadaan/{metode_pengadaan}/toggle-status', [MetodePengadaanController::class, 'toggleStatus'])->name('api.admin.metode-pengadaan.toggle-status');
            Route::post('metode-pengadaan/{metode_pengadaan}/deactivate', [MetodePengadaanController::class, 'deactivate'])->name('api.admin.metode-pengadaan.deactivate');
            Route::post('metode-pengadaan/{metode_pengadaan}/activate', [MetodePengadaanController::class, 'activate'])->name('api.admin.metode-pengadaan.activate');
            Route::get('role-permission', [RolePermissionController::class, 'index'])->name('api.admin.role-permission.index');
            Route::put('role-permission/{role}', [RolePermissionController::class, 'update'])->name('api.admin.role-permission.update');
        });

        // Pemohon Routes
        Route::prefix('pemohon')->middleware('role:Pemohon')->group(function () {
            Route::get('dashboard', DashboardPemohonController::class)->name('api.pemohon.dashboard');
            Route::get('permohonan', [PermohonanPemohonController::class, 'index'])->name('api.pemohon.permohonan.index');
            Route::get('permohonan/create', [PermohonanPemohonController::class, 'create'])->name('api.pemohon.permohonan.create');
            Route::get('permohonan/{permohonan}', [PermohonanPemohonController::class, 'show'])->name('api.pemohon.permohonan.show');
            Route::delete('permohonan/{permohonan}', [PermohonanPemohonController::class, 'destroy'])->name('api.pemohon.permohonan.destroy');
            Route::post('permohonan', [PermohonanPemohonController::class, 'store'])->name('api.pemohon.permohonan.store');
            Route::post('permohonan/{permohonan}/revisi', [PermohonanPemohonController::class, 'update'])->name('api.pemohon.permohonan.revisi');
            Route::get('permohonan/{permohonan}/dokumen', [PermohonanPemohonController::class, 'downloadDokumen'])->name('api.pemohon.permohonan.dokumen.download');
        });

        // Perencanaan Routes
        Route::prefix('perencanaan')->middleware('role:Perencanaan')->group(function () {
            Route::get('dashboard', DashboardPerencanaanController::class)->name('api.perencanaan.dashboard');
            Route::get('pengajuan', [PengajuanPerencanaanController::class, 'index'])->name('api.perencanaan.pengajuan.index');
            Route::get('pengajuan/{permohonan}', [PengajuanPerencanaanController::class, 'show'])->name('api.perencanaan.pengajuan.show');
            Route::get('pengajuan/{permohonan}/dokumen', [PengajuanPerencanaanController::class, 'downloadDokumen'])->name('api.perencanaan.pengajuan.dokumen.download');
            Route::post('pengajuan/{permohonan}/approve', [PengajuanPerencanaanController::class, 'approve'])->name('api.perencanaan.pengajuan.approve');
            Route::post('pengajuan/{permohonan}/reject', [PengajuanPerencanaanController::class, 'reject'])->name('api.perencanaan.pengajuan.reject');
            // @deprecated Penerusan ke PPBJ berjalan otomatis setelah Bidang 2 dan PPK menyetujui secara paralel
            Route::post('pengajuan/{permohonan}/kirim-pengadaan', [PengajuanPerencanaanController::class, 'kirimPengadaan'])->name('api.perencanaan.pengajuan.kirimPengadaan');
            Route::get('pengadaan/{pengadaan}', [PengajuanPerencanaanController::class, 'showPengadaan'])->name('api.perencanaan.pengadaan.show');
            Route::put('pengadaan/{pengadaan}/jenis-mak', [PengajuanPerencanaanController::class, 'updateJenisMakPengadaan'])->name('api.perencanaan.pengadaan.jenisMak.update');
            Route::get('jenis-mak', [PerencanaanMakController::class, 'index'])->name('api.perencanaan.mak.index');
            Route::post('jenis-mak', [PerencanaanMakController::class, 'store'])->name('api.perencanaan.mak.store');
            Route::put('jenis-mak/{mak}', [PerencanaanMakController::class, 'update'])->name('api.perencanaan.mak.update');
            Route::delete('jenis-mak/{mak}', [PerencanaanMakController::class, 'destroy'])->name('api.perencanaan.mak.destroy');
            Route::get('rkakl/dokumen', [PerencanaanRkaklController::class, 'downloadDokumen'])->name('api.perencanaan.rkakl.dokumen.latest');
            Route::get('rkakl/dokumen/{dokumen}', [PerencanaanRkaklController::class, 'downloadDokumen'])->name('api.perencanaan.rkakl.dokumen.download');
            Route::get('rkakl', [PerencanaanRkaklController::class, 'index'])->name('api.perencanaan.rkakl.index');
            Route::post('rkakl', [PerencanaanRkaklController::class, 'store'])->name('api.perencanaan.rkakl.store');
            Route::post('rkakl/{dokumen}/ganti', [PerencanaanRkaklController::class, 'ganti'])->name('api.perencanaan.rkakl.ganti');
            Route::delete('rkakl/{dokumen}', [PerencanaanRkaklController::class, 'destroy'])->name('api.perencanaan.rkakl.destroy');
            Route::get('notifikasi', [NotificationController::class, 'index'])->name('api.perencanaan.notifikasi.index');
            Route::post('notifikasi/read-all', [NotificationController::class, 'markAllRead'])->name('api.perencanaan.notifikasi.readAll');
            Route::post('notifikasi/{notification}/read', [NotificationController::class, 'markOneRead'])->name('api.perencanaan.notifikasi.readOne');
            Route::get('profil', [PerencanaanProfilController::class, 'index'])->name('api.perencanaan.profil.index');
        });

        // Bidang 2 Routes
        Route::prefix('bidang-2')->middleware('role:Bidang 2')->group(function () {
            Route::get('dashboard', DashboardBidang2Controller::class)->name('api.bidang2.dashboard');
            Route::get('pengajuan', [PengajuanBidang2Controller::class, 'index'])->name('api.bidang2.pengajuan.index');
            Route::get('pengajuan/{permohonan}', [PengajuanBidang2Controller::class, 'show'])->name('api.bidang2.pengajuan.show');
            Route::post('pengajuan/{permohonan}/approve', [PengajuanBidang2Controller::class, 'approve'])->name('api.bidang2.pengajuan.approve');
            Route::post('pengajuan/{permohonan}/reject', [PengajuanBidang2Controller::class, 'reject'])->name('api.bidang2.pengajuan.reject');
            Route::get('pengajuan/{permohonan}/memo', [PengajuanBidang2Controller::class, 'downloadMemo'])->name('api.bidang2.pengajuan.memo.download');
            Route::get('rkakl', [RkaklBidang2Controller::class, 'index'])->name('api.bidang2.rkakl.index');
            Route::get('rkakl/dokumen', [RkaklBidang2Controller::class, 'downloadDokumen'])->name('api.bidang2.rkakl.dokumen.latest');
            Route::get('rkakl/dokumen/{dokumen}', [RkaklBidang2Controller::class, 'downloadDokumen'])->name('api.bidang2.rkakl.dokumen.download');
            Route::get('permohonan/{permohonan}/dokumen', [PermohonanPemohonController::class, 'downloadDokumen'])->name('api.bidang2.permohonan.dokumen.download');
            Route::get('notifications', [NotificationController::class, 'index'])->name('api.bidang2.notifications.index');
            Route::get('notifications/summary', [NotificationController::class, 'summary'])->name('api.bidang2.notifications.summary');
            Route::post('notifications/read-all', [NotificationController::class, 'markAllRead'])->name('api.bidang2.notifications.readAll');
            Route::post('notifications/{notification}/read', [NotificationController::class, 'markOneRead'])->name('api.bidang2.notifications.readOne');
            Route::get('profil', [PerencanaanProfilController::class, 'index'])->name('api.bidang2.profil.index');
        });

        // PPBJ Routes
        Route::prefix('ppbj')->middleware('role:PPBJ')->group(function () {
            Route::get('dashboard', DashboardPpbjController::class)->name('api.ppbj.dashboard');
            Route::apiResource('permohonan', PpbjPermohonanController::class)->names('api.ppbj.permohonan');
            Route::apiResource('pengadaan', PengadaanController::class)->except(['destroy'])->names('api.ppbj.pengadaan');
            Route::post('pengadaan/{id}/kontrak', [PengadaanController::class, 'storeKontrak'])->name('api.ppbj.pengadaan.kontrak.store');
            Route::put('pengadaan/{id}/kontrak', [PengadaanController::class, 'updateKontrak'])->name('api.ppbj.pengadaan.kontrak.update');
            Route::get('pengadaan/{pengadaanId}/dokumen/{dokumenId}', [PengadaanController::class, 'downloadDokumen'])->name('api.ppbj.pengadaan.dokumen.download');
            Route::get('permohonan/{permohonan}/dokumen', [PpbjPermohonanController::class, 'downloadDokumen'])->name('api.ppbj.permohonan.dokumen.download');
            Route::post('permohonan/{id}/pengadaan/draft', [PpbjPermohonanController::class, 'storeDraft'])->name('api.ppbj.permohonan.pengadaan.draft');
            Route::delete('pengadaan/{id}', [PpbjPermohonanController::class, 'destroyDraft'])->name('api.ppbj.pengadaan.destroy');
            Route::post('permohonan/{id}/pengadaan/submit', [PpbjPermohonanController::class, 'submitReviewer'])->name('api.ppbj.permohonan.pengadaan.submit');
        });

        // PP Routes
        Route::prefix('pp')->middleware('role:PP')->group(function () {
            Route::get('dashboard', DashboardPpController::class)->name('api.pp.dashboard');
            Route::get('pengajuan', [PpController::class, 'index'])->name('api.pp.pengajuan.index');
            Route::get('pengajuan/{pengadaan}/review', [PpController::class, 'review'])->name('api.pp.pengajuan.review');
            Route::get('pengajuan/{pengadaan}/dokumen/{dokumen}', [PpController::class, 'downloadDokumen'])->name('api.pp.pengajuan.dokumen.download');
            Route::post('pengajuan/{pengadaan}/approve', [PpController::class, 'approve'])->name('api.pp.pengajuan.approve');
            Route::post('pengajuan/{pengadaan}/reject', [PpController::class, 'reject'])->name('api.pp.pengajuan.reject');
            Route::get('pengajuan/{pengadaan}', [PpController::class, 'show'])->name('api.pp.pengajuan.show');
            Route::get('notifikasi', [NotificationController::class, 'index'])->name('api.pp.notifikasi.index');
            Route::post('notifikasi/read-all', [NotificationController::class, 'markAllRead'])->name('api.pp.notifikasi.readAll');
            Route::post('notifikasi/{notification}/read', [NotificationController::class, 'markOneRead'])->name('api.pp.notifikasi.readOne');
            Route::get('profil', [PpController::class, 'profil'])->name('api.pp.profil.index');
        });

        // PPK Routes
        Route::prefix('ppk')->middleware('role:PPK')->group(function () {
            Route::get('dashboard', DashboardPpkController::class)->name('api.ppk.dashboard');
            Route::get('permohonan', [PermohonanPpkController::class, 'index'])->name('api.ppk.permohonan.index');
            Route::get('permohonan/{permohonan}', [PermohonanPpkController::class, 'show'])->name('api.ppk.permohonan.show');
            Route::get('permohonan/{permohonan}/dokumen', [PermohonanPpkController::class, 'downloadDokumen'])->name('api.ppk.permohonan.dokumen.download');
            Route::post('permohonan/{permohonan}/approve', [PermohonanPpkController::class, 'approvePermohonan'])->name('api.ppk.permohonan.approve');
            Route::post('permohonan/{permohonan}/reject', [PermohonanPpkController::class, 'rejectPermohonan'])->name('api.ppk.permohonan.reject');
            Route::get('pengajuan', [PpkController::class, 'index'])->name('api.ppk.pengajuan.index');
            Route::get('pengajuan/{pengadaan}/review', [PpkController::class, 'review'])->name('api.ppk.pengajuan.review');
            Route::get('pengajuan/{pengadaan}/dokumen/{dokumen}', [PpkController::class, 'downloadDokumen'])->name('api.ppk.pengajuan.dokumen.download');
            Route::post('pengajuan/{pengadaan}/approve', [PpkController::class, 'approve'])->name('api.ppk.pengajuan.approve');
            Route::post('pengajuan/{pengadaan}/reject', [PpkController::class, 'reject'])->name('api.ppk.pengajuan.reject');
            Route::get('pengajuan/{pengadaan}/pembayaran', [PpkController::class, 'pembayaran'])->name('api.ppk.pengajuan.pembayaran');
            Route::post('pengajuan/{pengadaan}/pembayaran/approve', [PpkController::class, 'approvePembayaran'])->name('api.ppk.pengajuan.pembayaran.approve');
            Route::post('pengajuan/{pengadaan}/pembayaran/reject', [PpkController::class, 'rejectPembayaran'])->name('api.ppk.pengajuan.pembayaran.reject');
            Route::get('pengajuan/{pengadaan}', [PpkController::class, 'show'])->name('api.ppk.pengajuan.show');
            Route::get('notifikasi', [NotificationController::class, 'index'])->name('api.ppk.notifikasi.index');
            Route::post('notifikasi/read-all', [NotificationController::class, 'markAllRead'])->name('api.ppk.notifikasi.readAll');
            Route::post('notifikasi/{notification}/read', [NotificationController::class, 'markOneRead'])->name('api.ppk.notifikasi.readOne');
            Route::get('profil', [PpkController::class, 'profil'])->name('api.ppk.profil.index');
        });

        // Perlengkapan Routes
        Route::prefix('perlengkapan')->middleware('role:Perlengkapan')->group(function () {
            Route::get('dashboard', DashboardPerlengkapanController::class)->name('api.perlengkapan.dashboard');
        });

        // Keuangan Routes
        Route::prefix('keuangan')->middleware('role:Keuangan')->group(function () {
            Route::get('dashboard', DashboardKeuanganController::class)->name('api.keuangan.dashboard');
        });
    });
});
