<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected AuthService $authService
    ) {}

    /**
     * Login pengguna.
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email'    => 'required|email',
            'password' => 'required|string',
        ], [
            'email.required'    => 'Email wajib diisi',
            'email.email'       => 'Format email tidak valid',
            'password.required' => 'Password wajib diisi',
        ]);

        if ($validator->fails()) {
            return $this->validationError('Validasi gagal', $validator);
        }

        $result = $this->authService->login($request->email, $request->password);

        if (isset($result['error'])) {
            return response()->json([
                'message' => $result['error'],
                'errors'  => $result['errors'],
            ], $result['code']);
        }

        return $this->success(['accessToken' => $result['token']]);
    }

    /**
     * Registrasi pengguna baru.
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name'                  => 'required|string|max:255',
            'email'                 => 'required|email|unique:users,email',
            'password'              => 'required|string|min:6',
            'passwordConfirmation'  => 'required|same:password',
        ], [
            'name.required'                 => 'Nama wajib diisi',
            'email.required'                => 'Email wajib diisi',
            'email.email'                   => 'Format email tidak valid',
            'email.unique'                  => 'Email sudah terdaftar',
            'password.required'             => 'Password wajib diisi',
            'password.min'                  => 'Password minimal 6 karakter',
            'passwordConfirmation.required' => 'Konfirmasi password wajib diisi',
            'passwordConfirmation.same'     => 'Konfirmasi password tidak cocok',
        ]);

        if ($validator->fails()) {
            return $this->validationError('Validasi gagal', $validator);
        }

        $user = $this->authService->register($request->only(['name', 'email', 'password']));

        return $this->success($user, 'Registrasi berhasil', 201);
    }

    /**
     * Logout — hapus token saat ini.
     */
    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout();

        return $this->success(message: 'Berhasil logout');
    }

    /**
     * Ambil profil pengguna yang sedang login.
     */
    public function profile(Request $request): JsonResponse
    {
        $profile = $this->authService->getProfile($request->user()->id);

        return $this->success($profile);
    }
}
