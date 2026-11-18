<?php

namespace Database\Seeders;

use App\Models\JenisPengadaan;
use App\Models\LevelPengadaan;
use App\Models\Mak;
use App\Models\MetodePengadaan;
use App\Models\Role;
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

        // 2. PPK users for MAKs
        $ppkRole = Role::firstOrCreate(['nama' => 'PPK']);

        $ppkUsers = [
            'ppk.blufisik@pnj.ac.id' => 'PPK BLU Fisik',
            'ppk.blunonfisik@pnj.ac.id' => 'PPK BLU Non-Fisik',
            'ppk.rmfisik@pnj.ac.id' => 'PPK RM Fisik',
            'ppk.rmnonfisik@pnj.ac.id' => 'PPK RM Non-Fisik',
        ];

        $createdPpkUsers = [];
        foreach ($ppkUsers as $email => $nama) {
            $createdPpkUsers[$email] = User::updateOrCreate(
                ['email' => $email],
                [
                    'nama' => $nama,
                    'password' => 'password123',
                    'role_id' => $ppkRole->id,
                    'unit_id' => null,
                ]
            );
        }

        // 3. MAKs, each assigned to its own PPK
        $maks = [
            ['kode' => '532111', 'nama' => 'BLU Fisik', 'ppk_email' => 'ppk.blufisik@pnj.ac.id'],
            ['kode' => '521211', 'nama' => 'BLU Non-Fisik', 'ppk_email' => 'ppk.blunonfisik@pnj.ac.id'],
            ['kode' => '521811', 'nama' => 'RM Fisik', 'ppk_email' => 'ppk.rmfisik@pnj.ac.id'],
            ['kode' => '536111', 'nama' => 'RM Non-Fisik', 'ppk_email' => 'ppk.rmnonfisik@pnj.ac.id'],
        ];

        foreach ($maks as $mak) {
            Mak::updateOrCreate(
                ['kode' => $mak['kode']],
                [
                    'nama' => $mak['nama'],
                    'ppk_user_id' => $createdPpkUsers[$mak['ppk_email']]->id,
                ]
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
