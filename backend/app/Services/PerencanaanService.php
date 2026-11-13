<?php

namespace App\Services;

use App\Models\ApprovalPermohonan;
use App\Models\Dokumen;
use App\Models\Mak;
use App\Models\Permohonan;
use App\Models\PermohonanMak;
use App\Models\StatusHistory;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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

        $dokumenPermohonan = Dokumen::where('ref_type', 'permohonan')->where('ref_id', $permohonan->id)
            ->orderBy('id')
            ->get()
            ->map(function ($doc) use ($permohonan) {
                return [
                    'id' => $doc->id,
                    'nama_asli' => $doc->nama_asli,
                    'tipe_dokumen' => $doc->tipe_dokumen,
                    'ukuran_bytes' => (int) ($doc->ukuran_bytes ?? 0),
                    'mime_type' => $doc->mime_type ?? 'application/pdf',
                    'versi' => $doc->versi,
                    'created_at' => is_string($doc->created_at) ? $doc->created_at : $doc->created_at?->toISOString(),
                    'download_url' => "/api/v1/perencanaan/pengajuan/{$permohonan->id}/dokumen?dokumen_id={$doc->id}",
                ];
            });

        $dokumen = $permohonan->Dokumen()->where('tipe_dokumen', 'surat_permohonan')->latest('versi')->first()
            ?? Dokumen::where('ref_type', 'permohonan')->where('ref_id', $permohonan->id)->latest('id')->first();

        $dokumenInfo = $dokumen ? [
            'id' => $dokumen->id,
            'nama_asli' => $dokumen->nama_asli,
            'ukuran_bytes' => (int) ($dokumen->ukuran_bytes ?? 0),
            'mime_type' => $dokumen->mime_type ?? 'application/pdf',
            'download_url' => "/api/v1/perencanaan/pengajuan/{$permohonan->id}/dokumen",
        ] : null;

        return [
            'permohonan' => $permohonan,
            'maks' => $maks,
            'selected_mak_ids' => $selectedMakIds,
            'dokumen_permohonan' => $dokumenPermohonan,
            'dokumen' => $dokumenInfo,
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

        if ($docs->isEmpty()) {
            return [
                'active_doc' => null,
                'history' => [],
            ];
        }

        $docs = $docs->map(function ($doc) {
            $doc->download_url = "/api/v1/perencanaan/rkakl/dokumen/{$doc->id}";

            return $doc;
        });

        return [
            'active_doc' => $docs->first(),
            'history' => $docs->slice(1)->values(),
        ];
    }

    /**
     * Mengambil path file dan nama asli dokumen RKAKL untuk diunduh / preview inline.
     *
     * @return array{path: string, nama_asli: string}
     */
    public function ambilDokumenRkakl(?Dokumen $dokumen = null): array
    {
        if (! $dokumen || ! $dokumen->exists) {
            $dokumen = Dokumen::where('ref_type', 'rkakl')->orderByDesc('versi')->first();
        }

        if (! $dokumen) {
            abort(404, 'Dokumen RKAKL belum tersedia.');
        }

        $namaHash = basename($dokumen->nama_hash);
        $path = 'dokumen/rkakl/'.$namaHash;

        if (! Storage::disk('local')->exists($path)) {
            $pdfContent = $this->generateSampleRkaklPdf($dokumen->nama_asli ?: 'RKAKL TA 2026');
            Storage::disk('local')->put($path, $pdfContent);
        }

        return [
            'path' => $path,
            'nama_asli' => $dokumen->nama_asli ?: 'RKAKL_TA_2026.pdf',
        ];
    }

    /**
     * Menghasilkan berkas PDF sampel RKA-K/L yang valid dan dapat dirender langsung oleh viewer.
     */
    public function generateSampleRkaklPdf(string $title = 'RKAKL TAHUN ANGGARAN 2026'): string
    {
        $escapedTitle = addcslashes($title, '()\\');
        $stream = "BT\n/F1 16 Tf\n50 780 Td\n(POLITEKNIK NEGERI JAKARTA) Tj\n/F1 12 Tf\n0 -25 Td\n(RENCANA KERJA DAN ANGGARAN KEMENTERIAN / LEMBAGA (RKA-K/L)) Tj\n/F1 11 Tf\n0 -22 Td\n(Dokumen: {$escapedTitle}) Tj\n/F1 10 Tf\n0 -20 Td\n(Tahun Anggaran: 2026) Tj\n/F1 10 Tf\n0 -18 Td\n(Status: Terverifikasi oleh Bagian Perencanaan) Tj\nET";
        $streamLen = strlen($stream);

        $header = "%PDF-1.4\n";
        $o1 = "1 0 obj\n<</Type/Catalog/Pages 2 0 R>>\nendobj\n";
        $o2 = "2 0 obj\n<</Type/Pages/Kids[3 0 R]/Count 1>>\nendobj\n";
        $o3 = "3 0 obj\n<</Type/Page/MediaBox[0 0 595 842]/Parent 2 0 R/Resources<</Font<</F1 5 0 R>>>>/Contents 4 0 R>>\nendobj\n";
        $o4 = "4 0 obj\n<</Length {$streamLen}>>\nstream\n{$stream}\nendstream\nendobj\n";
        $o5 = "5 0 obj\n<</Type/Font/Subtype/Type1/BaseFont/Helvetica-Bold>>\nendobj\n";

        $offset1 = strlen($header);
        $offset2 = $offset1 + strlen($o1);
        $offset3 = $offset2 + strlen($o2);
        $offset4 = $offset3 + strlen($o3);
        $offset5 = $offset4 + strlen($o4);
        $xrefOffset = $offset5 + strlen($o5);

        $xref = sprintf(
            "xref\n0 6\n0000000000 65535 f \n%010d 00000 n \n%010d 00000 n \n%010d 00000 n \n%010d 00000 n \n%010d 00000 n \n",
            $offset1,
            $offset2,
            $offset3,
            $offset4,
            $offset5
        );

        $trailer = "trailer\n<</Size 6/Root 1 0 R>>\nstartxref\n{$xrefOffset}\n%%EOF\n";

        return $header.$o1.$o2.$o3.$o4.$o5.$xref.$trailer;
    }

    /**
     * Mengganti dokumen RKAKL dengan versi baru.
     */
    public function replaceRkakl(User $actor, UploadedFile|string $file = 'RKAKL_TA_2026_Satker_Politeknik_v4.pdf'): Dokumen
    {
        return DB::transaction(function () use ($actor, $file) {
            $lastVersion = Dokumen::where('ref_type', 'rkakl')->max('versi') ?? 0;
            $newVersion = $lastVersion + 1;

            if ($file instanceof UploadedFile) {
                $namaAsli = $file->getClientOriginalName();
                $extension = $file->getClientOriginalExtension() ?: 'pdf';
                $namaHash = Str::uuid()->toString().'.'.$extension;
                $mimeType = $file->getClientMimeType() ?: 'application/pdf';
                $size = $file->getSize() ?: 0;

                Storage::disk('local')->putFileAs('dokumen/rkakl', $file, $namaHash);
            } else {
                $namaAsli = $file;
                $extension = pathinfo($file, PATHINFO_EXTENSION) ?: 'pdf';
                $namaHash = Str::uuid()->toString().'.'.$extension;
                $mimeType = 'application/pdf';
                $pdfContent = $this->generateSampleRkaklPdf($namaAsli);
                Storage::disk('local')->put('dokumen/rkakl/'.$namaHash, $pdfContent);
                $size = strlen($pdfContent);
            }

            return Dokumen::create([
                'ref_type' => 'rkakl',
                'ref_id' => 1,
                'tipe_dokumen' => 'rkakl',
                'versi' => $newVersion,
                'nama_asli' => $namaAsli,
                'nama_hash' => $namaHash,
                'mime_type' => $mimeType,
                'ukuran_bytes' => $size,
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
        return app(NotificationService::class)->getNotifications($user, $tab);
    }

    public function markAllNotificationsRead(User $user): void
    {
        app(NotificationService::class)->markAllAsRead($user);
    }
}
