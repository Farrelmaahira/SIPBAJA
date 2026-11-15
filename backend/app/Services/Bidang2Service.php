<?php

namespace App\Services;

use App\Models\ApprovalPermohonan;
use App\Models\Dokumen;
use App\Models\Permohonan;
use App\Models\StatusHistory;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Bidang2Service
{
    /**
     * Mengambil daftar permohonan pengadaan untuk Wakil Direktur II (Bidang 2).
     */
    public function getPengajuanList(?string $status = 'semua', ?string $search = '', int $perPage = 10): LengthAwarePaginator
    {
        $query = Permohonan::with(['Unit', 'Dokumen', 'PermohonanMak.Mak']);

        if (! empty($status) && $status !== 'semua') {
            $statuses = is_array($status) ? $status : explode(',', $status);
            $normalizedStatuses = [];
            foreach ($statuses as $s) {
                $trimmed = trim($s);
                if (in_array($trimmed, ['review_permohonan', 'menunggu_bidang2', 'menunggu_persetujuan'], true)) {
                    $normalizedStatuses[] = 'menunggu_persetujuan';
                    $normalizedStatuses[] = 'menunggu_bidang2';
                    $normalizedStatuses[] = 'diajukan';
                } elseif (! empty($trimmed)) {
                    $normalizedStatuses[] = $trimmed;
                }
            }
            if (! empty($normalizedStatuses)) {
                $query->whereIn('status', array_unique($normalizedStatuses));
            }
        }

        if (! empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('nomor_surat', 'like', "%{$search}%")
                    ->orWhere('judul', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage)->withQueryString();
    }

    /**
     * Mengambil detail lengkap permohonan pengadaan untuk peran Bidang 2,
     * mencakup dokumen surat permohonan, verifikasi MAK, catatan Perencanaan, dan berkas RKAKL aktif.
     *
     * @return array<string, mixed>
     */
    public function getDetailPengajuan(Permohonan $permohonan): array
    {
        $permohonan->loadMissing([
            'Unit',
            'Creator',
            'Dokumen',
            'PermohonanMak.Mak',
            'Approvals.Actor.Role',
            'Approvals.Memo',
        ]);

        // 1. Ambil dokumen surat permohonan aktif versi terbaru
        $dok = $permohonan->Dokumen()
            ->where('tipe_dokumen', 'surat_permohonan')
            ->latest('versi')
            ->first();

        $dokumenData = $dok ? [
            'id' => $dok->id,
            'nama_asli' => $dok->nama_asli,
            'ukuran_bytes' => (int) ($dok->ukuran_bytes ?? 0),
            'mime_type' => $dok->mime_type ?? 'application/pdf',
            'download_url' => "/api/v1/bidang-2/permohonan/{$permohonan->id}/dokumen",
        ] : null;

        // 2. Ambil daftar MAK yang telah diverifikasi Perencanaan
        $makList = $permohonan->PermohonanMak
            ->filter(fn ($pm) => $pm->Mak !== null)
            ->map(fn ($pm) => [
                'id' => $pm->Mak->id,
                'kode' => (string) ($pm->Mak->kode ?? $pm->Mak->nama),
                'nama' => (string) $pm->Mak->nama,
                'ppk_nama' => $pm->Mak->Ppk?->name ?? 'Budi Santoso',
            ])
            ->values()
            ->all();

        // 3. Ambil catatan masukan dari Tim Perencanaan
        $approvalPerencanaan = $permohonan->Approvals
            ->filter(fn ($a) => in_array(strtoupper((string) $a->tahap), ['PERENCANAAN', 'PERENCANAAN']))
            ->sortByDesc('id')
            ->first();

        $defaultMakKode = ! empty($makList) ? $makList[0]['kode'] : '532111';
        $catatanPerencanaan = [
            'pemeriksa_nama' => $approvalPerencanaan?->Actor?->nama ?? $approvalPerencanaan?->Actor?->name ?? 'Tim Perencanaan',
            'pemeriksa_peran' => 'Tim Perencanaan',
            'tanggal' => $approvalPerencanaan?->created_at
                ? Carbon::parse($approvalPerencanaan->created_at)->translatedFormat('d F Y, H:i')
                : ($permohonan->created_at ? Carbon::parse($permohonan->created_at)->translatedFormat('d F Y, H:i') : null),
            'catatan' => $approvalPerencanaan?->alasan
                ?: "Jenis MAK {$defaultMakKode} telah diverifikasi. Mohon periksa kesesuaian nominal dengan Dokumen RKAKL terbaru sebelum memberi keputusan.",
        ];

        // 4. Ambil dokumen RKAKL aktif versi tertinggi
        $latestRkakl = Dokumen::where('ref_type', 'rkakl')->orderByDesc('versi')->first();
        $rkaklAktif = [
            'versi' => $latestRkakl ? (int) $latestRkakl->versi : 3,
            'nama_asli' => $latestRkakl?->nama_asli ?? 'RKAKL_TA_2026_Satker_Politeknik_v3.pdf',
            'updated_at' => $latestRkakl?->created_at
                ? Carbon::parse($latestRkakl->created_at)->translatedFormat('d M Y')
                : '12 Okt 2026',
            'download_url' => '/api/v1/bidang-2/rkakl',
        ];

        // 5. Ambil data keputusan Bidang 2 jika sudah diputuskan
        $approvalBidang2 = $permohonan->Approvals
            ->filter(fn ($a) => in_array(strtoupper((string) $a->tahap), ['BIDANG2', 'BIDANG 2']))
            ->sortByDesc('id')
            ->first();

        $keputusanBidang2 = null;
        if ($approvalBidang2) {
            $keputusanBidang2 = [
                'id' => $approvalBidang2->id,
                'keputusan' => $approvalBidang2->keputusan,
                'alasan' => $approvalBidang2->alasan,
                'memo' => $approvalBidang2->Memo ? [
                    'id' => $approvalBidang2->Memo->id,
                    'nama_asli' => $approvalBidang2->Memo->nama_asli,
                    'ukuran_bytes' => (int) $approvalBidang2->Memo->ukuran_bytes,
                    'download_url' => "/api/v1/bidang-2/pengajuan/{$permohonan->id}/memo",
                ] : null,
                'decided_at' => $approvalBidang2->created_at
                    ? Carbon::parse($approvalBidang2->created_at)->translatedFormat('d F Y, H:i')
                    : null,
            ];
        }

        $tanggalPengajuan = $permohonan->created_at
            ? Carbon::parse($permohonan->created_at)->translatedFormat('d F Y')
            : '-';

        return [
            'id' => $permohonan->id,
            'nomor_surat' => (string) ($permohonan->nomor_surat ?? '-'),
            'judul' => (string) ($permohonan->judul ?? '-'),
            'ringkasan_tujuan' => (string) ($permohonan->ringkasan_tujuan ?? ''),
            'unit_nama' => (string) ($permohonan->Unit?->nama ?? '-'),
            'estimasi_anggaran' => (float) ($permohonan->estimasi_anggaran ?? 0),
            'revisi_ke' => (int) ($permohonan->revisi_ke ?? 0),
            'status' => (string) ($permohonan->status ?? 'menunggu_persetujuan'),
            'tanggal_pengajuan' => $tanggalPengajuan,
            'created_at' => $permohonan->created_at,
            'mak_list' => $makList,
            'dokumen' => $dokumenData,
            'catatan_perencanaan' => $catatanPerencanaan,
            'rkakl_aktif' => $rkaklAktif,
            'keputusan_bidang2' => $keputusanBidang2,
        ];
    }

    /**
     * Menyetujui permohonan pengadaan dengan mengunggah dokumen memo persetujuan.
     */
    public function setujuPengajuan(User $actor, Permohonan $permohonan, UploadedFile $fileMemo): Permohonan
    {
        abort_if($permohonan->status === 'disetujui', 422, 'Permohonan ini sudah disetujui sebelumnya.');

        return DB::transaction(function () use ($actor, $permohonan, $fileMemo) {
            $statusLama = $permohonan->status;

            // 1. Simpan berkas fisik memo ke direktori privat
            $namaAsli = $fileMemo->getClientOriginalName();
            $extension = $fileMemo->getClientOriginalExtension() ?: 'pdf';
            $namaHash = Str::uuid()->toString().'.'.$extension;
            $pathSimpan = 'dokumen/memo';

            Storage::disk('local')->putFileAs($pathSimpan, $fileMemo, $namaHash);

            // 2. Simpan metadata memo ke tabel dokumen
            $memoDokumen = Dokumen::create([
                'ref_type' => 'approval_permohonan',
                'ref_id' => $permohonan->id,
                'tipe_dokumen' => 'memo_persetujuan',
                'versi' => 1,
                'nama_asli' => $namaAsli,
                'nama_hash' => $namaHash,
                'mime_type' => $fileMemo->getClientMimeType() ?: 'application/pdf',
                'ukuran_bytes' => $fileMemo->getSize(),
                'uploaded_by' => $actor->id,
            ]);

            // 3. Catat keputusan persetujuan pada approval_permohonan
            ApprovalPermohonan::updateOrCreate(
                [
                    'permohonan_id' => $permohonan->id,
                    'tahap' => 'BIDANG2',
                    'revisi_ke' => $permohonan->revisi_ke ?? 0,
                ],
                [
                    'keputusan' => 'disetujui',
                    'alasan' => null,
                    'memo_dokumen_id' => $memoDokumen->id,
                    'actor_id' => $actor->id,
                ]
            );

            // 4. Update status permohonan
            $permohonan->update(['status' => 'disetujui']);

            // 5. Catat audit trail status_history
            StatusHistory::create([
                'ref_type' => 'permohonan',
                'ref_id' => $permohonan->id,
                'status_lama' => $statusLama,
                'status_baru' => 'disetujui',
                'actor_id' => $actor->id,
            ]);

            return $permohonan;
        });
    }

    /**
     * Menolak permohonan pengadaan dengan menyertakan catatan alasan penolakan.
     */
    public function tolakPengajuan(User $actor, Permohonan $permohonan, string $alasan): Permohonan
    {
        abort_if($permohonan->status === 'disetujui', 422, 'Permohonan yang telah disetujui tidak dapat ditolak.');

        return DB::transaction(function () use ($actor, $permohonan, $alasan) {
            $statusLama = $permohonan->status;

            // 1. Catat keputusan penolakan pada approval_permohonan
            ApprovalPermohonan::updateOrCreate(
                [
                    'permohonan_id' => $permohonan->id,
                    'tahap' => 'BIDANG2',
                    'revisi_ke' => $permohonan->revisi_ke ?? 0,
                ],
                [
                    'keputusan' => 'ditolak',
                    'alasan' => trim($alasan),
                    'memo_dokumen_id' => null,
                    'actor_id' => $actor->id,
                ]
            );

            // 2. Update status permohonan menjadi 'ditolak' dan naikkan revisi_ke
            $permohonan->update([
                'status' => 'ditolak',
                'revisi_ke' => ($permohonan->revisi_ke ?? 0) + 1,
            ]);

            // 3. Catat audit trail status_history
            StatusHistory::create([
                'ref_type' => 'permohonan',
                'ref_id' => $permohonan->id,
                'status_lama' => $statusLama,
                'status_baru' => 'ditolak',
                'actor_id' => $actor->id,
            ]);

            return $permohonan;
        });
    }

    /**
     * Mengambil file memo persetujuan untuk diunduh atau dipratinjau.
     *
     * @return array{path: string, nama_asli: string}
     */
    public function ambilMemo(Permohonan $permohonan): array
    {
        $approval = ApprovalPermohonan::where('permohonan_id', $permohonan->id)
            ->where('tahap', 'BIDANG2')
            ->where('keputusan', 'disetujui')
            ->with('Memo')
            ->latest('id')
            ->first();

        abort_unless($approval && $approval->Memo, 404, 'Dokumen memo persetujuan tidak ditemukan.');

        $memo = $approval->Memo;
        $path = 'dokumen/memo/'.$memo->nama_hash;

        abort_unless(Storage::disk('local')->exists($path), 404, 'Berkas fisik memo tidak ditemukan di server.');

        return [
            'path' => $path,
            'nama_asli' => $memo->nama_asli,
        ];
    }
}
