<?php

namespace Database\Factories;

use App\Models\Usuario;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

class UsuarioFactory extends Factory
{
    protected $model = Usuario::class;

    public function definition(): array
    {
        return [
            'name'       => fake()->name(),
            'email'      => fake()->unique()->safeEmail(),
            'password'   => Hash::make('password123'),
            'role'       => 'viewer',
            'entidad_id' => EntidadFactory::new(),
        ];
    }

    public function admin(): static
    {
        return $this->state(fn () => ['role' => 'admin']);
    }

    public function operator(): static
    {
        return $this->state(fn () => ['role' => 'operator']);
    }

    public function viewer(): static
    {
        return $this->state(fn () => ['role' => 'viewer']);
    }
}
