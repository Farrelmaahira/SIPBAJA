<?php

namespace App\Http\Controllers;

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
