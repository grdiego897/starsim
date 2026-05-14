<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
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
