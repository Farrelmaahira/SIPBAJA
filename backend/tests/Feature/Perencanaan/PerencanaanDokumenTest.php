<?php

namespace Tests\Feature\Perencanaan;

use App\Models\Dokumen;
use App\Models\Permohonan;
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

class PerencanaanDokumenTest extends TestCase
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

    public function test_perencanaan_can_get_permohonan_with_dokumen_metadata(): void
    {
        Storage::fake('local');
        $perencana = User::where('email', 'perencanaan@pnj.ac.id')->firstOrFail();
        $pemohon = User::where('email', 'jurusan@pnj.ac.id')->firstOrFail();
        $unit = Unit::firstOrCreate(['nama' => 'Teknik Komputer']);

        $permohonan = Permohonan::create([
            'unit_id' => $unit->id,
            'created_by' => $pemohon->id,
            'nomor_surat' => 'PRM/TEST/001',
            'judul' => 'Pengadaan Server',
            'ringkasan_tujuan' => 'Server lab',
            'estimasi_anggaran' => 50000000,
            'revisi_ke' => 0,
            'status' => 'diajukan',
            'created_at' => now(),
        ]);

        $file = UploadedFile::fake()->create('surat_permohonan.pdf', 1024, 'application/pdf');
        $namaHash = 'test-hash-dokumen.pdf';
        Storage::disk('local')->putFileAs('dokumen/permohonan', $file, $namaHash);

        Dokumen::create([
            'ref_type' => 'permohonan',
            'ref_id' => $permohonan->id,
            'tipe_dokumen' => 'surat_permohonan',
            'versi' => 1,
            'nama_asli' => 'surat_permohonan.pdf',
            'nama_hash' => $namaHash,
            'mime_type' => 'application/pdf',
            'ukuran_bytes' => 1024 * 1024,
            'uploaded_by' => $pemohon->id,
        ]);

        $res = $this->actingAs($perencana, 'sanctum')->getJson("/api/v1/perencanaan/pengajuan/{$permohonan->id}");

        $res->assertStatus(200);
        $res->assertJsonPath('detail.dokumen.nama_asli', 'surat_permohonan.pdf');
        $res->assertJsonPath('detail.dokumen.download_url', "/api/v1/perencanaan/pengajuan/{$permohonan->id}/dokumen");

        // Test inline stream untuk tab baru
        $inlineRes = $this->actingAs($perencana, 'sanctum')
            ->get("/api/v1/perencanaan/pengajuan/{$permohonan->id}/dokumen?disposition=inline");
        $inlineRes->assertStatus(200);
        $this->assertStringContainsString('inline', $inlineRes->headers->get('Content-Disposition'));
        $this->assertStringContainsString('surat_permohonan.pdf', $inlineRes->headers->get('Content-Disposition'));

        // Test download attachment
        $downloadRes = $this->actingAs($perencana, 'sanctum')
            ->get("/api/v1/perencanaan/pengajuan/{$permohonan->id}/dokumen");
        $downloadRes->assertStatus(200);
        $this->assertStringContainsString('attachment', $downloadRes->headers->get('Content-Disposition'));
        $this->assertStringContainsString('surat_permohonan.pdf', $downloadRes->headers->get('Content-Disposition'));
    }
}
