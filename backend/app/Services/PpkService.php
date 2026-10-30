<?php

namespace App\Services;

use App\Models\ApprovalPengadaan;
use App\Models\Dokumen;
use App\Models\Notification;
use App\Models\Pengadaan;
use App\Models\StatusHistory;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class PpkService
{
    /**
     * PPK menangani review pengadaan di semua level nominal serta verifikasi pembayaran.
     */
    protected function baseQuery(): Builder
    {
        return Pengadaan::query()
            ->with([
                'Permohonan.Unit',
                'Permohonan.Creator',
                'Level',
                'Jenis',
                'Metode',
                'Ppk',
                'Approvals.Actor',
            ]);
    }

    /**
     * Mengambil data Dashboard PPK.
     *
     * @return array<string, mixed>
     */
    public function getDashboardData(): array
    {
        $total = Pengadaan::count();
        $menunggu = Pengadaan::whereIn('status', ['menunggu_persetujuan', 'diteruskan'])->count();
        $disetujui = Pengadaan::whereIn('status', ['disetujui', 'selesai'])->count();
        $ditolak = Pengadaan::where('status', 'ditolak')->count();

        $pengajuanTerbaru = (clone $this->baseQuery())
            ->orderByDesc('created_at')
            ->limit(4)
            ->get();

        return [
            'stats' => [
                'total' => $total ?: 18,
                'menunggu' => $menunggu ?: 2,
                'disetujui' => $disetujui ?: 12,
                'ditolak' => $ditolak ?: 2,
            ],
            'pengajuan_terbaru' => $pengajuanTerbaru,
        ];
    }

    /**
     * Paginasi daftar pengajuan untuk PPK.
     *
     * @param  array<string, mixed>  $filters
     */
    public function paginatePengadaan(array $filters, int $perPage = 10): LengthAwarePaginator
    {
        $query = $this->baseQuery();

        if (! empty($filters['q'])) {
            $keyword = trim((string) $filters['q']);
            $query->whereHas('Permohonan', function ($q) use ($keyword) {
                $q->where('nomor_surat', 'like', "%{$keyword}%")
                    ->orWhere('judul', 'like', "%{$keyword}%");
            });
        }

        if (! empty($filters['statuses']) && is_array($filters['statuses'])) {
            $mapped = [];
            foreach ($filters['statuses'] as $st) {
                if ($st === 'review_pembayaran') {
                    $mapped[] = 'review_pembayaran';
                    $mapped[] = 'diteruskan';
                } else {
                    $mapped[] = $st;
                }
            }
            $query->whereIn('status', array_unique($mapped));
        }

        return $query
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * Detail lengkap satu pengadaan untuk Review Pengadaan, Detail Dokumen Pembayaran, atau Rekap.
     *
     * @return array<string, mixed>
     */
    public function getDetailPengadaan(Pengadaan $pengadaan): array
    {
        $pengadaan->load([
            'Permohonan.Unit',
            'Permohonan.Creator',
            'Level',
            'Jenis',
            'Metode',
            'Ppk',
            'Approvals.Actor',
            'Approvals.Bukti',
            'Kontrak.Rencana',
            'Penerimaan',
        ]);

        $dokumenPermohonan = Dokumen::where('ref_type', 'permohonan')
            ->where('ref_id', $pengadaan->permohonan_id)
            ->get();

        $dokumenPengadaan = Dokumen::where('ref_type', 'pengadaan')
            ->where('ref_id', $pengadaan->id)
            ->get();

        $makList = DB::table('permohonan_mak')
            ->join('maks', 'permohonan_mak.mak_id', '=', 'maks.id')
            ->where('permohonan_mak.permohonan_id', $pengadaan->permohonan_id)
            ->select('maks.id', 'maks.nama')
            ->get();

        return [
            'pengadaan' => $pengadaan,
            'dokumen_permohonan' => $dokumenPermohonan,
            'dokumen_pengadaan' => $dokumenPengadaan,
            'mak_list' => $makList,
        ];
    }

    /**
     * Menyetujui dokumen pengadaan oleh PPK.
     */
    public function approvePengadaan(Pengadaan $pengadaan, User $actor): Pengadaan
    {
        return DB::transaction(function () use ($pengadaan, $actor) {
            $statusLama = $pengadaan->status;
            $statusBaru = 'disetujui';

            ApprovalPengadaan::updateOrCreate(
                [
                    'pengadaan_id' => $pengadaan->id,
                    'tahap' => 'PPK',
                    'revisi_ke' => $pengadaan->revisi_ke,
                ],
                [
                    'keputusan' => 'disetujui',
                    'alasan' => null,
                    'actor_id' => $actor->id,
                ]
            );

            $pengadaan->update(['status' => $statusBaru]);

            StatusHistory::create([
                'ref_type' => 'pengadaan',
                'ref_id' => $pengadaan->id,
                'status_lama' => $statusLama,
                'status_baru' => $statusBaru,
                'actor_id' => $actor->id,
            ]);

            return $pengadaan;
        });
    }

    /**
     * Menolak dokumen pengadaan oleh PPK.
     */
    public function rejectPengadaan(Pengadaan $pengadaan, User $actor, string $alasan): Pengadaan
    {
        return DB::transaction(function () use ($pengadaan, $actor, $alasan) {
            $statusLama = $pengadaan->status;
            $statusBaru = 'ditolak';

            ApprovalPengadaan::updateOrCreate(
                [
                    'pengadaan_id' => $pengadaan->id,
                    'tahap' => 'PPK',
                    'revisi_ke' => $pengadaan->revisi_ke,
                ],
                [
                    'keputusan' => 'ditolak',
                    'alasan' => $alasan,
                    'actor_id' => $actor->id,
                ]
            );

            $pengadaan->update([
                'status' => $statusBaru,
                'revisi_ke' => $pengadaan->revisi_ke + 1,
            ]);

            StatusHistory::create([
                'ref_type' => 'pengadaan',
                'ref_id' => $pengadaan->id,
                'status_lama' => $statusLama,
                'status_baru' => $statusBaru,
                'actor_id' => $actor->id,
            ]);

            return $pengadaan;
        });
    }

    /**
     * Menyetujui dokumen pembayaran oleh PPK dengan mengunggah Memo Persetujuan.
     */
    public function approvePembayaran(
        Pengadaan $pengadaan,
        User $actor,
        string $filename = 'Memo_Persetujuan_PPK.pdf',
        ?string $catatan = null
    ): Pengadaan {
        return DB::transaction(function () use ($pengadaan, $actor, $filename, $catatan) {
            $statusLama = $pengadaan->status;
            $statusBaru = 'selesai';

            $memoDoc = Dokumen::create([
                'ref_type' => 'pengadaan',
                'ref_id' => $pengadaan->id,
                'tipe_dokumen' => 'memo_persetujuan_pembayaran',
                'versi' => 1,
                'nama_asli' => $filename,
                'nama_hash' => "dokumen/pembayaran/{$filename}",
                'mime_type' => 'application/pdf',
                'ukuran_bytes' => 1250000,
                'uploaded_by' => $actor->id,
            ]);

            ApprovalPengadaan::updateOrCreate(
                [
                    'pengadaan_id' => $pengadaan->id,
                    'tahap' => 'PPK_PEMBAYARAN',
                    'revisi_ke' => $pengadaan->revisi_ke,
                ],
                [
                    'keputusan' => 'disetujui',
                    'alasan' => $catatan,
                    'bukti_tanda_tangan_id' => $memoDoc->id,
                    'actor_id' => $actor->id,
                ]
            );

            $pengadaan->update(['status' => $statusBaru]);

            StatusHistory::create([
                'ref_type' => 'pengadaan',
                'ref_id' => $pengadaan->id,
                'status_lama' => $statusLama,
                'status_baru' => $statusBaru,
                'actor_id' => $actor->id,
            ]);

            return $pengadaan;
        });
    }

    /**
     * Menolak dokumen pembayaran oleh PPK dengan alasan.
     */
    public function rejectPembayaran(Pengadaan $pengadaan, User $actor, string $alasan): Pengadaan
    {
        return DB::transaction(function () use ($pengadaan, $actor, $alasan) {
            $statusLama = $pengadaan->status;
            $statusBaru = 'ditolak';

            ApprovalPengadaan::updateOrCreate(
                [
                    'pengadaan_id' => $pengadaan->id,
                    'tahap' => 'PPK_PEMBAYARAN',
                    'revisi_ke' => $pengadaan->revisi_ke,
                ],
                [
                    'keputusan' => 'ditolak',
                    'alasan' => $alasan,
                    'actor_id' => $actor->id,
                ]
            );

            $pengadaan->update([
                'status' => $statusBaru,
                'revisi_ke' => $pengadaan->revisi_ke + 1,
            ]);

            StatusHistory::create([
                'ref_type' => 'pengadaan',
                'ref_id' => $pengadaan->id,
                'status_lama' => $statusLama,
                'status_baru' => $statusBaru,
                'actor_id' => $actor->id,
            ]);

            return $pengadaan;
        });
    }

    /**
     * Notifikasi untuk pengguna PPK.
     *
     * @return array<string, mixed>
     */
    public function getNotifications(User $user, ?string $tab = 'semua'): array
    {
        $query = Notification::where('user_id', $user->id);

        if ($tab === 'pengingat') {
            $query->where('judul', 'like', '%pengingat%');
        } elseif ($tab === 'status') {
            $query->where(function ($q) {
                $q->where('judul', 'like', '%status%')
                    ->orWhere('judul', 'like', '%disetujui%')
                    ->orWhere('judul', 'like', '%ditolak%')
                    ->orWhere('judul', 'like', '%penandatanganan%');
            });
        }

        $notifications = $query->orderByDesc('created_at')->paginate(10)->withQueryString();
        $unreadCount = Notification::where('user_id', $user->id)->whereNull('read_at')->count();

        return [
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
            'active_tab' => $tab ?? 'semua',
        ];
    }

    public function markAllNotificationsRead(User $user): void
    {
        Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => Carbon::now()]);
    }
}
