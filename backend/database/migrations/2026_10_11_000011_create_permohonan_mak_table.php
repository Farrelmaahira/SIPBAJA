<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('permohonan_mak', function (Blueprint $table) {
            $table->id();
            $table->foreignId('permohonan_id')->constrained('permohonan')->cascadeOnDelete();
            $table->foreignId('mak_id')->constrained('maks');
            $table->foreignId('ditentukan_oleh')->constrained('users');
            $table->timestamp('created_at')->useCurrent();
            $table->unique(['permohonan_id', 'mak_id']);
            $table->unique(['permohonan_id', 'id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('permohonan_mak');
    }
};
