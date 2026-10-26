<?php

namespace App\Http\Controllers;

use App\Services\PpbjDashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardPpbjController extends Controller
{
    public function __construct(
        private readonly PpbjDashboardService $ppbjDashboardService
    ) {}

    public function __invoke(Request $request): Response
    {
        return Inertia::render('Ppbj/Dashboard', $this->ppbjDashboardService->getDashboardData());
    }
}
