<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Kontrak extends Model
{
    protected $table = 'kontrak';

    public $timestamps = false;

    protected $fillable = ['pengadaan_id', 'tipe', 'nomor', 'tanggal'];

    protected function casts(): array
    {
        return ['tanggal' => 'date'];
    }

    public function Pengadaan(): BelongsTo
    {
        return $this->belongsTo(Pengadaan::class, 'pengadaan_id');
    }

    public function Rencana(): HasMany
    {
        return $this->hasMany(RencanaPembayaran::class, 'kontrak_id');
    }
}
