<?php

namespace Database\Seeders;

use App\Models\Entidad;
use App\Models\Usuario;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsuarioSeeder extends Seeder
{
    public function run(): void
    {
        $spacex = Entidad::where('slug', 'spacex')->first();
        $nasa   = Entidad::where('slug', 'nasa')->first();
        $esa    = Entidad::where('slug', 'esa')->first();

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
