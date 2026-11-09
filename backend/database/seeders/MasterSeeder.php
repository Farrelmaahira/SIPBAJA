<?php

namespace Database\Seeders;

use App\Models\JenisPengadaan;
use App\Models\LevelPengadaan;
use App\Models\Mak;
use App\Models\MetodePengadaan;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Seeder;

class MasterSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Units
        $units = [
            'Jurusan Teknik Informatika & Komputer',
            'Jurusan Teknik Elektro',
            'Jurusan Teknik Mesin',
            'Jurusan Teknik Sipil',
            'Bagian Keuangan',
            'Bagian Umum',
        ];

        foreach ($units as $namaUnit) {
            Unit::firstOrCreate(['nama' => $namaUnit]);
        }

        // 2. PPK user for MAKs
        $ppkUser = User::whereHas('role', fn ($q) => $q->where('nama', 'PPK'))->first()
            ?? User::first();

        // 3. MAKs
        $maks = [
            '532111 - Belanja Modal Peralatan dan Mesin',
            '521211 - Belanja Bahan',
            '521811 - Belanja Barang Persediaan Konsumsi',
            '536111 - Belanja Modal Gedung dan Bangunan',
        ];

        foreach ($maks as $namaMak) {
            Mak::firstOrCreate(
                ['nama' => $namaMak],
                ['ppk_user_id' => $ppkUser->id]
            );
        }

        // 4. Jenis Pengadaan
        $jenis = ['Barang', 'Pekerjaan Konstruksi', 'Jasa Konsultansi', 'Jasa Lainnya'];
        foreach ($jenis as $namaJenis) {
            JenisPengadaan::firstOrCreate(['nama' => $namaJenis]);
        }

        // 5. Metode Pengadaan
        $metode = ['Pengadaan Langsung', 'E-Purchasing', 'Tender', 'Seleksi', 'Penunjukan Langsung'];
        foreach ($metode as $namaMetode) {
            MetodePengadaan::firstOrCreate(['nama' => $namaMetode]);
        }

        // 6. Level Pengadaan
        $levels = [
            [
                'nama' => '<50jt',
                'min_nominal' => 0,
                'max_nominal' => 50000000,
                'perlu_review_pp' => false,
            ],
            [
                'nama' => '50-200jt',
                'min_nominal' => 50000000,
                'max_nominal' => 200000000,
                'perlu_review_pp' => true,
            ],
            [
                'nama' => '>200jt',
                'min_nominal' => 200000000,
                'max_nominal' => null,
                'perlu_review_pp' => false,
            ],
        ];

        foreach ($levels as $level) {
            LevelPengadaan::firstOrCreate(
                ['nama' => $level['nama']],
                [
                    'min_nominal' => $level['min_nominal'],
                    'max_nominal' => $level['max_nominal'],
                    'perlu_review_pp' => $level['perlu_review_pp'],
                ]
            );
        }
    }
}
