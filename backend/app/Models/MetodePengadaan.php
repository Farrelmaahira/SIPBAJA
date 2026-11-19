<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MetodePengadaan extends Model
{
    protected $table = 'metode_pengadaan';

    public $timestamps = false;

    protected $fillable = ['nama', 'isActive'];

    protected function casts(): array
    {
        return [
            'isActive' => 'boolean',
        ];
    }

    public function getIsAktifAttribute(): bool
    {
        return (bool) ($this->isActive ?? true);
    }

    public function Pengadaan(): HasMany
    {
        return $this->hasMany(Pengadaan::class, 'metode_id');
    }
}
