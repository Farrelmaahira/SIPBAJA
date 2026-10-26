<?php

namespace Tests\Feature\PPBJ;

use App\Models\Permohonan;
use App\Services\PermohonanService;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\PpbjDummySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PermohonanServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(DatabaseSeeder::class);
        $this->seed(PpbjDummySeeder::class);
    }

    public function test_get_permohonan_ppbj_list_mengembalikan_daftar_permohonan_dengan_relasi_lengkap(): void
    {
        $service = app(PermohonanService::class);
        $result = $service->getPermohonanPpbjList();

        $this->assertIsArray($result);
        $this->assertNotEmpty($result);

        $first = $result[0];
        $this->assertArrayHasKey('id', $first);
        $this->assertArrayHasKey('nomorSurat', $first);
        $this->assertArrayHasKey('judul', $first);
        $this->assertArrayHasKey('ringkasanTujuan', $first);
        $this->assertArrayHasKey('unitNama', $first);
        $this->assertArrayHasKey('estimasiAnggaran', $first);
        $this->assertArrayHasKey('revisiKe', $first);
        $this->assertArrayHasKey('status', $first);
        $this->assertArrayHasKey('tanggalPengajuan', $first);
        $this->assertArrayHasKey('makList', $first);
        $this->assertArrayHasKey('jumlahPaket', $first);

        $this->assertIsFloat($first['estimasiAnggaran']);
        $this->assertIsInt($first['revisiKe']);
        $this->assertIsArray($first['makList']);
    }

    public function test_get_permohonan_ppbj_list_menangani_permohonan_tanpa_mak_dengan_aman(): void
    {
        $permohonan = Permohonan::first();
        $this->assertNotNull($permohonan);

        $service = app(PermohonanService::class);
        $result = $service->getPermohonanPpbjList();

        foreach ($result as $item) {
            $this->assertIsArray($item['makList']);
        }
    }
}
