<?php

namespace Database\Factories;

use App\Models\Destino;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class DestinoFactory extends Factory
{
    protected $model = Destino::class;

    public function definition(): array
    {
        $name = fake()->unique()->word();

        return [
            'slug'         => Str::slug($name) . '-' . Str::random(5),
            'display_name' => ucfirst($name),
            'image_path'   => null,
        ];
    }
}
