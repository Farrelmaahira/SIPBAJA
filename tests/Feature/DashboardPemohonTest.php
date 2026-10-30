<?php

namespace Tests\Feature;

use App\Models\Permohonan;
use App\Models\Unit;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardPemohonTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([RoleSeeder::class, UserSeeder::class]);
    }

    public function test_pemohon_dapat_mengakses_dashboard_dan_menerima_props_lengkap(): void
    {
        /** @var User $pemohon */
        $pemohon = User::where('email', 'jurusan@pnj.ac.id')->firstOrFail();

        $unit = Unit::create([
            'nama' => 'Teknik Informatika',
            'tipe' => 'jurusan',
        ]);
        $pemohon->update(['unit_id' => $unit->id]);

        $response = $this->actingAs($pemohon)->get(route('pemohon.dashboard'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Pemohon/Dashboard')
            ->has('ringkasan')
            ->has('permohonanAktif')
            ->has('tahunAktif')
            ->where('ringkasan.total', 0)
            ->where('ringkasan.menunggu_verifikasi', 0)
            ->where('ringkasan.disetujui', 0)
            ->where('ringkasan.ditolak', 0)
        );
    }

    public function test_data_ringkasan_dan_permohonan_aktif_terisolasi_hanya_untuk_unit_pemohon(): void
    {
        /** @var User $pemohon */
        $pemohon = User::where('email', 'jurusan@pnj.ac.id')->firstOrFail();

        $unitPemohon = Unit::create([
            'nama' => 'Teknik Elektro',
            'tipe' => 'jurusan',
        ]);
        $pemohon->update(['unit_id' => $unitPemohon->id]);

        $unitLain = Unit::create([
            'nama' => 'Unit Lain Pengujian',
            'tipe' => 'unit',
        ]);

        // Permohonan milik unit pemohon
        Permohonan::create([
            'unit_id' => $pemohon->unit_id,
            'created_by' => $pemohon->id,
            'nomor_surat' => 'PRM/001/2026',
            'judul' => 'Pengadaan Laptop Jurusan',
            'ringkasan_tujuan' => 'Kebutuhan lab komputer',
            'estimasi_anggaran' => 15000000,
            'revisi_ke' => 0,
            'status' => 'diajukan',
            'created_at' => Carbon::now(),
        ]);

        // Permohonan milik unit lain
        Permohonan::create([
            'unit_id' => $unitLain->id,
            'created_by' => $pemohon->id,
            'nomor_surat' => 'PRM/999/2026',
            'judul' => 'Pengadaan Meja Unit Lain',
            'ringkasan_tujuan' => 'Kebutuhan unit lain',
            'estimasi_anggaran' => 5000000,
            'revisi_ke' => 0,
            'status' => 'diajukan',
            'created_at' => Carbon::now(),
        ]);

        $response = $this->actingAs($pemohon)->get(route('pemohon.dashboard'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Pemohon/Dashboard')
            ->where('ringkasan.total', 1)
            ->where('ringkasan.menunggu_verifikasi', 1)
            ->where('ringkasan.disetujui', 0)
            ->where('ringkasan.ditolak', 0)
            ->has('permohonanAktif', 1)
            ->where('permohonanAktif.0.nomor_surat', 'PRM/001/2026')
        );
    }

    public function test_statistik_bulanan_dapat_dimuat_sesuai_tahun_yang_diminta(): void
    {
        /** @var User $pemohon */
        $pemohon = User::where('email', 'jurusan@pnj.ac.id')->firstOrFail();

        $unit = Unit::create([
            'nama' => 'Teknik Mesin',
            'tipe' => 'jurusan',
        ]);
        $pemohon->update(['unit_id' => $unit->id]);

        Permohonan::create([
            'unit_id' => $pemohon->unit_id,
            'created_by' => $pemohon->id,
            'nomor_surat' => 'PRM/ACC/2026',
            'judul' => 'Pengadaan Disetujui',
            'ringkasan_tujuan' => 'Pengadaan riset',
            'estimasi_anggaran' => 10000000,
            'revisi_ke' => 0,
            'status' => 'disetujui',
            'created_at' => Carbon::create(2026, 3, 15),
        ]);

        $response = $this->actingAs($pemohon)->get(route('pemohon.dashboard', ['tahun' => 2026]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Pemohon/Dashboard')
            ->where('tahunAktif', 2026)
            ->has('statistikBulanan', 12)
            ->where('statistikBulanan.2.bulan', 3)
            ->where('statistikBulanan.2.disetujui', 1)
            ->where('statistikBulanan.2.ditolak', 0)
        );
    }

    public function test_filter_tahun_tidak_valid_menghasilkan_error_validasi(): void
    {
        /** @var User $pemohon */
        $pemohon = User::where('email', 'jurusan@pnj.ac.id')->firstOrFail();

        $response = $this->actingAs($pemohon)->get(route('pemohon.dashboard', ['tahun' => 'bukan-tahun']));

        $response->assertSessionHasErrors(['tahun']);
    }
}
