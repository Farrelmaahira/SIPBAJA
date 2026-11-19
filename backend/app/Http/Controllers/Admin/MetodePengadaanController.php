<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SimpanMetodePengadaanRequest;
use App\Models\MetodePengadaan;
use App\Services\MetodePengadaanService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MetodePengadaanController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly MetodePengadaanService $metodeService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', MetodePengadaan::class);

        $q = $request->query('q', $request->query('search', ''));

        return response()->json([
            'metode_pengadaan' => $this->metodeService->paginate($q),
            'filters' => ['q' => $q],
        ]);
    }

    public function store(SimpanMetodePengadaanRequest $request): JsonResponse
    {
        $this->authorize('create', MetodePengadaan::class);

        $metode = $this->metodeService->create($request->validated());

        return response()->json([
            'message' => 'Metode pengadaan berhasil ditambahkan.',
            'metode_pengadaan' => $metode,
        ], 201);
    }

    public function update(SimpanMetodePengadaanRequest $request, MetodePengadaan $metode_pengadaan): JsonResponse
    {
        $this->authorize('update', $metode_pengadaan);

        $metode = $this->metodeService->update($metode_pengadaan, $request->validated());

        return response()->json([
            'message' => 'Metode pengadaan berhasil diubah.',
            'metode_pengadaan' => $metode,
        ]);
    }

    public function toggleStatus(MetodePengadaan $metode_pengadaan): JsonResponse
    {
        $this->authorize('update', $metode_pengadaan);

        $metode = $this->metodeService->toggleStatus($metode_pengadaan);

        $statusText = $metode->isActive ? 'diaktifkan' : 'dinonaktifkan';

        return response()->json([
            'message' => "Metode pengadaan berhasil {$statusText}.",
            'metode_pengadaan' => $metode,
        ]);
    }

    public function deactivate(MetodePengadaan $metode_pengadaan): JsonResponse
    {
        $this->authorize('update', $metode_pengadaan);

        $metode = $this->metodeService->deactivate($metode_pengadaan);

        return response()->json([
            'message' => 'Metode pengadaan berhasil dinonaktifkan.',
            'metode_pengadaan' => $metode,
        ]);
    }

    public function activate(MetodePengadaan $metode_pengadaan): JsonResponse
    {
        $this->authorize('update', $metode_pengadaan);

        $metode = $this->metodeService->activate($metode_pengadaan);

        return response()->json([
            'message' => 'Metode pengadaan berhasil diaktifkan.',
            'metode_pengadaan' => $metode,
        ]);
    }
}
