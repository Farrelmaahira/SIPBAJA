<?php

namespace App\Http\Controllers\Pp;

use App\Http\Controllers\Controller;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardPpController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        return response()->json([]);
    }
}
