<?php

namespace Database\Factories;

use App\Models\Destino;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * Factoría de Destino para tests y seeders.
 * Genera destinos con slug único; en tests no nos importa que el slug
 * sea legible, así que se concatena un sufijo aleatorio para evitar
 * colisiones por unicidad.
 */
class DestinoFactory extends Factory
{
    protected $model = Destino::class;

    public function definition(): array
    {
        // Base del nombre — la unicidad real se garantiza con el sufijo random del slug.
        $name = fake()->unique()->word();

        return [
            'slug'         => Str::slug($name) . '-' . Str::random(5),
            'display_name' => ucfirst($name),
            'image_path'   => null,
        ];
    }
}
