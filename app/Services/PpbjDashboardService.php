<?php

namespace App\Services;

use App\Models\Pembayaran;
use App\Models\Pengadaan;
use App\Models\Permohonan;
use App\Models\RencanaPembayaran;
use Illuminate\Support\Carbon;

class PpbjDashboardService
{
    /**
     * @return array{
     *     stats: array<int, array{label: string, value: int, unit: string, variant: string}>,
     *     permohonanMasuk: array<int, mixed>,
     *     pengadaanBerjalan: array<int, mixed>,
     *     terminKontrak: array<int, mixed>
     * }
     */
    public function getDashboardData(): array
    {
        return [
            'stats' => $this->hitungStats(),
            'permohonanMasuk' => $this->ambilPermohonanMasuk(),
            'pengadaanBerjalan' => $this->ambilPengadaanBerjalan(),
            'terminKontrak' => $this->ambilTerminKontrak(),
        ];
    }

    /**
     * @return array<int, array{label: string, value: int, unit: string, variant: string}>
     */
    public function hitungStats(): array
    {
        $permohonanMasukCount = Permohonan::whereIn('status', ['disetujui', 'diproses_ppbj'])
            ->whereDoesntHave('Pengadaan')
            ->count();

        $pengadaanBerjalanCount = Pengadaan::whereNotIn('status', ['selesai', 'batal'])
            ->count();

        $terminSiapBayarCount = Pembayaran::whereIn('status', ['menunggu_ppk', 'menunggu_bidang2'])
            ->count();

        return [
            [
                'label' => 'Permohonan Masuk',
                'value' => $permohonanMasukCount,
                'unit' => 'Permohonan',
                'variant' => 'info',
            ],
            [
                'label' => 'Pengadaan Berjalan',
                'value' => $pengadaanBerjalanCount,
                'unit' => 'Paket',
                'variant' => 'warning',
            ],
            [
                'label' => 'Termin Siap Bayar',
                'value' => $terminSiapBayarCount,
                'unit' => 'Termin',
                'variant' => 'success',
            ],
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function ambilPermohonanMasuk(): array
    {
        return Permohonan::with(['Unit', 'permohonanMak.Mak'])
            ->whereIn('status', ['disetujui', 'diproses_ppbj'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Permohonan $p) => [
                'id' => $p->id,
                'nomorSurat' => $p->nomor_surat,
                'judul' => $p->judul,
                'ringkasanTujuan' => $p->ringkasan_tujuan,
                'unitNama' => $p->Unit?->nama ?? '-',
                'estimasiAnggaran' => (float) $p->estimasi_anggaran,
                'revisiKe' => $p->revisi_ke,
                'status' => $p->status,
                'tanggalPengajuan' => $p->created_at ? Carbon::parse($p->created_at)->format('Y-m-d') : '-',
                'makList' => $p->permohonanMak->map(fn ($pm) => $pm->Mak?->nama)->filter()->values()->all(),
                'jumlahPaket' => $p->Pengadaan()->count(),
            ])
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function ambilPengadaanBerjalan(): array
    {
        return Pengadaan::with([
            'Permohonan.Unit',
            'PermohonanMak.Mak',
            'Jenis',
            'Metode',
            'Level',
            'Ppk',
        ])
            ->whereNotIn('status', ['selesai', 'batal'])
            ->orderByDesc('id')
            ->get()
            ->map(fn (Pengadaan $p) => [
                'id' => $p->id,
                'nomorSurat' => $p->Permohonan?->nomor_surat ?? '-',
                'judul' => $p->Permohonan?->judul ?? ('Paket Pengadaan #' . $p->id),
                'unitNama' => $p->Permohonan?->Unit?->nama ?? '-',
                'makNama' => $p->PermohonanMak?->Mak?->nama ?? '-',
                'jenisNama' => $p->Jenis?->nama ?? '-',
                'metodeNama' => $p->Metode?->nama ?? '-',
                'levelNama' => $p->Level?->nama ?? '-',
                'ppkNama' => $p->Ppk?->nama ?? '-',
                'nominal' => (float) $p->nominal,
                'revisiKe' => $p->revisi_ke,
                'status' => $p->status,
                'tanggalDibuat' => $p->created_at ? (string) $p->created_at : '-',
            ])
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function ambilTerminKontrak(): array
    {
        return RencanaPembayaran::with([
            'Kontrak.Pengadaan.Permohonan.Unit',
            'Reminders',
            'Pembayaran',
        ])
            ->orderByDesc('id')
            ->get()
            ->map(fn (RencanaPembayaran $r) => [
                'id' => $r->id,
                'kontrakNomor' => $r->Kontrak?->nomor ?? '-',
                'kontrakTipe' => $r->Kontrak?->tipe ?? '-',
                'judul' => $r->Kontrak?->Pengadaan?->Permohonan?->judul ?? '-',
                'unitNama' => $r->Kontrak?->Pengadaan?->Permohonan?->Unit?->nama ?? '-',
                'terminKe' => $r->termin_ke,
                'nominalRencana' => (float) $r->nominal_rencana,
                'tanggalJatuhTempo' => $r->tanggal_jatuh_tempo ? Carbon::parse($r->tanggal_jatuh_tempo)->format('Y-m-d') : '-',
                'status' => $r->status,
                'pembayaranStatus' => $r->Pembayaran?->status ?? 'belum_diajukan',
                'pembayaranNominal' => $r->Pembayaran ? (float) $r->Pembayaran->nominal : null,
                'reminderTanggal' => $r->Reminders->first()?->tanggal_reminder ? Carbon::parse($r->Reminders->first()?->tanggal_reminder)->format('Y-m-d') : null,
            ])
            ->all();
    }
}
