<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('approval_pengadaan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pengadaan_id')->constrained('pengadaan')->cascadeOnDelete();
            $table->string('tahap');
            $table->unsignedInteger('revisi_ke');
            $table->string('keputusan');
            $table->text('alasan')->nullable();
            $table->foreignId('bukti_tanda_tangan_id')->nullable()->constrained('dokumen')->nullOnDelete();
            $table->foreignId('actor_id')->constrained('users');
            $table->timestamp('created_at')->useCurrent();
            $table->unique(['pengadaan_id', 'tahap', 'revisi_ke']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('approval_pengadaan');
    }
};
