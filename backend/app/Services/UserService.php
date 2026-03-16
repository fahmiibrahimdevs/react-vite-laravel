<?php

namespace App\Services;

use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Hash;

/**
 * Service layer untuk logika bisnis manajemen User (admin).
 */
class UserService
{
    public function __construct(
        protected UserRepository $userRepo
    ) {}

    /**
     * Daftar user (paginated + filter).
     */
    public function list(int $page, int $limit, string $role = '', string $status = ''): array
    {
        $result = $this->userRepo->paginate($page, $limit, $role, $status);

        return [
            'data' => $result['data']->map(fn ($user) => $this->format($user))->values()->all(),
            'meta' => [
                'page'       => $page,
                'limit'      => $limit,
                'total'      => $result['total'],
                'totalPages' => $result['totalPages'],
            ],
        ];
    }

    /**
     * Tampilkan satu user.
     */
    public function show(int $id): ?array
    {
        $user = $this->userRepo->findById($id);

        return $user ? $this->format($user) : null;
    }

    /**
     * Buat user baru (oleh admin).
     */
    public function create(array $data): array
    {
        $id = $this->userRepo->create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
            'role'     => $data['role'] ?? 'USER',
            'status'   => $data['status'] ?? 'ACTIVE',
        ]);

        return $this->format($this->userRepo->findById($id));
    }

    /**
     * Hapus user.
     */
    public function delete(int $id, int $currentUserId): true|string
    {
        $user = $this->userRepo->findById($id);
        if (! $user) return 'User tidak ditemukan';

        if ($user->id === $currentUserId) {
            return 'Tidak bisa menghapus akun sendiri';
        }

        $this->userRepo->delete($id);
        return true;
    }

    /**
     * Update role user.
     */
    public function updateRole(int $id, string $role): ?array
    {
        $user = $this->userRepo->findById($id);
        if (! $user) return null;

        $this->userRepo->update($id, ['role' => $role]);

        return $this->format($this->userRepo->findById($id));
    }

    /**
     * Update status user.
     */
    public function updateStatus(int $id, string $status): ?array
    {
        $user = $this->userRepo->findById($id);
        if (! $user) return null;

        $this->userRepo->update($id, ['status' => $status]);

        return $this->format($this->userRepo->findById($id));
    }

    /**
     * Format user untuk response JSON (camelCase).
     */
    private function format(object $user): array
    {
        return [
            'id'        => $user->id,
            'name'      => $user->name,
            'email'     => $user->email,
            'phone'     => $user->phone,
            'birthDate' => $user->birth_date,
            'role'      => $user->role,
            'status'    => $user->status,
            'createdAt' => $user->created_at,
            'updatedAt' => $user->updated_at,
        ];
    }
}
