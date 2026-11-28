<?php

namespace Tests\Feature;

use App\Models\Pengadaan;
use App\Models\User;
use Database\Seeders\MasterDataSeeder;
use Database\Seeders\PermohonanPengadaanSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class KeuanganApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([
            MasterDataSeeder::class,
            PermohonanPengadaanSeeder::class,
        ]);
    }

    private function keuanganUser(): User
    {
        return User::where('email', 'keuangan@pnj.ac.id')->firstOrFail();
    }

    private function pemohonUser(): User
    {
        return User::where('email', 'jurusan@pnj.ac.id')->firstOrFail();
    }

    public function test_unauthenticated_cannot_access_keuangan_endpoints(): void
    {
        $this->getJson('/api/v1/keuangan/dashboard')->assertStatus(401);
        $this->getJson('/api/v1/keuangan/pengadaan')->assertStatus(401);
        $this->getJson('/api/v1/keuangan/profil')->assertStatus(401);
    }

    public function test_non_keuangan_cannot_access_keuangan_dashboard(): void
    {
        $response = $this->actingAs($this->pemohonUser(), 'sanctum')
            ->getJson('/api/v1/keuangan/dashboard');

        $response->assertStatus(403);
    }

    public function test_keuangan_can_access_dashboard_and_reads_from_database(): void
    {
        $response = $this->actingAs($this->keuanganUser(), 'sanctum')
            ->getJson('/api/v1/keuangan/dashboard');

        $response->assertStatus(200);

        $json = $response->json();
        $this->assertArrayHasKey('summary', $json);
        $this->assertArrayHasKey('total_menunggu_pembayaran', $json['summary']);
        $this->assertGreaterThanOrEqual(6, $json['summary']['total_menunggu_pembayaran']);

        $this->assertArrayHasKey('pengadaan_menunggu_pembayaran', $json);
        $this->assertIsArray($json['pengadaan_menunggu_pembayaran']);
        $this->assertNotEmpty($json['pengadaan_menunggu_pembayaran']);

        $firstItem = $json['pengadaan_menunggu_pembayaran'][0];
        $this->assertArrayHasKey('id', $firstItem);
        $this->assertArrayHasKey('nomor_pengadaan', $firstItem);
        $this->assertArrayHasKey('nomor_permohonan', $firstItem);
        $this->assertArrayHasKey('judul', $firstItem);
        $this->assertArrayHasKey('diajukan_oleh', $firstItem);
        $this->assertArrayHasKey('nilai_pengajuan', $firstItem);
        $this->assertArrayHasKey('status', $firstItem);
        $this->assertArrayHasKey('status_label', $firstItem);
    }

    public function test_keuangan_can_access_profil(): void
    {
        $response = $this->actingAs($this->keuanganUser(), 'sanctum')
            ->getJson('/api/v1/keuangan/profil');

        $response->assertStatus(200);
        $this->assertEquals('keuangan@pnj.ac.id', $response->json('user.email'));
    }

    public function test_keuangan_can_access_pengadaan_list_with_pagination(): void
    {
        $response = $this->actingAs($this->keuanganUser(), 'sanctum')
            ->getJson('/api/v1/keuangan/pengadaan?page=1&per_page=10');

        $response->assertStatus(200);

        $json = $response->json();
        $this->assertArrayHasKey('data', $json);
        $this->assertArrayHasKey('total', $json);
        $this->assertArrayHasKey('current_page', $json);
        $this->assertArrayHasKey('last_page', $json);
        $this->assertGreaterThanOrEqual(10, $json['total']);
        $this->assertCount(10, $json['data']);
    }

    public function test_keuangan_can_search_pengadaan_list(): void
    {
        $response = $this->actingAs($this->keuanganUser(), 'sanctum')
            ->getJson('/api/v1/keuangan/pengadaan?search=Komputer');

        $response->assertStatus(200);
        $json = $response->json();
        $this->assertGreaterThanOrEqual(1, $json['total']);
        $this->assertStringContainsString('Komputer', $json['data'][0]['judul']);
    }

    public function test_keuangan_can_filter_pengadaan_list_by_status(): void
    {
        // Filter status Selesai
        $responseSelesai = $this->actingAs($this->keuanganUser(), 'sanctum')
            ->getJson('/api/v1/keuangan/pengadaan?status=selesai');

        $responseSelesai->assertStatus(200);
        $jsonSelesai = $responseSelesai->json();
        $this->assertGreaterThanOrEqual(1, $jsonSelesai['total']);
        foreach ($jsonSelesai['data'] as $item) {
            $this->assertEquals('selesai', $item['status']);
        }

        // Filter status Menunggu Input
        $responseMenunggu = $this->actingAs($this->keuanganUser(), 'sanctum')
            ->getJson('/api/v1/keuangan/pengadaan?status=menunggu_input');

        $responseMenunggu->assertStatus(200);
        $jsonMenunggu = $responseMenunggu->json();
        $this->assertGreaterThanOrEqual(1, $jsonMenunggu['total']);
        foreach ($jsonMenunggu['data'] as $item) {
            $this->assertEquals('menunggu_input', $item['status']);
        }
    }

    public function test_keuangan_can_view_pengadaan_detail(): void
    {
        $pengadaan = Pengadaan::with(['Permohonan.Unit', 'Kontrak', 'PermohonanMak.Mak.Ppk'])->findOrFail(1);

        $response = $this->actingAs($this->keuanganUser(), 'sanctum')
            ->getJson('/api/v1/keuangan/pengadaan/1');

        $response->assertStatus(200);

        $json = $response->json();
        $this->assertArrayHasKey('id', $json);
        $this->assertEquals($pengadaan->id, $json['id']);
        $this->assertEquals($pengadaan->Kontrak->nomor, $json['nomor_pengadaan']);
        $this->assertEquals($pengadaan->Permohonan->judul, $json['judul']);
        $this->assertEquals($pengadaan->Permohonan->Unit->nama, $json['unit_pemohon']);
        $this->assertEquals((float) $pengadaan->Kontrak->nominal_kontrak, (float) $json['informasi_pengadaan']['biaya_riil']);
        $this->assertStringContainsString('Diverifikasi oleh PP', $json['informasi_pengadaan']['verifikasi_pp']);
        $this->assertStringContainsString('Disetujui oleh PPK', $json['informasi_pengadaan']['persetujuan_ppk']);

        $this->assertArrayHasKey('tracking_proses', $json);
        $this->assertNotEmpty($json['tracking_proses']['timeline']);
        $this->assertNotEmpty($json['tracking_proses']['stepper']);

        $this->assertArrayHasKey('dokumen_diterima', $json);
        $this->assertArrayHasKey('dokumen_kategori', $json);
        $this->assertArrayHasKey('jenis_mak', $json);
        $this->assertCount(1, $json['jenis_mak']);
        $this->assertNotEmpty($json['jenis_mak'][0]['kode']);
        $this->assertNotEmpty($json['jenis_mak'][0]['nama']);

        $this->assertArrayHasKey('pembayaran', $json);
        $this->assertCount(13, $json['dokumen_diterima']);
    }

    public function test_keuangan_can_submit_bukti_pembayaran_and_updates_database(): void
    {
        Storage::fake('local');

        $file1 = UploadedFile::fake()->create('Bukti_Transfer_001.jpg', 2400, 'image/jpeg');
        $file2 = UploadedFile::fake()->create('Bukti_Transfer_002.png', 1800, 'image/png');

        $response = $this->actingAs($this->keuanganUser(), 'sanctum')
            ->postJson('/api/v1/keuangan/pengadaan/1/bukti-bayar', [
                'tanggal_pembayaran' => '2027-03-18',
                'tanggal_pembayaran_list' => ['2027-03-17', '2027-03-18'],
                'bukti_bayar' => [$file1, $file2],
            ]);

        $response->assertStatus(201);
        $response->assertJsonPath('status', 'selesai');

        // Verifikasi detail setelah submit berstatus selesai
        $detailRes = $this->actingAs($this->keuanganUser(), 'sanctum')
            ->getJson('/api/v1/keuangan/pengadaan/1');

        $detailRes->assertStatus(200);
        $this->assertEquals('selesai', $detailRes->json('status'));
        $this->assertNotEmpty($detailRes->json('pembayaran.dokumen_bukti_bayar'));
        $this->assertEquals('2027-03-17', $detailRes->json('pembayaran.dokumen_bukti_bayar.0.tanggal_pembayaran'));
    }

    public function test_keuangan_can_download_dokumen(): void
    {
        $response = $this->actingAs($this->keuanganUser(), 'sanctum')
            ->get('/api/v1/keuangan/pengadaan/1/dokumen/1?nama=Memo_Persetujuan.pdf');

        $response->assertStatus(200);
        $this->assertEquals('application/pdf', $response->headers->get('Content-Type'));
    }

    public function test_keuangan_can_submit_bukti_pembayaran_even_if_kontrak_has_null_nominal(): void
    {
        Storage::fake('local');

        $pengadaan = Pengadaan::first();
        if ($pengadaan->Kontrak) {
            $pengadaan->Kontrak->nominal_kontrak = null;
            $pengadaan->Kontrak->save();
            $pengadaan->Kontrak->RencanaPembayaran()->delete();
        }

        $file = UploadedFile::fake()->create('Bukti_Transfer_Custom.pdf', 1024, 'application/pdf');

        $response = $this->actingAs($this->keuanganUser(), 'sanctum')
            ->postJson("/api/v1/keuangan/pengadaan/{$pengadaan->id}/bukti-bayar", [
                'tanggal_pembayaran' => '2027-03-20',
                'bukti_bayar' => [$file],
            ]);

        $response->assertStatus(201);
        $response->assertJsonPath('status', 'selesai');
    }

    public function test_keuangan_can_edit_existing_bukti_pembayaran(): void
    {
        Storage::fake('local');

        $file1 = UploadedFile::fake()->create('Bukti_Lama.jpg', 1500, 'image/jpeg');

        // 1. Initial upload
        $this->actingAs($this->keuanganUser(), 'sanctum')
            ->postJson('/api/v1/keuangan/pengadaan/1/bukti-bayar', [
                'tanggal_pembayaran' => '2027-04-01',
                'bukti_bayar' => [$file1],
            ])
            ->assertStatus(201);

        $detailBefore = $this->actingAs($this->keuanganUser(), 'sanctum')
            ->getJson('/api/v1/keuangan/pengadaan/1')
            ->json();

        $existingDoc = $detailBefore['pembayaran']['dokumen_bukti_bayar'][0];
        $this->assertEquals('2027-04-01', $existingDoc['tanggal_pembayaran']);

        // 2. Edit existing proof: update its date and add another file
        $file2 = UploadedFile::fake()->create('Bukti_Tambahan.pdf', 1200, 'application/pdf');

        $editRes = $this->actingAs($this->keuanganUser(), 'sanctum')
            ->postJson('/api/v1/keuangan/pengadaan/1/bukti-bayar', [
                'is_edit' => true,
                'tanggal_pembayaran' => '2027-04-05',
                'existing_items' => [
                    [
                        'id' => $existingDoc['id'],
                        'tanggal_pembayaran' => '2027-04-02',
                    ],
                ],
                'bukti_bayar' => [$file2],
                'tanggal_pembayaran_list' => ['2027-04-05'],
            ]);

        $editRes->assertStatus(201);

        // 3. Verify detail reflects the updated date on existing doc and contains new doc
        $detailAfter = $this->actingAs($this->keuanganUser(), 'sanctum')
            ->getJson('/api/v1/keuangan/pengadaan/1')
            ->json();

        $docs = $detailAfter['pembayaran']['dokumen_bukti_bayar'];
        $this->assertCount(2, $docs);
        $this->assertEquals('2027-04-02', $docs[0]['tanggal_pembayaran']);
        $this->assertEquals('2027-04-05', $docs[1]['tanggal_pembayaran']);
    }
}
