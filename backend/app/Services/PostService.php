<?php

namespace App\Services;

use App\Repositories\PostRepository;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Service layer untuk logika bisnis Post & file management.
 */
class PostService
{
    public function __construct(
        protected PostRepository $postRepo
    ) {}

    /**
     * Daftar post milik user (paginated).
     */
    public function list(int $userId, int $page, int $limit, string $search = ''): array
    {
        $result = $this->postRepo->paginateByUser($userId, $page, $limit, $search);

        return [
            'data' => $result['data']->map(fn ($post) => $this->format($post))->values()->all(),
            'meta' => [
                'page'       => $page,
                'limit'      => $limit,
                'total'      => $result['total'],
                'totalPages' => $result['totalPages'],
            ],
        ];
    }

    /**
     * Tampilkan satu post (milik user).
     */
    public function show(int $id, int $userId): ?array
    {
        $post = $this->postRepo->findByIdAndUser($id, $userId);

        return $post ? $this->format($post) : null;
    }

    /**
     * Buat post baru.
     */
    public function create(int $userId, array $data): array
    {
        $post = $this->postRepo->create([
            'user_id'   => $userId,
            'title'     => $data['title'],
            'content'   => $data['content'] ?? null,
            'published' => $data['published'] ?? false,
        ]);

        return $this->format($post);
    }

    /**
     * Update post.
     */
    public function update(int $id, int $userId, array $data): ?array
    {
        $post = $this->postRepo->findByIdAndUser($id, $userId);
        if (! $post) return null;

        $updateData = [];
        if (isset($data['title']))     $updateData['title']     = $data['title'];
        if (isset($data['content']))   $updateData['content']   = $data['content'];
        if (isset($data['published'])) $updateData['published'] = $data['published'];

        $updated = $this->postRepo->update($id, $updateData);

        return $this->format($updated);
    }

    /**
     * Hapus post beserta file fisiknya.
     */
    public function delete(int $id, int $userId): bool
    {
        $post = $this->postRepo->findByIdAndUser($id, $userId);
        if (! $post) return false;

        // Hapus file fisik
        foreach ($post->files as $file) {
            Storage::disk('public')->delete('uploads/posts/' . $file->filename);
        }

        $this->postRepo->delete($id);
        return true;
    }

    // ─── File Operations ────────────────────────────────────────────

    /**
     * Upload file-file ke post.
     * Menerima array UploadedFile — handle baik dari field "files" maupun "files[]".
     *
     * @param  int             $postId
     * @param  int             $userId
     * @param  UploadedFile[]  $files
     * @return array|null      null jika post tidak ditemukan
     */
    public function uploadFiles(int $postId, int $userId, array $files): ?array
    {
        $post = $this->postRepo->findByIdAndUser($postId, $userId);
        if (! $post) return null;

        $uploaded = [];

        foreach ($files as $file) {
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $file->storeAs('uploads/posts', $filename, 'public');

            $record = $this->postRepo->createFile([
                'post_id'       => $postId,
                'filename'      => $filename,
                'original_name' => $file->getClientOriginalName(),
                'mime_type'     => $file->getMimeType(),
                'size'          => $file->getSize(),
            ]);

            $uploaded[] = $this->formatFile($record);
        }

        return $uploaded;
    }

    /**
     * Hapus satu file dari post.
     */
    public function deleteFile(int $postId, int $fileId, int $userId): bool
    {
        $post = $this->postRepo->findByIdAndUser($postId, $userId);
        if (! $post) return false;

        $file = $this->postRepo->findFileByIdAndPost($fileId, $postId);
        if (! $file) return false;

        Storage::disk('public')->delete('uploads/posts/' . $file->filename);
        $this->postRepo->deleteFile($fileId);

        return true;
    }

    // ─── Formatters ─────────────────────────────────────────────────

    /**
     * Format post untuk response JSON (camelCase).
     */
    private function format(object $post): array
    {
        $files = is_array($post->files) ? $post->files : [];

        return [
            'id'        => $post->id,
            'title'     => $post->title,
            'content'   => $post->content,
            'published' => (bool) $post->published,
            'files'     => array_map(fn ($f) => $this->formatFile($f), $files),
            'createdAt' => $post->created_at,
            'updatedAt' => $post->updated_at,
        ];
    }

    /**
     * Format file untuk response JSON (camelCase).
     */
    private function formatFile(object $file): array
    {
        return [
            'id'           => $file->id,
            'filename'     => $file->filename,
            'originalName' => $file->original_name,
            'mimeType'     => $file->mime_type,
            'size'         => $file->size,
            'path'         => 'storage/uploads/posts/' . $file->filename,
        ];
    }
}
