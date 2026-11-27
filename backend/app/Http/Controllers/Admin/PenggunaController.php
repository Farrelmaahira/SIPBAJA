<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SimpanPenggunaRequest;
use App\Models\User;
use App\Services\RoleService;
use App\Services\UnitService;
use App\Services\UserService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class PenggunaController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private UserService $users,
        private RoleService $roles,
        private UnitService $units,
    ) {}

    public function index(): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        return response()->json([
            'users' => $this->users->paginate(request('q'), (array) request('statuses', [])),
            'roles' => $this->roles->getRoleOptions(),
            'units' => $this->units->getUnitOptions(),
            'filters' => [
                'q' => request('q', ''),
                'statuses' => (array) request('statuses', []),
            ],
        ]);
    }

    public function store(SimpanPenggunaRequest $request): JsonResponse
    {
        $this->authorize('create', User::class);

        $user = $this->users->create($request->validated());

        return response()->json([
            'message' => 'Pengguna berhasil ditambahkan.',
            'user' => $user,
        ], 201);
    }

    public function update(SimpanPenggunaRequest $request, User $pengguna): JsonResponse
    {
        $this->authorize('update', $pengguna);

        $user = $this->users->update($pengguna, $request->validated());

        return response()->json([
            'message' => 'Pengguna berhasil diubah.',
            'user' => $user,
        ]);
    }

    public function deactivate(User $pengguna): JsonResponse
    {
        $this->authorize('update', $pengguna);

        $this->users->deactivate($pengguna->id);

        return response()->json([
            'message' => 'Pengguna berhasil dinonaktifkan.',
            'user' => $pengguna->fresh(),
        ]);
    }

    public function activate(User $pengguna): JsonResponse
    {
        $this->authorize('update', $pengguna);

        $this->users->activate($pengguna->id);

        return response()->json([
            'message' => 'Pengguna berhasil diaktifkan.',
            'user' => $pengguna->fresh(),
        ]);
    }

    public function toggleStatus(User $pengguna): JsonResponse
    {
        $this->authorize('update', $pengguna);

        if ($pengguna->isActive) {
            $this->users->deactivate($pengguna->id);
        } else {
            $this->users->activate($pengguna->id);
        }

        $fresh = $pengguna->fresh();
        $statusText = ! $fresh->isActive ? 'dinonaktifkan' : 'diaktifkan';

        return response()->json([
            'message' => "Pengguna berhasil {$statusText}.",
            'user' => $fresh,
        ]);
    }

    public function destroy(User $pengguna): Response
    {
        $this->authorize('delete', $pengguna);

        $this->users->delete($pengguna);

        return response()->noContent();
    }
}
