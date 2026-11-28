<?php

namespace Database\Seeders;

use App\Models\JenisPengadaan;
use App\Models\LevelPengadaan;
use App\Models\Mak;
use App\Models\MetodePengadaan;
use App\Models\Permission;
use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Seeder;

class MasterDataSeeder extends Seeder
{
    /**
     * Mengisi seluruh data master aplikasi (Role, RBAC Permission, User, Unit, MAK, Referensi Pengadaan).
     */
    public function run(): void
    {
        // 1. Roles
        $roleNames = [
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

        foreach ($roleNames as $roleName) {
            Role::firstOrCreate(['nama' => $roleName]);
        }

        // 2. RBAC Permissions & Role Sync
        $permissionMap = [
            'Pemohon' => ['permohonan.create', 'permohonan.view', 'permohonan.update', 'permohonan.delete', 'permohonan.view-unit', 'permohonan.dokumen-upload', 'notifikasi.view'],
            'Perencanaan' => ['permohonan.view-all', 'permohonan.review', 'permohonan.mak-assign', 'permohonan-mak.update', 'dokumen.rkakl-upload', 'rekap.view'],
            'Bidang 2' => ['permohonan.review', 'permohonan.view-all', 'permohonan.approve', 'pembayaran.approve', 'rekap.view'],
            'PPBJ' => ['pengadaan.create', 'pengadaan.update', 'pengadaan.view-all', 'pengadaan.dokumen-upload', 'kontrak.create', 'rencana-pembayaran.create', 'reminder.create', 'pembayaran.dokumen-upload', 'pembayaran.vendor-upload'],
            'PP' => ['pengadaan.view-level', 'pengadaan.review'],
            'PPK' => ['pengadaan.view-assigned', 'pengadaan.review', 'pembayaran.approve'],
            'Perlengkapan' => ['pengadaan.view-dokumen', 'penerimaan.create', 'penerimaan.dokumen-upload'],
            'Keuangan' => ['pembayaran.view-approved', 'pembayaran.bukti-upload', 'rekap.view'],
            'Admin' => ['akun.create', 'akun.view', 'akun.update', 'akun.delete', 'role.create', 'role.view', 'role.update', 'role.delete', 'unit.create', 'unit.view', 'unit.update', 'unit.delete', 'MAK.create', 'MAK.view', 'MAK.update', 'MAK.delete'],
        ];

        foreach (array_unique(array_merge(...array_values($permissionMap))) as $code) {
            Permission::firstOrCreate(['kode' => $code]);
        }

        foreach ($permissionMap as $roleName => $permissionCodes) {
            $role = Role::where('nama', $roleName)->first();
            if ($role) {
                $permissionIds = Permission::whereIn('kode', $permissionCodes)->pluck('id');
                $role->Permissions()->sync($permissionIds);
            }
        }

        // 3. Units
        $unitDefault = Unit::firstOrCreate(['nama' => 'Jurusan Teknik Informatika']);
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

        // 4. Standard Role Users
        $accounts = [
            ['nama' => 'Jurusan Unit Bidang', 'email' => 'jurusan@pnj.ac.id', 'role' => 'Pemohon', 'unit_id' => $unitDefault->id],
            ['nama' => 'Perencanaan', 'email' => 'perencanaan@pnj.ac.id', 'role' => 'Perencanaan', 'unit_id' => null],
            ['nama' => 'Bidang 2', 'email' => 'bidang2@pnj.ac.id', 'role' => 'Bidang 2', 'unit_id' => null],
            ['nama' => 'PPBJ', 'email' => 'ppbj@pnj.ac.id', 'role' => 'PPBJ', 'unit_id' => null],
            ['nama' => 'PP', 'email' => 'pp@pnj.ac.id', 'role' => 'PP', 'unit_id' => null],
            ['nama' => 'Perlengkapan', 'email' => 'perlengkapan@pnj.ac.id', 'role' => 'Perlengkapan', 'unit_id' => null],
            ['nama' => 'Keuangan', 'email' => 'keuangan@pnj.ac.id', 'role' => 'Keuangan', 'unit_id' => null],
            ['nama' => 'Admin', 'email' => 'admin@pnj.ac.id', 'role' => 'Admin', 'unit_id' => null],
        ];

        foreach ($accounts as $account) {
            $role = Role::where('nama', $account['role'])->firstOrFail();
            User::updateOrCreate(
                ['email' => $account['email']],
                [
                    'nama' => $account['nama'],
                    'password' => 'password123',
                    'role_id' => $role->id,
                    'unit_id' => $account['unit_id'],
                ]
            );
        }

        // 5. PPK Users & MAKs
        $ppkRole = Role::where('nama', 'PPK')->firstOrFail();
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

        // 6. Jenis Pengadaan
        foreach (['Barang', 'Jasa', 'Konstruksi'] as $namaJenis) {
            JenisPengadaan::firstOrCreate(['nama' => $namaJenis]);
        }

        // 7. Metode Pengadaan
        foreach (['Inaproc', 'SPSE', 'Tender', 'Non-Tender'] as $namaMetode) {
            MetodePengadaan::firstOrCreate(['nama' => $namaMetode]);
        }

        // 8. Level Pengadaan
        $levels = [
            ['nama' => '<50jt', 'min_nominal' => 0, 'max_nominal' => 50000000, 'perlu_review_pp' => false],
            ['nama' => '50-200jt', 'min_nominal' => 50000000, 'max_nominal' => 200000000, 'perlu_review_pp' => true],
            ['nama' => '>200jt', 'min_nominal' => 200000000, 'max_nominal' => null, 'perlu_review_pp' => false],
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
