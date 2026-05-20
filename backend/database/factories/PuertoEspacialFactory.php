<?php

namespace Database\Factories;

use App\Models\PuertoEspacial;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * Factoría de PuertoEspacial para tests y seeders.
 * Inventa un puerto con coordenadas geográficas realistas usando Faker.
 */
class PuertoEspacialFactory extends Factory
{
    protected $model = PuertoEspacial::class;

    public function definition(): array
    {
        // El nombre se basa en una ciudad ficticia; sufijo random para slug único.
        $name = fake()->unique()->city();

        return [
            'slug'      => Str::slug($name) . '-' . Str::random(5),
            'name'      => $name,
            // Faker devuelve coordenadas con suficiente precisión para el cast decimal:7 del modelo.
            'latitude'  => fake()->latitude(),
            'longitude' => fake()->longitude(),
            'country'   => fake()->country(),
        ];
    }
}
