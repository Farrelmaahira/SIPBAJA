<?php

namespace App\Services;

use App\Models\Mak;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class MakService
{
    public function paginate(?string $q): LengthAwarePaginator
    {
        return Mak::query()
            ->with(['ppk:id,nama,email'])
            ->withCount('PermohonanMak')
            ->when($q, function ($query, $q) {
                $query->where('nama', 'like', "%{$q}%");
            })
            ->orderBy('nama')
            ->paginate(10)
            ->withQueryString();
    }

    public function create(array $data): Mak
    {
        return DB::transaction(function () use ($data) {
            return Mak::create([
                'nama' => $data['nama'],
                'ppk_user_id' => $data['ppk_user_id'],
            ]);
        });
    }

    public function update(Mak $mak, array $data): Mak
    {
        return DB::transaction(function () use ($mak, $data) {
            $mak->update([
                'nama' => $data['nama'],
                'ppk_user_id' => $data['ppk_user_id'],
            ]);

            return $mak;
        });
    }

    public function delete(Mak $mak): bool
    {
        if ($mak->PermohonanMak()->exists()) {
            return false;
        }

        $mak->delete();

        return true;
    }
}
