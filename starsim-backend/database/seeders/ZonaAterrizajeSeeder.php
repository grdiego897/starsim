<?php

namespace Database\Seeders;

use App\Models\PuertoEspacial;
use App\Models\ZonaAterrizaje;
use Illuminate\Database\Seeder;

class ZonaAterrizajeSeeder extends Seeder
{
    public function run(): void
    {
        $starbase   = PuertoEspacial::where('slug', 'starbase')->first();
        $cape       = PuertoEspacial::where('slug', 'cape')->first();
        $vandenberg = PuertoEspacial::where('slug', 'vandenberg')->first();

        $zonas = [
            ['slug' => '1',          'name' => 'Genérico',           'type' => 'tower',     'puerto_espacial_id' => null],
            ['slug' => 'mechazilla', 'name' => 'Mechazilla',         'type' => 'tower',     'puerto_espacial_id' => $starbase?->id],
            ['slug' => 'ytml',       'name' => 'YTML',               'type' => 'tower',     'puerto_espacial_id' => $cape?->id],
            ['slug' => 'ocisly',     'name' => 'OCISLY',             'type' => 'droneship', 'puerto_espacial_id' => $cape?->id],
            ['slug' => 'jrti',       'name' => 'Just Read The Inst.','type' => 'droneship', 'puerto_espacial_id' => $vandenberg?->id],
            ['slug' => 'asog',       'name' => 'A Shortfall of G.S.','type' => 'droneship', 'puerto_espacial_id' => $cape?->id],
        ];

        foreach ($zonas as $z) {
            ZonaAterrizaje::updateOrCreate(['slug' => $z['slug']], $z);
        }
    }
}
