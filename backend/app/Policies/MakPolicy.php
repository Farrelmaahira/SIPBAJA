<?php

namespace App\Policies;

use App\Models\Mak;
use App\Models\User;

class MakPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('MAK.view');
    }

    public function view(User $user, Mak $mak): bool
    {
        return $user->hasPermission('MAK.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('MAK.create');
    }

    public function update(User $user, Mak $mak): bool
    {
        return $user->hasPermission('MAK.update');
    }

    public function delete(User $user, Mak $mak): bool
    {
        return $user->hasPermission('MAK.delete');
    }
}
