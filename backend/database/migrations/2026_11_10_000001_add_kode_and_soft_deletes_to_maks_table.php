<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('maks', function (Blueprint $table) {
            if (! Schema::hasColumn('maks', 'kode')) {
                $table->string('kode', 50)->nullable()->after('id');
            }
            if (! Schema::hasColumn('maks', 'deleted_at')) {
                $table->softDeletes();
            }
        });
    }

    public function down(): void
    {
        Schema::table('maks', function (Blueprint $table) {
            if (Schema::hasColumn('maks', 'kode')) {
                $table->dropColumn('kode');
            }
            if (Schema::hasColumn('maks', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
        });
    }
};
