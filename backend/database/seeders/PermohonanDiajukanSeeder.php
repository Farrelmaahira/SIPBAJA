<?php

namespace Database\Seeders;

use App\Models\Dokumen;
use App\Models\Permohonan;
use App\Models\StatusHistory;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PermohonanDiajukanSeeder extends Seeder
{
    /**
     * Membuat satu permohonan yang baru diajukan pemohon dan belum diproses
     * perencanaan: status "diajukan", tanpa penentuan MAK dan tanpa approval.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            UserSeeder::class,
        ]);

        DB::transaction(function () {
            $unit = Unit::where('nama', 'Jurusan Teknik Informatika')->firstOrFail();
            $pemohon = User::where('email', 'jurusan@pnj.ac.id')->firstOrFail();

            $permohonan = Permohonan::updateOrCreate(
                ['nomor_surat' => 'PRM/DIAJUKAN/2026/001'],
                [
                    'unit_id' => $unit->id,
                    'created_by' => $pemohon->id,
                    'judul' => 'Pengadaan Alat Tulis Kantor dan Bahan Praktikum Laboratorium',
                    'ringkasan_tujuan' => 'Pemenuhan kebutuhan alat tulis kantor dan bahan habis pakai untuk kegiatan praktikum semester gasal.',
                    'estimasi_anggaran' => 45000000,
                    'revisi_ke' => 0,
                    'status' => 'diajukan',
                    'created_at' => Carbon::now(),
                ]
            );

            $namaHash = hash('sha256', 'Surat_Permohonan_PRM_DIAJUKAN_2026_001').'.pdf';
            $pathDokumen = 'dokumen/permohonan/'.$namaHash;
            $isiPdf = $this->buatPdfPlaceholder($permohonan->judul);
            Storage::disk('local')->put($pathDokumen, $isiPdf);

            Dokumen::updateOrCreate(
                [
                    'ref_type' => 'permohonan',
                    'ref_id' => $permohonan->id,
                    'tipe_dokumen' => 'surat_permohonan',
                    'versi' => 1,
                ],
                [
                    'nama_asli' => 'Surat_Permohonan_PRM_DIAJUKAN_2026_001.pdf',
                    'nama_hash' => $namaHash,
                    'mime_type' => 'application/pdf',
                    'ukuran_bytes' => strlen($isiPdf),
                    'uploaded_by' => $pemohon->id,
                ]
            );

            StatusHistory::firstOrCreate(
                [
                    'ref_type' => 'permohonan',
                    'ref_id' => $permohonan->id,
                    'status_lama' => null,
                    'status_baru' => 'diajukan',
                ],
                ['actor_id' => $pemohon->id]
            );
        });
    }

    /**
     * Menyusun berkas PDF satu halaman sederhana agar unduhan surat permohonan
     * tetap berfungsi tanpa menyimpan berkas biner di dalam repositori.
     */
    private function buatPdfPlaceholder(string $judul): string
    {
        $teks = str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $judul);
        $stream = "BT /F1 12 Tf 72 760 Td ({$teks}) Tj ET";

        $objek = [
            '<< /Type /Catalog /Pages 2 0 R >>',
            '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
            '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
            '<< /Length '.strlen($stream)." >>\nstream\n{$stream}\nendstream",
            '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
        ];

        $pdf = "%PDF-1.4\n";
        $offset = [];

        foreach ($objek as $index => $isi) {
            $nomor = $index + 1;
            $offset[$nomor] = strlen($pdf);
            $pdf .= "{$nomor} 0 obj\n{$isi}\nendobj\n";
        }

        $xref = strlen($pdf);
        $pdf .= 'xref'."\n".'0 '.(count($objek) + 1)."\n".'0000000000 65535 f '."\n";

        foreach ($offset as $posisi) {
            $pdf .= sprintf('%010d 00000 n ', $posisi)."\n";
        }

        $pdf .= 'trailer'."\n".'<< /Size '.(count($objek) + 1).' /Root 1 0 R >>'."\n"
            .'startxref'."\n".$xref."\n".'%%EOF'."\n";

        return $pdf;
    }
}
