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

    // [BARU - Perencanaan: paginasi daftar Jenis MAK] ditambahkan untuk kebutuhan fitur manajemen Jenis MAK Perencanaan.
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

    // [BARU - Perencanaan: daftar akun dengan peran PPK] ditambahkan untuk kebutuhan fitur pilihan PPK pada Jenis MAK.
    /**
     * @return Collection<int, User>
     */
    public function getOpsiPpk(): Collection
    {
        return User::whereHas('Role', fn ($query) => $query->where('nama', 'PPK'))
            ->orderBy('nama')
            ->get(['id', 'nama', 'email']);
    }

    // [BARU - Perencanaan: tambah Jenis MAK dengan validasi role PPK] ditambahkan untuk kebutuhan fitur tambah Jenis MAK.
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

    // [BARU - Perencanaan: perbarui Jenis MAK dengan validasi role PPK] ditambahkan untuk kebutuhan fitur ubah Jenis MAK.
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

    // [BARU - Perencanaan: soft delete Jenis MAK dengan cek keterikatan dokumen turunan berjalan] ditambahkan untuk kebutuhan fitur hapus Jenis MAK.
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
