<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    protected $table = 'notifications';

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'channel',
        'judul',
        'pesan',
        'ref_type',
        'ref_id',
        'read_at',
    ];

    protected function casts(): array
    {
        return ['read_at' => 'datetime'];
    }

    public function Penerima(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
