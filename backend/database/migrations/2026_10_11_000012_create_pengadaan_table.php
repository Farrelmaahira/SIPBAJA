<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pengadaan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('permohonan_id')->constrained('permohonan');
            $table->unsignedBigInteger('permohonan_mak_id');
            $table->foreignId('jenis_id')->constrained('jenis_pengadaan');
            $table->foreignId('metode_id')->nullable()->constrained('metode_pengadaan')->nullOnDelete();
            $table->foreignId('level_id')->constrained('level_pengadaan');
            $table->foreignId('ppk_id')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('nominal', 19, 2);
            $table->unsignedInteger('revisi_ke')->default(0);
            $table->string('status');
            $table->timestamp('created_at')->useCurrent();
            $table->foreign(['permohonan_id', 'permohonan_mak_id'], 'pengadaan_mak_fk')
                ->references(['permohonan_id', 'id'])
                ->on('permohonan_mak');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pengadaan');
    }
};
