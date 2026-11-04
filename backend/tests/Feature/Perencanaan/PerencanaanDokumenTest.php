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
}
