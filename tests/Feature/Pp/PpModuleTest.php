<?php

namespace Tests\Feature\Pp;

use App\Models\ApprovalPengadaan;
use App\Models\JenisPengadaan;
use App\Models\LevelPengadaan;
use App\Models\Mak;
use App\Models\Notification;
use App\Models\Pengadaan;
use App\Models\Permohonan;
use App\Models\PermohonanMak;
use App\Models\Role;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PpModuleTest extends TestCase
{
    use RefreshDatabase;

    private User $ppUser;

    private User $nonPpUser;

    private Pengadaan $samplePengadaan;

    protected function setUp(): void
    {
        parent::setUp();

        $rolePp = Role::firstOrCreate(['nama' => 'PP']);
        $rolePemohon = Role::firstOrCreate(['nama' => 'Pemohon']);

        $this->ppUser = User::firstOrCreate(
            ['email' => 'test_pp@pnj.ac.id'],
            [
                'nama' => 'Test PP User',
                'password' => 'password123',
                'role_id' => $rolePp->id,
            ]
        );

        $this->nonPpUser = User::firstOrCreate(
            ['email' => 'test_pemohon@pnj.ac.id'],
            [
                'nama' => 'Test Pemohon User',
                'password' => 'password123',
                'role_id' => $rolePemohon->id,
            ]
        );

        $unit = Unit::firstOrCreate(['nama' => 'Unit Testing']);
        $levelPp = LevelPengadaan::firstOrCreate(
            ['nama' => '50-200jt'],
            [
                'min_nominal' => 50000000,
                'max_nominal' => 200000000,
                'perlu_review_pp' => true,
            ]
        );
        $jenis = JenisPengadaan::firstOrCreate(['nama' => 'Barang']);
        $mak = Mak::firstOrCreate(
            ['nama' => 'MAK Test 532111'],
            ['ppk_user_id' => $this->ppUser->id]
        );

        $permohonan = Permohonan::firstOrCreate(
            ['nomor_surat' => 'TEST-001-PP'],
            [
                'unit_id' => $unit->id,
                'created_by' => $this->nonPpUser->id,
                'judul' => 'Pengadaan Komputer Uji Coba',
                'ringkasan_tujuan' => 'Kebutuhan uji coba otomatis',
                'estimasi_anggaran' => 75000000,
                'status' => 'disetujui',
            ]
        );

        $permohonanMak = PermohonanMak::firstOrCreate(
            [
                'permohonan_id' => $permohonan->id,
                'mak_id' => $mak->id,
            ],
            [
                'ditentukan_oleh' => $this->ppUser->id,
            ]
        );

        $this->samplePengadaan = Pengadaan::firstOrCreate(
            [
                'permohonan_id' => $permohonan->id,
                'permohonan_mak_id' => $permohonanMak->id,
            ],
            [
                'jenis_id' => $jenis->id,
                'level_id' => $levelPp->id,
                'ppk_id' => $this->ppUser->id,
                'nominal' => 75000000,
                'revisi_ke' => 0,
                'status' => 'menunggu_persetujuan',
            ]
        );
    }

    public function test_guest_cannot_access_pp_dashboard(): void
    {
        $response = $this->get(route('pp.dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_non_pp_user_cannot_access_pp_dashboard(): void
    {
        $response = $this->actingAs($this->nonPpUser)->get(route('pp.dashboard'));
        $response->assertStatus(403);
    }

    public function test_pp_user_can_access_dashboard(): void
    {
        $response = $this->actingAs($this->ppUser)->get(route('pp.dashboard'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Pp/Dashboard'));
    }

    public function test_pp_user_can_access_list_pengajuan(): void
    {
        $response = $this->actingAs($this->ppUser)->get(route('pp.pengajuan.index'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Pp/Pengajuan/Index'));
    }

    public function test_pp_user_can_view_review_page(): void
    {
        $response = $this->actingAs($this->ppUser)->get(route('pp.pengajuan.review', $this->samplePengadaan));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Pp/Pengajuan/Review'));
    }

    public function test_pp_user_can_approve_pengadaan(): void
    {
        $this->samplePengadaan->update(['status' => 'menunggu_persetujuan']);

        $response = $this->actingAs($this->ppUser)
            ->post(route('pp.pengajuan.approve', $this->samplePengadaan));

        $response->assertRedirect(route('pp.pengajuan.index'));
        $response->assertSessionHas('success');

        $this->samplePengadaan->refresh();
        $this->assertEquals('diteruskan', $this->samplePengadaan->status);

        $this->assertDatabaseHas('approval_pengadaan', [
            'pengadaan_id' => $this->samplePengadaan->id,
            'tahap' => 'PP',
            'keputusan' => 'disetujui',
            'actor_id' => $this->ppUser->id,
        ]);
    }

    public function test_pp_user_can_reject_pengadaan_with_reason(): void
    {
        $this->samplePengadaan->update(['status' => 'menunggu_persetujuan']);

        $response = $this->actingAs($this->ppUser)
            ->post(route('pp.pengajuan.reject', $this->samplePengadaan), [
                'alasan' => 'Spesifikasi teknis belum memenuhi standar laboratorium.',
            ]);

        $response->assertRedirect(route('pp.pengajuan.index'));
        $response->assertSessionHas('success');

        $this->samplePengadaan->refresh();
        $this->assertEquals('ditolak', $this->samplePengadaan->status);

        $this->assertDatabaseHas('approval_pengadaan', [
            'pengadaan_id' => $this->samplePengadaan->id,
            'tahap' => 'PP',
            'keputusan' => 'ditolak',
            'alasan' => 'Spesifikasi teknis belum memenuhi standar laboratorium.',
            'actor_id' => $this->ppUser->id,
        ]);
    }

    public function test_pp_reject_requires_reason(): void
    {
        $this->samplePengadaan->update(['status' => 'menunggu_persetujuan']);

        $response = $this->actingAs($this->ppUser)
            ->post(route('pp.pengajuan.reject', $this->samplePengadaan), [
                'alasan' => '',
            ]);

        $response->assertSessionHasErrors('alasan');
    }

    public function test_pp_user_can_view_rekap_pengajuan(): void
    {
        $response = $this->actingAs($this->ppUser)->get(route('pp.pengajuan.show', $this->samplePengadaan));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Pp/Pengajuan/Show'));
    }

    public function test_pp_user_can_view_notifications_and_mark_read(): void
    {
        Notification::create([
            'user_id' => $this->ppUser->id,
            'channel' => 'in_app',
            'judul' => 'Pengingat Test',
            'pesan' => 'Pesan pengingat test.',
            'read_at' => null,
        ]);

        $response = $this->actingAs($this->ppUser)->get(route('pp.notifikasi.index'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Pp/Notifikasi/Index'));

        $readResponse = $this->actingAs($this->ppUser)->post(route('pp.notifikasi.readAll'));
        $readResponse->assertRedirect();

        $this->assertDatabaseMissing('notifications', [
            'user_id' => $this->ppUser->id,
            'read_at' => null,
        ]);
    }

    public function test_pp_user_can_view_profile(): void
    {
        $response = $this->actingAs($this->ppUser)->get(route('pp.profil.index'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Pp/Profil/Index'));
    }
}
