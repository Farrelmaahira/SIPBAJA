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
use App\Models\Notification;
use App\Models\Pembayaran;
use App\Models\PenerimaanBarang;
use App\Models\Pengadaan;
use App\Models\Permohonan;
use App\Models\PermohonanMak;
use App\Models\Reminder;
use App\Models\RencanaPembayaran;
use App\Models\StatusHistory;
use App\Models\Unit;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PermohonanPengadaanSeeder extends Seeder
{
    /**
     * Mengisi skenario lengkap Permohonan & Pengadaan pada setiap step BPMN V1.3:
     * 1.  diajukan                - Pemohon mengirim surat permohonan
     * 2.  ditolak (Perencanaan)   - Tidak ada anggaran / perlu revisi
     * 3.  menunggu_persetujuan    - Perencanaan input Jenis MAK & RKAKL
     * 4a. menunggu_ppk            - WD2 setuju, menunggu PPK
     * 4b. menunggu_bidang2        - PPK setuju, menunggu WD2
     * 4c. ditolak (WD2/PPK)       - Permohonan ditolak pada tahap persetujuan
     * 5.  disetujui (PRM-PPBJ-001)- WD2 & PPK setuju + Memo, siap dipaketkan PPBJ
     * 6-7. review_pp/ppk/ditolak  - PRM-PPBJ-002 (3 level: <50jt, 50-200jt, >200jt + revisi)
     * 8a. siap kontrak            - PRM-PPBJ-003 (disetujui PP & PPK, belum berkontrak)
     * 8b. berkontrak + termin     - PRM-PPBJ-004 (Kontrak, 3 RencanaPembayaran, Reminder)
     * 9.  barang_diterima         - Perlengkapan input penerimaan barang & BAST
     * 10a. review_pembayaran      - PRM-PPBJ-005 (PPBJ ajukan pembayaran, menunggu PPK/WD2)
     * 10b. proses_pembayaran      - Pembayaran disetujui WD2 & PPK, menunggu Keuangan
     * 11. selesai (END)           - Keuangan upload bukti bayar, seluruh proses selesai
     */
    public function run(): void
    {
        DB::transaction(function () {
            $unit = Unit::where('nama', 'Jurusan Teknik Informatika')->firstOrFail();
            $pemohon = User::where('email', 'jurusan@pnj.ac.id')->firstOrFail();
            $perencanaan = User::where('email', 'perencanaan@pnj.ac.id')->firstOrFail();
            $bidang2 = User::where('email', 'bidang2@pnj.ac.id')->firstOrFail();
            $ppbj = User::where('email', 'ppbj@pnj.ac.id')->firstOrFail();
            $pp = User::where('email', 'pp@pnj.ac.id')->firstOrFail();
            $perlengkapan = User::where('email', 'perlengkapan@pnj.ac.id')->firstOrFail();
            $keuangan = User::where('email', 'keuangan@pnj.ac.id')->firstOrFail();

            $makBluFisik = Mak::where('nama', 'BLU Fisik')->firstOrFail();
            $makBluNonFisik = Mak::where('nama', 'BLU Non-Fisik')->firstOrFail();
            $makRmFisik = Mak::where('nama', 'RM Fisik')->firstOrFail();
            $makRmNonFisik = Mak::where('nama', 'RM Non-Fisik')->firstOrFail();

            $ppkBluFisik = User::findOrFail($makBluFisik->ppk_user_id);
            $ppkBluNonFisik = User::findOrFail($makBluNonFisik->ppk_user_id);
            $ppkRmFisik = User::findOrFail($makRmFisik->ppk_user_id);
            $ppkRmNonFisik = User::findOrFail($makRmNonFisik->ppk_user_id);

            $jenisBarang = JenisPengadaan::where('nama', 'Barang')->firstOrFail();
            $jenisJasa = JenisPengadaan::where('nama', 'Jasa')->firstOrFail();
            $metodeLangsung = MetodePengadaan::where('nama', 'Non-Tender')->firstOrFail();
            $metodeEpurchasing = MetodePengadaan::where('nama', 'Inaproc')->firstOrFail();
            $metodeTender = MetodePengadaan::where('nama', 'Tender')->firstOrFail();

            $levelLow = LevelPengadaan::where('nama', '<50jt')->firstOrFail();
            $levelMid = LevelPengadaan::where('nama', '50-200jt')->firstOrFail();
            $levelHigh = LevelPengadaan::where('nama', '>200jt')->firstOrFail();

            // Step 1: Pemohon mengirim surat permohonan (status: diajukan)
            $p1 = $this->seedPermohonan(
                'PRM/BPMN/01-DIAJUKAN',
                'Pengadaan Alat Tulis Kantor dan Bahan Praktikum',
                'Pemenuhan kebutuhan alat tulis kantor dan bahan habis pakai praktikum.',
                45000000,
                'diajukan',
                $unit->id,
                $pemohon->id,
                Carbon::now()->subDays(1)
            );
            $this->seedStatusHistory('permohonan', $p1->id, null, 'diajukan', $pemohon->id);

            // Step 2: Perencanaan menolak karena belum ada anggaran (status: ditolak)
            $p2 = $this->seedPermohonan(
                'PRM/BPMN/02-DITOLAK-PERENCANAAN',
                'Renovasi Ruang Seminar Gedung Utama',
                'Perbaikan interior dan tata suara ruang seminar.',
                180000000,
                'ditolak',
                $unit->id,
                $pemohon->id,
                Carbon::now()->subDays(10)
            );
            ApprovalPermohonan::updateOrCreate(
                ['permohonan_id' => $p2->id, 'tahap' => 'PERENCANAAN', 'revisi_ke' => 0],
                [
                    'actor_id' => $perencanaan->id,
                    'keputusan' => 'ditolak',
                    'alasan' => 'Anggaran tahun berjalan belum tersedia, silakan ajukan ulang pada periode berikutnya.',
                ]
            );

            // Step 3: Perencanaan menginput Jenis MAK & RKAKL (status: menunggu_persetujuan)
            $p3 = $this->seedPermohonan(
                'PRM/BPMN/03-MENUNGGU-PERSETUJUAN',
                'Pengadaan Switch Core Jaringan Kampus',
                'Peremajaan perangkat jaringan inti gedung kuliah.',
                115000000,
                'menunggu_persetujuan',
                $unit->id,
                $pemohon->id,
                Carbon::now()->subDays(7)
            );
            $this->assignMak($p3->id, $makBluFisik->id, $perencanaan->id, 'Sesuai MAK Belanja Modal Peralatan dan Mesin.');
            $this->seedDokumen('permohonan', $p3->id, 'rkakl', 'RKAKL_PRM_03.pdf', $perencanaan->id);

            // Step 4a: WD2 setuju, menunggu PPK (status: menunggu_ppk)
            $p4a = $this->seedPermohonan(
                'PRM/BPMN/04A-MENUNGGU-PPK',
                'Pengadaan Perangkat Proyektor Ruang Kelas',
                'Penggantian proyektor di 10 ruang kuliah.',
                85000000,
                'menunggu_ppk',
                $unit->id,
                $pemohon->id,
                Carbon::now()->subDays(6)
            );
            $this->assignMak($p4a->id, $makBluFisik->id, $perencanaan->id);
            ApprovalPermohonan::updateOrCreate(
                ['permohonan_id' => $p4a->id, 'tahap' => 'BIDANG2', 'revisi_ke' => 0],
                ['actor_id' => $bidang2->id, 'keputusan' => 'disetujui', 'alasan' => 'Disetujui Bidang 2.']
            );

            // Step 4b: PPK setuju, menunggu WD2 (status: menunggu_bidang2)
            $p4b = $this->seedPermohonan(
                'PRM/BPMN/04B-MENUNGGU-BIDANG2',
                'Pengadaan Lisensi Software Desain & Simulasi',
                'Perpanjangan lisensi tahunan software laboratorium.',
                60000000,
                'menunggu_bidang2',
                $unit->id,
                $pemohon->id,
                Carbon::now()->subDays(6)
            );
            $this->assignMak($p4b->id, $makBluNonFisik->id, $perencanaan->id);
            ApprovalPermohonan::updateOrCreate(
                ['permohonan_id' => $p4b->id, 'tahap' => 'PPK', 'revisi_ke' => 0],
                ['actor_id' => $ppkBluNonFisik->id, 'keputusan' => 'disetujui', 'alasan' => 'Disetujui PPK.']
            );

            // Step 4c: Ditolak WD2 (status: ditolak)
            $p4c = $this->seedPermohonan(
                'PRM/BPMN/04C-DITOLAK-WD2',
                'Pengadaan Kendaraan Operasional Tambahan',
                'Usulan pembelian kendaraan operasional.',
                320000000,
                'ditolak',
                $unit->id,
                $pemohon->id,
                Carbon::now()->subDays(12)
            );
            $this->assignMak($p4c->id, $makRmFisik->id, $perencanaan->id);
            ApprovalPermohonan::updateOrCreate(
                ['permohonan_id' => $p4c->id, 'tahap' => 'BIDANG2', 'revisi_ke' => 0],
                ['actor_id' => $bidang2->id, 'keputusan' => 'ditolak', 'alasan' => 'Ditolak sesuai kebijakan efisiensi.']
            );

            // Step 5: WD2 & PPK setuju + Memo, siap dipaketkan PPBJ (PRM-PPBJ-001)
            $p5 = $this->seedPermohonan(
                'PRM-PPBJ-001',
                'Pengadaan Peralatan Laboratorium Komputer Terpadu',
                'Pengadaan perangkat laboratorium untuk mendukung praktikum mahasiswa.',
                180000000,
                'disetujui',
                $unit->id,
                $pemohon->id,
                Carbon::now()->subDays(5)
            );
            $this->assignMak($p5->id, $makBluFisik->id, $perencanaan->id);
            $memo5 = $this->seedDokumen('permohonan', $p5->id, 'memo', 'Memo_Persetujuan_PRM_PPBJ_001.pdf', $bidang2->id);
            ApprovalPermohonan::updateOrCreate(
                ['permohonan_id' => $p5->id, 'tahap' => 'PERENCANAAN', 'revisi_ke' => 0],
                ['actor_id' => $perencanaan->id, 'keputusan' => 'disetujui', 'alasan' => 'Anggaran tersedia dan MAK sesuai.']
            );
            ApprovalPermohonan::updateOrCreate(
                ['permohonan_id' => $p5->id, 'tahap' => 'BIDANG2', 'revisi_ke' => 0],
                ['actor_id' => $bidang2->id, 'keputusan' => 'disetujui', 'alasan' => 'Disetujui Bidang 2.', 'memo_dokumen_id' => $memo5->id]
            );
            ApprovalPermohonan::updateOrCreate(
                ['permohonan_id' => $p5->id, 'tahap' => 'PPK', 'revisi_ke' => 0],
                ['actor_id' => $ppkBluFisik->id, 'keputusan' => 'disetujui', 'alasan' => 'Disetujui PPK.', 'memo_dokumen_id' => $memo5->id]
            );

            // Paket pengadaan berkontrak siap/menunggu pembayaran Keuangan (memastikan total >= 10 & menunggu >= 6)
            $keuanganSamples = [
                ['nomor' => 'PRM/KEU/2026/001', 'judul' => 'Pengadaan Komputer Workstation Laboratorium', 'nominal' => 85000000, 'vendor' => 'PT Komputer Nusantara'],
                ['nomor' => 'PRM/KEU/2026/002', 'judul' => 'Pengadaan Server Rackmount Pusat Data', 'nominal' => 140000000, 'vendor' => 'PT Data Center Indonesia'],
                ['nomor' => 'PRM/KEU/2026/003', 'judul' => 'Pengadaan Perangkat Jaringan Kampus', 'nominal' => 92000000, 'vendor' => 'PT Jaringan Prima'],
                ['nomor' => 'PRM/KEU/2026/004', 'judul' => 'Pengadaan Smartboard Ruang Rapat', 'nominal' => 68000000, 'vendor' => 'CV Media Edukasi'],
                ['nomor' => 'PRM/KEU/2026/005', 'judul' => 'Pengadaan Genset Cadangan Gedung Kuliah', 'nominal' => 175000000, 'vendor' => 'PT Energi Mandiri'],
                ['nomor' => 'PRM/KEU/2026/006', 'judul' => 'Pengadaan Peralatan Praktikum IoT', 'nominal' => 54000000, 'vendor' => 'PT Teknologi Terapan'],
            ];

            foreach ($keuanganSamples as $idx => $sample) {
                $pKeu = $this->seedPermohonan(
                    $sample['nomor'],
                    $sample['judul'],
                    'Pengadaan berkontrak siap proses pembayaran Keuangan.',
                    $sample['nominal'],
                    'disetujui',
                    $unit->id,
                    $pemohon->id,
                    Carbon::now()->subDays(25 - $idx)
                );
                $makKeu = $this->assignMak($pKeu->id, $makBluFisik->id, $perencanaan->id);
                $pgKeu = Pengadaan::updateOrCreate(
                    ['permohonan_id' => $pKeu->id, 'level_id' => $levelMid->id],
                    [
                        'permohonan_mak_id' => $makKeu->id,
                        'jenis_id' => $jenisBarang->id,
                        'metode_id' => $metodeEpurchasing->id,
                        'ppk_id' => $ppkBluFisik->id,
                        'status' => 'proses_pembayaran',
                        'revisi_ke' => 0,
                    ]
                );
                ApprovalPengadaan::updateOrCreate(
                    ['pengadaan_id' => $pgKeu->id, 'tahap' => 'PP', 'revisi_ke' => 0],
                    ['actor_id' => $pp->id, 'keputusan' => 'disetujui', 'alasan' => 'Terverifikasi PP.']
                );
                ApprovalPengadaan::updateOrCreate(
                    ['pengadaan_id' => $pgKeu->id, 'tahap' => 'PPK', 'revisi_ke' => 0],
                    ['actor_id' => $ppkBluFisik->id, 'keputusan' => 'disetujui', 'alasan' => 'Disetujui PPK.']
                );
                $ktrKeu = Kontrak::updateOrCreate(
                    ['pengadaan_id' => $pgKeu->id],
                    [
                        'tipe' => 'kontrak',
                        'nomor' => sprintf('KTR/KEU/2026/%03d', $idx + 1),
                        'tanggal' => Carbon::now()->subDays(20 - $idx)->toDateString(),
                        'vendor_nama' => $sample['vendor'],
                        'nominal_kontrak' => $sample['nominal'],
                    ]
                );
                $trmKeu = RencanaPembayaran::updateOrCreate(
                    ['kontrak_id' => $ktrKeu->id, 'tanggal_jatuh_tempo' => Carbon::now()->addDays(5 + $idx)->toDateString()],
                    ['nominal_rencana' => $sample['nominal'], 'status' => 'belum_dibayar']
                );
                $byrKeu = Pembayaran::updateOrCreate(
                    ['rencana_pembayaran_id' => $trmKeu->id],
                    ['nominal' => $sample['nominal'], 'status' => 'disetujui', 'revisi_ke' => 0]
                );
                $this->seedDokumen('permohonan', $pKeu->id, 'rkakl', "RKAKL_KEU_{$idx}.pdf", $perencanaan->id);
                $this->seedDokumen('permohonan', $pKeu->id, 'memo', "Memo_KEU_{$idx}.pdf", $bidang2->id);
                $this->seedDokumen('pengadaan', $pgKeu->id, 'dokumen_pengadaan', "Dok_Pengadaan_KEU_{$idx}.pdf", $ppbj->id);
                $this->seedDokumen('pengadaan', $pgKeu->id, 'bast', "BAST_KEU_{$idx}.pdf", $perlengkapan->id);
                $this->seedDokumen('pembayaran', $byrKeu->id, 'berkas_bayar', "Berkas_Bayar_KEU_{$idx}.pdf", $ppbj->id);
                $this->seedDokumen('pembayaran', $byrKeu->id, 'memo_bidang2', "Memo_WD2_KEU_{$idx}.pdf", $bidang2->id);
                $this->seedDokumen('pembayaran', $byrKeu->id, 'memo_ppk', "Memo_PPK_KEU_{$idx}.pdf", $ppkBluFisik->id);
            }

            // Step 6 & 7: PPBJ membuat paket pengadaan lintas 3 level (<50jt, 50-200jt, >200jt) + revisi (PRM-PPBJ-002)
            $p6 = $this->seedPermohonan(
                'PRM-PPBJ-002',
                'Pengadaan Infrastruktur IT dan Layanan Jaringan',
                'Paket multi-level pengadaan perangkat keras, lisensi, dan server.',
                400000000,
                'disetujui',
                $unit->id,
                $pemohon->id,
                Carbon::now()->subDays(8)
            );
            $makP6Low = $this->assignMak($p6->id, $makBluNonFisik->id, $perencanaan->id);
            $makP6Mid = $this->assignMak($p6->id, $makBluFisik->id, $perencanaan->id);
            $makP6High = $this->assignMak($p6->id, $makRmFisik->id, $perencanaan->id);

            $pg6Low = Pengadaan::updateOrCreate(
                ['permohonan_id' => $p6->id, 'level_id' => $levelLow->id],
                [
                    'permohonan_mak_id' => $makP6Low->id,
                    'jenis_id' => $jenisBarang->id,
                    'metode_id' => $metodeLangsung->id,
                    'ppk_id' => $ppkBluNonFisik->id,
                    'status' => 'review_ppk',
                    'revisi_ke' => 0,
                ]
            );
            $this->seedDokumen('pengadaan', $pg6Low->id, 'dokumen_pengadaan', 'Dokumen_Pengadaan_Low.pdf', $ppbj->id);

            $pg6Mid = Pengadaan::updateOrCreate(
                ['permohonan_id' => $p6->id, 'level_id' => $levelMid->id],
                [
                    'permohonan_mak_id' => $makP6Mid->id,
                    'jenis_id' => $jenisBarang->id,
                    'metode_id' => $metodeEpurchasing->id,
                    'ppk_id' => $ppkBluFisik->id,
                    'status' => 'review_pp',
                    'revisi_ke' => 1,
                ]
            );
            $this->seedDokumen('pengadaan', $pg6Mid->id, 'dokumen_pengadaan', 'Dokumen_Pengadaan_Mid_v2.pdf', $ppbj->id, 2);
            ApprovalPengadaan::updateOrCreate(
                ['pengadaan_id' => $pg6Mid->id, 'tahap' => 'PP', 'revisi_ke' => 0],
                ['actor_id' => $pp->id, 'keputusan' => 'ditolak', 'alasan' => 'Lengkapi HPS dan spesifikasi teknis.']
            );

            $pg6High = Pengadaan::updateOrCreate(
                ['permohonan_id' => $p6->id, 'level_id' => $levelHigh->id],
                [
                    'permohonan_mak_id' => $makP6High->id,
                    'jenis_id' => $jenisJasa->id,
                    'metode_id' => $metodeTender->id,
                    'ppk_id' => $ppkRmFisik->id,
                    'status' => 'ditolak_ppk',
                    'revisi_ke' => 1,
                ]
            );
            ApprovalPengadaan::updateOrCreate(
                ['pengadaan_id' => $pg6High->id, 'tahap' => 'PPK', 'revisi_ke' => 0],
                ['actor_id' => $ppkRmFisik->id, 'keputusan' => 'ditolak', 'alasan' => 'Perbaiki jadwal pelaksanaan tender.']
            );

            // Step 8a: Disetujui PP & PPK, siap kontrak (PRM-PPBJ-003)
            $p8a = $this->seedPermohonan(
                'PRM-PPBJ-003',
                'Pengadaan Perangkat Audio Visual Auditorium',
                'Pembaruan sistem audio visual ruang auditorium.',
                125000000,
                'disetujui',
                $unit->id,
                $pemohon->id,
                Carbon::now()->subDays(10)
            );
            $makP8a = $this->assignMak($p8a->id, $makBluFisik->id, $perencanaan->id);
            $pg8a = Pengadaan::updateOrCreate(
                ['permohonan_id' => $p8a->id, 'level_id' => $levelMid->id],
                [
                    'permohonan_mak_id' => $makP8a->id,
                    'jenis_id' => $jenisBarang->id,
                    'metode_id' => $metodeEpurchasing->id,
                    'ppk_id' => $ppkBluFisik->id,
                    'status' => 'disetujui',
                    'revisi_ke' => 0,
                ]
            );
            $ttdPpk = $this->seedDokumen('pengadaan', $pg8a->id, 'bukti_tanda_tangan', 'TTD_PPK_PRM_PPBJ_003.pdf', $ppkBluFisik->id);
            ApprovalPengadaan::updateOrCreate(
                ['pengadaan_id' => $pg8a->id, 'tahap' => 'PP', 'revisi_ke' => 0],
                ['actor_id' => $pp->id, 'keputusan' => 'disetujui', 'alasan' => 'Dokumen pengadaan terverifikasi PP.']
            );
            ApprovalPengadaan::updateOrCreate(
                ['pengadaan_id' => $pg8a->id, 'tahap' => 'PPK', 'revisi_ke' => 0],
                ['actor_id' => $ppkBluFisik->id, 'keputusan' => 'disetujui', 'alasan' => 'Disetujui PPK untuk proses kontrak.', 'bukti_tanda_tangan_id' => $ttdPpk->id]
            );

            // Step 8b: Berkontrak + 3 Rencana Termin + Reminder (PRM-PPBJ-004)
            $p8b = $this->seedPermohonan(
                'PRM-PPBJ-004',
                'Pengembangan Sistem Informasi Akademik Terintegrasi',
                'Pengembangan modul akademik dan integrasi API.',
                150000000,
                'disetujui',
                $unit->id,
                $pemohon->id,
                Carbon::now()->subDays(15)
            );
            $makP8b = $this->assignMak($p8b->id, $makRmNonFisik->id, $perencanaan->id);
            $pg8b = Pengadaan::updateOrCreate(
                ['permohonan_id' => $p8b->id, 'level_id' => $levelMid->id],
                [
                    'permohonan_mak_id' => $makP8b->id,
                    'jenis_id' => $jenisJasa->id,
                    'metode_id' => $metodeLangsung->id,
                    'ppk_id' => $ppkRmNonFisik->id,
                    'status' => 'proses_pengadaan',
                    'revisi_ke' => 0,
                ]
            );
            $kontrak8b = Kontrak::updateOrCreate(
                ['pengadaan_id' => $pg8b->id],
                [
                    'tipe' => 'kontrak',
                    'nomor' => 'KTR/2026/004',
                    'tanggal' => Carbon::now()->subDays(10)->toDateString(),
                    'vendor_nama' => 'PT Solusi Digital Nusantara',
                    'nominal_kontrak' => 150000000,
                ]
            );
            foreach ([1 => 45000000, 2 => 60000000, 3 => 45000000] as $urutan => $nominal) {
                $jatuhTempo = Carbon::now()->addDays($urutan * 15)->toDateString();
                $termin = RencanaPembayaran::updateOrCreate(
                    ['kontrak_id' => $kontrak8b->id, 'tanggal_jatuh_tempo' => $jatuhTempo],
                    [
                        'nominal_rencana' => $nominal,
                        'status' => 'belum_dibayar',
                    ]
                );
                Reminder::updateOrCreate(
                    ['rencana_pembayaran_id' => $termin->id],
                    [
                        'tanggal_reminder' => Carbon::now()->addDays($urutan * 15 - 3)->toDateString(),
                        'jenis' => 'jatuh_tempo',
                        'dibuat_oleh' => $ppbj->id,
                    ]
                );
            }

            // Step 9: Perlengkapan menerima barang & upload BAST (barang_diterima)
            $p9 = $this->seedPermohonan(
                'PRM/BPMN/09-BARANG-DITERIMA',
                'Pengadaan Meja dan Kursi Laboratorium',
                'Pengadaan furnitur ruang laboratorium baru.',
                48000000,
                'disetujui',
                $unit->id,
                $pemohon->id,
                Carbon::now()->subDays(18)
            );
            $makP9 = $this->assignMak($p9->id, $makBluFisik->id, $perencanaan->id);
            $pg9 = Pengadaan::updateOrCreate(
                ['permohonan_id' => $p9->id, 'level_id' => $levelLow->id],
                [
                    'permohonan_mak_id' => $makP9->id,
                    'jenis_id' => $jenisBarang->id,
                    'metode_id' => $metodeLangsung->id,
                    'ppk_id' => $ppkBluFisik->id,
                    'status' => 'barang_diterima',
                    'revisi_ke' => 0,
                ]
            );
            Kontrak::updateOrCreate(
                ['pengadaan_id' => $pg9->id],
                [
                    'tipe' => 'spk',
                    'nomor' => 'KTR/2026/009',
                    'tanggal' => Carbon::now()->subDays(14)->toDateString(),
                    'vendor_nama' => 'CV Karya Mandiri Furnitur',
                    'nominal_kontrak' => 48000000,
                ]
            );
            PenerimaanBarang::updateOrCreate(
                ['pengadaan_id' => $pg9->id],
                [
                    'tanggal_terima' => Carbon::now()->subDays(2)->toDateString(),
                    'diterima_oleh' => $perlengkapan->id,
                ]
            );
            $this->seedDokumen('pengadaan', $pg9->id, 'bast', 'BAST_KTR_2026_009.pdf', $perlengkapan->id);

            // Step 10a: PPBJ ajukan pembayaran, menunggu verifikasi PPK/WD2 (PRM-PPBJ-005)
            $p10a = $this->seedPermohonan(
                'PRM-PPBJ-005',
                'Pengadaan Perangkat Keamanan Jaringan Firewall',
                'Pengadaan appliance firewall dan instalasi.',
                100000000,
                'disetujui',
                $unit->id,
                $pemohon->id,
                Carbon::now()->subDays(20)
            );
            $makP10a = $this->assignMak($p10a->id, $makBluFisik->id, $perencanaan->id);
            $pg10a = Pengadaan::updateOrCreate(
                ['permohonan_id' => $p10a->id, 'level_id' => $levelMid->id],
                [
                    'permohonan_mak_id' => $makP10a->id,
                    'jenis_id' => $jenisBarang->id,
                    'metode_id' => $metodeEpurchasing->id,
                    'ppk_id' => $ppkBluFisik->id,
                    'status' => 'review_pembayaran',
                    'revisi_ke' => 0,
                ]
            );
            $kontrak10a = Kontrak::updateOrCreate(
                ['pengadaan_id' => $pg10a->id],
                [
                    'tipe' => 'kontrak',
                    'nomor' => 'KTR/2026/005',
                    'tanggal' => Carbon::now()->subDays(15)->toDateString(),
                    'vendor_nama' => 'PT Cyber Guard Indonesia',
                    'nominal_kontrak' => 100000000,
                ]
            );
            $termin10a = RencanaPembayaran::updateOrCreate(
                ['kontrak_id' => $kontrak10a->id, 'tanggal_jatuh_tempo' => Carbon::now()->addDays(5)->toDateString()],
                ['nominal_rencana' => 100000000, 'status' => 'belum_dibayar']
            );
            $pembayaran10a = Pembayaran::updateOrCreate(
                ['rencana_pembayaran_id' => $termin10a->id],
                ['nominal' => 100000000, 'status' => 'menunggu_ppk', 'revisi_ke' => 0]
            );
            $this->seedDokumen('pembayaran', $pembayaran10a->id, 'berkas_bayar', 'Berkas_Bayar_PRM_PPBJ_005.pdf', $ppbj->id);
            $this->seedDokumen('pembayaran', $pembayaran10a->id, 'legalitas_vendor', 'Legalitas_Vendor_PRM_PPBJ_005.pdf', $ppbj->id);

            // Step 10b: Pembayaran disetujui WD2 & PPK, menunggu bukti pembayaran Keuangan
            $p10b = $this->seedPermohonan(
                'PRM/BPMN/10B-MENUNGGU-KEUANGAN',
                'Pengadaan Alat Ukur Laboratorium Elektronika',
                'Pembelian osiloskop digital dan function generator.',
                75000000,
                'disetujui',
                $unit->id,
                $pemohon->id,
                Carbon::now()->subDays(22)
            );
            $makP10b = $this->assignMak($p10b->id, $makRmFisik->id, $perencanaan->id);
            $pg10b = Pengadaan::updateOrCreate(
                ['permohonan_id' => $p10b->id, 'level_id' => $levelMid->id],
                [
                    'permohonan_mak_id' => $makP10b->id,
                    'jenis_id' => $jenisBarang->id,
                    'metode_id' => $metodeLangsung->id,
                    'ppk_id' => $ppkRmFisik->id,
                    'status' => 'proses_pembayaran',
                    'revisi_ke' => 0,
                ]
            );
            $kontrak10b = Kontrak::updateOrCreate(
                ['pengadaan_id' => $pg10b->id],
                [
                    'tipe' => 'kontrak',
                    'nomor' => 'KTR/2026/010B',
                    'tanggal' => Carbon::now()->subDays(18)->toDateString(),
                    'vendor_nama' => 'PT Instrumen Presisi',
                    'nominal_kontrak' => 75000000,
                ]
            );
            $termin10b = RencanaPembayaran::updateOrCreate(
                ['kontrak_id' => $kontrak10b->id, 'tanggal_jatuh_tempo' => Carbon::now()->addDays(3)->toDateString()],
                ['nominal_rencana' => 75000000, 'status' => 'belum_dibayar']
            );
            $pembayaran10b = Pembayaran::updateOrCreate(
                ['rencana_pembayaran_id' => $termin10b->id],
                ['nominal' => 75000000, 'status' => 'disetujui', 'revisi_ke' => 0]
            );
            $this->seedDokumen('pembayaran', $pembayaran10b->id, 'berkas_bayar', 'Berkas_Bayar_10B.pdf', $ppbj->id);

            // Step 11 (END): Keuangan menginput bukti pembayaran -> selesai
            $p11 = $this->seedPermohonan(
                'PRM/BPMN/11-SELESAI',
                'Pengadaan Printer dan Scanner Administrasi',
                'Pengadaan perangkat cetak untuk administrasi jurusan.',
                32000000,
                'selesai',
                $unit->id,
                $pemohon->id,
                Carbon::now()->subDays(30)
            );
            $makP11 = $this->assignMak($p11->id, $makBluNonFisik->id, $perencanaan->id);
            $pg11 = Pengadaan::updateOrCreate(
                ['permohonan_id' => $p11->id, 'level_id' => $levelLow->id],
                [
                    'permohonan_mak_id' => $makP11->id,
                    'jenis_id' => $jenisBarang->id,
                    'metode_id' => $metodeLangsung->id,
                    'ppk_id' => $ppkBluNonFisik->id,
                    'status' => 'selesai',
                    'revisi_ke' => 0,
                ]
            );
            $kontrak11 = Kontrak::updateOrCreate(
                ['pengadaan_id' => $pg11->id],
                [
                    'tipe' => 'surat_pembelian',
                    'nomor' => 'KTR/2026/011',
                    'tanggal' => Carbon::now()->subDays(25)->toDateString(),
                    'vendor_nama' => 'CV Mitra Perkantoran',
                    'nominal_kontrak' => 32000000,
                ]
            );
            $termin11 = RencanaPembayaran::updateOrCreate(
                ['kontrak_id' => $kontrak11->id, 'tanggal_jatuh_tempo' => Carbon::now()->subDays(8)->toDateString()],
                ['nominal_rencana' => 32000000, 'status' => 'sudah_dibayar']
            );
            $pembayaran11 = Pembayaran::updateOrCreate(
                ['rencana_pembayaran_id' => $termin11->id],
                ['nominal' => 32000000, 'status' => 'selesai', 'tanggal_pembayaran' => Carbon::now()->subDays(5)->toDateString(), 'revisi_ke' => 0]
            );
            $this->seedDokumen('pembayaran', $pembayaran11->id, 'bukti_bayar', 'Bukti_Bayar_11.pdf', $keuangan->id);

            Notification::firstOrCreate(
                ['user_id' => $pemohon->id, 'judul' => 'Pengadaan Selesai'],
                [
                    'channel' => 'app',
                    'pesan' => 'Pembayaran untuk PRM/BPMN/11-SELESAI telah selesai diproses Keuangan.',
                    'ref_type' => 'pengadaan',
                    'ref_id' => $pg11->id,
                ]
            );
        });
    }

    private function seedPermohonan(
        string $nomorSurat,
        string $judul,
        string $ringkasan,
        int $estimasi,
        string $status,
        int $unitId,
        int $createdBy,
        Carbon $createdAt
    ): Permohonan {
        $permohonan = Permohonan::updateOrCreate(
            ['nomor_surat' => $nomorSurat],
            [
                'unit_id' => $unitId,
                'created_by' => $createdBy,
                'judul' => $judul,
                'ringkasan_tujuan' => $ringkasan,
                'estimasi_anggaran' => $estimasi,
                'revisi_ke' => 0,
                'status' => $status,
                'created_at' => $createdAt,
            ]
        );

        $this->seedDokumen('permohonan', $permohonan->id, 'surat_permohonan', "Surat_{$nomorSurat}.pdf", $createdBy);

        return $permohonan;
    }

    private function assignMak(int $permohonanId, int $makId, int $ditentukanOleh, string $catatan = ''): PermohonanMak
    {
        return PermohonanMak::firstOrCreate(
            ['permohonan_id' => $permohonanId, 'mak_id' => $makId],
            ['ditentukan_oleh' => $ditentukanOleh]
        );
    }

    private function seedDokumen(string $refType, int $refId, string $tipeDokumen, string $namaAsli, int $uploadedBy, int $versi = 1): Dokumen
    {
        $safeName = str_replace(['/', ' '], '_', $namaAsli);
        $namaHash = hash('sha256', "{$refType}_{$refId}_{$tipeDokumen}_{$versi}_{$safeName}").'.pdf';
        $path = "dokumen/{$refType}/{$namaHash}";

        if (! Storage::disk('local')->exists($path)) {
            Storage::disk('local')->put($path, "%PDF-1.4\n% SIPBAJA placeholder {$safeName}\n%%EOF\n");
        }

        return Dokumen::updateOrCreate(
            ['ref_type' => $refType, 'ref_id' => $refId, 'tipe_dokumen' => $tipeDokumen, 'versi' => $versi],
            [
                'nama_asli' => $safeName,
                'nama_hash' => $namaHash,
                'mime_type' => 'application/pdf',
                'ukuran_bytes' => 128,
                'uploaded_by' => $uploadedBy,
                'created_at' => Carbon::now(),
            ]
        );
    }

    private function seedStatusHistory(string $refType, int $refId, ?string $statusLama, string $statusBaru, int $actorId): void
    {
        StatusHistory::firstOrCreate(
            ['ref_type' => $refType, 'ref_id' => $refId, 'status_baru' => $statusBaru],
            [
                'status_lama' => $statusLama,
                'actor_id' => $actorId,
                'created_at' => Carbon::now(),
            ]
        );
    }
}
