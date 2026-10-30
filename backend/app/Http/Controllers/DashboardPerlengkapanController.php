<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardPerlengkapanController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        return response()->json([]);
    }
}
