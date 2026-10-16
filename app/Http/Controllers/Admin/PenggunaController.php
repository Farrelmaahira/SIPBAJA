<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SimpanPenggunaRequest;
use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PenggunaController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private UserService $users) {}

    public function index(): Response
    {
        $this->authorize('viewAny', User::class);

        return Inertia::render('Admin/Pengguna/Index', [
            'users' => $this->users->paginate(request('q')),
            'roles' => Role::orderBy('nama')->get(['id', 'nama']),
            'units' => Unit::orderBy('nama')->get(['id', 'nama']),
            'filters' => ['q' => request('q', '')],
        ]);
    }

    public function store(SimpanPenggunaRequest $request): RedirectResponse
    {
        $this->authorize('create', User::class);

        $this->users->create($request->validated());

        return redirect()->route('admin.pengguna.index')->with('success', 'Pengguna berhasil ditambahkan.');
    }

    public function update(SimpanPenggunaRequest $request, User $pengguna): RedirectResponse
    {
        $this->authorize('update', $pengguna);

        $this->users->update($pengguna, $request->validated());

        return redirect()->route('admin.pengguna.index')->with('success', 'Pengguna berhasil diubah.');
    }

    public function destroy(User $pengguna): RedirectResponse
    {
        $this->authorize('delete', $pengguna);

        $this->users->delete($pengguna);

        return redirect()->route('admin.pengguna.index')->with('success', 'Pengguna berhasil dihapus.');
    }
}
