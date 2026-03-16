<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\UserService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected UserService $userService
    ) {}

    /**
     * Daftar semua pengguna (admin only, paginated + filter).
     */
    public function index(Request $request): JsonResponse
    {
        $result = $this->userService->list(
            (int) $request->input('page', 1),
            (int) $request->input('limit', 10),
            (string) $request->input('role', ''),
            (string) $request->input('status', '')
        );

        return $this->paginated($result['data'], $result['meta']);
    }

    /**
     * Buat pengguna baru (oleh admin).
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role'     => 'sometimes|in:USER,MODERATOR,ADMIN',
            'status'   => 'sometimes|in:ACTIVE,INACTIVE',
        ], [
            'name.required'     => 'Nama wajib diisi',
            'email.required'    => 'Email wajib diisi',
            'email.email'       => 'Format email tidak valid',
            'email.unique'      => 'Email sudah terdaftar',
            'password.required' => 'Password wajib diisi',
            'password.min'      => 'Password minimal 6 karakter',
            'role.in'           => 'Role tidak valid',
            'status.in'         => 'Status tidak valid',
        ]);

        if ($validator->fails()) {
            return $this->validationError('Validasi gagal', $validator);
        }

        $user = $this->userService->create(
            $request->only(['name', 'email', 'password', 'role', 'status'])
        );

        return $this->success($user, 'User berhasil dibuat', 201);
    }

    /**
     * Tampilkan detail satu pengguna.
     */
    public function show(int $id): JsonResponse
    {
        $user = $this->userService->show($id);

        if (! $user) {
            return $this->error('User tidak ditemukan', 404);
        }

        return $this->success($user);
    }

    /**
     * Hapus pengguna.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $result = $this->userService->delete($id, $request->user()->id);

        if ($result !== true) {
            $code = $result === 'Tidak bisa menghapus akun sendiri' ? 403 : 404;
            return $this->error($result, $code);
        }

        return $this->success(message: 'User berhasil dihapus');
    }

    /**
     * Update role pengguna.
     */
    public function updateRole(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'role' => 'required|in:USER,MODERATOR,ADMIN',
        ], [
            'role.required' => 'Role wajib diisi',
            'role.in'       => 'Role tidak valid',
        ]);

        if ($validator->fails()) {
            return $this->validationError('Validasi gagal', $validator);
        }

        $user = $this->userService->updateRole($id, $request->role);

        if (! $user) {
            return $this->error('User tidak ditemukan', 404);
        }

        return $this->success($user, 'Role berhasil diperbarui');
    }

    /**
     * Update status pengguna.
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:ACTIVE,INACTIVE',
        ], [
            'status.required' => 'Status wajib diisi',
            'status.in'       => 'Status tidak valid',
        ]);

        if ($validator->fails()) {
            return $this->validationError('Validasi gagal', $validator);
        }

        $user = $this->userService->updateStatus($id, $request->status);

        if (! $user) {
            return $this->error('User tidak ditemukan', 404);
        }

        return $this->success($user, 'Status berhasil diperbarui');
    }
}
