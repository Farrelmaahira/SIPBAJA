<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function attemptLogin(string $login, string $password, string $ip): User
    {
        $this->ensureNotRateLimited($login, $ip);

        $field = filter_var($login, FILTER_VALIDATE_EMAIL) ? 'email' : 'nama';

        if (! Auth::attempt([$field => $login, 'password' => $password])) {
            RateLimiter::hit($this->throttleKey($login, $ip));

            throw ValidationException::withMessages([
                'login' => 'Kredensial tidak cocok dengan data kami.',
            ]);
        }

        RateLimiter::clear($this->throttleKey($login, $ip));

        return Auth::user();
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
