<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kontrak', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pengadaan_id')->unique()->constrained('pengadaan')->cascadeOnDelete();
            $table->string('tipe');
            $table->string('nomor');
            $table->date('tanggal');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kontrak');
    }
};
