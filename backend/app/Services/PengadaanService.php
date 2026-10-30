<?php

namespace App\Services;

use App\Models\Dokumen;
use App\Models\JenisPengadaan;
use App\Models\LevelPengadaan;
use App\Models\MetodePengadaan;
use App\Models\Pengadaan;
use App\Models\Permohonan;
use App\Models\StatusHistory;
use App\Models\User;
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
            return $approval->tahap === 'PERENCANAAN'
                && (int) $approval->revisi_ke === $revisiAktif
                && $approval->keputusan === 'disetujui';
        });

        $approvalBidang2Setuju = $permohonan->Approvals->contains(function ($approval) use ($revisiAktif) {
            return $approval->tahap === 'BIDANG2'
                && (int) $approval->revisi_ke === $revisiAktif
                && $approval->keputusan === 'disetujui';
        });

        $bisaDipecah = $approvalPerencanaanSetuju && $approvalBidang2Setuju;

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
}
