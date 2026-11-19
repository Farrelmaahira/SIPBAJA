<?php

namespace App\Policies;

use App\Models\MetodePengadaan;
use App\Models\User;

class MetodePengadaanPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('metode_pengadaan.view');
    }

    public function view(User $user, MetodePengadaan $metode): bool
    {
        return $user->hasPermission('metode_pengadaan.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('metode_pengadaan.create');
    }

    public function update(User $user, MetodePengadaan $metode): bool
    {
        return $user->hasPermission('metode_pengadaan.update');
    }

    public function delete(User $user, MetodePengadaan $metode): bool
    {
        return $user->hasPermission('metode_pengadaan.delete');
    }
}
