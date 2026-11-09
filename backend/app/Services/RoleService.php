<?php

namespace App\Services;

use App\Models\Role;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class RoleService
{
    public function paginate(?string $q): LengthAwarePaginator
    {
        return Role::query()
            ->withCount(['Users', 'Permissions'])
            ->when($q, function ($query, $q) {
                $query->where('nama', 'like', "%{$q}%");
            })
            ->orderBy('nama')
            ->paginate(10)
            ->withQueryString();
    }

    public function create(array $data): Role
    {
        return DB::transaction(function () use ($data) {
            return Role::create(['nama' => $data['nama']]);
        });
    }

    public function update(Role $role, array $data): Role
    {
        return DB::transaction(function () use ($role, $data) {
            $role->update(['nama' => $data['nama']]);

            return $role;
        });
    }

    public function delete(Role $role): bool
    {
        if ($role->Users()->exists()) {
            return false;
        }

        $role->Permissions()->detach();
        $role->delete();

        return true;
    }
}
