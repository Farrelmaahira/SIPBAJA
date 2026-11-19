<?php

namespace Database\Seeders;

use App\Models\Dokumen;
use App\Models\JenisPengadaan;
use App\Models\Kontrak;
use App\Models\LevelPengadaan;
use App\Models\Mak;
use App\Models\MetodePengadaan;
use App\Models\Pembayaran;
use App\Models\Pengadaan;
use App\Models\Permohonan;
use App\Models\PermohonanMak;
use App\Models\RencanaPembayaran;
use App\Models\Unit;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class KeuanganSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $keuanganUser = User::whereHas('role', fn ($q) => $q->where('nama', 'Keuangan'))->first();
        $ppkUser = User::whereHas('role', fn ($q) => $q->where('nama', 'PPK'))->first()
            ?? User::where('email', 'admin@pnj.ac.id')->first();
        $pemohonUser = User::whereHas('role', fn ($q) => $q->where('nama', 'Pemohon'))->first()
            ?? User::where('email', 'jurusan@pnj.ac.id')->first()
            ?? User::first();

        $perencanaanUser = User::whereHas('role', fn ($q) => $q->where('nama', 'Perencanaan'))->first()
            ?? User::where('email', 'perencanaan@pnj.ac.id')->first();

        $jenisBarang = JenisPengadaan::firstOrCreate(['nama' => 'Barang']);
        $metodeLangsung = MetodePengadaan::firstOrCreate(['nama' => 'Pengadaan Langsung']);
        $level = LevelPengadaan::first() ?? LevelPengadaan::create([
            'nama' => '<50jt',
            'min_nominal' => 0,
            'max_nominal' => 50000000,
            'perlu_review_pp' => false,
        ]);

        $mak = Mak::first() ?? Mak::create([
            'nama' => '532111 - Belanja Modal Peralatan dan Mesin',
            'ppk_user_id' => $ppkUser?->id,
        ]);

        $items = [
            [
                'nomor_pengadaan' => '01010-FF-11',
                'nomor_permohonan' => '111-FFF-111',
                'judul' => 'Pengadaan Komputer Lab',
                'unit_nama' => 'Jurusan Teknik Informatika',
                'nilai' => 185000000,
                'status' => 'menunggu_input',
                'vendor' => 'PT Mitra Komputindo Nusantara',
            ],
            [
                'nomor_pengadaan' => '01011-FF-11',
                'nomor_permohonan' => '112-FFF-111',
                'judul' => 'Pengadaan Proyektor Ruang Kelas',
                'unit_nama' => 'Jurusan Teknik Elektro',
                'nilai' => 48500000,
                'status' => 'menunggu_input',
                'vendor' => 'CV Sejuk Selalu Abadi',
            ],
            [
                'nomor_pengadaan' => '01012-FF-11',
                'nomor_permohonan' => '113-FFF-111',
                'judul' => 'Pengadaan Switch Jaringan Gedung A',
                'unit_nama' => 'Jurusan Teknik Sipil',
                'nilai' => 92750000,
                'status' => 'selesai',
                'vendor' => 'PT Jaringan Solusi Cemerlang',
            ],
            [
                'nomor_pengadaan' => '01013-FF-11',
                'nomor_permohonan' => '114-FFF-111',
                'judul' => 'Pengadaan Perangkat Server',
                'unit_nama' => 'Bagian Akademik',
                'nilai' => 320000000,
                'status' => 'menunggu_input',
                'vendor' => 'PT Server Nusantara Utama',
            ],
            [
                'nomor_pengadaan' => '01014-FF-11',
                'nomor_permohonan' => '115-FFF-111',
                'judul' => 'Pengadaan Printer Laboratorium',
                'unit_nama' => 'Jurusan Teknik Mesin',
                'nilai' => 27800000,
                'status' => 'selesai',
                'vendor' => 'Toko Alat Tulis Sarana Jaya',
            ],
            [
                'nomor_pengadaan' => '01015-FF-11',
                'nomor_permohonan' => '116-FFF-111',
                'judul' => 'Pengadaan Meja dan Kursi Dosen',
                'unit_nama' => 'Bagian Umum',
                'nilai' => 64200000,
                'status' => 'menunggu_input',
                'vendor' => 'CV Mebel Karya Mandiri',
            ],
            [
                'nomor_pengadaan' => '01016-FF-11',
                'nomor_permohonan' => '117-FFF-111',
                'judul' => 'Pengadaan Access Point',
                'unit_nama' => 'Jurusan Teknik Informatika',
                'nilai' => 38900000,
                'status' => 'selesai',
                'vendor' => 'PT Mitra Komputindo Nusantara',
            ],
            [
                'nomor_pengadaan' => '01017-FF-11',
                'nomor_permohonan' => '118-FFF-111',
                'judul' => 'Pengadaan Lisensi Perangkat Lunak',
                'unit_nama' => 'Bagian Akademik',
                'nilai' => 112000000,
                'status' => 'menunggu_input',
                'vendor' => 'PT Perangkat Lunak Global',
            ],
            [
                'nomor_pengadaan' => '01018-FF-11',
                'nomor_permohonan' => '119-FFF-111',
                'judul' => 'Pengadaan UPS Ruang Server',
                'unit_nama' => 'Bagian Akademik',
                'nilai' => 56400000,
                'status' => 'selesai',
                'vendor' => 'CV Daya Listrik Mandiri',
            ],
            [
                'nomor_pengadaan' => '01019-FF-11',
                'nomor_permohonan' => '120-FFF-111',
                'judul' => 'Pengadaan Kamera CCTV Gedung B',
                'unit_nama' => 'Bagian Akademik',
                'nilai' => 73000000,
                'status' => 'menunggu_input',
                'vendor' => 'PT Sistem Keamanan Pintar',
            ],
        ];

        foreach ($items as $index => $item) {
            $unit = Unit::firstOrCreate(['nama' => $item['unit_nama']]);
            $isSelesai = $item['status'] === 'selesai';

            $permohonan = Permohonan::updateOrCreate(
                ['nomor_surat' => $item['nomor_permohonan']],
                [
                    'unit_id' => $unit->id,
                    'created_by' => $pemohonUser?->id ?? 1,
                    'judul' => $item['judul'],
                    'ringkasan_tujuan' => 'Keperluan operasional pengadaan '.$item['judul'],
                    'estimasi_anggaran' => $item['nilai'],
                    'revisi_ke' => 0,
                    'status' => 'disetujui',
                    'created_at' => Carbon::now()->subDays(20 - $index),
                ]
            );

            $permohonanMak = PermohonanMak::firstOrCreate(
                ['permohonan_id' => $permohonan->id, 'mak_id' => $mak->id],
                ['ditentukan_oleh' => $perencanaanUser?->id ?? 1]
            );

            $pengadaan = Pengadaan::updateOrCreate(
                ['permohonan_id' => $permohonan->id],
                [
                    'permohonan_mak_id' => $permohonanMak->id,
                    'jenis_id' => $jenisBarang->id,
                    'metode_id' => $metodeLangsung->id,
                    'level_id' => $level->id,
                    'ppk_id' => $ppkUser?->id,
                    'nominal' => $item['nilai'],
                    'revisi_ke' => 0,
                    'status' => $isSelesai ? 'selesai' : 'berjalan',
                    'created_at' => Carbon::now()->subDays(18 - $index),
                ]
            );

            $kontrak = Kontrak::updateOrCreate(
                ['pengadaan_id' => $pengadaan->id],
                [
                    'tipe' => 'SPK',
                    'nomor' => $item['nomor_pengadaan'],
                    'tanggal' => Carbon::now()->subDays(15 - $index)->toDateString(),
                    'vendor_nama' => $item['vendor'],
                    'nominal_kontrak' => $item['nilai'],
                ]
            );

            $rencana = RencanaPembayaran::updateOrCreate(
                ['kontrak_id' => $kontrak->id, 'termin_ke' => 1],
                [
                    'nominal_rencana' => $item['nilai'],
                    'tanggal_jatuh_tempo' => Carbon::now()->addDays(14)->toDateString(),
                    'status' => $isSelesai ? 'selesai' : 'menunggu',
                    'created_at' => Carbon::now()->subDays(14 - $index),
                ]
            );

            $pembayaran = Pembayaran::updateOrCreate(
                ['rencana_pembayaran_id' => $rencana->id],
                [
                    'nominal' => $item['nilai'],
                    'revisi_ke' => 0,
                    'status' => $isSelesai ? 'selesai' : 'menunggu_keuangan',
                ]
            );

            if ($isSelesai && $keuanganUser) {
                Dokumen::firstOrCreate(
                    [
                        'ref_type' => 'pembayaran',
                        'ref_id' => $pembayaran->id,
                        'tipe_dokumen' => 'bukti_bayar',
                    ],
                    [
                        'versi' => 1,
                        'nama_asli' => "SP2D_BuktiBayar_{$item['nomor_pengadaan']}.pdf",
                        'nama_hash' => "docs/dummy_sp2d_{$item['nomor_pengadaan']}.pdf",
                        'mime_type' => 'application/pdf',
                        'ukuran_bytes' => 1024000,
                        'uploaded_by' => $keuanganUser->id,
                        'created_at' => Carbon::now()->subDays(5),
                    ]
                );
            }
        }
    }
}
