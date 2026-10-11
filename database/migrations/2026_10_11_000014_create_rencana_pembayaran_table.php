<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rencana_pembayaran', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kontrak_id')->constrained('kontrak')->cascadeOnDelete();
            $table->unsignedInteger('termin_ke');
            $table->decimal('nominal_rencana', 19, 2);
            $table->date('tanggal_jatuh_tempo')->nullable();
            $table->string('status');
            $table->timestamp('created_at')->useCurrent();
            $table->unique(['kontrak_id', 'termin_ke']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rencana_pembayaran');
    }
};
