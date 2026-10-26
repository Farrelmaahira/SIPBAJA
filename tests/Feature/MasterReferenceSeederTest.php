<?php

namespace Tests\Feature;

use App\Models\JenisPengadaan;
use App\Models\LevelPengadaan;
use App\Models\Mak;
use App\Models\MetodePengadaan;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\MasterReferenceSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MasterReferenceSeederTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([RoleSeeder::class, UserSeeder::class]);
    }

    public function test_master_reference_seeder_membuat_data_master_lengkap(): void
    {
        $this->seed(MasterReferenceSeeder::class);

        $ppkRole = Role::where('nama', 'PPK')->firstOrFail();

        $expectedPpkUsers = [
            'ppk.blufisik@pnj.ac.id' => 'PPK BLU Fisik',
            'ppk.blunonfisik@pnj.ac.id' => 'PPK BLU Non-Fisik',
            'ppk.rmfisik@pnj.ac.id' => 'PPK RM Fisik',
            'ppk.rmnonfisik@pnj.ac.id' => 'PPK RM Non-Fisik',
        ];

        foreach ($expectedPpkUsers as $email => $nama) {
            $user = User::where('email', $email)->first();
            $this->assertNotNull($user, "Akun PPK {$email} tidak ditemukan.");
            $this->assertSame($nama, $user->nama);
            $this->assertSame($ppkRole->id, $user->role_id);
        }

        $expectedMaks = [
            'BLU Fisik' => 'ppk.blufisik@pnj.ac.id',
            'BLU Non-Fisik' => 'ppk.blunonfisik@pnj.ac.id',
            'RM Fisik' => 'ppk.rmfisik@pnj.ac.id',
            'RM Non-Fisik' => 'ppk.rmnonfisik@pnj.ac.id',
        ];

        foreach ($expectedMaks as $makNama => $ppkEmail) {
            $mak = Mak::where('nama', $makNama)->first();
            $this->assertNotNull($mak, "MAK {$makNama} tidak ditemukan.");
            $this->assertSame($ppkEmail, $mak->ppk->email);
        }

        $expectedJenis = ['Barang', 'Jasa', 'Konstruksi'];
        foreach ($expectedJenis as $jenis) {
            $this->assertTrue(JenisPengadaan::where('nama', $jenis)->exists(), "Jenis pengadaan {$jenis} tidak ditemukan.");
        }

        $expectedMetode = ['Inaproc', 'SPSE', 'Tender', 'Non-Tender'];
        foreach ($expectedMetode as $metode) {
            $this->assertTrue(MetodePengadaan::where('nama', $metode)->exists(), "Metode pengadaan {$metode} tidak ditemukan.");
        }

        $level1 = LevelPengadaan::where('nama', '<50jt')->first();
        $this->assertNotNull($level1, "Level pengadaan <50jt tidak ditemukan.");
        $this->assertEquals(0, (float) $level1->min_nominal);
        $this->assertEquals(50000000, (float) $level1->max_nominal);
        $this->assertFalse($level1->perlu_review_pp);

        $level2 = LevelPengadaan::where('nama', '50-200jt')->first();
        $this->assertNotNull($level2, "Level pengadaan 50-200jt tidak ditemukan.");
        $this->assertEquals(50000000, (float) $level2->min_nominal);
        $this->assertEquals(200000000, (float) $level2->max_nominal);
        $this->assertTrue($level2->perlu_review_pp);

        $level3 = LevelPengadaan::where('nama', '>200jt')->first();
        $this->assertNotNull($level3, "Level pengadaan >200jt tidak ditemukan.");
        $this->assertEquals(200000000, (float) $level3->min_nominal);
        $this->assertNull($level3->max_nominal);
        $this->assertFalse($level3->perlu_review_pp);
    }

    public function test_master_reference_seeder_bersifat_idempoten(): void
    {
        $this->seed(MasterReferenceSeeder::class);
        $this->seed(MasterReferenceSeeder::class);

        $this->assertSame(4, Mak::count());
        $this->assertSame(3, JenisPengadaan::count());
        $this->assertSame(4, MetodePengadaan::count());
        $this->assertSame(3, LevelPengadaan::count());
    }
}
