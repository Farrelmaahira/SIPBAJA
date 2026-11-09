<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('akun.view');
    }

    public function view(User $user, User $model): bool
    {
        return $user->hasPermission('akun.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('akun.create');
    }

    public function update(User $user, User $model): bool
    {
        return $user->hasPermission('akun.update');
    }

    public function delete(User $user, User $model): bool
    {
        return $user->hasPermission('akun.delete');
    }
}
