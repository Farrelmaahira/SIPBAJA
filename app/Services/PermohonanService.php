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
}
