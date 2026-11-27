<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SimpanUnitRequest;
use App\Models\Unit;
use App\Services\UnitService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class UnitKerjaController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private UnitService $units) {}

    public function index(): JsonResponse
    {
        $this->authorize('viewAny', Unit::class);

        return response()->json([
            'units' => $this->units->paginate(request('q'), (array) request('statuses', [])),
            'filters' => [
                'q' => request('q', ''),
                'statuses' => (array) request('statuses', []),
            ],
        ]);
    }

    public function store(SimpanUnitRequest $request): JsonResponse
    {
        $this->authorize('create', Unit::class);

        $unit = $this->units->create($request->validated());

        return response()->json([
            'message' => 'Unit kerja berhasil ditambahkan.',
            'unit' => $unit,
        ], 201);
    }

    public function update(SimpanUnitRequest $request, Unit $unit): JsonResponse
    {
        $this->authorize('update', $unit);

        $unit = $this->units->update($unit, $request->validated());

        return response()->json([
            'message' => 'Unit kerja berhasil diubah.',
            'unit' => $unit,
        ]);
    }

    public function toggleStatus(Unit $unit): JsonResponse
    {
        $this->authorize('update', $unit);

        $unit = $this->units->toggleStatus($unit);
        $statusText = $unit->isActive ? 'diaktifkan' : 'dinonaktifkan';

        return response()->json([
            'message' => "Unit kerja berhasil {$statusText}.",
            'unit' => $unit,
        ]);
    }

    public function deactivate(Unit $unit): JsonResponse
    {
        $this->authorize('update', $unit);

        $unit = $this->units->deactivate($unit);

        return response()->json([
            'message' => 'Unit kerja berhasil dinonaktifkan.',
            'unit' => $unit,
        ]);
    }

    public function activate(Unit $unit): JsonResponse
    {
        $this->authorize('update', $unit);

        $unit = $this->units->activate($unit);

        return response()->json([
            'message' => 'Unit kerja berhasil diaktifkan.',
            'unit' => $unit,
        ]);
    }

    public function destroy(Unit $unit): Response|JsonResponse
    {
        $this->authorize('delete', $unit);

        if (! $this->units->delete($unit)) {
            return response()->json(['message' => 'Unit kerja dipakai pengguna atau permohonan dan tidak bisa dihapus.'], 422);
        }

        return response()->noContent();
    }
}
