<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ProfileService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected ProfileService $profileService
    ) {}

    /**
     * Ambil data profil pengguna yang sedang login.
     */
    public function show(Request $request): JsonResponse
    {
        $profile = $this->profileService->getProfile($request->user()->id);

        return $this->success($profile);
    }

    /**
     * Update profil pengguna.
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name'      => 'sometimes|required|string|max:255',
            'email'     => 'sometimes|required|email|unique:users,email,' . $user->id,
            'phone'     => 'nullable|string|max:20',
            'birthDate' => 'nullable|date',
        ], [
            'name.required'  => 'Nama wajib diisi',
            'email.required' => 'Email wajib diisi',
            'email.email'    => 'Format email tidak valid',
            'email.unique'   => 'Email sudah digunakan',
        ]);

        if ($validator->fails()) {
            return $this->validationError('Validasi gagal', $validator);
        }

        $profile = $this->profileService->updateProfile(
            $user->id,
            $request->only(['name', 'email', 'phone', 'birthDate'])
        );

        return $this->success($profile, 'Profil berhasil diperbarui');
    }

    /**
     * Ganti password pengguna.
     */
    public function changePassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'currentPassword'      => 'required|string',
            'newPassword'          => 'required|string|min:6',
            'passwordConfirmation' => 'required|same:newPassword',
        ], [
            'currentPassword.required'      => 'Password saat ini wajib diisi',
            'newPassword.required'          => 'Password baru wajib diisi',
            'newPassword.min'               => 'Password baru minimal 6 karakter',
            'passwordConfirmation.required' => 'Konfirmasi password wajib diisi',
            'passwordConfirmation.same'     => 'Konfirmasi password tidak cocok',
        ]);

        if ($validator->fails()) {
            return $this->validationError('Validasi gagal', $validator);
        }

        $result = $this->profileService->changePassword(
            $request->user()->id,
            $request->currentPassword,
            $request->newPassword
        );

        if ($result !== true) {
            return response()->json([
                'message' => $result,
                'errors'  => [['path' => ['currentPassword'], 'message' => $result]],
            ], 422);
        }

        return $this->success(message: 'Password berhasil diperbarui');
    }
}
