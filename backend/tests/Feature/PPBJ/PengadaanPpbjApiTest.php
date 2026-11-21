<?php

namespace Tests\Feature\PPBJ;

use App\Models\Dokumen;
use App\Models\JenisPengadaan;
use App\Models\LevelPengadaan;
use App\Models\MetodePengadaan;
use App\Models\PenerimaanBarang;
use App\Models\Pengadaan;
use App\Models\PermohonanMak;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\PpbjDummySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PengadaanPpbjApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $ppbjUser;

    protected User $pemohonUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->seed(PpbjDummySeeder::class);

        $this->ppbjUser = User::whereHas('Role', fn ($q) => $q->where('nama', 'PPBJ'))->firstOrFail();
        $this->pemohonUser = User::whereHas('Role', fn ($q) => $q->where('nama', 'Pemohon'))->firstOrFail();
    }

    public function test_index_mengembalikan_daftar_pengadaan_terpaginasi_untuk_ppbj(): void
    {
        $response = $this->actingAs($this->ppbjUser)->getJson('/api/v1/ppbj/pengadaan');

        $response->assertOk()
            ->assertJsonStructure([
                'pengadaan' => [
                    'data',
                    'current_page',
                    'total',
                ],
            ]);
    }

    public function test_show_mengembalikan_detail_pengadaan_terpadu(): void
    {
        $pengadaan = Pengadaan::firstOrFail();

        $response = $this->actingAs($this->ppbjUser)->getJson("/api/v1/ppbj/pengadaan/{$pengadaan->id}");

        $response->assertOk()
            ->assertJsonStructure([
                'pengadaan' => [
                    'id',
                    'nominal',
                    'status',
                    'bisa_edit_draft',
                    'bisa_edit_kontrak',
                    'permohonan',
                    'mak',
                    'jenis',
                    'metode',
                    'level',
                ],
            ]);
    }

    public function test_ppbj_dapat_memperbarui_klasifikasi_pengadaan_berstatus_draft(): void
    {
        $pengadaan = Pengadaan::firstOrFail();
        $pengadaan->status = 'draft';
        $pengadaan->save();

        $mak = PermohonanMak::where('permohonan_id', $pengadaan->permohonan_id)->firstOrFail();
        $jenis = JenisPengadaan::firstOrFail();
        $metode = MetodePengadaan::firstOrFail();
        $level = LevelPengadaan::firstOrFail();

        $response = $this->actingAs($this->ppbjUser)->putJson("/api/v1/ppbj/pengadaan/{$pengadaan->id}", [
            'permohonan_mak_id' => $mak->id,
            'jenis_id' => $jenis->id,
            'metode_id' => $metode->id,
            'level_id' => $level->id,
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Klasifikasi pengadaan berhasil diperbarui.');

        $pengadaan->refresh();
        $this->assertEquals($level->id, $pengadaan->level_id);
    }

    public function test_ppbj_dapat_memperbarui_klasifikasi_pengadaan_berstatus_ditolak(): void
    {
        $pengadaan = Pengadaan::firstOrFail();
        $pengadaan->status = 'ditolak';
        $pengadaan->revisi_ke = 1;
        $pengadaan->save();

        $mak = PermohonanMak::where('permohonan_id', $pengadaan->permohonan_id)->firstOrFail();
        $jenis = JenisPengadaan::firstOrFail();
        $metode = MetodePengadaan::firstOrFail();
        $level = LevelPengadaan::firstOrFail();

        $response = $this->actingAs($this->ppbjUser)->putJson("/api/v1/ppbj/pengadaan/{$pengadaan->id}", [
            'permohonan_mak_id' => $mak->id,
            'jenis_id' => $jenis->id,
            'metode_id' => $metode->id,
            'level_id' => $level->id,
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Dokumen pengadaan revisi berhasil diperbarui dan dikirim kembali ke reviewer.');

        $pengadaan->refresh();
        $this->assertEquals('menunggu_review', $pengadaan->status);
        $this->assertEquals(1, $pengadaan->revisi_ke);
    }

    public function test_ppbj_dapat_mengunggah_ulang_dokumen_pengadaan_saat_revisi(): void
    {
        Storage::fake('local');
        Storage::fake('private');

        $pengadaan = Pengadaan::firstOrFail();
        $pengadaan->status = 'ditolak';
        $pengadaan->revisi_ke = 1;
        $pengadaan->save();

        $mak = PermohonanMak::where('permohonan_id', $pengadaan->permohonan_id)->firstOrFail();
        $jenis = JenisPengadaan::firstOrFail();
        $metode = MetodePengadaan::firstOrFail();
        $level = LevelPengadaan::firstOrFail();
        $file = UploadedFile::fake()->create('dokumen_revisi.pdf', 500, 'application/pdf');

        $response = $this->actingAs($this->ppbjUser)->put("/api/v1/ppbj/pengadaan/{$pengadaan->id}", [
            'permohonan_mak_id' => $mak->id,
            'jenis_id' => $jenis->id,
            'metode_id' => $metode->id,
            'level_id' => $level->id,
            'dokumen' => $file,
        ]);

        $response->assertOk();
        $pengadaan->refresh();
        $this->assertEquals('menunggu_review', $pengadaan->status);
        $this->assertDatabaseHas('dokumen', [
            'ref_type' => 'pengadaan',
            'ref_id' => $pengadaan->id,
            'nama_asli' => 'dokumen_revisi.pdf',
        ]);
    }

    public function test_update_klasifikasi_gagal_jika_status_bukan_draft_atau_ditolak(): void
    {
        $pengadaan = Pengadaan::firstOrFail();
        $pengadaan->status = 'disetujui';
        $pengadaan->save();

        $mak = PermohonanMak::where('permohonan_id', $pengadaan->permohonan_id)->firstOrFail();
        $jenis = JenisPengadaan::firstOrFail();
        $metode = MetodePengadaan::firstOrFail();
        $level = LevelPengadaan::firstOrFail();

        $response = $this->actingAs($this->ppbjUser)->putJson("/api/v1/ppbj/pengadaan/{$pengadaan->id}", [
            'permohonan_mak_id' => $mak->id,
            'jenis_id' => $jenis->id,
            'metode_id' => $metode->id,
            'level_id' => $level->id,
        ]);

        $response->assertStatus(422);
    }

    public function test_ppbj_dapat_menginput_kontrak_dan_vendor_setelah_pengadaan_disetujui(): void
    {
        Storage::fake('private');

        $pengadaan = Pengadaan::firstOrFail();
        $pengadaan->status = 'disetujui';
        $pengadaan->save();

        $response = $this->actingAs($this->ppbjUser)->postJson("/api/v1/ppbj/pengadaan/{$pengadaan->id}/kontrak", [
            'tipe' => 'SPK',
            'nomor' => 'SPK-2026-001',
            'tanggal' => '2026-11-20',
            'vendor_nama' => 'PT Mitra Sejahtera Abadi',
            'nominal_kontrak' => 42000000,
            'tanggal_jatuh_tempo' => '2026-12-20',
            'tanggal_reminder' => '2026-12-15',
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Data kontrak dan vendor berhasil disimpan.');

        $pengadaan->refresh();
        $this->assertEquals('kontrak_terbit', $pengadaan->status);
        $this->assertNotNull($pengadaan->Kontrak);
        $this->assertEquals('PT Mitra Sejahtera Abadi', $pengadaan->Kontrak->vendor_nama);
    }

    public function test_ppbj_tidak_dapat_mengedit_kontrak_setelah_barang_diterima(): void
    {
        $pengadaan = Pengadaan::firstOrFail();
        $pengadaan->status = 'barang_diterima';
        $pengadaan->save();

        // Buat dummy penerimaan barang
        PenerimaanBarang::create([
            'pengadaan_id' => $pengadaan->id,
            'nomor_bast' => 'BAST-001',
            'tanggal_terima' => now()->toDateString(),
            'diterima_oleh' => $this->ppbjUser->id,
            'status' => 'diterima',
        ]);

        $response = $this->actingAs($this->ppbjUser)->putJson("/api/v1/ppbj/pengadaan/{$pengadaan->id}/kontrak", [
            'tipe' => 'SPK',
            'nomor' => 'SPK-2026-002',
            'tanggal' => '2026-11-20',
            'vendor_nama' => 'PT Vendor Baru',
            'nominal_kontrak' => 40000000,
            'tanggal_jatuh_tempo' => '2026-12-20',
            'tanggal_reminder' => '2026-12-15',
        ]);

        $response->assertStatus(422);
    }

    public function test_ppbj_dapat_mengunduh_atau_melihat_dokumen_pengadaan_dan_permohonan(): void
    {
        Storage::fake('local');
        $pengadaan = Pengadaan::firstOrFail();

        // Dokumen permohonan
        $dokumenPermohonan = Dokumen::create([
            'ref_type' => 'permohonan',
            'ref_id' => $pengadaan->permohonan_id,
            'tipe_dokumen' => 'surat_permohonan',
            'versi' => 1,
            'nama_asli' => 'surat_permohonan.pdf',
            'nama_hash' => 'hash_permohonan.pdf',
            'mime_type' => 'application/pdf',
            'ukuran_bytes' => 1024,
            'uploaded_by' => $this->ppbjUser->id,
        ]);
        Storage::disk('local')->put('dokumen/permohonan/hash_permohonan.pdf', 'dummy content permohonan');

        $responsePermohonan = $this->actingAs($this->ppbjUser)
            ->get("/api/v1/ppbj/pengadaan/{$pengadaan->id}/dokumen/{$dokumenPermohonan->id}?disposition=inline");

        $responsePermohonan->assertOk();

        // Dokumen pengadaan
        $dokumenPengadaan = Dokumen::create([
            'ref_type' => 'pengadaan',
            'ref_id' => $pengadaan->id,
            'tipe_dokumen' => 'dokumen_pengadaan',
            'versi' => 1,
            'nama_asli' => 'dokumen_pengadaan.pdf',
            'nama_hash' => 'hash_pengadaan.pdf',
            'mime_type' => 'application/pdf',
            'ukuran_bytes' => 2048,
            'uploaded_by' => $this->ppbjUser->id,
        ]);
        Storage::disk('local')->put('dokumen/pengadaan/hash_pengadaan.pdf', 'dummy content pengadaan');

        $responsePengadaan = $this->actingAs($this->ppbjUser)
            ->get("/api/v1/ppbj/pengadaan/{$pengadaan->id}/dokumen/{$dokumenPengadaan->id}?disposition=inline");

        $responsePengadaan->assertOk();
    }
}
