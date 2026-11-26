<?php

namespace App\Services;

use App\Models\ApprovalPermohonan;
use App\Models\Dokumen;
use App\Models\Mak;
use App\Models\Permohonan;
use App\Models\PermohonanMak;
use App\Models\StatusHistory;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PermohonanService
{
    protected NotificationService $notificationService;

    public function __construct(
        private ApprovalService $approvalService,
        ?NotificationService $notificationService = null,
    ) {
        $this->notificationService = $notificationService ?? app(NotificationService::class);
    }

    /**
     * Menyimpan permohonan baru, dokumen PDF pendukung, dan riwayat status pertama.
     * Menggunakan transaksi database agar seluruh pencatatan atomik.
     */
    public function simpanPermohonan(User $user, array $data, UploadedFile $file): Permohonan
    {
        return DB::transaction(function () use ($user, $data, $file) {
            $sekarang = Carbon::now();
            $tahun = $sekarang->year;
            $bulan = str_pad((string) $sekarang->month, 2, '0', STR_PAD_LEFT);

            // Tentukan nomor surat: gunakan input jika ada, atau buat nomor acuan jika tidak disediakan
            $nomorSurat = ! empty($data['nomor_surat'])
                ? trim($data['nomor_surat'])
                : sprintf('PRM/%s/%s/%s', $tahun, $bulan, strtoupper(Str::random(5)));

            // Tentukan ringkasan tujuan: gunakan input jika ada, atau buat dari judul pengadaan
            $ringkasanTujuan = ! empty($data['ringkasan_tujuan'])
                ? trim($data['ringkasan_tujuan'])
                : 'Permohonan pengadaan untuk '.trim($data['judul']);

            // Pastikan unit_id tersedia
            $unitId = $user->unit_id;
            if (! $unitId) {
                $defaultUnit = Unit::firstOrCreate(['nama' => 'Jurusan Teknik Informatika']);
                $user->update(['unit_id' => $defaultUnit->id]);
                $unitId = $defaultUnit->id;
            }

            // 1. Simpan permohonan
            $permohonan = Permohonan::create([
                'unit_id' => $unitId,
                'created_by' => $user->id,
                'nomor_surat' => $nomorSurat,
                'judul' => trim($data['judul']),
                'ringkasan_tujuan' => $ringkasanTujuan,
                'estimasi_anggaran' => (float) $data['estimasi_anggaran'],
                'revisi_ke' => 0,
                'status' => 'diajukan',
                'created_at' => $sekarang,
            ]);

            // 2. Simpan fisik berkas ke direktori lokal privat dengan nama ter-hash
            $namaAsli = $file->getClientOriginalName();
            $extension = $file->getClientOriginalExtension() ?: 'pdf';
            $namaHash = Str::uuid()->toString().'.'.$extension;
            $pathSimpan = 'dokumen/permohonan';

            Storage::disk('local')->putFileAs($pathSimpan, $file, $namaHash);

            // 3. Catat metadata berkas di tabel dokumen
            Dokumen::create([
                'ref_type' => 'permohonan',
                'ref_id' => $permohonan->id,
                'tipe_dokumen' => 'surat_permohonan',
                'versi' => 1,
                'nama_asli' => $namaAsli,
                'nama_hash' => $namaHash,
                'mime_type' => $file->getClientMimeType() ?: 'application/pdf',
                'ukuran_bytes' => $file->getSize(),
                'uploaded_by' => $user->id,
            ]);

            // 4. Catat riwayat status awal
            StatusHistory::create([
                'ref_type' => 'permohonan',
                'ref_id' => $permohonan->id,
                'status_lama' => null,
                'status_baru' => 'diajukan',
                'actor_id' => $user->id,
            ]);

            // 5. Kirim notifikasi ke role yang mendapatkan data permohonan (Perencanaan, Bidang 2, PPBJ) & Pemohon
            $this->kirimNotifikasiPermohonanDiajukan($permohonan, $user, false);

            return $permohonan;
        });
    }

    /**
     * Memperbarui data permohonan yang ditolak atau masih dalam status pengajuan awal (belum disetujui/diproses).
     * Menggunakan transaksi database agar update data, dokumen baru (jika ada), dan riwayat status bersifat atomik.
     */
    public function revisiPermohonan(User $user, Permohonan $permohonan, array $data, ?UploadedFile $file = null): Permohonan
    {
        $user->loadMissing('Role');
        abort_unless($user->unit_id && (int) $user->unit_id === (int) $permohonan->unit_id, 403, 'Anda tidak memiliki hak akses untuk merevisi permohonan unit lain.');

        // Syarat: Belum diproses atau disetujui pada tahapan selanjutnya
        $sudahDisetujuiLanjutan = $permohonan->Approvals()->where('keputusan', 'disetujui')->exists();
        $adaPengadaan = $permohonan->Pengadaan()->exists();
        $statusTidakBoleh = in_array($permohonan->status, [
            'menunggu_persetujuan',
            'disetujui',
            'diproses_ppbj',
            'pengadaan',
            'siap_spk',
            'kontrak_terbit',
            'berjalan',
            'barang_diterima',
            'selesai',
        ], true);

        if ($sudahDisetujuiLanjutan || $adaPengadaan || $statusTidakBoleh) {
            abort(422, 'Permohonan tidak dapat diubah karena sudah diproses atau disetujui pada tahapan selanjutnya.');
        }

        return DB::transaction(function () use ($user, $permohonan, $data, $file) {
            $statusLama = $permohonan->status;
            $permohonan->judul = trim($data['judul']);
            $permohonan->estimasi_anggaran = (float) $data['estimasi_anggaran'];
            if (array_key_exists('ringkasan_tujuan', $data)) {
                $permohonan->ringkasan_tujuan = ! empty($data['ringkasan_tujuan']) ? trim($data['ringkasan_tujuan']) : null;
            }
            if ($statusLama === 'ditolak') {
                $permohonan->revisi_ke = ($permohonan->revisi_ke ?? 0) + 1;
            }
            $permohonan->status = 'diajukan';
            $permohonan->save();

            if ($file !== null) {
                $latestDokumen = Dokumen::where('ref_type', 'permohonan')
                    ->where('ref_id', $permohonan->id)
                    ->where('tipe_dokumen', 'surat_permohonan')
                    ->orderByDesc('versi')
                    ->first();

                $versiBaru = ($latestDokumen?->versi ?? 1) + 1;

                $namaAsli = $file->getClientOriginalName();
                $extension = $file->getClientOriginalExtension() ?: 'pdf';
                $namaHash = Str::uuid()->toString().'.'.$extension;
                $pathSimpan = 'dokumen/permohonan';

                Storage::disk('local')->putFileAs($pathSimpan, $file, $namaHash);

                Dokumen::create([
                    'ref_type' => 'permohonan',
                    'ref_id' => $permohonan->id,
                    'tipe_dokumen' => 'surat_permohonan',
                    'versi' => $versiBaru,
                    'nama_asli' => $namaAsli,
                    'nama_hash' => $namaHash,
                    'mime_type' => $file->getClientMimeType() ?: 'application/pdf',
                    'ukuran_bytes' => $file->getSize(),
                    'uploaded_by' => $user->id,
                ]);
            }

            StatusHistory::create([
                'ref_type' => 'permohonan',
                'ref_id' => $permohonan->id,
                'status_lama' => 'ditolak',
                'status_baru' => 'diajukan',
                'actor_id' => $user->id,
            ]);

            // Kirim notifikasi revisi ke role yang mendapatkan data permohonan (Perencanaan, Bidang 2, PPBJ) & Pemohon
            $this->kirimNotifikasiPermohonanDiajukan($permohonan, $user, true);

            return $permohonan;
        });
    }

    /**
     * Mengirim notifikasi pengajuan / revisi permohonan ke seluruh role penerima data permohonan (Perencanaan, Bidang 2, PPBJ) dan Pemohon.
     */
    private function kirimNotifikasiPermohonanDiajukan(Permohonan $permohonan, User $pemohon, bool $isRevisi = false): void
    {
        $nomorSurat = $permohonan->nomor_surat ?: '-';
        $judul = $permohonan->judul;

        // 1. Notifikasi ke Perencanaan (Verifikator utama permohonan & penentu MAK)
        $perencanaanUsers = User::whereHas('Role', fn ($q) => $q->where('nama', 'Perencanaan'))->pluck('id');
        foreach ($perencanaanUsers as $pId) {
            $this->notificationService->send(
                user: (int) $pId,
                judul: $isRevisi ? 'Permohonan Telah Direvisi' : 'Permohonan Baru Perlu Diverifikasi',
                pesan: $isRevisi
                    ? "Permohonan '{$judul}' ({$nomorSurat}) telah direvisi oleh pemohon dan siap diverifikasi kembali."
                    : "Permohonan baru '{$judul}' ({$nomorSurat}) telah diajukan dan menunggu verifikasi serta penetapan MAK.",
                refType: 'permohonan',
                refId: $permohonan->id,
            );
        }

        // 2. Notifikasi ke Bidang 2 (Monitoring Pengajuan Permohonan)
        $bidang2Users = User::whereHas('Role', fn ($q) => $q->where('nama', 'Bidang 2'))->pluck('id');
        foreach ($bidang2Users as $bId) {
            $this->notificationService->send(
                user: (int) $bId,
                judul: $isRevisi ? 'Permohonan Telah Direvisi' : 'Pengajuan Permohonan Baru',
                pesan: $isRevisi
                    ? "Permohonan '{$judul}' ({$nomorSurat}) telah direvisi oleh pemohon."
                    : "Pengajuan permohonan baru '{$judul}' ({$nomorSurat}) telah masuk ke antrean pengajuan.",
                refType: 'permohonan',
                refId: $permohonan->id,
            );
        }

        // 3. Notifikasi ke PPBJ (Monitoring Daftar Permohonan Pengadaan)
        $ppbjUsers = User::whereHas('Role', fn ($q) => $q->where('nama', 'PPBJ'))->pluck('id');
        foreach ($ppbjUsers as $ppbjId) {
            $this->notificationService->send(
                user: (int) $ppbjId,
                judul: $isRevisi ? 'Permohonan Telah Direvisi' : 'Permohonan Baru Masuk',
                pesan: $isRevisi
                    ? "Permohonan pengadaan '{$judul}' ({$nomorSurat}) telah direvisi oleh pemohon."
                    : "Permohonan pengadaan baru '{$judul}' ({$nomorSurat}) telah diajukan oleh pemohon.",
                refType: 'permohonan',
                refId: $permohonan->id,
            );
        }

        // 4. Notifikasi konfirmasi ke Pemohon
        if ($pemohon->id) {
            $this->notificationService->send(
                user: (int) $pemohon->id,
                judul: $isRevisi ? 'Revisi Permohonan Berhasil Dikirim' : 'Permohonan Berhasil Diajukan',
                pesan: $isRevisi
                    ? "Revisi permohonan '{$judul}' ({$nomorSurat}) berhasil dikirim dan masuk antrean verifikasi kembali."
                    : "Permohonan '{$judul}' ({$nomorSurat}) berhasil dikirim dan masuk antrean verifikasi Perencanaan.",
                refType: 'permohonan',
                refId: $permohonan->id,
            );
        }
    }

    /**
     * Mengambil daftar permohonan milik unit pemohon dengan filter status, pencarian, tahun, dan bulan.
     * Mendukung status tunggal, array status, atau string status dipisahkan koma.
     *
     * @param  string|array<string>|null  $status
     */
    public function daftarPermohonan(
        User $user,
        string|array|null $status = null,
        ?string $search = null,
        ?int $tahun = null,
        ?int $bulan = null
    ) {
        $query = Permohonan::where('unit_id', $user->unit_id)->with('Dokumen');

        if (! empty($status) && $status !== 'semua') {
            $rawStatuses = is_array($status)
                ? $status
                : array_filter(array_map('trim', explode(',', $status)));

            $mappedStatuses = [];
            foreach ($rawStatuses as $st) {
                if ($st === 'semua') {
                    continue;
                }

                if (in_array($st, ['menunggu_persetujuan', 'menunggu_verifikasi', 'menunggu_bidang2', 'diajukan'])) {
                    $mappedStatuses[] = 'diajukan';
                    $mappedStatuses[] = 'menunggu_verifikasi';
                    $mappedStatuses[] = 'menunggu_bidang2';
                    $mappedStatuses[] = 'menunggu_persetujuan';
                } elseif (in_array($st, ['sedang_diproses', 'proses_pengadaan', 'diproses'])) {
                    $mappedStatuses[] = 'proses_pengadaan';
                    $mappedStatuses[] = 'diproses';
                    $mappedStatuses[] = 'sedang_diproses';
                } elseif ($st === 'disetujui') {
                    $mappedStatuses[] = 'disetujui';
                    $mappedStatuses[] = 'selesai';
                } else {
                    $mappedStatuses[] = $st;
                }
            }

            if (! empty($mappedStatuses)) {
                $query->whereIn('status', array_unique($mappedStatuses));
            }
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nomor_surat', 'like', "%{$search}%")
                    ->orWhere('judul', 'like', "%{$search}%");
            });
        }

        if ($tahun) {
            $query->whereYear('created_at', $tahun);
        }

        if ($bulan) {
            $query->whereMonth('created_at', $bulan);
        }

        return $query->orderBy('created_at', 'desc')->paginate(10)->withQueryString();
    }

    /**
     * Mengambil informasi berkas fisik dokumen permohonan untuk diunduh pemohon.
     */
    public function ambilDokumen(User $user, Permohonan $permohonan, ?int $dokumenId = null): array
    {
        $user->loadMissing('role');
        $isReviewer = in_array($user->role?->nama, ['Admin', 'Bidang 2', 'Perencanaan', 'PPBJ', 'PPK', 'PP', 'Perlengkapan', 'Keuangan']);
        abort_unless($isReviewer || ($user->unit_id && (int) $user->unit_id === (int) $permohonan->unit_id), 403, 'Akses tidak diizinkan untuk unit lain.');

        if ($dokumenId) {
            $dokumen = $permohonan->Dokumen()->where('id', $dokumenId)->first()
                ?? Dokumen::where('ref_type', 'approval_permohonan')
                    ->where('ref_id', $permohonan->id)
                    ->where('id', $dokumenId)
                    ->firstOrFail();
        } else {
            $dokumen = $permohonan->Dokumen()->where('tipe_dokumen', 'surat_permohonan')->latest('versi')->firstOrFail();
        }
        $path = $dokumen->ref_type === 'approval_permohonan'
            ? $this->memoPath($dokumen)
            : 'dokumen/permohonan/'.$dokumen->nama_hash;

        abort_unless($path && Storage::disk('local')->exists($path), 404, 'Berkas dokumen tidak ditemukan di server.');

        return [
            'path' => $path,
            'nama_asli' => $dokumen->nama_asli,
        ];
    }

    /**
     * Menentukan lokasi penyimpanan berkas memo persetujuan permohonan.
     */
    private function memoPath(Dokumen $dokumen): ?string
    {
        $candidates = [
            'dokumen/memo/'.$dokumen->nama_hash,
            'dokumen/permohonan/memo/'.$dokumen->nama_hash,
            'dokumen/permohonan/'.$dokumen->nama_hash,
        ];

        foreach ($candidates as $candidate) {
            if (Storage::disk('local')->exists($candidate)) {
                return $candidate;
            }
        }

        return null;
    }

    /**
     * Mengambil data detail permohonan lengkap untuk peran Pemohon,
     * termasuk dokumen, catatan penolakan, tahapan alur, dan riwayat status.
     *
     * @return array<string, mixed>
     */
    public function detailPermohonan(User $user, Permohonan $permohonan): array
    {
        $user->loadMissing('role');
        $isReviewer = in_array($user->role?->nama, ['Admin', 'Bidang 2', 'Perencanaan', 'PPBJ', 'PPK', 'PP', 'Perlengkapan', 'Keuangan']);
        abort_unless($isReviewer || ($user->unit_id && (int) $user->unit_id === (int) $permohonan->unit_id), 403, 'Akses tidak diizinkan untuk unit lain.');

        $permohonan->loadMissing([
            'Unit',
            'Creator',
            'Dokumen',
            'Approvals.Actor.Role',
            'Pengadaan.Jenis',
            'Pengadaan.Metode',
            'Pengadaan.Level',
            'Pengadaan.Kontrak',
            'Pengadaan.Penerimaan',
            'Pengadaan.PermohonanMak.Mak',
        ]);

        $dokumen = $permohonan->Dokumen()->where('tipe_dokumen', 'surat_permohonan')->latest('versi')->first();
        $dokumenInfo = $dokumen ? [
            'id' => $dokumen->id,
            'nama_asli' => $dokumen->nama_asli,
            'ukuran_bytes' => (int) ($dokumen->ukuran_bytes ?? 0),
            'mime_type' => $dokumen->mime_type ?? 'application/pdf',
            'download_url' => "/api/v1/pemohon/permohonan/{$permohonan->id}/dokumen",
        ] : null;

        // Ambil catatan penolakan jika status ditolak
        $catatanPenolakan = null;
        if ($permohonan->status === 'ditolak') {
            $approvalDitolak = $permohonan->Approvals
                ->where('keputusan', 'ditolak')
                ->sortByDesc('id')
                ->first();

            if ($approvalDitolak) {
                $pemeriksaRole = $approvalDitolak->Actor?->Role?->nama ?? $approvalDitolak->tahap ?? 'Pemeriksa';
                $pemeriksaLabel = 'Tim '.$pemeriksaRole;
                $diperiksaAt = $approvalDitolak->created_at
                    ? Carbon::parse($approvalDitolak->created_at)->translatedFormat('d F Y, H:i')
                    : null;

                $catatanPenolakan = [
                    'alasan' => $approvalDitolak->alasan ?? 'Tidak ada catatan alasan penolakan.',
                    'pemeriksa_peran' => $pemeriksaLabel,
                    'pemeriksa_nama' => $approvalDitolak->Actor?->nama ?? $approvalDitolak->Actor?->name ?? 'Pemeriksa',
                    'diperiksa_at' => $diperiksaAt,
                ];
            }
        }

        // Ambil riwayat status_history
        $histories = StatusHistory::where('ref_type', 'permohonan')
            ->where('ref_id', $permohonan->id)
            ->with('Actor.Role')
            ->orderBy('id', 'desc')
            ->get();

        $historyList = $histories->map(function ($h) {
            $deskripsi = match ($h->status_baru) {
                'diajukan' => 'Permohonan diajukan oleh '.($h->Actor?->nama ?? 'Pemohon'),
                'menunggu_bidang2' => 'Permohonan diverifikasi oleh Perencanaan dan menunggu persetujuan Bidang 2',
                'disetujui' => 'Permohonan disetujui oleh Pemeriksa',
                'ditolak' => 'Permohonan ditolak oleh Pemeriksa. Lihat catatan pemeriksa untuk alasan penolakan.',
                'proses_pengadaan', 'sedang_diproses' => 'Permohonan masuk ke tahap proses pengadaan oleh PPBJ',
                default => 'Status permohonan diperbarui menjadi '.str_replace('_', ' ', (string) $h->status_baru),
            };

            return [
                'id' => (int) $h->id,
                'status_lama' => $h->status_lama,
                'status_baru' => (string) $h->status_baru,
                'deskripsi' => $deskripsi,
                'actor_nama' => $h->Actor?->nama ?? $h->Actor?->name,
                'actor_role' => $h->Actor?->Role?->nama,
                'waktu' => $h->created_at ? Carbon::parse($h->created_at)->format('d-m-Y H:i') : null,
            ];
        })->values()->all();

        if (empty($historyList)) {
            $historyList = [
                [
                    'id' => 1,
                    'status_lama' => null,
                    'status_baru' => (string) $permohonan->status,
                    'deskripsi' => 'Permohonan diajukan oleh '.($permohonan->Unit?->nama ?? 'Pemohon'),
                    'actor_nama' => $permohonan->Creator?->nama ?? 'Pemohon',
                    'actor_role' => 'Pemohon',
                    'waktu' => $permohonan->created_at ? Carbon::parse($permohonan->created_at)->format('d-m-Y H:i') : Carbon::now()->format('d-m-Y H:i'),
                ],
            ];
        }

        // Evaluasi 5 tahapan stepper
        $isDitolak = $permohonan->status === 'ditolak';
        $isDisetujui = in_array($permohonan->status, ['disetujui', 'selesai', 'proses_pengadaan', 'sedang_diproses']);

        $tahapPermohonanStatus = $isDitolak ? 'rejected' : ($isDisetujui ? 'completed' : 'active');
        $tahapPermohonanKet = $isDitolak ? 'Ditolak' : ($isDisetujui ? 'Disetujui' : 'Menunggu persetujuan');

        $hasPengadaan = $permohonan->Pengadaan->isNotEmpty();
        $tahapPengadaanStatus = $hasPengadaan ? 'completed' : ($isDisetujui ? 'active' : 'pending');
        $tahapPengadaanKet = $hasPengadaan ? 'Paket disusun' : 'Menunggu proses pengadaan';

        $timelineStages = [
            [
                'tahap' => 'permohonan',
                'label' => 'Permohonan',
                'status' => $tahapPermohonanStatus,
                'keterangan' => $tahapPermohonanKet,
            ],
            [
                'tahap' => 'pengadaan',
                'label' => 'Pengadaan',
                'status' => $tahapPengadaanStatus,
                'keterangan' => $tahapPengadaanKet,
            ],
            [
                'tahap' => 'pembelian',
                'label' => 'Pembelian Barang',
                'status' => 'pending',
                'keterangan' => 'Menunggu pembelian barang',
            ],
            [
                'tahap' => 'penerimaan',
                'label' => 'Penerimaan Barang',
                'status' => 'pending',
                'keterangan' => 'Menunggu barang diterima',
            ],
            [
                'tahap' => 'selesai',
                'label' => 'Selesai',
                'status' => 'pending',
                'keterangan' => 'Menunggu penyelesaian',
            ],
        ];

        $pengadaanService = app(PengadaanService::class);
        $pengadaanList = $permohonan->Pengadaan->map(function ($pgd) use ($permohonan, $pengadaanService) {
            $tracking = $pengadaanService->buildTrackingData($pgd);

            $year = $pgd->created_at ? Carbon::parse($pgd->created_at)->format('Y') : ($permohonan->created_at ? Carbon::parse($permohonan->created_at)->format('Y') : date('Y'));
            $nomorPengadaan = sprintf('PGD-%s-%04d', $year, $pgd->id);

            $isSelesai = in_array($pgd->status, ['selesai', 'barang_diterima'], true);
            $statusLabel = $isSelesai ? 'Selesai' : 'Sedang Berlangsung';

            $nominal = $pgd->Kontrak?->nominal_kontrak
                ? (float) $pgd->Kontrak->nominal_kontrak
                : (float) ($permohonan->estimasi_anggaran ?? 0);

            $judul = $permohonan->judul ?: 'Pengadaan Barang & Jasa';

            return [
                'id' => (int) $pgd->id,
                'nomor_pengadaan' => $nomorPengadaan,
                'judul' => $judul,
                'jenis_nama' => $pgd->Jenis?->nama,
                'mak_nama' => $pgd->PermohonanMak?->Mak?->nama,
                'nominal' => $nominal,
                'status' => (string) $pgd->status,
                'status_label' => $statusLabel,
                'stepper' => $tracking['stepper'],
                'timeline' => $tracking['timeline'],
            ];
        })->values()->all();

        return [
            'id' => (int) $permohonan->id,
            'nomor_surat' => (string) ($permohonan->nomor_surat ?? '-'),
            'judul' => (string) ($permohonan->judul ?? '-'),
            'ringkasan_tujuan' => (string) ($permohonan->ringkasan_tujuan ?? ''),
            'estimasi_anggaran' => (float) ($permohonan->estimasi_anggaran ?? 0),
            'revisi_ke' => (int) ($permohonan->revisi_ke ?? 0),
            'status' => (string) $permohonan->status,
            'created_at' => $permohonan->created_at ? Carbon::parse($permohonan->created_at)->toIso8601String() : null,
            'unit_id' => (int) $permohonan->unit_id,
            'unit_nama' => (string) ($permohonan->Unit?->nama ?? '-'),
            'created_by' => (int) $permohonan->created_by,
            'pembuat_nama' => (string) ($permohonan->Creator?->nama ?? $permohonan->Creator?->name ?? '-'),
            'dokumen' => $dokumenInfo,
            'catatan_penolakan' => $catatanPenolakan,
            'timeline_stages' => $timelineStages,
            'history' => $historyList,
            'pengadaan' => $pengadaanList,
        ];
    }

    /**
     * Menghapus permohonan pengadaan milik unit pemohon jika status masih diajukan/draft/ditolak.
     */
    public function hapusPermohonan(User $user, Permohonan $permohonan): void
    {
        if ($user->unit_id && (int) $permohonan->unit_id !== (int) $user->unit_id) {
            abort(403, 'Anda tidak berhak menghapus permohonan milik unit lain.');
        }

        // Syarat FR-24: Belum diproses atau disetujui pada tahapan selanjutnya (kecuali status terakhir ditolak)
        $isDitolak = $permohonan->status === 'ditolak';
        $sudahDisetujuiLanjutan = ! $isDitolak && $permohonan->Approvals()->where('keputusan', 'disetujui')->exists();
        $adaPengadaan = $permohonan->Pengadaan()->exists();
        $statusTidakBoleh = in_array($permohonan->status, [
            'menunggu_persetujuan',
            'disetujui',
            'diproses_ppbj',
            'pengadaan',
            'siap_spk',
            'kontrak_terbit',
            'berjalan',
            'barang_diterima',
            'selesai',
        ], true);

        if ($sudahDisetujuiLanjutan || $adaPengadaan || $statusTidakBoleh) {
            abort(422, 'Permohonan tidak dapat dibatalkan atau dihapus karena sudah diproses atau disetujui pada tahapan selanjutnya.');
        }

        DB::transaction(function () use ($permohonan) {
            $dokumens = Dokumen::whereIn('ref_type', ['permohonan', 'approval_permohonan'])
                ->where('ref_id', $permohonan->id)
                ->get();

            foreach ($dokumens as $dokumen) {
                if ($dokumen->nama_hash) {
                    $candidates = [
                        'dokumen/permohonan/'.$dokumen->nama_hash,
                        'dokumen/permohonan/memo/'.$dokumen->nama_hash,
                        'dokumen/memo/'.$dokumen->nama_hash,
                    ];
                    foreach ($candidates as $cand) {
                        if (Storage::disk('local')->exists($cand)) {
                            Storage::disk('local')->delete($cand);
                        }
                    }
                }
                $dokumen->delete();
            }

            StatusHistory::where('ref_type', 'permohonan')
                ->where('ref_id', $permohonan->id)
                ->delete();

            $permohonan->Approvals()->delete();
            $permohonan->PermohonanMak()->delete();
            $permohonan->delete();
        });
    }

    /**
     * Mengambil daftar permohonan pengadaan untuk peran PPBJ.
     *
     * @return array<int, array{
     *     id: int,
     *     nomorSurat: string,
     *     judul: string,
     *     ringkasanTujuan: string,
     *     unitNama: string,
     *     estimasiAnggaran: float,
     *     revisiKe: int,
     *     status: string,
     *     tanggalPengajuan: string,
     *     makList: array<int, string>,
     *     jumlahPaket: int
     * }>
     */
    public function getPermohonanPpbjList(): array
    {
        $permohonanItems = Permohonan::with(['Unit', 'PermohonanMak.Mak', 'Pengadaan.Kontrak'])
            ->orderByDesc('created_at')
            ->get();

        return $permohonanItems->map(function (Permohonan $item): array {
            $makList = $item->PermohonanMak
                ->map(fn ($pm) => $pm->Mak?->nama ?? $pm->Mak?->kode)
                ->filter()
                ->values()
                ->all();

            $tanggalPengajuan = $item->created_at
                ? Carbon::parse($item->created_at)->format('Y-m-d')
                : '';

            $nilaiPengadaan = (float) $item->Pengadaan->sum(function ($pg) {
                return (float) ($pg->Kontrak?->nominal_kontrak ?? 0);
            });

            return [
                'id' => (int) $item->id,
                'nomorSurat' => (string) ($item->nomor_surat ?? '-'),
                'judul' => (string) ($item->judul ?? '-'),
                'ringkasanTujuan' => (string) ($item->ringkasan_tujuan ?? ''),
                'unitNama' => (string) ($item->Unit?->nama ?? '-'),
                'estimasiAnggaran' => (float) ($item->estimasi_anggaran ?? 0),
                'nilaiPengadaan' => (float) ($item->estimasi_anggaran ?? 0),
                'nominal' => (float) ($item->estimasi_anggaran ?? 0),
                'revisiKe' => (int) ($item->revisi_ke ?? 0),
                'status' => (string) ($item->status ?? 'menunggu_persetujuan'),
                'tanggalPengajuan' => $tanggalPengajuan,
                'makList' => $makList,
                'jumlahPaket' => (int) $item->Pengadaan->count(),
            ];
        })->all();
    }

    /**
     * Mengambil detail permohonan pengadaan berdasarkan ID untuk peran PPBJ.
     */
    public function getPermohonanDetail(int $id): array
    {
        $permohonan = Permohonan::with([
            'Unit',
            'Creator',
            'Dokumen',
            'Approvals',
            'PermohonanMak.Mak',
            'Pengadaan.PermohonanMak.Mak.Ppk',
            'Pengadaan.Ppk',
            'Pengadaan.Jenis',
            'Pengadaan.Metode',
            'Pengadaan.Level',
            'Pengadaan.Dokumen',
            'Pengadaan.Kontrak',
        ])->findOrFail($id);

        $dokumenList = $permohonan->Dokumen
            ->map(fn ($doc) => [
                'id' => (int) $doc->id,
                'nama_asli' => (string) $doc->nama_asli,
                'tipe_dokumen' => (string) ($doc->tipe_dokumen ?? 'surat_permohonan'),
                'ukuran_bytes' => (int) ($doc->ukuran_bytes ?? 0),
                'mime_type' => (string) ($doc->mime_type ?? 'application/pdf'),
                'versi' => (int) ($doc->versi ?? 1),
                'download_url' => "/api/v1/ppbj/permohonan/{$permohonan->id}/dokumen?dokumen_id={$doc->id}",
            ])
            ->values()
            ->all();

        $makList = $permohonan->PermohonanMak
            ->filter(fn ($pm) => $pm->Mak !== null)
            ->map(fn ($pm) => [
                'kode' => (string) ($pm->Mak->kode ?? $pm->Mak->nama),
                'nama' => (string) $pm->Mak->nama,
            ])
            ->values()
            ->all();

        $paketList = $permohonan->Pengadaan
            ->map(fn ($p) => [
                'id' => (int) $p->id,
                'makNama' => (string) ($p->PermohonanMak?->Mak?->nama ?? '-'),
                'makKode' => (string) ($p->PermohonanMak?->Mak?->kode ?? $p->PermohonanMak?->Mak?->nama ?? '-'),
                'ppkNama' => (string) ($p->PermohonanMak?->Mak?->Ppk?->nama ?? $p->Ppk?->nama ?? '-'),
                'jenisNama' => (string) ($p->Jenis?->nama ?? '-'),
                'metodeNama' => (string) ($p->Metode?->nama ?? '-'),
                'levelNama' => (string) ($p->Level?->nama ?? '-'),
                'nominal' => $p->Kontrak?->nominal_kontrak ? (float) $p->Kontrak->nominal_kontrak : null,
                'status' => (string) ($p->status ?? 'draft'),
                'revisiKe' => (int) ($p->revisi_ke ?? 0),
                'dokumenList' => $p->Dokumen->map(fn ($d) => [
                    'id' => (int) $d->id,
                    'namaAsli' => (string) $d->nama_asli,
                    'nama_asli' => (string) $d->nama_asli,
                    'tipe_dokumen' => (string) ($d->tipe_dokumen ?? 'dokumen_pengadaan'),
                    'download_url' => "/api/v1/ppbj/pengadaan/{$p->id}/dokumen/{$d->id}",
                ])->values()->all(),
            ])
            ->values()
            ->all();

        $tanggalPengajuan = $permohonan->created_at
            ? Carbon::parse($permohonan->created_at)->format('Y-m-d')
            : '';

        $approvalPerencanaan = $permohonan->Approvals
            ->first(function ($app) use ($permohonan) {
                return strtoupper($app->tahap) === 'PERENCANAAN'
                    && (int) $app->revisi_ke === (int) ($permohonan->revisi_ke ?? 0)
                    && $app->keputusan === 'disetujui';
            });

        $catatan = $approvalPerencanaan?->alasan;
        $catatanPerencanaan = (! empty($catatan) && trim($catatan) !== '')
            ? trim($catatan)
            : 'Tidak ada catatan dari pihak perencanaan';

        return [
            'id' => (int) $permohonan->id,
            'nomorSurat' => (string) ($permohonan->nomor_surat ?? '-'),
            'judul' => (string) ($permohonan->judul ?? '-'),
            'ringkasanTujuan' => (string) ($permohonan->ringkasan_tujuan ?? ''),
            'unitNama' => (string) ($permohonan->Unit?->nama ?? '-'),
            'estimasiAnggaran' => (float) ($permohonan->estimasi_anggaran ?? 0),
            'revisiKe' => (int) ($permohonan->revisi_ke ?? 0),
            'status' => (string) ($permohonan->status ?? 'menunggu_persetujuan'),
            'tanggalPengajuan' => $tanggalPengajuan,
            'pembuatNama' => (string) ($permohonan->Creator?->nama ?? $permohonan->Creator?->name ?? '-'),
            'makList' => $makList,
            'paketList' => $paketList,
            'dokumenList' => $dokumenList,
            'catatanPerencanaan' => $catatanPerencanaan,
        ];
    }

    // [BARU - Perencanaan: ringkasan statistik dan permohonan masuk terbaru] ditambahkan untuk kebutuhan fitur Dashboard Perencanaan.
    /**
     * @return array<string, mixed>
     */
    public function getDashboardPerencanaan(): array
    {
        $tahunIni = Carbon::now()->year;
        $bulanIni = Carbon::now()->month;

        $total = Permohonan::count();
        $diajukan = Permohonan::whereIn('status', ['diajukan', 'menunggu_verifikasi'])->count();
        $selesai = Permohonan::whereIn('status', ['selesai', 'disetujui', 'diteruskan'])->count();
        $ditolak = Permohonan::where('status', 'ditolak')->count();

        $tambahanBulanIni = Permohonan::whereYear('created_at', $tahunIni)
            ->whereMonth('created_at', $bulanIni)
            ->count();

        $selesaiBulanIni = Permohonan::whereYear('created_at', $tahunIni)
            ->whereMonth('created_at', $bulanIni)
            ->whereIn('status', ['selesai', 'disetujui', 'diteruskan'])
            ->count();

        $permohonanTerbaru = Permohonan::with(['Unit', 'Creator'])
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->limit(10)
            ->get();

        // Statistik bulanan (Jan - Des tahun ini)
        $rowsBulan = Permohonan::whereYear('created_at', $tahunIni)
            ->whereIn('status', ['disetujui', 'selesai', 'diteruskan', 'ditolak'])
            ->get(['status', 'created_at']);

        $groupedBulan = $rowsBulan->groupBy(function ($item) {
            return Carbon::parse($item->created_at)->month;
        });

        $statistikBulanan = collect(range(1, 12))->map(function (int $bulan) use ($groupedBulan) {
            $items = $groupedBulan->get($bulan, collect());

            return [
                'bulan' => $bulan,
                'disetujui' => $items->whereIn('status', ['disetujui', 'selesai', 'diteruskan'])->count(),
                'ditolak' => $items->where('status', 'ditolak')->count(),
            ];
        })->values()->all();

        // Statistik tahunan (5 tahun terakhir: 2022 - 2026)
        $tahunAwal = $tahunIni - 4;
        $rowsTahun = Permohonan::whereBetween('created_at', [
            Carbon::create($tahunAwal, 1, 1)->startOfDay(),
            Carbon::create($tahunIni, 12, 31)->endOfDay(),
        ])
            ->whereIn('status', ['disetujui', 'selesai', 'diteruskan', 'ditolak'])
            ->get(['status', 'created_at']);

        $groupedTahun = $rowsTahun->groupBy(function ($item) {
            return Carbon::parse($item->created_at)->year;
        });

        $statistikTahunan = collect(range($tahunAwal, $tahunIni))->map(function (int $thn) use ($groupedTahun) {
            $items = $groupedTahun->get($thn, collect());

            return [
                'tahun' => $thn,
                'disetujui' => $items->whereIn('status', ['disetujui', 'selesai', 'diteruskan'])->count(),
                'ditolak' => $items->where('status', 'ditolak')->count(),
            ];
        })->values()->all();

        return [
            'stats' => [
                'total' => $total,
                'diajukan' => $diajukan,
                'selesai' => $selesai,
                'ditolak' => $ditolak,
                'tambahan_bulan_ini' => $tambahanBulanIni,
                'selesai_bulan_ini' => $selesaiBulanIni,
            ],
            'permohonan_terbaru' => $permohonanTerbaru,
            'statistik_bulanan' => $statistikBulanan,
            'statistik_tahunan' => $statistikTahunan,
        ];
    }

    // [BARU - Perencanaan: paginasi daftar permohonan dengan filter lengkap] ditambahkan untuk kebutuhan fitur List Pengajuan Perencanaan.
    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginatePermohonanPerencanaan(array $filters, int $perPage = 10): LengthAwarePaginator
    {
        $query = Permohonan::with(['Unit', 'Creator', 'PermohonanMak.Mak']);

        $keyword = trim((string) ($filters['search'] ?? $filters['q'] ?? ''));
        if ($keyword !== '') {
            $query->where(function ($q) use ($keyword) {
                $q->where('nomor_surat', 'like', "%{$keyword}%")
                    ->orWhere('judul', 'like', "%{$keyword}%");
            });
        }

        $rawStatuses = [];
        if (! empty($filters['statuses']) && is_array($filters['statuses'])) {
            $rawStatuses = $filters['statuses'];
        } elseif (! empty($filters['status']) && $filters['status'] !== 'semua') {
            $rawStatuses = is_array($filters['status'])
                ? $filters['status']
                : array_filter(array_map('trim', explode(',', (string) $filters['status'])));
        }

        if (! empty($rawStatuses)) {
            $mappedStatuses = [];
            foreach ($rawStatuses as $st) {
                if ($st === 'semua') {
                    continue;
                }
                if ($st === 'diajukan') {
                    $mappedStatuses[] = 'diajukan';
                    $mappedStatuses[] = 'menunggu_verifikasi';
                } elseif ($st === 'pengadaan') {
                    $mappedStatuses[] = 'pengadaan';
                    $mappedStatuses[] = 'disetujui';
                } else {
                    $mappedStatuses[] = $st;
                }
            }
            if (! empty($mappedStatuses)) {
                $query->whereIn('status', array_unique($mappedStatuses));
            }
        }

        if (! empty($filters['bulan']) && is_numeric($filters['bulan'])) {
            $query->whereMonth('created_at', (int) $filters['bulan']);
        }

        if (! empty($filters['tahun']) && is_numeric($filters['tahun'])) {
            $query->whereYear('created_at', (int) $filters['tahun']);
        }

        if (! empty($filters['unit_id']) && is_numeric($filters['unit_id'])) {
            $query->where('unit_id', (int) $filters['unit_id']);
        }

        return $query
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();
    }

    // [BARU - Perencanaan: detail permohonan beserta pratinjau RKAKL dan opsi MAK] ditambahkan untuk kebutuhan fitur Detail Permohonan Perencanaan.
    /**
     * @return array<string, mixed>
     */
    public function getDetailPermohonanPerencanaan(Permohonan $permohonan): array
    {
        $permohonan->load([
            'Creator:id,nama,email',
            'Creator.Unit:id,nama',
            'PermohonanMak.Mak.Ppk:id,nama',
        ]);

        $selectedMakIds = $permohonan->PermohonanMak->pluck('mak_id')->toArray();
        $maks = Mak::with('Ppk')
            ->where(function ($q) use ($selectedMakIds) {
                $q->where('isActive', true)
                    ->when(! empty($selectedMakIds), fn ($sub) => $sub->orWhereIn('id', $selectedMakIds));
            })
            ->orderBy('id')
            ->get();
        $approvalPerencanaan = $permohonan->Approvals()
            ->where('tahap', 'PERENCANAAN')
            ->latest('id')
            ->first();

        $dokumenPermohonan = Dokumen::where('ref_type', 'permohonan')->where('ref_id', $permohonan->id)
            ->orderBy('id')
            ->get()
            ->map(function ($doc) use ($permohonan) {
                return [
                    'id' => $doc->id,
                    'nama_asli' => $doc->nama_asli,
                    'tipe_dokumen' => $doc->tipe_dokumen,
                    'ukuran_bytes' => (int) ($doc->ukuran_bytes ?? 0),
                    'mime_type' => $doc->mime_type ?? 'application/pdf',
                    'versi' => $doc->versi,
                    'created_at' => is_string($doc->created_at) ? $doc->created_at : $doc->created_at?->toISOString(),
                    'download_url' => "/api/v1/perencanaan/pengajuan/{$permohonan->id}/dokumen?dokumen_id={$doc->id}",
                ];
            });

        $dokumen = $permohonan->Dokumen()->where('tipe_dokumen', 'surat_permohonan')->latest('versi')->first();

        $dokumenInfo = $dokumen ? [
            'id' => $dokumen->id,
            'nama_asli' => $dokumen->nama_asli,
            'ukuran_bytes' => (int) ($dokumen->ukuran_bytes ?? 0),
            'mime_type' => $dokumen->mime_type ?? 'application/pdf',
            'download_url' => "/api/v1/perencanaan/pengajuan/{$permohonan->id}/dokumen",
        ] : null;

        $rkaklDoc = Dokumen::where('ref_type', 'rkakl')->orderByDesc('versi')->orderByDesc('id')->first();
        $rkaklInfo = $rkaklDoc ? [
            'id' => $rkaklDoc->id,
            'nama_asli' => $rkaklDoc->nama_asli,
            'versi' => $rkaklDoc->versi,
            'ukuran_bytes' => (int) ($rkaklDoc->ukuran_bytes ?? 0),
            'mime_type' => $rkaklDoc->mime_type ?? 'application/pdf',
            'download_url' => "/api/v1/perencanaan/rkakl/dokumen/{$rkaklDoc->id}",
        ] : null;

        $actor = request()->user() ?? User::whereHas('Role', fn ($q) => $q->where('nama', 'Perencanaan'))->first() ?? $permohonan->Creator;
        $detailUtama = $this->detailPermohonan($actor, $permohonan);

        return [
            'permohonan' => $permohonan,
            'maks' => $maks,
            'selected_mak_ids' => $selectedMakIds,
            'approval_perencanaan' => $approvalPerencanaan ? [
                'alasan' => $approvalPerencanaan->alasan,
            ] : null,
            'catatan_penolakan' => $detailUtama['catatan_penolakan'] ?? null,
            'dokumen_permohonan' => $dokumenPermohonan,
            'dokumen' => $dokumenInfo,
            'rkakl_active' => $rkaklInfo,
            'timeline_stages' => $detailUtama['timeline_stages'] ?? [],
            'history' => $detailUtama['history'] ?? [],
            'pengadaan' => $detailUtama['pengadaan'] ?? [],
            'tracking' => ! empty($detailUtama['pengadaan']) ? $detailUtama['pengadaan'][0] : null,
        ];

        return $data;
    }

    // [BARU - Perencanaan: kompatibilitas endpoint deprecated kirim-pengadaan] ditambahkan untuk menjaga kompatibilitas endpoint lama.
    /**
     * @deprecated Penerusan ke PPBJ kini berjalan otomatis setelah Bidang 2 dan PPK menyetujui secara paralel.
     */
    public function kirimPengadaanDeprecated(Permohonan $permohonan, User $actor, int $makId): Permohonan
    {
        return DB::transaction(function () use ($permohonan, $actor, $makId) {
            $statusLama = $permohonan->status;
            $statusBaru = 'selesai';

            PermohonanMak::updateOrCreate(
                [
                    'permohonan_id' => $permohonan->id,
                    'mak_id' => $makId,
                ],
                [
                    'ditentukan_oleh' => $actor->id,
                ]
            );

            $permohonan->update(['status' => $statusBaru]);

            StatusHistory::create([
                'ref_type' => 'permohonan',
                'ref_id' => $permohonan->id,
                'status_lama' => $statusLama,
                'status_baru' => $statusBaru,
                'actor_id' => $actor->id,
            ]);

            return $permohonan;
        });
    }

    // [BARU - PPK: daftar Dokumen Turunan / permohonan yang terikat Jenis MAK milik PPK] ditambahkan untuk kebutuhan fitur persetujuan awal permohonan oleh PPK.
    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginatePermohonanUntukPpk(User $ppk, array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = Permohonan::with(['Unit', 'Creator', 'PermohonanMak.Mak', 'Approvals.Actor'])
            ->whereHas('PermohonanMak.Mak', fn ($q) => $q->where('ppk_user_id', $ppk->id));

        $keyword = trim((string) ($filters['search'] ?? $filters['q'] ?? ''));
        if ($keyword !== '') {
            $query->where(function ($q) use ($keyword) {
                $q->where('nomor_surat', 'like', "%{$keyword}%")
                    ->orWhere('judul', 'like', "%{$keyword}%");
            });
        }

        $statuses = array_values(array_filter((array) ($filters['statuses'] ?? [])));
        if ($statuses !== []) {
            $query->whereIn('status', $statuses);
        } elseif (! empty($filters['status']) && $filters['status'] !== 'semua') {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['bulan']) && is_numeric($filters['bulan'])) {
            $query->whereMonth('created_at', (int) $filters['bulan']);
        }

        if (! empty($filters['tahun']) && is_numeric($filters['tahun'])) {
            $query->whereYear('created_at', (int) $filters['tahun']);
        }

        $perPage = max(1, min($perPage, 100));

        return $query
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();
    }

    // [BARU - PPK: detail permohonan yang terikat Jenis MAK milik PPK] ditambahkan untuk kebutuhan fitur detail persetujuan awal permohonan oleh PPK.
    /**
     * @return array<string, mixed>
     */
    public function getDetailPermohonanUntukPpk(Permohonan $permohonan, User $ppk): array
    {
        $this->approvalService->pastikanPpkBerhakAtasPermohonan($permohonan, $ppk);

        $permohonan->load([
            'Unit',
            'Creator',
            'PermohonanMak.Mak.Ppk',
            'Approvals.Actor',
            'Approvals.Memo',
            'Dokumen',
        ]);

        $dokumenPermohonan = $permohonan->Dokumen
            ->sortByDesc('versi')
            ->values()
            ->each(function (Dokumen $doc) use ($permohonan) {
                $doc->setAttribute('download_url', "/api/v1/ppk/permohonan/{$permohonan->id}/dokumen?dokumen_id={$doc->id}");
            });

        // Ambil catatan masukan dari Tim Perencanaan
        $approvalPerencanaan = $permohonan->Approvals
            ->filter(fn ($a) => in_array(strtoupper((string) $a->tahap), ['PERENCANAAN', 'PERENCANAAN']))
            ->sortByDesc('id')
            ->first();

        $catatanPerencanaan = [
            'pemeriksa_nama' => $approvalPerencanaan?->Actor?->nama ?? $approvalPerencanaan?->Actor?->name ?? null,
            'pemeriksa_peran' => $approvalPerencanaan ? 'Tim Perencanaan' : null,
            'tanggal' => $approvalPerencanaan?->created_at
                ? Carbon::parse($approvalPerencanaan->created_at)->translatedFormat('d F Y, H:i')
                : null,
            'catatan' => $approvalPerencanaan?->alasan ?? null,
        ];

        $makList = $permohonan->PermohonanMak
            ->filter(fn ($pm) => $pm->Mak !== null)
            ->map(fn ($pm) => [
                'id' => $pm->Mak->id,
                'kode' => (string) ($pm->Mak->kode ?? $pm->Mak->nama),
                'nama' => (string) $pm->Mak->nama,
                'ppk_nama' => $pm->Mak->Ppk?->nama,
            ])
            ->values()
            ->all();

        $catatanPenolakan = null;
        if ($permohonan->status === 'ditolak') {
            $penolakan = ApprovalPermohonan::with('Actor')
                ->where('permohonan_id', $permohonan->id)
                ->where('keputusan', 'ditolak')
                ->orderByDesc('revisi_ke')
                ->orderByDesc('id')
                ->first();

            if ($penolakan) {
                $peranMap = [
                    'PERENCANAAN' => 'Tim Perencanaan',
                    'BIDANG2' => 'Wakil Direktur II (Bidang 2)',
                    'PPK' => 'Pejabat Pembuat Komitmen (PPK)',
                ];
                $catatanPenolakan = [
                    'pemeriksa_peran' => $peranMap[(string) $penolakan->tahap] ?? (string) $penolakan->tahap,
                    'diperiksa_at' => $penolakan->created_at
                        ? Carbon::parse($penolakan->created_at)->translatedFormat('d M Y, H:i')
                        : null,
                    'alasan' => $penolakan->alasan,
                ];
            }
        }

        return [
            'permohonan' => $permohonan,
            'dokumen_permohonan' => $dokumenPermohonan,
            'catatan_perencanaan' => $catatanPerencanaan,
            'catatan_penolakan' => $catatanPenolakan,
            'mak_list' => $makList,
            'permohonan_mak_ppk' => $permohonan->PermohonanMak
                ->filter(fn ($pm) => (int) ($pm->Mak?->ppk_user_id ?? 0) === (int) $ppk->id)
                ->values(),
        ];
    }
}
