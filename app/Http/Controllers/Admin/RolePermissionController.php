<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SimpanRolePermissionRequest;
use App\Models\Permission;
use App\Models\Role;
use App\Services\RolePermissionService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class RolePermissionController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private RolePermissionService $assignments) {}

    public function index(): Response
    {
        $this->authorize('viewAny', Role::class);

        $permissions = Permission::orderBy('kode')->get(['id', 'kode']);
        $grouped = $permissions->groupBy(function ($p) {
            $parts = explode('.', $p->kode, 2);

            return $parts[0];
        })->map(function ($items) {
            return $items->values();
        });

        return Inertia::render('Admin/RolePermission/Index', [
            'roles' => Role::orderBy('nama')->get(['id', 'nama']),
            'groupedPermissions' => $grouped,
            'assignments' => Role::with('Permissions:id')->get()->mapWithKeys(function ($role) {
                return [$role->id => $role->Permissions->pluck('id')->all()];
            }),
            'selectedRoleId' => (int) request('role_id', 0),
        ]);
    }

    public function update(SimpanRolePermissionRequest $request, Role $role): RedirectResponse
    {
        $this->assignments->sync($role, $request->validated()['permission_ids'] ?? []);

        return redirect()->route('admin.role-permission.index', ['role_id' => $role->id])
            ->with('success', 'Hak akses berhasil disimpan.');
    }
}
