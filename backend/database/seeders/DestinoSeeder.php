<?php

namespace Database\Seeders;

use App\Models\Destino;
use Illuminate\Database\Seeder;

class DestinoSeeder extends Seeder
{
    public function run(): void
    {
        $destinos = [
            ['slug' => 'leo',          'display_name' => 'LEO',          'image_path' => 'img/destination/ocisly.png'],
            ['slug' => 'haven',        'display_name' => 'Haven',        'image_path' => 'img/destination/haven.png'],
            ['slug' => 'axiom',        'display_name' => 'Axiom',        'image_path' => 'img/destination/axiom.png'],
            ['slug' => 'orbital-reef', 'display_name' => 'Orbital Reef', 'image_path' => 'img/destination/orbital-reef.png'],
            ['slug' => 'gateway',      'display_name' => 'Gateway',      'image_path' => 'img/destination/gateway.png'],
            ['slug' => 'luna',         'display_name' => 'Luna',         'image_path' => 'img/destination/luna.png'],
            ['slug' => 'terminus',     'display_name' => 'Terminus',     'image_path' => 'img/destination/terminus.png'],
        ];

        foreach ($destinos as $d) {
            Destino::updateOrCreate(['slug' => $d['slug']], $d);
        }
    }
}
