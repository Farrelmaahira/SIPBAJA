<?php

namespace Tests\Feature\PPBJ;

use App\Models\JenisPengadaan;
use App\Models\MetodePengadaan;
use App\Models\PenerimaanBarang;
use App\Models\Pengadaan;
use App\Models\PermohonanMak;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\PpbjDummySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
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

        $response = $this->actingAs($this->ppbjUser)->putJson("/api/v1/ppbj/pengadaan/{$pengadaan->id}", [
            'permohonan_mak_id' => $mak->id,
            'jenis_id' => $jenis->id,
            'metode_id' => $metode->id,
            'nominal' => 45000000,
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Klasifikasi pengadaan berhasil diperbarui.');

        $pengadaan->refresh();
        $this->assertEquals(45000000, (float) $pengadaan->nominal);
    }

    public function test_update_klasifikasi_gagal_jika_status_bukan_draft_atau_ditolak(): void
    {
        $pengadaan = Pengadaan::firstOrFail();
        $pengadaan->status = 'disetujui';
        $pengadaan->save();

        $mak = PermohonanMak::where('permohonan_id', $pengadaan->permohonan_id)->firstOrFail();
        $jenis = JenisPengadaan::firstOrFail();
        $metode = MetodePengadaan::firstOrFail();

        $response = $this->actingAs($this->ppbjUser)->putJson("/api/v1/ppbj/pengadaan/{$pengadaan->id}", [
            'permohonan_mak_id' => $mak->id,
            'jenis_id' => $jenis->id,
            'metode_id' => $metode->id,
            'nominal' => 45000000,
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
}
