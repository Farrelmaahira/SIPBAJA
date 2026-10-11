<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Mak extends Model
{
    protected $table = 'maks';

    public $timestamps = false;

    protected $fillable = ['nama', 'ppk_user_id'];

    public function Ppk(): BelongsTo
    {
        return $this->belongsTo(User::class, 'ppk_user_id');
    }

    public function PermohonanMak(): HasMany
    {
        return $this->hasMany(PermohonanMak::class, 'mak_id');
    }
}
