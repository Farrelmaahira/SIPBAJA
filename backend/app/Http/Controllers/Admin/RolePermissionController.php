<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SimpanRolePermissionRequest;
use App\Models\Role;
use App\Services\RolePermissionService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RolePermissionController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private RolePermissionService $assignments) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Role::class);

        $selectedRoleId = (int) $request->query('role_id', 0);
        $matrix = $this->assignments->getMatrixData($selectedRoleId > 0 ? $selectedRoleId : null);

        return response()->json($matrix);
    }

    public function update(SimpanRolePermissionRequest $request, Role $role): JsonResponse
    {
        $this->assignments->sync($role, $request->validated()['permission_ids'] ?? []);

        return response()->json([
            'message' => 'Hak akses berhasil disimpan.',
        ]);
    }
}
