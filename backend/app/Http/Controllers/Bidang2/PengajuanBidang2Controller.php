<?php

namespace App\Http\Controllers\Bidang2;

use App\Http\Controllers\Controller;

use App\Models\Permohonan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PengajuanBidang2Controller extends Controller
{
    public function index(Request $request): JsonResponse
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

        return response()->json([
            'permohonanList' => $permohonanList,
            'filters' => [
                'status' => $status,
                'search' => $search,
            ],
        ]);
    }
}
