<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pembayaran', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rencana_pembayaran_id')->unique()->constrained('rencana_pembayaran')->cascadeOnDelete();
            $table->decimal('nominal', 19, 2);
            $table->unsignedInteger('revisi_ke')->default(0);
            $table->string('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pembayaran');
    }
};
