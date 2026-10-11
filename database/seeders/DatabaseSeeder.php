<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
        ]);

        User::factory()->create([
            'role_id' => Role::where('nama', 'Admin')->firstOrFail()->id,
            'nama' => 'Test User',
            'email' => 'test@example.com',
        ]);
    }
}
