<?php

namespace Database\Seeders;

use App\Models\Destino;
use App\Models\Vehiculo;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Seeder del pivot `vehiculo_destino_capacidades`.
 * Refleja la matriz "qué booster puede llevar cuánto a qué destino".
 * Las cifras coinciden con la constante CAPACITIES de frontend/js/mision.js
 * para mantener consistencia entre cálculo en cliente y validación en servidor.
 *
 * Depende de VehiculoSeeder y DestinoSeeder.
 */
class VehiculoDestinoCapacidadSeeder extends Seeder
{
    public function run(): void
    {
        // Matriz vehicle slug → destino slug → carga máxima (toneladas).
        // Si una pareja no aparece aquí, ese vehículo no puede ir a ese destino.
        $capacidades = [
            'falcon9'     => ['leo' => 22.8, 'haven' => 22.8, 'axiom' => 22.8, 'orbital-reef' => 22.8],
            'falconheavy' => ['leo' => 63.8, 'haven' => 63.8, 'axiom' => 63.8, 'orbital-reef' => 63.8],
            // Super Heavy alcanza destinos lunares con menos carga útil por el delta-v extra.
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
            // Si el vehículo no está sembrado, saltamos en silencio en lugar de fallar:
            // permite ejecutar este seeder de forma aislada sin tirar todo abajo.
            if (! $vehiculo) {
                continue;
            }

            foreach ($destinos as $destSlug => $carga) {
                $destino = Destino::where('slug', $destSlug)->first();
                if (! $destino) {
                    continue;
                }

                // Acceso directo vía DB porque el pivot no tiene modelo Eloquent propio;
                // updateOrInsert mantiene la idempotencia al re-ejecutar el seeder.
                DB::table('vehiculo_destino_capacidades')->updateOrInsert(
                    ['vehiculo_id' => $vehiculo->id, 'destino_id' => $destino->id],
                    ['carga_maxima_t' => $carga]
                );
            }
        }
    }
}
