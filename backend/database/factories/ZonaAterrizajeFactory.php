<?php

namespace Database\Factories;

use App\Models\ZonaAterrizaje;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * Factoría de ZonaAterrizaje para tests y seeders.
 * Por defecto genera una torre de aterrizaje terrestre asociada a un
 * puerto espacial recién creado. tower()/droneship() alternan el tipo.
 */
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
            // Crea un puerto espacial asociado salvo que se proporcione uno existente.
            'puerto_espacial_id' => PuertoEspacialFactory::new(),
        ];
    }

    // Estado: torre de aterrizaje terrestre.
    public function tower(): static
    {
        return $this->state(fn () => ['type' => 'tower']);
    }

    // Estado: droneship (plataforma de aterrizaje marítima).
    public function droneship(): static
    {
        return $this->state(fn () => ['type' => 'droneship']);
    }
}
