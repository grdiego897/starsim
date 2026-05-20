<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Seeder raíz invocado por `php artisan db:seed`.
 * Orquesta el resto de seeders en el orden correcto para respetar
 * las dependencias entre tablas (catálogos antes que pivots/relaciones).
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Orden: primero entidades y usuarios (raíz del grafo de permisos),
        // luego catálogos independientes (puertos, vehículos, destinos),
        // luego datos dependientes (zonas atadas a puertos) y por último
        // el pivot vehículo↔destino con capacidades.
        $this->call([
            EntidadSeeder::class,
            UsuarioSeeder::class,
            PuertoEspacialSeeder::class,
            VehiculoSeeder::class,
            DestinoSeeder::class,
            ZonaAterrizajeSeeder::class,
            VehiculoDestinoCapacidadSeeder::class,
        ]);
    }
}
