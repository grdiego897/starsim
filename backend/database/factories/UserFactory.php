<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Factoría del modelo User de Laravel (boilerplate).
 * Nota: la aplicación usa el modelo {@see \App\Models\Usuario};
 * esta factoría se mantiene para compatibilidad con el código base
 * de Laravel, pero los tests reales se apoyan en UsuarioFactory.
 *
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * Contraseña actual utilizada por la factoría.
     */
    protected static ?string $password;

    /**
     * Define el estado por defecto del modelo.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indica que la dirección de correo del modelo debe quedar sin verificar.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
