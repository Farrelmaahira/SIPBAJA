<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('status_history', function (Blueprint $table) {
            $table->id();
            $table->string('ref_type');
            $table->unsignedBigInteger('ref_id');
            $table->string('status_lama')->nullable();
            $table->string('status_baru');
            $table->foreignId('actor_id')->constrained('users');
            $table->timestamp('created_at')->useCurrent();
            $table->index(['ref_type', 'ref_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('status_history');
    }
};
