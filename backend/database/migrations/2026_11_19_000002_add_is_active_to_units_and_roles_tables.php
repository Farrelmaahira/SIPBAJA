<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('units', function (Blueprint $table) {
            if (! Schema::hasColumn('units', 'isActive')) {
                $table->boolean('isActive')->default(true);
            }
        });

        Schema::table('roles', function (Blueprint $table) {
            if (! Schema::hasColumn('roles', 'isActive')) {
                $table->boolean('isActive')->default(true);
            }
        });
    }

    public function down(): void
    {
        Schema::table('units', function (Blueprint $table) {
            if (Schema::hasColumn('units', 'isActive')) {
                $table->dropColumn('isActive');
            }
        });

        Schema::table('roles', function (Blueprint $table) {
            if (Schema::hasColumn('roles', 'isActive')) {
                $table->dropColumn('isActive');
            }
        });
    }
};
