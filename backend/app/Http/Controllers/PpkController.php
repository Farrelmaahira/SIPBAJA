<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReviewPengadaanRequest;
use App\Http\Requests\TolakPermohonanRequest;
use App\Models\Notification;
use App\Models\Pengadaan;
use App\Services\PpkService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PpkController extends Controller
{
    public function __construct(private PpkService $ppkService) {}

    public function dashboard(): JsonResponse
    {
        $data = $this->ppkService->getDashboardData();
        $recentNotifications = Notification::where('user_id', auth()->id())
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();
        $unreadCount = Notification::where('user_id', auth()->id())
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'stats' => $data['stats'],
            'pengajuanTerbaru' => $data['pengajuan_terbaru'],
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

        $pengajuan = $this->ppkService->paginatePengadaan($filters, 10);
        $recentNotifications = Notification::where('user_id', auth()->id())
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();
        $unreadCount = Notification::where('user_id', auth()->id())
            ->whereNull('read_at')
            ->count();

        return Inertia::render('Ppk/Pengajuan/Index', [
            'pengajuan' => $pengajuan,
            'filters' => $filters,
            'recentNotifications' => $recentNotifications,
            'unreadNotificationsCount' => $unreadCount,
        ]);
    }

    public function review(Pengadaan $pengadaan): Response
    {
        $detail = $this->ppkService->getDetailPengadaan($pengadaan);
        $recentNotifications = Notification::where('user_id', auth()->id())
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();
        $unreadCount = Notification::where('user_id', auth()->id())
            ->whereNull('read_at')
            ->count();

        return Inertia::render('Ppk/Pengajuan/Review', [
            'detail' => $detail,
            'recentNotifications' => $recentNotifications,
            'unreadNotificationsCount' => $unreadCount,
        ]);
    }

    public function approve(Pengadaan $pengadaan): RedirectResponse
    {
        $this->ppkService->approvePengadaan($pengadaan, auth()->user());

        return redirect()->route('ppk.pengajuan.index')
            ->with('success', 'Dokumen pengadaan berhasil disetujui oleh PPK.');
    }

    public function reject(ReviewPengadaanRequest $request, Pengadaan $pengadaan): RedirectResponse
    {
        $this->ppkService->rejectPengadaan($pengadaan, auth()->user(), $request->validated('alasan'));

        return redirect()->route('ppk.pengajuan.index')
            ->with('success', 'Dokumen pengadaan ditolak dan dikembalikan ke PPBJ.');
    }

    public function pembayaran(Pengadaan $pengadaan): Response
    {
        $detail = $this->ppkService->getDetailPengadaan($pengadaan);
        $recentNotifications = Notification::where('user_id', auth()->id())
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();
        $unreadCount = Notification::where('user_id', auth()->id())
            ->whereNull('read_at')
            ->count();

        return Inertia::render('Ppk/Pengajuan/Pembayaran', [
            'detail' => $detail,
            'recentNotifications' => $recentNotifications,
            'unreadNotificationsCount' => $unreadCount,
        ]);
    }

    public function approvePembayaran(Request $request, Pengadaan $pengadaan): RedirectResponse
    {
        $filename = $request->input('filename', "Memo_Persetujuan_{$pengadaan->Permohonan?->nomor_surat}.pdf");
        $catatan = $request->input('catatan');

        $this->ppkService->approvePembayaran($pengadaan, auth()->user(), $filename, $catatan);

        return redirect()->route('ppk.pengajuan.index')
            ->with('success', 'Dokumen pembayaran beserta Memo Persetujuan berhasil disetujui.');
    }

    public function rejectPembayaran(TolakPermohonanRequest $request, Pengadaan $pengadaan): RedirectResponse
    {
        $this->ppkService->rejectPembayaran($pengadaan, auth()->user(), $request->validated('alasan'));

        return redirect()->route('ppk.pengajuan.index')
            ->with('success', 'Dokumen pembayaran telah ditolak beserta catatan revisi.');
    }

    public function show(Pengadaan $pengadaan): Response
    {
        $detail = $this->ppkService->getDetailPengadaan($pengadaan);
        $recentNotifications = Notification::where('user_id', auth()->id())
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();
        $unreadCount = Notification::where('user_id', auth()->id())
            ->whereNull('read_at')
            ->count();

        return Inertia::render('Ppk/Pengajuan/Show', [
            'detail' => $detail,
            'recentNotifications' => $recentNotifications,
            'unreadNotificationsCount' => $unreadCount,
        ]);
    }

    public function notifikasi(Request $request): Response
    {
        $tab = $request->query('tab', 'semua');
        $notifData = $this->ppkService->getNotifications(auth()->user(), $tab);

        return Inertia::render('Ppk/Notifikasi/Index', [
            'notifications' => $notifData['notifications'],
            'unreadCount' => $notifData['unread_count'],
            'activeTab' => $notifData['active_tab'],
        ]);
    }

    public function markAllRead(): RedirectResponse
    {
        $this->ppkService->markAllNotificationsRead(auth()->user());

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

        return Inertia::render('Ppk/Profil/Index', [
            'user' => $user,
            'recentNotifications' => $recentNotifications,
            'unreadNotificationsCount' => $unreadCount,
        ]);
    }
}
