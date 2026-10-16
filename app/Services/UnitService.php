<?php

namespace App\Services;

use App\Models\Unit;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class UnitService
{
    public function paginate(?string $q): LengthAwarePaginator
    {
        return Unit::query()
            ->withCount('Users')
            ->when($q, function ($query, $q) {
                $query->where('nama', 'like', "%{$q}%");
            })
            ->orderBy('nama')
            ->paginate(10)
            ->withQueryString();
    }

    public function create(array $data): Unit
    {
        return DB::transaction(function () use ($data) {
            return Unit::create(['nama' => $data['nama']]);
        });
    }

    public function update(Unit $unit, array $data): Unit
    {
        return DB::transaction(function () use ($unit, $data) {
            $unit->update(['nama' => $data['nama']]);

            return $unit;
        });
    }

    public function delete(Unit $unit): bool
    {
        if ($unit->Users()->exists() || $unit->Permohonan()->exists()) {
            return false;
        }

        $unit->delete();

        return true;
    }
}
