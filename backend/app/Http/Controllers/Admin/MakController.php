<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SimpanMakRequest;
use App\Models\Mak;
use App\Models\User;
use App\Services\MakService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class MakController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private MakService $maks) {}

    public function index(): Response
    {
        $this->authorize('viewAny', Mak::class);

        return Inertia::render('Admin/Mak/Index', [
            'maks' => $this->maks->paginate(request('q')),
            'ppkOptions' => User::orderBy('nama')->get(['id', 'nama', 'email']),
            'filters' => ['q' => request('q', '')],
        ]);
    }

    public function store(SimpanMakRequest $request): RedirectResponse
    {
        $this->authorize('create', Mak::class);

        $this->maks->create($request->validated());

        return redirect()->route('admin.mak.index')->with('success', 'MAK berhasil ditambahkan.');
    }

    public function update(SimpanMakRequest $request, Mak $mak): RedirectResponse
    {
        $this->authorize('update', $mak);

        $this->maks->update($mak, $request->validated());

        return redirect()->route('admin.mak.index')->with('success', 'MAK berhasil diubah.');
    }

    public function destroy(Mak $mak): RedirectResponse
    {
        $this->authorize('delete', $mak);

        if (! $this->maks->delete($mak)) {
            return redirect()->route('admin.mak.index')->with('error', 'MAK dipakai permohonan dan tidak bisa dihapus.');
        }

        return redirect()->route('admin.mak.index')->with('success', 'MAK berhasil dihapus.');
    }
}
