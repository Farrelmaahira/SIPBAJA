<?php

namespace App\Http\Controllers\Ppk;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReviewPengadaanRequest;
use App\Http\Requests\SetujuiPembayaranPpkRequest;
use App\Http\Requests\SetujuiPermohonanPpkRequest;
use App\Http\Requests\TolakPermohonanRequest;
use App\Models\Dokumen;
use App\Models\Pengadaan;
use App\Models\Permohonan;
use App\Services\ApprovalService;
use App\Services\DokumenService;
use App\Services\NotificationService;
use App\Services\PengadaanService;
use App\Services\PermohonanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PpkController extends Controller
{
    public function __construct(
        private PengadaanService $pengadaanService,
        private PermohonanService $permohonanService,
        private ApprovalService $approvalService,
        private DokumenService $dokumenService,
        private NotificationService $notificationService
    ) {}

    public function dashboard(): JsonResponse
    {
        $user = auth()->user();
        $data = $this->pengadaanService->getDashboardPpk($user);
        $permohonanPaginator = $this->permohonanService->paginatePermohonanUntukPpk($user, [], 5);
        $notifData = $this->notificationService->getRecentAndUnreadCount((int) auth()->id());

        return response()->json([
            'stats' => $data['stats'],
            'pengajuanTerbaru' => $data['pengajuan_terbaru'],
            'permohonanTerbaru' => $permohonanPaginator->items(),
            'recentNotifications' => $notifData['recentNotifications'],
            'unreadNotificationsCount' => $notifData['unreadNotificationsCount'],
        ]);
    }

    public function indexPermohonan(Request $request): JsonResponse
    {
        $filters = [
            'q' => $request->query('q', $request->query('search', '')),
            'search' => $request->query('search', $request->query('q', '')),
            'status' => $request->query('status', 'semua'),
            'statuses' => $request->query('statuses', []),
            'bulan' => $request->query('bulan'),
            'tahun' => $request->query('tahun'),
            'unit_id' => $request->query('unit_id'),
        ];

        $perPage = (int) $request->query('per_page', 10);
        $permohonan = $this->permohonanService->paginatePermohonanUntukPpk(auth()->user(), $filters, $perPage);
        $notifData = $this->notificationService->getRecentAndUnreadCount((int) auth()->id());

        return response()->json([
            'message' => 'Daftar permohonan menunggu persetujuan awal PPK berhasil diambil.',
            'data' => $permohonan->items(),
            'meta' => [
                'current_page' => $permohonan->currentPage(),
                'last_page' => $permohonan->lastPage(),
                'per_page' => $permohonan->perPage(),
                'total' => $permohonan->total(),
            ],
            'permohonan' => $permohonan,
            'filters' => $filters,
            'recentNotifications' => $notifData['recentNotifications'],
            'unreadNotificationsCount' => $notifData['unreadNotificationsCount'],
        ]);
    }

    public function showPermohonan(Permohonan $permohonan): JsonResponse
    {
        $detail = $this->permohonanService->getDetailPermohonanUntukPpk($permohonan, auth()->user());
        $notifData = $this->notificationService->getRecentAndUnreadCount((int) auth()->id());

        return response()->json([
            'message' => 'Detail permohonan untuk PPK berhasil diambil.',
            'data' => $detail,
            'detail' => $detail,
            'recentNotifications' => $notifData['recentNotifications'],
            'unreadNotificationsCount' => $notifData['unreadNotificationsCount'],
        ]);
    }

    public function approvePermohonan(SetujuiPermohonanPpkRequest $request, Permohonan $permohonan): JsonResponse
    {
        $updated = $this->approvalService->approvePermohonanPpk(
            $permohonan,
            auth()->user(),
            $request->file('memo'),
            $request->validated('catatan')
        );

        return response()->json([
            'message' => 'Permohonan beserta Memo Persetujuan Surat Permohonan berhasil disetujui oleh PPK.',
            'data' => $updated,
        ]);
    }

    public function rejectPermohonan(TolakPermohonanRequest $request, Permohonan $permohonan): JsonResponse
    {
        $updated = $this->approvalService->rejectPermohonanPpk(
            $permohonan,
            auth()->user(),
            (string) $request->validated('alasan')
        );

        return response()->json([
            'message' => 'Permohonan telah ditolak oleh PPK beserta catatan alasan.',
            'data' => $updated,
        ]);
    }

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

    public function rkakl(Request $request): JsonResponse
    {
        $tahun = $request->query('tahun');
        $rkaklData = $this->dokumenService->getRkaklData($tahun, '/api/v1/ppk/rkakl/dokumen');
        $notifData = $this->notificationService->getRecentAndUnreadCount((int) auth()->id());

        return response()->json([
            'message' => 'Data Dokumen RKAKL berhasil diambil.',
            'data' => $rkaklData,
            'activeDoc' => $rkaklData['active_doc'],
            'history' => $rkaklData['history'],
            'items' => $rkaklData['items'],
            'tahun' => $rkaklData['tahun'],
            'recentNotifications' => $notifData['recentNotifications'],
            'unreadNotificationsCount' => $notifData['unreadNotificationsCount'],
        ]);
    }

    public function downloadRkakl(Request $request, ?Dokumen $dokumen = null): StreamedResponse
    {
        $fileData = $this->dokumenService->ambilDokumenRkakl($dokumen, $request->query('tahun'));

        return Storage::disk('local')->response($fileData['path'], $fileData['nama_asli'], [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$fileData['nama_asli'].'"',
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
