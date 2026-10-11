<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Pengadaan extends Model
{
    protected $table = 'pengadaan';

    public $timestamps = false;

    protected $fillable = [
        'permohonan_id',
        'permohonan_mak_id',
        'jenis_id',
        'metode_id',
        'level_id',
        'ppk_id',
        'nominal',
        'revisi_ke',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'nominal' => 'decimal:2',
            'revisi_ke' => 'integer',
        ];
    }

    public function Permohonan(): BelongsTo
    {
        return $this->belongsTo(Permohonan::class, 'permohonan_id');
    }

    public function Jenis(): BelongsTo
    {
        return $this->belongsTo(JenisPengadaan::class, 'jenis_id');
    }

    public function Metode(): BelongsTo
    {
        return $this->belongsTo(MetodePengadaan::class, 'metode_id');
    }

    public function Level(): BelongsTo
    {
        return $this->belongsTo(LevelPengadaan::class, 'level_id');
    }

    public function Ppk(): BelongsTo
    {
        return $this->belongsTo(User::class, 'ppk_id');
    }

    public function Kontrak(): HasOne
    {
        return $this->hasOne(Kontrak::class, 'pengadaan_id');
    }

    public function Penerimaan(): HasOne
    {
        return $this->hasOne(PenerimaanBarang::class, 'pengadaan_id');
    }

    public function Approvals(): HasMany
    {
        return $this->hasMany(ApprovalPengadaan::class, 'pengadaan_id');
    }
}
