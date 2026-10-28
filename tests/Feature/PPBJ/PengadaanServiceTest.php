<?php

namespace Tests\Feature\PPBJ;

use App\Models\ApprovalPermohonan;
use App\Models\JenisPengadaan;
use App\Models\LevelPengadaan;
use App\Models\MetodePengadaan;
use App\Models\Pengadaan;
use App\Models\Permohonan;
use App\Models\User;
use App\Services\PengadaanService;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\PpbjDummySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class PengadaanServiceTest extends TestCase
{
    use RefreshDatabase;

    protected PengadaanService $pengadaanService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(DatabaseSeeder::class);
        $this->seed(PpbjDummySeeder::class);

        $this->pengadaanService = app(PengadaanService::class);
    }

    public function test_get_split_context_returns_valid_shape_for_eligible_permohonan(): void
    {
        $permohonan = Permohonan::where('nomor_surat', 'PRM-PPBJ-001')->firstOrFail();

        $context = $this->pengadaanService->getSplitContext((int) $permohonan->id);

        $this->assertTrue($context['bisaDipecah']);
        $this->assertFalse($context['sudahDikunci']);
        $this->assertEquals(180000000.0, $context['sisaAnggaran']);
        $this->assertEquals(0.0, $context['totalNominalPaket']);

        $this->assertIsArray($context['availableMak']);
        $this->assertNotEmpty($context['availableMak']);
        $this->assertArrayHasKey('id', $context['availableMak'][0]);
        $this->assertArrayHasKey('permohonan_mak_id', $context['availableMak'][0]);
        $this->assertArrayHasKey('nama', $context['availableMak'][0]);
        $this->assertArrayHasKey('ppk_id', $context['availableMak'][0]);
        $this->assertArrayHasKey('ppk_nama', $context['availableMak'][0]);

        $this->assertArrayHasKey('jenis', $context['referenceData']);
        $this->assertArrayHasKey('metode', $context['referenceData']);
        $this->assertArrayHasKey('level', $context['referenceData']);
        $this->assertNotEmpty($context['referenceData']['jenis']);
        $this->assertNotEmpty($context['referenceData']['metode']);
        $this->assertNotEmpty($context['referenceData']['level']);
    }

    public function test_permohonan_belum_disetujui_kedua_pihak_tidak_bisa_dipecah(): void
    {
        $permohonan = Permohonan::where('nomor_surat', 'PRM-PPBJ-001')->firstOrFail();

        ApprovalPermohonan::where('permohonan_id', $permohonan->id)
            ->where('tahap', 'BIDANG2')
            ->delete();

        $context = $this->pengadaanService->getSplitContext((int) $permohonan->id);

        $this->assertFalse($context['bisaDipecah']);
    }

    public function test_permohonan_dengan_paket_non_draft_berstatus_terkunci(): void
    {
        $permohonan = Permohonan::where('nomor_surat', 'PRM-PPBJ-002')->firstOrFail();

        $context = $this->pengadaanService->getSplitContext((int) $permohonan->id);

        $this->assertTrue($context['sudahDikunci']);
    }

    public function test_simpan_draft_pengadaan_berhasil_membuat_paket_draft(): void
    {
        $permohonan = Permohonan::where('nomor_surat', 'PRM-PPBJ-001')->firstOrFail();
        $ppbj = User::where('email', 'ppbj@pnj.ac.id')->firstOrFail();
        $pm = $permohonan->PermohonanMak->firstOrFail();
        $jenis = JenisPengadaan::firstOrFail();
        $metode = MetodePengadaan::firstOrFail();

        $items = [
            [
                'permohonan_mak_id' => $pm->id,
                'jenis_id' => $jenis->id,
                'metode_id' => $metode->id,
                'nominal' => 45000000.0, // <50jt, level_id null => auto calculate
            ],
            [
                'permohonan_mak_id' => $pm->id,
                'jenis_id' => $jenis->id,
                'metode_id' => $metode->id,
                'nominal' => 120000000.0, // 50-200jt, level_id null => auto calculate
            ],
        ];

        $result = $this->pengadaanService->simpanDraftPengadaan((int) $permohonan->id, $items, $ppbj);

        $this->assertCount(2, $result);
        $this->assertDatabaseHas('pengadaan', [
            'id' => $result[0]->id,
            'permohonan_id' => $permohonan->id,
            'status' => 'draft',
            'nominal' => 45000000.0,
            'ppk_id' => $pm->Mak->ppk_user_id,
        ]);
        $this->assertEquals('<50jt', $result[0]->fresh()->Level->nama);
        $this->assertEquals('50-200jt', $result[1]->fresh()->Level->nama);
    }

    public function test_simpan_draft_pengadaan_menolak_jika_total_nominal_melebihi_estimasi_anggaran(): void
    {
        $this->expectException(ValidationException::class);

        $permohonan = Permohonan::where('nomor_surat', 'PRM-PPBJ-001')->firstOrFail(); // estimasi: 180jt
        $ppbj = User::where('email', 'ppbj@pnj.ac.id')->firstOrFail();
        $pm = $permohonan->PermohonanMak->firstOrFail();
        $jenis = JenisPengadaan::firstOrFail();
        $metode = MetodePengadaan::firstOrFail();

        $items = [
            [
                'permohonan_mak_id' => $pm->id,
                'jenis_id' => $jenis->id,
                'metode_id' => $metode->id,
                'nominal' => 200000000.0, // 200jt > 180jt
            ],
        ];

        $this->pengadaanService->simpanDraftPengadaan((int) $permohonan->id, $items, $ppbj);
    }

    public function test_simpan_draft_pengadaan_mengizinkan_override_level_pengadaan(): void
    {
        $permohonan = Permohonan::where('nomor_surat', 'PRM-PPBJ-001')->firstOrFail();
        $ppbj = User::where('email', 'ppbj@pnj.ac.id')->firstOrFail();
        $pm = $permohonan->PermohonanMak->firstOrFail();
        $jenis = JenisPengadaan::firstOrFail();
        $metode = MetodePengadaan::firstOrFail();
        $levelHigh = LevelPengadaan::where('nama', '>200jt')->firstOrFail();

        $items = [
            [
                'permohonan_mak_id' => $pm->id,
                'jenis_id' => $jenis->id,
                'metode_id' => $metode->id,
                'nominal' => 40000000.0, // secara normal <50jt
                'level_id' => $levelHigh->id, // override jadi >200jt
            ],
        ];

        $result = $this->pengadaanService->simpanDraftPengadaan((int) $permohonan->id, $items, $ppbj);

        $this->assertEquals($levelHigh->id, $result[0]->fresh()->level_id);
    }

    public function test_simpan_draft_pengadaan_menyimpan_file_dokumen_ke_tabel_dokumen(): void
    {
        Storage::fake('public');

        $permohonan = Permohonan::where('nomor_surat', 'PRM-PPBJ-001')->firstOrFail();
        $ppbj = User::where('email', 'ppbj@pnj.ac.id')->firstOrFail();
        $pm = $permohonan->PermohonanMak->firstOrFail();
        $jenis = JenisPengadaan::firstOrFail();
        $metode = MetodePengadaan::firstOrFail();

        $dummyFile = UploadedFile::fake()->create('surat_pengadaan.pdf', 500, 'application/pdf');

        $items = [
            [
                'permohonan_mak_id' => $pm->id,
                'jenis_id' => $jenis->id,
                'metode_id' => $metode->id,
                'nominal' => 50000000.0,
                'dokumen' => $dummyFile,
            ],
        ];

        $result = $this->pengadaanService->simpanDraftPengadaan((int) $permohonan->id, $items, $ppbj);

        $this->assertDatabaseHas('dokumen', [
            'ref_type' => 'pengadaan',
            'ref_id' => $result[0]->id,
            'tipe_dokumen' => 'dokumen_pengadaan',
            'nama_asli' => 'surat_pengadaan.pdf',
            'uploaded_by' => $ppbj->id,
        ]);
    }

    public function test_hapus_draft_pengadaan_berhasil_menghapus_paket_dan_dokumen(): void
    {
        Storage::fake('public');

        $permohonan = Permohonan::where('nomor_surat', 'PRM-PPBJ-001')->firstOrFail();
        $ppbj = User::where('email', 'ppbj@pnj.ac.id')->firstOrFail();
        $pm = $permohonan->PermohonanMak->firstOrFail();
        $jenis = JenisPengadaan::firstOrFail();
        $metode = MetodePengadaan::firstOrFail();
        $dummyFile = UploadedFile::fake()->create('surat.pdf', 100, 'application/pdf');

        $result = $this->pengadaanService->simpanDraftPengadaan((int) $permohonan->id, [
            [
                'permohonan_mak_id' => $pm->id,
                'jenis_id' => $jenis->id,
                'metode_id' => $metode->id,
                'nominal' => 30000000.0,
                'dokumen' => $dummyFile,
            ],
        ], $ppbj);

        $pengadaanId = $result[0]->id;

        $this->pengadaanService->hapusDraftPengadaan($pengadaanId, $ppbj);

        $this->assertDatabaseMissing('pengadaan', ['id' => $pengadaanId]);
        $this->assertDatabaseMissing('dokumen', ['ref_type' => 'pengadaan', 'ref_id' => $pengadaanId]);
    }

    public function test_hapus_draft_pengadaan_gagal_jika_status_bukan_draft(): void
    {
        $this->expectException(ValidationException::class);

        $pengadaanNonDraft = Pengadaan::where('status', '!=', 'draft')->firstOrFail();
        $ppbj = User::where('email', 'ppbj@pnj.ac.id')->firstOrFail();

        $this->pengadaanService->hapusDraftPengadaan($pengadaanNonDraft->id, $ppbj);
    }

    public function test_submit_ke_reviewer_gagal_jika_ada_paket_tanpa_dokumen(): void
    {
        $this->expectException(ValidationException::class);

        $permohonan = Permohonan::where('nomor_surat', 'PRM-PPBJ-001')->firstOrFail();
        $ppbj = User::where('email', 'ppbj@pnj.ac.id')->firstOrFail();
        $pm = $permohonan->PermohonanMak->firstOrFail();
        $jenis = JenisPengadaan::firstOrFail();
        $metode = MetodePengadaan::firstOrFail();

        // Buat paket draft tanpa dokumen
        $this->pengadaanService->simpanDraftPengadaan((int) $permohonan->id, [
            [
                'permohonan_mak_id' => $pm->id,
                'jenis_id' => $jenis->id,
                'metode_id' => $metode->id,
                'nominal' => 30000000.0,
            ],
        ], $ppbj);

        $this->pengadaanService->submitKeReviewer((int) $permohonan->id, $ppbj);
    }

    public function test_submit_ke_reviewer_berhasil_dan_mengunci_permohonan(): void
    {
        Storage::fake('public');

        $permohonan = Permohonan::where('nomor_surat', 'PRM-PPBJ-001')->firstOrFail();
        $ppbj = User::where('email', 'ppbj@pnj.ac.id')->firstOrFail();
        $pm = $permohonan->PermohonanMak->firstOrFail();
        $jenis = JenisPengadaan::firstOrFail();
        $metode = MetodePengadaan::firstOrFail();

        // Buat paket draft dengan dokumen lengkap
        $result = $this->pengadaanService->simpanDraftPengadaan((int) $permohonan->id, [
            [
                'permohonan_mak_id' => $pm->id,
                'jenis_id' => $jenis->id,
                'metode_id' => $metode->id,
                'nominal' => 50000000.0,
                'dokumen' => UploadedFile::fake()->create('dokumen1.pdf', 200, 'application/pdf'),
            ],
        ], $ppbj);

        $this->pengadaanService->submitKeReviewer((int) $permohonan->id, $ppbj);

        // Status berubah jadi menunggu_review
        $this->assertEquals('menunggu_review', $result[0]->fresh()->status);

        // Context menunjukkan sudah terkunci (Revisi Q7)
        $context = $this->pengadaanService->getSplitContext((int) $permohonan->id);
        $this->assertTrue($context['sudahDikunci']);

        // Mencoba tambah draft baru setelah dikunci harus ditolak
        $this->expectException(ValidationException::class);
        $this->pengadaanService->simpanDraftPengadaan((int) $permohonan->id, [
            [
                'permohonan_mak_id' => $pm->id,
                'jenis_id' => $jenis->id,
                'metode_id' => $metode->id,
                'nominal' => 10000000.0,
            ],
        ], $ppbj);
    }
}
