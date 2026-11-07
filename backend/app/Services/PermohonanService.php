<?php

namespace App\Services;

use App\Models\Dokumen;
use App\Models\Permohonan;
use App\Models\StatusHistory;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PermohonanService
{
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

            return $permohonan;
        });
    }

    /**
     * Memperbarui data permohonan yang ditolak dan mengajukan ulang ke antrean verifikasi.
     * Menggunakan transaksi database agar update data, dokumen baru (jika ada), dan riwayat status bersifat atomik.
     */
    public function revisiPermohonan(User $user, Permohonan $permohonan, array $data, ?UploadedFile $file = null): Permohonan
    {
        $user->loadMissing('Role');
        abort_unless($user->unit_id && $user->unit_id === $permohonan->unit_id, 403, 'Anda tidak memiliki hak akses untuk merevisi permohonan unit lain.');
        abort_unless($permohonan->status === 'ditolak', 422, 'Hanya permohonan dengan status ditolak yang dapat diajukan ulang.');

        return DB::transaction(function () use ($user, $permohonan, $data, $file) {
            $permohonan->judul = trim($data['judul']);
            $permohonan->estimasi_anggaran = (float) $data['estimasi_anggaran'];
            if (! empty($data['ringkasan_tujuan'])) {
                $permohonan->ringkasan_tujuan = trim($data['ringkasan_tujuan']);
            }
            $permohonan->revisi_ke = ($permohonan->revisi_ke ?? 0) + 1;
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

            return $permohonan;
        });
    }

    /**
     * Mengambil daftar permohonan milik unit pemohon dengan filter status dan pencarian.
     * Mendukung status tunggal, array status, atau string status dipisahkan koma.
     *
     * @param  string|array<string>|null  $status
     */
    public function daftarPermohonan(User $user, string|array|null $status = null, ?string $search = null)
    {
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

        return $query->orderBy('created_at', 'desc')->paginate(10)->withQueryString();
    }

    /**
     * Mengambil informasi berkas fisik dokumen permohonan untuk diunduh pemohon.
     */
    public function ambilDokumen(User $user, Permohonan $permohonan, ?int $dokumenId = null): array
    {
        $user->loadMissing('role');
        $isReviewer = in_array($user->role?->nama, ['Admin', 'Bidang 2', 'Perencanaan', 'PPBJ', 'PPK', 'PP', 'Perlengkapan', 'Keuangan']);
        abort_unless($isReviewer || ($user->unit_id && $user->unit_id === $permohonan->unit_id), 403, 'Akses tidak diizinkan untuk unit lain.');

        if ($dokumenId) {
            $dokumen = $permohonan->Dokumen()->where('id', $dokumenId)->firstOrFail();
        } else {
            $dokumen = $permohonan->Dokumen()->where('tipe_dokumen', 'surat_permohonan')->latest('versi')->firstOrFail();
        }
        $path = 'dokumen/permohonan/'.$dokumen->nama_hash;

        abort_unless(Storage::disk('local')->exists($path), 404, 'Berkas dokumen tidak ditemukan di server.');

        return [
            'path' => $path,
            'nama_asli' => $dokumen->nama_asli,
        ];
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
        abort_unless($isReviewer || ($user->unit_id && $user->unit_id === $permohonan->unit_id), 403, 'Akses tidak diizinkan untuk unit lain.');

        $permohonan->loadMissing(['Unit', 'Creator', 'Dokumen', 'Approvals.Actor.Role', 'Pengadaan']);

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
        ];
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
        $permohonanItems = Permohonan::with(['Unit', 'PermohonanMak.Mak', 'Pengadaan'])
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

            return [
                'id' => (int) $item->id,
                'nomorSurat' => (string) ($item->nomor_surat ?? '-'),
                'judul' => (string) ($item->judul ?? '-'),
                'ringkasanTujuan' => (string) ($item->ringkasan_tujuan ?? ''),
                'unitNama' => (string) ($item->Unit?->nama ?? '-'),
                'estimasiAnggaran' => (float) ($item->estimasi_anggaran ?? 0),
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
            'PermohonanMak.Mak',
            'Pengadaan.PermohonanMak.Mak',
        ])->findOrFail($id);

        $dokumenList = $permohonan->Dokumen
            ->map(fn ($doc) => [
                'id' => (int) $doc->id,
                'nama_asli' => (string) $doc->nama_asli,
                'tipe_dokumen' => (string) ($doc->tipe_dokumen ?? 'surat_permohonan'),
                'ukuran_bytes' => (int) ($doc->ukuran_bytes ?? 0),
                'mime_type' => (string) ($doc->mime_type ?? 'application/pdf'),
                'versi' => (int) ($doc->versi ?? 1),
                'download_url' => "/api/v1/pemohon/permohonan/{$permohonan->id}/dokumen?dokumen_id={$doc->id}",
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
                'makKode' => (string) ($p->PermohonanMak?->Mak?->nama ?? $p->PermohonanMak?->Mak?->kode ?? '-'),
                'nominal' => (float) ($p->nominal ?? 0),
                'status' => (string) ($p->status ?? '-'),
            ])
            ->values()
            ->all();

        $tanggalPengajuan = $permohonan->created_at
            ? Carbon::parse($permohonan->created_at)->format('Y-m-d')
            : '';

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
        ];
    }
}
