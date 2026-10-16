<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SimpanUnitRequest;
use App\Models\Unit;
use App\Services\UnitService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class UnitKerjaController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private UnitService $units) {}

    public function index(): Response
    {
        $this->authorize('viewAny', Unit::class);

        return Inertia::render('Admin/UnitKerja/Index', [
            'units' => $this->units->paginate(request('q')),
            'filters' => ['q' => request('q', '')],
        ]);
    }

    public function store(SimpanUnitRequest $request): RedirectResponse
    {
        $this->units->create($request->validated());

        return redirect()->route('admin.unit-kerja.index')->with('success', 'Unit kerja berhasil ditambahkan.');
    }

    public function update(SimpanUnitRequest $request, Unit $unit): RedirectResponse
    {
        $this->authorize('update', $unit);

        $this->units->update($unit, $request->validated());

        return redirect()->route('admin.unit-kerja.index')->with('success', 'Unit kerja berhasil diubah.');
    }

    public function destroy(Unit $unit): RedirectResponse
    {
        $this->authorize('delete', $unit);

        if (! $this->units->delete($unit)) {
            return redirect()->route('admin.unit-kerja.index')->with('error', 'Unit kerja dipakai pengguna atau permohonan dan tidak bisa dihapus.');
        }

        return redirect()->route('admin.unit-kerja.index')->with('success', 'Unit kerja berhasil dihapus.');
    }
}
