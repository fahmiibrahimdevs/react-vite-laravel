<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;

/**
 * Repository untuk operasi database tabel posts & post_files.
 * Menggunakan Query Builder dengan JOIN — tanpa Eloquent relationship.
 */
class PostRepository
{
    protected string $table = 'posts';
    protected string $filesTable = 'post_files';

    /**
     * Daftar post milik user dengan paginasi & pencarian.
     * File-file di-query terpisah lalu di-merge manual.
     */
    public function paginateByUser(int $userId, int $page, int $limit, string $search = ''): array
    {
        $query = DB::table($this->table)
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $total = $query->count();
        $posts = $query->offset(($page - 1) * $limit)->limit($limit)->get();

        // Ambil semua file milik post-post ini sekaligus (1 query, bukan N+1)
        if ($posts->isNotEmpty()) {
            $postIds = $posts->pluck('id')->toArray();
            $files = DB::table($this->filesTable)
                ->whereIn('post_id', $postIds)
                ->get()
                ->groupBy('post_id');

            $posts = $posts->map(function ($post) use ($files) {
                $post->files = $files->get($post->id, collect())->values()->all();
                return $post;
            });
        }

        return [
            'data'       => $posts,
            'total'      => $total,
            'totalPages' => max(1, (int) ceil($total / $limit)),
        ];
    }

    /**
     * Cari post berdasarkan ID & user_id, termasuk file-file-nya (JOIN).
     */
    public function findByIdAndUser(int $id, int $userId): ?object
    {
        $post = DB::table($this->table)
            ->where('id', $id)
            ->where('user_id', $userId)
            ->first();

        if ($post) {
            $post->files = DB::table($this->filesTable)
                ->where('post_id', $post->id)
                ->get()
                ->all();
        }

        return $post;
    }

    /**
     * Buat post baru.
     */
    public function create(array $data): object
    {
        $id = DB::table($this->table)->insertGetId(array_merge($data, [
            'created_at' => now(),
            'updated_at' => now(),
        ]));

        $post = DB::table($this->table)->where('id', $id)->first();
        $post->files = [];

        return $post;
    }

    /**
     * Update post.
     */
    public function update(int $id, array $data): object
    {
        DB::table($this->table)->where('id', $id)->update(array_merge($data, [
            'updated_at' => now(),
        ]));

        $post = DB::table($this->table)->where('id', $id)->first();
        $post->files = DB::table($this->filesTable)
            ->where('post_id', $id)
            ->get()
            ->all();

        return $post;
    }

    /**
     * Hapus post.
     */
    public function delete(int $id): int
    {
        // File records dihapus otomatis oleh CASCADE di migration
        return DB::table($this->table)->where('id', $id)->delete();
    }

    // ─── File Operations ────────────────────────────────────────────

    /**
     * Ambil semua file milik post.
     */
    public function getFilesByPostId(int $postId): array
    {
        return DB::table($this->filesTable)
            ->where('post_id', $postId)
            ->get()
            ->all();
    }

    /**
     * Simpan record file baru.
     */
    public function createFile(array $data): object
    {
        $id = DB::table($this->filesTable)->insertGetId(array_merge($data, [
            'created_at' => now(),
            'updated_at' => now(),
        ]));

        return DB::table($this->filesTable)->where('id', $id)->first();
    }

    /**
     * Cari file berdasarkan ID & post_id.
     */
    public function findFileByIdAndPost(int $fileId, int $postId): ?object
    {
        return DB::table($this->filesTable)
            ->where('id', $fileId)
            ->where('post_id', $postId)
            ->first();
    }

    /**
     * Hapus record file.
     */
    public function deleteFile(int $fileId): int
    {
        return DB::table($this->filesTable)->where('id', $fileId)->delete();
    }
}
