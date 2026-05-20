<?php

namespace Database\Seeders;

use App\Models\Entidad;
use Illuminate\Database\Seeder;

/**
 * Seeder de entidades: pobla el catálogo de agencias y empresas espaciales
 * usadas como propietarias de programas y referidas por los usuarios.
 * Idempotente: usa updateOrCreate por slug para poder re-ejecutarse sin duplicar.
 */
class EntidadSeeder extends Seeder
{
    public function run(): void
    {
        // Catálogo fijo de entidades soportadas por la aplicación.
        // El slug es la clave estable; el name y description pueden actualizarse.
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
            // updateOrCreate por slug: re-ejecutar el seeder no rompe nada
            // y permite refrescar nombres/descripciones sin recrear filas.
            Entidad::updateOrCreate(['slug' => $e['slug']], $e);
        }
    }
}
