<?php

namespace Tests\Feature;

use App\Models\ApprovalPembayaran;
use App\Models\Dokumen;
use App\Models\JenisPengadaan;
use App\Models\Kontrak;
use App\Models\LevelPengadaan;
use App\Models\Mak;
use App\Models\MetodePengadaan;
use App\Models\Pembayaran;
use App\Models\PenerimaanBarang;
use App\Models\Pengadaan;
use App\Models\Permohonan;
use App\Models\PermohonanMak;
use App\Models\RencanaPembayaran;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PpbjPembayaranApiTest extends TestCase
{
    use RefreshDatabase;

    private User $ppbjUser;

    private User $ppkUser;

    private User $bidang2User;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();

        $this->ppbjUser = User::where('email', 'ppbj@pnj.ac.id')->firstOrFail();
        $this->ppkUser = User::where('email', 'ppk.blufisik@pnj.ac.id')->firstOrFail();
        $this->bidang2User = User::where('email', 'bidang2@pnj.ac.id')->firstOrFail();
    }

    private function createPengadaanSiapBayar(): Pengadaan
    {
        $permohonan = Permohonan::firstOrFail();
        $permohonanMak = PermohonanMak::firstOrCreate(
            ['permohonan_id' => $permohonan->id],
            ['mak_id' => Mak::firstOrFail()->id, 'ditentukan_oleh' => $this->ppkUser->id]
        );

        $pengadaan = Pengadaan::create([
            'permohonan_id' => $permohonan->id,
            'permohonan_mak_id' => $permohonanMak->id,
            'jenis_id' => JenisPengadaan::firstOrFail()->id,
            'metode_id' => MetodePengadaan::firstOrFail()->id,
            'level_id' => LevelPengadaan::firstOrFail()->id,
            'ppk_id' => $this->ppkUser->id,
            'revisi_ke' => 0,
            'status' => 'berjalan',
        ]);

        $kontrak = Kontrak::create([
            'pengadaan_id' => $pengadaan->id,
            'tipe' => 'Surat Kontrak',
            'nomor' => 'KTR/2026/001',
            'tanggal' => now(),
            'vendor_nama' => 'PT Rekanan Jaya',
            'nominal_kontrak' => 50000000,
        ]);

        $rencana = RencanaPembayaran::create([
            'kontrak_id' => $kontrak->id,
            'termin_ke' => 1,
            'nominal_rencana' => 50000000,
            'tanggal_jatuh_tempo' => now()->addDays(20),
            'status' => 'belum_lunas',
        ]);

        $penerimaan = PenerimaanBarang::create([
            'pengadaan_id' => $pengadaan->id,
            'tanggal_terima' => now()->subDays(2),
            'diterima_oleh' => 1,
            'catatan' => 'Barang lengkap',
        ]);

        Dokumen::create([
            'ref_type' => 'penerimaan_barang',
            'ref_id' => $penerimaan->id,
            'tipe_dokumen' => 'berita_acara',
            'nama_asli' => 'BAST_Perlengkapan.pdf',
            'nama_hash' => 'bast_hash.pdf',
            'mime_type' => 'application/pdf',
            'ukuran_bytes' => 1024,
            'versi' => 1,
            'uploaded_by' => 1,
        ]);

        Dokumen::create([
            'ref_type' => 'penerimaan_barang',
            'ref_id' => $penerimaan->id,
            'tipe_dokumen' => 'foto_barang',
            'nama_asli' => 'foto_fisik_1.jpg',
            'nama_hash' => 'foto_hash.jpg',
            'mime_type' => 'image/jpeg',
            'ukuran_bytes' => 2048,
            'versi' => 1,
            'uploaded_by' => 1,
        ]);

        return $pengadaan;
    }

    public function test_ppbj_can_fetch_pembayaran_context_with_perlengkapan_bast_and_photos(): void
    {
        $pengadaan = $this->createPengadaanSiapBayar();

        $response = $this->actingAs($this->ppbjUser)
            ->getJson("/api/v1/ppbj/pengadaan/{$pengadaan->id}/pembayaran-context");

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => [
                    'penerimaan' => [
                        'id',
                        'status_kondisi',
                        'bast_dokumen',
                        'foto_barang',
                    ],
                    'pembayaran',
                    'dokumen_tagihan',
                    'approvals' => [
                        'ppk',
                        'bidang2',
                    ],
                    'can_upload_tagihan',
                    'can_upload_legalitas',
                    'dokumen_legalitas',
                    'is_locked',
                ],
            ]);

        $data = $response->json('data');
        $this->assertNotNull($data['penerimaan']['bast_dokumen']);
        $this->assertCount(1, $data['penerimaan']['foto_barang']);
        $this->assertTrue($data['can_upload_tagihan']);
        $this->assertFalse($data['can_upload_legalitas']);
    }

    public function test_ppbj_can_upload_dokumen_tagihan_and_routes_to_dual_approval(): void
    {
        Storage::fake('local');
        $pengadaan = $this->createPengadaanSiapBayar();

        $file = UploadedFile::fake()->create('dokumen_tagihan.pdf', 500, 'application/pdf');

        $response = $this->actingAs($this->ppbjUser)
            ->postJson("/api/v1/ppbj/pengadaan/{$pengadaan->id}/dokumen-tagihan", [
                'dokumen_tagihan' => $file,
                'nominal' => 48500000,
                'catatan' => 'Pengajuan termin pertama',
            ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Dokumen tagihan berhasil diunggah.',
            ]);

        $this->assertDatabaseHas('pembayaran', [
            'nominal' => 48500000,
            'status' => 'menunggu_persetujuan',
        ]);

        $this->assertDatabaseHas('dokumen', [
            'ref_type' => 'pembayaran',
            'tipe_dokumen' => 'dokumen_tagihan',
            'nama_asli' => 'dokumen_tagihan.pdf',
        ]);

        $this->assertEquals('pembayaran', $pengadaan->fresh()->status);
    }

    public function test_ppbj_can_reupload_tagihan_when_status_needs_revision(): void
    {
        Storage::fake('local');
        $pengadaan = $this->createPengadaanSiapBayar();
        $rencana = $pengadaan->Kontrak->RencanaPembayaran->first();

        $pembayaran = Pembayaran::create([
            'rencana_pembayaran_id' => $rencana->id,
            'nominal' => 50000000,
            'status' => 'perlu_revisi',
            'revisi_ke' => 1,
        ]);

        $file = UploadedFile::fake()->create('dokumen_tagihan_rev1.pdf', 600, 'application/pdf');

        $response = $this->actingAs($this->ppbjUser)
            ->postJson("/api/v1/ppbj/pengadaan/{$pengadaan->id}/dokumen-tagihan", [
                'dokumen_tagihan' => $file,
                'nominal' => 49000000,
            ]);

        $response->assertOk();
        $this->assertEquals('menunggu_persetujuan', $pembayaran->fresh()->status);
        $this->assertEquals(49000000, (float) $pembayaran->fresh()->nominal);
    }

    public function test_ppbj_cannot_reupload_tagihan_after_both_memos_approved(): void
    {
        Storage::fake('local');
        $pengadaan = $this->createPengadaanSiapBayar();
        $rencana = $pengadaan->Kontrak->RencanaPembayaran->first();

        $pembayaran = Pembayaran::create([
            'rencana_pembayaran_id' => $rencana->id,
            'nominal' => 50000000,
            'status' => 'disetujui',
        ]);

        $memoPpk = Dokumen::create([
            'ref_type' => 'approval_pembayaran',
            'ref_id' => 1,
            'tipe_dokumen' => 'memo_persetujuan_pembayaran',
            'nama_asli' => 'memo_ppk.pdf',
            'nama_hash' => 'memo_ppk.pdf',
            'mime_type' => 'application/pdf',
            'ukuran_bytes' => 1024,
            'versi' => 1,
            'uploaded_by' => $this->ppkUser->id,
        ]);

        $memoWd2 = Dokumen::create([
            'ref_type' => 'approval_pembayaran',
            'ref_id' => 2,
            'tipe_dokumen' => 'memo_persetujuan_pembayaran',
            'nama_asli' => 'memo_wd2.pdf',
            'nama_hash' => 'memo_wd2.pdf',
            'mime_type' => 'application/pdf',
            'ukuran_bytes' => 1024,
            'versi' => 1,
            'uploaded_by' => $this->bidang2User->id,
        ]);

        ApprovalPembayaran::create([
            'pembayaran_id' => $pembayaran->id,
            'tahap' => 'PPK',
            'keputusan' => 'disetujui',
            'revisi_ke' => 0,
            'memo_dokumen_id' => $memoPpk->id,
            'actor_id' => $this->ppkUser->id,
        ]);

        ApprovalPembayaran::create([
            'pembayaran_id' => $pembayaran->id,
            'tahap' => 'BIDANG2',
            'keputusan' => 'disetujui',
            'revisi_ke' => 0,
            'memo_dokumen_id' => $memoWd2->id,
            'actor_id' => $this->bidang2User->id,
        ]);

        $file = UploadedFile::fake()->create('coba_reupload.pdf', 500, 'application/pdf');

        $response = $this->actingAs($this->ppbjUser)
            ->postJson("/api/v1/ppbj/pengadaan/{$pengadaan->id}/dokumen-tagihan", [
                'dokumen_tagihan' => $file,
            ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);
    }

    public function test_ppbj_cannot_upload_legalitas_vendor_before_memos_complete(): void
    {
        Storage::fake('local');
        $pengadaan = $this->createPengadaanSiapBayar();

        $file = UploadedFile::fake()->create('legalitas.pdf', 500, 'application/pdf');

        $response = $this->actingAs($this->ppbjUser)
            ->postJson("/api/v1/ppbj/pengadaan/{$pengadaan->id}/legalitas-vendor", [
                'dokumen_legalitas' => $file,
            ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);
    }

    public function test_ppbj_can_upload_legalitas_vendor_after_both_memos_approved(): void
    {
        Storage::fake('local');
        $pengadaan = $this->createPengadaanSiapBayar();
        $rencana = $pengadaan->Kontrak->RencanaPembayaran->first();

        $pembayaran = Pembayaran::create([
            'rencana_pembayaran_id' => $rencana->id,
            'nominal' => 50000000,
            'status' => 'disetujui',
        ]);

        $memoPpk = Dokumen::create([
            'ref_type' => 'approval_pembayaran',
            'ref_id' => 1,
            'tipe_dokumen' => 'memo_persetujuan_pembayaran',
            'nama_asli' => 'memo_ppk.pdf',
            'nama_hash' => 'memo_ppk.pdf',
            'mime_type' => 'application/pdf',
            'ukuran_bytes' => 1024,
            'versi' => 1,
            'uploaded_by' => $this->ppkUser->id,
        ]);

        $memoWd2 = Dokumen::create([
            'ref_type' => 'approval_pembayaran',
            'ref_id' => 2,
            'tipe_dokumen' => 'memo_persetujuan_pembayaran',
            'nama_asli' => 'memo_wd2.pdf',
            'nama_hash' => 'memo_wd2.pdf',
            'mime_type' => 'application/pdf',
            'ukuran_bytes' => 1024,
            'versi' => 1,
            'uploaded_by' => $this->bidang2User->id,
        ]);

        ApprovalPembayaran::create([
            'pembayaran_id' => $pembayaran->id,
            'tahap' => 'PPK',
            'keputusan' => 'disetujui',
            'revisi_ke' => 0,
            'memo_dokumen_id' => $memoPpk->id,
            'actor_id' => $this->ppkUser->id,
        ]);

        ApprovalPembayaran::create([
            'pembayaran_id' => $pembayaran->id,
            'tahap' => 'BIDANG2',
            'keputusan' => 'disetujui',
            'revisi_ke' => 0,
            'memo_dokumen_id' => $memoWd2->id,
            'actor_id' => $this->bidang2User->id,
        ]);

        $file = UploadedFile::fake()->create('dokumen_legalitas_vendor.pdf', 800, 'application/pdf');

        $response = $this->actingAs($this->ppbjUser)
            ->postJson("/api/v1/ppbj/pengadaan/{$pengadaan->id}/legalitas-vendor", [
                'dokumen_legalitas' => $file,
            ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Dokumen legalitas vendor berhasil diunggah.',
            ]);

        $this->assertDatabaseHas('dokumen', [
            'ref_type' => 'pembayaran',
            'tipe_dokumen' => 'dokumen_legalitas_vendor',
            'nama_asli' => 'dokumen_legalitas_vendor.pdf',
        ]);

        $this->assertEquals('siap_bayar', $pembayaran->fresh()->status);
    }

    public function test_ppbj_can_reupload_legalitas_vendor_before_keuangan_processes(): void
    {
        Storage::fake('local');
        $pengadaan = $this->createPengadaanSiapBayar();
        $rencana = $pengadaan->Kontrak->RencanaPembayaran->first();

        $pembayaran = Pembayaran::create([
            'rencana_pembayaran_id' => $rencana->id,
            'nominal' => 50000000,
            'status' => 'siap_bayar',
        ]);

        $memoPpk = Dokumen::create([
            'ref_type' => 'approval_pembayaran',
            'ref_id' => 1,
            'tipe_dokumen' => 'memo_persetujuan_pembayaran',
            'nama_asli' => 'memo_ppk.pdf',
            'nama_hash' => 'memo_ppk.pdf',
            'mime_type' => 'application/pdf',
            'ukuran_bytes' => 1024,
            'versi' => 1,
            'uploaded_by' => $this->ppkUser->id,
        ]);

        $memoWd2 = Dokumen::create([
            'ref_type' => 'approval_pembayaran',
            'ref_id' => 2,
            'tipe_dokumen' => 'memo_persetujuan_pembayaran',
            'nama_asli' => 'memo_wd2.pdf',
            'nama_hash' => 'memo_wd2.pdf',
            'mime_type' => 'application/pdf',
            'ukuran_bytes' => 1024,
            'versi' => 1,
            'uploaded_by' => $this->bidang2User->id,
        ]);

        ApprovalPembayaran::create([
            'pembayaran_id' => $pembayaran->id,
            'tahap' => 'PPK',
            'keputusan' => 'disetujui',
            'revisi_ke' => 0,
            'memo_dokumen_id' => $memoPpk->id,
            'actor_id' => $this->ppkUser->id,
        ]);

        ApprovalPembayaran::create([
            'pembayaran_id' => $pembayaran->id,
            'tahap' => 'BIDANG2',
            'keputusan' => 'disetujui',
            'revisi_ke' => 0,
            'memo_dokumen_id' => $memoWd2->id,
            'actor_id' => $this->bidang2User->id,
        ]);

        Dokumen::create([
            'ref_type' => 'pembayaran',
            'ref_id' => $pembayaran->id,
            'tipe_dokumen' => 'dokumen_legalitas_vendor',
            'nama_asli' => 'old_legalitas.pdf',
            'nama_hash' => 'old_legalitas.pdf',
            'mime_type' => 'application/pdf',
            'ukuran_bytes' => 1024,
            'versi' => 1,
            'uploaded_by' => $this->ppbjUser->id,
        ]);

        $fileRev = UploadedFile::fake()->create('rev_legalitas.pdf', 900, 'application/pdf');

        $response = $this->actingAs($this->ppbjUser)
            ->postJson("/api/v1/ppbj/pengadaan/{$pengadaan->id}/legalitas-vendor", [
                'dokumen_legalitas' => $fileRev,
            ]);

        $response->assertOk();
        $this->assertDatabaseHas('dokumen', [
            'ref_type' => 'pembayaran',
            'tipe_dokumen' => 'dokumen_legalitas_vendor',
            'nama_asli' => 'rev_legalitas.pdf',
        ]);
    }

    public function test_ppbj_cannot_reupload_legalitas_vendor_after_keuangan_completed(): void
    {
        Storage::fake('local');
        $pengadaan = $this->createPengadaanSiapBayar();
        $rencana = $pengadaan->Kontrak->RencanaPembayaran->first();

        $pembayaran = Pembayaran::create([
            'rencana_pembayaran_id' => $rencana->id,
            'nominal' => 50000000,
            'status' => 'selesai',
        ]);

        $fileRev = UploadedFile::fake()->create('rev_legalitas.pdf', 900, 'application/pdf');

        $response = $this->actingAs($this->ppbjUser)
            ->postJson("/api/v1/ppbj/pengadaan/{$pengadaan->id}/legalitas-vendor", [
                'dokumen_legalitas' => $fileRev,
            ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);
    }
}
