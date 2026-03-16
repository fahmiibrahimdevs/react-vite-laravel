<?php

namespace App\Services;

use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Hash;

/**
 * Service layer untuk logika bisnis profil pengguna.
 */
class ProfileService
{
    public function __construct(
        protected UserRepository $userRepo
    ) {}

    /**
     * Ambil data profil user.
     */
    public function getProfile(int $userId): array
    {
        $user = $this->userRepo->findById($userId);

        return $this->formatProfile($user);
    }

    /**
     * Update profil user.
     */
    public function updateProfile(int $userId, array $data): array
    {
        $updateData = [];

        if (isset($data['name']))      $updateData['name']       = $data['name'];
        if (isset($data['email']))     $updateData['email']      = $data['email'];
        if (array_key_exists('phone', $data))     $updateData['phone']      = $data['phone'];
        if (array_key_exists('birthDate', $data)) $updateData['birth_date'] = $data['birthDate'];

        if (! empty($updateData)) {
            $this->userRepo->update($userId, $updateData);
        }

        return $this->getProfile($userId);
    }

    /**
     * Ganti password user.
     *
     * @return true|string — true jika berhasil, string error jika gagal
     */
    public function changePassword(int $userId, string $currentPassword, string $newPassword): true|string
    {
        $user = $this->userRepo->findById($userId);

        if (! Hash::check($currentPassword, $user->password)) {
            return 'Password saat ini salah';
        }

        $this->userRepo->update($userId, [
            'password' => Hash::make($newPassword),
        ]);

        return true;
    }

    /**
     * Format profil untuk response JSON.
     */
    private function formatProfile(object $user): array
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
