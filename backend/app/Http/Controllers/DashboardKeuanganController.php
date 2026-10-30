<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardKeuanganController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        return response()->json([]);
    }
}
