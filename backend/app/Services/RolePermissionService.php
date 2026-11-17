<?php

namespace App\Services;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Support\Facades\DB;

class RolePermissionService
{
    /**
     * @return array<string, mixed>
     */
    public function getMatrixData(?int $selectedRoleId = null): array
    {
        $permissions = Permission::orderBy('kode')->get(['id', 'kode']);
        $grouped = $permissions->groupBy(function ($p) {
            $parts = explode('.', $p->kode, 2);

            return $parts[0];
        })->map(function ($items) {
            return $items->values();
        });

        $roles = Role::orderBy('nama')->get(['id', 'nama']);
        $assignments = Role::with('permissions:id')->get()->mapWithKeys(function ($role) {
            return [$role->id => $role->Permissions->pluck('id')->all()];
        });

        return [
            'roles' => $roles->toArray(),
            'groupedPermissions' => $grouped->toArray(),
            'assignments' => $assignments->toArray(),
            'selectedRoleId' => $selectedRoleId ?? 0,
        ];
    }

    public function sync(Role $role, array $permissionIds): void
    {
        DB::transaction(function () use ($role, $permissionIds) {
            $role->Permissions()->sync($permissionIds);
        });
    }
}
