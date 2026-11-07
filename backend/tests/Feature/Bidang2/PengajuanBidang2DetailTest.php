<?php

namespace Tests\Feature\Bidang2;

use App\Models\ApprovalPermohonan;
use App\Models\Dokumen;
use App\Models\Mak;
use App\Models\Permohonan;
use App\Models\PermohonanMak;
use App\Models\Unit;
use App\Models\User;
use Database\Seeders\MasterReferenceSeeder;
use Database\Seeders\RbacSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PengajuanBidang2DetailTest extends TestCase
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
        Storage::fake('local');
    }

    private function getBidang2User(): User
    {
        return User::where('email', 'bidang2@pnj.ac.id')->firstOrFail();
    }

    private function getPemohonUser(): User
    {
        return User::where('email', 'jurusan@pnj.ac.id')->firstOrFail();
    }

    private function getPerencanaanUser(): User
    {
        return User::where('email', 'perencanaan@pnj.ac.id')->firstOrFail();
    }

    private function createSamplePermohonan(): Permohonan
    {
        $pemohon = $this->getPemohonUser();
        $perencanaan = $this->getPerencanaanUser();
        $unit = Unit::firstOrCreate(['nama' => 'Jurusan Teknik Informatika & Komputer']);

        $permohonan = Permohonan::create([
            'unit_id' => $unit->id,
            'created_by' => $pemohon->id,
            'nomor_surat' => '111-FFF-111',
            'judul' => 'Pengadaan Komputer',
            'ringkasan_tujuan' => 'Kebutuhan praktikum mahasiswa di laboratorium',
            'estimasi_anggaran' => 100000000,
            'revisi_ke' => 0,
            'status' => 'menunggu_bidang2',
            'created_at' => now(),
        ]);

        Dokumen::create([
            'ref_type' => 'permohonan',
            'ref_id' => $permohonan->id,
            'tipe_dokumen' => 'surat_permohonan',
            'versi' => 1,
            'nama_asli' => 'Surat_Permohonan_Pengadaan_Komputer.pdf',
            'nama_hash' => 'hash_surat_sample.pdf',
            'mime_type' => 'application/pdf',
            'ukuran_bytes' => 8388608,
            'uploaded_by' => $pemohon->id,
        ]);

        $mak = Mak::first();
        if ($mak) {
            $mak->update(['nama' => '532111']);
        } else {
            $ppk = User::where('email', 'ppk@pnj.ac.id')->first();
            $mak = Mak::create([
                'nama' => '532111',
                'ppk_user_id' => $ppk?->id,
            ]);
        }

        PermohonanMak::create([
            'permohonan_id' => $permohonan->id,
            'mak_id' => $mak->id,
            'ditentukan_oleh' => $perencanaan->id,
        ]);

        ApprovalPermohonan::create([
            'permohonan_id' => $permohonan->id,
            'tahap' => 'Perencanaan',
            'revisi_ke' => 0,
            'keputusan' => 'disetujui',
            'alasan' => 'Jenis MAK 532111 telah diverifikasi. Mohon periksa kesesuaian nominal dengan Dokumen RKAKL terbaru sebelum memberi keputusan.',
            'actor_id' => $perencanaan->id,
        ]);

        Dokumen::create([
            'ref_type' => 'rkakl',
            'ref_id' => 1,
            'tipe_dokumen' => 'rkakl',
            'versi' => 3,
            'nama_asli' => 'RKAKL_TA_2026_Satker_Politeknik_v3.pdf',
            'nama_hash' => 'hash_rkakl_v3.pdf',
            'mime_type' => 'application/pdf',
            'ukuran_bytes' => 4800000,
            'uploaded_by' => $perencanaan->id,
        ]);

        return $permohonan;
    }

    public function test_guest_cannot_access_bidang2_pengajuan_detail(): void
    {
        $response = $this->getJson('/api/v1/bidang-2/pengajuan/1');
        $response->assertStatus(401);
    }

    public function test_non_bidang2_user_cannot_access_bidang2_pengajuan_detail(): void
    {
        $pemohon = $this->getPemohonUser();
        $permohonan = $this->createSamplePermohonan();
        $response = $this->actingAs($pemohon, 'sanctum')->getJson("/api/v1/bidang-2/pengajuan/{$permohonan->id}");
        $response->assertStatus(403);
    }

    public function test_bidang2_can_view_pengajuan_detail_with_complete_structure(): void
    {
        $bidang2 = $this->getBidang2User();
        $permohonan = $this->createSamplePermohonan();

        $response = $this->actingAs($bidang2, 'sanctum')->getJson("/api/v1/bidang-2/pengajuan/{$permohonan->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'permohonan' => [
                    'id',
                    'nomor_surat',
                    'judul',
                    'ringkasan_tujuan',
                    'unit_nama',
                    'estimasi_anggaran',
                    'revisi_ke',
                    'status',
                    'tanggal_pengajuan',
                    'mak_list' => [
                        '*' => ['id', 'kode', 'nama'],
                    ],
                    'dokumen' => [
                        'id',
                        'nama_asli',
                        'ukuran_bytes',
                        'mime_type',
                        'download_url',
                    ],
                    'catatan_perencanaan' => [
                        'pemeriksa_nama',
                        'pemeriksa_peran',
                        'tanggal',
                        'catatan',
                    ],
                    'rkakl_aktif' => [
                        'versi',
                        'nama_asli',
                        'updated_at',
                        'download_url',
                    ],
                ],
            ]);

        $this->assertEquals('111-FFF-111', $response->json('permohonan.nomor_surat'));
        $this->assertEquals('532111', $response->json('permohonan.mak_list.0.kode'));
        $this->assertEquals(3, $response->json('permohonan.rkakl_aktif.versi'));
    }

    public function test_bidang2_can_approve_pengajuan_with_pdf_memo(): void
    {
        $bidang2 = $this->getBidang2User();
        $permohonan = $this->createSamplePermohonan();

        $fileMemo = UploadedFile::fake()->create('Memo_Persetujuan_111-FFF-111.pdf', 1024, 'application/pdf');

        $response = $this->actingAs($bidang2, 'sanctum')->post("/api/v1/bidang-2/pengajuan/{$permohonan->id}/approve", [
            'file_memo' => $fileMemo,
        ], ['Accept' => 'application/json']);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Permohonan berhasil disetujui dan memo persetujuan telah tersimpan.',
            ]);

        $permohonan->refresh();
        $this->assertEquals('disetujui', $permohonan->status);

        $this->assertDatabaseHas('approval_permohonan', [
            'permohonan_id' => $permohonan->id,
            'tahap' => 'BIDANG2',
            'keputusan' => 'disetujui',
            'actor_id' => $bidang2->id,
        ]);

        $approval = ApprovalPermohonan::where('permohonan_id', $permohonan->id)
            ->where('tahap', 'BIDANG2')
            ->first();
        $this->assertNotNull($approval->memo_dokumen_id);

        $memoDok = Dokumen::find($approval->memo_dokumen_id);
        $this->assertNotNull($memoDok);
        $this->assertEquals('Memo_Persetujuan_111-FFF-111.pdf', $memoDok->nama_asli);
        Storage::disk('local')->assertExists('dokumen/memo/'.$memoDok->nama_hash);

        $this->assertDatabaseHas('status_history', [
            'ref_type' => 'permohonan',
            'ref_id' => $permohonan->id,
            'status_lama' => 'menunggu_bidang2',
            'status_baru' => 'disetujui',
            'actor_id' => $bidang2->id,
        ]);
    }

    public function test_bidang2_approval_requires_pdf_memo(): void
    {
        $bidang2 = $this->getBidang2User();
        $permohonan = $this->createSamplePermohonan();

        $response = $this->actingAs($bidang2, 'sanctum')->postJson("/api/v1/bidang-2/pengajuan/{$permohonan->id}/approve", []);
        $response->assertStatus(422)->assertJsonValidationErrors(['file_memo']);

        $invalidFile = UploadedFile::fake()->create('memo.txt', 500, 'text/plain');
        $responseInvalid = $this->actingAs($bidang2, 'sanctum')->post("/api/v1/bidang-2/pengajuan/{$permohonan->id}/approve", [
            'file_memo' => $invalidFile,
        ], ['Accept' => 'application/json']);
        $responseInvalid->assertStatus(422)->assertJsonValidationErrors(['file_memo']);
    }

    public function test_bidang2_can_reject_pengajuan_with_reason(): void
    {
        $bidang2 = $this->getBidang2User();
        $permohonan = $this->createSamplePermohonan();

        $response = $this->actingAs($bidang2, 'sanctum')->postJson("/api/v1/bidang-2/pengajuan/{$permohonan->id}/reject", [
            'alasan' => 'Estimasi anggaran melebihi alokasi MAK semester ini. Harap disesuaikan.',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Permohonan berhasil ditolak dan catatan telah diteruskan ke pemohon serta Perencanaan.',
            ]);

        $permohonan->refresh();
        $this->assertEquals('ditolak', $permohonan->status);
        $this->assertEquals(1, $permohonan->revisi_ke);

        $this->assertDatabaseHas('approval_permohonan', [
            'permohonan_id' => $permohonan->id,
            'tahap' => 'BIDANG2',
            'keputusan' => 'ditolak',
            'alasan' => 'Estimasi anggaran melebihi alokasi MAK semester ini. Harap disesuaikan.',
            'actor_id' => $bidang2->id,
        ]);

        $this->assertDatabaseHas('status_history', [
            'ref_type' => 'permohonan',
            'ref_id' => $permohonan->id,
            'status_lama' => 'menunggu_bidang2',
            'status_baru' => 'ditolak',
            'actor_id' => $bidang2->id,
        ]);
    }

    public function test_bidang2_rejection_requires_valid_alasan(): void
    {
        $bidang2 = $this->getBidang2User();
        $permohonan = $this->createSamplePermohonan();

        $response = $this->actingAs($bidang2, 'sanctum')->postJson("/api/v1/bidang-2/pengajuan/{$permohonan->id}/reject", [
            'alasan' => '',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['alasan']);
    }

    public function test_bidang2_can_download_approved_memo(): void
    {
        $bidang2 = $this->getBidang2User();
        $permohonan = $this->createSamplePermohonan();

        $fileMemo = UploadedFile::fake()->create('Memo_Persetujuan_111-FFF-111.pdf', 1024, 'application/pdf');
        $this->actingAs($bidang2, 'sanctum')->post("/api/v1/bidang-2/pengajuan/{$permohonan->id}/approve", [
            'file_memo' => $fileMemo,
        ], ['Accept' => 'application/json'])->assertStatus(200);

        $downloadResponse = $this->actingAs($bidang2, 'sanctum')->get("/api/v1/bidang-2/pengajuan/{$permohonan->id}/memo");
        $downloadResponse->assertStatus(200);
        $this->assertEquals('application/pdf', $downloadResponse->headers->get('content-type'));
    }
}
