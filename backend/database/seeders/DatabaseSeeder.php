<?php

namespace Database\Seeders;

use App\Enums\UserRole;
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
        // User::factory(10)->create();

        User::create([
            'name' => 'Belal',
            'email' => 'belal@gmail.com',
            'phone' => '01203376449',
            'role' => UserRole::ADMIN,
            'password' => '12345678',
            'must_change_password' => false
        ]);
    }
}
