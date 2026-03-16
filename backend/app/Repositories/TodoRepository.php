<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;

/**
 * Repository untuk operasi database tabel todos.
 * Menggunakan Query Builder (DB facade).
 */
class TodoRepository
{
    protected string $table = 'todos';

    /**
     * Daftar todo milik user dengan paginasi & pencarian.
     */
    public function paginateByUser(int $userId, int $page, int $limit, string $search = ''): array
    {
        $query = DB::table($this->table)
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $total = $query->count();
        $data  = $query->offset(($page - 1) * $limit)->limit($limit)->get();

        return [
            'data'       => $data,
            'total'      => $total,
            'totalPages' => max(1, (int) ceil($total / $limit)),
        ];
    }

    /**
     * Cari todo berdasarkan ID & user_id (scope per user).
     */
    public function findByIdAndUser(int $id, int $userId): ?object
    {
        return DB::table($this->table)
            ->where('id', $id)
            ->where('user_id', $userId)
            ->first();
    }

    /**
     * Buat todo baru.
     */
    public function create(array $data): object
    {
        $id = DB::table($this->table)->insertGetId(array_merge($data, [
            'created_at' => now(),
            'updated_at' => now(),
        ]));

        return DB::table($this->table)->where('id', $id)->first();
    }

    /**
     * Update todo.
     */
    public function update(int $id, array $data): object
    {
        DB::table($this->table)->where('id', $id)->update(array_merge($data, [
            'updated_at' => now(),
        ]));

        return DB::table($this->table)->where('id', $id)->first();
    }

    /**
     * Hapus todo.
     */
    public function delete(int $id): int
    {
        return DB::table($this->table)->where('id', $id)->delete();
    }
}
