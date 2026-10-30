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
use Illuminate\Http\Request;
use Illuminate\Http\Response;

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

    public function index(Request $request): JsonResponse
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

        return response()->json([
            'permohonan' => $permohonan,
            'filters' => $filters,
            'recentNotifications' => $recentNotifications,
            'unreadNotificationsCount' => $unreadCount,
        ]);
    }

    public function show(Permohonan $permohonan): JsonResponse
    {
        $detail = $this->perencanaanService->getDetailPermohonan($permohonan);
        $recentNotifications = Notification::where('user_id', auth()->id())
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();
        $unreadCount = Notification::where('user_id', auth()->id())
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'detail' => $detail,
            'recentNotifications' => $recentNotifications,
            'unreadNotificationsCount' => $unreadCount,
        ]);
    }

    public function approve(VerifikasiPermohonanRequest $request, Permohonan $permohonan): JsonResponse
    {
        $this->perencanaanService->approvePermohonan(
            $permohonan,
            auth()->user(),
            $request->validated('mak_ids')
        );

        return response()->json([
            'message' => 'Permohonan berhasil diverifikasi dan diteruskan ke tahap berikutnya.',
        ]);
    }

    public function reject(TolakPermohonanRequest $request, Permohonan $permohonan): JsonResponse
    {
        $this->perencanaanService->rejectPermohonan(
            $permohonan,
            auth()->user(),
            $request->validated('alasan')
        );

        return response()->json([
            'message' => 'Permohonan telah ditolak dan dikembalikan ke pemohon.',
        ]);
    }

    public function kirimPengadaan(Request $request, Permohonan $permohonan): JsonResponse
    {
        $makId = (int) $request->input('mak_id', 1);
        $this->perencanaanService->kirimPengadaan($permohonan, auth()->user(), $makId);

        return response()->json([
            'message' => 'Jenis MAK pengadaan berhasil ditetapkan dan dikirim.',
        ]);
    }

    public function jenisMak(Request $request): JsonResponse
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

        return response()->json([
            'maks' => $maks,
            'ppkOptions' => $ppkOptions,
            'filters' => ['q' => $q],
            'recentNotifications' => $recentNotifications,
            'unreadNotificationsCount' => $unreadCount,
        ]);
    }

    public function storeMak(SimpanJenisMakRequest $request): JsonResponse
    {
        $mak = $this->perencanaanService->storeMak($request->validated());

        return response()->json([
            'message' => 'Jenis MAK baru berhasil ditambahkan.',
            'mak' => $mak,
        ], 201);
    }

    public function updateMak(SimpanJenisMakRequest $request, Mak $mak): JsonResponse
    {
        $mak = $this->perencanaanService->updateMak($mak, $request->validated());

        return response()->json([
            'message' => 'Jenis MAK berhasil diperbarui.',
            'mak' => $mak,
        ]);
    }

    public function destroyMak(Mak $mak): Response
    {
        $this->perencanaanService->deleteMak($mak);

        return response()->noContent();
    }

    public function rkakl(): JsonResponse
    {
        $rkaklData = $this->perencanaanService->getRkaklData();
        $recentNotifications = Notification::where('user_id', auth()->id())
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();
        $unreadCount = Notification::where('user_id', auth()->id())
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'rkakl' => $rkaklData,
            'recentNotifications' => $recentNotifications,
            'unreadNotificationsCount' => $unreadCount,
        ]);
    }

    public function storeRkakl(Request $request): JsonResponse
    {
        $filename = $request->input('filename', 'RKAKL_TA_2026_Satker_Politeknik_v4.pdf');
        $this->perencanaanService->replaceRkakl(auth()->user(), $filename);

        return response()->json([
            'message' => 'Dokumen RKAKL berhasil diperbarui dengan versi terbaru.',
        ]);
    }

    public function notifikasi(Request $request): JsonResponse
    {
        $tab = $request->query('tab', 'semua');
        $notifData = $this->perencanaanService->getNotifications(auth()->user(), $tab);

        return response()->json([
            'notifications' => $notifData['notifications'],
            'unreadCount' => $notifData['unread_count'],
            'activeTab' => $notifData['active_tab'],
        ]);
    }

    public function markAllRead(): JsonResponse
    {
        $this->perencanaanService->markAllNotificationsRead(auth()->user());

        return response()->json([
            'message' => 'Semua notifikasi telah ditandai dibaca.',
        ]);
    }

    public function markOneRead(Notification $notification): JsonResponse
    {
        if ($notification->user_id === auth()->id() && is_null($notification->read_at)) {
            $notification->update(['read_at' => now()]);
        }

        return response()->json([
            'message' => 'Notifikasi ditandai dibaca.',
        ]);
    }

    public function profil(): JsonResponse
    {
        $user = auth()->user()->load(['Role', 'Unit']);
        $recentNotifications = Notification::where('user_id', auth()->id())
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();
        $unreadCount = Notification::where('user_id', auth()->id())
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'user' => $user,
            'recentNotifications' => $recentNotifications,
            'unreadNotificationsCount' => $unreadCount,
        ]);
    }
}
