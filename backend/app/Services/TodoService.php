<?php

namespace App\Services;

use App\Repositories\TodoRepository;

/**
 * Service layer untuk logika bisnis Todo.
 */
class TodoService
{
    public function __construct(
        protected TodoRepository $todoRepo
    ) {}

    /**
     * Daftar todo milik user (paginated).
     */
    public function list(int $userId, int $page, int $limit, string $search = ''): array
    {
        $result = $this->todoRepo->paginateByUser($userId, $page, $limit, $search);

        return [
            'data' => $result['data']->map(fn ($todo) => $this->format($todo))->values()->all(),
            'meta' => [
                'page'       => $page,
                'limit'      => $limit,
                'total'      => $result['total'],
                'totalPages' => $result['totalPages'],
            ],
        ];
    }

    /**
     * Tampilkan satu todo (milik user).
     */
    public function show(int $id, int $userId): ?array
    {
        $todo = $this->todoRepo->findByIdAndUser($id, $userId);

        return $todo ? $this->format($todo) : null;
    }

    /**
     * Buat todo baru.
     */
    public function create(int $userId, array $data): array
    {
        $todo = $this->todoRepo->create([
            'user_id'     => $userId,
            'title'       => $data['title'],
            'description' => $data['description'] ?? null,
            'completed'   => false,
        ]);

        return $this->format($todo);
    }

    /**
     * Update todo.
     */
    public function update(int $id, int $userId, array $data): ?array
    {
        $todo = $this->todoRepo->findByIdAndUser($id, $userId);
        if (! $todo) return null;

        $updateData = [];
        if (isset($data['title']))       $updateData['title']       = $data['title'];
        if (isset($data['description'])) $updateData['description'] = $data['description'];
        if (isset($data['completed']))   $updateData['completed']   = $data['completed'];

        $updated = $this->todoRepo->update($id, $updateData);

        return $this->format($updated);
    }

    /**
     * Hapus todo.
     */
    public function delete(int $id, int $userId): bool
    {
        $todo = $this->todoRepo->findByIdAndUser($id, $userId);
        if (! $todo) return false;

        $this->todoRepo->delete($id);
        return true;
    }

    /**
     * Format todo untuk response JSON (camelCase).
     */
    private function format(object $todo): array
    {
        return [
            'id'          => $todo->id,
            'title'       => $todo->title,
            'description' => $todo->description,
            'completed'   => (bool) $todo->completed,
            'createdAt'   => $todo->created_at,
            'updatedAt'   => $todo->updated_at,
        ];
    }
}
