<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $accounts = [
            ['nama' => 'Jurusan Unit Bidang', 'email' => 'jurusan@pnj.ac.id'],
            ['nama' => 'Perencanaan', 'email' => 'perencanaan@pnj.ac.id'],
            ['nama' => 'Bidang 2', 'email' => 'bidang2@pnj.ac.id'],
            ['nama' => 'PPBJ', 'email' => 'ppbj@pnj.ac.id'],
            ['nama' => 'PP', 'email' => 'pp@pnj.ac.id'],
            ['nama' => 'PPK', 'email' => 'ppk@pnj.ac.id'],
            ['nama' => 'Perlengkapan', 'email' => 'perlengkapan@pnj.ac.id'],
            ['nama' => 'Keuangan', 'email' => 'keuangan@pnj.ac.id'],
            ['nama' => 'Admin', 'email' => 'admin@pnj.ac.id'],
        ];

        $roleNames = [
            'jurusan@pnj.ac.id' => 'Pemohon',
            'perencanaan@pnj.ac.id' => 'Perencanaan',
            'bidang2@pnj.ac.id' => 'Bidang 2',
            'ppbj@pnj.ac.id' => 'PPBJ',
            'pp@pnj.ac.id' => 'PP',
            'ppk@pnj.ac.id' => 'PPK',
            'perlengkapan@pnj.ac.id' => 'Perlengkapan',
            'keuangan@pnj.ac.id' => 'Keuangan',
            'admin@pnj.ac.id' => 'Admin',
        ];

        $unitJurusan = Unit::firstOrCreate(['nama' => 'Jurusan Teknik Informatika']);

        foreach ($accounts as $account) {
            $role = Role::where('nama', $roleNames[$account['email']])->firstOrFail();
            $unitId = $account['email'] === 'jurusan@pnj.ac.id' ? $unitJurusan->id : null;

            User::updateOrCreate(
                ['email' => $account['email']],
                [
                    'nama' => $account['nama'],
                    'password' => 'password123',
                    'role_id' => $role->id,
                    'unit_id' => $unitId,
                ]
            );
        }
    }
}
