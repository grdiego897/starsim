<?php

namespace Database\Factories;

use App\Models\Entidad;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class EntidadFactory extends Factory
{
    protected $model = Entidad::class;

    public function definition(): array
    {
        $name = fake()->unique()->company();

        return [
            'name'        => $name,
            'slug'        => Str::slug($name) . '-' . Str::random(6),
            'logo_path'   => null,
            'description' => fake()->sentence(),
        ];
    }
}
