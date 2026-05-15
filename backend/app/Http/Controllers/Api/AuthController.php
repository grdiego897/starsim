<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Construir el payload de usuario que devuelven todas las rutas de auth.
     */
    private function userPayload(Usuario $user): array
    {
        return [
            'id'                  => $user->id,
            'name'                => $user->name,
            'email'               => $user->email,
            'role'                => $user->role,
            'entidad'             => $user->entidad ? [
                'id'   => $user->entidad->id,
                'name' => $user->entidad->name,
                'slug' => $user->entidad->slug,
            ] : null,
        ];
    }

    /**
     * Iniciar sesión y devolver token + datos de usuario.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = Usuario::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

        // Revocar tokens anteriores (una sesión activa a la vez)
        $user->tokens()->delete();

        // Crear nuevo token
        $token = $user->createToken('spa-token')->plainTextToken;

        // Cargar la entidad del usuario
        $user->load('entidad');

        return response()->json([
            'token' => $token,
            'user'  => $this->userPayload($user),
        ]);
    }

    /**
     * Cerrar sesión (revocar token actual).
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Sesión cerrada correctamente.']);
    }

    /**
     * Obtener datos del usuario autenticado.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->load('entidad');

        return response()->json([
            'user' => $this->userPayload($user),
        ]);
    }

    /**
     * Actualizar datos del usuario autenticado (perfil).
     */
    public function updateMe(Request $request): JsonResponse
    {
        $user = $request->user();
        $originalEmail = $user->email;

        $request->validate([
            'name'                  => 'sometimes|string|max:255',
            'email'                 => 'sometimes|email|max:255|unique:usuarios,email,' . $user->id,
            'password'              => 'sometimes|string|min:8|confirmed',
            'current_password'      => 'sometimes|string',
        ]);

        if ($request->filled('password')) {
            if (! $request->filled('current_password') || ! Hash::check($request->current_password, $user->password)) {
                throw ValidationException::withMessages([
                    'current_password' => ['La contraseña actual es incorrecta.'],
                ]);
            }
        }

        if ($request->has('name')) {
            $user->name = $request->name;
        }
        if ($request->has('email')) {
            $user->email = $request->email;
        }
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();
        $user->load('entidad');

        $responseData = [
            'message' => 'Perfil actualizado.',
            'user'    => $this->userPayload($user),
        ];

        if ($user->email !== $originalEmail) {
            $user->tokens()->delete();
            $responseData['token'] = $user->createToken('spa-token')->plainTextToken;
        }

        return response()->json($responseData);
    }
}
