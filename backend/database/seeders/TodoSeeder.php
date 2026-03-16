<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TodoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get users
        $adminId = DB::table('users')->where('email', 'admin@admin.com')->value('id');
        $userId = DB::table('users')->where('email', 'user@user.com')->value('id');

        // Seed todos for admin
        if ($adminId) {
            DB::table('todos')->insert([
                [
                    'user_id'    => $adminId,
                    'title'      => 'Review Kode Aplikasi',
                    'description' => 'Lakukan review menyeluruh terhadap clean architecture dan JWT implementation',
                    'completed'  => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'user_id'    => $adminId,
                    'title'      => 'Update Dokumentasi API',
                    'description' => 'Lengkapi dokumentasi untuk semua endpoint REST API',
                    'completed'  => false,
                    'created_at' => now()->subDays(1),
                    'updated_at' => now()->subDays(1),
                ],
                [
                    'user_id'    => $adminId,
                    'title'      => 'Setup Production Server',
                    'description' => 'Konfigurasi server production dengan SSL dan monitoring',
                    'completed'  => true,
                    'created_at' => now()->subDays(5),
                    'updated_at' => now()->subDays(5),
                ],
                [
                    'user_id'    => $adminId,
                    'title'      => 'Testing Unit Tests',
                    'description' => 'Buat unit tests untuk semua Service classes',
                    'completed'  => false,
                    'created_at' => now()->subDays(2),
                    'updated_at' => now()->subDays(2),
                ],
            ]);
        }

        // Seed todos for regular user
        if ($userId) {
            DB::table('todos')->insert([
                [
                    'user_id'    => $userId,
                    'title'      => 'Belajar Clean Architecture',
                    'description' => 'Pelajari konsep Clean Architecture dan implementasinya',
                    'completed'  => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'user_id'    => $userId,
                    'title'      => 'Membuat Feature Baru',
                    'description' => 'Implementasi fitur dashboard analytics',
                    'completed'  => false,
                    'created_at' => now()->subDays(1),
                    'updated_at' => now()->subDays(1),
                ],
                [
                    'user_id'    => $userId,
                    'title'      => 'Fix Bug di Frontend',
                    'description' => 'Perbaiki issue pagination dan search',
                    'completed'  => true,
                    'created_at' => now()->subDays(3),
                    'updated_at' => now()->subDays(3),
                ],
            ]);
        }
    }
}
