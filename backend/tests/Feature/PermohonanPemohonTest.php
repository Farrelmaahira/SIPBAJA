<?php

namespace Tests\Feature;

use App\Models\Dokumen;
use App\Models\Permohonan;
use App\Models\Unit;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PermohonanPemohonTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([RoleSeeder::class, UserSeeder::class]);
    }

    public function test_pemohon_dapat_mengakses_halaman_formulir_permohonan(): void
    {
        /** @var User $pemohon */
        $pemohon = User::where('email', 'jurusan@pnj.ac.id')->firstOrFail();

        $response = $this->actingAs($pemohon)->get(route('pemohon.permohonan.create'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Pemohon/Permohonan/Create')
        );
    }

    public function test_user_non_pemohon_dilarang_mengakses_halaman_formulir_permohonan(): void
    {
        /** @var User $admin */
        $admin = User::where('email', 'admin@pnj.ac.id')->firstOrFail();

        $response = $this->actingAs($admin)->get(route('pemohon.permohonan.create'));

        $response->assertForbidden();
    }

    public function test_validasi_gagal_jika_field_wajib_kosong(): void
    {
        /** @var User $pemohon */
        $pemohon = User::where('email', 'jurusan@pnj.ac.id')->firstOrFail();

        $response = $this->actingAs($pemohon)->post(route('pemohon.permohonan.store'), [
            'judul' => '',
            'estimasi_anggaran' => '',
            'file_dokumen' => null,
        ]);

        $response->assertSessionHasErrors(['judul', 'estimasi_anggaran', 'file_dokumen']);
    }

    public function test_validasi_gagal_jika_file_bukan_pdf_atau_melebihi_10mb(): void
    {
        /** @var User $pemohon */
        $pemohon = User::where('email', 'jurusan@pnj.ac.id')->firstOrFail();

        Storage::fake('local');

        // File text bukan PDF
        $invalidFile = UploadedFile::fake()->create('dokumen.txt', 100, 'text/plain');

        $response = $this->actingAs($pemohon)->post(route('pemohon.permohonan.store'), [
            'judul' => 'Pengadaan Laptop',
            'estimasi_anggaran' => 15000000,
            'file_dokumen' => $invalidFile,
        ]);

        $response->assertSessionHasErrors(['file_dokumen']);

        // File PDF melebihi 10 MB (10241 KB)
        $oversizedFile = UploadedFile::fake()->create('dokumen.pdf', 10241, 'application/pdf');

        $response2 = $this->actingAs($pemohon)->post(route('pemohon.permohonan.store'), [
            'judul' => 'Pengadaan Laptop',
            'estimasi_anggaran' => 15000000,
            'file_dokumen' => $oversizedFile,
        ]);

        $response2->assertSessionHasErrors(['file_dokumen']);
    }

    public function test_pemohon_dapat_menyimpan_permohonan_baru_dan_tersimpan_di_database_serta_storage(): void
    {
        Storage::fake('local');

        /** @var User $pemohon */
        $pemohon = User::where('email', 'jurusan@pnj.ac.id')->firstOrFail();

        $unit = Unit::create([
            'nama' => 'Teknik Elektro',
            'tipe' => 'jurusan',
        ]);
        $pemohon->update(['unit_id' => $unit->id]);

        $pdfFile = UploadedFile::fake()->create('Surat_Permohonan_Elektro.pdf', 500, 'application/pdf');

        $payload = [
            'judul' => 'Pengadaan Komputer Lab Jaringan',
            'estimasi_anggaran' => 75000000,
            'file_dokumen' => $pdfFile,
        ];

        $response = $this->actingAs($pemohon)->post(route('pemohon.permohonan.store'), $payload);

        $response->assertRedirect(route('pemohon.dashboard'));
        $response->assertSessionHas('success');

        // Verifikasi tabel permohonan
        $this->assertDatabaseHas('permohonan', [
            'unit_id' => $unit->id,
            'created_by' => $pemohon->id,
            'judul' => 'Pengadaan Komputer Lab Jaringan',
            'status' => 'diajukan',
            'revisi_ke' => 0,
        ]);

        /** @var Permohonan $permohonan */
        $permohonan = Permohonan::where('judul', 'Pengadaan Komputer Lab Jaringan')->firstOrFail();
        $this->assertEquals(75000000, (float) $permohonan->estimasi_anggaran);
        $this->assertNotEmpty($permohonan->nomor_surat);
        $this->assertNotEmpty($permohonan->ringkasan_tujuan);

        // Verifikasi tabel dokumen
        $this->assertDatabaseHas('dokumen', [
            'ref_type' => 'permohonan',
            'ref_id' => $permohonan->id,
            'tipe_dokumen' => 'surat_permohonan',
            'versi' => 1,
            'nama_asli' => 'Surat_Permohonan_Elektro.pdf',
            'uploaded_by' => $pemohon->id,
        ]);

        /** @var Dokumen $dokumen */
        $dokumen = Dokumen::where('ref_id', $permohonan->id)->where('ref_type', 'permohonan')->firstOrFail();
        Storage::disk('local')->assertExists('dokumen/permohonan/'.$dokumen->nama_hash);

        // Verifikasi tabel status_history
        $this->assertDatabaseHas('status_history', [
            'ref_type' => 'permohonan',
            'ref_id' => $permohonan->id,
            'status_lama' => null,
            'status_baru' => 'diajukan',
            'actor_id' => $pemohon->id,
        ]);
    }
}
