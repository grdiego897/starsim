<?php

namespace Database\Factories;

use App\Models\PuertoEspacial;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PuertoEspacialFactory extends Factory
{
    protected $model = PuertoEspacial::class;

    public function definition(): array
    {
        $name = fake()->unique()->city();

        return [
            'slug'      => Str::slug($name) . '-' . Str::random(5),
            'name'      => $name,
            'latitude'  => fake()->latitude(),
            'longitude' => fake()->longitude(),
            'country'   => fake()->country(),
        ];
    }
}
