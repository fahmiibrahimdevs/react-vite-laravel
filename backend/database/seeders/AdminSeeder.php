<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name'     => 'Administrator',
                'password' => 'password',
                'role'     => 'ADMIN',
                'status'   => 'ACTIVE',
            ]
        );

        User::updateOrCreate(
            ['email' => 'user@user.com'],
            [
                'name'     => 'User Biasa',
                'password' => 'password',
                'role'     => 'USER',
                'status'   => 'ACTIVE',
            ]
        );
    }
}
