<?php

namespace Tests\Feature\Pemohon;

use App\Models\ApprovalPermohonan;
use App\Models\Dokumen;
use App\Models\Permohonan;
use App\Models\StatusHistory;
use App\Models\Unit;
use App\Models\User;
use Database\Seeders\MasterDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PermohonanHapusTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(MasterDataSeeder::class);
        Storage::fake('local');
    }

    private function getPemohonUser(): User
    {
        return User::where('email', 'jurusan@pnj.ac.id')->firstOrFail();
    }

    public function test_pemohon_dapat_menghapus_permohonan_yang_masih_berstatus_diajukan(): void
    {
        $pemohon = $this->getPemohonUser();

        $permohonan = Permohonan::create([
            'unit_id' => $pemohon->unit_id,
            'created_by' => $pemohon->id,
            'nomor_surat' => 'PRM/TEST/001',
            'judul' => 'Pengadaan ATK Test',
            'ringkasan_tujuan' => 'Kebutuhan ATK',
            'estimasi_anggaran' => 5000000,
            'status' => 'diajukan',
            'revisi_ke' => 0,
        ]);

        $dokumen = Dokumen::create([
            'ref_type' => 'permohonan',
            'ref_id' => $permohonan->id,
            'tipe_dokumen' => 'surat_permohonan',
            'versi' => 1,
            'nama_asli' => 'surat.pdf',
            'nama_hash' => 'hash_surat_001.pdf',
            'mime_type' => 'application/pdf',
            'ukuran_bytes' => 1024,
            'uploaded_by' => $pemohon->id,
        ]);
        Storage::disk('local')->put('dokumen/permohonan/hash_surat_001.pdf', 'dummy pdf content');

        StatusHistory::create([
            'ref_type' => 'permohonan',
            'ref_id' => $permohonan->id,
            'status_lama' => null,
            'status_baru' => 'diajukan',
            'actor_id' => $pemohon->id,
        ]);

        $response = $this->actingAs($pemohon, 'sanctum')
            ->deleteJson("/api/v1/pemohon/permohonan/{$permohonan->id}");

        $response->assertOk()
            ->assertJsonPath('message', 'Permohonan pengadaan berhasil dihapus.');

        $this->assertDatabaseMissing('permohonan', ['id' => $permohonan->id]);
        $this->assertDatabaseMissing('dokumen', ['id' => $dokumen->id]);
        $this->assertDatabaseMissing('status_history', ['ref_type' => 'permohonan', 'ref_id' => $permohonan->id]);
        Storage::disk('local')->assertMissing('dokumen/permohonan/hash_surat_001.pdf');
    }

    public function test_pemohon_tidak_dapat_menghapus_permohonan_yang_telah_disetujui_pada_tahap_selanjutnya(): void
    {
        $pemohon = $this->getPemohonUser();
        $perencana = User::where('email', 'perencanaan@pnj.ac.id')->firstOrFail();

        $permohonan = Permohonan::create([
            'unit_id' => $pemohon->unit_id,
            'created_by' => $pemohon->id,
            'nomor_surat' => 'PRM/TEST/002',
            'judul' => 'Pengadaan Lab Komputer',
            'ringkasan_tujuan' => 'Kebutuhan Komputer',
            'estimasi_anggaran' => 60000000,
            'status' => 'menunggu_persetujuan',
            'revisi_ke' => 0,
        ]);

        ApprovalPermohonan::create([
            'permohonan_id' => $permohonan->id,
            'actor_id' => $perencana->id,
            'tahap' => 'PERENCANAAN',
            'keputusan' => 'disetujui',
            'alasan' => 'Disetujui untuk diteruskan ke Bidang 2',
            'revisi_ke' => 0,
        ]);

        $response = $this->actingAs($pemohon, 'sanctum')
            ->deleteJson("/api/v1/pemohon/permohonan/{$permohonan->id}");

        $response->assertStatus(422);
        $this->assertDatabaseHas('permohonan', ['id' => $permohonan->id]);
    }

    public function test_pemohon_tidak_dapat_menghapus_permohonan_milik_unit_lain(): void
    {
        $pemohon = $this->getPemohonUser();
        $otherUnit = Unit::create(['nama' => 'Unit Lain']);

        $permohonan = Permohonan::create([
            'unit_id' => $otherUnit->id,
            'created_by' => $pemohon->id,
            'nomor_surat' => 'PRM/TEST/003',
            'judul' => 'Pengadaan Unit Lain',
            'ringkasan_tujuan' => 'Kebutuhan Unit Lain',
            'estimasi_anggaran' => 10000000,
            'status' => 'diajukan',
            'revisi_ke' => 0,
        ]);

        $response = $this->actingAs($pemohon, 'sanctum')
            ->deleteJson("/api/v1/pemohon/permohonan/{$permohonan->id}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('permohonan', ['id' => $permohonan->id]);
    }
}
