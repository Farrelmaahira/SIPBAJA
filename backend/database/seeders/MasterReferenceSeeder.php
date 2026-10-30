<?php

namespace Database\Seeders;

use App\Models\JenisPengadaan;
use App\Models\LevelPengadaan;
use App\Models\Mak;
use App\Models\MetodePengadaan;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class MasterReferenceSeeder extends Seeder
{
    public function run(): void
    {
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

        $maks = [
            'BLU Fisik' => 'ppk.blufisik@pnj.ac.id',
            'BLU Non-Fisik' => 'ppk.blunonfisik@pnj.ac.id',
            'RM Fisik' => 'ppk.rmfisik@pnj.ac.id',
            'RM Non-Fisik' => 'ppk.rmnonfisik@pnj.ac.id',
        ];

        foreach ($maks as $nama => $email) {
            Mak::updateOrCreate(
                ['nama' => $nama],
                [
                    'ppk_user_id' => $createdPpkUsers[$email]->id,
                ]
            );
        }

        $jenisPengadaanList = ['Barang', 'Jasa', 'Konstruksi'];
        foreach ($jenisPengadaanList as $jenis) {
            JenisPengadaan::updateOrCreate(['nama' => $jenis]);
        }

        $metodePengadaanList = ['Inaproc', 'SPSE', 'Tender', 'Non-Tender'];
        foreach ($metodePengadaanList as $metode) {
            MetodePengadaan::updateOrCreate(['nama' => $metode]);
        }

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
            LevelPengadaan::updateOrCreate(
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
