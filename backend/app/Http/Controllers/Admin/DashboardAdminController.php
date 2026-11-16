<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\MakService;
use App\Services\UnitService;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardAdminController extends Controller
{
    public function __construct(
        private UserService $users,
        private UnitService $units,
        private MakService $maks,
    ) {}

    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): JsonResponse
    {
        return response()->json([
            'stats' => [
                ['label' => 'Total Pengguna', 'value' => $this->users->count(), 'unit' => 'Akun', 'variant' => 'primary'],
                ['label' => 'Unit Terdaftar', 'value' => $this->units->count(), 'unit' => 'Unit', 'variant' => 'info'],
                ['label' => 'MAK Aktif', 'value' => $this->maks->count(), 'unit' => 'MAK', 'variant' => 'success'],
            ],
            'recentUsers' => $this->users->getRecentUsers(5),
        ]);
    }
}
