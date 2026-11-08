<?php

namespace App\Http\Controllers\Perencanaan;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class PerencanaanProfilController extends Controller
{
    public function index(): JsonResponse
    {
        $user = auth()->user()->load(['Role', 'Unit']);

        return response()->json([
            'user' => $user,
        ]);
    }
}
