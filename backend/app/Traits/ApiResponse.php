<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

/**
 * Trait untuk standarisasi format response API.
 * Digunakan oleh semua controller agar format response konsisten.
 */
trait ApiResponse
{
    /**
     * Response sukses dengan data.
     */
    protected function success(mixed $data = null, ?string $message = null, int $code = 200): JsonResponse
    {
        $response = ['success' => true];

        if ($data !== null) {
            $response['data'] = $data;
        }

        if ($message) {
            $response['message'] = $message;
        }

        return response()->json($response, $code);
    }

    /**
     * Response sukses dengan paginasi.
     */
    protected function paginated(array $data, array $meta): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $data,
            'meta'    => $meta,
        ]);
    }

    /**
     * Response error umum.
     */
    protected function error(string $message, int $code = 400, array $errors = []): JsonResponse
    {
        $response = ['success' => false, 'message' => $message];

        if (! empty($errors)) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $code);
    }

    /**
     * Response error validasi — format Zod yang diharapkan frontend.
     * Format: [{ path: ["fieldName"], message: "..." }, ...]
     */
    protected function validationError(string $message, $validator): JsonResponse
    {
        $errors = [];

        foreach ($validator->errors()->toArray() as $field => $messages) {
            foreach ($messages as $msg) {
                $errors[] = [
                    'path'    => [$field],
                    'message' => $msg,
                ];
            }
        }

        return response()->json([
            'message' => $message,
            'errors'  => $errors,
        ], 422);
    }
}
