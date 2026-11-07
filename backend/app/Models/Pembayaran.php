<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pembayaran extends Model
{
    protected $table = 'pembayaran';

    public $timestamps = false;

    protected $fillable = ['rencana_pembayaran_id', 'nominal', 'revisi_ke', 'status'];

    protected function casts(): array
    {
        return [
            'nominal' => 'decimal:2',
            'revisi_ke' => 'integer',
        ];
    }

    public function Rencana(): BelongsTo
    {
        return $this->belongsTo(RencanaPembayaran::class, 'rencana_pembayaran_id');
    }

    public function Approvals(): HasMany
    {
        return $this->hasMany(ApprovalPembayaran::class, 'pembayaran_id');
    }
}
