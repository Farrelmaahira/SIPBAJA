<?php

namespace App\Http\Controllers;

use App\Http\Requests\SimpanJenisMakRequest;
use App\Http\Requests\TolakPermohonanRequest;
use App\Http\Requests\VerifikasiPermohonanRequest;
use App\Models\Mak;
use App\Models\Notification;
use App\Models\Permohonan;
use App\Models\User;
use App\Services\PerencanaanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PerencanaanController extends Controller
{
    public function __construct(private PerencanaanService $perencanaanService) {}

    public function dashboard(): JsonResponse
    {
        $data = $this->perencanaanService->getDashboardData();
        $recentNotifications = Notification::where('user_id', auth()->id())
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();
        $unreadCount = Notification::where('user_id', auth()->id())
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'stats' => $data['stats'],
            'permohonanTerbaru' => $data['permohonan_terbaru'],
            'recentNotifications' => $recentNotifications,
            'unreadNotificationsCount' => $unreadCount,
        ]);
    }

    public function index(Request $request): Response
    {
        $filters = [
            'q' => $request->query('q', ''),
            'statuses' => $request->query('statuses', []),
        ];

        $permohonan = $this->perencanaanService->paginatePermohonan($filters, 10);
        $recentNotifications = Notification::where('user_id', auth()->id())
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();
        $unreadCount = Notification::where('user_id', auth()->id())
            ->whereNull('read_at')
            ->count();

        return Inertia::render('Perencanaan/Pengajuan/Index', [
            'permohonan' => $permohonan,
            'filters' => $filters,
            'recentNotifications' => $recentNotifications,
            'unreadNotificationsCount' => $unreadCount,
        ]);
    }

    public function show(Permohonan $permohonan): Response
    {
        $detail = $this->perencanaanService->getDetailPermohonan($permohonan);
        $recentNotifications = Notification::where('user_id', auth()->id())
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();
        $unreadCount = Notification::where('user_id', auth()->id())
            ->whereNull('read_at')
            ->count();

        return Inertia::render('Perencanaan/Pengajuan/Show', [
            'detail' => $detail,
            'recentNotifications' => $recentNotifications,
            'unreadNotificationsCount' => $unreadCount,
        ]);
    }

    public function approve(VerifikasiPermohonanRequest $request, Permohonan $permohonan): RedirectResponse
    {
        $this->perencanaanService->approvePermohonan(
            $permohonan,
            auth()->user(),
            $request->validated('mak_ids')
        );

        return redirect()->route('perencanaan.pengajuan.index')
            ->with('success', 'Permohonan berhasil diverifikasi dan diteruskan ke tahap berikutnya.');
    }

    public function reject(TolakPermohonanRequest $request, Permohonan $permohonan): RedirectResponse
    {
        $this->perencanaanService->rejectPermohonan(
            $permohonan,
            auth()->user(),
            $request->validated('alasan')
        );

        return redirect()->route('perencanaan.pengajuan.index')
            ->with('success', 'Permohonan telah ditolak dan dikembalikan ke pemohon.');
    }

    public function kirimPengadaan(Request $request, Permohonan $permohonan): RedirectResponse
    {
        $makId = (int) $request->input('mak_id', 1);
        $this->perencanaanService->kirimPengadaan($permohonan, auth()->user(), $makId);

        return redirect()->route('perencanaan.pengajuan.index')
            ->with('success', 'Jenis MAK pengadaan berhasil ditetapkan dan dikirim.');
    }

    public function jenisMak(Request $request): Response
    {
        $q = $request->query('q', '');
        $maks = $this->perencanaanService->paginateMaks($q);
        $ppkOptions = User::whereHas('Role', fn ($query) => $query->where('nama', 'PPK'))
            ->get(['id', 'nama', 'email']);

        $recentNotifications = Notification::where('user_id', auth()->id())
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();
        $unreadCount = Notification::where('user_id', auth()->id())
            ->whereNull('read_at')
            ->count();

        return Inertia::render('Perencanaan/JenisMak/Index', [
            'maks' => $maks,
            'ppkOptions' => $ppkOptions,
            'filters' => ['q' => $q],
            'recentNotifications' => $recentNotifications,
            'unreadNotificationsCount' => $unreadCount,
        ]);
    }

    public function storeMak(SimpanJenisMakRequest $request): RedirectResponse
    {
        $this->perencanaanService->storeMak($request->validated());

        return back()->with('success', 'Jenis MAK baru berhasil ditambahkan.');
    }

    public function updateMak(SimpanJenisMakRequest $request, Mak $mak): RedirectResponse
    {
        $this->perencanaanService->updateMak($mak, $request->validated());

        return back()->with('success', 'Jenis MAK berhasil diperbarui.');
    }

    public function destroyMak(Mak $mak): RedirectResponse
    {
        $this->perencanaanService->deleteMak($mak);

        return back()->with('success', 'Jenis MAK berhasil dihapus.');
    }

    public function rkakl(): Response
    {
        $rkaklData = $this->perencanaanService->getRkaklData();
        $recentNotifications = Notification::where('user_id', auth()->id())
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();
        $unreadCount = Notification::where('user_id', auth()->id())
            ->whereNull('read_at')
            ->count();

        return Inertia::render('Perencanaan/Rkakl/Index', [
            'rkakl' => $rkaklData,
            'recentNotifications' => $recentNotifications,
            'unreadNotificationsCount' => $unreadCount,
        ]);
    }

    public function storeRkakl(Request $request): RedirectResponse
    {
        $filename = $request->input('filename', 'RKAKL_TA_2026_Satker_Politeknik_v4.pdf');
        $this->perencanaanService->replaceRkakl(auth()->user(), $filename);

        return back()->with('success', 'Dokumen RKAKL berhasil diperbarui dengan versi terbaru.');
    }

    public function notifikasi(Request $request): Response
    {
        $tab = $request->query('tab', 'semua');
        $notifData = $this->perencanaanService->getNotifications(auth()->user(), $tab);

        return Inertia::render('Perencanaan/Notifikasi/Index', [
            'notifications' => $notifData['notifications'],
            'unreadCount' => $notifData['unread_count'],
            'activeTab' => $notifData['active_tab'],
        ]);
    }

    public function markAllRead(): RedirectResponse
    {
        $this->perencanaanService->markAllNotificationsRead(auth()->user());

        return back()->with('success', 'Semua notifikasi telah ditandai dibaca.');
    }

    public function markOneRead(Notification $notification): RedirectResponse
    {
        if ($notification->user_id === auth()->id() && is_null($notification->read_at)) {
            $notification->update(['read_at' => now()]);
        }

        return back();
    }

    public function profil(): Response
    {
        $user = auth()->user()->load(['Role', 'Unit']);
        $recentNotifications = Notification::where('user_id', auth()->id())
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();
        $unreadCount = Notification::where('user_id', auth()->id())
            ->whereNull('read_at')
            ->count();

        return Inertia::render('Perencanaan/Profil/Index', [
            'user' => $user,
            'recentNotifications' => $recentNotifications,
            'unreadNotificationsCount' => $unreadCount,
        ]);
    }
}
