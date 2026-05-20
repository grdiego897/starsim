<?php

namespace Database\Seeders;

use App\Models\PuertoEspacial;
use App\Models\ZonaAterrizaje;
use Illuminate\Database\Seeder;

/**
 * Seeder de zonas de aterrizaje: torres terrestres y droneships marítimos.
 * Depende de PuertoEspacialSeeder para resolver los puertos por slug
 * antes de asignarlos como FK.
 */
class ZonaAterrizajeSeeder extends Seeder
{
    public function run(): void
    {
        // Resolvemos puertos relevantes una sola vez para enlazar cada zona.
        $starbase   = PuertoEspacial::where('slug', 'starbase')->first();
        $cape       = PuertoEspacial::where('slug', 'cape')->first();
        $vandenberg = PuertoEspacial::where('slug', 'vandenberg')->first();

        $zonas = [
            // Zona "Genérico" sin puerto: fallback usado cuando se desconoce la base.
            ['slug' => '1',          'name' => 'Genérico',           'type' => 'tower',     'puerto_espacial_id' => null],
            ['slug' => 'mechazilla', 'name' => 'Mechazilla',         'type' => 'tower',     'puerto_espacial_id' => $starbase?->id],
            ['slug' => 'ytml',       'name' => 'YTML',               'type' => 'tower',     'puerto_espacial_id' => $cape?->id],
            // Droneships: barcos autónomos de SpaceX para recuperación de Falcon 9 en el océano.
            ['slug' => 'ocisly',     'name' => 'OCISLY',             'type' => 'droneship', 'puerto_espacial_id' => $cape?->id],
            ['slug' => 'jrti',       'name' => 'Just Read The Inst.','type' => 'droneship', 'puerto_espacial_id' => $vandenberg?->id],
            ['slug' => 'asog',       'name' => 'A Shortfall of G.S.','type' => 'droneship', 'puerto_espacial_id' => $cape?->id],
        ];

        foreach ($zonas as $z) {
            ZonaAterrizaje::updateOrCreate(['slug' => $z['slug']], $z);
        }
    }
}
