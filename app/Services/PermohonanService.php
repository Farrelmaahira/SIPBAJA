<?php

namespace App\Services;

use App\Models\Permohonan;
use Illuminate\Support\Carbon;

class PermohonanService
{
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
                ->map(fn ($pm) => $pm->Mak?->kode)
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

    public function __construct(
        protected PengadaanService $pengadaanService
    ) {}

    /**
     * Mengambil detail permohonan pengadaan berdasarkan ID untuk peran PPBJ.
     *
     * @return array<string, mixed>
     */
    public function getPermohonanDetail(int $id): array
    {
        $permohonan = Permohonan::with([
            'Unit',
            'Creator',
            'PermohonanMak.Mak',
            'Pengadaan.PermohonanMak.Mak',
            'Pengadaan.Jenis',
            'Pengadaan.Metode',
            'Pengadaan.Level',
            'Pengadaan.Ppk',
            'Pengadaan.Dokumen',
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
                'makKode' => (string) ($p->PermohonanMak?->Mak?->kode ?? $p->PermohonanMak?->Mak?->nama ?? '-'),
                'makNama' => (string) ($p->PermohonanMak?->Mak?->nama ?? '-'),
                'nominal' => (float) ($p->nominal ?? 0),
                'status' => (string) ($p->status ?? 'draft'),
                'jenisNama' => (string) ($p->Jenis?->nama ?? '-'),
                'metodeNama' => (string) ($p->Metode?->nama ?? '-'),
                'levelNama' => (string) ($p->Level?->nama ?? '-'),
                'ppkNama' => (string) ($p->Ppk?->nama ?? '-'),
                'dokumenList' => $p->Dokumen->map(fn ($d) => [
                    'id' => (int) $d->id,
                    'namaAsli' => (string) $d->nama_asli,
                    'ukuranBytes' => (int) $d->ukuran_bytes,
                    'versi' => (int) $d->versi,
                ])->values()->all(),
            ])
            ->values()
            ->all();

        $tanggalPengajuan = $permohonan->created_at
            ? Carbon::parse($permohonan->created_at)->format('Y-m-d')
            : '';

        $splitContext = $this->pengadaanService->getSplitContext($id);

        return array_merge([
            'id' => (int) $permohonan->id,
            'nomorSurat' => (string) ($permohonan->nomor_surat ?? '-'),
            'judul' => (string) ($permohonan->judul ?? '-'),
            'ringkasanTujuan' => (string) ($permohonan->ringkasan_tujuan ?? ''),
            'unitNama' => (string) ($permohonan->Unit?->nama ?? '-'),
            'estimasiAnggaran' => (float) ($permohonan->estimasi_anggaran ?? 0),
            'revisiKe' => (int) ($permohonan->revisi_ke ?? 0),
            'status' => (string) ($permohonan->status ?? 'menunggu_persetujuan'),
            'tanggalPengajuan' => $tanggalPengajuan,
            'pembuatNama' => (string) ($permohonan->Creator?->name ?? '-'),
            'makList' => $makList,
            'paketList' => $paketList,
        ], $splitContext);
    }
}
