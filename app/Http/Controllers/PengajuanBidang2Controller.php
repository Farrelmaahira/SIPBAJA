<?php

namespace App\Http\Controllers;

use App\Models\Permohonan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PengajuanBidang2Controller extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->query('status', 'semua');
        $search = $request->query('search', '');

        $query = Permohonan::with(['unit', 'dokumen']);

        if ($status !== 'semua' && ! empty($status)) {
            $query->where('status', $status);
        }

        if (! empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('nomor_surat', 'like', "%{$search}%")
                    ->orWhere('judul', 'like', "%{$search}%");
            });
        }

        $permohonanList = $query->orderBy('created_at', 'desc')->paginate(10)->withQueryString();

        return Inertia::render('Bidang2/Pengajuan/Index', [
            'permohonanList' => $permohonanList,
            'filters' => [
                'status' => $status,
                'search' => $search,
            ],
        ]);
    }
}
