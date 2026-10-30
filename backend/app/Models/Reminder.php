<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reminder extends Model
{
    protected $table = 'reminder';

    public $timestamps = false;

    protected $fillable = ['rencana_pembayaran_id', 'tanggal_reminder', 'jenis', 'dibuat_oleh'];

    protected function casts(): array
    {
        return ['tanggal_reminder' => 'date'];
    }

    public function Rencana(): BelongsTo
    {
        return $this->belongsTo(RencanaPembayaran::class, 'rencana_pembayaran_id');
    }

    public function Pembuat(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dibuat_oleh');
    }
}
