<?php

namespace Database\Factories;

use App\Models\ZonaAterrizaje;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ZonaAterrizajeFactory extends Factory
{
    protected $model = ZonaAterrizaje::class;

    public function definition(): array
    {
        $name = fake()->unique()->word();

        return [
            'slug'               => Str::slug($name) . '-' . Str::random(5),
            'name'               => ucfirst($name),
            'type'               => 'tower',
            'puerto_espacial_id' => PuertoEspacialFactory::new(),
        ];
    }

    public function tower(): static
    {
        return $this->state(fn () => ['type' => 'tower']);
    }

    public function droneship(): static
    {
        return $this->state(fn () => ['type' => 'droneship']);
    }
}
