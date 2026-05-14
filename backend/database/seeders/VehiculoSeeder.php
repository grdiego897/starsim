<?php

namespace Database\Seeders;

use App\Models\Vehiculo;
use Illuminate\Database\Seeder;

class VehiculoSeeder extends Seeder
{
    public function run(): void
    {
        $vehiculos = [
            // Naves
            ['type' => 'ship',    'slug' => 'starship',       'display_name' => 'Starship',           'max_payload_leo_t' => null],
            ['type' => 'ship',    'slug' => 'dragon',         'display_name' => 'Dragon',             'max_payload_leo_t' => null],
            ['type' => 'ship',    'slug' => 'falcon-fairing', 'display_name' => 'Falcon Fairing',     'max_payload_leo_t' => null],
            // Boosters
            ['type' => 'booster', 'slug' => 'superheavy',     'display_name' => 'Super Heavy',        'max_payload_leo_t' => 150.00],
            ['type' => 'booster', 'slug' => 'falcon9',        'display_name' => 'Falcon 9',           'max_payload_leo_t' => 22.80],
            ['type' => 'booster', 'slug' => 'falconheavy',    'display_name' => 'Falcon Heavy',       'max_payload_leo_t' => 63.80],
        ];

        foreach ($vehiculos as $v) {
            Vehiculo::updateOrCreate(['slug' => $v['slug']], $v);
        }
    }
}
