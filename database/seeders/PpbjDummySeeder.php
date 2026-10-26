<?php

namespace Database\Seeders;

use App\Models\ApprovalPengadaan;
use App\Models\ApprovalPermohonan;
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
use App\Models\Reminder;
use App\Models\RencanaPembayaran;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PpbjDummySeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            $unit = Unit::firstOrCreate(['nama' => 'Teknik Informatika']);

            $pemohon = User::where('email', 'jurusan@pnj.ac.id')->firstOrFail();
            $perencanaan = User::where('email', 'perencanaan@pnj.ac.id')->firstOrFail();
            $bidang2 = User::where('email', 'bidang2@pnj.ac.id')->firstOrFail();
            $ppbj = User::where('email', 'ppbj@pnj.ac.id')->firstOrFail();
            $pp = User::where('email', 'pp@pnj.ac.id')->firstOrFail();

            $makBluFisik = Mak::where('nama', 'BLU Fisik')->firstOrFail();
            $makBluNonFisik = Mak::where('nama', 'BLU Non-Fisik')->firstOrFail();
            $makRmFisik = Mak::where('nama', 'RM Fisik')->firstOrFail();
            $makRmNonFisik = Mak::where('nama', 'RM Non-Fisik')->firstOrFail();

            $jenisBarang = JenisPengadaan::where('nama', 'Barang')->firstOrFail();
            $jenisJasa = JenisPengadaan::where('nama', 'Jasa')->firstOrFail();
            $jenisKonstruksi = JenisPengadaan::where('nama', 'Konstruksi')->firstOrFail();

            $metodeInaproc = MetodePengadaan::where('nama', 'Inaproc')->firstOrFail();
            $metodeSpse = MetodePengadaan::where('nama', 'SPSE')->firstOrFail();
            $metodeTender = MetodePengadaan::where('nama', 'Tender')->firstOrFail();
            $metodeNonTender = MetodePengadaan::where('nama', 'Non-Tender')->firstOrFail();

            $levelLow = LevelPengadaan::where('nama', '<50jt')->firstOrFail();
            $levelMid = LevelPengadaan::where('nama', '50-200jt')->firstOrFail();
            $levelHigh = LevelPengadaan::where('nama', '>200jt')->firstOrFail();

            // Skenario 1: Permohonan PRM-PPBJ-001 siap dipaketkan
            $prm1 = Permohonan::updateOrCreate(
                ['nomor_surat' => 'PRM-PPBJ-001'],
                [
                    'unit_id' => $unit->id,
                    'created_by' => $pemohon->id,
                    'judul' => 'Pengadaan Komputer Laboratorium Multimedia',
                    'ringkasan_tujuan' => 'Pengadaan unit PC untuk kebutuhan praktikum semester ganjil.',
                    'estimasi_anggaran' => 180000000,
                    'revisi_ke' => 0,
                    'status' => 'disetujui',
                ]
            );

            PermohonanMak::updateOrCreate(
                ['permohonan_id' => $prm1->id, 'mak_id' => $makBluFisik->id],
                ['ditentukan_oleh' => $perencanaan->id]
            );

            $memo1 = Dokumen::updateOrCreate(
                [
                    'ref_type' => 'permohonan',
                    'ref_id' => $prm1->id,
                    'tipe_dokumen' => 'memo_persetujuan',
                ],
                [
                    'versi' => 1,
                    'nama_asli' => 'Memo_Persetujuan_PRM_001.pdf',
                    'nama_hash' => hash('sha256', 'Memo_Persetujuan_PRM_001') . '.pdf',
                    'mime_type' => 'application/pdf',
                    'ukuran_bytes' => 102400,
                    'uploaded_by' => $bidang2->id,
                ]
            );

            ApprovalPermohonan::updateOrCreate(
                ['permohonan_id' => $prm1->id, 'tahap' => 'PERENCANAAN', 'revisi_ke' => 0],
                [
                    'keputusan' => 'disetujui',
                    'actor_id' => $perencanaan->id,
                ]
            );

            ApprovalPermohonan::updateOrCreate(
                ['permohonan_id' => $prm1->id, 'tahap' => 'BIDANG2', 'revisi_ke' => 0],
                [
                    'keputusan' => 'disetujui',
                    'memo_dokumen_id' => $memo1->id,
                    'actor_id' => $bidang2->id,
                ]
            );

            // Skenario 2: Permohonan PRM-PPBJ-002 dengan 3 level pengadaan dan 1 paket revisi
            $prm2 = Permohonan::updateOrCreate(
                ['nomor_surat' => 'PRM-PPBJ-002'],
                [
                    'unit_id' => $unit->id,
                    'created_by' => $pemohon->id,
                    'judul' => 'Pengadaan Sarana Prasarana Gedung Kuliah Terpadu',
                    'ringkasan_tujuan' => 'Peningkatan sarana kuliah, fasilitas laboratorium, dan renovasi partisi.',
                    'estimasi_anggaran' => 405000000,
                    'revisi_ke' => 0,
                    'status' => 'diproses_ppbj',
                ]
            );

            $prm2MakBlu = PermohonanMak::updateOrCreate(
                ['permohonan_id' => $prm2->id, 'mak_id' => $makBluFisik->id],
                ['ditentukan_oleh' => $perencanaan->id]
            );

            $prm2MakRm = PermohonanMak::updateOrCreate(
                ['permohonan_id' => $prm2->id, 'mak_id' => $makRmFisik->id],
                ['ditentukan_oleh' => $perencanaan->id]
            );

            $memo2 = Dokumen::updateOrCreate(
                [
                    'ref_type' => 'permohonan',
                    'ref_id' => $prm2->id,
                    'tipe_dokumen' => 'memo_persetujuan',
                ],
                [
                    'versi' => 1,
                    'nama_asli' => 'Memo_Persetujuan_PRM_002.pdf',
                    'nama_hash' => hash('sha256', 'Memo_Persetujuan_PRM_002') . '.pdf',
                    'mime_type' => 'application/pdf',
                    'ukuran_bytes' => 102400,
                    'uploaded_by' => $bidang2->id,
                ]
            );

            ApprovalPermohonan::updateOrCreate(
                ['permohonan_id' => $prm2->id, 'tahap' => 'BIDANG2', 'revisi_ke' => 0],
                [
                    'keputusan' => 'disetujui',
                    'memo_dokumen_id' => $memo2->id,
                    'actor_id' => $bidang2->id,
                ]
            );

            // 2.a Paket Rendah (<50jt)
            Pengadaan::updateOrCreate(
                ['permohonan_id' => $prm2->id, 'nominal' => 35000000],
                [
                    'permohonan_mak_id' => $prm2MakBlu->id,
                    'jenis_id' => $jenisBarang->id,
                    'metode_id' => $metodeNonTender->id,
                    'level_id' => $levelLow->id,
                    'ppk_id' => $makBluFisik->ppk_user_id,
                    'revisi_ke' => 0,
                    'status' => 'siap_spk',
                ]
            );

            // 2.b Paket Menengah (50-200jt) dengan status review_pp
            Pengadaan::updateOrCreate(
                ['permohonan_id' => $prm2->id, 'nominal' => 120000000],
                [
                    'permohonan_mak_id' => $prm2MakBlu->id,
                    'jenis_id' => $jenisBarang->id,
                    'metode_id' => $metodeSpse->id,
                    'level_id' => $levelMid->id,
                    'ppk_id' => $makBluFisik->ppk_user_id,
                    'revisi_ke' => 0,
                    'status' => 'review_pp',
                ]
            );

            // 2.c Paket Tinggi (>200jt) dengan riwayat revisi_ke = 1
            $pgdHigh = Pengadaan::updateOrCreate(
                ['permohonan_id' => $prm2->id, 'nominal' => 250000000],
                [
                    'permohonan_mak_id' => $prm2MakRm->id,
                    'jenis_id' => $jenisKonstruksi->id,
                    'metode_id' => $metodeTender->id,
                    'level_id' => $levelHigh->id,
                    'ppk_id' => $makRmFisik->ppk_user_id,
                    'revisi_ke' => 1,
                    'status' => 'review_ppk',
                ]
            );

            ApprovalPengadaan::updateOrCreate(
                ['pengadaan_id' => $pgdHigh->id, 'tahap' => 'PPK', 'revisi_ke' => 0],
                [
                    'keputusan' => 'ditolak',
                    'alasan' => 'Spesifikasi teknis perlu disesuaikan dengan standar PU.',
                    'actor_id' => $makRmFisik->ppk_user_id,
                ]
            );

            // Skenario 3: Paket pengadaan PGD-PPBJ-003 siap kontrak (disetujui PP & PPK)
            $prm3 = Permohonan::updateOrCreate(
                ['nomor_surat' => 'PRM-PPBJ-003'],
                [
                    'unit_id' => $unit->id,
                    'created_by' => $pemohon->id,
                    'judul' => 'Pengadaan Server Data Center Cloud Kampus',
                    'ringkasan_tujuan' => 'Modernisasi server compute node dan storage cluster.',
                    'estimasi_anggaran' => 150000000,
                    'revisi_ke' => 0,
                    'status' => 'disetujui',
                ]
            );

            $prm3Mak = PermohonanMak::updateOrCreate(
                ['permohonan_id' => $prm3->id, 'mak_id' => $makBluNonFisik->id],
                ['ditentukan_oleh' => $perencanaan->id]
            );

            $memo3 = Dokumen::updateOrCreate(
                [
                    'ref_type' => 'permohonan',
                    'ref_id' => $prm3->id,
                    'tipe_dokumen' => 'memo_persetujuan',
                ],
                [
                    'versi' => 1,
                    'nama_asli' => 'Memo_Persetujuan_PRM_003.pdf',
                    'nama_hash' => hash('sha256', 'Memo_Persetujuan_PRM_003') . '.pdf',
                    'mime_type' => 'application/pdf',
                    'ukuran_bytes' => 102400,
                    'uploaded_by' => $bidang2->id,
                ]
            );

            ApprovalPermohonan::updateOrCreate(
                ['permohonan_id' => $prm3->id, 'tahap' => 'BIDANG2', 'revisi_ke' => 0],
                [
                    'keputusan' => 'disetujui',
                    'memo_dokumen_id' => $memo3->id,
                    'actor_id' => $bidang2->id,
                ]
            );

            $pgd3 = Pengadaan::updateOrCreate(
                ['permohonan_id' => $prm3->id, 'nominal' => 150000000],
                [
                    'permohonan_mak_id' => $prm3Mak->id,
                    'jenis_id' => $jenisBarang->id,
                    'metode_id' => $metodeInaproc->id,
                    'level_id' => $levelMid->id,
                    'ppk_id' => $makBluNonFisik->ppk_user_id,
                    'revisi_ke' => 0,
                    'status' => 'disetujui',
                ]
            );

            $ttdPpk3 = Dokumen::updateOrCreate(
                [
                    'ref_type' => 'pengadaan',
                    'ref_id' => $pgd3->id,
                    'tipe_dokumen' => 'bukti_tanda_tangan',
                ],
                [
                    'versi' => 1,
                    'nama_asli' => 'Tanda_Tangan_PPK_PGD_003.pdf',
                    'nama_hash' => hash('sha256', 'Tanda_Tangan_PPK_PGD_003') . '.pdf',
                    'mime_type' => 'application/pdf',
                    'ukuran_bytes' => 102400,
                    'uploaded_by' => $makBluNonFisik->ppk_user_id,
                ]
            );

            ApprovalPengadaan::updateOrCreate(
                ['pengadaan_id' => $pgd3->id, 'tahap' => 'PP', 'revisi_ke' => 0],
                [
                    'keputusan' => 'disetujui',
                    'actor_id' => $pp->id,
                ]
            );

            ApprovalPengadaan::updateOrCreate(
                ['pengadaan_id' => $pgd3->id, 'tahap' => 'PPK', 'revisi_ke' => 0],
                [
                    'keputusan' => 'disetujui',
                    'bukti_tanda_tangan_id' => $ttdPpk3->id,
                    'actor_id' => $makBluNonFisik->ppk_user_id,
                ]
            );

            // Skenario 4: Paket pengadaan PGD-PPBJ-004 berkontrak dengan 3 termin & reminder
            $prm4 = Permohonan::updateOrCreate(
                ['nomor_surat' => 'PRM-PPBJ-004'],
                [
                    'unit_id' => $unit->id,
                    'created_by' => $pemohon->id,
                    'judul' => 'Pengadaan Pemeliharaan Jaringan Fiber Optic Kampus',
                    'ringkasan_tujuan' => 'Maintenance rutin kabel FO antar gedung kampus.',
                    'estimasi_anggaran' => 90000000,
                    'revisi_ke' => 0,
                    'status' => 'disetujui',
                ]
            );

            $prm4Mak = PermohonanMak::updateOrCreate(
                ['permohonan_id' => $prm4->id, 'mak_id' => $makRmNonFisik->id],
                ['ditentukan_oleh' => $perencanaan->id]
            );

            $memo4 = Dokumen::updateOrCreate(
                [
                    'ref_type' => 'permohonan',
                    'ref_id' => $prm4->id,
                    'tipe_dokumen' => 'memo_persetujuan',
                ],
                [
                    'versi' => 1,
                    'nama_asli' => 'Memo_Persetujuan_PRM_004.pdf',
                    'nama_hash' => hash('sha256', 'Memo_Persetujuan_PRM_004') . '.pdf',
                    'mime_type' => 'application/pdf',
                    'ukuran_bytes' => 102400,
                    'uploaded_by' => $bidang2->id,
                ]
            );

            ApprovalPermohonan::updateOrCreate(
                ['permohonan_id' => $prm4->id, 'tahap' => 'BIDANG2', 'revisi_ke' => 0],
                [
                    'keputusan' => 'disetujui',
                    'memo_dokumen_id' => $memo4->id,
                    'actor_id' => $bidang2->id,
                ]
            );

            $pgd4 = Pengadaan::updateOrCreate(
                ['permohonan_id' => $prm4->id, 'nominal' => 90000000],
                [
                    'permohonan_mak_id' => $prm4Mak->id,
                    'jenis_id' => $jenisJasa->id,
                    'metode_id' => $metodeNonTender->id,
                    'level_id' => $levelMid->id,
                    'ppk_id' => $makRmNonFisik->ppk_user_id,
                    'revisi_ke' => 0,
                    'status' => 'kontrak_terbit',
                ]
            );

            $kontrak4 = Kontrak::updateOrCreate(
                ['pengadaan_id' => $pgd4->id],
                [
                    'tipe' => 'SPK',
                    'nomor' => 'SPK/2026/PPBJ-004',
                    'tanggal' => now()->subDays(10)->toDateString(),
                ]
            );

            $terminNominals = [30000000, 30000000, 30000000];
            foreach ($terminNominals as $index => $nominal) {
                $terminKe = $index + 1;
                $rencana = RencanaPembayaran::updateOrCreate(
                    ['kontrak_id' => $kontrak4->id, 'termin_ke' => $terminKe],
                    [
                        'nominal_rencana' => $nominal,
                        'tanggal_jatuh_tempo' => now()->addDays($terminKe * 30)->toDateString(),
                        'status' => 'menunggu',
                    ]
                );

                Reminder::updateOrCreate(
                    [
                        'rencana_pembayaran_id' => $rencana->id,
                        'jenis' => 'pembayaran',
                    ],
                    [
                        'tanggal_reminder' => now()->addDays(($terminKe * 30) - 7)->toDateString(),
                        'dibuat_oleh' => $ppbj->id,
                    ]
                );
            }

            // Skenario 5: Termin pembayaran pada PGD-PPBJ-005 menunggu verifikasi
            $prm5 = Permohonan::updateOrCreate(
                ['nomor_surat' => 'PRM-PPBJ-005'],
                [
                    'unit_id' => $unit->id,
                    'created_by' => $pemohon->id,
                    'judul' => 'Pengadaan Meja Kursi Ruang Kuliah Bersama',
                    'ringkasan_tujuan' => 'Pengadaan mebeler untuk 5 ruang kuliah baru.',
                    'estimasi_anggaran' => 60000000,
                    'revisi_ke' => 0,
                    'status' => 'disetujui',
                ]
            );

            $prm5Mak = PermohonanMak::updateOrCreate(
                ['permohonan_id' => $prm5->id, 'mak_id' => $makBluFisik->id],
                ['ditentukan_oleh' => $perencanaan->id]
            );

            $memo5 = Dokumen::updateOrCreate(
                [
                    'ref_type' => 'permohonan',
                    'ref_id' => $prm5->id,
                    'tipe_dokumen' => 'memo_persetujuan',
                ],
                [
                    'versi' => 1,
                    'nama_asli' => 'Memo_Persetujuan_PRM_005.pdf',
                    'nama_hash' => hash('sha256', 'Memo_Persetujuan_PRM_005') . '.pdf',
                    'mime_type' => 'application/pdf',
                    'ukuran_bytes' => 102400,
                    'uploaded_by' => $bidang2->id,
                ]
            );

            ApprovalPermohonan::updateOrCreate(
                ['permohonan_id' => $prm5->id, 'tahap' => 'BIDANG2', 'revisi_ke' => 0],
                [
                    'keputusan' => 'disetujui',
                    'memo_dokumen_id' => $memo5->id,
                    'actor_id' => $bidang2->id,
                ]
            );

            $pgd5 = Pengadaan::updateOrCreate(
                ['permohonan_id' => $prm5->id, 'nominal' => 60000000],
                [
                    'permohonan_mak_id' => $prm5Mak->id,
                    'jenis_id' => $jenisBarang->id,
                    'metode_id' => $metodeSpse->id,
                    'level_id' => $levelMid->id,
                    'ppk_id' => $makBluFisik->ppk_user_id,
                    'revisi_ke' => 0,
                    'status' => 'berjalan',
                ]
            );

            $kontrak5 = Kontrak::updateOrCreate(
                ['pengadaan_id' => $pgd5->id],
                [
                    'tipe' => 'Kontrak',
                    'nomor' => 'KTR/2026/PPBJ-005',
                    'tanggal' => now()->subDays(20)->toDateString(),
                ]
            );

            $rencana5 = RencanaPembayaran::updateOrCreate(
                ['kontrak_id' => $kontrak5->id, 'termin_ke' => 1],
                [
                    'nominal_rencana' => 60000000,
                    'tanggal_jatuh_tempo' => now()->addDays(10)->toDateString(),
                    'status' => 'menunggu',
                ]
            );

            $pembayaran5 = Pembayaran::updateOrCreate(
                ['rencana_pembayaran_id' => $rencana5->id],
                [
                    'nominal' => 60000000,
                    'revisi_ke' => 0,
                    'status' => 'menunggu_ppk',
                ]
            );

            Dokumen::updateOrCreate(
                [
                    'ref_type' => 'pembayaran',
                    'ref_id' => $pembayaran5->id,
                    'tipe_dokumen' => 'berkas_bayar',
                ],
                [
                    'versi' => 1,
                    'nama_asli' => 'Berkas_Bayar_Termin_1.pdf',
                    'nama_hash' => hash('sha256', 'Berkas_Bayar_Termin_1') . '.pdf',
                    'mime_type' => 'application/pdf',
                    'ukuran_bytes' => 204800,
                    'uploaded_by' => $ppbj->id,
                ]
            );

            Dokumen::updateOrCreate(
                [
                    'ref_type' => 'pembayaran',
                    'ref_id' => $pembayaran5->id,
                    'tipe_dokumen' => 'legalitas_vendor',
                ],
                [
                    'versi' => 1,
                    'nama_asli' => 'Legalitas_Vendor_PT_Maju.pdf',
                    'nama_hash' => hash('sha256', 'Legalitas_Vendor_PT_Maju') . '.pdf',
                    'mime_type' => 'application/pdf',
                    'ukuran_bytes' => 153600,
                    'uploaded_by' => $ppbj->id,
                ]
            );
        });
    }
}
