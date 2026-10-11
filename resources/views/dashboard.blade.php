<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Dashboard - {{ config('app.name', 'SIPBAJA') }}</title>
        @vite(['resources/css/app.css', 'resources/js/app.js'])
        @livewireStyles
    </head>
    <body class="min-h-screen bg-white font-sans text-slate-900 antialiased">
        <header class="border-b border-slate-200">
            <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
                <p class="text-sm font-semibold">SIPBAJA</p>
                <form method="POST" action="{{ route('logout') }}">
                    @csrf
                    <button type="submit" class="rounded-md border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2">
                        Logout
                    </button>
                </form>
            </div>
        </header>
        <main class="mx-auto max-w-5xl px-4 py-16">
            <div class="rounded-lg border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
                <h1 class="text-xl font-semibold">Selamat datang, {{ auth()->user()->nama }}</h1>
                <p class="mt-2 text-sm text-slate-500">Role: {{ auth()->user()->Role?->nama ?? '-' }}</p>
                <p class="mt-4 text-sm text-slate-500">Dashboard masih kosong dan siap dikembangkan.</p>
            </div>
        </main>
        @livewireScripts
    </body>
</html>
