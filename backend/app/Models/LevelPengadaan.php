<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LevelPengadaan extends Model
{
    protected $table = 'level_pengadaan';

    public $timestamps = false;

    protected $fillable = ['nama', 'min_nominal', 'max_nominal', 'perlu_review_pp'];

    protected function casts(): array
    {
        return [
            'min_nominal' => 'decimal:2',
            'max_nominal' => 'decimal:2',
            'perlu_review_pp' => 'boolean',
        ];
    }

    public function Pengadaan(): HasMany
    {
        return $this->hasMany(Pengadaan::class, 'level_id');
    }
}
