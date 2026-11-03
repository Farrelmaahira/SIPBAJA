<?php

namespace App\Http\Controllers\Perencanaan;

use App\Http\Controllers\Controller;
use App\Http\Requests\SimpanJenisMakRequest;
use App\Http\Requests\TolakPermohonanRequest;
use App\Http\Requests\VerifikasiPermohonanRequest;
use App\Models\Mak;
use App\Models\Permohonan;
use App\Models\User;
use App\Services\NotificationService;
use App\Services\PerencanaanService;
use App\Services\PermohonanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PerencanaanController extends Controller
{
    public function __construct(
        private PerencanaanService $perencanaanService,
        private NotificationService $notificationService,
        private PermohonanService $permohonanService
    ) {}

    public function dashboard(): JsonResponse
    {
        $data = $this->perencanaanService->getDashboardData();
        $notifData = $this->notificationService->getRecentAndUnreadCount(auth()->id());

        return response()->json([
            'stats' => $data['stats'],
            'permohonanTerbaru' => $data['permohonan_terbaru'],
            'recentNotifications' => $notifData['recentNotifications'],
            'unreadNotificationsCount' => $notifData['unreadNotificationsCount'],
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $filters = [
            'q' => $request->query('q', ''),
            'statuses' => $request->query('statuses', []),
        ];

        $permohonan = $this->perencanaanService->paginatePermohonan($filters, 10);
        $notifData = $this->notificationService->getRecentAndUnreadCount(auth()->id());

        return response()->json([
            'permohonan' => $permohonan,
            'filters' => $filters,
            'recentNotifications' => $notifData['recentNotifications'],
            'unreadNotificationsCount' => $notifData['unreadNotificationsCount'],
        ]);
    }

    public function show(Permohonan $permohonan): JsonResponse
    {
        $detail = $this->perencanaanService->getDetailPermohonan($permohonan);
        $notifData = $this->notificationService->getRecentAndUnreadCount(auth()->id());

        return response()->json([
            'detail' => $detail,
            'recentNotifications' => $notifData['recentNotifications'],
            'unreadNotificationsCount' => $notifData['unreadNotificationsCount'],
        ]);
    }

    public function downloadDokumen(Request $request, Permohonan $permohonan): StreamedResponse
    {
        $user = $request->user();
        $info = $this->permohonanService->ambilDokumen($user, $permohonan);

        $disposition = $request->query('disposition', 'attachment');
        if ($disposition === 'inline') {
            return Storage::disk('local')->response($info['path'], $info['nama_asli']);
        }

        return Storage::disk('local')->download($info['path'], $info['nama_asli']);
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

        $notifData = $this->notificationService->getRecentAndUnreadCount(auth()->id());

        return response()->json([
            'maks' => $maks,
            'ppkOptions' => $ppkOptions,
            'filters' => ['q' => $q],
            'recentNotifications' => $notifData['recentNotifications'],
            'unreadNotificationsCount' => $notifData['unreadNotificationsCount'],
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
        $notifData = $this->notificationService->getRecentAndUnreadCount(auth()->id());

        return response()->json([
            'rkakl' => $rkaklData,
            'recentNotifications' => $notifData['recentNotifications'],
            'unreadNotificationsCount' => $notifData['unreadNotificationsCount'],
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

    public function profil(): JsonResponse
    {
        $user = auth()->user()->load(['Role', 'Unit']);
        $notifData = $this->notificationService->getRecentAndUnreadCount(auth()->id());

        return response()->json([
            'user' => $user,
            'recentNotifications' => $notifData['recentNotifications'],
            'unreadNotificationsCount' => $notifData['unreadNotificationsCount'],
        ]);
    }
}
