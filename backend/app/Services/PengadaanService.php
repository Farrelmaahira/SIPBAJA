<?php

namespace App\Services;

use App\Models\ApprovalPermohonan;
use App\Models\Dokumen;
use App\Models\JenisPengadaan;
use App\Models\Kontrak;
use App\Models\LevelPengadaan;
use App\Models\MetodePengadaan;
use App\Models\Pembayaran;
use App\Models\Pengadaan;
use App\Models\Permohonan;
use App\Models\PermohonanMak;
use App\Models\StatusHistory;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class PengadaanService
{
    public function __construct(
        protected NotificationService $notificationService,
        protected DokumenService $dokumenService
    ) {}

    /**
     * Mengambil konteks dan kelayakan pemecahan pengadaan untuk permohonan tertentu.
     *
     * @return array{
     *     bisaDipecah: bool,
     *     sudahDikunci: bool,
     *     sisaAnggaran: float,
     *     totalNominalPaket: float,
     *     availableMak: array<int, array{id: int, permohonan_mak_id: int, nama: string, kode: string, ppk_id: int, ppk_nama: string}>,
     *     referenceData: array{
     *         jenis: array<int, array{id: int, nama: string}>,
     *         metode: array<int, array{id: int, nama: string}>,
     *         level: array<int, array{id: int, nama: string, min_nominal: float, max_nominal: ?float, perlu_review_pp: bool}>
     *     }
     * }
     */
    public function getSplitContext(int $permohonanId): array
    {
        $permohonan = Permohonan::with([
            'PermohonanMak.Mak.Ppk',
            'Pengadaan',
            'Approvals',
        ])->findOrFail($permohonanId);

        $revisiAktif = (int) ($permohonan->revisi_ke ?? 0);

        $approvalPerencanaanSetuju = $permohonan->Approvals->contains(function ($approval) use ($revisiAktif) {
            return in_array(strtoupper((string) $approval->tahap), ['PERENCANAAN'])
                && (int) $approval->revisi_ke === $revisiAktif
                && $approval->keputusan === 'disetujui';
        });

        $approvalBidang2Setuju = $permohonan->Approvals->contains(function ($approval) use ($revisiAktif) {
            return in_array(strtoupper((string) $approval->tahap), ['BIDANG2', 'BIDANG 2'])
                && (int) $approval->revisi_ke === $revisiAktif
                && $approval->keputusan === 'disetujui';
        });

        $approvalPpkSetuju = $permohonan->Approvals->contains(function ($approval) use ($revisiAktif) {
            return in_array(strtoupper((string) $approval->tahap), ['PPK'])
                && (int) $approval->revisi_ke === $revisiAktif
                && $approval->keputusan === 'disetujui';
        });

        // Sesuai BPMN V1.3: Permohonan dapat dipecah jika telah diverifikasi Perencanaan dan disetujui Bidang 2 serta PPK
        $bisaDipecah = $approvalPerencanaanSetuju && $approvalBidang2Setuju && ($approvalPpkSetuju || in_array($permohonan->status, ['disetujui', 'diproses_ppbj'], true));

        // Permohonan langsung dikunci setelah paket pengadaan dibuat karena langsung disubmit ke reviewer
        $sudahDikunci = $permohonan->Pengadaan->isNotEmpty();

        $estimasi = (float) ($permohonan->estimasi_anggaran ?? 0);
        $sisaAnggaran = $estimasi;

        $availableMak = $permohonan->PermohonanMak
            ->filter(fn ($pm) => $pm->Mak !== null)
            ->map(fn ($pm) => [
                'id' => (int) $pm->Mak->id,
                'permohonan_mak_id' => (int) $pm->id,
                'nama' => (string) $pm->Mak->nama,
                'kode' => (string) ($pm->Mak->nama),
                'ppk_id' => (int) ($pm->Mak->Ppk?->id ?? 0),
                'ppk_nama' => (string) ($pm->Mak->Ppk?->nama ?? '-'),
            ])
            ->values()
            ->all();

        $referenceData = [
            'jenis' => JenisPengadaan::select(['id', 'nama'])->orderBy('id')->get()->toArray(),
            'metode' => MetodePengadaan::where('isActive', true)->select(['id', 'nama'])->orderBy('id')->get()->toArray(),
            'level' => LevelPengadaan::select(['id', 'nama', 'min_nominal', 'max_nominal', 'perlu_review_pp'])
                ->orderBy('min_nominal')
                ->get()
                ->toArray(),
        ];

        return [
            'bisaDipecah' => $bisaDipecah,
            'sudahDikunci' => $sudahDikunci,
            'sisaAnggaran' => $sisaAnggaran,
            'totalNominalPaket' => 0.0,
            'availableMak' => $availableMak,
            'referenceData' => $referenceData,
        ];
    }

    /**
     * Menyimpan paket pengadaan draft dalam satu operasi (bulk create).
     *
     * @param  array<int, array{
     *     permohonan_mak_id: int,
     *     jenis_id: int,
     *     metode_id: int,
     *     nominal: float,
     *     level_id?: ?int,
     *     dokumen?: ?UploadedFile
     * }>  $items
     * @return array<int, Pengadaan>
     *
     * @throws ValidationException
     */
    public function simpanDraftPengadaan(int $permohonanId, array $items, User $actor): array
    {
        $context = $this->getSplitContext($permohonanId);

        if (! $context['bisaDipecah']) {
            throw ValidationException::withMessages([
                'permohonan' => 'Permohonan belum dapat dipecah menjadi pengadaan karena belum disetujui oleh Perencanaan dan Bidang 2.',
            ]);
        }

        if ($context['sudahDikunci']) {
            throw ValidationException::withMessages([
                'permohonan' => 'Permohonan telah dikunci karena seluruh paket telah disubmit ke reviewer.',
            ]);
        }

        $permohonan = Permohonan::with(['PermohonanMak.Mak.Ppk', 'Pengadaan'])->findOrFail($permohonanId);

        $makMap = $permohonan->PermohonanMak->keyBy('id');

        return DB::transaction(function () use ($permohonan, $items, $actor, $makMap) {
            $createdPengadaan = [];

            foreach ($items as $item) {
                $permohonanMakId = (int) $item['permohonan_mak_id'];
                $pm = $makMap->get($permohonanMakId);

                if (! $pm) {
                    throw ValidationException::withMessages([
                        'permohonan_mak_id' => 'Mata Anggaran Kegiatan tidak valid untuk permohonan ini.',
                    ]);
                }

                $levelId = (int) $item['level_id'];

                $pengadaan = Pengadaan::create([
                    'permohonan_id' => $permohonan->id,
                    'permohonan_mak_id' => $pm->id,
                    'jenis_id' => (int) $item['jenis_id'],
                    'metode_id' => (int) $item['metode_id'],
                    'level_id' => $levelId,
                    'ppk_id' => $pm->Mak?->ppk_user_id,
                    'revisi_ke' => 0,
                    'status' => 'menunggu_review',
                ]);

                StatusHistory::create([
                    'ref_type' => 'pengadaan',
                    'ref_id' => $pengadaan->id,
                    'status_lama' => null,
                    'status_baru' => 'menunggu_review',
                    'actor_id' => $actor->id,
                    'created_at' => now(),
                ]);

                if (isset($item['dokumen']) && $item['dokumen'] instanceof UploadedFile) {
                    $file = $item['dokumen'];
                    $namaAsli = $file->getClientOriginalName();
                    $mimeType = $file->getMimeType() ?: 'application/octet-stream';
                    $ukuranBytes = $file->getSize();
                    $namaHash = hash('sha256', uniqid('dokumen_', true)).'.'.$file->getClientOriginalExtension();

                    $file->storeAs('dokumen_pengadaan', $namaHash, 'public');

                    Dokumen::create([
                        'ref_type' => 'pengadaan',
                        'ref_id' => $pengadaan->id,
                        'tipe_dokumen' => 'dokumen_pengadaan',
                        'versi' => 1,
                        'nama_asli' => $namaAsli,
                        'nama_hash' => $namaHash,
                        'mime_type' => $mimeType,
                        'ukuran_bytes' => $ukuranBytes,
                        'uploaded_by' => $actor->id,
                    ]);
                }

                $level = LevelPengadaan::find($levelId);
                if ($level?->perlu_review_pp) {
                    $ppUsers = User::whereHas('Role', fn ($q) => $q->where('nama', 'PP'))->pluck('id');
                    foreach ($ppUsers as $ppId) {
                        $this->notificationService->send(
                            user: (int) $ppId,
                            judul: 'Dokumen Pengadaan Baru Perlu Diverifikasi',
                            pesan: "Dokumen pengadaan paket #{$pengadaan->id} ('{$permohonan->judul}') telah diajukan oleh PPBJ dan menunggu verifikasi PP.",
                            refType: 'pengadaan',
                            refId: $pengadaan->id,
                        );
                    }
                } elseif ($pengadaan->ppk_id) {
                    $this->notificationService->send(
                        user: (int) $pengadaan->ppk_id,
                        judul: 'Dokumen Pengadaan Baru Perlu Otorisasi',
                        pesan: "Dokumen pengadaan paket #{$pengadaan->id} ('{$permohonan->judul}') telah diajukan oleh PPBJ dan menunggu otorisasi PPK.",
                        refType: 'pengadaan',
                        refId: $pengadaan->id,
                    );
                }

                $createdPengadaan[] = $pengadaan;
            }

            return $createdPengadaan;
        });
    }

    /**
     * Menghapus paket pengadaan yang masih berstatus draft beserta dokumennya.
     *
     * @throws ValidationException
     */
    public function hapusDraftPengadaan(int $pengadaanId, User $actor): void
    {
        $pengadaan = Pengadaan::with('Dokumen')->findOrFail($pengadaanId);

        if (! in_array($pengadaan->status, ['draft', 'menunggu_review'], true)) {
            throw ValidationException::withMessages([
                'pengadaan' => 'Paket pengadaan tidak dapat dihapus karena sudah diproses lanjut.',
            ]);
        }

        DB::transaction(function () use ($pengadaan) {
            foreach ($pengadaan->Dokumen as $dokumen) {
                if ($dokumen->nama_hash) {
                    Storage::disk('public')->delete('dokumen_pengadaan/'.$dokumen->nama_hash);
                }
                $dokumen->delete();
            }

            $pengadaan->delete();
        });
    }

    /**
     * Mengirim seluruh paket pengadaan draft ke reviewer dan mengunci permohonan.
     *
     * @throws ValidationException
     */
    public function submitKeReviewer(int $permohonanId, User $actor): void
    {
        $permohonan = Permohonan::with(['Pengadaan.Dokumen'])->findOrFail($permohonanId);

        if ($permohonan->Pengadaan->isEmpty()) {
            throw ValidationException::withMessages([
                'pengadaan' => 'Minimal harus ada satu paket pengadaan sebelum disubmit ke reviewer.',
            ]);
        }

        $pendingPackages = $permohonan->Pengadaan->filter(fn ($p) => in_array($p->status, ['draft', 'menunggu_review'], true));

        if ($pendingPackages->isEmpty()) {
            throw ValidationException::withMessages([
                'pengadaan' => 'Seluruh paket pengadaan telah diproses oleh reviewer sebelumnya.',
            ]);
        }

        // Validasi setiap paket: harus ada dokumen pengadaan dan field wajib lengkap
        foreach ($pendingPackages as $paket) {
            $hasDokumen = $paket->Dokumen->contains(fn ($d) => $d->tipe_dokumen === 'dokumen_pengadaan');
            if (! $hasDokumen) {
                throw ValidationException::withMessages([
                    'dokumen' => 'Setiap paket pengadaan wajib memiliki berkas dokumen pengadaan sebelum dikirim ke reviewer.',
                ]);
            }

            if (! $paket->permohonan_mak_id || ! $paket->jenis_id || ! $paket->metode_id || ! $paket->level_id) {
                throw ValidationException::withMessages([
                    'paket' => 'Seluruh informasi paket (MAK, Jenis, Metode, dan Level) wajib diisi lengkap.',
                ]);
            }
        }

        DB::transaction(function () use ($pendingPackages, $actor) {
            foreach ($pendingPackages as $paket) {
                $statusLama = $paket->status;
                $paket->status = 'menunggu_review';
                $paket->save();

                StatusHistory::create([
                    'ref_type' => 'pengadaan',
                    'ref_id' => $paket->id,
                    'status_lama' => $statusLama,
                    'status_baru' => 'menunggu_review',
                    'actor_id' => $actor->id,
                    'created_at' => now(),
                ]);
            }
        });
    }

    /**
     * Menentukan ID level pengadaan berdasarkan batas nominal.
     *
     * @param  Collection<int, LevelPengadaan>  $levels
     */
    private function resolveLevelId(float $nominal, Collection $levels): int
    {
        foreach ($levels as $level) {
            $min = (float) $level->min_nominal;
            $max = $level->max_nominal !== null ? (float) $level->max_nominal : null;

            if ($max !== null) {
                if ($nominal >= $min && $nominal <= $max) {
                    return (int) $level->id;
                }
            } else {
                if ($nominal >= $min) {
                    return (int) $level->id;
                }
            }
        }

        return (int) ($levels->first()?->id ?? 1);
    }

    /**
     * @return array<string, mixed>
     */
    public function getDetailPengadaanPerencanaan(Pengadaan $pengadaan): array
    {
        $pengadaan->load([
            'Permohonan.Unit',
            'Permohonan.Creator',
            'Permohonan.PermohonanMak.Mak.Ppk',
            'PermohonanMak.Mak.Ppk',
            'Level',
            'Jenis',
            'Metode',
            'Ppk',
            'Approvals.Actor',
            'Dokumen',
        ]);

        $revisiAktif = (int) ($pengadaan->revisi_ke ?? 0);
        $ppkSudahSetuju = $pengadaan->Approvals->contains(function ($approval) use ($revisiAktif) {
            return strtoupper((string) $approval->tahap) === 'PPK'
                && (int) $approval->revisi_ke === $revisiAktif
                && $approval->keputusan === 'disetujui';
        }) || in_array($pengadaan->status, ['disetujui', 'selesai'], true);

        $opsiPermohonanMak = $pengadaan->Permohonan?->PermohonanMak
            ?->filter(fn ($pm) => $pm->Mak !== null)
            ->map(fn ($pm) => [
                'permohonan_mak_id' => (int) $pm->id,
                'mak_id' => (int) $pm->mak_id,
                'kode' => (string) ($pm->Mak->kode ?? $pm->Mak->nama),
                'nama' => (string) $pm->Mak->nama,
                'ppk_user_id' => (int) ($pm->Mak->ppk_user_id ?? 0),
                'ppk_nama' => (string) ($pm->Mak->Ppk?->nama ?? '-'),
            ])
            ->values()
            ->all() ?? [];

        return [
            'pengadaan' => $pengadaan,
            'dokumen_pengadaan' => $pengadaan->Dokumen,
            'bisa_ubah_mak' => ! $ppkSudahSetuju,
            'opsi_permohonan_mak' => $opsiPermohonanMak,
        ];
    }

    /**
     * @throws ValidationException
     */
    public function perbaikiJenisMakPengadaan(Pengadaan $pengadaan, User $actor, int $permohonanMakId): Pengadaan
    {
        $pengadaan->loadMissing(['Approvals', 'Permohonan', 'PermohonanMak.Mak.Ppk']);

        $revisiAktif = (int) ($pengadaan->revisi_ke ?? 0);
        $ppkSudahSetuju = $pengadaan->Approvals->contains(function ($approval) use ($revisiAktif) {
            return strtoupper((string) $approval->tahap) === 'PPK'
                && (int) $approval->revisi_ke === $revisiAktif
                && $approval->keputusan === 'disetujui';
        }) || in_array($pengadaan->status, ['disetujui', 'selesai'], true);

        if ($ppkSudahSetuju) {
            throw ValidationException::withMessages([
                'permohonan_mak_id' => ['Jenis MAK tidak dapat diperbaiki karena Dokumen Pengadaan sudah disetujui oleh PPK.'],
            ]);
        }

        $permohonanMakBaru = PermohonanMak::with('Mak.Ppk')
            ->where('id', $permohonanMakId)
            ->where('permohonan_id', $pengadaan->permohonan_id)
            ->first();

        if (! $permohonanMakBaru || ! $permohonanMakBaru->Mak) {
            throw ValidationException::withMessages([
                'permohonan_mak_id' => ['Jenis MAK harus dipilih dari daftar Jenis MAK yang sudah ditetapkan pada permohonan ini.'],
            ]);
        }

        return DB::transaction(function () use ($pengadaan, $actor, $permohonanMakBaru) {
            $ppkLamaId = $pengadaan->ppk_id ? (int) $pengadaan->ppk_id : null;
            $ppkBaruId = $permohonanMakBaru->Mak?->ppk_user_id ? (int) $permohonanMakBaru->Mak->ppk_user_id : null;
            $statusSekarang = (string) ($pengadaan->status ?: 'menunggu_review');

            $pengadaan->update([
                'permohonan_mak_id' => $permohonanMakBaru->id,
                'ppk_id' => $ppkBaruId,
            ]);

            StatusHistory::create([
                'ref_type' => 'pengadaan',
                'ref_id' => $pengadaan->id,
                'status_lama' => $statusSekarang,
                'status_baru' => $statusSekarang,
                'actor_id' => $actor->id,
            ]);

            $notifService = app(NotificationService::class);
            $judulPermohonan = $pengadaan->Permohonan?->judul ?? "Pengadaan #{$pengadaan->id}";
            $namaMakBaru = $permohonanMakBaru->Mak?->nama ?? '-';

            // Notifikasi ke PPBJ
            $ppbjUsers = User::whereHas('Role', fn ($q) => $q->where('nama', 'PPBJ'))->pluck('id');
            foreach ($ppbjUsers as $ppbjId) {
                $notifService->send(
                    user: (int) $ppbjId,
                    judul: 'Perubahan Jenis MAK Dokumen Pengadaan',
                    pesan: "Perencanaan telah mengubah Jenis MAK pada pengadaan '{$judulPermohonan}' menjadi '{$namaMakBaru}'.",
                    refType: 'pengadaan',
                    refId: $pengadaan->id,
                );
            }

            // Notifikasi ke PPK lama bila berubah
            if ($ppkLamaId && $ppkLamaId !== $ppkBaruId) {
                $notifService->send(
                    user: $ppkLamaId,
                    judul: 'Pengalihan Penugasan PPK Pengadaan',
                    pesan: "Penugasan PPK untuk pengadaan '{$judulPermohonan}' dialihkan mengikuti perubahan Jenis MAK ke '{$namaMakBaru}'.",
                    refType: 'pengadaan',
                    refId: $pengadaan->id,
                );
            }

            // Notifikasi ke PPK baru
            if ($ppkBaruId) {
                $notifService->send(
                    user: $ppkBaruId,
                    judul: 'Penugasan PPK Baru dari Perubahan Jenis MAK',
                    pesan: "Pengadaan '{$judulPermohonan}' kini terikat pada Jenis MAK '{$namaMakBaru}' di bawah kewenangan Anda.",
                    refType: 'pengadaan',
                    refId: $pengadaan->id,
                );
            }

            return $pengadaan->fresh([
                'Permohonan.Unit',
                'PermohonanMak.Mak.Ppk',
                'Ppk',
                'Jenis',
                'Metode',
                'Level',
            ]);
        });
    }

    protected function baseQueryPp(): Builder
    {
        return Pengadaan::query()
            ->whereHas('Level', fn ($q) => $q->where('perlu_review_pp', true))
            ->with([
                'Permohonan.Unit',
                'Permohonan.Creator',
                'PermohonanMak.Mak.Ppk',
                'Level',
                'Jenis',
                'Metode',
                'Ppk',
                'Approvals.Actor',
            ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function getDashboardPp(): array
    {
        $base = Pengadaan::query()->whereHas('Level', fn ($q) => $q->where('perlu_review_pp', true));
        $total = (clone $base)->count();
        $menunggu = (clone $base)->whereIn('status', ['menunggu_persetujuan', 'menunggu_review'])->count();
        $disetujui = (clone $base)->whereIn('status', ['disetujui', 'diteruskan', 'selesai'])->count();
        $ditolak = (clone $base)->where('status', 'ditolak')->count();

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

        $pengadaanPerluReview = (clone $this->baseQueryPp())
            ->whereIn('status', ['menunggu_persetujuan', 'menunggu_review'])
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
     * @param  array<string, mixed>  $filters
     */
    public function paginatePengadaanPp(array $filters, int $perPage = 10): LengthAwarePaginator
    {
        $query = $this->baseQueryPp();

        $keyword = trim((string) ($filters['q'] ?? $filters['search'] ?? ''));
        if ($keyword !== '') {
            $query->whereHas('Permohonan', function ($q) use ($keyword) {
                $q->where('nomor_surat', 'like', "%{$keyword}%")
                    ->orWhere('judul', 'like', "%{$keyword}%");
            });
        }

        if (! empty($filters['statuses']) && is_array($filters['statuses'])) {
            $query->whereIn('status', $filters['statuses']);
        } elseif (! empty($filters['status']) && $filters['status'] !== 'semua') {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['bulan']) && is_numeric($filters['bulan'])) {
            $query->whereMonth('created_at', (int) $filters['bulan']);
        }

        if (! empty($filters['tahun']) && is_numeric($filters['tahun'])) {
            $query->whereYear('created_at', (int) $filters['tahun']);
        }

        if (! empty($filters['unit_id']) && is_numeric($filters['unit_id'])) {
            $unitId = (int) $filters['unit_id'];
            $query->whereHas('Permohonan', fn ($q) => $q->where('unit_id', $unitId));
        }

        return $query
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * @return array<string, mixed>
     */
    public function getDetailPengadaanLengkap(Pengadaan $pengadaan, ?User $actor = null): array
    {
        $pengadaan->load([
            'Permohonan.Unit',
            'Permohonan.Creator',
            'PermohonanMak.Mak.Ppk',
            'Level',
            'Jenis',
            'Metode',
            'Ppk',
            'Approvals.Actor',
            'Approvals.Bukti',
            'Kontrak.Rencana.Pembayaran',
            'Penerimaan',
        ]);

        if ($actor && $actor->hasRole('PP') && ! $pengadaan->Level?->perlu_review_pp) {
            abort(403, 'Dokumen pengadaan ini tidak berada dalam kewenangan review PP (Rp50.000.000 - Rp200.000.000).');
        }

        if ($actor && $actor->hasRole('PPK')) {
            $makPpkId = $pengadaan->PermohonanMak?->Mak?->ppk_user_id;
            if ($pengadaan->ppk_id !== null || $makPpkId !== null) {
                $cocok = ((int) $pengadaan->ppk_id === (int) $actor->id)
                    || ((int) $makPpkId === (int) $actor->id);
                if (! $cocok) {
                    abort(403, 'Anda tidak memiliki akses pada dokumen pengadaan milik PPK lain.');
                }
            }

            // FR-49: Khusus endpoint review (/review), dokumen 50-200jt harus telah berstatus 'diteruskan'.
            // Namun untuk endpoint detail (/pengajuan/{id}), PPK tetap diizinkan melihat data pratinjau.
            $isReviewRoute = request()->is('*/review*');
            if ($isReviewRoute && $pengadaan->Level?->perlu_review_pp && ! in_array($pengadaan->status, ['diteruskan', 'disetujui', 'selesai'])) {
                abort(403, 'Dokumen pengadaan ini belum diverifikasi oleh Pejabat Pengadaan (PP).');
            }
        }

        $dokumenPermohonan = Dokumen::where('ref_type', 'permohonan')
            ->where('ref_id', $pengadaan->permohonan_id)
            ->get()
            ->map(function (Dokumen $d) use ($pengadaan, $actor) {
                $base = $actor?->hasRole('PPK') ? 'ppk' : 'pp';
                $d->download_url = "/api/v1/{$base}/pengajuan/{$pengadaan->id}/dokumen/{$d->id}";

                return $d;
            });

        $dokumenPengadaan = Dokumen::where('ref_type', 'pengadaan')
            ->where('ref_id', $pengadaan->id)
            ->latest('id')
            ->take(1)
            ->get()
            ->map(function (Dokumen $d) use ($pengadaan, $actor) {
                $base = $actor?->hasRole('PPK') ? 'ppk' : 'pp';
                $d->download_url = "/api/v1/{$base}/pengajuan/{$pengadaan->id}/dokumen/{$d->id}";

                return $d;
            });

        $memoPermohonan = $this->permohonanMemos($pengadaan, $actor);

        $makList = DB::table('permohonan_mak')
            ->join('maks', 'permohonan_mak.mak_id', '=', 'maks.id')
            ->where('permohonan_mak.permohonan_id', $pengadaan->permohonan_id)
            ->select('maks.id', 'maks.nama')
            ->get();

        return [
            'pengadaan' => $pengadaan,
            'dokumen_permohonan' => $dokumenPermohonan,
            'dokumen_pengadaan' => $dokumenPengadaan,
            'memo_permohonan' => $memoPermohonan,
            'mak_list' => $makList,
            'tracking' => $this->buildTrackingData($pengadaan),
        ];
    }

    /**
     * Mengambil memo persetujuan Bidang 2 dan PPK yang tersimpan sebagai dokumen approval_permohonan.
     *
     * @return Collection<int, Dokumen>
     */
    protected function permohonanMemos(Pengadaan $pengadaan, ?User $actor): Collection
    {
        return ApprovalPermohonan::where('permohonan_id', $pengadaan->permohonan_id)
            ->where('keputusan', 'disetujui')
            ->whereNotNull('memo_dokumen_id')
            ->with('Memo')
            ->orderBy('id')
            ->get()
            ->filter(fn (ApprovalPermohonan $approval) => $approval->Memo !== null)
            ->map(function (ApprovalPermohonan $approval) use ($pengadaan, $actor) {
                $memo = $approval->Memo;
                $tahap = strtoupper((string) $approval->tahap);

                $memo->tipe_dokumen = $tahap === 'BIDANG2' ? 'memo_persetujuan_bidang2' : 'memo_persetujuan_ppk';
                $memo->tahap = $tahap;
                $memo->download_url = $actor?->hasRole('PPK')
                    ? "/api/v1/ppk/pengajuan/{$pengadaan->id}/dokumen/{$memo->id}"
                    : "/api/v1/pp/pengajuan/{$pengadaan->id}/dokumen/{$memo->id}";

                return $memo;
            })
            ->values();
    }

    protected function baseQueryPpk(User $ppk): Builder
    {
        return Pengadaan::query()
            ->where(function (Builder $q) use ($ppk) {
                $q->where('ppk_id', $ppk->id)
                    ->orWhereHas('PermohonanMak.Mak', fn ($sub) => $sub->where('ppk_user_id', $ppk->id));
            })
            ->with([
                'Permohonan.Unit',
                'Permohonan.Creator',
                'PermohonanMak.Mak.Ppk',
                'Level',
                'Jenis',
                'Metode',
                'Ppk',
                'Approvals.Actor',
            ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function getDashboardPpk(User $ppk): array
    {
        $base = $this->baseQueryPpk($ppk);

        $total = (clone $base)->count();
        $menunggu = (clone $base)->whereIn('status', ['menunggu_persetujuan', 'menunggu_review', 'diteruskan'])->count();
        $disetujui = (clone $base)->whereIn('status', ['disetujui', 'selesai'])->count();
        $ditolak = (clone $base)->where('status', 'ditolak')->count();

        $pengajuanTerbaru = (clone $base)
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
            'pengajuan_terbaru' => $pengajuanTerbaru,
        ];
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginatePengadaanPpk(User $ppk, array $filters, int $perPage = 10): LengthAwarePaginator
    {
        $query = $this->baseQueryPpk($ppk);

        $keyword = trim((string) ($filters['q'] ?? $filters['search'] ?? ''));
        if ($keyword !== '') {
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
        } elseif (! empty($filters['status']) && $filters['status'] !== 'semua') {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['bulan']) && is_numeric($filters['bulan'])) {
            $query->whereMonth('created_at', (int) $filters['bulan']);
        }

        if (! empty($filters['tahun']) && is_numeric($filters['tahun'])) {
            $query->whereYear('created_at', (int) $filters['tahun']);
        }

        if (! empty($filters['unit_id']) && is_numeric($filters['unit_id'])) {
            $unitId = (int) $filters['unit_id'];
            $query->whereHas('Permohonan', fn ($q) => $q->where('unit_id', $unitId));
        }

        return $query
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function getProfilPengguna(User $user): User
    {
        return $user->load(['Role', 'Unit']);
    }

    public function paginatePengadaanPpbj(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = Pengadaan::query()->with([
            'Permohonan.Unit',
            'PermohonanMak.Mak.Ppk',
            'Jenis',
            'Metode',
            'Level',
            'Ppk',
            'Kontrak',
            'Penerimaan',
        ]);

        $keyword = trim((string) ($filters['q'] ?? $filters['search'] ?? ''));
        if ($keyword !== '') {
            $query->where(function (Builder $sub) use ($keyword) {
                $sub->whereHas('Permohonan', function ($q) use ($keyword) {
                    $q->where('nomor_surat', 'like', "%{$keyword}%")
                        ->orWhere('judul', 'like', "%{$keyword}%");
                })->orWhereHas('Kontrak', function ($q) use ($keyword) {
                    $q->where('vendor_nama', 'like', "%{$keyword}%")
                        ->orWhere('nomor', 'like', "%{$keyword}%");
                });
            });
        }

        if (! empty($filters['statuses']) && is_array($filters['statuses'])) {
            $query->whereIn('status', $filters['statuses']);
        } elseif (! empty($filters['status']) && $filters['status'] !== 'semua') {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['bulan']) && is_numeric($filters['bulan'])) {
            $query->whereMonth('created_at', (int) $filters['bulan']);
        }

        if (! empty($filters['tahun']) && is_numeric($filters['tahun'])) {
            $query->whereYear('created_at', (int) $filters['tahun']);
        }

        return $query
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function getDetailPengadaanPpbj(int $pengadaanId): Pengadaan
    {
        $pengadaan = Pengadaan::with([
            'Permohonan.Unit',
            'Permohonan.Creator',
            'Permohonan.PermohonanMak.Mak',
            'PermohonanMak.Mak.Ppk',
            'Jenis',
            'Metode',
            'Level',
            'Ppk',
            'Kontrak.RencanaPembayaran.Reminders',
            'Kontrak.Dokumen',
            'Penerimaan',
            'Approvals.Actor',
            'Dokumen' => fn ($query) => $query->latest('id'),
        ])->findOrFail($pengadaanId);

        $isBarangDiterima = $pengadaan->Penerimaan !== null || in_array($pengadaan->status, ['barang_diterima', 'selesai'], true);
        $pengadaan->bisa_edit_draft = in_array($pengadaan->status, ['draft', 'ditolak'], true);
        $pengadaan->bisa_edit_kontrak = in_array($pengadaan->status, ['disetujui', 'siap_spk', 'kontrak_terbit', 'berjalan'], true) && ! $isBarangDiterima;

        $kontrak = $pengadaan->Kontrak;
        $pengadaan->nominal = $kontrak?->nominal_kontrak ? (float) $kontrak->nominal_kontrak : null;

        // Pasang download_url untuk dokumen pengadaan
        $pengadaan->Dokumen->each(function (Dokumen $d) use ($pengadaan) {
            $d->download_url = "/api/v1/ppbj/pengadaan/{$pengadaan->id}/dokumen/{$d->id}";
        });

        if ($kontrak) {
            $rencana = $kontrak->RencanaPembayaran?->first();
            $reminder = $rencana?->Reminders?->first();
            $kontrak->tanggal_jatuh_tempo = $rencana?->tanggal_jatuh_tempo ? Carbon::parse($rencana->tanggal_jatuh_tempo)->format('Y-m-d') : null;
            $kontrak->tanggal_reminder = $reminder?->tanggal_reminder ? Carbon::parse($reminder->tanggal_reminder)->format('Y-m-d') : null;

            if ($kontrak->Dokumen) {
                $kontrak->Dokumen->each(function (Dokumen $d) use ($pengadaan) {
                    $d->download_url = "/api/v1/ppbj/pengadaan/{$pengadaan->id}/dokumen/{$d->id}";
                });
                $kontrak->dokumen = $kontrak->Dokumen->first();
                $kontrak->dokumen_items = $kontrak->Dokumen->values();
            }
        }

        // Data MAK untuk kemudahan akses frontend & konsistensi pengeditan
        $pengadaan->mak = [
            'id' => $pengadaan->PermohonanMak?->Mak?->id,
            'permohonan_mak_id' => $pengadaan->permohonan_mak_id,
            'nama' => $pengadaan->PermohonanMak?->Mak?->nama ?? '-',
            'kode' => $pengadaan->PermohonanMak?->Mak?->kode ?? '-',
            'ppk_nama' => $pengadaan->Ppk?->nama ?? $pengadaan->PermohonanMak?->Mak?->Ppk?->nama ?? '-',
        ];

        // Format dokumen_list & unit_nama untuk kompatibilitas frontend
        $pengadaan->dokumen_list = $pengadaan->Dokumen->take(1)->values();
        if ($pengadaan->Permohonan) {
            $pengadaan->Permohonan->unit_nama = $pengadaan->Permohonan->Unit?->nama ?? '-';
        }

        if ($pengadaan->Approvals) {
            $pengadaan->Approvals->each(function ($app) {
                $app->catatan = $app->alasan;
                $app->actor_nama = $app->Actor?->nama ?? '-';
            });
        }

        // Available MAK & Reference data untuk form modal klasifikasi
        $pengadaan->available_mak = $pengadaan->Permohonan?->PermohonanMak
            ?->filter(fn ($pm) => $pm->Mak !== null)
            ->map(fn ($pm) => [
                'id' => (int) $pm->id,
                'mak_id' => (int) $pm->Mak->id,
                'nama' => (string) $pm->Mak->nama,
                'kode' => (string) ($pm->Mak->kode ?? $pm->Mak->nama),
            ])->values()->all() ?? [];

        $pengadaan->reference_data = [
            'jenis' => JenisPengadaan::select(['id', 'nama'])->orderBy('id')->get()->toArray(),
            'metode' => MetodePengadaan::where(function ($q) use ($pengadaan) {
                $q->where('isActive', true)
                    ->when($pengadaan->metode_id, fn ($sub) => $sub->orWhere('id', $pengadaan->metode_id));
            })->select(['id', 'nama'])->orderBy('id')->get()->toArray(),
            'level' => LevelPengadaan::select(['id', 'nama', 'min_nominal', 'max_nominal', 'perlu_review_pp'])->orderBy('min_nominal')->get()->toArray(),
        ];

        // FR-05: Tracking status history dan timeline
        $pengadaan->setAttribute('tracking', $this->buildTrackingData($pengadaan));

        return $pengadaan;
    }

    public function updateKlasifikasiPengadaan(Pengadaan $pengadaan, array $data, ?UploadedFile $fileDokumen, User $user): Pengadaan
    {
        if (! in_array($pengadaan->status, ['draft', 'ditolak'], true)) {
            throw ValidationException::withMessages([
                'status' => 'Klasifikasi pengadaan hanya dapat diperbarui jika berstatus draf atau revisi/ditolak.',
            ]);
        }

        return DB::transaction(function () use ($pengadaan, $data, $fileDokumen, $user) {
            $statusSebelumnya = $pengadaan->status;

            $pengadaan->permohonan_mak_id = $data['permohonan_mak_id'];
            $pengadaan->jenis_id = $data['jenis_id'];
            $pengadaan->metode_id = $data['metode_id'];
            $pengadaan->level_id = $data['level_id'];

            if ($statusSebelumnya === 'ditolak') {
                $pengadaan->status = 'menunggu_review';
            }

            $pengadaan->save();

            if ($fileDokumen) {
                $namaHash = $fileDokumen->hashName();
                $path = $fileDokumen->storeAs('dokumen/pengadaan', $namaHash, 'local');

                $versiBaru = ((int) Dokumen::where('ref_type', 'pengadaan')
                    ->where('ref_id', $pengadaan->id)
                    ->where('tipe_dokumen', 'dokumen_pengadaan')
                    ->max('versi')) + 1;

                Dokumen::create([
                    'ref_type' => 'pengadaan',
                    'ref_id' => $pengadaan->id,
                    'tipe_dokumen' => 'dokumen_pengadaan',
                    'versi' => $versiBaru > 0 ? $versiBaru : 1,
                    'nama_asli' => $fileDokumen->getClientOriginalName(),
                    'nama_hash' => $namaHash,
                    'ukuran_bytes' => $fileDokumen->getSize(),
                    'mime_type' => $fileDokumen->getClientMimeType() ?: 'application/pdf',
                    'uploaded_by' => $user->id,
                ]);
            }

            StatusHistory::create([
                'ref_type' => 'pengadaan',
                'ref_id' => $pengadaan->id,
                'status_lama' => $statusSebelumnya,
                'status_baru' => $pengadaan->status,
                'actor_id' => $user->id,
                'created_at' => now(),
            ]);

            if ($statusSebelumnya === 'ditolak') {
                $pengadaan->loadMissing('Level', 'Permohonan');
                if ($pengadaan->Level?->perlu_review_pp) {
                    $ppUsers = User::whereHas('Role', fn ($q) => $q->where('nama', 'PP'))->pluck('id');
                    foreach ($ppUsers as $ppId) {
                        $this->notificationService->send(
                            user: (int) $ppId,
                            judul: 'Dokumen Pengadaan Telah Direvisi',
                            pesan: "Dokumen pengadaan paket #{$pengadaan->id} ('{$pengadaan->Permohonan?->judul}') telah direvisi oleh PPBJ dan dikirim kembali untuk diverifikasi.",
                            refType: 'pengadaan',
                            refId: $pengadaan->id,
                        );
                    }
                } elseif ($pengadaan->ppk_id) {
                    $this->notificationService->send(
                        user: (int) $pengadaan->ppk_id,
                        judul: 'Dokumen Pengadaan Telah Direvisi',
                        pesan: "Dokumen pengadaan paket #{$pengadaan->id} ('{$pengadaan->Permohonan?->judul}') telah direvisi oleh PPBJ dan dikirim kembali untuk diotorisasi.",
                        refType: 'pengadaan',
                        refId: $pengadaan->id,
                    );
                }
            }

            return $pengadaan->fresh(['Permohonan', 'PermohonanMak.Mak', 'Jenis', 'Metode', 'Level', 'Ppk']);
        });
    }

    public function simpanAtauPerbaruiKontrak(Pengadaan $pengadaan, array $data, ?UploadedFile $fileDokumen, User $user, array $multiDokumen = []): Kontrak
    {
        $isBarangDiterima = $pengadaan->Penerimaan !== null || in_array($pengadaan->status, ['barang_diterima', 'selesai'], true);
        if ($isBarangDiterima) {
            throw ValidationException::withMessages([
                'status' => 'Data kontrak dan vendor telah dikunci karena barang telah diterima oleh Perlengkapan.',
            ]);
        }

        return DB::transaction(function () use ($pengadaan, $data, $fileDokumen, $user, $multiDokumen) {
            $kontrak = Kontrak::firstOrNew(['pengadaan_id' => $pengadaan->id]);
            $kontrak->tipe = $data['tipe'] ?? ($kontrak->tipe ?: 'SPK');
            $kontrak->nomor = $data['nomor'] ?? ($kontrak->nomor ?: ('PENGADAAN-'.$pengadaan->id));
            $kontrak->tanggal = $data['tanggal'] ?? ($kontrak->tanggal ?: now()->toDateString());
            $kontrak->vendor_nama = $data['vendor_nama'];
            $kontrak->nominal_kontrak = $data['nominal_kontrak'];
            $kontrak->save();

            // Simpan / update rencana pembayaran termin 1 jika tanggal tersedia
            $tanggalJatuhTempo = $data['tanggal_jatuh_tempo'] ?? ($kontrak->tanggal ?: now()->toDateString());
            $tanggalReminder = $data['tanggal_reminder'] ?? $tanggalJatuhTempo;

            $rencana = $kontrak->RencanaPembayaran()->firstOrNew(['termin_ke' => 1]);
            $rencana->nominal_rencana = $data['nominal_kontrak'];
            $rencana->tanggal_jatuh_tempo = $tanggalJatuhTempo;
            $rencana->status = $rencana->status ?: 'menunggu';
            $rencana->created_at = $rencana->created_at ?: now();
            $rencana->save();

            // Simpan / update reminder
            $reminder = $rencana->Reminders()->firstOrNew(['jenis' => 'pembayaran']);
            $reminder->tanggal_reminder = $tanggalReminder;
            $reminder->dibuat_oleh = $user->id;
            $reminder->save();

            // Helper simpan dokumen
            $saveDoc = function (UploadedFile $file, string $tipeDokumen) use ($kontrak, $user) {
                $namaHash = $file->hashName();
                $file->storeAs('dokumen/kontrak', $namaHash, 'local');

                $versiBaru = ((int) Dokumen::where('ref_type', 'kontrak')
                    ->where('ref_id', $kontrak->id)
                    ->where('tipe_dokumen', $tipeDokumen)
                    ->max('versi')) + 1;

                Dokumen::create([
                    'ref_type' => 'kontrak',
                    'ref_id' => $kontrak->id,
                    'tipe_dokumen' => $tipeDokumen,
                    'versi' => $versiBaru > 0 ? $versiBaru : 1,
                    'nama_asli' => $file->getClientOriginalName(),
                    'nama_hash' => $namaHash,
                    'ukuran_bytes' => $file->getSize(),
                    'mime_type' => $file->getClientMimeType() ?: 'application/pdf',
                    'uploaded_by' => $user->id,
                ]);
            };

            // Single dokumen default
            if ($fileDokumen) {
                $saveDoc($fileDokumen, 'dokumen_kontrak');
            }

            // Multi dokumen instrumen pembelian (FR-37)
            $mapDocs = [
                'dokumen_surat_kontrak' => 'surat_kontrak',
                'dokumen_spk' => 'spk',
                'dokumen_surat_pemesanan' => 'surat_pemesanan',
                'dokumen_kwitansi' => 'kwitansi',
                'dokumen_invoice' => 'invoice',
            ];

            foreach ($mapDocs as $fieldKey => $docType) {
                if (isset($multiDokumen[$fieldKey]) && $multiDokumen[$fieldKey] instanceof UploadedFile) {
                    $saveDoc($multiDokumen[$fieldKey], $docType);
                }
            }

            if (in_array($pengadaan->status, ['disetujui', 'siap_spk'], true)) {
                $pengadaan->status = 'kontrak_terbit';
                $pengadaan->save();

                StatusHistory::create([
                    'ref_type' => 'pengadaan',
                    'ref_id' => $pengadaan->id,
                    'status_lama' => 'disetujui',
                    'status_baru' => 'kontrak_terbit',
                    'actor_id' => $user->id,
                    'created_at' => now(),
                ]);
            }

            return $kontrak->fresh(['RencanaPembayaran.Reminders', 'Dokumen']);
        });
    }

    /**
     * Membangun data tracking stepper dan timeline terpadu untuk pengadaan (FR-05).
     *
     * @return array{
     *     stepper: array<int, array{key: string, label: string, status: string}>,
     *     timeline: array<int, array{id: int|string, tanggal: string, keterangan: string, actor_nama: string, aktif: bool}>
     * }
     */
    public function buildTrackingData(Pengadaan $pengadaan): array
    {
        $status = $pengadaan->status;
        $isSelesai = $status === 'selesai' || $status === 'barang_diterima' || $pengadaan->Penerimaan !== null;
        $isKontrak = in_array($status, ['kontrak_terbit', 'siap_spk', 'berjalan', 'barang_diterima', 'selesai'], true);
        $isReview = in_array($status, ['menunggu_review', 'menunggu_persetujuan', 'diteruskan', 'disetujui'], true);

        // 1. Evaluasi 5 tahapan stepper
        $stepper = [
            [
                'key' => 'permohonan',
                'label' => 'Permohonan',
                'status' => 'selesai',
            ],
            [
                'key' => 'pengadaan',
                'label' => 'Pengadaan',
                'status' => in_array($status, ['draft', 'menunggu_review'], true)
                    ? 'sedang_berlangsung'
                    : 'selesai',
            ],
            [
                'key' => 'pembelian_barang',
                'label' => 'Pembelian Barang',
                'status' => $isKontrak
                    ? ($isSelesai ? 'selesai' : 'sedang_berlangsung')
                    : ($status === 'disetujui' ? 'sedang_berlangsung' : 'belum_dimulai'),
            ],
            [
                'key' => 'penerimaan_barang',
                'label' => 'Penerimaan Barang',
                'status' => $isSelesai
                    ? 'selesai'
                    : ($isKontrak ? 'sedang_berlangsung' : 'belum_dimulai'),
            ],
            [
                'key' => 'selesai',
                'label' => 'Selesai',
                'status' => $status === 'selesai' ? 'selesai' : 'belum_dimulai',
            ],
        ];

        // 2. Ambil riwayat status_history pengadaan
        $histories = StatusHistory::where('ref_type', 'pengadaan')
            ->where('ref_id', $pengadaan->id)
            ->with(['Actor.Role'])
            ->orderByDesc('id')
            ->get();

        $timeline = [];
        $total = $histories->count();

        foreach ($histories as $idx => $h) {
            $actorRole = $h->Actor?->Role?->nama ?? 'Pengguna';
            $actorNama = $h->Actor?->nama ?? $h->Actor?->name ?? 'Sistem';

            $keterangan = match ($h->status_baru) {
                'menunggu_review' => "Paket pengadaan dibuat dan dikirim ke reviewer oleh {$actorRole} ({$actorNama})",
                'diteruskan' => "Dokumen pengadaan diverifikasi oleh {$actorRole} ({$actorNama}) dan diteruskan ke PPK",
                'disetujui' => "Dokumen pengadaan disetujui oleh {$actorRole} ({$actorNama})",
                'ditolak' => "Dokumen pengadaan ditolak dan dikembalikan ke PPBJ oleh {$actorRole} ({$actorNama})",
                'kontrak_terbit' => "Surat kontrak dan dokumen instrumen pembelian diterbitkan oleh {$actorRole} ({$actorNama})",
                'barang_diterima' => "Barang telah diterima dan diverifikasi fisik oleh {$actorRole} ({$actorNama})",
                'selesai' => "Proses pengadaan telah selesai secara tuntas oleh {$actorRole} ({$actorNama})",
                default => 'Status pengadaan diperbarui menjadi '.ucwords(str_replace('_', ' ', (string) $h->status_baru))." oleh {$actorRole} ({$actorNama})",
            };

            $timeline[] = [
                'id' => (int) $h->id,
                'tanggal' => $h->created_at ? Carbon::parse($h->created_at)->format('d-m-Y H:i') : now()->format('d-m-Y H:i'),
                'keterangan' => $keterangan,
                'actor_nama' => "{$actorRole} - {$actorNama}",
                'aktif' => $idx === 0, // Event paling baru
            ];
        }

        // Jika riwayat status_history kosong, berikan fallback informatif
        if (empty($timeline)) {
            $timeline[] = [
                'id' => 'init',
                'tanggal' => $pengadaan->created_at ? Carbon::parse($pengadaan->created_at)->format('d-m-Y H:i') : now()->format('d-m-Y H:i'),
                'keterangan' => 'Paket pengadaan diterbitkan dalam sistem SIPBAJA',
                'actor_nama' => 'PPBJ',
                'aktif' => true,
            ];
        }

        return [
            'stepper' => $stepper,
            'timeline' => $timeline,
        ];
    }

    /**
     * Mengambil konteks pembayaran, BAST & foto perlengkapan, serta status tagihan & legalitas vendor untuk PPBJ (FR-40 - FR-45).
     */
    public function getPembayaranContext(Pengadaan $pengadaan): array
    {
        $pengadaan->loadMissing([
            'Permohonan.Dokumen',
            'Kontrak.Dokumen',
            'Penerimaan.Dokumen',
            'Kontrak.RencanaPembayaran.Pembayaran.Dokumen',
            'Kontrak.RencanaPembayaran.Pembayaran.Approvals.Memo',
        ]);

        $penerimaan = $pengadaan->Penerimaan;
        $bastDoc = null;
        $fotoDocs = [];

        if ($penerimaan) {
            foreach ($penerimaan->Dokumen as $doc) {
                $docItem = [
                    'id' => (int) $doc->id,
                    'nama_asli' => $doc->nama_asli,
                    'tipe_dokumen' => $doc->tipe_dokumen,
                    'mime_type' => $doc->mime_type,
                    'ukuran_bytes' => (int) $doc->ukuran_bytes,
                    'url' => route('api.ppbj.pengadaan.dokumen.download', [
                        'pengadaanId' => $pengadaan->id,
                        'dokumenId' => $doc->id,
                    ]).'?disposition=inline',
                ];

                if (in_array($doc->tipe_dokumen, ['berita_acara', 'surat_tanda_terima', 'bast'])) {
                    $bastDoc = $docItem;
                } elseif ($doc->tipe_dokumen === 'foto_barang' || str_starts_with((string) $doc->mime_type, 'image/')) {
                    $fotoDocs[] = $docItem;
                }
            }
        }

        $rencana = $pengadaan->Kontrak?->RencanaPembayaran?->first();
        $pembayaran = $rencana?->Pembayaran;

        $dokumenTagihan = null;
        $dokumenLegalitas = null;

        if ($pembayaran) {
            foreach ($pembayaran->Dokumen as $pDoc) {
                $pDocItem = [
                    'id' => (int) $pDoc->id,
                    'nama_asli' => $pDoc->nama_asli,
                    'tipe_dokumen' => $pDoc->tipe_dokumen,
                    'mime_type' => $pDoc->mime_type,
                    'ukuran_bytes' => (int) $pDoc->ukuran_bytes,
                    'url' => route('api.ppbj.pengadaan.dokumen.download', [
                        'pengadaanId' => $pengadaan->id,
                        'dokumenId' => $pDoc->id,
                    ]).'?disposition=inline',
                ];

                if ($pDoc->tipe_dokumen === 'dokumen_tagihan') {
                    $dokumenTagihan = $pDocItem;
                } elseif ($pDoc->tipe_dokumen === 'dokumen_legalitas_vendor') {
                    $dokumenLegalitas = $pDocItem;
                }
            }
        }

        // Approvals status
        $approvalPpk = null;
        $approvalBidang2 = null;
        $ppkApproved = false;
        $bidang2Approved = false;

        if ($pembayaran) {
            foreach ($pembayaran->Approvals as $appr) {
                $apprData = [
                    'id' => (int) $appr->id,
                    'tahap' => $appr->tahap,
                    'keputusan' => $appr->keputusan,
                    'alasan' => $appr->alasan,
                    'memo' => $appr->Memo ? [
                        'id' => (int) $appr->Memo->id,
                        'nama_asli' => $appr->Memo->nama_asli,
                        'url' => route('api.ppbj.pengadaan.dokumen.download', [
                            'pengadaanId' => $pengadaan->id,
                            'dokumenId' => $appr->Memo->id,
                        ]).'?disposition=inline',
                    ] : null,
                ];

                if ($appr->tahap === 'PPK') {
                    $approvalPpk = $apprData;
                    if ($appr->keputusan === 'disetujui' && $appr->Memo) {
                        $ppkApproved = true;
                    }
                } elseif ($appr->tahap === 'BIDANG2') {
                    $approvalBidang2 = $apprData;
                    if ($appr->keputusan === 'disetujui' && $appr->Memo) {
                        $bidang2Approved = true;
                    }
                }
            }
        }

        $bothMemosApproved = $ppkApproved && $bidang2Approved;
        $isLocked = ($pembayaran?->status === 'selesai' || $pengadaan->status === 'selesai');

        // FR-42: Re-upload tagihan bisa selama BELUM disetujui final oleh kedua pihak
        $canUploadTagihan = ! $bothMemosApproved && ! $isLocked;

        // FR-43 & FR-45: Upload/re-upload legalitas hanya terbuka jika kedua memo disetujui DAN belum selesai di Keuangan
        $canUploadLegalitas = $bothMemosApproved && ! $isLocked;

        return [
            'penerimaan' => $penerimaan ? [
                'id' => (int) $penerimaan->id,
                'tanggal_terima' => $penerimaan->tanggal_terima,
                'catatan' => $penerimaan->catatan,
                'status_kondisi' => 'lengkap_sesuai',
                'bast_dokumen' => $bastDoc,
                'foto_barang' => $fotoDocs,
            ] : null,
            'pembayaran' => $pembayaran ? [
                'id' => (int) $pembayaran->id,
                'status' => $pembayaran->status,
                'nominal' => (float) $pembayaran->nominal,
                'tanggal_bayar' => $pembayaran->tanggal_bayar,
                'revisi_ke' => (int) ($pembayaran->revisi_ke ?? 0),
            ] : null,
            'dokumen_tagihan' => $dokumenTagihan,
            'approvals' => [
                'ppk' => $approvalPpk,
                'bidang2' => $approvalBidang2,
            ],
            'can_upload_tagihan' => $canUploadTagihan,
            'can_upload_legalitas' => $canUploadLegalitas,
            'dokumen_legalitas' => $dokumenLegalitas,
            'is_locked' => $isLocked,
            'dokumen_riwayat' => [
                'permohonan' => $pengadaan->Permohonan ? [
                    'id' => (int) $pengadaan->Permohonan->id,
                    'nomor_surat' => $pengadaan->Permohonan->nomor_surat,
                    'judul' => $pengadaan->Permohonan->judul,
                    'dokumen' => $pengadaan->Permohonan->Dokumen->map(fn ($d) => [
                        'id' => (int) $d->id,
                        'nama_asli' => $d->nama_asli,
                        'tipe_dokumen' => $d->tipe_dokumen,
                        'mime_type' => $d->mime_type,
                        'ukuran_bytes' => (int) $d->ukuran_bytes,
                        'url' => route('api.ppbj.pengadaan.dokumen.download', [
                            'pengadaanId' => $pengadaan->id,
                            'dokumenId' => $d->id,
                        ]).'?disposition=inline',
                    ])->values()->all(),
                ] : null,
                'kontrak' => $pengadaan->Kontrak ? [
                    'id' => (int) $pengadaan->Kontrak->id,
                    'tipe' => $pengadaan->Kontrak->tipe,
                    'nomor' => $pengadaan->Kontrak->nomor,
                    'vendor_nama' => $pengadaan->Kontrak->vendor_nama,
                    'nominal_kontrak' => (float) $pengadaan->Kontrak->nominal_kontrak,
                    'dokumen' => $pengadaan->Kontrak->Dokumen->map(fn ($d) => [
                        'id' => (int) $d->id,
                        'nama_asli' => $d->nama_asli,
                        'tipe_dokumen' => $d->tipe_dokumen,
                        'mime_type' => $d->mime_type,
                        'ukuran_bytes' => (int) $d->ukuran_bytes,
                        'url' => route('api.ppbj.pengadaan.dokumen.download', [
                            'pengadaanId' => $pengadaan->id,
                            'dokumenId' => $d->id,
                        ]).'?disposition=inline',
                    ])->values()->all(),
                ] : null,
            ],
        ];
    }

    /**
     * Upload / Re-upload dokumen tagihan pembayaran oleh PPBJ (FR-41, FR-42).
     */
    public function uploadDokumenTagihan(Pengadaan $pengadaan, UploadedFile $file, ?float $nominal, ?string $catatan, User $actor): array
    {
        $context = $this->getPembayaranContext($pengadaan);

        if (! $context['can_upload_tagihan']) {
            throw new ValidationException(
                validator([], []),
                response()->json([
                    'success' => false,
                    'message' => 'Dokumen tagihan tidak dapat diunggah ulang karena telah mendapatkan persetujuan final (memo) dari PPK dan Bidang 2.',
                ], 422)
            );
        }

        return DB::transaction(function () use ($pengadaan, $file, $nominal, $catatan, $actor) {
            // Pastikan kontrak & rencana pembayaran ada
            $kontrak = $pengadaan->Kontrak;
            if (! $kontrak) {
                throw new \RuntimeException('Pengadaan belum memiliki kontrak/SPK aktif.');
            }

            $rencana = $kontrak->RencanaPembayaran()->firstOrCreate(
                ['termin_ke' => 1],
                [
                    'nominal_rencana' => $nominal ?: ($kontrak->nominal_kontrak ?: 0),
                    'tanggal_jatuh_tempo' => now()->addDays(14),
                    'status' => 'belum_lunas',
                ]
            );

            $pembayaran = Pembayaran::firstOrNew(['rencana_pembayaran_id' => $rencana->id]);
            $isRevisi = $pembayaran->exists && $pembayaran->status === 'perlu_revisi';
            $pembayaran->nominal = $nominal ?: ($pembayaran->nominal ?: ($kontrak->nominal_kontrak ?: 0));
            $pembayaran->status = 'menunggu_persetujuan';
            if ($isRevisi) {
                $pembayaran->revisi_ke = ((int) $pembayaran->revisi_ke) + 1;
            }
            $pembayaran->save();

            // Simpan berkas fisik ke DokumenService
            $doc = $this->dokumenService->simpanDokumen(
                file: $file,
                actor: $actor,
                refType: 'pembayaran',
                refId: $pembayaran->id,
                tipeDokumen: 'dokumen_tagihan',
                folder: 'dokumen/pembayaran/tagihan',
                field: 'tagihan'
            );

            $statusSebelumnya = $pengadaan->status;
            $pengadaan->status = 'pembayaran';
            $pengadaan->save();

            // Catat history
            StatusHistory::create([
                'ref_type' => 'pengadaan',
                'ref_id' => $pengadaan->id,
                'status_lama' => $statusSebelumnya,
                'status_baru' => 'pembayaran',
                'actor_id' => $actor->id,
                'catatan' => $catatan ?: 'PPBJ mengunggah dokumen tagihan/pembayaran termin',
                'created_at' => now(),
            ]);

            return [
                'pembayaran' => $pembayaran->fresh(['Dokumen', 'Approvals']),
                'dokumen' => $doc,
            ];
        });
    }

    /**
     * Upload / Re-upload dokumen legalitas vendor oleh PPBJ (FR-43, FR-44, FR-45).
     */
    public function uploadLegalitasVendor(Pengadaan $pengadaan, UploadedFile $file, User $actor): array
    {
        $context = $this->getPembayaranContext($pengadaan);

        if (! $context['can_upload_legalitas']) {
            $msg = $context['is_locked']
                ? 'Dokumen legalitas vendor sudah dikunci karena proses pencairan dana telah diselesaikan oleh pihak Keuangan.'
                : 'Dokumen legalitas vendor hanya dapat diunggah setelah memo persetujuan pembayaran dari PPK dan Bidang 2 disetujui secara lengkap.';

            throw new ValidationException(
                validator([], []),
                response()->json([
                    'success' => false,
                    'message' => $msg,
                ], 422)
            );
        }

        return DB::transaction(function () use ($pengadaan, $file, $actor) {
            $kontrak = $pengadaan->Kontrak;
            $rencana = $kontrak?->RencanaPembayaran?->first();
            $pembayaran = $rencana?->Pembayaran;

            if (! $pembayaran) {
                throw new \RuntimeException('Data pembayaran tidak ditemukan.');
            }

            // Simpan / update dokumen legalitas vendor
            $doc = $this->dokumenService->simpanDokumen(
                file: $file,
                actor: $actor,
                refType: 'pembayaran',
                refId: $pembayaran->id,
                tipeDokumen: 'dokumen_legalitas_vendor',
                folder: 'dokumen/pembayaran/legalitas',
                field: 'legalitas'
            );

            // Jika status pembayaran belum siap bayar atau selesai, set ke siap_bayar
            if ($pembayaran->status !== 'selesai') {
                $pembayaran->status = 'siap_bayar';
                $pembayaran->save();
            }

            // Catat history
            StatusHistory::create([
                'ref_type' => 'pengadaan',
                'ref_id' => $pengadaan->id,
                'status_lama' => $pengadaan->status,
                'status_baru' => $pengadaan->status,
                'actor_id' => $actor->id,
                'catatan' => 'PPBJ mengunggah dokumen legalitas vendor untuk verifikasi pencairan dana',
                'created_at' => now(),
            ]);

            return [
                'pembayaran' => $pembayaran->fresh(['Dokumen', 'Approvals']),
                'dokumen' => $doc,
            ];
        });
    }
}
