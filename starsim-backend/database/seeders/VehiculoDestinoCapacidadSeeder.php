<?php

namespace Database\Seeders;

use App\Models\Destino;
use App\Models\Vehiculo;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class VehiculoDestinoCapacidadSeeder extends Seeder
{
    public function run(): void
    {
        $capacidades = [
            'falcon9'     => ['leo' => 22.8, 'haven' => 22.8, 'axiom' => 22.8, 'orbital-reef' => 22.8],
            'falconheavy' => ['leo' => 63.8, 'haven' => 63.8, 'axiom' => 63.8, 'orbital-reef' => 63.8],
            'superheavy'  => [
                'leo'          => 150.0,
                'haven'        => 150.0,
                'axiom'        => 150.0,
                'orbital-reef' => 150.0,
                'gateway'      => 50.0,
                'luna'         => 50.0,
                'terminus'     => 150.0,
            ],
        ];

        foreach ($capacidades as $vehSlug => $destinos) {
            $vehiculo = Vehiculo::where('slug', $vehSlug)->first();
            if (! $vehiculo) {
                continue;
            }

            foreach ($destinos as $destSlug => $carga) {
                $destino = Destino::where('slug', $destSlug)->first();
                if (! $destino) {
                    continue;
                }

                DB::table('vehiculo_destino_capacidades')->updateOrInsert(
                    ['vehiculo_id' => $vehiculo->id, 'destino_id' => $destino->id],
                    ['carga_maxima_t' => $carga]
                );
            }
        }
    }
}
