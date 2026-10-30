<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('level_pengadaan', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->decimal('min_nominal', 19, 2);
            $table->decimal('max_nominal', 19, 2)->nullable();
            $table->boolean('perlu_review_pp');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('level_pengadaan');
    }
};
