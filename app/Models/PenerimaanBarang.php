<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PenerimaanBarang extends Model
{
    protected $table = 'penerimaan_barang';

    public $timestamps = false;

    protected $fillable = ['pengadaan_id', 'tanggal_terima', 'diterima_oleh'];

    protected function casts(): array
    {
        return ['tanggal_terima' => 'date'];
    }

    public function Pengadaan(): BelongsTo
    {
        return $this->belongsTo(Pengadaan::class, 'pengadaan_id');
    }

    public function Penerima(): BelongsTo
    {
        return $this->belongsTo(User::class, 'diterima_oleh');
    }
}
