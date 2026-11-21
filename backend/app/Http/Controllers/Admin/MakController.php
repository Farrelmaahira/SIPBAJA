<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SimpanMakRequest;
use App\Models\Mak;
use App\Services\MakService;
use App\Services\UserService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class MakController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private MakService $maks,
        private UserService $users,
    ) {}

    public function index(): JsonResponse
    {
        $this->authorize('viewAny', Mak::class);

        return response()->json([
            'maks' => $this->maks->paginate(request('q')),
            'ppkOptions' => $this->users->getPpkOptions(),
            'filters' => ['q' => request('q', '')],
        ]);
    }

    public function store(SimpanMakRequest $request): JsonResponse
    {
        $this->authorize('create', Mak::class);

        $mak = $this->maks->create($request->validated());

        return response()->json([
            'message' => 'MAK berhasil ditambahkan.',
            'mak' => $mak,
        ], 201);
    }

    public function update(SimpanMakRequest $request, Mak $mak): JsonResponse
    {
        $this->authorize('update', $mak);

        $mak = $this->maks->update($mak, $request->validated());

        return response()->json([
            'message' => 'MAK berhasil diubah.',
            'mak' => $mak,
        ]);
    }

    public function toggleStatus(Mak $mak): JsonResponse
    {
        $this->authorize('update', $mak);

        $mak = $this->maks->toggleStatus($mak);
        $statusText = $mak->isActive ? 'diaktifkan' : 'dinonaktifkan';

        return response()->json([
            'message' => "MAK berhasil {$statusText}.",
            'mak' => $mak,
        ]);
    }

    public function deactivate(Mak $mak): JsonResponse
    {
        $this->authorize('update', $mak);

        $mak = $this->maks->deactivate($mak);

        return response()->json([
            'message' => 'MAK berhasil dinonaktifkan.',
            'mak' => $mak,
        ]);
    }

    public function activate(Mak $mak): JsonResponse
    {
        $this->authorize('update', $mak);

        $mak = $this->maks->activate($mak);

        return response()->json([
            'message' => 'MAK berhasil diaktifkan.',
            'mak' => $mak,
        ]);
    }

    public function destroy(Mak $mak): Response
    {
        $this->authorize('delete', $mak);

        $this->maks->delete($mak);

        return response()->noContent();
    }
}
