<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JenisPengadaan extends Model
{
    protected $table = 'jenis_pengadaan';

    public $timestamps = false;

    protected $fillable = ['nama'];

    public function Pengadaan(): HasMany
    {
        return $this->hasMany(Pengadaan::class, 'jenis_id');
    }
}
