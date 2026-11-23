<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function attemptLogin(string $login, string $password, string $ip, bool $remember = false): User
    {
        $this->ensureNotRateLimited($login, $ip);

        $field = filter_var($login, FILTER_VALIDATE_EMAIL) ? 'email' : 'nama';

        if (! Auth::attempt([$field => $login, 'password' => $password], $remember)) {
            RateLimiter::hit($this->throttleKey($login, $ip));

            throw ValidationException::withMessages([
                'login' => 'Kredensial tidak cocok dengan data kami.',
            ]);
        }

        /** @var User $user */
        $user = Auth::user();

        if (! ($user->isActive ?? true)) {
            Auth::logout();

            throw ValidationException::withMessages([
                'login' => 'Akun Anda telah dinonaktifkan. Silakan hubungi administrator.',
            ]);
        }

        RateLimiter::clear($this->throttleKey($login, $ip));

        return $user;
    }

    protected function ensureNotRateLimited(string $login, string $ip): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey($login, $ip), 5)) {
            return;
        }

        $seconds = RateLimiter::availableIn($this->throttleKey($login, $ip));

        throw ValidationException::withMessages([
            'login' => "Terlalu banyak percobaan login. Coba lagi dalam {$seconds} detik.",
        ]);
    }

    protected function throttleKey(string $login, string $ip): string
    {
        return Str::transliterate(Str::lower($login).'|'.$ip);
    }
}
