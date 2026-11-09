<?php

namespace Tests\Feature\Pemohon;

use App\Models\Permohonan;
use App\Models\Unit;
use App\Models\User;
use Database\Seeders\MasterReferenceSeeder;
use Database\Seeders\RbacSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PermohonanListTest extends TestCase
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

    private function getPemohonUser(): User
    {
        return User::where('email', 'jurusan@pnj.ac.id')->firstOrFail();
    }

    public function test_guest_cannot_access_permohonan_list(): void
    {
        $response = $this->getJson('/api/v1/pemohon/permohonan');
        $response->assertStatus(401);
    }

    public function test_pemohon_can_access_own_unit_permohonan_list(): void
    {
        $pemohon = $this->getPemohonUser();

        Permohonan::create([
            'unit_id' => $pemohon->unit_id,
            'created_by' => $pemohon->id,
            'nomor_surat' => '01010-FF-11',
            'judul' => 'Pengadaan Komputer Lab',
            'ringkasan_tujuan' => 'Kebutuhan praktikum mahasiswa',
            'estimasi_anggaran' => 185000000,
            'revisi_ke' => 0,
            'status' => 'diajukan',
            'created_at' => now(),
        ]);

        $response = $this->actingAs($pemohon, 'sanctum')->getJson('/api/v1/pemohon/permohonan');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'permohonanList' => [
                    'data',
                    'current_page',
                    'total',
                ],
                'filters',
            ])
            ->assertJsonFragment(['nomor_surat' => '01010-FF-11']);
    }

    public function test_pemohon_cannot_see_other_unit_permohonan(): void
    {
        $pemohon = $this->getPemohonUser();
        $otherUnit = Unit::create(['nama' => 'Unit Lain']);

        Permohonan::create([
            'unit_id' => $otherUnit->id,
            'created_by' => $pemohon->id,
            'nomor_surat' => 'OTHER-UNIT-01',
            'judul' => 'Pengadaan Rahasia Unit Lain',
            'ringkasan_tujuan' => 'Unit lain',
            'estimasi_anggaran' => 50000000,
            'revisi_ke' => 0,
            'status' => 'diajukan',
            'created_at' => now(),
        ]);

        $response = $this->actingAs($pemohon, 'sanctum')->getJson('/api/v1/pemohon/permohonan');

        $response->assertStatus(200)
            ->assertJsonMissing(['nomor_surat' => 'OTHER-UNIT-01']);
    }

    public function test_pemohon_can_filter_permohonan_by_single_status(): void
    {
        $pemohon = $this->getPemohonUser();

        Permohonan::create([
            'unit_id' => $pemohon->unit_id,
            'created_by' => $pemohon->id,
            'nomor_surat' => 'SRT-DISETUJUI-01',
            'judul' => 'Pengadaan Server Kampus',
            'ringkasan_tujuan' => 'Server',
            'estimasi_anggaran' => 320000000,
            'revisi_ke' => 0,
            'status' => 'disetujui',
            'created_at' => now(),
        ]);

        Permohonan::create([
            'unit_id' => $pemohon->unit_id,
            'created_by' => $pemohon->id,
            'nomor_surat' => 'SRT-DITOLAK-01',
            'judul' => 'Pengadaan Printer Lab',
            'ringkasan_tujuan' => 'Printer',
            'estimasi_anggaran' => 27800000,
            'revisi_ke' => 0,
            'status' => 'ditolak',
            'created_at' => now(),
        ]);

        $response = $this->actingAs($pemohon, 'sanctum')->getJson('/api/v1/pemohon/permohonan?status=disetujui');

        $response->assertStatus(200)
            ->assertJsonFragment(['nomor_surat' => 'SRT-DISETUJUI-01'])
            ->assertJsonMissing(['nomor_surat' => 'SRT-DITOLAK-01']);
    }

    public function test_pemohon_can_filter_permohonan_by_multi_status(): void
    {
        $pemohon = $this->getPemohonUser();

        Permohonan::create([
            'unit_id' => $pemohon->unit_id,
            'created_by' => $pemohon->id,
            'nomor_surat' => 'SRT-MENUNGGU-01',
            'judul' => 'Pengadaan Switch Jaringan',
            'ringkasan_tujuan' => 'Switch',
            'estimasi_anggaran' => 92750000,
            'revisi_ke' => 0,
            'status' => 'menunggu_bidang2',
            'created_at' => now(),
        ]);

        Permohonan::create([
            'unit_id' => $pemohon->unit_id,
            'created_by' => $pemohon->id,
            'nomor_surat' => 'SRT-PROSES-01',
            'judul' => 'Pengadaan Router Core',
            'ringkasan_tujuan' => 'Router',
            'estimasi_anggaran' => 88000000,
            'revisi_ke' => 0,
            'status' => 'proses_pengadaan',
            'created_at' => now(),
        ]);

        Permohonan::create([
            'unit_id' => $pemohon->unit_id,
            'created_by' => $pemohon->id,
            'nomor_surat' => 'SRT-DITOLAK-02',
            'judul' => 'Pengadaan AC Rusak',
            'ringkasan_tujuan' => 'AC',
            'estimasi_anggaran' => 15000000,
            'revisi_ke' => 0,
            'status' => 'ditolak',
            'created_at' => now(),
        ]);

        $response = $this->actingAs($pemohon, 'sanctum')->getJson('/api/v1/pemohon/permohonan?status=menunggu_persetujuan,sedang_diproses');

        $response->assertStatus(200)
            ->assertJsonFragment(['nomor_surat' => 'SRT-MENUNGGU-01'])
            ->assertJsonFragment(['nomor_surat' => 'SRT-PROSES-01'])
            ->assertJsonMissing(['nomor_surat' => 'SRT-DITOLAK-02']);
    }

    public function test_pemohon_can_search_permohonan_by_keyword(): void
    {
        $pemohon = $this->getPemohonUser();

        Permohonan::create([
            'unit_id' => $pemohon->unit_id,
            'created_by' => $pemohon->id,
            'nomor_surat' => '01016-FF-11',
            'judul' => 'Pengadaan Access Point',
            'ringkasan_tujuan' => 'WiFi Lab',
            'estimasi_anggaran' => 38900000,
            'revisi_ke' => 0,
            'status' => 'diajukan',
            'created_at' => now(),
        ]);

        Permohonan::create([
            'unit_id' => $pemohon->unit_id,
            'created_by' => $pemohon->id,
            'nomor_surat' => '01017-FF-11',
            'judul' => 'Pengadaan Lisensi Perangkat Lunak',
            'ringkasan_tujuan' => 'Software',
            'estimasi_anggaran' => 112000000,
            'revisi_ke' => 0,
            'status' => 'diajukan',
            'created_at' => now(),
        ]);

        $response = $this->actingAs($pemohon, 'sanctum')->getJson('/api/v1/pemohon/permohonan?search=Access+Point');

        $response->assertStatus(200)
            ->assertJsonFragment(['nomor_surat' => '01016-FF-11'])
            ->assertJsonMissing(['nomor_surat' => '01017-FF-11']);
    }

    public function test_pemohon_can_delete_own_draft_or_pending_permohonan(): void
    {
        $pemohon = $this->getPemohonUser();

        $permohonan = Permohonan::create([
            'unit_id' => $pemohon->unit_id,
            'created_by' => $pemohon->id,
            'nomor_surat' => '01099-DEL-11',
            'judul' => 'Pengadaan Mau Dihapus',
            'ringkasan_tujuan' => 'Kebutuhan uji coba delete',
            'estimasi_anggaran' => 10000000,
            'revisi_ke' => 0,
            'status' => 'diajukan',
            'created_at' => now(),
        ]);

        $response = $this->actingAs($pemohon, 'sanctum')
            ->deleteJson("/api/v1/pemohon/permohonan/{$permohonan->id}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Permohonan pengadaan berhasil dihapus.']);

        $this->assertDatabaseMissing('permohonan', ['id' => $permohonan->id]);
    }
}
