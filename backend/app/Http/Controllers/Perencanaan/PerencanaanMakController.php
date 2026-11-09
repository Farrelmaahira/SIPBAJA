<?php

namespace App\Http\Controllers\Perencanaan;

use App\Http\Controllers\Controller;
use App\Http\Requests\SimpanJenisMakRequest;
use App\Models\Mak;
use App\Models\User;
use App\Services\PerencanaanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PerencanaanMakController extends Controller
{
    public function __construct(
        private PerencanaanService $perencanaanService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $q = $request->query('q', '');
        $maks = $this->perencanaanService->paginateMaks($q);
        $ppkOptions = User::whereHas('Role', fn ($query) => $query->where('nama', 'PPK'))
            ->get(['id', 'nama', 'email']);

        return response()->json([
            'maks' => $maks,
            'ppkOptions' => $ppkOptions,
            'filters' => ['q' => $q],
        ]);
    }

    public function store(SimpanJenisMakRequest $request): JsonResponse
    {
        $mak = $this->perencanaanService->storeMak($request->validated());

        return response()->json([
            'message' => 'Jenis MAK baru berhasil ditambahkan.',
            'mak' => $mak,
        ], 201);
    }

    public function update(SimpanJenisMakRequest $request, Mak $mak): JsonResponse
    {
        $mak = $this->perencanaanService->updateMak($mak, $request->validated());

        return response()->json([
            'message' => 'Jenis MAK berhasil diperbarui.',
            'mak' => $mak,
        ]);
    }

    public function destroy(Mak $mak): Response
    {
        $this->perencanaanService->deleteMak($mak);

        return response()->noContent();
    }
}
