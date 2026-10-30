<?php

use App\Http\Controllers\AuthController;
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
    });
});
