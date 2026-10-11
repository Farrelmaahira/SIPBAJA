<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['role_id', 'unit_id', 'nama', 'email', 'password'])]
#[Hidden(['password'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, SoftDeletes;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    public function Role(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    public function Unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    public function PermohonanDibuat(): HasMany
    {
        return $this->hasMany(Permohonan::class, 'created_by');
    }

    public function MaksDitugaskan(): HasMany
    {
        return $this->hasMany(Mak::class, 'ppk_user_id');
    }

    public function PengadaanDitugaskan(): HasMany
    {
        return $this->hasMany(Pengadaan::class, 'ppk_id');
    }

    public function DokumenDiunggah(): HasMany
    {
        return $this->hasMany(Dokumen::class, 'uploaded_by');
    }

    public function Notifikasi(): HasMany
    {
        return $this->hasMany(Notification::class, 'user_id');
    }
}
