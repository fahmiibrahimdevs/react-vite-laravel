<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TodoService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TodoController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected TodoService $todoService
    ) {}

    /**
     * Daftar todo milik pengguna (paginated + pencarian).
     */
    public function index(Request $request): JsonResponse
    {
        $result = $this->todoService->list(
            $request->user()->id,
            (int) $request->input('page', 1),
            (int) $request->input('limit', 10),
            (string) $request->input('search', '')
        );

        return $this->paginated($result['data'], $result['meta']);
    }

    /**
     * Buat todo baru.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
        ], [
            'title.required' => 'Judul wajib diisi',
            'title.max'      => 'Judul maksimal 255 karakter',
        ]);

        if ($validator->fails()) {
            return $this->validationError('Validasi gagal', $validator);
        }

        $todo = $this->todoService->create(
            $request->user()->id,
            $request->only(['title', 'description'])
        );

        return $this->success($todo, 'Data berhasil dibuat', 201);
    }

    /**
     * Tampilkan detail satu todo.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $todo = $this->todoService->show($id, $request->user()->id);

        if (! $todo) {
            return $this->error('Todo tidak ditemukan', 404);
        }

        return $this->success($todo);
    }

    /**
     * Update todo.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title'       => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'completed'   => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return $this->validationError('Validasi gagal', $validator);
        }

        $todo = $this->todoService->update(
            $id,
            $request->user()->id,
            $request->only(['title', 'description', 'completed'])
        );

        if (! $todo) {
            return $this->error('Todo tidak ditemukan', 404);
        }

        return $this->success($todo, 'Data berhasil diperbarui');
    }

    /**
     * Hapus todo.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $deleted = $this->todoService->delete($id, $request->user()->id);

        if (! $deleted) {
            return $this->error('Todo tidak ditemukan', 404);
        }

        return $this->success(message: 'Data berhasil dihapus');
    }
}
