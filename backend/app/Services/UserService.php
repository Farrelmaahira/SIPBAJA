<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class UserService
{
    public function paginate(?string $q): LengthAwarePaginator
    {
        return User::query()
            ->with(['role:id,nama', 'unit:id,nama'])
            ->when($q, function ($query, $q) {
                $query->where(function ($sub) use ($q) {
                    $sub->where('nama', 'like', "%{$q}%")
                        ->orWhere('email', 'like', "%{$q}%");
                });
            })
            ->orderBy('nama')
            ->paginate(10)
            ->withQueryString();
    }

    public function create(array $data): User
    {
        return DB::transaction(function () use ($data) {
            return User::create([
                'nama' => $data['nama'],
                'email' => $data['email'],
                'password' => $data['password'],
                'role_id' => $data['role_id'],
                'unit_id' => $data['unit_id'] ?? null,
            ]);
        });
    }

    public function update(User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data) {
            $user->fill([
                'nama' => $data['nama'],
                'email' => $data['email'],
                'role_id' => $data['role_id'],
                'unit_id' => $data['unit_id'] ?? null,
            ]);

            if (! empty($data['password'])) {
                $user->password = $data['password'];
            }

            $user->save();

            return $user;
        });
    }

    public function delete(User $user): void
    {
        $user->delete();
    }

    public function count(): int
    {
        return User::count();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function getRecentUsers(int $limit = 5): array
    {
        return User::query()
            ->with(['role:id,nama', 'unit:id,nama'])
            ->latest('id')
            ->limit($limit)
            ->get()
            ->map(fn (User $u) => [
                'id' => $u->id,
                'nama' => $u->nama,
                'email' => $u->email,
                'role' => $u->role?->nama ?? '-',
                'unit' => $u->unit?->nama ?? '-',
                'status' => 'aktif',
                'tanggal' => $u->created_at?->translatedFormat('d M Y') ?? date('d M Y'),
            ])
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function getPpkOptions(): array
    {
        return User::query()
            ->whereHas('role', fn ($q) => $q->where('nama', 'PPK'))
            ->orWhereDoesntHave('role') // fallback if no PPK role assigned yet
            ->orderBy('nama')
            ->get(['id', 'nama', 'email'])
            ->toArray();
    }
}
