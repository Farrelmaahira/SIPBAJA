<?php

namespace App\Livewire\Auth;

use App\Services\AuthService;
use Livewire\Component;

class Login extends Component
{
    public string $login = '';

    public string $password = '';

    public function authenticate(AuthService $authService) 
    {
        $validated = $this->validate([
            'login' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string', 'min:8'],
        ], [
            'login.required' => 'Email atau username wajib diisi.',
            'password.required' => 'Password wajib diisi.',
            'password.min' => 'Password minimal 8 karakter.',
        ]);

        $authService->attemptLogin($validated['login'], $validated['password'], request()->ip());

        if (request()->hasSession()) {
            request()->session()->regenerate();
        }

        return $this->redirect(route('dashboard'), navigate: true);
    }

    public function render()
    {
        return view('livewire.auth.login');
    }
}
