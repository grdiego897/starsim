<?php

namespace Database\Factories;

use App\Models\Entidad;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * Factoría de Entidad para tests y seeders.
 * Usa un nombre de empresa de Faker y deriva el slug con un sufijo
 * aleatorio para evitar colisiones de unicidad.
 */
class EntidadFactory extends Factory
{
    protected $model = Entidad::class;

    public function definition(): array
    {
        // Nombre de empresa ficticio (SpaceX-like).
        $name = fake()->unique()->company();

        return [
            'name'        => $name,
            'slug'        => Str::slug($name) . '-' . Str::random(6),
            'logo_path'   => null,
            'description' => fake()->sentence(),
        ];
    }
}
