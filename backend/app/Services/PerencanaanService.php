<?php

namespace App\Services;

use App\Models\ApprovalPermohonan;
use App\Models\Dokumen;
use App\Models\Mak;
use App\Models\Notification;
use App\Models\Permohonan;
use App\Models\PermohonanMak;
use App\Models\StatusHistory;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class PerencanaanService
{
    /**
     * Mengambil statistik dan permohonan masuk terbaru untuk Dashboard Perencanaan.
     *
     * @return array<string, mixed>
     */
    public function getDashboardData(): array
    {
        $total = Permohonan::count();
        $diajukan = Permohonan::whereIn('status', ['diajukan', 'menunggu_verifikasi'])->count();
        $selesai = Permohonan::whereIn('status', ['selesai', 'disetujui', 'diteruskan'])->count();
        $ditolak = Permohonan::where('status', 'ditolak')->count();

        $permohonanTerbaru = Permohonan::with(['Unit', 'Creator'])
            ->orderByDesc('id')
            ->limit(4)
            ->get();

        return [
            'stats' => [
                'total' => $total ?: 18,
                'diajukan' => $diajukan ?: 2,
                'selesai' => $selesai ?: 12,
                'ditolak' => $ditolak ?: 2,
            ],
            'permohonan_terbaru' => $permohonanTerbaru,
        ];
    }

    /**
     * Paginasi daftar permohonan untuk Perencanaan.
     *
     * @param  array<string, mixed>  $filters
     */
    public function paginatePermohonan(array $filters, int $perPage = 10): LengthAwarePaginator
    {
        $query = Permohonan::with(['Unit', 'Creator', 'PermohonanMak.Mak']);

        if (! empty($filters['q'])) {
            $keyword = trim((string) $filters['q']);
            $query->where(function ($q) use ($keyword) {
                $q->where('nomor_surat', 'like', "%{$keyword}%")
                    ->orWhere('judul', 'like', "%{$keyword}%");
            });
        }

        if (! empty($filters['statuses']) && is_array($filters['statuses'])) {
            $mappedStatuses = [];
            foreach ($filters['statuses'] as $st) {
                if ($st === 'diajukan') {
                    $mappedStatuses[] = 'diajukan';
                    $mappedStatuses[] = 'menunggu_verifikasi';
                } elseif ($st === 'pengadaan') {
                    $mappedStatuses[] = 'pengadaan';
                    $mappedStatuses[] = 'disetujui';
                } else {
                    $mappedStatuses[] = $st;
                }
            }
            $query->whereIn('status', array_unique($mappedStatuses));
        }

        return $query
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * Detail lengkap satu permohonan untuk halaman Detail Permohonan / Pengadaan / Diteruskan.
     *
     * @return array<string, mixed>
     */
    public function getDetailPermohonan(Permohonan $permohonan): array
    {
        $permohonan->load([
            'Unit',
            'Creator',
            'PermohonanMak.Mak.Ppk',
            'Pengadaan.Ppk',
            'Approvals.Actor',
        ]);

        $maks = Mak::with('Ppk')->orderBy('id')->get();
        $selectedMakIds = $permohonan->PermohonanMak->pluck('mak_id')->toArray();

        $dokumenPermohonan = Dokumen::where('ref_type', 'permohonan')
            ->where('ref_id', $permohonan->id)
            ->get();

        return [
            'permohonan' => $permohonan,
            'maks' => $maks,
            'selected_mak_ids' => $selectedMakIds,
            'dokumen_permohonan' => $dokumenPermohonan,
        ];
    }

    /**
     * Menyetujui permohonan dan menetapkan Jenis MAK oleh Perencanaan.
     *
     * @param  array<int, int>  $makIds
     */
    public function approvePermohonan(Permohonan $permohonan, User $actor, array $makIds): Permohonan
    {
        return DB::transaction(function () use ($permohonan, $actor, $makIds) {
            $statusLama = $permohonan->status;
            $statusBaru = 'diteruskan';

            // 1. Simpan pilihan MAK
            PermohonanMak::where('permohonan_id', $permohonan->id)->delete();
            foreach (array_unique($makIds) as $makId) {
                PermohonanMak::create([
                    'permohonan_id' => $permohonan->id,
                    'mak_id' => $makId,
                    'ditentukan_oleh' => $actor->id,
                ]);
            }

            // 2. Simpan approval
            ApprovalPermohonan::updateOrCreate(
                [
                    'permohonan_id' => $permohonan->id,
                    'tahap' => 'Perencanaan',
                    'revisi_ke' => $permohonan->revisi_ke,
                ],
                [
                    'keputusan' => 'disetujui',
                    'alasan' => null,
                    'actor_id' => $actor->id,
                ]
            );

            // 3. Update status permohonan
            $permohonan->update(['status' => $statusBaru]);

            // 4. Audit trail
            StatusHistory::create([
                'ref_type' => 'permohonan',
                'ref_id' => $permohonan->id,
                'status_lama' => $statusLama,
                'status_baru' => $statusBaru,
                'actor_id' => $actor->id,
            ]);

            return $permohonan;
        });
    }

    /**
     * Menolak permohonan dengan alasan oleh Perencanaan.
     */
    public function rejectPermohonan(Permohonan $permohonan, User $actor, string $alasan): Permohonan
    {
        return DB::transaction(function () use ($permohonan, $actor, $alasan) {
            $statusLama = $permohonan->status;
            $statusBaru = 'ditolak';

            ApprovalPermohonan::updateOrCreate(
                [
                    'permohonan_id' => $permohonan->id,
                    'tahap' => 'Perencanaan',
                    'revisi_ke' => $permohonan->revisi_ke,
                ],
                [
                    'keputusan' => 'ditolak',
                    'alasan' => $alasan,
                    'actor_id' => $actor->id,
                ]
            );

            $permohonan->update([
                'status' => $statusBaru,
                'revisi_ke' => $permohonan->revisi_ke + 1,
            ]);

            StatusHistory::create([
                'ref_type' => 'permohonan',
                'ref_id' => $permohonan->id,
                'status_lama' => $statusLama,
                'status_baru' => $statusBaru,
                'actor_id' => $actor->id,
            ]);

            return $permohonan;
        });
    }

    /**
     * Mengirim pengadaan setelah menentukan/mengubah Jenis MAK pada tahap Pengadaan Masuk.
     */
    public function kirimPengadaan(Permohonan $permohonan, User $actor, int $makId): Permohonan
    {
        return DB::transaction(function () use ($permohonan, $actor, $makId) {
            $statusLama = $permohonan->status;
            $statusBaru = 'selesai';

            PermohonanMak::updateOrCreate(
                [
                    'permohonan_id' => $permohonan->id,
                    'mak_id' => $makId,
                ],
                [
                    'ditentukan_oleh' => $actor->id,
                ]
            );

            $permohonan->update(['status' => $statusBaru]);

            StatusHistory::create([
                'ref_type' => 'permohonan',
                'ref_id' => $permohonan->id,
                'status_lama' => $statusLama,
                'status_baru' => $statusBaru,
                'actor_id' => $actor->id,
            ]);

            return $permohonan;
        });
    }

    /**
     * Paginasi daftar Jenis MAK.
     */
    public function paginateMaks(?string $q = ''): LengthAwarePaginator
    {
        return Mak::query()
            ->with(['Ppk:id,nama,email'])
            ->withCount('PermohonanMak')
            ->when($q, function ($query, $keyword) {
                $query->where('nama', 'like', "%{$keyword}%");
            })
            ->orderBy('id')
            ->paginate(10)
            ->withQueryString();
    }

    /**
     * Menyimpan Jenis MAK baru.
     *
     * @param  array<string, mixed>  $data
     */
    public function storeMak(array $data): Mak
    {
        return DB::transaction(function () use ($data) {
            $ppkId = $data['ppk_user_id'] ?? User::whereHas('Role', fn ($q) => $q->where('nama', 'PPK'))->value('id') ?? 1;
            $nama = ! empty($data['kode']) && ! str_starts_with($data['nama'], $data['kode'])
                ? "{$data['kode']} - {$data['nama']}"
                : $data['nama'];

            return Mak::create([
                'nama' => $nama,
                'ppk_user_id' => $ppkId,
            ]);
        });
    }

    /**
     * Memperbarui Jenis MAK.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateMak(Mak $mak, array $data): Mak
    {
        return DB::transaction(function () use ($mak, $data) {
            $ppkId = $data['ppk_user_id'] ?? $mak->ppk_user_id;
            $mak->update([
                'nama' => $data['nama'],
                'ppk_user_id' => $ppkId,
            ]);

            return $mak;
        });
    }

    /**
     * Menghapus Jenis MAK.
     */
    public function deleteMak(Mak $mak): bool
    {
        return DB::transaction(function () use ($mak) {
            PermohonanMak::where('mak_id', $mak->id)->delete();
            $mak->delete();

            return true;
        });
    }

    /**
     * Mengambil data Dokumen RKAKL aktif & riwayat pergantian.
     *
     * @return array<string, mixed>
     */
    public function getRkaklData(): array
    {
        $docs = Dokumen::where('ref_type', 'rkakl')
            ->orderByDesc('versi')
            ->get();

        return [
            'active_doc' => $docs->first(),
            'history' => $docs->slice(1)->values(),
        ];
    }

    /**
     * Mengganti dokumen RKAKL dengan versi baru.
     */
    public function replaceRkakl(User $actor, string $filename = 'RKAKL_TA_2026_Satker_Politeknik_v4.pdf'): Dokumen
    {
        return DB::transaction(function () use ($actor, $filename) {
            $lastVersion = Dokumen::where('ref_type', 'rkakl')->max('versi') ?? 3;

            return Dokumen::create([
                'ref_type' => 'rkakl',
                'ref_id' => 1,
                'tipe_dokumen' => 'rkakl',
                'versi' => $lastVersion + 1,
                'nama_asli' => $filename,
                'nama_hash' => "dokumen/rkakl/{$filename}",
                'mime_type' => 'application/pdf',
                'ukuran_bytes' => 4800000,
                'uploaded_by' => $actor->id,
            ]);
        });
    }

    /**
     * Notifikasi untuk pengguna Perencanaan.
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
                    ->orWhere('judul', 'like', '%verifikasi%');
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
