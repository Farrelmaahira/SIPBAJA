<?php

namespace App\Http\Controllers\Bidang2;

use App\Http\Controllers\Controller;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RkaklBidang2Controller extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'message' => 'Dokumen RKAKL Bidang 2.',
        ]);
    }
}
