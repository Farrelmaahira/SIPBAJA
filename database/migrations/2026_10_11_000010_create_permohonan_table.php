<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('permohonan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('unit_id')->constrained('units');
            $table->foreignId('created_by')->constrained('users');
            $table->string('nomor_surat');
            $table->string('judul');
            $table->text('ringkasan_tujuan');
            $table->decimal('estimasi_anggaran', 19, 2);
            $table->unsignedInteger('revisi_ke')->default(0);
            $table->string('status');
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('permohonan');
    }
};
