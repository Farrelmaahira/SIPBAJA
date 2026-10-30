<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Permohonan extends Model
{
    protected $table = 'permohonan';

    public $timestamps = false;

    protected $fillable = [
        'unit_id',
        'created_by',
        'nomor_surat',
        'judul',
        'ringkasan_tujuan',
        'estimasi_anggaran',
        'revisi_ke',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'estimasi_anggaran' => 'decimal:2',
            'revisi_ke' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    public function Unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    public function Creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function PermohonanMak(): HasMany
    {
        return $this->hasMany(PermohonanMak::class, 'permohonan_id');
    }

    public function Pengadaan(): HasMany
    {
        return $this->hasMany(Pengadaan::class, 'permohonan_id');
    }

    public function Approvals(): HasMany
    {
        return $this->hasMany(ApprovalPermohonan::class, 'permohonan_id');
    }
}
