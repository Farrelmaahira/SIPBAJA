<?php

namespace Tests\Feature;

use App\Models\JenisPengadaan;
use App\Models\Mak;
use App\Models\MetodePengadaan;
use App\Models\Pengadaan;
use App\Models\Permohonan;
use App\Models\PermohonanMak;
use App\Models\Unit;
use App\Models\User;
use Database\Seeders\MasterReferenceSeeder;
use Database\Seeders\PpbjDummySeeder;
use Database\Seeders\RbacSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PermohonanApiTest extends TestCase
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
            PpbjDummySeeder::class,
        ]);
    }

    private function user(string $email): User
    {
        return User::where('email', $email)->firstOrFail();
    }

    public function test_pemohon_can_list_permohonan(): void
    {
        $pemohon = $this->user('jurusan@pnj.ac.id');

        $response = $this->actingAs($pemohon, 'sanctum')->getJson('/api/v1/pemohon/permohonan');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'permohonanList',
                'filters',
            ]);
    }

    public function test_pemohon_can_store_permohonan_with_attachment(): void
    {
        Storage::fake('local');
        $pemohon = $this->user('jurusan@pnj.ac.id');
        $file = UploadedFile::fake()->create('surat_permohonan.pdf', 300, 'application/pdf');

        $response = $this->actingAs($pemohon, 'sanctum')->postJson('/api/v1/pemohon/permohonan', [
            'judul' => 'Pengadaan Laptop Laboratorium Baru',
            'estimasi_anggaran' => 45000000,
            'nomor_surat' => 'SRT/TI/2026/099',
            'ringkasan_tujuan' => 'Kebutuhan praktikum mahasiswa TI',
            'file_dokumen' => $file,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'permohonan',
            ]);

        $this->assertDatabaseHas('permohonan', [
            'judul' => 'Pengadaan Laptop Laboratorium Baru',
            'created_by' => $pemohon->id,
        ]);
    }

    public function test_pemohon_can_download_permohonan_dokumen(): void
    {
        Storage::fake('local');
        $pemohon = $this->user('jurusan@pnj.ac.id');
        $file = UploadedFile::fake()->create('dokumen_test.pdf', 200, 'application/pdf');

        $storeRes = $this->actingAs($pemohon, 'sanctum')->postJson('/api/v1/pemohon/permohonan', [
            'judul' => 'Pengadaan Server Cloud',
            'estimasi_anggaran' => 20000000,
            'file_dokumen' => $file,
        ]);
        $storeRes->assertStatus(201);
        $permohonanId = $storeRes->json('permohonan.id');

        $downloadRes = $this->actingAs($pemohon, 'sanctum')->get("/api/v1/pemohon/permohonan/{$permohonanId}/dokumen");
        $downloadRes->assertStatus(200);
    }

    public function test_perencanaan_can_list_and_view_pengajuan(): void
    {
        $perencanaan = $this->user('perencanaan@pnj.ac.id');
        $permohonan = Permohonan::firstOrFail();

        $listRes = $this->actingAs($perencanaan, 'sanctum')->getJson('/api/v1/perencanaan/pengajuan');
        $listRes->assertStatus(200)->assertJsonStructure(['permohonan', 'filters']);

        $showRes = $this->actingAs($perencanaan, 'sanctum')->getJson("/api/v1/perencanaan/pengajuan/{$permohonan->id}");
        $showRes->assertStatus(200)->assertJsonStructure(['detail']);
    }

    public function test_perencanaan_can_approve_and_reject_pengajuan(): void
    {
        $perencanaan = $this->user('perencanaan@pnj.ac.id');
        $pemohon = $this->user('jurusan@pnj.ac.id');
        $unit = Unit::firstOrCreate(['nama' => 'Teknik Elektro']);

        // Create fresh permohonan for approve
        $p1 = Permohonan::create([
            'unit_id' => $unit->id,
            'created_by' => $pemohon->id,
            'nomor_surat' => 'APP-001',
            'judul' => 'Permohonan Siap Approve',
            'estimasi_anggaran' => 10000000,
            'ringkasan_tujuan' => 'Tujuan pengadaan lab',
            'status' => 'diajukan',
        ]);
        $mak = Mak::firstOrFail();

        $approveRes = $this->actingAs($perencanaan, 'sanctum')->postJson("/api/v1/perencanaan/pengajuan/{$p1->id}/approve", [
            'mak_ids' => [$mak->id],
        ]);
        $approveRes->assertStatus(200)->assertJsonStructure(['message']);

        // Create fresh permohonan for reject
        $p2 = Permohonan::create([
            'unit_id' => $unit->id,
            'created_by' => $pemohon->id,
            'nomor_surat' => 'REJ-001',
            'judul' => 'Permohonan Siap Reject',
            'estimasi_anggaran' => 10000000,
            'ringkasan_tujuan' => 'Tujuan pengadaan lab 2',
            'status' => 'diajukan',
        ]);

        $rejectRes = $this->actingAs($perencanaan, 'sanctum')->postJson("/api/v1/perencanaan/pengajuan/{$p2->id}/reject", [
            'alasan' => 'Anggaran tidak mencukupi untuk tahun berjalan.',
        ]);
        $rejectRes->assertStatus(200)->assertJsonStructure(['message']);
    }

    public function test_bidang_2_can_list_pengajuan_and_rkakl(): void
    {
        $bidang2 = $this->user('bidang2@pnj.ac.id');

        $res1 = $this->actingAs($bidang2, 'sanctum')->getJson('/api/v1/bidang-2/pengajuan');
        $res1->assertStatus(200)->assertJsonStructure(['permohonanList', 'filters']);

        $res2 = $this->actingAs($bidang2, 'sanctum')->getJson('/api/v1/bidang-2/rkakl');
        $res2->assertStatus(200);
    }

    public function test_ppbj_can_list_and_view_and_manage_draft(): void
    {
        $ppbj = $this->user('ppbj@pnj.ac.id');
        $permohonan = Permohonan::where('nomor_surat', 'PRM-PPBJ-001')->firstOrFail();

        $listRes = $this->actingAs($ppbj, 'sanctum')->getJson('/api/v1/ppbj/permohonan');
        $listRes->assertStatus(200)->assertJsonStructure(['permohonanList']);

        $showRes = $this->actingAs($ppbj, 'sanctum')->getJson("/api/v1/ppbj/permohonan/{$permohonan->id}");
        $showRes->assertStatus(200)->assertJsonStructure(['permohonan']);

        $pmak = PermohonanMak::where('permohonan_id', $permohonan->id)->firstOrFail();
        $jenis = JenisPengadaan::firstOrFail();
        $metode = MetodePengadaan::firstOrFail();

        $draftRes = $this->actingAs($ppbj, 'sanctum')->postJson("/api/v1/ppbj/permohonan/{$permohonan->id}/pengadaan/draft", [
            'items' => [
                [
                    'permohonan_mak_id' => $pmak->id,
                    'jenis_id' => $jenis->id,
                    'metode_id' => $metode->id,
                    'nominal' => 5000000,
                ],
            ],
        ]);
        $draftRes->assertStatus(201)->assertJsonStructure(['message']);

        $createdPengadaan = Pengadaan::where('permohonan_id', $permohonan->id)->where('status', 'draft')->latest()->firstOrFail();

        $deleteRes = $this->actingAs($ppbj, 'sanctum')->deleteJson("/api/v1/ppbj/pengadaan/{$createdPengadaan->id}");
        $deleteRes->assertStatus(204);
    }

    public function test_pp_can_list_pengajuan_and_notifikasi(): void
    {
        $pp = $this->user('pp@pnj.ac.id');

        $res1 = $this->actingAs($pp, 'sanctum')->getJson('/api/v1/pp/pengajuan');
        $res1->assertStatus(200)->assertJsonStructure(['pengajuan', 'filters']);

        $res2 = $this->actingAs($pp, 'sanctum')->getJson('/api/v1/pp/notifikasi');
        $res2->assertStatus(200)->assertJsonStructure(['notifications', 'unreadCount']);

        $res3 = $this->actingAs($pp, 'sanctum')->getJson('/api/v1/pp/profil');
        $res3->assertStatus(200)->assertJsonStructure(['user']);
    }

    public function test_ppk_can_list_pengajuan_and_notifikasi(): void
    {
        $ppk = $this->user('ppk@pnj.ac.id');

        $res1 = $this->actingAs($ppk, 'sanctum')->getJson('/api/v1/ppk/pengajuan');
        $res1->assertStatus(200)->assertJsonStructure(['pengajuan', 'filters']);

        $res2 = $this->actingAs($ppk, 'sanctum')->getJson('/api/v1/ppk/notifikasi');
        $res2->assertStatus(200)->assertJsonStructure(['notifications', 'unreadCount']);

        $res3 = $this->actingAs($ppk, 'sanctum')->getJson('/api/v1/ppk/profil');
        $res3->assertStatus(200)->assertJsonStructure(['user']);
    }
}
