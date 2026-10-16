<?php

namespace App\Policies;

use App\Models\Unit;
use App\Models\User;

class UnitPolicy
{
    private function isAdmin(User $user): bool
    {
        return $user->role?->nama === 'Admin';
    }

    public function viewAny(User $user): bool
    {
        return $this->isAdmin($user);
    }

    public function view(User $user, Unit $unit): bool
    {
        return $this->isAdmin($user);
    }

    public function create(User $user): bool
    {
        return $this->isAdmin($user);
    }

    public function update(User $user, Unit $unit): bool
    {
        return $this->isAdmin($user);
    }

    public function delete(User $user, Unit $unit): bool
    {
        return $this->isAdmin($user);
    }
}
