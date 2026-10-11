<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApprovalPengadaan extends Model
{
    protected $table = 'approval_pengadaan';

    public $timestamps = false;

    protected $fillable = [
        'pengadaan_id',
        'tahap',
        'revisi_ke',
        'keputusan',
        'alasan',
        'bukti_tanda_tangan_id',
        'actor_id',
    ];

    public function Pengadaan(): BelongsTo
    {
        return $this->belongsTo(Pengadaan::class, 'pengadaan_id');
    }

    public function Bukti(): BelongsTo
    {
        return $this->belongsTo(Dokumen::class, 'bukti_tanda_tangan_id');
    }

    public function Actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
