<?php

namespace Database\Factories;

use App\Models\Usuario;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * Factoría de Usuario para tests y seeders.
 * Por defecto crea un usuario 'viewer' asociado a una entidad recién
 * generada. Los estados admin()/operator()/viewer() permiten cambiar
 * el rol en cadena al construir el usuario.
 */
class UsuarioFactory extends Factory
{
    protected $model = Usuario::class;

    public function definition(): array
    {
        return [
            'name'       => fake()->name(),
            'email'      => fake()->unique()->safeEmail(),
            // Contraseña fija conocida para autenticarnos cómodamente desde los tests.
            'password'   => Hash::make('password123'),
            // Rol más restrictivo por defecto: los tests piden explícitamente más permisos.
            'role'       => 'viewer',
            // Genera una entidad asociada al vuelo si no se especifica una existente.
            'entidad_id' => EntidadFactory::new(),
        ];
    }

    // Estado: usuario con permisos completos.
    public function admin(): static
    {
        return $this->state(fn () => ['role' => 'admin']);
    }

    // Estado: usuario con permisos de operación (crear/editar misiones).
    public function operator(): static
    {
        return $this->state(fn () => ['role' => 'operator']);
    }

    // Estado: usuario de sólo lectura.
    public function viewer(): static
    {
        return $this->state(fn () => ['role' => 'viewer']);
    }
}
