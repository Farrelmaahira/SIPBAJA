<?php

namespace App\Services;

use App\Models\Mak;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class MakService
{
    /**
     * @param  array<int, string>  $statuses
     */
    public function paginate(?string $q, array $statuses = []): LengthAwarePaginator
    {
        return Mak::query()
            ->with(['ppk:id,nama,email'])
            ->withCount('PermohonanMak')
            ->when($q, function ($query, $q) {
                $query->whereLike('nama', "%{$q}%", caseSensitive: false);
            })
            ->when($statuses, function ($query) use ($statuses) {
                $query->whereIn('isActive', array_unique(array_map(
                    fn (string $status) => $status === 'aktif',
                    $statuses,
                )));
            })
            ->orderBy('nama')
            ->paginate(10)
            ->withQueryString();
    }

    public function create(array $data): Mak
    {
        return DB::transaction(function () use ($data) {
            return Mak::create([
                'kode' => $data['kode'],
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

    public function deactivate(Mak $mak): Mak
    {
        return DB::transaction(function () use ($mak) {
            $mak->update(['isActive' => false]);

            return $mak->fresh();
        });
    }

    public function activate(Mak $mak): Mak
    {
        return DB::transaction(function () use ($mak) {
            $mak->update(['isActive' => true]);

            return $mak->fresh();
        });
    }

    public function toggleStatus(Mak $mak): Mak
    {
        return DB::transaction(function () use ($mak) {
            $mak->update(['isActive' => ! ($mak->isActive ?? true)]);

            return $mak->fresh();
        });
    }

    public function count(): int
    {
        return Mak::count();
    }

    public function paginateUntukPerencanaan(?string $q = ''): LengthAwarePaginator
    {
        return Mak::query()
            ->with(['Ppk:id,nama,email'])
            ->withCount('PermohonanMak')
            ->when($q, function ($query, $keyword) {
                $query->where(function ($sub) use ($keyword) {
                    $sub->where('nama', 'like', "%{$keyword}%");
                    if (Schema::hasColumn('maks', 'kode')) {
                        $sub->orWhere('kode', 'like', "%{$keyword}%");
                    }
                });
            })
            ->orderBy('id')
            ->paginate(10)
            ->withQueryString();
    }

    /**
     * @return Collection<int, User>
     */
    public function getOpsiPpk(): Collection
    {
        return User::whereHas('Role', fn ($query) => $query->where('nama', 'PPK'))
            ->orderBy('nama')
            ->get(['id', 'nama', 'email']);
    }

    /**
     * @param  array<string, mixed>  $data
     *
     * @throws ValidationException
     */
    public function simpanJenisMakPerencanaan(array $data): Mak
    {
        return DB::transaction(function () use ($data) {
            $ppkId = isset($data['ppk_user_id']) ? (int) $data['ppk_user_id'] : null;

            if ($ppkId !== null) {
                $isPpk = User::where('id', $ppkId)
                    ->whereHas('Role', fn ($q) => $q->where('nama', 'PPK'))
                    ->exists();

                if (! $isPpk) {
                    throw ValidationException::withMessages([
                        'ppk_user_id' => ['Penanggung jawab yang dipilih harus memiliki peran PPK.'],
                    ]);
                }
            } else {
                $ppkId = (int) (User::whereHas('Role', fn ($q) => $q->where('nama', 'PPK'))->value('id') ?? 1);
            }

            $kode = isset($data['kode']) ? trim((string) $data['kode']) : null;
            $namaInput = trim((string) $data['nama']);
            $nama = ($kode !== null && $kode !== '' && ! str_starts_with($namaInput, $kode))
                ? "{$kode} - {$namaInput}"
                : $namaInput;

            $attributes = [
                'nama' => $nama,
                'ppk_user_id' => $ppkId,
            ];

            if (Schema::hasColumn('maks', 'kode')) {
                $attributes['kode'] = $kode;
            }

            return Mak::create($attributes);
        });
    }

    /**
     * @param  array<string, mixed>  $data
     *
     * @throws ValidationException
     */
    public function ubahJenisMakPerencanaan(Mak $mak, array $data): Mak
    {
        return DB::transaction(function () use ($mak, $data) {
            $ppkId = isset($data['ppk_user_id']) ? (int) $data['ppk_user_id'] : (int) $mak->ppk_user_id;

            $isPpk = User::where('id', $ppkId)
                ->whereHas('Role', fn ($q) => $q->where('nama', 'PPK'))
                ->exists();

            if (! $isPpk) {
                throw ValidationException::withMessages([
                    'ppk_user_id' => ['Penanggung jawab yang dipilih harus memiliki peran PPK.'],
                ]);
            }

            $kode = isset($data['kode']) ? trim((string) $data['kode']) : $mak->kode;
            $namaInput = trim((string) $data['nama']);
            $nama = ($kode !== null && $kode !== '' && ! str_starts_with($namaInput, $kode))
                ? "{$kode} - {$namaInput}"
                : $namaInput;

            $attributes = [
                'nama' => $nama,
                'ppk_user_id' => $ppkId,
            ];

            if (Schema::hasColumn('maks', 'kode')) {
                $attributes['kode'] = $kode;
            }

            $mak->update($attributes);

            return $mak->fresh(['Ppk:id,nama,email']);
        });
    }

    /**
     * @throws ValidationException
     */
    public function hapusJenisMakPerencanaan(Mak $mak): void
    {
        $terikatBerjalan = $mak->PermohonanMak()
            ->whereHas('Permohonan', function ($q) {
                $q->whereNotIn('status', ['ditolak', 'batal']);
            })
            ->exists();

        if ($terikatBerjalan || $mak->PermohonanMak()->exists()) {
            throw ValidationException::withMessages([
                'mak' => ['Jenis MAK tidak dapat dihapus karena masih terikat pada Dokumen Turunan yang sedang berjalan.'],
            ]);
        }

        DB::transaction(function () use ($mak) {
            $mak->delete();
        });
    }
}
