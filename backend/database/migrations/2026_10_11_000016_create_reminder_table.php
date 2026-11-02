<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reminder', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rencana_pembayaran_id')->constrained('rencana_pembayaran')->cascadeOnDelete();
            $table->date('tanggal_reminder');
            $table->string('jenis');
            $table->foreignId('dibuat_oleh')->constrained('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reminder');
    }
};
