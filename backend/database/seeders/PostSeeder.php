<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get users
        $adminId = DB::table('users')->where('email', 'admin@admin.com')->value('id');
        $userId = DB::table('users')->where('email', 'user@user.com')->value('id');

        // Seed posts for admin
        if ($adminId) {
            DB::table('posts')->insert([
                [
                    'user_id'    => $adminId,
                    'title'      => 'Panduan Menggunakan Aplikasi',
                    'content'    => 'Ini adalah panduan lengkap cara menggunakan aplikasi React Vite Laravel kami dengan benar.',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'user_id'    => $adminId,
                    'title'      => 'Update Fitur Terbaru',
                    'content'    => 'Kami telah menambahkan fitur-fitur baru yang lebih canggih dan user-friendly.',
                    'created_at' => now()->subDays(1),
                    'updated_at' => now()->subDays(1),
                ],
                [
                    'user_id'    => $adminId,
                    'title'      => 'Tips Keamanan Data',
                    'content'    => 'Selalu gunakan password yang kuat dan jangan bagikan kredensial Anda kepada orang lain.',
                    'created_at' => now()->subDays(2),
                    'updated_at' => now()->subDays(2),
                ],
            ]);
        }

        // Seed posts for regular user
        if ($userId) {
            DB::table('posts')->insert([
                [
                    'user_id'    => $userId,
                    'title'      => 'Pengalaman Pertama Saya',
                    'content'    => 'Senang sekali menggunakan aplikasi ini, sangat intuitif dan mudah digunakan.',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'user_id'    => $userId,
                    'title'      => 'Review Aplikasi',
                    'content'    => 'Rating 5 bintang, fitur lengkap dan performa bagus. Recommended!',
                    'created_at' => now()->subDays(3),
                    'updated_at' => now()->subDays(3),
                ],
            ]);
        }
    }
}
