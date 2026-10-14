<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RbacSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $map = [
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

        foreach (array_unique(array_merge(...array_values($map))) as $code) {
            Permission::firstOrCreate(['kode' => $code]);
        }

        $admin = Role::where('nama', 'Admin')->firstOrFail();

        $admin->Permissions()->sync(
            Permission::whereIn('kode', $map['Admin'])->pluck('id')
        );
    }
}
