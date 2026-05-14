<?php

namespace Database\Factories;

use App\Models\Vehiculo;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

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
            'max_payload_leo_t' => fake()->randomFloat(2, 5, 150),
        ];
    }

    public function ship(): static
    {
        return $this->state(fn () => ['type' => 'ship']);
    }

    public function booster(): static
    {
        return $this->state(fn () => ['type' => 'booster']);
    }
}
