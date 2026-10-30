<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SimpanRoleRequest;
use App\Models\Role;
use App\Services\RoleService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private RoleService $roles) {}

    public function index(): Response
    {
        $this->authorize('viewAny', Role::class);

        return Inertia::render('Admin/Role/Index', [
            'roles' => $this->roles->paginate(request('q')),
            'filters' => ['q' => request('q', '')],
        ]);
    }

    public function store(SimpanRoleRequest $request): RedirectResponse
    {
        $this->authorize('create', Role::class);

        $this->roles->create($request->validated());

        return redirect()->route('admin.role.index')->with('success', 'Peran berhasil ditambahkan.');
    }

    public function update(SimpanRoleRequest $request, Role $role): RedirectResponse
    {
        $this->authorize('update', $role);

        $this->roles->update($role, $request->validated());

        return redirect()->route('admin.role.index')->with('success', 'Peran berhasil diubah.');
    }

    public function destroy(Role $role): RedirectResponse
    {
        $this->authorize('delete', $role);

        if (! $this->roles->delete($role)) {
            return redirect()->route('admin.role.index')->with('error', 'Peran dipakai pengguna dan tidak bisa dihapus.');
        }

        return redirect()->route('admin.role.index')->with('success', 'Peran berhasil dihapus.');
    }
}
