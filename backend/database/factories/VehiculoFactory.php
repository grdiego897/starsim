<?php

namespace Database\Factories;

use App\Models\Vehiculo;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * Factoría de Vehiculo para tests y seeders.
 * Por defecto crea una nave ('ship'); los estados ship()/booster()
 * permiten alternar el tipo discriminador del modelo.
 */
class VehiculoFactory extends Factory
{
    protected $model = Vehiculo::class;

    public function definition(): array
    {
        $name = fake()->unique()->word();

        return [
            'type'              => 'ship',
            'slug'              => Str::slug($name) . '-' . Str::random(5),
            'display_name'      => ucfirst($name),
            // Capacidad de carga a LEO en toneladas dentro de un rango plausible.
            'max_payload_leo_t' => fake()->randomFloat(2, 5, 150),
        ];
    }

    // Estado: vehículo del tipo nave (transporte de carga útil).
    public function ship(): static
    {
        return $this->state(fn () => ['type' => 'ship']);
    }

    // Estado: vehículo del tipo booster (etapa de empuje).
    public function booster(): static
    {
        return $this->state(fn () => ['type' => 'booster']);
    }
}
