<div class="flex min-h-screen items-center justify-center bg-white px-4 py-12">
    <div class="w-full max-w-sm">
        <div class="rounded-lg border border-slate-200 bg-white px-6 py-8 shadow-sm">
            <div class="mb-5 flex justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-900" aria-hidden="true">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" x2="3" y1="12" y2="12" />
                </svg>
            </div>

            <h1 class="text-center text-lg font-semibold text-slate-900">Selamat Datang di SIPBAJA</h1>
            <p class="mt-1 text-center text-xs text-slate-500">Sistem Pengadaan Barang dan Jasa di PNJ</p>

            <form wire:submit="authenticate" class="mt-6 flex flex-col gap-4">
                <div>
                    <label for="login" class="mb-1 block text-xs font-medium text-slate-700">Email/Username</label>
                    <input
                        id="login"
                        type="text"
                        wire:model="login"
                        placeholder="Email/Username"
                        autocomplete="username"
                        autofocus
                        class="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                    />
                    @error('login') <p class="mt-1 text-xs text-red-600">{{ $message }}</p> @enderror
                </div>

                <div>
                    <label for="password" class="mb-1 block text-xs font-medium text-slate-700">Password</label>
                    <input
                        id="password"
                        type="password"
                        wire:model="password"
                        placeholder="Password"
                        autocomplete="current-password"
                        class="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                    />
                    @error('password') <p class="mt-1 text-xs text-red-600">{{ $message }}</p> @enderror
                </div>

                <button
                    type="submit"
                    wire:loading.attr="disabled"
                    class="mt-1 w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    <span wire:loading.remove>Login</span>
                    <span wire:loading>Memproses...</span>
                </button>
            </form>
        </div>

        <p class="mt-6 text-center text-xs text-slate-500">
            Lupa Password?
            @if (Route::has('password.request'))
                <a href="{{ route('password.request') }}" class="font-medium text-blue-600 hover:text-blue-700 hover:underline">Reset Password</a>
            @else
                <span>Hubungi admin untuk reset.</span>
            @endif
        </p>
    </div>
</div>
