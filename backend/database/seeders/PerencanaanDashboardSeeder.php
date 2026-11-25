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

class PerencanaanDashboardSeeder extends Seeder
{
    /**
     * Menambahkan data variatif permohonan untuk dashboard Perencanaan:
     * - Status diajukan, diteruskan, disetujui, selesai, dan ditolak.
     * - Berbagai unit kerja dan rentang anggaran.
     * - Data bulan berjalan dan tahun-tahun sebelumnya untuk grafik statistik.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            UserSeeder::class,
            MasterSeeder::class,
        ]);

        $pemohon = User::where('email', 'jurusan@pnj.ac.id')->first()
            ?? User::whereHas('Role', fn ($q) => $q->where('nama', 'Pemohon'))->first();

        if (! $pemohon) {
            return;
        }

        $units = Unit::all()->keyBy('nama');
        $defaultUnit = Unit::first();

        $dataPermohonan = [
            [
                'nomor_surat' => 'PRM/2026/11/001',
                'judul' => 'Pengadaan Server GPU & Workstation AI Laboratorium Komputasi',
                'ringkasan_tujuan' => 'Mendukung riset kecerdasan buatan dan kegiatan praktikum deep learning semester ganjil.',
                'estimasi_anggaran' => 145000000,
                'status' => 'diajukan',
                'unit_nama' => 'Jurusan Teknik Informatika & Komputer',
                'created_at' => Carbon::now()->subDays(3),
            ],
            [
                'nomor_surat' => 'PRM/2026/11/002',
                'judul' => 'Pengadaan Bahan Praktikum Kimia dan Alat Gelas Laboratorium',
                'ringkasan_tujuan' => 'Pemenuhan reagen kimia dan tabung reaksi untuk modul praktikum mahasiswa baru.',
                'estimasi_anggaran' => 38500000,
                'status' => 'diajukan',
                'unit_nama' => 'Jurusan Teknik Mesin',
                'created_at' => Carbon::now()->subDays(6),
            ],
            [
                'nomor_surat' => 'PRM/2026/11/003',
                'judul' => 'Pengadaan Lisensi Software CAD/CAM untuk Praktikum Desain',
                'ringkasan_tujuan' => 'Perpanjangan lisensi tahunan software desain teknik industri untuk 60 workstation.',
                'estimasi_anggaran' => 85000000,
                'status' => 'diteruskan',
                'unit_nama' => 'Jurusan Teknik Mesin',
                'created_at' => Carbon::now()->subDays(10),
            ],
            [
                'nomor_surat' => 'PRM/2026/11/004',
                'judul' => 'Pengadaan Modul Praktikum PLC dan Otomasi Industri',
                'ringkasan_tujuan' => 'Peningkatan sarana praktikum kendali otomasi dan sensor industri.',
                'estimasi_anggaran' => 62000000,
                'status' => 'diajukan',
                'unit_nama' => 'Jurusan Teknik Elektro',
                'created_at' => Carbon::now()->subDays(14),
            ],
            [
                'nomor_surat' => 'PRM/2026/10/005',
                'judul' => 'Peremajaan Komputer Laboratorium Multimedia & Jaringan',
                'ringkasan_tujuan' => 'Penggantian PC lama yang sudah tidak kompatibel dengan kurikulum terbaru.',
                'estimasi_anggaran' => 180000000,
                'status' => 'disetujui',
                'unit_nama' => 'Jurusan Teknik Informatika',
                'created_at' => Carbon::now()->subMonths(1)->setDay(22),
            ],
            [
                'nomor_surat' => 'PRM/2026/10/006',
                'judul' => 'Pengadaan Alat Ukur Total Station Laboratorium Ukur Tanah',
                'ringkasan_tujuan' => 'Alat ukur topografi presisi tinggi untuk survei pemetaan konstruksi.',
                'estimasi_anggaran' => 95000000,
                'status' => 'selesai',
                'unit_nama' => 'Jurusan Teknik Sipil',
                'created_at' => Carbon::now()->subMonths(1)->setDay(14),
            ],
            [
                'nomor_surat' => 'PRM/2026/09/007',
                'judul' => 'Pengadaan Printer 3D & Filamen untuk Laboratorium Fabrikasi',
                'ringkasan_tujuan' => 'Pembuatan prototipe komponen mekanik dan tugas akhir mahasiswa.',
                'estimasi_anggaran' => 42000000,
                'status' => 'selesai',
                'unit_nama' => 'Jurusan Teknik Elektro',
                'created_at' => Carbon::now()->subMonths(2)->setDay(8),
            ],
            [
                'nomor_surat' => 'PRM/2026/09/008',
                'judul' => 'Pengadaan Sound System & Proyektor Gedung Serbaguna',
                'ringkasan_tujuan' => 'Fasilitas audio visual auditorium kampus untuk seminar dan wisuda.',
                'estimasi_anggaran' => 55000000,
                'status' => 'ditolak',
                'unit_nama' => 'Bagian Umum',
                'created_at' => Carbon::now()->subMonths(2)->setDay(3),
            ],
            [
                'nomor_surat' => 'PRM/2026/08/009',
                'judul' => 'Pengadaan ATK, Kertas, dan Toner Semester Ganjil',
                'ringkasan_tujuan' => 'Perlengkapan administrasi kantor dan perkuliahan reguler.',
                'estimasi_anggaran' => 28000000,
                'status' => 'selesai',
                'unit_nama' => 'Bagian Keuangan',
                'created_at' => Carbon::now()->subMonths(3)->setDay(19),
            ],
            [
                'nomor_surat' => 'PRM/2026/07/010',
                'judul' => 'Pengadaan Mesin Bubut CNC Mini untuk Bengkel Mesin',
                'ringkasan_tujuan' => 'Alat presisi permesinan praktikum manufaktur.',
                'estimasi_anggaran' => 210000000,
                'status' => 'ditolak',
                'unit_nama' => 'Jurusan Teknik Mesin',
                'created_at' => Carbon::now()->subMonths(4)->setDay(12),
            ],
            // Data historis untuk grafik statistik (2023 - 2025)
            [
                'nomor_surat' => 'PRM/2025/11/011',
                'judul' => 'Pengadaan Switch Core & Router Gateway Kampus',
                'ringkasan_tujuan' => 'Upgrade infrastruktur backbone jaringan kampus tahun 2025.',
                'estimasi_anggaran' => 125000000,
                'status' => 'selesai',
                'unit_nama' => 'Jurusan Teknik Informatika & Komputer',
                'created_at' => Carbon::create(2025, 11, 15, 10, 0, 0),
            ],
            [
                'nomor_surat' => 'PRM/2025/06/012',
                'judul' => 'Pengadaan Alat Uji Tarik Baja Laboratorium Struktur',
                'ringkasan_tujuan' => 'Pengujian material beton dan baja tulangan tahun 2025.',
                'estimasi_anggaran' => 90000000,
                'status' => 'selesai',
                'unit_nama' => 'Jurusan Teknik Sipil',
                'created_at' => Carbon::create(2025, 6, 20, 11, 0, 0),
            ],
            [
                'nomor_surat' => 'PRM/2025/03/013',
                'judul' => 'Pengadaan Drone Pemetaan Fotogrametri',
                'ringkasan_tujuan' => 'Pemetaan kontur tanah kampus baru tahun 2025.',
                'estimasi_anggaran' => 65000000,
                'status' => 'ditolak',
                'unit_nama' => 'Jurusan Teknik Sipil',
                'created_at' => Carbon::create(2025, 3, 10, 9, 0, 0),
            ],
            [
                'nomor_surat' => 'PRM/2024/09/014',
                'judul' => 'Pengadaan Generator Set Cadangan Gedung Laboratorium',
                'ringkasan_tujuan' => 'Catu daya cadangan darurat tahun 2024.',
                'estimasi_anggaran' => 160000000,
                'status' => 'selesai',
                'unit_nama' => 'Jurusan Teknik Elektro',
                'created_at' => Carbon::create(2024, 9, 5, 14, 0, 0),
            ],
            [
                'nomor_surat' => 'PRM/2024/04/015',
                'judul' => 'Pengadaan Meja Kursi Ruang Kuliah Bersama',
                'ringkasan_tujuan' => 'Mebeler ruang kuliah tahun 2024.',
                'estimasi_anggaran' => 48000000,
                'status' => 'selesai',
                'unit_nama' => 'Bagian Umum',
                'created_at' => Carbon::create(2024, 4, 18, 13, 0, 0),
            ],
            [
                'nomor_surat' => 'PRM/2023/10/016',
                'judul' => 'Pengadaan Sistem Keamanan CCTV Kampus Terintegrasi',
                'ringkasan_tujuan' => 'Peningkatan pengawasan keamanan kampus tahun 2023.',
                'estimasi_anggaran' => 110000000,
                'status' => 'selesai',
                'unit_nama' => 'Bagian Umum',
                'created_at' => Carbon::create(2023, 10, 25, 10, 30, 0),
            ],
        ];

        DB::transaction(function () use ($dataPermohonan, $units, $defaultUnit, $pemohon) {
            foreach ($dataPermohonan as $item) {
                $unit = $units->get($item['unit_nama']) ?? $defaultUnit;

                $permohonan = Permohonan::updateOrCreate(
                    ['nomor_surat' => $item['nomor_surat']],
                    [
                        'unit_id' => $unit->id,
                        'created_by' => $pemohon->id,
                        'judul' => $item['judul'],
                        'ringkasan_tujuan' => $item['ringkasan_tujuan'],
                        'estimasi_anggaran' => $item['estimasi_anggaran'],
                        'revisi_ke' => 0,
                        'status' => $item['status'],
                        'created_at' => $item['created_at'],
                    ]
                );

                $namaHash = hash('sha256', 'Surat_Permohonan_'.$item['nomor_surat']).'.pdf';
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
                        'nama_asli' => 'Surat_Permohonan_'.str_replace('/', '_', $item['nomor_surat']).'.pdf',
                        'nama_hash' => $namaHash,
                        'mime_type' => 'application/pdf',
                        'ukuran_bytes' => strlen($isiPdf),
                        'uploaded_by' => $pemohon->id,
                        'created_at' => $item['created_at'],
                    ]
                );

                StatusHistory::firstOrCreate(
                    [
                        'ref_type' => 'permohonan',
                        'ref_id' => $permohonan->id,
                        'status_lama' => null,
                        'status_baru' => $item['status'],
                    ],
                    [
                        'actor_id' => $pemohon->id,
                        'created_at' => $item['created_at'],
                    ]
                );
            }
        });
    }

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
