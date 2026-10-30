<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReviewPengadaanRequest;
use App\Models\Notification;
use App\Models\Pengadaan;
use App\Services\PpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PpController extends Controller
{
    public function __construct(private PpService $ppService) {}

    /**
     * Tampilan Halaman Dashboard PP.
     */
    public function dashboard(): JsonResponse
    {
        $dashboardData = $this->ppService->getDashboardData();
        $recentNotifications = Notification::where('user_id', auth()->id())
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();
        $unreadCount = Notification::where('user_id', auth()->id())
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'stats' => $dashboardData['stats'],
            'chart' => $dashboardData['chart'],
            'pengadaanPerluReview' => $dashboardData['pengadaan_perlu_review'],
            'recentNotifications' => $recentNotifications,
            'unreadNotificationsCount' => $unreadCount,
        ]);
    }

    /**
     * Tampilan Halaman List Pengajuan dengan pencarian & filter status.
     */
    public function index(Request $request): Response
    {
        $filters = [
            'q' => $request->query('q', ''),
            'statuses' => $request->query('statuses', []),
        ];

        $pengajuan = $this->ppService->paginatePengadaan($filters, 10);
        $recentNotifications = Notification::where('user_id', auth()->id())
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();
        $unreadCount = Notification::where('user_id', auth()->id())
            ->whereNull('read_at')
            ->count();

        return Inertia::render('Pp/Pengajuan/Index', [
            'pengajuan' => $pengajuan,
            'filters' => $filters,
            'recentNotifications' => $recentNotifications,
            'unreadNotificationsCount' => $unreadCount,
        ]);
    }

    /**
     * Tampilan Halaman Review Dokumen Pengadaan.
     */
    public function review(Pengadaan $pengadaan): Response
    {
        $detail = $this->ppService->getDetailPengadaan($pengadaan);
        $recentNotifications = Notification::where('user_id', auth()->id())
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();
        $unreadCount = Notification::where('user_id', auth()->id())
            ->whereNull('read_at')
            ->count();

        return Inertia::render('Pp/Pengajuan/Review', [
            'detail' => $detail,
            'recentNotifications' => $recentNotifications,
            'unreadNotificationsCount' => $unreadCount,
        ]);
    }

    /**
     * Aksi Persetujuan Dokumen Pengadaan oleh PP.
     */
    public function approve(Pengadaan $pengadaan): RedirectResponse
    {
        $this->ppService->approve($pengadaan, auth()->user());

        return redirect()->route('pp.pengajuan.index')
            ->with('success', 'Dokumen pengadaan berhasil disetujui dan diteruskan ke PPK.');
    }

    /**
     * Aksi Penolakan / Permintaan Revisi Dokumen Pengadaan oleh PP.
     */
    public function reject(ReviewPengadaanRequest $request, Pengadaan $pengadaan): RedirectResponse
    {
        $this->ppService->reject($pengadaan, auth()->user(), $request->validated('alasan'));

        return redirect()->route('pp.pengajuan.index')
            ->with('success', 'Dokumen pengadaan berhasil ditolak dan dikembalikan ke PPBJ untuk direvisi.');
    }

    /**
     * Tampilan Halaman Rekap Pengajuan (Detail Siklus 5 Tahap).
     */
    public function show(Pengadaan $pengadaan): Response
    {
        $detail = $this->ppService->getDetailPengadaan($pengadaan);
        $recentNotifications = Notification::where('user_id', auth()->id())
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();
        $unreadCount = Notification::where('user_id', auth()->id())
            ->whereNull('read_at')
            ->count();

        return Inertia::render('Pp/Pengajuan/Show', [
            'detail' => $detail,
            'recentNotifications' => $recentNotifications,
            'unreadNotificationsCount' => $unreadCount,
        ]);
    }

    /**
     * Tampilan Halaman Semua Notifikasi.
     */
    public function notifikasi(Request $request): Response
    {
        $tab = $request->query('tab', 'semua');
        $notifData = $this->ppService->getNotifications(auth()->user(), $tab);

        return Inertia::render('Pp/Notifikasi/Index', [
            'notifications' => $notifData['notifications'],
            'unreadCount' => $notifData['unread_count'],
            'activeTab' => $notifData['active_tab'],
        ]);
    }

    /**
     * Aksi Tandai Semua Notifikasi Telah Dibaca.
     */
    public function markAllRead(): RedirectResponse
    {
        $this->ppService->markAllNotificationsRead(auth()->user());

        return back()->with('success', 'Semua notifikasi telah ditandai dibaca.');
    }

    /**
     * Aksi Tandai Satu Notifikasi Telah Dibaca.
     */
    public function markOneRead(Notification $notification): RedirectResponse
    {
        if ($notification->user_id === auth()->id() && is_null($notification->read_at)) {
            $notification->update(['read_at' => now()]);
        }

        return back();
    }

    /**
     * Tampilan Halaman Profil Pengguna PP.
     */
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

        return Inertia::render('Pp/Profil/Index', [
            'user' => $user,
            'recentNotifications' => $recentNotifications,
            'unreadNotificationsCount' => $unreadCount,
        ]);
    }
}
