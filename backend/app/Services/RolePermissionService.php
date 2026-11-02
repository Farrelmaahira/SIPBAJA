<?php

namespace App\Services;

use App\Models\Role;
use Illuminate\Support\Facades\DB;

class RolePermissionService
{
    public function sync(Role $role, array $permissionIds): void
    {
        DB::transaction(function () use ($role, $permissionIds) {
            $role->Permissions()->sync($permissionIds);
        });
    }
}
