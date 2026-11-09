<?php

namespace Tests\Feature\Pemohon;

use App\Models\ApprovalPermohonan;
use App\Models\Dokumen;
use App\Models\Permohonan;
use App\Models\StatusHistory;
use App\Models\Unit;
use App\Models\User;
use Database\Seeders\MasterReferenceSeeder;
use Database\Seeders\RbacSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PermohonanDetailTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([
            RoleSeeder::class,
            UserSeeder::class,
            RbacSeeder::class,
            MasterReferenceSeeder::class,
        ]);
    }

    private function getPemohonUser(): User
    {
        return User::where('email', 'jurusan@pnj.ac.id')->firstOrFail();
    }

    public function test_guest_cannot_access_permohonan_detail(): void
    {
        $response = $this->getJson('/api/v1/pemohon/permohonan/1');
        $response->assertStatus(401);
    }

    public function test_pemohon_can_view_own_permohonan_detail(): void
    {
        $pemohon = $this->getPemohonUser();

        $permohonan = Permohonan::create([
            'unit_id' => $pemohon->unit_id,
            'created_by' => $pemohon->id,
            'nomor_surat' => '111-FFF-111',
            'judul' => 'Pengadaan Komputer Lab',
            'ringkasan_tujuan' => 'Kebutuhan praktikum mahasiswa',
            'estimasi_anggaran' => 185000000,
            'revisi_ke' => 0,
            'status' => 'menunggu_bidang2',
            'created_at' => now(),
        ]);

        Dokumen::create([
            'ref_type' => 'permohonan',
            'ref_id' => $permohonan->id,
            'tipe_dokumen' => 'surat_permohonan',
            'versi' => 1,
            'nama_asli' => 'Surat_Permohonan_Komputer.pdf',
            'nama_hash' => 'hash123.pdf',
            'mime_type' => 'application/pdf',
            'ukuran_bytes' => 8388608,
            'uploaded_by' => $pemohon->id,
        ]);

        StatusHistory::create([
            'ref_type' => 'permohonan',
            'ref_id' => $permohonan->id,
            'status_lama' => null,
            'status_baru' => 'diajukan',
            'actor_id' => $pemohon->id,
        ]);

        $response = $this->actingAs($pemohon, 'sanctum')->getJson("/api/v1/pemohon/permohonan/{$permohonan->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'permohonan' => [
                    'id',
                    'nomor_surat',
                    'judul',
                    'ringkasan_tujuan',
                    'estimasi_anggaran',
                    'revisi_ke',
                    'status',
                    'created_at',
                    'unit_nama',
                    'pembuat_nama',
                    'dokumen' => [
                        'id',
                        'nama_asli',
                        'ukuran_bytes',
                        'download_url',
                    ],
                    'timeline_stages',
                    'history',
                ],
            ])
            ->assertJsonFragment(['nomor_surat' => '111-FFF-111']);
    }

    public function test_pemohon_cannot_view_other_unit_permohonan_detail(): void
    {
        $pemohon = $this->getPemohonUser();
        $otherUnit = Unit::create(['nama' => 'Unit Elektro']);

        $permohonan = Permohonan::create([
            'unit_id' => $otherUnit->id,
            'created_by' => $pemohon->id,
            'nomor_surat' => 'RAHASIA-ELEKTRO-01',
            'judul' => 'Pengadaan Rahasia',
            'ringkasan_tujuan' => 'Unit lain',
            'estimasi_anggaran' => 50000000,
            'revisi_ke' => 0,
            'status' => 'diajukan',
            'created_at' => now(),
        ]);

        $response = $this->actingAs($pemohon, 'sanctum')->getJson("/api/v1/pemohon/permohonan/{$permohonan->id}");

        $response->assertStatus(403);
    }

    public function test_rejected_permohonan_includes_rejection_notes(): void
    {
        $pemohon = $this->getPemohonUser();
        $perencana = User::where('email', 'perencanaan@pnj.ac.id')->firstOrFail();

        $permohonan = Permohonan::create([
            'unit_id' => $pemohon->unit_id,
            'created_by' => $pemohon->id,
            'nomor_surat' => 'DITOLAK-001',
            'judul' => 'Pengadaan Komputer Tanpa RAB',
            'ringkasan_tujuan' => 'Komputer',
            'estimasi_anggaran' => 100000000,
            'revisi_ke' => 1,
            'status' => 'ditolak',
            'created_at' => now(),
        ]);

        ApprovalPermohonan::create([
            'permohonan_id' => $permohonan->id,
            'tahap' => 'Perencanaan',
            'revisi_ke' => 0,
            'keputusan' => 'ditolak',
            'alasan' => 'Spesifikasi komputer yang diajukan belum dijelaskan secara rinci dan RAB tidak sesuai.',
            'actor_id' => $perencana->id,
        ]);

        StatusHistory::create([
            'ref_type' => 'permohonan',
            'ref_id' => $permohonan->id,
            'status_lama' => 'diajukan',
            'status_baru' => 'ditolak',
            'actor_id' => $perencana->id,
        ]);

        $response = $this->actingAs($pemohon, 'sanctum')->getJson("/api/v1/pemohon/permohonan/{$permohonan->id}");

        $response->assertStatus(200)
            ->assertJsonPath('permohonan.status', 'ditolak')
            ->assertJsonPath('permohonan.catatan_penolakan.alasan', 'Spesifikasi komputer yang diajukan belum dijelaskan secara rinci dan RAB tidak sesuai.')
            ->assertJsonPath('permohonan.timeline_stages.0.status', 'rejected');
    }
}
