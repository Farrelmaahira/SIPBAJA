<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;
use Laravel\Sanctum\Sanctum;

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

        $expiresAt = $remember ? now()->addDays(30) : now()->addDay();
        $token = $user->createToken('auth_token', ['*'], $expiresAt);

        return response()->json([
            'user' => $user->load('Role'),
            'role' => $role,
            'token' => $token->plainTextToken,
            'token_type' => 'Bearer',
            'expires_at' => $expiresAt->toIso8601String(),
        ], 200);
    }

    public function destroy(Request $request): Response
    {
        $user = $request->user();

        if ($user) {
            $currentToken = $user->currentAccessToken();
            if ($currentToken && method_exists($currentToken, 'delete')) {
                $currentToken->delete();
            }
        }

        $bearerToken = $request->bearerToken();
        if ($bearerToken) {
            /** @var class-string<PersonalAccessToken> $model */
            $model = Sanctum::$personalAccessTokenModel;
            $tokenInstance = $model::findToken($bearerToken);
            $tokenInstance?->delete();
        }

        Auth::guard('web')->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->noContent();
    }
}
