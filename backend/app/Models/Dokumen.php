<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Dokumen extends Model
{
    protected $table = 'dokumen';

    public $timestamps = false;

    protected $fillable = [
        'ref_type',
        'ref_id',
        'tipe_dokumen',
        'versi',
        'nama_asli',
        'nama_hash',
        'mime_type',
        'ukuran_bytes',
        'uploaded_by',
    ];

    public function Pengunggah(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
