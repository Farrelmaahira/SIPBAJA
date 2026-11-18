<?php

namespace App\Http\Controllers\Ppk;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReviewPengadaanRequest;
use App\Http\Requests\SetujuiPembayaranPpkRequest;
use App\Http\Requests\TolakPermohonanRequest;
use App\Models\Pengadaan;
use App\Services\ApprovalService;
use App\Services\NotificationService;
use App\Services\PengadaanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PpkController extends Controller
{
    public function __construct(
        private PengadaanService $pengadaanService,
        private ApprovalService $approvalService,
        private NotificationService $notificationService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = [
            'q' => $request->query('q', $request->query('search', '')),
            'search' => $request->query('search', $request->query('q', '')),
            'statuses' => $request->query('statuses', []),
            'status' => $request->query('status'),
            'bulan' => $request->query('bulan'),
            'tahun' => $request->query('tahun'),
            'unit_id' => $request->query('unit_id'),
        ];

        $perPage = (int) $request->query('per_page', 10);
        $pengajuan = $this->pengadaanService->paginatePengadaanPpk(auth()->user(), $filters, $perPage);
        $notifData = $this->notificationService->getRecentAndUnreadCount((int) auth()->id());

        return response()->json([
            'pengajuan' => $pengajuan,
            'filters' => $filters,
            'recentNotifications' => $notifData['recentNotifications'],
            'unreadNotificationsCount' => $notifData['unreadNotificationsCount'],
        ]);
    }

    public function review(Pengadaan $pengadaan): JsonResponse
    {
        $detail = $this->pengadaanService->getDetailPengadaanLengkap($pengadaan, auth()->user());
        $notifData = $this->notificationService->getRecentAndUnreadCount((int) auth()->id());

        return response()->json([
            'detail' => $detail,
            'recentNotifications' => $notifData['recentNotifications'],
            'unreadNotificationsCount' => $notifData['unreadNotificationsCount'],
        ]);
    }

    public function approve(Pengadaan $pengadaan): JsonResponse
    {
        $updated = $this->approvalService->approvePengadaanPpk($pengadaan, auth()->user());

        return response()->json([
            'message' => 'Dokumen pengadaan berhasil disetujui oleh PPK dan diteruskan ke PPBJ.',
            'data' => $updated,
        ]);
    }

    public function reject(ReviewPengadaanRequest $request, Pengadaan $pengadaan): JsonResponse
    {
        $updated = $this->approvalService->rejectPengadaanPpk(
            $pengadaan,
            auth()->user(),
            $request->alasanPenolakan()
        );

        return response()->json([
            'message' => 'Dokumen pengadaan ditolak dan dikembalikan ke PPBJ.',
            'data' => $updated,
        ]);
    }

    public function pembayaran(Pengadaan $pengadaan): JsonResponse
    {
        $detail = $this->pengadaanService->getDetailPengadaanLengkap($pengadaan, auth()->user());
        $notifData = $this->notificationService->getRecentAndUnreadCount((int) auth()->id());

        return response()->json([
            'detail' => $detail,
            'recentNotifications' => $notifData['recentNotifications'],
            'unreadNotificationsCount' => $notifData['unreadNotificationsCount'],
        ]);
    }

    public function approvePembayaran(SetujuiPembayaranPpkRequest $request, Pengadaan $pengadaan): JsonResponse
    {
        $updated = $this->approvalService->approvePembayaranPpk(
            $pengadaan,
            auth()->user(),
            $request->file('memo'),
            $request->validated('catatan')
        );

        return response()->json([
            'message' => 'Dokumen pembayaran beserta Memo Persetujuan berhasil disetujui.',
            'data' => $updated,
        ]);
    }

    public function rejectPembayaran(TolakPermohonanRequest $request, Pengadaan $pengadaan): JsonResponse
    {
        $updated = $this->approvalService->rejectPembayaranPpk(
            $pengadaan,
            auth()->user(),
            (string) $request->validated('alasan')
        );

        return response()->json([
            'message' => 'Dokumen pembayaran telah ditolak beserta catatan revisi.',
            'data' => $updated,
        ]);
    }

    public function show(Pengadaan $pengadaan): JsonResponse
    {
        $detail = $this->pengadaanService->getDetailPengadaanLengkap($pengadaan, auth()->user());
        $notifData = $this->notificationService->getRecentAndUnreadCount((int) auth()->id());

        return response()->json([
            'detail' => $detail,
            'recentNotifications' => $notifData['recentNotifications'],
            'unreadNotificationsCount' => $notifData['unreadNotificationsCount'],
        ]);
    }

    public function profil(): JsonResponse
    {
        $user = $this->pengadaanService->getProfilPengguna(auth()->user());
        $notifData = $this->notificationService->getRecentAndUnreadCount((int) auth()->id());

        return response()->json([
            'user' => $user,
            'recentNotifications' => $notifData['recentNotifications'],
            'unreadNotificationsCount' => $notifData['unreadNotificationsCount'],
        ]);
    }
}
