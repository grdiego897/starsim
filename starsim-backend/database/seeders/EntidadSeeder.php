<?php

namespace Database\Seeders;

use App\Models\Entidad;
use Illuminate\Database\Seeder;

class EntidadSeeder extends Seeder
{
    public function run(): void
    {
        $entidades = [
            ['name' => 'NASA',      'slug' => 'nasa',       'description' => 'National Aeronautics and Space Administration'],
            ['name' => 'ESA',       'slug' => 'esa',        'description' => 'European Space Agency'],
            ['name' => 'SpaceX',    'slug' => 'spacex',     'description' => 'Space Exploration Technologies Corp.'],
            ['name' => 'Axiom',     'slug' => 'axiom',      'description' => 'Axiom Space'],
            ['name' => 'Vast',      'slug' => 'vast',       'description' => 'Vast Space'],
            ['name' => 'Eutelsat',  'slug' => 'eutelsat',   'description' => 'Eutelsat Communications'],
            ['name' => 'JAXA',      'slug' => 'jaxa',       'description' => 'Japan Aerospace Exploration Agency'],
            ['name' => 'CSA',       'slug' => 'csa',        'description' => 'Canadian Space Agency'],
        ];

        foreach ($entidades as $e) {
            Entidad::updateOrCreate(['slug' => $e['slug']], $e);
        }
    }
}
