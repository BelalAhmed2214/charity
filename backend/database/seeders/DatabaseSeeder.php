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
            'password' => '123456'
        ]);
        User::create([
            'name' => 'Ahmed',
            'email' => 'ahmed@gmail.com',
            'phone' => '01203376448',
            'role' => UserRole::USER,
            'password' => '123456'
        ]);
        // User::create([
        //     'name' => 'Omar',
        //     'email' => 'omar@gmail.com',
        //     'phone' => '01203376447',
        //     // 'role' => 'user',
        //     'password' => '123456'
        // ]);
        // User::create([
        //     'name' => 'Hazem',
        //     'email' => 'hazem@gmail.com',
        //     'phone' => '01203376446',
        //     // 'role' => 'user',
        //     'password' => '123456'
        // ]);
    }
}
