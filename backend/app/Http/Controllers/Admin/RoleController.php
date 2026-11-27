<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SimpanRoleRequest;
use App\Models\Role;
use App\Services\RoleService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class RoleController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private RoleService $roles) {}

    public function index(): JsonResponse
    {
        $this->authorize('viewAny', Role::class);

        return response()->json([
            'roles' => $this->roles->paginate(request('q'), (array) request('statuses', [])),
            'filters' => [
                'q' => request('q', ''),
                'statuses' => (array) request('statuses', []),
            ],
        ]);
    }

    public function store(SimpanRoleRequest $request): JsonResponse
    {
        $this->authorize('create', Role::class);

        $role = $this->roles->create($request->validated());

        return response()->json([
            'message' => 'Peran berhasil ditambahkan.',
            'role' => $role,
        ], 201);
    }

    public function update(SimpanRoleRequest $request, Role $role): JsonResponse
    {
        $this->authorize('update', $role);

        $role = $this->roles->update($role, $request->validated());

        return response()->json([
            'message' => 'Peran berhasil diubah.',
            'role' => $role,
        ]);
    }

    public function toggleStatus(Role $role): JsonResponse
    {
        $this->authorize('update', $role);

        $role = $this->roles->toggleStatus($role);
        $statusText = $role->isActive ? 'diaktifkan' : 'dinonaktifkan';

        return response()->json([
            'message' => "Peran berhasil {$statusText}.",
            'role' => $role,
        ]);
    }

    public function deactivate(Role $role): JsonResponse
    {
        $this->authorize('update', $role);

        $role = $this->roles->deactivate($role);

        return response()->json([
            'message' => 'Peran berhasil dinonaktifkan.',
            'role' => $role,
        ]);
    }

    public function activate(Role $role): JsonResponse
    {
        $this->authorize('update', $role);

        $role = $this->roles->activate($role);

        return response()->json([
            'message' => 'Peran berhasil diaktifkan.',
            'role' => $role,
        ]);
    }

    public function destroy(Role $role): Response|JsonResponse
    {
        $this->authorize('delete', $role);

        if (! $this->roles->delete($role)) {
            return response()->json(['message' => 'Peran dipakai pengguna dan tidak bisa dihapus.'], 422);
        }

        return response()->noContent();
    }
}
