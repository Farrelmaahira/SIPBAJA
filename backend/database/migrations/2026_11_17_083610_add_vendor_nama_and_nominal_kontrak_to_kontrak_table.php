<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('kontrak', function (Blueprint $table) {
            $table->string('vendor_nama')->nullable()->after('tanggal');
            $table->decimal('nominal_kontrak', 19, 2)->nullable()->after('vendor_nama');
        });
    }

    public function down(): void
    {
        Schema::table('kontrak', function (Blueprint $table) {
            $table->dropColumn(['vendor_nama', 'nominal_kontrak']);
        });
    }
};
