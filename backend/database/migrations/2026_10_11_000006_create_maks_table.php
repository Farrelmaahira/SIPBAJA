<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maks', function (Blueprint $table) {
            $table->id();
            $table->string('nama')->unique();
            $table->foreignId('ppk_user_id')->constrained('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maks');
    }
};
