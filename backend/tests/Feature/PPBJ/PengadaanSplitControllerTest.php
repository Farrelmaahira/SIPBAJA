<?php

namespace Tests\Feature\PPBJ;

use App\Models\Dokumen;
use App\Models\JenisPengadaan;
use App\Models\MetodePengadaan;
use App\Models\Pengadaan;
use App\Models\Permohonan;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\PpbjDummySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PengadaanSplitControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(DatabaseSeeder::class);
        $this->seed(PpbjDummySeeder::class);
    }

    public function test_guest_diredirect_ke_login(): void
    {
        $permohonan = Permohonan::where('nomor_surat', 'PRM-PPBJ-001')->firstOrFail();

        $response = $this->post(route('ppbj.permohonan.pengadaan.draft', $permohonan->id), []);
        $response->assertRedirect(route('login'));

        $response = $this->delete(route('ppbj.pengadaan.destroy', 1));
        $response->assertRedirect(route('login'));

        $response = $this->post(route('ppbj.permohonan.pengadaan.submit', $permohonan->id));
        $response->assertRedirect(route('login'));
    }

    public function test_non_ppbj_dilarang_mengakses_endpoint(): void
    {
        $pemohon = User::where('email', 'jurusan@pnj.ac.id')->firstOrFail();
        $permohonan = Permohonan::where('nomor_surat', 'PRM-PPBJ-001')->firstOrFail();

        $response = $this->actingAs($pemohon)->post(route('ppbj.permohonan.pengadaan.draft', $permohonan->id), []);
        $response->assertForbidden();

        $response = $this->actingAs($pemohon)->delete(route('ppbj.pengadaan.destroy', 1));
        $response->assertForbidden();

        $response = $this->actingAs($pemohon)->post(route('ppbj.permohonan.pengadaan.submit', $permohonan->id));
        $response->assertForbidden();
    }

    public function test_ppbj_dapat_menyimpan_draft_paket_pengadaan(): void
    {
        Storage::fake('public');

        $ppbj = User::where('email', 'ppbj@pnj.ac.id')->firstOrFail();
        $permohonan = Permohonan::where('nomor_surat', 'PRM-PPBJ-001')->firstOrFail();
        $pm = $permohonan->PermohonanMak->firstOrFail();
        $jenis = JenisPengadaan::firstOrFail();
        $metode = MetodePengadaan::firstOrFail();

        $payload = [
            'items' => [
                [
                    'permohonan_mak_id' => $pm->id,
                    'jenis_id' => $jenis->id,
                    'metode_id' => $metode->id,
                    'nominal' => 40000000,
                    'dokumen' => UploadedFile::fake()->create('surat1.pdf', 300, 'application/pdf'),
                ],
            ],
        ];

        $response = $this->actingAs($ppbj)->post(
            route('ppbj.permohonan.pengadaan.draft', $permohonan->id),
            $payload
        );

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('pengadaan', [
            'permohonan_id' => $permohonan->id,
            'nominal' => 40000000,
            'status' => 'draft',
        ]);
    }

    public function test_ppbj_dapat_menghapus_draft_paket_pengadaan(): void
    {
        $ppbj = User::where('email', 'ppbj@pnj.ac.id')->firstOrFail();
        $permohonan = Permohonan::where('nomor_surat', 'PRM-PPBJ-001')->firstOrFail();
        $pm = $permohonan->PermohonanMak->firstOrFail();
        $jenis = JenisPengadaan::firstOrFail();
        $metode = MetodePengadaan::firstOrFail();

        $pengadaan = Pengadaan::create([
            'permohonan_id' => $permohonan->id,
            'permohonan_mak_id' => $pm->id,
            'jenis_id' => $jenis->id,
            'metode_id' => $metode->id,
            'level_id' => 1,
            'nominal' => 20000000,
            'status' => 'draft',
            'revisi_ke' => 0,
        ]);

        $response = $this->actingAs($ppbj)->delete(route('ppbj.pengadaan.destroy', $pengadaan->id));

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('pengadaan', ['id' => $pengadaan->id]);
    }

    public function test_ppbj_dapat_submit_ke_reviewer(): void
    {
        Storage::fake('public');

        $ppbj = User::where('email', 'ppbj@pnj.ac.id')->firstOrFail();
        $permohonan = Permohonan::where('nomor_surat', 'PRM-PPBJ-001')->firstOrFail();
        $pm = $permohonan->PermohonanMak->firstOrFail();
        $jenis = JenisPengadaan::firstOrFail();
        $metode = MetodePengadaan::firstOrFail();

        $pengadaan = Pengadaan::create([
            'permohonan_id' => $permohonan->id,
            'permohonan_mak_id' => $pm->id,
            'jenis_id' => $jenis->id,
            'metode_id' => $metode->id,
            'level_id' => 1,
            'nominal' => 25000000,
            'status' => 'draft',
            'revisi_ke' => 0,
        ]);

        Dokumen::create([
            'ref_type' => 'pengadaan',
            'ref_id' => $pengadaan->id,
            'tipe_dokumen' => 'dokumen_pengadaan',
            'versi' => 1,
            'nama_asli' => 'surat.pdf',
            'nama_hash' => 'hash.pdf',
            'mime_type' => 'application/pdf',
            'ukuran_bytes' => 1024,
            'uploaded_by' => $ppbj->id,
        ]);

        $response = $this->actingAs($ppbj)->post(route('ppbj.permohonan.pengadaan.submit', $permohonan->id));

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertEquals('menunggu_review', $pengadaan->fresh()->status);
    }
}
