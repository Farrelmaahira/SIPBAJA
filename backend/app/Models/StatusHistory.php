<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StatusHistory extends Model
{
    protected $table = 'status_history';

    public $timestamps = false;

    protected $fillable = ['ref_type', 'ref_id', 'status_lama', 'status_baru', 'actor_id', 'created_at'];

    public function Actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
