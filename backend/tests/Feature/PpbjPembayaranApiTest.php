<?php

namespace Tests\Feature;

use App\Models\ApprovalPembayaran;
use App\Models\Dokumen;
use App\Models\Kontrak;
use App\Models\Pembayaran;
use App\Models\PenerimaanBarang;
use App\Models\Pengadaan;
use App\Models\Permohonan;
use App\Models\RencanaPembayaran;
use App\Models\Role;
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
        $permohonanMak = \App\Models\PermohonanMak::firstOrCreate(
            ['permohonan_id' => $permohonan->id],
            ['mak_id' => \App\Models\Mak::firstOrFail()->id, 'ditentukan_oleh' => $this->ppkUser->id]
        );

        $pengadaan = Pengadaan::create([
            'permohonan_id' => $permohonan->id,
            'permohonan_mak_id' => $permohonanMak->id,
            'jenis_id' => \App\Models\JenisPengadaan::firstOrFail()->id,
            'metode_id' => \App\Models\MetodePengadaan::firstOrFail()->id,
            'level_id' => \App\Models\LevelPengadaan::firstOrFail()->id,
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
}
