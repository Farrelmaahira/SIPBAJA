<?php

namespace Tests\Feature\Perencanaan;

use App\Models\Mak;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PerencanaanMakTest extends TestCase
{
    use RefreshDatabase;

    private User $perencanaan;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
        $this->perencanaan = User::whereHas('Role', fn ($q) => $q->where('nama', 'Perencanaan'))->firstOrFail();
    }

    public function test_perencanaan_can_toggle_mak_status(): void
    {
        $mak = Mak::firstOrFail();
        $initialStatus = (bool) ($mak->isActive ?? true);

        $response = $this->actingAs($this->perencanaan, 'sanctum')
            ->patchJson("/api/v1/perencanaan/jenis-mak/{$mak->id}/toggle-status");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'mak' => ['id', 'nama', 'isActive'],
            ]);

        $this->assertSame(! $initialStatus, (bool) $mak->fresh()->isActive);

        // Toggle back
        $response2 = $this->actingAs($this->perencanaan, 'sanctum')
            ->patchJson("/api/v1/perencanaan/jenis-mak/{$mak->id}/toggle-status");

        $response2->assertStatus(200);
        $this->assertSame($initialStatus, (bool) $mak->fresh()->isActive);
    }
}
