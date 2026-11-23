<?php

namespace App\Services;

use App\Models\MetodePengadaan;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class MetodePengadaanService
{
    /**
     * Mengambil daftar metode pengadaan terpaginasi dengan pencarian nama.
     */
    public function paginate(?string $q = null, int $perPage = 10): LengthAwarePaginator
    {
        return MetodePengadaan::query()
            ->withCount('Pengadaan')
            ->when($q, function ($query, $q) {
                $query->where('nama', 'like', "%{$q}%");
            })
            ->orderBy('id', 'asc')
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * Membuat metode pengadaan baru.
     *
     * @param  array{nama: string, isActive?: bool}  $data
     */
    public function create(array $data): MetodePengadaan
    {
        return DB::transaction(function () use ($data) {
            return MetodePengadaan::create([
                'nama' => $data['nama'],
                'isActive' => $data['isActive'] ?? true,
            ]);
        });
    }

    /**
     * Memperbarui metode pengadaan.
     *
     * @param  array{nama?: string, isActive?: bool}  $data
     */
    public function update(MetodePengadaan $metode, array $data): MetodePengadaan
    {
        return DB::transaction(function () use ($metode, $data) {
            $payload = [];
            if (isset($data['nama'])) {
                $payload['nama'] = $data['nama'];
            }
            if (isset($data['isActive'])) {
                $payload['isActive'] = (bool) $data['isActive'];
            }

            $metode->update($payload);

            return $metode->fresh();
        });
    }

    /**
     * Menonaktifkan metode pengadaan.
     */
    public function deactivate(MetodePengadaan $metode): MetodePengadaan
    {
        return DB::transaction(function () use ($metode) {
            $metode->update(['isActive' => false]);

            return $metode->fresh();
        });
    }

    /**
     * Mengaktifkan metode pengadaan.
     */
    public function activate(MetodePengadaan $metode): MetodePengadaan
    {
        return DB::transaction(function () use ($metode) {
            $metode->update(['isActive' => true]);

            return $metode->fresh();
        });
    }

    /**
     * Toggle status aktif/nonaktif metode pengadaan.
     */
    public function toggleStatus(MetodePengadaan $metode): MetodePengadaan
    {
        return DB::transaction(function () use ($metode) {
            $metode->update(['isActive' => ! ($metode->isActive ?? true)]);

            return $metode->fresh();
        });
    }

    /**
     * Mengambil opsi metode pengadaan untuk dropdown.
     *
     * @return array<int, array{id: int, nama: string}>
     */
    public function getMetodeOptions(bool $onlyActive = true): array
    {
        return MetodePengadaan::query()
            ->when($onlyActive, fn ($q) => $q->where('isActive', true))
            ->orderBy('nama')
            ->get(['id', 'nama'])
            ->toArray();
    }
}
