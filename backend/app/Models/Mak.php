<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Mak extends Model
{
    use SoftDeletes;

    protected $table = 'maks';

    public $timestamps = false;

    protected $fillable = ['kode', 'nama', 'ppk_user_id'];

    public function Ppk(): BelongsTo
    {
        return $this->belongsTo(User::class, 'ppk_user_id');
    }

    public function PermohonanMak(): HasMany
    {
        return $this->hasMany(PermohonanMak::class, 'mak_id');
    }
}
