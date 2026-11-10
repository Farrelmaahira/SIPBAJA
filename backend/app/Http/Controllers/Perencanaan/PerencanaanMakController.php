<?php

namespace App\Http\Controllers\Perencanaan;

use App\Http\Controllers\Controller;
use App\Http\Requests\SimpanJenisMakRequest;
use App\Models\Mak;
use App\Services\MakService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PerencanaanMakController extends Controller
{
    public function __construct(
        private MakService $makService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $q = (string) $request->query('q', '');
        $maks = $this->makService->paginateUntukPerencanaan($q);
        $ppkOptions = $this->makService->getOpsiPpk();

        return response()->json([
            'maks' => $maks,
            'ppkOptions' => $ppkOptions,
            'filters' => ['q' => $q],
        ]);
    }

    public function store(SimpanJenisMakRequest $request): JsonResponse
    {
        $mak = $this->makService->simpanJenisMakPerencanaan($request->validated());

        return response()->json([
            'message' => 'Jenis MAK baru berhasil ditambahkan.',
            'mak' => $mak,
        ], 201);
    }

    public function update(SimpanJenisMakRequest $request, Mak $mak): JsonResponse
    {
        $mak = $this->makService->ubahJenisMakPerencanaan($mak, $request->validated());

        return response()->json([
            'message' => 'Jenis MAK berhasil diperbarui.',
            'mak' => $mak,
        ]);
    }

    public function destroy(Mak $mak): Response
    {
        $this->makService->hapusJenisMakPerencanaan($mak);

        return response()->noContent();
    }
}
