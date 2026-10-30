<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class RencanaPembayaran extends Model
{
    protected $table = 'rencana_pembayaran';

    public $timestamps = false;

    protected $fillable = [
        'kontrak_id',
        'termin_ke',
        'nominal_rencana',
        'tanggal_jatuh_tempo',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'nominal_rencana' => 'decimal:2',
            'tanggal_jatuh_tempo' => 'date',
        ];
    }

    public function Kontrak(): BelongsTo
    {
        return $this->belongsTo(Kontrak::class, 'kontrak_id');
    }

    public function Pembayaran(): HasOne
    {
        return $this->hasOne(Pembayaran::class, 'rencana_pembayaran_id');
    }

    public function Reminders(): HasMany
    {
        return $this->hasMany(Reminder::class, 'rencana_pembayaran_id');
    }
}
