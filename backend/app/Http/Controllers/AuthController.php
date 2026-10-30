<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function show(): JsonResponse
    {
        return response()->json(['message' => 'Please login via POST /api/v1/login']);
    }

    public function store(LoginRequest $request, AuthService $authService): JsonResponse
    {
        $validated = $request->validated();
        $remember = (bool) ($validated['remember'] ?? false);

        $user = $authService->attemptLogin($validated['login'], $validated['password'], $request->ip(), $remember);
        $role = str_replace(' ', '', strtolower($user->Role->nama ?? ''));

        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        return response()->json([
            'user' => $user->load('Role'),
            'role' => $role,
        ], 200);
    }

    public function destroy(Request $request): Response
    {
        Auth::guard('web')->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->noContent();
    }
}
