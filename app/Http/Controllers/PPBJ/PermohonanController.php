<?php

namespace App\Http\Controllers\PPBJ;

use App\Http\Controllers\Controller;
use App\Services\PermohonanService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PermohonanController extends Controller
{
    public function __construct(
        protected PermohonanService $permohonanService
    ) {}

    /**
     * Menampilkan daftar permohonan pengadaan untuk peran PPBJ.
     */
    public function index(): Response
    {
        return Inertia::render('Ppbj/Permohonan/Index', [
            'permohonanList' => $this->permohonanService->getPermohonanPpbjList(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): Response
    {
        return Inertia::render('Ppbj/Permohonan/Show', [
            'permohonan' => $this->permohonanService->getPermohonanDetail((int) $id),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
