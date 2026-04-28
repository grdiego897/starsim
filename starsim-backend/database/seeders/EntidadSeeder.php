<?php

namespace Database\Seeders;

use App\Models\Entidad;
use Illuminate\Database\Seeder;

class EntidadSeeder extends Seeder
{
    public function run(): void
    {
        $entidades = [
            ['name' => 'SpaceX',             'slug' => 'spacex',             'description' => 'Space Exploration Technologies Corp.'],
            ['name' => 'NASA',               'slug' => 'nasa',               'description' => 'National Aeronautics and Space Administration'],
            ['name' => 'ESA',                'slug' => 'esa',                'description' => 'European Space Agency'],
            ['name' => 'Blue Origin',        'slug' => 'blue-origin',        'description' => 'Blue Origin LLC'],
            ['name' => 'Sateliot',           'slug' => 'sateliot',           'description' => 'Sateliot SA'],
            ['name' => 'Intuitive Machines', 'slug' => 'intuitive-machines', 'description' => 'Intuitive Machines Inc.'],
        ];

        foreach ($entidades as $e) {
            Entidad::updateOrCreate(['slug' => $e['slug']], $e);
        }
    }
}
