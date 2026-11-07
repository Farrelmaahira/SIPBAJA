<?php

namespace Tests\Feature\Pemohon;

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

class PermohonanRevisiTest extends TestCase
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

    private function getPemohonUser(): User
    {
        return User::where('email', 'jurusan@pnj.ac.id')->firstOrFail();
    }

    public function test_guest_cannot_access_revisi_endpoint(): void
    {
        $response = $this->postJson('/api/v1/pemohon/permohonan/1/revisi', [
            'judul' => 'Revisi Judul',
            'estimasi_anggaran' => 15000000,
        ]);

        $response->assertStatus(401);
    }

    public function test_pemohon_cannot_revise_other_unit_permohonan(): void
    {
        $pemohon = $this->getPemohonUser();
        $otherUnit = Unit::create(['nama' => 'Unit Lain']);

        $permohonan = Permohonan::create([
            'unit_id' => $otherUnit->id,
            'created_by' => $pemohon->id,
            'nomor_surat' => '01014-FF-11',
            'judul' => 'Pengadaan Printer Laboratorium',
            'ringkasan_tujuan' => 'Kebutuhan cetak lab',
            'estimasi_anggaran' => 27800000,
            'revisi_ke' => 0,
            'status' => 'ditolak',
            'created_at' => now(),
        ]);

        $response = $this->actingAs($pemohon, 'sanctum')->postJson("/api/v1/pemohon/permohonan/{$permohonan->id}/revisi", [
            'judul' => 'Pengadaan Printer Laboratorium Revisi',
            'estimasi_anggaran' => 25000000,
        ]);

        $response->assertStatus(403);
    }

    public function test_cannot_revise_permohonan_if_status_not_ditolak(): void
    {
        $pemohon = $this->getPemohonUser();

        $permohonan = Permohonan::create([
            'unit_id' => $pemohon->unit_id,
            'created_by' => $pemohon->id,
            'nomor_surat' => '01014-FF-11',
            'judul' => 'Pengadaan Printer Laboratorium',
            'ringkasan_tujuan' => 'Kebutuhan cetak lab',
            'estimasi_anggaran' => 27800000,
            'revisi_ke' => 0,
            'status' => 'diajukan',
            'created_at' => now(),
        ]);

        $response = $this->actingAs($pemohon, 'sanctum')->postJson("/api/v1/pemohon/permohonan/{$permohonan->id}/revisi", [
            'judul' => 'Pengadaan Printer Laboratorium Revisi',
            'estimasi_anggaran' => 25000000,
        ]);

        $response->assertStatus(422);
    }

    public function test_revisi_validation_requires_valid_data(): void
    {
        $pemohon = $this->getPemohonUser();

        $permohonan = Permohonan::create([
            'unit_id' => $pemohon->unit_id,
            'created_by' => $pemohon->id,
            'nomor_surat' => '01014-FF-11',
            'judul' => 'Pengadaan Printer Laboratorium',
            'ringkasan_tujuan' => 'Kebutuhan cetak lab',
            'estimasi_anggaran' => 27800000,
            'revisi_ke' => 0,
            'status' => 'ditolak',
            'created_at' => now(),
        ]);

        $response = $this->actingAs($pemohon, 'sanctum')->postJson("/api/v1/pemohon/permohonan/{$permohonan->id}/revisi", [
            'judul' => '',
            'estimasi_anggaran' => 0,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['judul', 'estimasi_anggaran']);
    }

    public function test_pemohon_can_revise_retaining_existing_file(): void
    {
        $pemohon = $this->getPemohonUser();

        $permohonan = Permohonan::create([
            'unit_id' => $pemohon->unit_id,
            'created_by' => $pemohon->id,
            'nomor_surat' => '01014-FF-11',
            'judul' => 'Pengadaan Printer Laboratorium',
            'ringkasan_tujuan' => 'Kebutuhan cetak lab',
            'estimasi_anggaran' => 27800000,
            'revisi_ke' => 0,
            'status' => 'ditolak',
            'created_at' => now(),
        ]);

        Dokumen::create([
            'ref_type' => 'permohonan',
            'ref_id' => $permohonan->id,
            'tipe_dokumen' => 'surat_permohonan',
            'versi' => 1,
            'nama_asli' => 'Surat_Permohonan_Printer_Lab.pdf',
            'nama_hash' => 'hash_lama.pdf',
            'mime_type' => 'application/pdf',
            'ukuran_bytes' => 6291456,
            'uploaded_by' => $pemohon->id,
        ]);

        $response = $this->actingAs($pemohon, 'sanctum')->postJson("/api/v1/pemohon/permohonan/{$permohonan->id}/revisi", [
            'judul' => 'Pengadaan Printer Laboratorium Perbaikan',
            'estimasi_anggaran' => 26500000,
            'ringkasan_tujuan' => 'Perbaikan rincian spesifikasi printer',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Permohonan pengadaan berhasil diperbaiki dan diajukan ulang.',
            ]);

        $permohonan->refresh();
        $this->assertEquals('Pengadaan Printer Laboratorium Perbaikan', $permohonan->judul);
        $this->assertEquals(26500000, (float) $permohonan->estimasi_anggaran);
        $this->assertEquals('diajukan', $permohonan->status);
        $this->assertEquals(1, $permohonan->revisi_ke);

        $this->assertDatabaseHas('status_history', [
            'ref_type' => 'permohonan',
            'ref_id' => $permohonan->id,
            'status_lama' => 'ditolak',
            'status_baru' => 'diajukan',
            'actor_id' => $pemohon->id,
        ]);

        $this->assertEquals(1, Dokumen::where('ref_type', 'permohonan')->where('ref_id', $permohonan->id)->count());
    }

    public function test_pemohon_can_revise_with_new_pdf_file(): void
    {
        $pemohon = $this->getPemohonUser();

        $permohonan = Permohonan::create([
            'unit_id' => $pemohon->unit_id,
            'created_by' => $pemohon->id,
            'nomor_surat' => '01014-FF-11',
            'judul' => 'Pengadaan Printer Laboratorium',
            'ringkasan_tujuan' => 'Kebutuhan cetak lab',
            'estimasi_anggaran' => 27800000,
            'revisi_ke' => 0,
            'status' => 'ditolak',
            'created_at' => now(),
        ]);

        Dokumen::create([
            'ref_type' => 'permohonan',
            'ref_id' => $permohonan->id,
            'tipe_dokumen' => 'surat_permohonan',
            'versi' => 1,
            'nama_asli' => 'Surat_Permohonan_Printer_Lab_v1.pdf',
            'nama_hash' => 'hash_v1.pdf',
            'mime_type' => 'application/pdf',
            'ukuran_bytes' => 6291456,
            'uploaded_by' => $pemohon->id,
        ]);

        $newFile = UploadedFile::fake()->create('Surat_Permohonan_Printer_Lab_v2.pdf', 3000, 'application/pdf');

        $response = $this->actingAs($pemohon, 'sanctum')->post("/api/v1/pemohon/permohonan/{$permohonan->id}/revisi", [
            'judul' => 'Pengadaan Printer Laboratorium Revisi v2',
            'estimasi_anggaran' => 24000000,
            'file_dokumen' => $newFile,
        ], ['Accept' => 'application/json']);

        $response->assertStatus(200);

        $permohonan->refresh();
        $this->assertEquals('diajukan', $permohonan->status);
        $this->assertEquals(1, $permohonan->revisi_ke);

        $dokumenList = Dokumen::where('ref_type', 'permohonan')
            ->where('ref_id', $permohonan->id)
            ->orderBy('versi')
            ->get();

        $this->assertCount(2, $dokumenList);
        $this->assertEquals(1, $dokumenList[0]->versi);
        $this->assertEquals('Surat_Permohonan_Printer_Lab_v1.pdf', $dokumenList[0]->nama_asli);

        $this->assertEquals(2, $dokumenList[1]->versi);
        $this->assertEquals('Surat_Permohonan_Printer_Lab_v2.pdf', $dokumenList[1]->nama_asli);

        Storage::disk('local')->assertExists('dokumen/permohonan/'.$dokumenList[1]->nama_hash);
    }
}
