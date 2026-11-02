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
     * Mengambil daftar permohonan milik unit pemohon dengan filter status dan pencarian.
     */
    public function daftarPermohonan(User $user, ?string $status = null, ?string $search = null)
    {
        $query = Permohonan::where('unit_id', $user->unit_id)->with('Dokumen');

        if ($status && $status !== 'semua') {
            $query->where('status', $status);
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
    public function ambilDokumen(User $user, Permohonan $permohonan): array
    {
        $user->loadMissing('role');
        $isReviewer = in_array($user->role?->nama, ['Admin', 'Bidang 2', 'Perencanaan', 'PPBJ', 'PPK', 'PP', 'Perlengkapan', 'Keuangan']);
        abort_unless($isReviewer || ($user->unit_id && $user->unit_id === $permohonan->unit_id), 403, 'Akses tidak diizinkan untuk unit lain.');

        $dokumen = $permohonan->Dokumen()->where('tipe_dokumen', 'surat_permohonan')->latest('versi')->firstOrFail();
        $path = 'dokumen/permohonan/'.$dokumen->nama_hash;

        abort_unless(Storage::disk('local')->exists($path), 404, 'Berkas dokumen tidak ditemukan di server.');

        return [
            'path' => $path,
            'nama_asli' => $dokumen->nama_asli,
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
            'PermohonanMak.Mak',
            'Pengadaan.PermohonanMak.Mak',
        ])->findOrFail($id);

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
        ];
    }
}
