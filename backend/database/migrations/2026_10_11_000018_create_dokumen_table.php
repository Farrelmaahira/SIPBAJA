<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dokumen', function (Blueprint $table) {
            $table->id();
            $table->string('ref_type');
            $table->unsignedBigInteger('ref_id');
            $table->string('tipe_dokumen');
            $table->unsignedInteger('versi');
            $table->string('nama_asli');
            $table->string('nama_hash');
            $table->string('mime_type');
            $table->unsignedBigInteger('ukuran_bytes');
            $table->foreignId('uploaded_by')->constrained('users');
            $table->timestamp('created_at')->useCurrent();
            $table->index(['ref_type', 'ref_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dokumen');
    }
};
