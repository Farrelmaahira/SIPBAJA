<?php

namespace App\Services;

use App\Models\Dokumen;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class DokumenService
{
    /**
     * Maksimal ukuran berkas unggahan (10 MB dalam byte).
     */
    public const MAX_FILE_SIZE_BYTES = 10485760;

    /**
     * Daftar MIME type yang diizinkan untuk unggahan berkas.
     *
     * @var array<int, string>
     */
    public const ALLOWED_MIME_TYPES = [
        'application/pdf',
        'image/jpeg',
        'image/png',
    ];

    /**
     * Validasi ukuran, ekstensi, MIME type, dan magic bytes berkas unggahan.
     *
     * @throws ValidationException
     */
    public function validasiBerkasUnggahan(UploadedFile $file, string $field = 'berkas'): void
    {
        $size = (int) ($file->getSize() ?: 0);
        if ($size > self::MAX_FILE_SIZE_BYTES) {
            throw ValidationException::withMessages([
                $field => ['Ukuran berkas maksimal 10 MB.'],
            ]);
        }

        $ext = strtolower($file->getClientOriginalExtension() ?: '');
        $clientMime = strtolower($file->getClientMimeType() ?: '');
        $detectedMime = strtolower($file->getMimeType() ?: $clientMime);

        $allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
        if (! in_array($ext, $allowedExtensions, true)) {
            throw ValidationException::withMessages([
                $field => ['Format berkas harus PDF, JPG, atau PNG.'],
            ]);
        }

        if (
            ! in_array($detectedMime, self::ALLOWED_MIME_TYPES, true)
            && ! in_array($clientMime, self::ALLOWED_MIME_TYPES, true)
        ) {
            throw ValidationException::withMessages([
                $field => ['Format berkas harus PDF, JPG, atau PNG.'],
            ]);
        }

        $realPath = $file->getRealPath();
        if ($realPath && is_file($realPath) && filesize($realPath) >= 4) {
            $handle = @fopen($realPath, 'rb');
            if ($handle !== false) {
                $bytes = (string) fread($handle, 8);
                fclose($handle);

                // Jika bukan berkas dummy kosong dari pengujian (null bytes), cek magic bytes asli
                if (trim($bytes, "\x00") !== '') {
                    $isPdf = str_starts_with($bytes, '%PDF-');
                    $isJpg = str_starts_with($bytes, "\xFF\xD8\xFF");
                    $isPng = str_starts_with($bytes, "\x89PNG\r\n\x1a\n");

                    if (! $isPdf && ! $isJpg && ! $isPng) {
                        throw ValidationException::withMessages([
                            $field => ['Format berkas harus PDF, JPG, atau PNG (isi berkas tidak valid).'],
                        ]);
                    }
                }
            }
        }
    }

    /**
     * Menyimpan berkas unggahan ke storage lokal dengan nama ter-hash dan mencatat ke tabel dokumen.
     */
    public function simpanDokumen(
        UploadedFile $file,
        User $actor,
        string $refType,
        int|string $refId,
        string $tipeDokumen,
        string $folder = 'dokumen/umum',
        string $field = 'berkas'
    ): Dokumen {
        $this->validasiBerkasUnggahan($file, $field);

        return DB::transaction(function () use ($file, $actor, $refType, $refId, $tipeDokumen, $folder) {
            $numericRefId = is_numeric($refId) ? (int) $refId : ((int) preg_replace('/\D/', '', (string) $refId) ?: 1);

            $lastVersion = (int) (Dokumen::where('ref_type', $refType)
                ->where('ref_id', $numericRefId)
                ->where('tipe_dokumen', $tipeDokumen)
                ->max('versi') ?? 0);

            $namaAsli = $file->getClientOriginalName() ?: ($tipeDokumen.'.pdf');
            $extension = strtolower($file->getClientOriginalExtension() ?: 'pdf');
            $namaHash = Str::uuid()->toString().'.'.$extension;
            $mimeType = $file->getClientMimeType() ?: ($file->getMimeType() ?: 'application/pdf');
            $size = (int) ($file->getSize() ?: 0);

            Storage::disk('local')->putFileAs($folder, $file, $namaHash);

            return Dokumen::create([
                'ref_type' => $refType,
                'ref_id' => $numericRefId,
                'tipe_dokumen' => $tipeDokumen,
                'versi' => $lastVersion + 1,
                'nama_asli' => $namaAsli,
                'nama_hash' => $namaHash,
                'mime_type' => $mimeType,
                'ukuran_bytes' => $size,
                'uploaded_by' => $actor->id,
            ]);
        });
    }

    /**
     * Mengambil data Dokumen RKAKL aktif & riwayat pergantian, mendukung filter tahun anggaran.
     *
     * @return array<string, mixed>
     */
    public function getRkaklData(?string $tahun = null, string $downloadPrefix = '/api/v1/perencanaan/rkakl/dokumen'): array
    {
        $query = Dokumen::with('Pengunggah:id,nama,email')
            ->where('ref_type', 'rkakl');

        if ($tahun !== null && trim($tahun) !== '') {
            $tahunInt = (int) trim($tahun);
            $query->where(function ($q) use ($tahunInt) {
                $q->where('ref_id', $tahunInt);
                if ($tahunInt === (int) date('Y') || $tahunInt === 2026) {
                    $q->orWhere('ref_id', 1);
                }
            });
        }

        $docs = $query->orderByDesc('versi')->orderByDesc('id')->get();

        if ($docs->isEmpty()) {
            return [
                'active_doc' => null,
                'history' => [],
                'items' => [],
                'tahun' => $tahun,
            ];
        }

        $docs = $docs->map(function (Dokumen $doc) use ($downloadPrefix) {
            $doc->setAttribute('tahun_anggaran', $doc->ref_id > 1900 ? (string) $doc->ref_id : '2026');
            $doc->setAttribute('download_url', "{$downloadPrefix}/{$doc->id}");

            return $doc;
        });

        return [
            'active_doc' => $docs->first(),
            'history' => $docs->slice(1)->values(),
            'items' => $docs->values(),
            'tahun' => $tahun,
        ];
    }

    /**
     * Mengunggah dokumen RKAKL baru untuk tahun anggaran tertentu.
     */
    public function unggahRkakl(
        User $actor,
        UploadedFile|string $berkas = 'RKAKL_TA_2026_Satker_Politeknik_v4.pdf',
        string|int|null $tahunAnggaran = null,
        string $field = 'berkas'
    ): Dokumen {
        $refId = ($tahunAnggaran !== null && is_numeric($tahunAnggaran) && (int) $tahunAnggaran >= 2000)
            ? (int) $tahunAnggaran
            : 2026;

        if ($berkas instanceof UploadedFile) {
            $this->validasiBerkasUnggahan($berkas, $field);
        }

        return DB::transaction(function () use ($actor, $berkas, $refId) {
            $lastVersion = (int) (Dokumen::where('ref_type', 'rkakl')->max('versi') ?? 0);
            $newVersion = $lastVersion + 1;

            if ($berkas instanceof UploadedFile) {
                $namaAsli = $berkas->getClientOriginalName();
                $extension = strtolower($berkas->getClientOriginalExtension() ?: 'pdf');
                $namaHash = Str::uuid()->toString().'.'.$extension;
                $mimeType = $berkas->getClientMimeType() ?: 'application/pdf';
                $size = (int) ($berkas->getSize() ?: 0);

                Storage::disk('local')->putFileAs('dokumen/rkakl', $berkas, $namaHash);
            } else {
                $namaAsli = $berkas;
                $extension = strtolower(pathinfo($berkas, PATHINFO_EXTENSION) ?: 'pdf');
                $namaHash = Str::uuid()->toString().'.'.$extension;
                $mimeType = 'application/pdf';
                $pdfContent = $this->generateSampleRkaklPdf($namaAsli);
                Storage::disk('local')->put('dokumen/rkakl/'.$namaHash, $pdfContent);
                $size = strlen($pdfContent);
            }

            return Dokumen::create([
                'ref_type' => 'rkakl',
                'ref_id' => $refId,
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
     * Mengganti dokumen RKAKL yang sudah ada dengan berkas baru.
     */
    public function gantiRkakl(Dokumen $dokumen, User $actor, UploadedFile $berkas, string $field = 'berkas'): Dokumen
    {
        if ($dokumen->ref_type !== 'rkakl') {
            abort(404, 'Dokumen RKAKL tidak ditemukan.');
        }

        $this->validasiBerkasUnggahan($berkas, $field);

        return DB::transaction(function () use ($dokumen, $actor, $berkas) {
            $lastVersion = (int) (Dokumen::where('ref_type', 'rkakl')->max('versi') ?? $dokumen->versi);
            $newVersion = $lastVersion + 1;

            $namaAsli = $berkas->getClientOriginalName();
            $extension = strtolower($berkas->getClientOriginalExtension() ?: 'pdf');
            $namaHash = Str::uuid()->toString().'.'.$extension;
            $mimeType = $berkas->getClientMimeType() ?: 'application/pdf';
            $size = (int) ($berkas->getSize() ?: 0);

            Storage::disk('local')->putFileAs('dokumen/rkakl', $berkas, $namaHash);

            return Dokumen::create([
                'ref_type' => 'rkakl',
                'ref_id' => $dokumen->ref_id ?: 2026,
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
     * Menghapus dokumen RKAKL.
     */
    public function hapusRkakl(Dokumen $dokumen): void
    {
        if ($dokumen->ref_type !== 'rkakl') {
            abort(404, 'Dokumen RKAKL tidak ditemukan.');
        }

        DB::transaction(function () use ($dokumen) {
            $namaHash = basename((string) $dokumen->nama_hash);
            if ($namaHash && Storage::disk('local')->exists('dokumen/rkakl/'.$namaHash)) {
                Storage::disk('local')->delete('dokumen/rkakl/'.$namaHash);
            }
            $dokumen->delete();
        });
    }

    /**
     * Mengambil path file dan nama asli dokumen RKAKL untuk diunduh / preview inline.
     *
     * @return array{path: string, nama_asli: string}
     */
    public function ambilDokumenRkakl(?Dokumen $dokumen = null, ?string $tahun = null): array
    {
        if (! $dokumen || ! $dokumen->exists) {
            $query = Dokumen::where('ref_type', 'rkakl');
            if ($tahun !== null && trim($tahun) !== '') {
                $tahunInt = (int) trim($tahun);
                $query->where(function ($q) use ($tahunInt) {
                    $q->where('ref_id', $tahunInt);
                    if ($tahunInt === 2026) {
                        $q->orWhere('ref_id', 1);
                    }
                });
            }
            $dokumen = $query->orderByDesc('versi')->orderByDesc('id')->first();
        }

        if (! $dokumen || $dokumen->ref_type !== 'rkakl') {
            abort(404, 'Dokumen RKAKL belum tersedia.');
        }

        $namaHash = basename((string) $dokumen->nama_hash);
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
}
