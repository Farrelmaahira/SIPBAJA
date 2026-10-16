<?php

namespace App\Policies;

use App\Models\Role;
use App\Models\User;

class RolePolicy
{
    private function isAdmin(User $user): bool
    {
        return $user->role?->nama === 'Admin';
    }

    public function viewAny(User $user): bool
    {
        return $this->isAdmin($user);
    }

    public function view(User $user, Role $role): bool
    {
        return $this->isAdmin($user);
    }

    public function create(User $user): bool
    {
        return $this->isAdmin($user);
    }

    public function update(User $user, Role $role): bool
    {
        return $this->isAdmin($user);
    }

    public function delete(User $user, Role $role): bool
    {
        return $this->isAdmin($user);
    }
}
