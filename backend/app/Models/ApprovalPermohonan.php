<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApprovalPermohonan extends Model
{
    protected $table = 'approval_permohonan';

    public $timestamps = false;

    protected $fillable = [
        'permohonan_id',
        'tahap',
        'revisi_ke',
        'keputusan',
        'alasan',
        'memo_dokumen_id',
        'actor_id',
    ];

    public function Permohonan(): BelongsTo
    {
        return $this->belongsTo(Permohonan::class, 'permohonan_id');
    }

    public function Memo(): BelongsTo
    {
        return $this->belongsTo(Dokumen::class, 'memo_dokumen_id');
    }

    public function Actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
