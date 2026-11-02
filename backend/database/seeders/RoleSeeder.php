<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $NamaPeran = [
            'Pemohon',
            'Perencanaan',
            'Bidang 2',
            'PPBJ',
            'PP',
            'PPK',
            'Perlengkapan',
            'Keuangan',
            'Admin',
        ];

        foreach ($NamaPeran as $Nama) {
            Role::firstOrCreate(['nama' => $Nama]);
        }
    }
}
