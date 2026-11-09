<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SimpanRolePermissionRequest;
use App\Models\Permission;
use App\Models\Role;
use App\Services\RolePermissionService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;

class RolePermissionController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private RolePermissionService $assignments) {}

    public function index(): JsonResponse
    {
        $this->authorize('viewAny', Role::class);

        $permissions = Permission::orderBy('kode')->get(['id', 'kode']);
        $grouped = $permissions->groupBy(function ($p) {
            $parts = explode('.', $p->kode, 2);

            return $parts[0];
        })->map(function ($items) {
            return $items->values();
        });

        return response()->json([
            'roles' => Role::orderBy('nama')->get(['id', 'nama']),
            'groupedPermissions' => $grouped,
            'assignments' => Role::with('permissions:id')->get()->mapWithKeys(function ($role) {
                return [$role->id => $role->Permissions->pluck('id')->all()];
            }),
            'selectedRoleId' => (int) request('role_id', 0),
        ]);
    }

    public function update(SimpanRolePermissionRequest $request, Role $role): JsonResponse
    {
        $this->assignments->sync($role, $request->validated()['permission_ids'] ?? []);

        return response()->json([
            'message' => 'Hak akses berhasil disimpan.',
        ]);
    }
}
