<?php

namespace Database\Seeders;

use App\Models\ApprovalPengadaan;
use App\Models\Dokumen;
use App\Models\JenisPengadaan;
use App\Models\Kontrak;
use App\Models\LevelPengadaan;
use App\Models\Mak;
use App\Models\MetodePengadaan;
use App\Models\Notification;
use App\Models\PenerimaanBarang;
use App\Models\Pengadaan;
use App\Models\Permohonan;
use App\Models\PermohonanMak;
use App\Models\RencanaPembayaran;
use App\Models\Unit;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PengadaanPpSeeder extends Seeder
{
    public function run(): void
    {
        $ppUser = User::whereHas('role', fn ($q) => $q->where('nama', 'PP'))->first();
        $ppkUser = User::whereHas('role', fn ($q) => $q->where('nama', 'PPK'))->first();
        $perencanaanUser = User::whereHas('role', fn ($q) => $q->where('nama', 'Perencanaan'))->first();
        $ppbjUser = User::whereHas('role', fn ($q) => $q->where('nama', 'PPBJ'))->first();
        $pemohonUser = User::whereHas('role', fn ($q) => $q->where('nama', 'Pemohon'))->first() ?? $ppUser;

        $unitTik = Unit::firstOrCreate(['nama' => 'Jurusan Teknik Informatika & Komputer']);
        $levelPp = LevelPengadaan::where('perlu_review_pp', true)->first()
            ?? LevelPengadaan::firstOrCreate([
                'nama' => '50-200jt',
                'min_nominal' => 50000000,
                'max_nominal' => 200000000,
                'perlu_review_pp' => true,
            ]);

        $jenisBarang = JenisPengadaan::firstOrCreate(['nama' => 'Barang']);
        $metodeLangsung = MetodePengadaan::firstOrCreate(['nama' => 'Pengadaan Langsung']);
        $mak1 = Mak::first() ?? Mak::create([
            'nama' => '532111 - Belanja Modal Peralatan dan Mesin',
            'ppk_user_id' => $ppkUser->id,
        ]);

        $items = [
            [
                'nomor_surat' => '01010-PP-11',
                'judul' => 'Pengadaan Komputer Lab',
                'ringkasan' => 'Pengadaan unit komputer desktop untuk praktikum lab multimedia.',
                'nominal' => 75000000,
                'status' => 'menunggu_persetujuan',
                'created_at' => Carbon::now()->subDays(17),
            ],
            [
                'nomor_surat' => '01011-PP-11',
                'judul' => 'Pengadaan Proyektor Ruang Kelas',
                'ringkasan' => 'Pengadaan proyektor laser resolusi tinggi untuk 5 ruang kuliah.',
                'nominal' => 98500000,
                'status' => 'menunggu_persetujuan',
                'created_at' => Carbon::now()->subDays(15),
            ],
            [
                'nomor_surat' => '01012-PP-11',
                'judul' => 'Pengadaan Switch Jaringan Gedung A',
                'ringkasan' => 'Pengadaan managed gigabit switch untuk infrastruktur jaringan backbone.',
                'nominal' => 92750000,
                'status' => 'menunggu_persetujuan',
                'created_at' => Carbon::now()->subDays(13),
            ],
            [
                'nomor_surat' => '01013-PP-11',
                'judul' => 'Pengadaan Perangkat Server',
                'ringkasan' => 'Pengadaan rackmount server 2U untuk sistem aplikasi terpusat.',
                'nominal' => 120000000,
                'status' => 'menunggu_persetujuan',
                'created_at' => Carbon::now()->subDays(10),
            ],
            [
                'nomor_surat' => '01014-PP-11',
                'judul' => 'Pengadaan Printer Laboratorium',
                'ringkasan' => 'Pengadaan printer multifungsi network untuk laboratorium komputer.',
                'nominal' => 57800000,
                'status' => 'ditolak',
                'created_at' => Carbon::now()->subDays(8),
            ],
            [
                'nomor_surat' => '01015-PP-11',
                'judul' => 'Pengadaan Meja dan Kursi Dosen',
                'ringkasan' => 'Pengadaan fasilitas workstation dan furnitur ruang dosen.',
                'nominal' => 64200000,
                'status' => 'disetujui',
                'created_at' => Carbon::now()->subDays(7),
            ],
            [
                'nomor_surat' => '01016-PP-11',
                'judul' => 'Pengadaan Access Point',
                'ringkasan' => 'Pengadaan access point WiFi 6 untuk area selasar kampus.',
                'nominal' => 58900000,
                'status' => 'diteruskan',
                'created_at' => Carbon::now()->subDays(6),
            ],
            [
                'nomor_surat' => '01017-PP-11',
                'judul' => 'Pengadaan Lisensi Perangkat Lunak',
                'ringkasan' => 'Pengadaan lisensi software desain dan development per tahun.',
                'nominal' => 112000000,
                'status' => 'diteruskan',
                'created_at' => Carbon::now()->subDays(5),
            ],
            [
                'nomor_surat' => '01018-PP-11',
                'judul' => 'Pengadaan UPS Ruang Server',
                'ringkasan' => 'Pengadaan backup power unit on-line 10kVA.',
                'nominal' => 86400000,
                'status' => 'selesai',
                'created_at' => Carbon::now()->subDays(4),
            ],
            [
                'nomor_surat' => '01019-PP-11',
                'judul' => 'Pengadaan Kamera CCTV Gedung B',
                'ringkasan' => 'Pengadaan paket kamera pengawas IP camera luar ruangan.',
                'nominal' => 73000000,
                'status' => 'ditolak',
                'created_at' => Carbon::now()->subDays(3),
            ],
        ];

        foreach ($items as $idx => $item) {
            DB::transaction(function () use ($idx, $item, $unitTik, $pemohonUser, $mak1, $jenisBarang, $metodeLangsung, $levelPp, $ppkUser, $ppUser) {
                $permohonanStatus = match (true) {
                    $idx === 0 || $idx === 1 => 'diajukan',
                    $idx === 2 || $idx === 3 => 'disetujui',
                    $item['status'] === 'ditolak' => 'ditolak',
                    $item['status'] === 'selesai' => 'selesai',
                    default => 'diteruskan',
                };

                // 1. Permohonan
                $permohonan = Permohonan::updateOrCreate(
                    ['nomor_surat' => $item['nomor_surat']],
                    [
                        'unit_id' => $unitTik->id,
                        'created_by' => $pemohonUser->id,
                        'judul' => $item['judul'],
                        'ringkasan_tujuan' => $item['ringkasan'],
                        'estimasi_anggaran' => $item['nominal'],
                        'revisi_ke' => 0,
                        'status' => $permohonanStatus,
                        'created_at' => $item['created_at'],
                    ]
                );

                // 2. PermohonanMak
                $permohonanMak = PermohonanMak::firstOrCreate(
                    [
                        'permohonan_id' => $permohonan->id,
                        'mak_id' => $mak1->id,
                    ],
                    [
                        'ditentukan_oleh' => $ppkUser->id,
                        'created_at' => $item['created_at'],
                    ]
                );

                // 3. Pengadaan
                $pengadaan = Pengadaan::firstOrCreate(
                    [
                        'permohonan_id' => $permohonan->id,
                        'permohonan_mak_id' => $permohonanMak->id,
                    ],
                    [
                        'jenis_id' => $jenisBarang->id,
                        'metode_id' => $metodeLangsung->id,
                        'level_id' => $levelPp->id,
                        'ppk_id' => $ppkUser->id,
                        'nominal' => $item['nominal'],
                        'revisi_ke' => 0,
                        'status' => $item['status'],
                        'created_at' => $item['created_at'],
                    ]
                );

                // 4. Dokumen (Surat Permohonan, Memo Persetujuan, Dokumen Pengadaan)
                Dokumen::firstOrCreate(
                    [
                        'ref_type' => 'permohonan',
                        'ref_id' => $permohonan->id,
                        'tipe_dokumen' => 'surat_permohonan',
                    ],
                    [
                        'versi' => 1,
                        'nama_asli' => "Surat_Permohonan_{$item['nomor_surat']}.pdf",
                        'nama_hash' => "docs/dummy_surat_{$item['nomor_surat']}.pdf",
                        'mime_type' => 'application/pdf',
                        'ukuran_bytes' => 145000,
                        'uploaded_by' => $pemohonUser->id,
                        'created_at' => $item['created_at'],
                    ]
                );

                Dokumen::firstOrCreate(
                    [
                        'ref_type' => 'permohonan',
                        'ref_id' => $permohonan->id,
                        'tipe_dokumen' => 'memo_persetujuan_bidang2',
                    ],
                    [
                        'versi' => 1,
                        'nama_asli' => "Memo_Persetujuan_{$item['nomor_surat']}.pdf",
                        'nama_hash' => "docs/dummy_memo_{$item['nomor_surat']}.pdf",
                        'mime_type' => 'application/pdf',
                        'ukuran_bytes' => 210000,
                        'uploaded_by' => $ppkUser->id,
                        'created_at' => $item['created_at']->copy()->addHours(2),
                    ]
                );

                Dokumen::firstOrCreate(
                    [
                        'ref_type' => 'pengadaan',
                        'ref_id' => $pengadaan->id,
                        'tipe_dokumen' => 'dokumen_pengadaan',
                    ],
                    [
                        'versi' => 1,
                        'nama_asli' => "Dokumen_Pengadaan_{$item['nomor_surat']}.pdf",
                        'nama_hash' => "docs/dummy_pengadaan_{$item['nomor_surat']}.pdf",
                        'mime_type' => 'application/pdf',
                        'ukuran_bytes' => 5242880,
                        'uploaded_by' => $ppkUser->id,
                        'created_at' => $item['created_at']->copy()->addHours(4),
                    ]
                );

                // 5. Approvals if already disetujui or ditolak
                if ($item['status'] === 'disetujui' || $item['status'] === 'diteruskan' || $item['status'] === 'selesai') {
                    ApprovalPengadaan::firstOrCreate(
                        [
                            'pengadaan_id' => $pengadaan->id,
                            'tahap' => 'PP',
                            'revisi_ke' => 0,
                        ],
                        [
                            'keputusan' => 'disetujui',
                            'alasan' => null,
                            'actor_id' => $ppUser->id,
                            'created_at' => $item['created_at']->copy()->addHours(6),
                        ]
                    );
                } elseif ($item['status'] === 'ditolak') {
                    ApprovalPengadaan::firstOrCreate(
                        [
                            'pengadaan_id' => $pengadaan->id,
                            'tahap' => 'PP',
                            'revisi_ke' => 0,
                        ],
                        [
                            'keputusan' => 'ditolak',
                            'alasan' => 'Rincian spesifikasi teknis dan estimasi harga satuan belum sesuai standar HPS kampus.',
                            'actor_id' => $ppUser->id,
                            'created_at' => $item['created_at']->copy()->addHours(6),
                        ]
                    );
                }

                // If selesai, create sample Kontrak & Penerimaan
                if ($item['status'] === 'selesai') {
                    $kontrak = Kontrak::firstOrCreate(
                        ['pengadaan_id' => $pengadaan->id],
                        [
                            'tipe' => 'SPK',
                            'nomor' => 'SPK/PPBJ/2026/001',
                            'tanggal' => $item['created_at']->copy()->addDays(2),
                        ]
                    );

                    RencanaPembayaran::firstOrCreate(
                        [
                            'kontrak_id' => $kontrak->id,
                            'termin_ke' => 1,
                        ],
                        [
                            'nominal_rencana' => $item['nominal'],
                            'tanggal_jatuh_tempo' => $item['created_at']->copy()->addDays(20),
                            'status' => 'lunas',
                            'created_at' => $item['created_at']->copy()->addDays(2),
                        ]
                    );

                    PenerimaanBarang::firstOrCreate(
                        ['pengadaan_id' => $pengadaan->id],
                        [
                            'tanggal_terima' => $item['created_at']->copy()->addDays(15),
                            'diterima_oleh' => $ppkUser->id,
                        ]
                    );
                }
            });
        }

        // 6. Notifications for PP
        if ($ppUser) {
            $notifs = [
                [
                    'judul' => 'Pengingat pengadaan 3 hari lagi',
                    'pesan' => 'Pengadaan Komputer (01010-PP-11) memasuki tanggal pengingat 18 Maret 2027.',
                    'channel' => 'in_app',
                    'read_at' => null,
                    'created_at' => Carbon::now()->subHours(2),
                ],
                [
                    'judul' => 'Permohonan disetujui',
                    'pesan' => 'Pengadaan Perangkat Server (01013-PP-11) telah disetujui pemeriksa.',
                    'channel' => 'in_app',
                    'read_at' => null,
                    'created_at' => Carbon::now()->subHours(5),
                ],
                [
                    'judul' => 'Permohonan ditolak',
                    'pesan' => 'Pengadaan Printer Laboratorium (01014-PP-11) perlu direvisi.',
                    'channel' => 'in_app',
                    'read_at' => null,
                    'created_at' => Carbon::now()->subDay()->setTime(14, 20),
                ],
                [
                    'judul' => 'Pengingat pembayaran besok',
                    'pesan' => 'Dokumen pembayaran 01012-PP-11 harus diselesaikan sebelum 26 Okt 2026.',
                    'channel' => 'in_app',
                    'read_at' => Carbon::now()->subHours(10),
                    'created_at' => Carbon::now()->subDay()->setTime(9, 0),
                ],
                [
                    'judul' => 'Status diperbarui: Sedang Diproses',
                    'pesan' => 'Pengadaan Proyektor Ruang Kelas (01011-PP-11) sedang diproses.',
                    'channel' => 'in_app',
                    'read_at' => Carbon::now()->subHours(12),
                    'created_at' => Carbon::now()->subDays(6),
                ],
            ];

            foreach ($notifs as $n) {
                Notification::firstOrCreate(
                    [
                        'user_id' => $ppUser->id,
                        'judul' => $n['judul'],
                    ],
                    [
                        'channel' => $n['channel'],
                        'pesan' => $n['pesan'],
                        'ref_type' => 'pengadaan',
                        'ref_id' => null,
                        'read_at' => $n['read_at'],
                        'created_at' => $n['created_at'],
                    ]
                );
            }

            foreach ([$perencanaanUser, $ppkUser] as $otherUser) {
                if (! $otherUser) {
                    continue;
                }
                foreach ($notifs as $n) {
                    Notification::firstOrCreate(
                        [
                            'user_id' => $otherUser->id,
                            'judul' => $n['judul'],
                        ],
                        [
                            'channel' => $n['channel'],
                            'pesan' => $n['pesan'],
                            'ref_type' => 'pengadaan',
                            'ref_id' => null,
                            'read_at' => $n['read_at'],
                            'created_at' => $n['created_at'],
                        ]
                    );
                }
            }
        }
    }
}
