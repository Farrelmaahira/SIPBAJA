<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SimpanMakRequest;
use App\Models\Mak;
use App\Models\User;
use App\Services\MakService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class MakController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private MakService $maks) {}

    public function index(): JsonResponse
    {
        $this->authorize('viewAny', Mak::class);

        return response()->json([
            'maks' => $this->maks->paginate(request('q')),
            'ppkOptions' => User::orderBy('nama')->get(['id', 'nama', 'email']),
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

    public function destroy(Mak $mak): Response|JsonResponse
    {
        $this->authorize('delete', $mak);

        if (! $this->maks->delete($mak)) {
            return response()->json(['message' => 'MAK dipakai permohonan dan tidak bisa dihapus.'], 422);
        }

        return response()->noContent();
    }
}
