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

class PpService
{
    /**
     * Scope query pengadaan khusus yang menjadi wewenang Pejabat Pengadaan (PP):
     * Level pengadaan dengan perlu_review_pp = true (Rp50.000.000 - Rp200.000.000).
     */
    protected function baseQuery(): Builder
    {
        return Pengadaan::query()
            ->whereHas('Level', fn ($q) => $q->where('perlu_review_pp', true))
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
     * Mengambil ringkasan statistik dan antrian perlu review untuk Dashboard PP.
     *
     * @return array<string, mixed>
     */
    public function getDashboardData(): array
    {
        $base = Pengadaan::query()->whereHas('Level', fn ($q) => $q->where('perlu_review_pp', true));

        $total = (clone $base)->count();
        $menunggu = (clone $base)->where('status', 'menunggu_persetujuan')->count();
        $disetujui = (clone $base)->whereIn('status', ['disetujui', 'diteruskan', 'selesai'])->count();
        $ditolak = (clone $base)->where('status', 'ditolak')->count();

        // Data chart bulanan untuk tahun berjalan
        $currentYear = Carbon::now()->year;
        $chartBulanan = [];
        $namaBulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

        for ($m = 1; $m <= 12; $m++) {
            $approvedCount = (clone $base)
                ->whereIn('status', ['disetujui', 'diteruskan', 'selesai'])
                ->whereYear('created_at', $currentYear)
                ->whereMonth('created_at', $m)
                ->count();

            $rejectedCount = (clone $base)
                ->where('status', 'ditolak')
                ->whereYear('created_at', $currentYear)
                ->whereMonth('created_at', $m)
                ->count();

            $chartBulanan[] = [
                'bulan' => $namaBulan[$m - 1],
                'bulan_angka' => $m,
                'disetujui' => $approvedCount,
                'ditolak' => $rejectedCount,
            ];
        }

        // Pengadaan Perlu Review (maksimal 4 item)
        $pengadaanPerluReview = (clone $this->baseQuery())
            ->where('status', 'menunggu_persetujuan')
            ->orderByDesc('created_at')
            ->limit(4)
            ->get();

        return [
            'stats' => [
                'total' => $total,
                'menunggu' => $menunggu,
                'disetujui' => $disetujui,
                'ditolak' => $ditolak,
            ],
            'chart' => [
                'tahun' => $currentYear,
                'data' => $chartBulanan,
                'total_disetujui' => $disetujui,
                'total_ditolak' => $ditolak,
            ],
            'pengadaan_perlu_review' => $pengadaanPerluReview,
        ];
    }

    /**
     * Mengambil daftar pengajuan berpaginasi dengan pencarian dan filter status.
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
            $query->whereIn('status', $filters['statuses']);
        }

        return $query
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * Mendapatkan rincian lengkap satu pengadaan untuk halaman Review atau Rekap.
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

        // Dokumen terkait permohonan
        $dokumenPermohonan = Dokumen::where('ref_type', 'permohonan')
            ->where('ref_id', $pengadaan->permohonan_id)
            ->get();

        // Dokumen pengadaan (SPK/RAB/Spesifikasi)
        $dokumenPengadaan = Dokumen::where('ref_type', 'pengadaan')
            ->where('ref_id', $pengadaan->id)
            ->get();

        // Ambil MAK dari permohonan_mak
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
     * Menyetujui dokumen pengadaan oleh Pejabat Pengadaan (PP).
     */
    public function approve(Pengadaan $pengadaan, User $actor): Pengadaan
    {
        return DB::transaction(function () use ($pengadaan, $actor) {
            $statusLama = $pengadaan->status;
            $statusBaru = 'diteruskan'; // diteruskan ke PPK

            // 1. Simpan keputusan approval
            ApprovalPengadaan::updateOrCreate(
                [
                    'pengadaan_id' => $pengadaan->id,
                    'tahap' => 'PP',
                    'revisi_ke' => $pengadaan->revisi_ke,
                ],
                [
                    'keputusan' => 'disetujui',
                    'alasan' => null,
                    'actor_id' => $actor->id,
                ]
            );

            // 2. Update status pengadaan
            $pengadaan->update(['status' => $statusBaru]);

            // 3. Catat audit history
            StatusHistory::create([
                'ref_type' => 'pengadaan',
                'ref_id' => $pengadaan->id,
                'status_lama' => $statusLama,
                'status_baru' => $statusBaru,
                'actor_id' => $actor->id,
            ]);

            // 4. Kirim notifikasi ke PPK penanggung jawab
            if ($pengadaan->ppk_id) {
                Notification::create([
                    'user_id' => $pengadaan->ppk_id,
                    'channel' => 'in_app',
                    'judul' => 'Pengadaan Membutuhkan Penandatanganan',
                    'pesan' => "Pengadaan '{$pengadaan->Permohonan?->judul}' telah disetujui PP dan diteruskan untuk penandatanganan PPK.",
                    'ref_type' => 'pengadaan',
                    'ref_id' => $pengadaan->id,
                ]);
            }

            return $pengadaan;
        });
    }

    /**
     * Menolak/meminta revisi dokumen pengadaan oleh Pejabat Pengadaan (PP).
     */
    public function reject(Pengadaan $pengadaan, User $actor, string $alasan): Pengadaan
    {
        return DB::transaction(function () use ($pengadaan, $actor, $alasan) {
            $statusLama = $pengadaan->status;
            $statusBaru = 'ditolak';

            // 1. Simpan keputusan penolakan dengan alasan
            ApprovalPengadaan::updateOrCreate(
                [
                    'pengadaan_id' => $pengadaan->id,
                    'tahap' => 'PP',
                    'revisi_ke' => $pengadaan->revisi_ke,
                ],
                [
                    'keputusan' => 'ditolak',
                    'alasan' => $alasan,
                    'actor_id' => $actor->id,
                ]
            );

            // 2. Update status dan naikkan nomor revisi
            $pengadaan->update([
                'status' => $statusBaru,
                'revisi_ke' => $pengadaan->revisi_ke + 1,
            ]);

            // 3. Catat audit history
            StatusHistory::create([
                'ref_type' => 'pengadaan',
                'ref_id' => $pengadaan->id,
                'status_lama' => $statusLama,
                'status_baru' => $statusBaru,
                'actor_id' => $actor->id,
            ]);

            // 4. Kirim notifikasi ke PPBJ pembuat paket
            $ppbjUser = User::whereHas('Role', fn ($q) => $q->where('nama', 'PPBJ'))->first();
            if ($ppbjUser) {
                Notification::create([
                    'user_id' => $ppbjUser->id,
                    'channel' => 'in_app',
                    'judul' => 'Dokumen Pengadaan Perlu Revisi',
                    'pesan' => "Dokumen pengadaan '{$pengadaan->Permohonan?->judul}' dikembalikan oleh PP: {$alasan}",
                    'ref_type' => 'pengadaan',
                    'ref_id' => $pengadaan->id,
                ]);
            }

            return $pengadaan;
        });
    }

    /**
     * Mendapatkan daftar notifikasi untuk pengguna PP.
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
                    ->orWhere('judul', 'like', '%ditolak%');
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

    /**
     * Menandai semua notifikasi pengguna sebagai telah dibaca.
     */
    public function markAllNotificationsRead(User $user): void
    {
        Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => Carbon::now()]);
    }
}
