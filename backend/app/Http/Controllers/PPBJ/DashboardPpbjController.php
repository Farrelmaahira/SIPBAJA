<?php

namespace App\Http\Controllers\PPBJ;

use App\Http\Controllers\Controller;
use App\Services\PpbjDashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardPpbjController extends Controller
{
    public function __construct(
        private readonly PpbjDashboardService $ppbjDashboardService
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        return response()->json($this->ppbjDashboardService->getDashboardData());
    }
}
