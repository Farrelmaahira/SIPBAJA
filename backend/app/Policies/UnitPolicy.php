<?php

namespace App\Policies;

use App\Models\Unit;
use App\Models\User;

class UnitPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('unit.view');
    }

    public function view(User $user, Unit $unit): bool
    {
        return $user->hasPermission('unit.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('unit.create');
    }

    public function update(User $user, Unit $unit): bool
    {
        return $user->hasPermission('unit.update');
    }

    public function delete(User $user, Unit $unit): bool
    {
        return $user->hasPermission('unit.delete');
    }
}
