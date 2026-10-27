<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardAdminController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                ['label' => 'Total Pengguna', 'value' => 24, 'unit' => 'Akun', 'variant' => 'primary'],
                ['label' => 'Unit Terdaftar', 'value' => 8, 'unit' => 'Unit', 'variant' => 'info'],
                ['label' => 'MAK Aktif', 'value' => 4, 'unit' => 'MAK', 'variant' => 'success'],
            ],
            'recentUsers' => [
                ['id' => 1, 'nama' => 'Dr. Ahmad Farhan', 'email' => 'farhan@pnj.ac.id', 'role' => 'Perencanaan', 'unit' => 'Pusat Perencanaan', 'status' => 'aktif', 'tanggal' => '14 Mei 2026'],
                ['id' => 2, 'nama' => 'Siti Nurhaliza, M.T.', 'email' => 'siti@pnj.ac.id', 'role' => 'Pemohon', 'unit' => 'Teknik Informatika', 'status' => 'aktif', 'tanggal' => '14 Mei 2026'],
                ['id' => 3, 'nama' => 'Bambang Sudarsono', 'email' => 'bambang@pnj.ac.id', 'role' => 'PPK', 'unit' => 'Pengadaan Kampus', 'status' => 'aktif', 'tanggal' => '13 Mei 2026'],
                ['id' => 4, 'nama' => 'Rina Marlina, S.E.', 'email' => 'rina@pnj.ac.id', 'role' => 'Keuangan', 'unit' => 'Bagian Keuangan', 'status' => 'nonaktif', 'tanggal' => '10 Mei 2026'],
            ],
        ]);
    }
}
