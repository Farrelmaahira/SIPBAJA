<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('rencana_pembayaran', function (Blueprint $table) {
            $table->dropUnique(['kontrak_id', 'termin_ke']);
            $table->dropColumn('termin_ke');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rencana_pembayaran', function (Blueprint $table) {
            $table->unsignedInteger('termin_ke')->after('kontrak_id');
            $table->unique(['kontrak_id', 'termin_ke']);
        });
    }
};
