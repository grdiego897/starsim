<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class UsuarioController extends Controller
{
    // ──────────────────────────────────────────────────────────────────────
    //  Gestión de usuarios (sólo admin)
    // ──────────────────────────────────────────────────────────────────────

    /** Lista todos los usuarios con su entidad. */
    public function index(): JsonResponse
    {
        $usuarios = Usuario::with('entidad')
            ->orderBy('name')
            ->get()
            ->map(fn (Usuario $u) => $this->formatUsuario($u));

        return response()->json(['usuarios' => $usuarios]);
    }

    /** Crea un nuevo usuario. */
    public function store(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'name'           => 'required|string|min:1|max:255',
                'email'          => 'required|email|max:255|unique:usuarios,email',
                'password'       => 'required|string|min:8',
                'role'           => 'required|in:admin,operator,viewer',
                'entidad_id'     => 'nullable|integer|exists:entidades,id',
                'admin_password' => 'required|string',
            ]);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Datos inválidos.', 'errors' => $e->errors()], 422);
        }

        if (! Hash::check($data['admin_password'], $request->user()->password)) {
            throw ValidationException::withMessages([
                'admin_password' => ['La contraseña del administrador es incorrecta.'],
            ]);
        }
        unset($data['admin_password']);

        // El cast 'password' => 'hashed' del modelo se encarga del hashing.
        $usuario = Usuario::create($data);
        $usuario->load('entidad');

        return response()->json([
            'message' => 'Usuario creado correctamente.',
            'usuario' => $this->formatUsuario($usuario),
        ], 201);
    }

    /** Edita un usuario existente (admin). */
    public function update(int $id, Request $request): JsonResponse
    {
        $usuario = Usuario::find($id);

        if (! $usuario) {
            return response()->json(['message' => 'Usuario no encontrado.'], 404);
        }

        try {
            $data = $request->validate([
                'name'             => 'sometimes|string|min:1|max:255',
                'email'            => ['sometimes', 'email', 'max:255', Rule::unique('usuarios', 'email')->ignore($usuario->id)],
                'role'             => 'sometimes|in:admin,operator,viewer',
                'entidad_id'       => 'nullable|integer|exists:entidades,id',
                'password'         => 'sometimes|nullable|string|min:8',
                'admin_password'   => 'required|string',
            ]);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Datos inválidos.', 'errors' => $e->errors()], 422);
        }

        // Verificar la contraseña del admin que realiza la operación.
        if (! Hash::check($data['admin_password'], $request->user()->password)) {
            throw ValidationException::withMessages([
                'admin_password' => ['La contraseña del administrador es incorrecta.'],
            ]);
        }
        unset($data['admin_password']);

        // Si llega password vacía o no llega, no la tocamos.
        if (empty($data['password'] ?? null)) {
            unset($data['password']);
        }

        // entidad_id puede llegar como null explícito (desasignar entidad).
        $usuario->fill($data);
        $usuario->save();
        $usuario->load('entidad');

        return response()->json([
            'message' => 'Usuario actualizado correctamente.',
            'usuario' => $this->formatUsuario($usuario),
        ]);
    }

    /** Elimina un usuario. Permite auto-eliminación. */
    public function destroy(int $id, Request $request): JsonResponse
    {
        $usuario = Usuario::find($id);

        if (! $usuario) {
            return response()->json(['message' => 'Usuario no encontrado.'], 404);
        }

        $selfDeleted = ($usuario->id === $request->user()->id);

        // Revocar todos los tokens del usuario antes de eliminarlo.
        $usuario->tokens()->delete();
        $usuario->delete();

        return response()->json([
            'message'      => 'Usuario eliminado correctamente.',
            'self_deleted' => $selfDeleted,
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────
    //  Perfil propio (cualquier usuario autenticado)
    // ──────────────────────────────────────────────────────────────────────

    /**
     * El usuario autenticado actualiza su propio perfil:
     * name, email y/o password. Para cambiar email o password se exige
     * la contraseña actual. Si cambia el email, se rotan los tokens y
     * se devuelve uno nuevo para no expulsar al usuario.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        try {
            $data = $request->validate([
                'name'             => 'sometimes|string|min:1|max:255',
                'email'            => ['sometimes', 'email', 'max:255', Rule::unique('usuarios', 'email')->ignore($user->id)],
                'current_password' => 'nullable|string',
                'password'         => 'sometimes|nullable|string|min:8|confirmed',
            ]);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Datos inválidos.', 'errors' => $e->errors()], 422);
        }

        $cambiaEmail    = isset($data['email']) && $data['email'] !== $user->email;
        $cambiaPassword = ! empty($data['password'] ?? null);

        // Verificación de contraseña actual cuando se modifica email o contraseña.
        if ($cambiaEmail || $cambiaPassword) {
            if (empty($data['current_password']) || ! Hash::check($data['current_password'], $user->password)) {
                throw ValidationException::withMessages([
                    'current_password' => ['La contraseña actual es incorrecta.'],
                ]);
            }
        }

        if (isset($data['name']))  $user->name  = $data['name'];
        if ($cambiaEmail)          $user->email = $data['email'];
        if ($cambiaPassword)       $user->password = $data['password']; // hash automático por cast

        $user->save();
        $user->load('entidad');

        $response = [
            'message' => 'Perfil actualizado correctamente.',
            'user'    => $this->formatUsuario($user),
        ];

        // Si cambió el email, rotamos los tokens y emitimos uno nuevo.
        if ($cambiaEmail) {
            $user->tokens()->delete();
            $response['token'] = $user->createToken('spa-token')->plainTextToken;
        }

        return response()->json($response);
    }

    // ──────────────────────────────────────────────────────────────────────
    //  Helpers
    // ──────────────────────────────────────────────────────────────────────

    /** Da forma uniforme al payload de un usuario. */
    private function formatUsuario(Usuario $u): array
    {
        return [
            'id'      => $u->id,
            'name'    => $u->name,
            'email'   => $u->email,
            'role'    => $u->role,
            'entidad' => $u->entidad ? [
                'id'   => $u->entidad->id,
                'name' => $u->entidad->name,
                'slug' => $u->entidad->slug,
            ] : null,
        ];
    }
}
