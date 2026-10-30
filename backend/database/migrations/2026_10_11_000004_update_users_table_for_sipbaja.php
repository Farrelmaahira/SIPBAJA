<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->renameColumn('name', 'nama');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('role_id')->after('id')->constrained('roles');
            $table->foreignId('unit_id')->after('role_id')->nullable()->constrained('units')->nullOnDelete();
            $table->softDeletes()->after('password');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropRememberToken();
            $table->dropColumn('email_verified_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropConstrainedForeignId('unit_id');
            $table->dropConstrainedForeignId('role_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->renameColumn('nama', 'name');
        });
    }
};
