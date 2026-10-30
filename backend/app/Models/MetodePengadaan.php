<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MetodePengadaan extends Model
{
    protected $table = 'metode_pengadaan';

    public $timestamps = false;

    protected $fillable = ['nama'];

    public function Pengadaan(): HasMany
    {
        return $this->hasMany(Pengadaan::class, 'metode_id');
    }
}
