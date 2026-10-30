<?php

namespace Tests\Feature;

use App\Models\ApprovalPengadaan;
use App\Models\ApprovalPermohonan;
use App\Models\Dokumen;
use App\Models\Kontrak;
use App\Models\Pembayaran;
use App\Models\Permohonan;
use App\Models\RencanaPembayaran;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\PpbjDummySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PpbjDummySeederTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(DatabaseSeeder::class);
        $this->seed(PpbjDummySeeder::class);
    }

    public function test_skenario_1_permohonan_siap_dipaketkan(): void
    {
        $permohonan = Permohonan::where('nomor_surat', 'PRM-PPBJ-001')->first();
        $this->assertNotNull($permohonan, 'Permohonan PRM-PPBJ-001 tidak ditemukan.');
        $this->assertSame('disetujui', $permohonan->status);
        $this->assertGreaterThan(0, $permohonan->permohonanMak()->count());
        $this->assertSame(0, $permohonan->Pengadaan()->count());

        $approvalBidang2 = ApprovalPermohonan::where('permohonan_id', $permohonan->id)
            ->where('tahap', 'BIDANG2')
            ->first();

        $this->assertNotNull($approvalBidang2);
        $this->assertSame('disetujui', $approvalBidang2->keputusan);
        $this->assertNotNull($approvalBidang2->memo_dokumen_id);
    }

    public function test_skenario_2_permohonan_dengan_tiga_level_pengadaan_dan_revisi(): void
    {
        $permohonan = Permohonan::where('nomor_surat', 'PRM-PPBJ-002')->first();
        $this->assertNotNull($permohonan, 'Permohonan PRM-PPBJ-002 tidak ditemukan.');

        $pengadaans = $permohonan->Pengadaan()->with('Level')->get();
        $this->assertGreaterThanOrEqual(3, $pengadaans->count());

        $levels = $pengadaans->pluck('Level.nama')->all();
        $this->assertContains('<50jt', $levels);
        $this->assertContains('50-200jt', $levels);
        $this->assertContains('>200jt', $levels);

        $hasRevisi = $pengadaans->contains(fn ($p) => $p->revisi_ke >= 1);
        $this->assertTrue($hasRevisi, 'Harus ada paket pengadaan dengan riwayat revisi (revisi_ke >= 1).');

        $levelMid = $pengadaans->firstWhere('Level.nama', '50-200jt');
        $this->assertNotNull($levelMid);
        $this->assertSame('review_pp', $levelMid->status);
    }

    public function test_skenario_3_pengadaan_siap_kontrak_disetujui_pp_dan_ppk(): void
    {
        $permohonan = Permohonan::where('nomor_surat', 'PRM-PPBJ-003')->first();
        $this->assertNotNull($permohonan);

        $pengadaan = $permohonan->Pengadaan()->first();
        $this->assertNotNull($pengadaan);
        $this->assertSame('disetujui', $pengadaan->status);

        $approvalPp = ApprovalPengadaan::where('pengadaan_id', $pengadaan->id)
            ->where('tahap', 'PP')
            ->first();
        $approvalPpk = ApprovalPengadaan::where('pengadaan_id', $pengadaan->id)
            ->where('tahap', 'PPK')
            ->first();

        $this->assertNotNull($approvalPp);
        $this->assertSame('disetujui', $approvalPp->keputusan);
        $this->assertNotNull($approvalPpk);
        $this->assertSame('disetujui', $approvalPpk->keputusan);
        $this->assertNotNull($approvalPpk->bukti_tanda_tangan_id);

        $this->assertNull(Kontrak::where('pengadaan_id', $pengadaan->id)->first());
    }

    public function test_skenario_4_pengadaan_berkontrak_dengan_rencana_termin_dan_reminder(): void
    {
        $permohonan = Permohonan::where('nomor_surat', 'PRM-PPBJ-004')->first();
        $this->assertNotNull($permohonan);

        $pengadaan = $permohonan->Pengadaan()->first();
        $this->assertNotNull($pengadaan);

        $kontrak = Kontrak::where('pengadaan_id', $pengadaan->id)->first();
        $this->assertNotNull($kontrak);

        $termins = RencanaPembayaran::where('kontrak_id', $kontrak->id)->orderBy('termin_ke')->get();
        $this->assertCount(3, $termins);

        $totalRencana = $termins->sum('nominal_rencana');
        $this->assertEquals((float) $pengadaan->nominal, (float) $totalRencana);

        foreach ($termins as $termin) {
            $this->assertGreaterThan(0, $termin->Reminders()->count());
        }
    }

    public function test_skenario_5_termin_pembayaran_menunggu_verifikasi(): void
    {
        $permohonan = Permohonan::where('nomor_surat', 'PRM-PPBJ-005')->first();
        $this->assertNotNull($permohonan);

        $pengadaan = $permohonan->Pengadaan()->first();
        $kontrak = Kontrak::where('pengadaan_id', $pengadaan->id)->first();
        $this->assertNotNull($kontrak);

        $termin = RencanaPembayaran::where('kontrak_id', $kontrak->id)->first();
        $this->assertNotNull($termin);

        $pembayaran = Pembayaran::where('rencana_pembayaran_id', $termin->id)->first();
        $this->assertNotNull($pembayaran);
        $this->assertContains($pembayaran->status, ['menunggu_ppk', 'menunggu_bidang2']);
        $this->assertEquals((float) $termin->nominal_rencana, (float) $pembayaran->nominal);

        $berkasBayar = Dokumen::where('ref_type', 'pembayaran')
            ->where('ref_id', $pembayaran->id)
            ->where('tipe_dokumen', 'berkas_bayar')
            ->first();
        $this->assertNotNull($berkasBayar);
    }
}
