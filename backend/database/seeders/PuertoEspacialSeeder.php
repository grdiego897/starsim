<?php

namespace Database\Seeders;

use App\Models\PuertoEspacial;
use Illuminate\Database\Seeder;

/**
 * Seeder de puertos espaciales: catálogo cerrado de bases de lanzamiento
 * soportadas por la aplicación. Las coordenadas se usan en el frontend
 * para centrar el mapa embebido en cada misión.
 */
class PuertoEspacialSeeder extends Seeder
{
    public function run(): void
    {
        // Coordenadas reales de cada instalación; el slug es la clave estable
        // y coincide con el `value` de los <option> del selector en mision.html.
        $puertos = [
            ['slug' => 'starbase',   'name' => 'Starbase',                      'latitude' => 25.9973,  'longitude' => -97.1555,  'country' => 'USA'],
            ['slug' => 'cape',       'name' => 'Cape Canaveral',                'latitude' => 28.3922,  'longitude' => -80.6077,  'country' => 'USA'],
            ['slug' => 'vandenberg', 'name' => 'Vandenberg Space Force Base',   'latitude' => 34.7420,  'longitude' => -120.5724, 'country' => 'USA'],
            ['slug' => 'kourou',     'name' => 'Guiana Space Centre',           'latitude' => 5.2389,   'longitude' => -52.7686,  'country' => 'French Guiana'],
            ['slug' => 'azores',     'name' => 'Atlantic Spaceport Consortium', 'latitude' => 37.7412,  'longitude' => -25.6756,  'country' => 'Portugal'],
        ];

        foreach ($puertos as $p) {
            PuertoEspacial::updateOrCreate(['slug' => $p['slug']], $p);
        }
    }
}
