<?php

namespace App\Services;

use App\Models\ApprovalPembayaran;
use App\Models\ApprovalPengadaan;
use App\Models\ApprovalPermohonan;
use App\Models\Dokumen;
use App\Models\Mak;
use App\Models\Pembayaran;
use App\Models\Pengadaan;
use App\Models\Permohonan;
use App\Models\PermohonanMak;
use App\Models\StatusHistory;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ApprovalService
{
    public function __construct(
        private DokumenService $dokumenService,
        private NotificationService $notificationService
    ) {}

    /**
     * Menyetujui permohonan dan menetapkan satu atau lebih Jenis MAK oleh Perencanaan.
     *
     * @param  array<int, int>  $makIds
     *
     * @throws ValidationException
     */
    public function approvePermohonanPerencanaan(
        Permohonan $permohonan,
        User $actor,
        array $makIds,
        ?string $catatan = null
    ): Permohonan {
        $uniqueMakIds = array_values(array_unique(array_filter(array_map('intval', $makIds))));
        if (empty($uniqueMakIds)) {
            throw ValidationException::withMessages([
                'mak_ids' => ['Pilih minimal satu Jenis MAK sebelum menyetujui permohonan.'],
            ]);
        }

        return DB::transaction(function () use ($permohonan, $actor, $uniqueMakIds, $catatan) {
            $statusLama = $permohonan->status;
            $statusBaru = 'diteruskan';

            // 1. Bentuk Dokumen Turunan (permohonan_mak) untuk setiap Jenis MAK yang dipilih
            PermohonanMak::where('permohonan_id', $permohonan->id)->delete();
            foreach ($uniqueMakIds as $makId) {
                PermohonanMak::create([
                    'permohonan_id' => $permohonan->id,
                    'mak_id' => $makId,
                    'ditentukan_oleh' => $actor->id,
                ]);
            }

            // 2. Simpan keputusan approval Perencanaan
            ApprovalPermohonan::updateOrCreate(
                [
                    'permohonan_id' => $permohonan->id,
                    'tahap' => 'PERENCANAAN',
                    'revisi_ke' => (int) ($permohonan->revisi_ke ?? 0),
                ],
                [
                    'keputusan' => 'disetujui',
                    'alasan' => $catatan,
                    'actor_id' => $actor->id,
                ]
            );

            // 3. Perbarui status permohonan (menunggu persetujuan paralel Bidang 2 & PPK)
            $permohonan->update(['status' => $statusBaru]);

            // 4. Tulis riwayat perubahan status
            StatusHistory::create([
                'ref_type' => 'permohonan',
                'ref_id' => $permohonan->id,
                'status_lama' => $statusLama,
                'status_baru' => $statusBaru,
                'actor_id' => $actor->id,
            ]);

            // 5. Kirim notifikasi ke Bidang 2, PPK terikat pada MAK, dan Pemohon
            $bidang2Users = User::whereHas('Role', fn ($q) => $q->where('nama', 'Bidang 2'))->pluck('id');
            foreach ($bidang2Users as $userId) {
                $this->notificationService->send(
                    user: (int) $userId,
                    judul: 'Permohonan Menunggu Persetujuan Bidang 2',
                    pesan: "Permohonan '{$permohonan->judul}' ({$permohonan->nomor_surat}) telah diverifikasi Perencanaan dan menunggu persetujuan awal Bidang 2.",
                    refType: 'permohonan',
                    refId: $permohonan->id,
                );
            }

            $ppkIds = Mak::whereIn('id', $uniqueMakIds)->pluck('ppk_user_id')->filter()->unique();
            foreach ($ppkIds as $ppkId) {
                $this->notificationService->send(
                    user: (int) $ppkId,
                    judul: 'Dokumen Turunan Menunggu Persetujuan PPK',
                    pesan: "Permohonan '{$permohonan->judul}' ({$permohonan->nomor_surat}) telah ditetapkan Jenis MAK-nya dan menunggu persetujuan awal PPK.",
                    refType: 'permohonan',
                    refId: $permohonan->id,
                );
            }

            if ($permohonan->created_by) {
                $this->notificationService->send(
                    user: (int) $permohonan->created_by,
                    judul: 'Status Permohonan Diperbarui',
                    pesan: "Permohonan '{$permohonan->judul}' telah diverifikasi oleh Perencanaan dan diteruskan ke Bidang 2 serta PPK.",
                    refType: 'permohonan',
                    refId: $permohonan->id,
                );
            }

            return $permohonan->fresh(['Unit', 'Creator', 'PermohonanMak.Mak.Ppk', 'Approvals.Actor']);
        });
    }

    /**
     * Menolak permohonan dengan alasan oleh Perencanaan dan mengembalikan ke pemohon.
     *
     * @throws ValidationException
     */
    public function rejectPermohonanPerencanaan(Permohonan $permohonan, User $actor, string $alasan): Permohonan
    {
        $alasanBersih = trim($alasan);
        if ($alasanBersih === '') {
            throw ValidationException::withMessages([
                'alasan' => ['Alasan penolakan wajib diisi.'],
            ]);
        }

        return DB::transaction(function () use ($permohonan, $actor, $alasanBersih) {
            $statusLama = $permohonan->status;
            $statusBaru = 'ditolak';

            ApprovalPermohonan::updateOrCreate(
                [
                    'permohonan_id' => $permohonan->id,
                    'tahap' => 'PERENCANAAN',
                    'revisi_ke' => (int) ($permohonan->revisi_ke ?? 0),
                ],
                [
                    'keputusan' => 'ditolak',
                    'alasan' => $alasanBersih,
                    'actor_id' => $actor->id,
                ]
            );

            $permohonan->update([
                'status' => $statusBaru,
                'revisi_ke' => ((int) ($permohonan->revisi_ke ?? 0)) + 1,
            ]);

            StatusHistory::create([
                'ref_type' => 'permohonan',
                'ref_id' => $permohonan->id,
                'status_lama' => $statusLama,
                'status_baru' => $statusBaru,
                'actor_id' => $actor->id,
            ]);

            if ($permohonan->created_by) {
                $this->notificationService->send(
                    user: (int) $permohonan->created_by,
                    judul: 'Permohonan Ditolak oleh Perencanaan',
                    pesan: "Permohonan '{$permohonan->judul}' dikembalikan oleh Perencanaan: {$alasanBersih}",
                    refType: 'permohonan',
                    refId: $permohonan->id,
                );
            }

            return $permohonan;
        });
    }

    /**
     * Persetujuan awal permohonan oleh PPK dengan mengunggah Memo Persetujuan Surat Permohonan.
     * Keputusan Bidang 2 dan PPK berjalan paralel; diteruskan otomatis ke PPBJ bila keduanya setuju.
     *
     * @throws ValidationException
     */
    public function approvePermohonanPpk(
        Permohonan $permohonan,
        User $actor,
        UploadedFile $memoFile,
        ?string $catatan = null
    ): Permohonan {
        $this->pastikanPpkBerhakAtasPermohonan($permohonan, $actor);

        return DB::transaction(function () use ($permohonan, $actor, $memoFile, $catatan) {
            $revisiAktif = (int) ($permohonan->revisi_ke ?? 0);

            $memoDoc = $this->dokumenService->simpanDokumen(
                file: $memoFile,
                actor: $actor,
                refType: 'permohonan',
                refId: $permohonan->id,
                tipeDokumen: 'memo_persetujuan',
                folder: 'dokumen/permohonan/memo',
                field: 'memo'
            );

            ApprovalPermohonan::updateOrCreate(
                [
                    'permohonan_id' => $permohonan->id,
                    'tahap' => 'PPK',
                    'revisi_ke' => $revisiAktif,
                ],
                [
                    'keputusan' => 'disetujui',
                    'alasan' => $catatan,
                    'memo_dokumen_id' => $memoDoc->id,
                    'actor_id' => $actor->id,
                ]
            );

            $statusLama = $permohonan->status;

            // Cek apakah Bidang 2 juga sudah menyetujui pada revisi_ke aktif
            $bidang2Setuju = ApprovalPermohonan::where('permohonan_id', $permohonan->id)
                ->where('tahap', 'BIDANG2')
                ->where('revisi_ke', $revisiAktif)
                ->where('keputusan', 'disetujui')
                ->exists();

            $statusBaru = $bidang2Setuju ? 'disetujui' : 'diteruskan';
            $permohonan->update(['status' => $statusBaru]);

            StatusHistory::create([
                'ref_type' => 'permohonan',
                'ref_id' => $permohonan->id,
                'status_lama' => $statusLama,
                'status_baru' => $statusBaru,
                'actor_id' => $actor->id,
            ]);

            if ($bidang2Setuju) {
                $ppbjUsers = User::whereHas('Role', fn ($q) => $q->where('nama', 'PPBJ'))->pluck('id');
                foreach ($ppbjUsers as $ppbjId) {
                    $this->notificationService->send(
                        user: (int) $ppbjId,
                        judul: 'Permohonan Siap Disusun Paket Pengadaan',
                        pesan: "Permohonan '{$permohonan->judul}' ({$permohonan->nomor_surat}) telah disetujui oleh Bidang 2 dan PPK, serta siap disusun paket pengadaannya.",
                        refType: 'permohonan',
                        refId: $permohonan->id,
                    );
                }
            }

            if ($permohonan->created_by) {
                $this->notificationService->send(
                    user: (int) $permohonan->created_by,
                    judul: 'Permohonan Disetujui oleh PPK',
                    pesan: "Permohonan '{$permohonan->judul}' telah mendapat persetujuan awal dari PPK.",
                    refType: 'permohonan',
                    refId: $permohonan->id,
                );
            }

            return $permohonan->fresh(['Unit', 'Creator', 'PermohonanMak.Mak.Ppk', 'Approvals.Actor']);
        });
    }

    /**
     * Penolakan persetujuan awal permohonan oleh PPK dengan alasan.
     *
     * @throws ValidationException
     */
    public function rejectPermohonanPpk(Permohonan $permohonan, User $actor, string $alasan): Permohonan
    {
        $this->pastikanPpkBerhakAtasPermohonan($permohonan, $actor);

        $alasanBersih = trim($alasan);
        if ($alasanBersih === '') {
            throw ValidationException::withMessages([
                'alasan' => ['Alasan penolakan wajib diisi.'],
            ]);
        }

        return DB::transaction(function () use ($permohonan, $actor, $alasanBersih) {
            $revisiAktif = (int) ($permohonan->revisi_ke ?? 0);
            $statusLama = $permohonan->status;
            $statusBaru = 'ditolak';

            ApprovalPermohonan::updateOrCreate(
                [
                    'permohonan_id' => $permohonan->id,
                    'tahap' => 'PPK',
                    'revisi_ke' => $revisiAktif,
                ],
                [
                    'keputusan' => 'ditolak',
                    'alasan' => $alasanBersih,
                    'actor_id' => $actor->id,
                ]
            );

            $permohonan->update([
                'status' => $statusBaru,
                'revisi_ke' => $revisiAktif + 1,
            ]);

            StatusHistory::create([
                'ref_type' => 'permohonan',
                'ref_id' => $permohonan->id,
                'status_lama' => $statusLama,
                'status_baru' => $statusBaru,
                'actor_id' => $actor->id,
            ]);

            if ($permohonan->created_by) {
                $this->notificationService->send(
                    user: (int) $permohonan->created_by,
                    judul: 'Permohonan Ditolak oleh PPK',
                    pesan: "Permohonan '{$permohonan->judul}' ditolak pada tahap persetujuan awal PPK: {$alasanBersih}",
                    refType: 'permohonan',
                    refId: $permohonan->id,
                );
            }

            return $permohonan;
        });
    }

    /**
     * Verifikasi Berhasil Dokumen Pengadaan oleh Pejabat Pengadaan (PP) -> meneruskan ke PPK.
     */
    public function approvePengadaanPp(Pengadaan $pengadaan, User $actor): Pengadaan
    {
        $pengadaan->loadMissing('Level', 'Permohonan');
        if (! $pengadaan->Level?->perlu_review_pp) {
            abort(403, 'Dokumen pengadaan ini tidak memerlukan verifikasi Pejabat Pengadaan (PP).');
        }

        return DB::transaction(function () use ($pengadaan, $actor) {
            $statusLama = $pengadaan->status;
            $statusBaru = 'diteruskan';

            ApprovalPengadaan::updateOrCreate(
                [
                    'pengadaan_id' => $pengadaan->id,
                    'tahap' => 'PP',
                    'revisi_ke' => (int) ($pengadaan->revisi_ke ?? 0),
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

            if ($pengadaan->ppk_id) {
                $this->notificationService->send(
                    user: (int) $pengadaan->ppk_id,
                    judul: 'Pengadaan Membutuhkan Otorisasi PPK',
                    pesan: "Pengadaan '{$pengadaan->Permohonan?->judul}' telah diverifikasi PP dan diteruskan untuk otorisasi komitmen PPK.",
                    refType: 'pengadaan',
                    refId: $pengadaan->id,
                );
            }

            return $pengadaan;
        });
    }

    /**
     * Verifikasi Gagal Dokumen Pengadaan oleh Pejabat Pengadaan (PP) -> mengembalikan ke PPBJ.
     *
     * @throws ValidationException
     */
    public function rejectPengadaanPp(Pengadaan $pengadaan, User $actor, string $catatan): Pengadaan
    {
        $pengadaan->loadMissing('Level', 'Permohonan');
        if (! $pengadaan->Level?->perlu_review_pp) {
            abort(403, 'Dokumen pengadaan ini tidak memerlukan verifikasi Pejabat Pengadaan (PP).');
        }

        $catatanBersih = trim($catatan);
        if ($catatanBersih === '') {
            throw ValidationException::withMessages([
                'catatan' => ['Catatan revisi wajib diisi.'],
                'alasan' => ['Catatan revisi wajib diisi.'],
            ]);
        }

        return DB::transaction(function () use ($pengadaan, $actor, $catatanBersih) {
            $statusLama = $pengadaan->status;
            $statusBaru = 'ditolak';

            ApprovalPengadaan::updateOrCreate(
                [
                    'pengadaan_id' => $pengadaan->id,
                    'tahap' => 'PP',
                    'revisi_ke' => (int) ($pengadaan->revisi_ke ?? 0),
                ],
                [
                    'keputusan' => 'ditolak',
                    'alasan' => $catatanBersih,
                    'actor_id' => $actor->id,
                ]
            );

            $pengadaan->update([
                'status' => $statusBaru,
                'revisi_ke' => ((int) ($pengadaan->revisi_ke ?? 0)) + 1,
            ]);

            StatusHistory::create([
                'ref_type' => 'pengadaan',
                'ref_id' => $pengadaan->id,
                'status_lama' => $statusLama,
                'status_baru' => $statusBaru,
                'actor_id' => $actor->id,
            ]);

            $ppbjUsers = User::whereHas('Role', fn ($q) => $q->where('nama', 'PPBJ'))->pluck('id');
            foreach ($ppbjUsers as $ppbjId) {
                $this->notificationService->send(
                    user: (int) $ppbjId,
                    judul: 'Dokumen Pengadaan Perlu Revisi (PP)',
                    pesan: "Dokumen pengadaan '{$pengadaan->Permohonan?->judul}' dikembalikan oleh PP: {$catatanBersih}",
                    refType: 'pengadaan',
                    refId: $pengadaan->id,
                );
            }

            return $pengadaan;
        });
    }

    /**
     * Otorisasi komitmen Dokumen Pengadaan oleh PPK (tanpa memo) -> diteruskan ke PPBJ.
     */
    public function approvePengadaanPpk(Pengadaan $pengadaan, User $actor): Pengadaan
    {
        $this->pastikanPpkBerhakAtasPengadaan($pengadaan, $actor);

        return DB::transaction(function () use ($pengadaan, $actor) {
            $statusLama = $pengadaan->status;
            $statusBaru = 'disetujui';

            ApprovalPengadaan::updateOrCreate(
                [
                    'pengadaan_id' => $pengadaan->id,
                    'tahap' => 'PPK',
                    'revisi_ke' => (int) ($pengadaan->revisi_ke ?? 0),
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

            $ppbjUsers = User::whereHas('Role', fn ($q) => $q->where('nama', 'PPBJ'))->pluck('id');
            foreach ($ppbjUsers as $ppbjId) {
                $this->notificationService->send(
                    user: (int) $ppbjId,
                    judul: 'Dokumen Pengadaan Disetujui PPK',
                    pesan: "Dokumen pengadaan '{$pengadaan->Permohonan?->judul}' telah diotorisasi oleh PPK dan diteruskan ke PPBJ.",
                    refType: 'pengadaan',
                    refId: $pengadaan->id,
                );
            }

            return $pengadaan;
        });
    }

    /**
     * Penolakan Dokumen Pengadaan oleh PPK -> wajib alasan dan selalu kembali ke PPBJ.
     *
     * @throws ValidationException
     */
    public function rejectPengadaanPpk(Pengadaan $pengadaan, User $actor, string $alasan): Pengadaan
    {
        $this->pastikanPpkBerhakAtasPengadaan($pengadaan, $actor);

        $alasanBersih = trim($alasan);
        if ($alasanBersih === '') {
            throw ValidationException::withMessages([
                'alasan' => ['Alasan penolakan dokumen pengadaan wajib diisi.'],
            ]);
        }

        return DB::transaction(function () use ($pengadaan, $actor, $alasanBersih) {
            $statusLama = $pengadaan->status;
            $statusBaru = 'ditolak';

            ApprovalPengadaan::updateOrCreate(
                [
                    'pengadaan_id' => $pengadaan->id,
                    'tahap' => 'PPK',
                    'revisi_ke' => (int) ($pengadaan->revisi_ke ?? 0),
                ],
                [
                    'keputusan' => 'ditolak',
                    'alasan' => $alasanBersih,
                    'actor_id' => $actor->id,
                ]
            );

            $pengadaan->update([
                'status' => $statusBaru,
                'revisi_ke' => ((int) ($pengadaan->revisi_ke ?? 0)) + 1,
            ]);

            StatusHistory::create([
                'ref_type' => 'pengadaan',
                'ref_id' => $pengadaan->id,
                'status_lama' => $statusLama,
                'status_baru' => $statusBaru,
                'actor_id' => $actor->id,
            ]);

            $ppbjUsers = User::whereHas('Role', fn ($q) => $q->where('nama', 'PPBJ'))->pluck('id');
            foreach ($ppbjUsers as $ppbjId) {
                $this->notificationService->send(
                    user: (int) $ppbjId,
                    judul: 'Dokumen Pengadaan Ditolak PPK',
                    pesan: "Dokumen pengadaan '{$pengadaan->Permohonan?->judul}' ditolak oleh PPK dan dikembalikan ke PPBJ: {$alasanBersih}",
                    refType: 'pengadaan',
                    refId: $pengadaan->id,
                );
            }

            return $pengadaan;
        });
    }

    /**
     * Persetujuan Dokumen Pembayaran oleh PPK dengan mengunggah Memo Persetujuan Pembayaran.
     *
     * @throws ValidationException
     */
    public function approvePembayaranPpk(
        Pengadaan $pengadaan,
        User $actor,
        UploadedFile|string|null $memo = null,
        ?string $catatan = null
    ): Pengadaan {
        $this->pastikanPpkBerhakAtasPengadaan($pengadaan, $actor);

        return DB::transaction(function () use ($pengadaan, $actor, $memo, $catatan) {
            $statusLama = $pengadaan->status;

            if ($memo instanceof UploadedFile) {
                $memoDoc = $this->dokumenService->simpanDokumen(
                    file: $memo,
                    actor: $actor,
                    refType: 'pengadaan',
                    refId: $pengadaan->id,
                    tipeDokumen: 'memo_persetujuan_pembayaran',
                    folder: 'dokumen/pembayaran/memo',
                    field: 'memo'
                );
            } else {
                $filename = is_string($memo) && $memo !== ''
                    ? $memo
                    : "Memo_Persetujuan_Pembayaran_{$pengadaan->id}.pdf";

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
            }

            ApprovalPengadaan::updateOrCreate(
                [
                    'pengadaan_id' => $pengadaan->id,
                    'tahap' => 'PPK_PEMBAYARAN',
                    'revisi_ke' => (int) ($pengadaan->revisi_ke ?? 0),
                ],
                [
                    'keputusan' => 'disetujui',
                    'alasan' => $catatan,
                    'bukti_tanda_tangan_id' => $memoDoc->id,
                    'actor_id' => $actor->id,
                ]
            );

            // Jika ada record pembayaran pada rencana kontrak, catat juga ke approval_pembayaran
            $pengadaan->loadMissing('Kontrak.Rencana.Pembayaran');
            $pembayaran = $pengadaan->Kontrak?->Rencana?->map(fn ($r) => $r->Pembayaran)->filter()->first();
            $statusBaru = 'selesai';

            if ($pembayaran instanceof Pembayaran) {
                $revPembayaran = (int) ($pembayaran->revisi_ke ?? 0);
                ApprovalPembayaran::updateOrCreate(
                    [
                        'pembayaran_id' => $pembayaran->id,
                        'tahap' => 'PPK',
                        'revisi_ke' => $revPembayaran,
                    ],
                    [
                        'keputusan' => 'disetujui',
                        'alasan' => $catatan,
                        'memo_dokumen_id' => $memoDoc->id,
                        'actor_id' => $actor->id,
                    ]
                );

                $bidang2Setuju = ApprovalPembayaran::where('pembayaran_id', $pembayaran->id)
                    ->where('tahap', 'BIDANG2')
                    ->where('revisi_ke', $revPembayaran)
                    ->where('keputusan', 'disetujui')
                    ->exists();

                $pembayaran->update([
                    'status' => $bidang2Setuju ? 'disetujui' : 'menunggu_bidang2',
                ]);
            }

            $pengadaan->update(['status' => $statusBaru]);

            StatusHistory::create([
                'ref_type' => 'pengadaan',
                'ref_id' => $pengadaan->id,
                'status_lama' => $statusLama,
                'status_baru' => $statusBaru,
                'actor_id' => $actor->id,
            ]);

            $keuanganUsers = User::whereHas('Role', fn ($q) => $q->where('nama', 'Keuangan'))->pluck('id');
            foreach ($keuanganUsers as $keuanganId) {
                $this->notificationService->send(
                    user: (int) $keuanganId,
                    judul: 'Persetujuan Pembayaran dari PPK',
                    pesan: "Dokumen pembayaran pengadaan '{$pengadaan->Permohonan?->judul}' telah disetujui oleh PPK beserta Memo Persetujuan.",
                    refType: 'pengadaan',
                    refId: $pengadaan->id,
                );
            }

            return $pengadaan;
        });
    }

    /**
     * Penolakan Dokumen Pembayaran oleh PPK -> wajib alasan dan mengembalikan ke PPBJ.
     *
     * @throws ValidationException
     */
    public function rejectPembayaranPpk(Pengadaan $pengadaan, User $actor, string $alasan): Pengadaan
    {
        $this->pastikanPpkBerhakAtasPengadaan($pengadaan, $actor);

        $alasanBersih = trim($alasan);
        if ($alasanBersih === '') {
            throw ValidationException::withMessages([
                'alasan' => ['Alasan penolakan dokumen pembayaran wajib diisi.'],
            ]);
        }

        return DB::transaction(function () use ($pengadaan, $actor, $alasanBersih) {
            $statusLama = $pengadaan->status;
            $statusBaru = 'ditolak';

            ApprovalPengadaan::updateOrCreate(
                [
                    'pengadaan_id' => $pengadaan->id,
                    'tahap' => 'PPK_PEMBAYARAN',
                    'revisi_ke' => (int) ($pengadaan->revisi_ke ?? 0),
                ],
                [
                    'keputusan' => 'ditolak',
                    'alasan' => $alasanBersih,
                    'actor_id' => $actor->id,
                ]
            );

            $pengadaan->loadMissing('Kontrak.Rencana.Pembayaran');
            $pembayaran = $pengadaan->Kontrak?->Rencana?->map(fn ($r) => $r->Pembayaran)->filter()->first();
            if ($pembayaran instanceof Pembayaran) {
                $revPembayaran = (int) ($pembayaran->revisi_ke ?? 0);
                ApprovalPembayaran::updateOrCreate(
                    [
                        'pembayaran_id' => $pembayaran->id,
                        'tahap' => 'PPK',
                        'revisi_ke' => $revPembayaran,
                    ],
                    [
                        'keputusan' => 'ditolak',
                        'alasan' => $alasanBersih,
                        'actor_id' => $actor->id,
                    ]
                );

                $pembayaran->update([
                    'status' => 'ditolak',
                    'revisi_ke' => $revPembayaran + 1,
                ]);
            }

            $pengadaan->update([
                'status' => $statusBaru,
                'revisi_ke' => ((int) ($pengadaan->revisi_ke ?? 0)) + 1,
            ]);

            StatusHistory::create([
                'ref_type' => 'pengadaan',
                'ref_id' => $pengadaan->id,
                'status_lama' => $statusLama,
                'status_baru' => $statusBaru,
                'actor_id' => $actor->id,
            ]);

            $ppbjUsers = User::whereHas('Role', fn ($q) => $q->where('nama', 'PPBJ'))->pluck('id');
            foreach ($ppbjUsers as $ppbjId) {
                $this->notificationService->send(
                    user: (int) $ppbjId,
                    judul: 'Dokumen Pembayaran Ditolak PPK',
                    pesan: "Dokumen pembayaran pengadaan '{$pengadaan->Permohonan?->judul}' ditolak oleh PPK: {$alasanBersih}",
                    refType: 'pengadaan',
                    refId: $pengadaan->id,
                );
            }

            return $pengadaan;
        });
    }

    /**
     * Memastikan akun PPK yang login terikat pada salah satu Jenis MAK milik permohonan.
     */
    public function pastikanPpkBerhakAtasPermohonan(Permohonan $permohonan, User $actor): void
    {
        $berhak = PermohonanMak::where('permohonan_id', $permohonan->id)
            ->whereHas('Mak', fn ($q) => $q->where('ppk_user_id', $actor->id))
            ->exists();

        if (! $berhak) {
            abort(403, 'Anda tidak memiliki akses pada permohonan yang tidak terikat dengan Jenis MAK Anda.');
        }
    }

    /**
     * Memastikan akun PPK yang login terikat pada pengadaan atau Jenis MAK pengadaan tersebut.
     */
    public function pastikanPpkBerhakAtasPengadaan(Pengadaan $pengadaan, User $actor): void
    {
        $pengadaan->loadMissing('PermohonanMak.Mak');
        $makPpkId = $pengadaan->PermohonanMak?->Mak?->ppk_user_id;

        // Jika pengadaan memiliki ppk_id atau mak.ppk_user_id yang spesifik, pastikan cocok dengan akun PPK yang login
        if ($pengadaan->ppk_id !== null || $makPpkId !== null) {
            $cocok = ((int) $pengadaan->ppk_id === (int) $actor->id)
                || ((int) $makPpkId === (int) $actor->id);

            if (! $cocok) {
                abort(403, 'Anda tidak memiliki akses pada dokumen pengadaan milik PPK lain.');
            }
        }
    }
}
