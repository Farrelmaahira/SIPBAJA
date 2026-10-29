<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReviewPengadaanRequest;
use App\Models\Notification;
use App\Models\Pengadaan;
use App\Services\PpService;
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
    public function dashboard(): Response
    {
        $dashboardData = $this->ppService->getDashboardData();
        $recentNotifications = Notification::where('user_id', auth()->id())
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();
        $unreadCount = Notification::where('user_id', auth()->id())
            ->whereNull('read_at')
            ->count();

        return Inertia::render('Pp/Dashboard', [
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
        // Pastikan level pengadaan memang butuh review PP
        if (! $pengadaan->Level || ! $pengadaan->Level->perlu_review_pp) {
            abort(403, 'Pengadaan ini tidak memerlukan review Pejabat Pengadaan.');
        }

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
        if ($pengadaan->status !== 'menunggu_persetujuan') {
            return back()->with('error', 'Status pengadaan saat ini tidak dapat disetujui.');
        }

        $this->ppService->approve($pengadaan, auth()->user());

        return redirect()->route('pp.pengajuan.index')
            ->with('success', 'Dokumen pengadaan berhasil disetujui dan diteruskan ke PPK.');
    }

    /**
     * Aksi Penolakan / Permintaan Revisi Dokumen Pengadaan oleh PP.
     */
    public function reject(ReviewPengadaanRequest $request, Pengadaan $pengadaan): RedirectResponse
    {
        if ($pengadaan->status !== 'menunggu_persetujuan') {
            return back()->with('error', 'Status pengadaan saat ini tidak dapat ditolak.');
        }

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
