<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

/**
 * Service layer untuk logika bisnis autentikasi.
 */
class AuthService
{
    public function __construct(
        protected UserRepository $userRepo
    ) {}

    /**
     * Proses login. Mengembalikan token atau null jika gagal.
     *
     * @return array{token: string, user: object}|array{error: string, code: int}
     */
    public function login(string $email, string $password): array
    {
        $user = $this->userRepo->findByEmail($email);

        if (! $user || ! Hash::check($password, $user->password)) {
            return [
                'error'  => 'Email atau password salah',
                'code'   => 401,
                'errors' => [['path' => ['email'], 'message' => 'Email atau password salah']],
            ];
        }

        if ($user->status === 'INACTIVE') {
            return [
                'error'  => 'Akun Anda dinonaktifkan. Hubungi administrator.',
                'code'   => 403,
                'errors' => [['path' => ['email'], 'message' => 'Akun dinonaktifkan']],
            ];
        }

        // Generate JWT token
        $eloquentUser = User::find($user->id);
        $token = JWTAuth::fromUser($eloquentUser);

        return ['token' => $token, 'user' => $user];
    }

    /**
     * Registrasi user baru.
     */
    public function register(array $data): object
    {
        $id = $this->userRepo->create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
            'role'     => 'USER',
            'status'   => 'ACTIVE',
        ]);

        return $this->userRepo->findById($id);
    }

    /**
     * Logout — invalidasi JWT token saat ini.
     */
    public function logout(): void
    {
        JWTAuth::invalidate(JWTAuth::getToken());
    }

    /**
     * Ambil profil user (format camelCase).
     */
    public function getProfile(int $userId): array
    {
        $user = $this->userRepo->findById($userId);

        return $this->formatProfile($user);
    }

    /**
     * Format data profil untuk response.
     */
    public function formatProfile(object $user): array
    {
        return [
            'id'        => $user->id,
            'name'      => $user->name,
            'email'     => $user->email,
            'phone'     => $user->phone,
            'birthDate' => $user->birth_date,
            'role'      => $user->role,
            'status'    => $user->status,
        ];
    }
}
