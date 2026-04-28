<?php

namespace Database\Seeders;

use App\Models\PuertoEspacial;
use Illuminate\Database\Seeder;

class PuertoEspacialSeeder extends Seeder
{
    public function run(): void
    {
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
