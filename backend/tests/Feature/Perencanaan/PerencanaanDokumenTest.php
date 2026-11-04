<?php

namespace Tests\Feature\Perencanaan;

use App\Models\Dokumen;
use App\Models\Permohonan;
use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PerencanaanDokumenTest extends TestCase
{
    use RefreshDatabase;

    public function test_perencanaan_can_download_specific_document_by_id(): void
    {
        Storage::fake('local');
        $role = Role::create(['nama' => 'Perencanaan']);
        $user = User::factory()->create(['role_id' => $role->id]);
        $unit = Unit::create(['nama' => 'Teknik Informatika']);

        $permohonan = Permohonan::create([
            'unit_id' => $unit->id,
            'created_by' => $user->id,
            'nomor_surat' => '001/TI/2026',
            'judul' => 'Pengadaan Server',
            'ringkasan_tujuan' => 'Server lab',
            'estimasi_anggaran' => 100000000,
            'status' => 'diajukan',
        ]);

        $file1 = UploadedFile::fake()->create('surat_permohonan.pdf', 100, 'application/pdf');
        $path1 = $file1->store('dokumen/permohonan', 'local');
        $doc1 = Dokumen::create([
            'ref_type' => 'permohonan',
            'ref_id' => $permohonan->id,
            'tipe_dokumen' => 'surat_permohonan',
            'versi' => 1,
            'nama_asli' => 'surat_permohonan.pdf',
            'nama_hash' => basename($path1),
            'mime_type' => 'application/pdf',
            'ukuran_bytes' => 102400,
            'uploaded_by' => $user->id,
        ]);

        $file2 = UploadedFile::fake()->create('lampiran_spek.pdf', 50, 'application/pdf');
        $path2 = $file2->store('dokumen/permohonan', 'local');
        $doc2 = Dokumen::create([
            'ref_type' => 'permohonan',
            'ref_id' => $permohonan->id,
            'tipe_dokumen' => 'lampiran',
            'versi' => 1,
            'nama_asli' => 'lampiran_spek.pdf',
            'nama_hash' => basename($path2),
            'mime_type' => 'application/pdf',
            'ukuran_bytes' => 51200,
            'uploaded_by' => $user->id,
        ]);

        $response = $this->actingAs($user)->get("/api/v1/perencanaan/pengajuan/{$permohonan->id}/dokumen?dokumen_id={$doc2->id}");
        $response->assertOk();
        $this->assertStringContainsString('lampiran_spek.pdf', (string) $response->headers->get('content-disposition'));

        $detailResponse = $this->actingAs($user)->getJson("/api/v1/perencanaan/pengajuan/{$permohonan->id}");
        $detailResponse->assertOk();
        $detailResponse->assertJsonPath('detail.dokumen_permohonan.1.download_url', "/api/v1/perencanaan/pengajuan/{$permohonan->id}/dokumen?dokumen_id={$doc2->id}");
    }

    public function test_perencanaan_can_upload_rkakl_file_with_uuid_hash(): void
    {
        Storage::fake('local');
        $role = Role::create(['nama' => 'Perencanaan']);
        $user = User::factory()->create(['role_id' => $role->id]);

        $file = UploadedFile::fake()->create('RKAKL_2026_Final.pdf', 200, 'application/pdf');

        $response = $this->actingAs($user)->post('/api/v1/perencanaan/rkakl', [
            'file' => $file,
        ]);

        $response->assertOk();
        $latestDoc = Dokumen::where('ref_type', 'rkakl')->orderByDesc('versi')->first();

        $this->assertNotNull($latestDoc);
        $this->assertEquals('RKAKL_2026_Final.pdf', $latestDoc->nama_asli);
        $this->assertStringNotContainsString('dokumen/', $latestDoc->nama_hash);
        $this->assertMatchesRegularExpression('/^[a-f0-9\-]+\.pdf$/i', $latestDoc->nama_hash);
        Storage::disk('local')->assertExists('dokumen/rkakl/'.$latestDoc->nama_hash);

        // Download check
        $dlResponse = $this->actingAs($user)->get('/api/v1/perencanaan/rkakl/dokumen/'.$latestDoc->id);
        $dlResponse->assertOk();
        $this->assertStringContainsString('RKAKL_2026_Final.pdf', (string) $dlResponse->headers->get('content-disposition'));
    }

    public function test_ambil_dokumen_rkakl_generates_authentic_rkakl_pdf_without_copying_permohonan(): void
    {
        Storage::fake('local');
        $role = Role::create(['nama' => 'Perencanaan']);
        $user = User::factory()->create(['role_id' => $role->id]);

        // Put a permohonan file in local disk
        Storage::disk('local')->put('dokumen/permohonan/sample_permohonan.pdf', 'SURAT_PERMOHONAN_CONTENT');

        $response = $this->actingAs($user)->get('/api/v1/perencanaan/rkakl/dokumen');
        $response->assertOk();

        // The content streamed MUST be authentic RKAKL PDF, NOT the permohonan content!
        $content = $response->streamedContent();
        $this->assertStringNotContainsString('SURAT_PERMOHONAN_CONTENT', $content);
        $this->assertStringContainsString('POLITEKNIK NEGERI JAKARTA', $content);
        $this->assertStringContainsString('RKA-K/L', $content);
    }
}
