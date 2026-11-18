<?php

namespace App\Services;

use App\Models\Dokumen;
use App\Models\JenisPengadaan;
use App\Models\Kontrak;
use App\Models\LevelPengadaan;
use App\Models\MetodePengadaan;
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

        // Terkunci jika ada paket pengadaan yang sudah bukan status draft (mis. sudah disubmit ke reviewer)
        $sudahDikunci = $permohonan->Pengadaan->isNotEmpty() && $permohonan->Pengadaan->contains(function ($paket) {
            return $paket->status !== 'draft';
        });

        $totalNominalPaket = (float) $permohonan->Pengadaan->sum(fn ($p) => (float) ($p->nominal ?? 0));
        $estimasi = (float) ($permohonan->estimasi_anggaran ?? 0);
        $sisaAnggaran = max(0.0, $estimasi - $totalNominalPaket);

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
            'metode' => MetodePengadaan::select(['id', 'nama'])->orderBy('id')->get()->toArray(),
            'level' => LevelPengadaan::select(['id', 'nama', 'min_nominal', 'max_nominal', 'perlu_review_pp'])
                ->orderBy('min_nominal')
                ->get()
                ->toArray(),
        ];

        return [
            'bisaDipecah' => $bisaDipecah,
            'sudahDikunci' => $sudahDikunci,
            'sisaAnggaran' => $sisaAnggaran,
            'totalNominalPaket' => $totalNominalPaket,
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

        $existingTotal = (float) $permohonan->Pengadaan->sum(fn ($p) => (float) ($p->nominal ?? 0));
        $newTotal = (float) array_sum(array_map(fn ($item) => (float) ($item['nominal'] ?? 0), $items));
        $estimasi = (float) ($permohonan->estimasi_anggaran ?? 0);

        if (($existingTotal + $newTotal) > $estimasi) {
            throw ValidationException::withMessages([
                'nominal' => 'Total nominal paket melebihi estimasi anggaran permohonan.',
            ]);
        }

        $makMap = $permohonan->PermohonanMak->keyBy('id');
        $levels = LevelPengadaan::orderBy('min_nominal')->get();

        return DB::transaction(function () use ($permohonan, $items, $actor, $makMap, $levels) {
            $createdPengadaan = [];

            foreach ($items as $item) {
                $permohonanMakId = (int) $item['permohonan_mak_id'];
                $pm = $makMap->get($permohonanMakId);

                if (! $pm) {
                    throw ValidationException::withMessages([
                        'permohonan_mak_id' => 'Mata Anggaran Kegiatan tidak valid untuk permohonan ini.',
                    ]);
                }

                $nominal = (float) $item['nominal'];
                $levelId = isset($item['level_id']) && $item['level_id'] !== null && $item['level_id'] !== ''
                    ? (int) $item['level_id']
                    : $this->resolveLevelId($nominal, $levels);

                $pengadaan = Pengadaan::create([
                    'permohonan_id' => $permohonan->id,
                    'permohonan_mak_id' => $pm->id,
                    'jenis_id' => (int) $item['jenis_id'],
                    'metode_id' => (int) $item['metode_id'],
                    'level_id' => $levelId,
                    'ppk_id' => $pm->Mak?->ppk_user_id,
                    'nominal' => $nominal,
                    'revisi_ke' => 0,
                    'status' => 'draft',
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

        if ($pengadaan->status !== 'draft') {
            throw ValidationException::withMessages([
                'pengadaan' => 'Paket pengadaan tidak dapat dihapus karena statusnya bukan draft.',
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

        // Cek jika sudah pernah dikunci atau ada paket non-draft
        if ($permohonan->Pengadaan->contains(fn ($p) => $p->status !== 'draft')) {
            throw ValidationException::withMessages([
                'pengadaan' => 'Permohonan sudah disubmit ke reviewer sebelumnya dan telah dikunci.',
            ]);
        }

        // Validasi setiap paket: harus ada dokumen pengadaan dan field wajib lengkap
        foreach ($permohonan->Pengadaan as $paket) {
            $hasDokumen = $paket->Dokumen->contains(fn ($d) => $d->tipe_dokumen === 'dokumen_pengadaan');
            if (! $hasDokumen) {
                throw ValidationException::withMessages([
                    'dokumen' => 'Setiap paket pengadaan wajib memiliki berkas dokumen pengadaan sebelum dikirim ke reviewer.',
                ]);
            }

            if (! $paket->permohonan_mak_id || ! $paket->jenis_id || ! $paket->metode_id || ! $paket->level_id || (float) $paket->nominal <= 0) {
                throw ValidationException::withMessages([
                    'paket' => 'Seluruh informasi paket (MAK, Jenis, Metode, Level, dan Nominal) wajib diisi lengkap.',
                ]);
            }
        }

        DB::transaction(function () use ($permohonan, $actor) {
            foreach ($permohonan->Pengadaan as $paket) {
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
        }

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

    /**
     * @return array<string, mixed>
     */
    public function getDetailPengadaanPpbj(int $pengadaanId): array
    {
        $pengadaan = Pengadaan::with([
            'Permohonan.Unit',
            'Permohonan.Creator',
            'PermohonanMak.Mak.Ppk',
            'Jenis',
            'Metode',
            'Level',
            'Ppk',
            'Kontrak.RencanaPembayaran.Reminders',
            'Kontrak.Dokumen',
            'Penerimaan',
            'Approvals.Actor',
            'Dokumen',
        ])->findOrFail($pengadaanId);

        $isBarangDiterima = $pengadaan->Penerimaan !== null || in_array($pengadaan->status, ['barang_diterima', 'selesai'], true);
        $bisaEditDraft = in_array($pengadaan->status, ['draft', 'ditolak'], true);
        $bisaEditKontrak = in_array($pengadaan->status, ['disetujui', 'siap_spk', 'kontrak_terbit', 'berjalan'], true) && ! $isBarangDiterima;

        $kontrak = $pengadaan->Kontrak;
        $rencanaPembayaran = $kontrak?->RencanaPembayaran?->first();
        $reminder = $rencanaPembayaran?->Reminders?->first();
        $dokumenKontrak = $kontrak?->Dokumen?->first();

        return [
            'id' => $pengadaan->id,
            'nominal' => (float) $pengadaan->nominal,
            'status' => $pengadaan->status,
            'revisi_ke' => $pengadaan->revisi_ke,
            'bisa_edit_draft' => $bisaEditDraft,
            'bisa_edit_kontrak' => $bisaEditKontrak,
            'permohonan' => [
                'id' => $pengadaan->Permohonan?->id,
                'nomor_surat' => $pengadaan->Permohonan?->nomor_surat,
                'judul' => $pengadaan->Permohonan?->judul,
                'estimasi_anggaran' => (float) ($pengadaan->Permohonan?->estimasi_anggaran ?? 0),
                'unit_nama' => $pengadaan->Permohonan?->Unit?->nama ?? '-',
            ],
            'mak' => [
                'id' => $pengadaan->PermohonanMak?->Mak?->id,
                'nama' => $pengadaan->PermohonanMak?->Mak?->nama ?? '-',
                'kode' => $pengadaan->PermohonanMak?->Mak?->kode ?? '-',
                'ppk_nama' => $pengadaan->Ppk?->nama ?? $pengadaan->PermohonanMak?->Mak?->Ppk?->nama ?? '-',
            ],
            'jenis' => [
                'id' => $pengadaan->Jenis?->id,
                'nama' => $pengadaan->Jenis?->nama ?? '-',
            ],
            'metode' => [
                'id' => $pengadaan->Metode?->id,
                'nama' => $pengadaan->Metode?->nama ?? '-',
            ],
            'level' => [
                'id' => $pengadaan->Level?->id,
                'nama' => $pengadaan->Level?->nama ?? '-',
                'perlu_review_pp' => (bool) ($pengadaan->Level?->perlu_review_pp ?? false),
            ],
            'kontrak' => $kontrak ? [
                'id' => $kontrak->id,
                'tipe' => $kontrak->tipe,
                'nomor' => $kontrak->nomor,
                'tanggal' => $kontrak->tanggal ? Carbon::parse($kontrak->tanggal)->format('Y-m-d') : null,
                'vendor_nama' => $kontrak->vendor_nama,
                'nominal_kontrak' => (float) ($kontrak->nominal_kontrak ?? $pengadaan->nominal),
                'tanggal_jatuh_tempo' => $rencanaPembayaran?->tanggal_jatuh_tempo ? Carbon::parse($rencanaPembayaran->tanggal_jatuh_tempo)->format('Y-m-d') : null,
                'tanggal_reminder' => $reminder?->tanggal_reminder ? Carbon::parse($reminder->tanggal_reminder)->format('Y-m-d') : null,
                'dokumen' => $dokumenKontrak ? [
                    'id' => $dokumenKontrak->id,
                    'nama_asli' => $dokumenKontrak->nama_asli,
                    'download_url' => "/api/v1/ppbj/pengadaan/{$pengadaan->id}/dokumen/{$dokumenKontrak->id}",
                ] : null,
            ] : null,
            'dokumen_list' => $pengadaan->Dokumen->map(fn (Dokumen $d) => [
                'id' => $d->id,
                'nama_asli' => $d->nama_asli,
                'tipe_dokumen' => $d->tipe_dokumen,
                'ukuran_bytes' => $d->ukuran_bytes,
                'mime_type' => $d->mime_type,
                'download_url' => "/api/v1/ppbj/pengadaan/{$pengadaan->id}/dokumen/{$d->id}",
            ])->values()->all(),
            'approvals' => $pengadaan->Approvals->map(fn ($app) => [
                'id' => $app->id,
                'tahap' => $app->tahap,
                'keputusan' => $app->keputusan,
                'catatan' => $app->catatan,
                'actor_nama' => $app->Actor?->nama ?? '-',
                'created_at' => $app->created_at ? (string) $app->created_at : null,
            ])->values()->all(),
        ];
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
            $pengadaan->nominal = $data['nominal'];

            if (! empty($data['level_id'])) {
                $pengadaan->level_id = $data['level_id'];
            } else {
                $nominal = (float) $data['nominal'];
                $level = LevelPengadaan::where('min_nominal', '<=', $nominal)
                    ->where(function ($q) use ($nominal) {
                        $q->whereNull('max_nominal')->orWhere('max_nominal', '>=', $nominal);
                    })
                    ->first();
                if ($level) {
                    $pengadaan->level_id = $level->id;
                }
            }

            if ($statusSebelumnya === 'ditolak') {
                $pengadaan->revisi_ke = ((int) $pengadaan->revisi_ke) + 1;
                $pengadaan->status = 'draft';
            }

            $pengadaan->save();

            if ($fileDokumen) {
                $namaHash = $fileDokumen->hashName();
                $path = $fileDokumen->storeAs('dokumen/pengadaan', $namaHash, 'private');

                Dokumen::create([
                    'ref_type' => 'pengadaan',
                    'ref_id' => $pengadaan->id,
                    'tipe_dokumen' => 'dokumen_pengadaan',
                    'nama_asli' => $fileDokumen->getClientOriginalName(),
                    'nama_hash' => $namaHash,
                    'path' => $path,
                    'ukuran_bytes' => $fileDokumen->getSize(),
                    'mime_type' => $fileDokumen->getClientMimeType() ?: 'application/pdf',
                    'dibuat_oleh' => $user->id,
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

            return $pengadaan->fresh(['Permohonan', 'PermohonanMak.Mak', 'Jenis', 'Metode', 'Level', 'Ppk']);
        });
    }

    public function simpanAtauPerbaruiKontrak(Pengadaan $pengadaan, array $data, ?UploadedFile $fileDokumen, User $user): Kontrak
    {
        $isBarangDiterima = $pengadaan->Penerimaan !== null || in_array($pengadaan->status, ['barang_diterima', 'selesai'], true);
        if ($isBarangDiterima) {
            throw ValidationException::withMessages([
                'status' => 'Data kontrak dan vendor telah dikunci karena barang telah diterima oleh Perlengkapan.',
            ]);
        }

        return DB::transaction(function () use ($pengadaan, $data, $fileDokumen, $user) {
            $kontrak = Kontrak::firstOrNew(['pengadaan_id' => $pengadaan->id]);
            $kontrak->tipe = $data['tipe'];
            $kontrak->nomor = $data['nomor'];
            $kontrak->tanggal = $data['tanggal'];
            $kontrak->vendor_nama = $data['vendor_nama'];
            $kontrak->nominal_kontrak = $data['nominal_kontrak'];
            $kontrak->save();

            // Simpan / update rencana pembayaran termin 1
            $rencana = $kontrak->RencanaPembayaran()->firstOrNew(['termin_ke' => 1]);
            $rencana->nominal_rencana = $data['nominal_kontrak'];
            $rencana->tanggal_jatuh_tempo = $data['tanggal_jatuh_tempo'];
            $rencana->status = $rencana->status ?: 'menunggu';
            $rencana->created_at = $rencana->created_at ?: now();
            $rencana->save();

            // Simpan / update reminder
            $reminder = $rencana->Reminders()->firstOrNew(['jenis' => 'pembayaran']);
            $reminder->tanggal_reminder = $data['tanggal_reminder'];
            $reminder->dibuat_oleh = $user->id;
            $reminder->save();

            // Upload dokumen kontrak jika ada
            if ($fileDokumen) {
                $namaHash = $fileDokumen->hashName();
                $path = $fileDokumen->storeAs('dokumen/kontrak', $namaHash, 'private');

                Dokumen::create([
                    'ref_type' => 'kontrak',
                    'ref_id' => $kontrak->id,
                    'tipe_dokumen' => 'dokumen_kontrak',
                    'nama_asli' => $fileDokumen->getClientOriginalName(),
                    'nama_hash' => $namaHash,
                    'path' => $path,
                    'ukuran_bytes' => $fileDokumen->getSize(),
                    'mime_type' => $fileDokumen->getClientMimeType() ?: 'application/pdf',
                    'dibuat_oleh' => $user->id,
                ]);
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
}
