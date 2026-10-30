<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PermohonanMak extends Model
{
    protected $table = 'permohonan_mak';

    public $timestamps = false;

    protected $fillable = ['permohonan_id', 'mak_id', 'ditentukan_oleh'];

    public function Permohonan(): BelongsTo
    {
        return $this->belongsTo(Permohonan::class, 'permohonan_id');
    }

    public function Mak(): BelongsTo
    {
        return $this->belongsTo(Mak::class, 'mak_id');
    }

    public function Penentu(): BelongsTo
    {
        return $this->belongsTo(User::class, 'ditentukan_oleh');
    }

    public function Pengadaan(): HasMany
    {
        return $this->hasMany(Pengadaan::class, 'permohonan_mak_id');
    }
}
