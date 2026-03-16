<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PostService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PostController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected PostService $postService
    ) {}

    /**
     * Daftar post milik pengguna (paginated + pencarian).
     */
    public function index(Request $request): JsonResponse
    {
        $result = $this->postService->list(
            $request->user()->id,
            (int) $request->input('page', 1),
            (int) $request->input('limit', 10),
            (string) $request->input('search', '')
        );

        return $this->paginated($result['data'], $result['meta']);
    }

    /**
     * Buat post baru.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title'     => 'required|string|max:255',
            'content'   => 'nullable|string',
            'published' => 'sometimes|boolean',
        ], [
            'title.required' => 'Judul wajib diisi',
            'title.max'      => 'Judul maksimal 255 karakter',
        ]);

        if ($validator->fails()) {
            return $this->validationError('Validasi gagal', $validator);
        }

        $post = $this->postService->create(
            $request->user()->id,
            $request->only(['title', 'content', 'published'])
        );

        return $this->success($post, 'Post berhasil dibuat', 201);
    }

    /**
     * Tampilkan detail satu post.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $post = $this->postService->show($id, $request->user()->id);

        if (! $post) {
            return $this->error('Post tidak ditemukan', 404);
        }

        return $this->success($post);
    }

    /**
     * Update post.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title'     => 'sometimes|required|string|max:255',
            'content'   => 'nullable|string',
            'published' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return $this->validationError('Validasi gagal', $validator);
        }

        $post = $this->postService->update(
            $id,
            $request->user()->id,
            $request->only(['title', 'content', 'published'])
        );

        if (! $post) {
            return $this->error('Post tidak ditemukan', 404);
        }

        return $this->success($post, 'Post berhasil diperbarui');
    }

    /**
     * Hapus post beserta file-filenya.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $deleted = $this->postService->delete($id, $request->user()->id);

        if (! $deleted) {
            return $this->error('Post tidak ditemukan', 404);
        }

        return $this->success(message: 'Post berhasil dihapus');
    }

    /**
     * Upload file ke post.
     * Frontend mengirim field "files" (tanpa brackets) via FormData.append("files", file).
     * Laravel menerima ini sebagai single file jika 1 file, atau array jika >1.
     * Kita handle kedua kasus.
     */
    public function uploadFiles(Request $request, int $id): JsonResponse
    {
        // Normalisasi: pastikan files selalu array
        $files = $request->file('files');

        if (! $files) {
            return $this->error('File wajib diupload', 422);
        }

        // Jika single file (bukan array), bungkus jadi array
        if (! is_array($files)) {
            $files = [$files];
        }

        // Validasi setiap file
        foreach ($files as $file) {
            if (! $file->isValid()) {
                return $this->error('Ada file yang tidak valid', 422);
            }
            if ($file->getSize() > 10 * 1024 * 1024) {
                return $this->error('Ukuran file maksimal 10MB', 422);
            }
        }

        $result = $this->postService->uploadFiles($id, $request->user()->id, $files);

        if ($result === null) {
            return $this->error('Post tidak ditemukan', 404);
        }

        return $this->success($result, 'File berhasil diupload');
    }

    /**
     * Hapus satu file dari post.
     */
    public function removeFile(Request $request, int $postId, int $fileId): JsonResponse
    {
        $deleted = $this->postService->deleteFile($postId, $fileId, $request->user()->id);

        if (! $deleted) {
            return $this->error('File tidak ditemukan', 404);
        }

        return $this->success(message: 'File berhasil dihapus');
    }
}
