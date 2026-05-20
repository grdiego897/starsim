<?php

namespace Database\Seeders;

use App\Models\Entidad;
use App\Models\Usuario;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Seeder de usuarios: crea las cuentas de prueba para los tres roles
 * (admin, operator, viewer) asociadas a entidades reales del seeder anterior.
 * Permite probar los flujos de permiso del frontend sin tocar la base.
 */
class UsuarioSeeder extends Seeder
{
    public function run(): void
    {
        // Recuperamos las entidades por slug. Si no existieran (porque se
        // ejecuta este seeder aislado), `?->id` deja entidad_id en null y
        // el modelo lo tolera por la FK nullable.
        $spacex = Entidad::where('slug', 'spacex')->first();
        $nasa   = Entidad::where('slug', 'nasa')->first();
        $esa    = Entidad::where('slug', 'esa')->first();

        // Credenciales de prueba — en producción reemplazar o eliminar este seeder.
        $usuarios = [
            [
                'name'       => 'Admin',
                'email'      => 'admin@starsim.io',
                'password'   => 'admin123',
                'role'       => 'admin',
                'entidad_id' => $spacex?->id,
            ],
            [
                'name'       => 'Operator SpaceX',
                'email'      => 'operator@starsim.io',
                'password'   => 'operator123',
                'role'       => 'operator',
                'entidad_id' => $spacex?->id,
            ],
            [
                'name'       => 'Operator NASA',
                'email'      => 'operator.nasa@starsim.io',
                'password'   => 'operator123',
                'role'       => 'operator',
                'entidad_id' => $nasa?->id,
            ],
            [
                'name'       => 'Operator ESA',
                'email'      => 'operator.esa@starsim.io',
                'password'   => 'operator123',
                'role'       => 'operator',
                'entidad_id' => $esa?->id,
            ],
            [
                'name'       => 'Viewer',
                'email'      => 'viewer@starsim.io',
                'password'   => 'viewer123',
                'role'       => 'viewer',
                'entidad_id' => $spacex?->id,
            ],
        ];

        foreach ($usuarios as $u) {
            // updateOrCreate por email: clave de login estable y única.
            // El password se hashea aquí porque updateOrCreate por array
            // sortea el cast 'hashed' del modelo en el segundo argumento.
            Usuario::updateOrCreate(
                ['email' => $u['email']],
                [
                    'name'       => $u['name'],
                    'password'   => Hash::make($u['password']),
                    'role'       => $u['role'],
                    'entidad_id' => $u['entidad_id'],
                ]
            );
        }
    }
}
