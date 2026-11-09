<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Unit extends Model
{
    protected $table = 'units';

    public $timestamps = false;

    protected $fillable = ['nama'];

    public function Users(): HasMany
    {
        return $this->hasMany(User::class, 'unit_id');
    }

    public function Permohonan(): HasMany
    {
        return $this->hasMany(Permohonan::class, 'unit_id');
    }
}
