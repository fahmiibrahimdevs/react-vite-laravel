<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;

/**
 * Repository untuk operasi database tabel users.
 * Menggunakan Query Builder (DB facade) — tanpa Eloquent relationship.
 */
class UserRepository
{
    protected string $table = 'users';

    /**
     * Cari user berdasarkan email.
     */
    public function findByEmail(string $email): ?object
    {
        return DB::table($this->table)->where('email', $email)->first();
    }

    /**
     * Cari user berdasarkan ID.
     */
    public function findById(int $id): ?object
    {
        return DB::table($this->table)->where('id', $id)->first();
    }

    /**
     * Daftar user dengan paginasi & filter.
     */
    public function paginate(int $page, int $limit, string $role = '', string $status = ''): array
    {
        $query = DB::table($this->table)->orderBy('created_at', 'desc');

        if ($role) {
            $query->where('role', $role);
        }

        if ($status) {
            $query->where('status', $status);
        }

        $total = $query->count();
        $data  = $query->offset(($page - 1) * $limit)->limit($limit)->get();

        return [
            'data'  => $data,
            'total' => $total,
            'totalPages' => max(1, (int) ceil($total / $limit)),
        ];
    }

    /**
     * Buat user baru.
     */
    public function create(array $data): int
    {
        return DB::table($this->table)->insertGetId(array_merge($data, [
            'created_at' => now(),
            'updated_at' => now(),
        ]));
    }

    /**
     * Update user berdasarkan ID.
     */
    public function update(int $id, array $data): int
    {
        return DB::table($this->table)->where('id', $id)->update(array_merge($data, [
            'updated_at' => now(),
        ]));
    }

    /**
     * Hapus user berdasarkan ID.
     */
    public function delete(int $id): int
    {
        return DB::table($this->table)->where('id', $id)->delete();
    }
}
