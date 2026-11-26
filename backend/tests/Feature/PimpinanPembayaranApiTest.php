<?php

namespace Tests\Feature;

use App\Models\Dokumen;
use App\Models\JenisPengadaan;
use App\Models\Kontrak;
use App\Models\LevelPengadaan;
use App\Models\Mak;
use App\Models\MetodePengadaan;
use App\Models\Pembayaran;
use App\Models\Pengadaan;
use App\Models\Permohonan;
use App\Models\PermohonanMak;
use App\Models\RencanaPembayaran;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PimpinanPembayaranApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $ppbjUser;

    protected User $ppkUser;

    protected User $bidang2User;

    protected Pengadaan $pengadaan;

    protected Pembayaran $pembayaran;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');

        $this->seed();

        $this->ppbjUser = User::where('email', 'ppbj@pnj.ac.id')->firstOrFail();
        $this->ppkUser = User::where('email', 'ppk.blufisik@pnj.ac.id')->firstOrFail();
        $this->bidang2User = User::where('email', 'bidang2@pnj.ac.id')->firstOrFail();

        // Siapkan paket pengadaan yang berstatus pembayaran dengan kontrak & termin
        $unit = Unit::first() ?? Unit::create(['kode' => 'TI', 'nama' => 'Teknik Informatika']);
        $mak = Mak::first() ?? Mak::create(['kode' => 'MAK-TEST-001', 'nama' => 'Pengadaan Komputer', 'ppk_user_id' => $this->ppkUser->id]);
        $jenis = JenisPengadaan::first() ?? JenisPengadaan::create(['kode' => 'BARANG', 'nama' => 'Pengadaan Barang']);
        $metode = MetodePengadaan::first() ?? MetodePengadaan::create(['kode' => 'E_PURCHASING', 'nama' => 'E-Purchasing']);
        $level = LevelPengadaan::first() ?? LevelPengadaan::create(['kode' => 'LEVEL_1', 'nama' => 'Level 1']);

        $permohonan = Permohonan::first() ?? Permohonan::create([
            'unit_id' => $unit->id,
            'created_by' => $this->ppbjUser->id,
            'nomor_surat' => 'SRT/TEST/2026/01',
            'judul' => 'Pengadaan Fasilitas Lab Komputer',
            'status' => 'disetujui',
        ]);

        $pm = PermohonanMak::create([
            'permohonan_id' => $permohonan->id,
            'mak_id' => $mak->id,
            'nominal' => 75000000,
            'ditentukan_oleh' => $this->bidang2User->id,
        ]);

        $this->pengadaan = Pengadaan::create([
            'permohonan_id' => $permohonan->id,
            'permohonan_mak_id' => $pm->id,
            'jenis_id' => $jenis->id,
            'metode_id' => $metode->id,
            'level_id' => $level->id,
            'ppk_id' => $this->ppkUser->id,
            'status' => 'pembayaran',
        ]);

        $kontrak = Kontrak::create([
            'pengadaan_id' => $this->pengadaan->id,
            'tipe' => 'spk',
            'nomor' => 'SPK/2026/001',
            'tanggal' => now(),
            'vendor_nama' => 'PT Mitra Komputer Solusindo',
            'nominal_kontrak' => 75000000,
            'tanggal_jatuh_tempo' => now()->addDays(14),
            'status' => 'aktif',
        ]);

        $rencana = RencanaPembayaran::create([
            'kontrak_id' => $kontrak->id,
            'nominal_rencana' => 75000000,
            'tanggal_jatuh_tempo' => now()->addDays(14),
            'status' => 'belum_lunas',
        ]);

        $this->pembayaran = Pembayaran::create([
            'rencana_pembayaran_id' => $rencana->id,
            'status' => 'menunggu_persetujuan',
            'nominal' => 75000000,
            'revisi_ke' => 0,
        ]);

        // Simpan draf tagihan PPBJ
        Dokumen::create([
            'ref_type' => 'pembayaran',
            'ref_id' => $this->pembayaran->id,
            'tipe_dokumen' => 'dokumen_tagihan',
            'versi' => 1,
            'nama_asli' => 'Tagihan_Termin_1.pdf',
            'nama_hash' => 'dokumen/pembayaran/tagihan/tagihan_1.pdf',
            'mime_type' => 'application/pdf',
            'ukuran_bytes' => 10240,
            'uploaded_by' => $this->ppbjUser->id,
        ]);
    }

    public function test_ppk_can_approve_pembayaran_with_memo_pdf(): void
    {
        $memoFile = UploadedFile::fake()->create('memo_ppk.pdf', 200, 'application/pdf');

        $response = $this->actingAs($this->ppkUser)->postJson(
            route('api.ppk.pengajuan.pembayaran.approve', ['pengadaan' => $this->pengadaan->id]),
            [
                'memo' => $memoFile,
                'catatan' => 'Memo disetujui, spesifikasi barang sesuai fisik.',
            ]
        );

        $response->assertOk();
        $this->assertDatabaseHas('approval_pembayaran', [
            'pembayaran_id' => $this->pembayaran->id,
            'tahap' => 'PPK',
            'keputusan' => 'disetujui',
        ]);
    }

    public function test_bidang2_can_approve_pembayaran_with_memo_pdf(): void
    {
        $memoFile = UploadedFile::fake()->create('memo_bidang2.pdf', 250, 'application/pdf');

        $response = $this->actingAs($this->bidang2User)->postJson(
            route('api.bidang2.pengadaan.pembayaran.approve', ['pengadaan' => $this->pengadaan->id]),
            [
                'memo' => $memoFile,
                'catatan' => 'Pencairan disetujui Bidang 2.',
            ]
        );

        $response->assertOk();
        $this->assertDatabaseHas('approval_pembayaran', [
            'pembayaran_id' => $this->pembayaran->id,
            'tahap' => 'BIDANG2',
            'keputusan' => 'disetujui',
        ]);
    }

    public function test_approval_fails_without_memo_file(): void
    {
        $response = $this->actingAs($this->ppkUser)->postJson(
            route('api.ppk.pengajuan.pembayaran.approve', ['pengadaan' => $this->pengadaan->id]),
            [
                'catatan' => 'Tanpa file memo',
            ]
        );

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['memo']);
    }

    public function test_ppk_can_reject_pembayaran_with_mandatory_alasan(): void
    {
        $response = $this->actingAs($this->ppkUser)->postJson(
            route('api.ppk.pengajuan.pembayaran.reject', ['pengadaan' => $this->pengadaan->id]),
            [
                'alasan' => 'Rincian invoice termin belum menyertakan nomor rekening vendor resmi.',
            ]
        );

        $response->assertOk();
        $this->pembayaran->refresh();
        $this->assertEquals('perlu_revisi', $this->pembayaran->status);
        $this->assertDatabaseHas('approval_pembayaran', [
            'pembayaran_id' => $this->pembayaran->id,
            'tahap' => 'PPK',
            'keputusan' => 'ditolak',
            'alasan' => 'Rincian invoice termin belum menyertakan nomor rekening vendor resmi.',
        ]);
    }

    public function test_rejection_fails_without_alasan(): void
    {
        $response = $this->actingAs($this->bidang2User)->postJson(
            route('api.bidang2.pengadaan.pembayaran.reject', ['pengadaan' => $this->pengadaan->id]),
            []
        );

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['alasan']);
    }

    public function test_other_party_is_locked_when_one_party_has_rejected(): void
    {
        // PPK menolak pembayaran
        $this->actingAs($this->ppkUser)->postJson(
            route('api.ppk.pengajuan.pembayaran.reject', ['pengadaan' => $this->pengadaan->id]),
            ['alasan' => 'Tagihan keliru, perlu revisi PPBJ.']
        )->assertOk();

        // Bidang 2 mencoba menyetujui -> harus ditolak karena sedang terkunci penolakan
        $memoFile = UploadedFile::fake()->create('memo_bidang2.pdf', 250, 'application/pdf');
        $response = $this->actingAs($this->bidang2User)->postJson(
            route('api.bidang2.pengadaan.pembayaran.approve', ['pengadaan' => $this->pengadaan->id]),
            ['memo' => $memoFile]
        );

        $response->assertStatus(422);
    }

    public function test_bidang2_and_ppk_can_fetch_pembayaran_review_context(): void
    {
        $resBidang2 = $this->actingAs($this->bidang2User)->getJson(
            route('api.bidang2.pengadaan.pembayaran.review', ['pengadaan' => $this->pengadaan->id])
        );
        $resBidang2->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'pembayaran',
                    'dokumen_tagihan',
                    'approvals',
                    'dokumen_riwayat' => [
                        'permohonan',
                        'kontrak',
                    ],
                ],
            ]);

        $resPpk = $this->actingAs($this->ppkUser)->getJson(
            route('api.ppk.pengajuan.pembayaran.review', ['pengadaan' => $this->pengadaan->id])
        );
        $resPpk->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'pembayaran',
                    'dokumen_tagihan',
                    'approvals',
                    'dokumen_riwayat',
                ],
            ]);
    }
}
