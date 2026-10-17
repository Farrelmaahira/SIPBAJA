<?php

namespace App\Policies;

use App\Models\Mak;
use App\Models\User;

class MakPolicy
{
    private function isAdmin(User $user): bool
    {
        return $user->role?->nama === 'Admin';
    }

    public function viewAny(User $user): bool
    {
        return $this->isAdmin($user);
    }

    public function view(User $user, Mak $mak): bool
    {
        return $this->isAdmin($user);
    }

    public function create(User $user): bool
    {
        return $this->isAdmin($user);
    }

    public function update(User $user, Mak $mak): bool
    {
        return $this->isAdmin($user);
    }

    public function delete(User $user, Mak $mak): bool
    {
        return $this->isAdmin($user);
    }
}
